#!/usr/bin/env python3
"""make_voice.py - pre-render Arabic narration audio for the T.O X guided demo (build time only; the app never calls a TTS service).

  python3 make_voice.py --demo-dir <dir with demo_ch*.js> --out <site>/media/voice            # render what is new/changed
  python3 make_voice.py ... --samples                                                          # sample set + samples.html
  python3 make_voice.py ... --check                                                            # objective checks on rendered files
  python3 make_voice.py ... --report-latin                                                     # Latin words not in the lexicon
  options: --voices f=edge:ar-EG-SalmaNeural,m=edge:ar-EG-ShakirNeural  --fmt mp3|webm  --prune  --dry-run  --only-voice f

Files are keyed by a hash of the ORIGINAL Arabic caption text (same hash function as demo_voice.js: cyrb53 of the NFC text), so the
player finds audio from the caption alone and only changed lines are regenerated. A per-file signature (spoken text + voice + settings)
also re-renders a line when the lexicon or the voice changes. Keys are read from the environment only and never written anywhere:
GEMINI_API_KEY (provider gemini), GOOGLE_TTS_KEY (provider google), AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (provider azure, official). Default provider edge (edge-tts, no key)."""
import argparse, asyncio, ssl, base64, hashlib, html, json, os, re, subprocess, sys, tempfile, time, unicodedata, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_VOICES = {'f': ('edge', 'ar-EG-SalmaNeural'), 'm': ('edge', 'ar-EG-ShakirNeural')}
SETTINGS = {'lufs': -16, 'bitrate': {'mp3': '32k', 'webm': '24k'}, 'sr': 24000}

# ---------------------------------------------------------------- hash (must equal cyrb53 in demo_voice.js)
def _imul(a, b): return (a * b) & 0xFFFFFFFF
def cyrb53(s, seed=0):
    u = s.encode('utf-16-le'); units = [u[i] | (u[i + 1] << 8) for i in range(0, len(u), 2)]      # JS charCodeAt units
    h1 = 0xdeadbeef ^ seed; h2 = 0x41c6ce57 ^ seed
    for ch in units:
        h1 = _imul(h1 ^ ch, 2654435761); h2 = _imul(h2 ^ ch, 1597334677)
    h1 = _imul(h1 ^ (h1 >> 16), 2246822507) ^ _imul(h2 ^ (h2 >> 13), 3266489909)
    h2 = _imul(h2 ^ (h2 >> 16), 2246822507) ^ _imul(h1 ^ (h1 >> 13), 3266489909)
    return format(((2097151 & h2) << 32) + (h1 & 0xFFFFFFFF), 'x')   # = (4294967296*(2097151&h2)+(h1>>>0)).toString(16) in JS
def caption_hash(ar): return cyrb53(unicodedata.normalize('NFC', ar).strip())

# ---------------------------------------------------------------- text cleaning for speech
_ONES = ['', 'واحد', 'اتنين', 'تلاتة', 'اربعة', 'خمسة', 'ستة', 'سبعة', 'تمانية', 'تسعة', 'عشرة', 'احداشر', 'اتناشر', 'تلتاشر', 'اربعتاشر', 'خمستاشر', 'ستاشر', 'سبعتاشر', 'تمنتاشر', 'تسعتاشر']
_TENS = ['', '', 'عشرين', 'تلاتين', 'اربعين', 'خمسين', 'ستين', 'سبعين', 'تمانين', 'تسعين']
_HUND = ['', 'مية', 'ميتين', 'تلتمية', 'ربعمية', 'خمسمية', 'ستمية', 'سبعمية', 'تمنمية', 'تسعمية']
def num_words(n):
    if n == 0: return 'صفر'
    parts = []
    if n >= 1000:
        t, n = divmod(n, 1000)
        parts.append('الف' if t == 1 else 'الفين' if t == 2 else (num_words(t) + (' الاف' if t <= 10 else ' الف')))
    if n:
        h, r = divmod(n, 100)
        if h: parts.append(_HUND[h])
        if r:
            if r < 20: parts.append(_ONES[r])
            else:
                o, t = r % 10, r // 10
                parts.append((_ONES[o] + ' و' if o else '') + _TENS[t])
    return ' و'.join(parts)
_AR_DIG = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')

def load_lexicon(path=None):
    path = path or os.path.join(HERE, 'voice_lexicon.json')
    lex = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    return {k: v for k, v in lex.items() if not k.startswith('_')}

def clean_for_speech(text, lex):
    t = unicodedata.normalize('NFC', text).translate(_AR_DIG)
    for k in sorted(lex, key=len, reverse=True):                       # longest first, whole-word for Latin keys
        if re.match(r'^[A-Za-z0-9]', k): pat = r'(?<![A-Za-z0-9])' + re.escape(k) + r'(?![A-Za-z0-9])'
        else: pat = re.escape(k)
        t = re.sub(pat, lambda m, v=lex[k]: ' ' + v + ' ', t, flags=re.I if re.search('[A-Za-z]', k) else 0)
    t = re.sub(r'(\d+)[.,](\d+)', lambda m: num_words(int(m.group(1))) + ' فاصل ' + ' '.join(num_words(int(c)) for c in m.group(2)), t)
    t = re.sub(r'\d+', lambda m: num_words(int(m.group(0))) if len(m.group(0)) < 7 else m.group(0), t)
    t = re.sub(r'\s*[\u2014\u2013]\s*', '، ', t)                        # dashes -> pause
    t = re.sub(r'[*_`#<>|~^]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return re.sub(r'\s+([.،,:;!؟?])', r'\1', t)

def latin_left(spoken): return sorted(set(re.findall(r'[A-Za-z][A-Za-z0-9.+\-/]*', spoken)))

# ---------------------------------------------------------------- providers: render(text, voice) -> audio bytes
class Provider:
    name = ''
    input_args = []                       # extra ffmpeg input args for raw formats
    def render(self, text, voice): raise NotImplementedError

class EdgeTTS(Provider):
    """edge-tts: unofficial Python client for Microsoft Edge 'Read Aloud' neural voices. No key. See the note for terms/licence concerns."""
    name = 'edge'
    def render(self, text, voice):
        import edge_tts
        async def go():
            buf = b''
            async for c in edge_tts.Communicate(text, voice).stream():
                if c['type'] == 'audio': buf += c['data']
            return buf
        for i in range(4):
            try:
                b = asyncio.run(go())
                if b: return b
            except Exception as e:
                err = e
            time.sleep(2 + 3 * i)
        raise RuntimeError('edge-tts failed: %s' % err)

def _post_json(url, headers, body, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=dict(headers, **{'Content-Type': 'application/json'}))
    try:
        import certifi; ctx = ssl.create_default_context(cafile=certifi.where())      # python.org builds ship without CA certs
    except ImportError:
        ctx = None
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r: return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError('HTTP %s from %s: %s' % (e.code, url.split('?')[0], e.read()[:300].decode('utf8', 'replace')))

class GeminiTTS(Provider):
    """Gemini TTS (generativelanguage API). Needs the owner's key in GEMINI_API_KEY. UNTESTED here (no key available to the build session)."""
    name = 'gemini'; input_args = ['-f', 's16le', '-ar', '24000', '-ac', '1']
    model = os.environ.get('GEMINI_TTS_MODEL', 'gemini-2.5-flash-preview-tts')
    def render(self, text, voice):
        key = os.environ.get('GEMINI_API_KEY')
        if not key: raise RuntimeError('GEMINI_API_KEY not set')
        body = {'contents': [{'parts': [{'text': 'اقرأ بصوت واضح ودافي وبسرعة هادية، بلهجة مصرية طبيعية: ' + text}]}],
                'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}
        for i in range(4):
            try: j = _post_json('https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent' % self.model, {'x-goog-api-key': key}, body); break
            except (RuntimeError, urllib.error.URLError, TimeoutError) as e:
                if 'HTTP 4' in str(e) and 'HTTP 429' not in str(e) or i == 3: raise      # retry 429 / 5xx / network blips
                time.sleep(15 * (i + 1))                                  # free-tier rate limit: back off and retry
        return base64.b64decode(j['candidates'][0]['content']['parts'][0]['inlineData']['data'])

class GoogleCloudTTS(Provider):
    """Google Cloud Text-to-Speech REST. Needs GOOGLE_TTS_KEY. Arabic there is 'ar-XA' (pan-Arabic, no ar-EG voice). UNTESTED here (no key)."""
    name = 'google'
    def render(self, text, voice):
        key = os.environ.get('GOOGLE_TTS_KEY')
        if not key: raise RuntimeError('GOOGLE_TTS_KEY not set')
        body = {'input': {'text': text}, 'voice': {'languageCode': 'ar-XA', 'name': voice}, 'audioConfig': {'audioEncoding': 'MP3', 'sampleRateHertz': 24000}}
        return base64.b64decode(_post_json('https://texttospeech.googleapis.com/v1/text:synthesize', {'X-Goog-Api-Key': key}, body)['audioContent'])

class AzureSpeech(Provider):
    """Azure AI Speech (OFFICIAL, licensed API; same neural voices as edge: ar-EG-SalmaNeural / ar-EG-ShakirNeural). Needs AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (free tier ~0.5M chars/month).
    UNTESTED here (no key). Use: --voices f=azure:ar-EG-SalmaNeural,m=azure:ar-EG-ShakirNeural"""
    name = 'azure'
    def render(self, text, voice):
        key, reg = os.environ.get('AZURE_SPEECH_KEY'), os.environ.get('AZURE_SPEECH_REGION')
        if not key or not reg: raise RuntimeError('AZURE_SPEECH_KEY / AZURE_SPEECH_REGION not set')
        ssml = '<speak version="1.0" xml:lang="ar-EG" xmlns="http://www.w3.org/2001/10/synthesis"><voice name="%s">%s</voice></speak>' % (voice, html.escape(text))
        req = urllib.request.Request('https://%s.tts.speech.microsoft.com/cognitiveservices/v1' % reg, data=ssml.encode(), headers={'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'toxvoice'})
        try:
            import certifi; ctx = ssl.create_default_context(cafile=certifi.where())
        except ImportError:
            ctx = None
        try:
            with urllib.request.urlopen(req, timeout=120, context=ctx) as r: return r.read()
        except urllib.error.HTTPError as e:
            raise RuntimeError('HTTP %s from azure tts: %s' % (e.code, e.read()[:200].decode('utf8', 'replace')))

PROVIDERS = {'azure': AzureSpeech, 'edge': EdgeTTS, 'gemini': GeminiTTS, 'google': GoogleCloudTTS}

# ---------------------------------------------------------------- audio post-processing + analysis (ffmpeg)
def _ff(args, data=None):
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-y'] + args, input=data, capture_output=True)

def encode(raw, provider, fmt):
    """trim leading/trailing silence, loudness-normalise to -16 LUFS, mono 24 kHz, small file. Returns bytes."""
    af = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
          'loudnorm=I=%d:TP=-1.5:LRA=11,apad=pad_dur=0.12' % SETTINGS['lufs'])
    codec = ['-c:a', 'libmp3lame', '-b:a', SETTINGS['bitrate']['mp3'], '-f', 'mp3'] if fmt == 'mp3' else ['-c:a', 'libopus', '-b:a', SETTINGS['bitrate']['webm'], '-application', 'voip', '-f', 'webm']
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, 'in.bin'); open(src, 'wb').write(raw)
        out = os.path.join(d, 'out.' + fmt)
        r = _ff(provider.input_args + ['-i', src, '-af', af, '-ac', '1', '-ar', str(SETTINGS['sr'])] + codec + [out])
        if r.returncode: raise RuntimeError('ffmpeg: ' + r.stderr[-400:].decode('utf8', 'replace'))
        return open(out, 'rb').read()

def analyze(path):
    """duration, integrated loudness, silent gaps (> 0.7 s at -40 dB) inside the clip."""
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip() or 0)
    r = _ff(['-i', path, '-af', 'silencedetect=n=-40dB:d=0.7,ebur128=peak=true', '-f', 'null', '-'])
    err = r.stderr.decode('utf8', 'replace')
    lufs = re.findall(r'\n\s*I:\s+(-?[\d.]+) LUFS', err)
    gaps = [float(x) for x in re.findall(r'silence_duration: ([\d.]+)', err)]
    return {'dur': round(d, 2), 'lufs': float(lufs[-1]) if lufs else None, 'gaps': gaps, 'maxgap': max(gaps) if gaps else 0}

# ---------------------------------------------------------------- captions
def extract(demo_dir):
    r = subprocess.run(['node', os.path.join(HERE, 'extract_captions.js'), demo_dir], capture_output=True, text=True)
    if r.returncode: sys.exit('caption extraction failed: ' + r.stderr)
    seen, items = set(), []
    for c in json.loads(r.stdout):
        t = unicodedata.normalize('NFC', c['ar']).strip()
        h = caption_hash(t)
        if h not in seen: seen.add(h); items.append({'hash': h, 'text': t, 'ch': c['ch'], 'op': c['op']})
    return items

def parse_voices(spec):
    if not spec: return dict(DEFAULT_VOICES)
    out = {}
    for p in spec.split(','):
        k, v = p.split('=', 1); prov, name = v.split(':', 1); out[k.strip()] = (prov.strip(), name.strip())
    return out

def sig(spoken, prov, voice, fmt): return hashlib.sha1(json.dumps([spoken, prov, voice, fmt, SETTINGS, GeminiTTS.model if prov == 'gemini' else ''], sort_keys=True).encode()).hexdigest()[:12]

# ---------------------------------------------------------------- commands
def cmd_render(a):
    lex = load_lexicon(a.lexicon); items = extract(a.demo_dir); voices = parse_voices(a.voices)
    if a.only_voice: voices = {k: v for k, v in voices.items() if k == a.only_voice}
    os.makedirs(os.path.join(a.out, 'ar'), exist_ok=True)
    mp = os.path.join(a.out, 'manifest.json')
    man = json.load(open(mp, encoding='utf-8')) if os.path.exists(mp) else {}
    man.setdefault('version', 1); man['lang'] = 'ar'; man['fmt'] = a.fmt; man.setdefault('items', {}); man.setdefault('voices', {})
    for k, (prov, name) in voices.items(): man['voices'][k] = {'provider': prov, 'voice': name, **({'model': GeminiTTS.model} if prov == 'gemini' else {})}
    def save():
        man['updated'] = time.strftime('%Y-%m-%d'); json.dump(man, open(mp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
        slim = {'version': 1, 'lang': 'ar', 'fmt': man['fmt'], 'voices': man['voices'], 'items': {h: {'v': {k: {x: v[x] for x in ('file', 'ms', 'sig')} for k, v in e['v'].items()}} for h, e in man['items'].items()}}
        open(os.path.join(a.out, 'manifest.js'), 'w', encoding='utf-8').write('window.TOXVoiceManifest=' + json.dumps(slim, separators=(',', ':')) + ';')   # what the player loads (works from file:// too)
    todo = 0; done = 0; failed = []
    for it in items:
        spoken = clean_for_speech(it['text'], lex)
        e = man['items'].setdefault(it['hash'], {'v': {}}); e.update(text=it['text'], spoken=spoken, ch=it['ch'])
        for k, (prov, name) in voices.items():
            s = sig(spoken, prov, name, a.fmt); fn = 'ar/%s.%s.%s' % (it['hash'], k, a.fmt); fp = os.path.join(a.out, fn)
            cur = e['v'].get(k)
            if cur and cur.get('sig') == s and os.path.exists(fp): continue
            todo += 1
            if a.dry_run: print('would render', k, it['hash'], spoken[:50]); continue
            try: raw = PROVIDERS[prov]().render(spoken, name); data = encode(raw, PROVIDERS[prov](), a.fmt)
            except Exception as ex:                                          # keep going; failed lines are listed at the end and retried on the next run
                e['v'].pop(k, None); failed.append((k, it['hash'], str(ex)[:120])); print('FAILED %s %s %s' % (k, it['hash'], str(ex)[:100]), flush=True); continue
            open(fp, 'wb').write(data)
            e['v'][k] = {'file': fn, 'ms': int(round(analyze(fp)['dur'] * 1000)), 'bytes': len(data), 'sig': s, 'voice': name}
            done += 1
            if done % 8 == 0: save()                                         # survive an interrupted run
            print('rendered %s %s %5.1fs %s' % (k, it['hash'], e['v'][k]['ms'] / 1000, spoken[:40]), flush=True); time.sleep(a.delay if prov == 'edge' else max(a.delay, 3))
    live = {i['hash'] for i in items}; orphans = [h for h in man['items'] if h not in live]
    if a.prune:
        for h in orphans:
            for v in man['items'][h]['v'].values():
                try: os.remove(os.path.join(a.out, v['file']))
                except OSError: pass
            del man['items'][h]
    if not a.dry_run: save()
    tot = sum(v['bytes'] for e in man['items'].values() for v in e['v'].values())
    for f in failed: print('FAILED-LINE', *f)
    print('captions %d | failed %d | rendered %d | unchanged %d | orphans %d%s | total %.1f MB' % (len(items), len(failed), done, len(items) * len(voices) - todo, len(orphans), ' (pruned)' if a.prune else '', tot / 1e6))

def cmd_report_latin(a):
    lex = load_lexicon(a.lexicon); bad = {}
    for it in extract(a.demo_dir):
        for w in latin_left(clean_for_speech(it['text'], lex)): bad.setdefault(w, []).append(it['hash'])
    print(json.dumps({w: len(v) for w, v in sorted(bad.items())}, ensure_ascii=False, indent=1) if bad else 'all Latin words mapped')

def cmd_check(a):
    mp = os.path.join(a.out, 'manifest.json'); man = json.load(open(mp, encoding='utf-8')); bad = 0; n = 0
    for h, e in man['items'].items():
        for k, v in e['v'].items():
            fp = os.path.join(a.out, v['file'])
            if not os.path.exists(fp): print('MISSING', fp); bad += 1; continue
            m = analyze(fp); n += 1; cps = len(e['spoken']) / max(m['dur'], .1); prob = []
            if not 5 <= cps <= 22: prob.append('chars/s %.1f' % cps)
            if m['maxgap'] > 1.2: prob.append('gap %.1fs' % m['maxgap'])
            if m['lufs'] is None or abs(m['lufs'] - SETTINGS['lufs']) > 2.5: prob.append('LUFS %s' % m['lufs'])
            if abs(m['dur'] * 1000 - v['ms']) > 150: prob.append('manifest ms off')
            if prob: bad += 1; print('WARN', k, h, ' '.join(prob))
    print('checked %d files, %d with warnings' % (n, bad)); return bad

SAMPLES_HTML = """<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>T.O X voice samples</title>
<style>body{font:15px system-ui,Arial;margin:16px;max-width:900px;background:#1b1714;color:#e8dcc8}h1{font-size:18px}table{border-collapse:collapse;width:100%%}td,th{border:1px solid #4a4038;padding:6px;vertical-align:top;text-align:start}
.t{direction:rtl;font-size:16px;line-height:1.6}audio{width:190px;height:32px}small{opacity:.7}</style>
<h1>T.O X - Arabic narration samples (same sentences, different voices)</h1>
<p><small>Listen and pick. Duration / loudness are measured values. 'chars/s' is a speed sanity check (natural Arabic about 11-15).</small></p>
<table><tr><th>#<th>text<th>%s</tr>%s</table>
<script>document.addEventListener('play',e=>{document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true)</script>"""

def cmd_samples(a):
    lex = load_lexicon(a.lexicon); items = extract(a.demo_dir)
    pick = [items[i] for i in sorted({round(i * (len(items) - 1) / 9) for i in range(10)})][:10]
    cand = [('salma', 'edge', 'ar-EG-SalmaNeural', 'Egyptian female'), ('shakir', 'edge', 'ar-EG-ShakirNeural', 'Egyptian male'),
            ('zariyah', 'edge', 'ar-SA-ZariyahNeural', 'Saudi female (reference)')]
    if os.environ.get('GEMINI_API_KEY'): cand += [('gemini_kore', 'gemini', 'Kore', 'Gemini Kore'), ('gemini_puck', 'gemini', 'Puck', 'Gemini Puck')]
    if os.environ.get('GOOGLE_TTS_KEY'): cand += [('google_a', 'google', 'ar-XA-Wavenet-A', 'Google Wavenet A')]
    d = os.path.join(a.out, 'samples'); os.makedirs(d, exist_ok=True); rep = []; rows = ''
    for n, it in enumerate(pick, 1):
        spoken = clean_for_speech(it['text'], lex); cells = ''
        for key, prov, voice, label in cand:
            fn = '%s_%02d.%s' % (key, n, a.fmt); fp = os.path.join(d, fn)
            try:
                if not os.path.exists(fp) or a.force:
                    data = encode(PROVIDERS[prov]().render(spoken, voice), PROVIDERS[prov](), a.fmt); open(fp, 'wb').write(data); time.sleep(a.delay if prov == 'edge' else 4)
                m = analyze(fp); cps = len(spoken) / max(m['dur'], .1)
                rep.append({'voice': key, 'n': n, 'chars': len(spoken), 'cps': round(cps, 1), **{k: m[k] for k in ('dur', 'lufs', 'maxgap')}})
                cells += '<td><audio controls preload=none src="%s"></audio><br><small>%.1fs · %s LUFS · %.0f ch/s</small>' % (fn, m['dur'], m['lufs'], cps)
            except Exception as e:
                cells += '<td><small>failed: %s</small>' % html.escape(str(e)[:80])
        rows += '<tr><td>%d<td class=t>%s%s</tr>' % (n, html.escape(it['text']), cells)
    open(os.path.join(d, 'samples.html'), 'w', encoding='utf-8').write(SAMPLES_HTML % ('<th>'.join(c[3] for c in cand), rows))
    json.dump(rep, open(os.path.join(d, 'samples_report.json'), 'w'), indent=1)
    for key, *_ in cand:
        r = [x for x in rep if x['voice'] == key]
        if r: print('%-12s lines %d  total %.1fs  avg %.1f ch/s  LUFS %.1f..%.1f  max gap %.2fs' % (key, len(r), sum(x['dur'] for x in r), sum(x['cps'] for x in r) / len(r), min(x['lufs'] for x in r), max(x['lufs'] for x in r), max(x['maxgap'] for x in r)))

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--demo-dir', required=True); p.add_argument('--out', default=os.path.join(HERE, '..', 'media', 'voice'))
    p.add_argument('--voices'); p.add_argument('--fmt', default='mp3', choices=['mp3', 'webm']); p.add_argument('--lexicon')
    p.add_argument('--only-voice'); p.add_argument('--prune', action='store_true'); p.add_argument('--dry-run', action='store_true')
    p.add_argument('--delay', type=float, default=0.4); p.add_argument('--force', action='store_true')
    p.add_argument('--samples', action='store_true'); p.add_argument('--check', action='store_true'); p.add_argument('--report-latin', action='store_true')
    a = p.parse_args()
    if a.samples: cmd_samples(a)
    elif a.check: sys.exit(1 if cmd_check(a) else 0)
    elif a.report_latin: cmd_report_latin(a)
    else: cmd_render(a)
