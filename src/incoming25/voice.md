**T.O X guided demo - pre-rendered Arabic narration** (incoming25). Owner: you must LISTEN to `media/voice/samples/samples.html` and decide (a) which voice, (b) whether the provider terms are acceptable (section "Provider status").

## What it is
Narration is audio files made ONCE at build time and served as static files. The app never calls a TTS service; nothing leaves the browser at runtime (privacy test 109 passes, parity 126 passes on a build with the module injected).
- `tools/make_voice.py` - reads every `say`/`cap` caption (`ar`) from `demo_ch*.js` (via `tools/extract_captions.js`, which executes the chapter files against a stub: no regex, follows whatever the demo session writes), cleans text for speech (`tools/voice_lexicon.json`: T.O X, R.X, Ctrl+K, BOQ, 6868, units, numbers -> Egyptian words), renders one file per line and voice, trims silence, loudness -16 LUFS, mono 24 kHz MP3 32 kbps, writes `media/voice/ar/<hash>.<f|m>.mp3`, `manifest.json` ({hash: text, spoken, v:{f:{file,ms,bytes,sig,voice}}}) and `manifest.js` (what the player loads; works from file:// too).
- Re-runnable: file name key = cyrb53 hash of the NFC Arabic caption (same function in python and JS, test-checked). Only new/changed lines are rendered (a per-file signature also covers lexicon/voice changes). `--prune` deletes audio of captions that no longer exist (default: keep and report orphans).
- `demo_voice.js` - player chunk, loaded last inside the lazy demo source. Does not edit `demo_core.js`.
- `chain.diff` - one line in patch_v3.py: add `'demo_voice.js'` at the END of the demo chunk list (after the chapter files; if the demo session adds `demo_ch4.js` etc. keep voice last).

```
# one-time
python3 -m venv ~/.local/venvs/voice_tts && ~/.local/venvs/voice_tts/bin/pip install edge-tts   (ffmpeg on PATH)
# every time captions change (run from anywhere; ~10 s per line per voice on this loaded machine, normally ~3 s)
~/.local/venvs/voice_tts/bin/python tools/make_voice.py --demo-dir <scratchpad> --out <site>/media/voice
... --check          objective checks (chars/s, silent gaps, LUFS, duration vs manifest)
... --report-latin   Latin words not in the lexicon (add them to voice_lexicon.json)
... --samples        sample set + samples/samples.html
```
(The old `~/.local/venvs/voice` is a heavy chatterbox/torch env without pip; left untouched, new venv `voice_tts` used.)

## Player behaviour (`demo_voice.js`)
- Panel gets its own row after the caption: **Voice: ON/OFF** (default OFF; the engine's own speechSynthesis speaker button is hidden), then when ON: Female/Male, mute, volume, voice speed 0.9-1.5, and a "Browser voice" checkbox (OFF by default; only then is speechSynthesis used, and only for lines without a recording).
- Nothing is fetched at page start nor while voice is OFF (tested: zero requests to media/voice). On first ON it loads `media/voice/manifest.js`; each line's mp3 is fetched on demand, next 2 lines are preloaded; http(s): Cache API `tox-voice-v1` (URL has `?v=<sig>` so a re-rendered line is never stale); file://: played straight from the file (the Cache API needs http(s)).
- `say` waits for the audio to END (+300 ms), so the step is paced by the audio. `cap` lines play alongside without blocking. Missing recording, English UI, no manifest, autoplay blocked or no progress for 6 s: silently falls back to the normal caption timing.
- Pause/resume, Stop, skip/jump, fast-forward, 1x/2x/4x: handled by watching `DEMO.D` (120 ms): audio pauses with the demo, stops instantly on Stop/skip/jump, rate = voice speed at 1x and capped 1.5 at 2x/4x (the step still waits for the audio).
- No hook missing in demo_core.js: it uses `DEMO.ops.say/cap` (looked up at run time), `DEMO.D`, `DEMO.setCap/sleep/chk/h/B/L`. One cosmetic limit: the engine's old speaker button is only hidden, not removed. No storage keys (state is in memory only; voice ON resets on reload).
- Served from `media/voice/` next to `index.html` (override with `window.TOX_VOICE_BASE`). GitHub Pages: commit the folder under `site/media/voice/` (static, nothing to build). Mac folder: copy `media/voice/` into `~/Documents/Project_01_Sewage_Lift_Station/01_Viewer/media/voice/`. NOT embedded in the single HTML.

## Size (measured on the current 48 caption lines, avg 91 chars)
Female 48 lines = 467 s = 1.89 MB (38.5 KB/line, 9.7 s/line); male 415 s = 1.68 MB (34.2 KB/line). For ~400 lines: about 15.4 MB female + 13.7 MB male = ~29 MB for both, ~15 MB for one. At 24 kbps (change `SETTINGS['bitrate']`) about 22 MB / 11 MB. A visitor downloads only the lines of the voice they play (~15 KB per 4 s).

## Provider status (honest)
| provider | key | tested here | notes |
|---|---|---|---|
| `edge` (default) edge-tts 7.3.1 | none | YES: 96 files rendered (Salma, Shakir) + Zariyah | UNOFFICIAL Python client of Microsoft's Edge "Read Aloud" web endpoint. It is not Microsoft's licensed Azure API; Microsoft's terms do not grant use of that endpoint outside Edge, it can break or be blocked any time, and commercial/redistribution rights over the audio are unclear. Audio is generated ONCE at build time (not at user runtime), but **owner decision needed**: accept this risk, or use `azure` (below). |
| `azure` Azure AI Speech | AZURE_SPEECH_KEY + AZURE_SPEECH_REGION | NO (no key) | OFFICIAL, licensed; the SAME voices ar-EG-SalmaNeural / ar-EG-ShakirNeural; free tier ~0.5M chars/month (400 lines ~ 36k chars). My recommendation if the demo is public. Switch: `--voices f=azure:ar-EG-SalmaNeural,m=azure:ar-EG-ShakirNeural` (files are re-rendered because the signature changes). |
| `gemini` Gemini TTS (`gemini-2.5-flash-preview-tts`) | GEMINI_API_KEY (read from env only, never written/printed) | PARTLY: your key was in the environment; 12 sample lines rendered OK (Kore 6, Puck 6), then HTTP 429 (free-tier quota) on the rest | Sounds natural, prompted for Egyptian dialect, but 429 means ~400 lines need a paid tier or a slow overnight run (the code retries with back-off). Preview model, voices/behaviour may change. |
| `google` Cloud TTS | GOOGLE_TTS_KEY | NO | Arabic is `ar-XA` (pan-Arabic, no Egyptian voice), so least fitting. |

## Objective checks (listening is up to you)
10 caption lines, same text, `media/voice/samples/` (open `samples.html`, 5 voices side by side):
| voice | 10 lines total | avg chars/s | LUFS | longest inner silence |
|---|---|---|---|---|
| Salma ar-EG (female) | 99 s | 9.7 | -17.2..-16.6 | 1.03 s |
| Shakir ar-EG (male) | 88 s | 10.8 | -17.5..-16.4 | 1.31 s |
| Zariyah ar-SA (Saudi female, reference only) | 97 s | 9.9 | -17.2..-16.3 | 0.98 s |
| Gemini Kore (6 of 10 lines) | 59 s | 10.4 | -16.6..-16.1 | 0 |
| Gemini Puck (6 of 10 lines) | 58 s | 10.4 | -18.3..-16.0 | 0 |
`--check` on all 96 real files: durations match the manifest, loudness within 2.5 LUFS of -16, 92 clean; 4 male-voice files have a 1.3-1.5 s pause inside (long clause break; probably the comma/colon after a Latin name): listen to those, or add a comma-free rewrite. Speed (~10 chars/s) is slow-ish and calm; the speed selector goes up to 1.5x. These numbers prove the files are not broken (no truncation, no long dead air, even loudness); they say NOTHING about dialect fidelity or pleasantness: **I cannot listen, you must**. Expected from the voices' design: Salma/Shakir are Egyptian-accented neural voices; Gemini is usually more expressive. Please say which one wins.

## Tests (`tests/test_voice.js`, real built page + injected module + fake tone audio, one Chrome, swiftshader)
All 32 checks PASS: hash identical python/JS; startup and voice-OFF: no request to media/voice, no audio, no speechSynthesis; ON: audio element `play`/`ended` events, audio runs to the file end (2.0 s) and the next step starts only after `ended`; female/male file choice; volume 0.3, rate 0.9, mute applied; 2x demo speed -> rate 1.5; pause freezes currentTime, resume continues; Stop silences and nothing plays afterwards; unknown caption / English UI -> no recording, no speechSynthesis; with "Browser voice" ticked speechSynthesis is used; requests only manifest.js + mp3; no page errors. Parity 126/126 and privacy 109/109 on the build with the module. Wall-clock under this machine's load (load avg 100-500) is 2.5x slower than media time, so timing is asserted structurally (order and currentTime), not in seconds.
**Not tested:** real sound output, Safari/Firefox, the Cache API path (needs http(s); only file:// was driven), the real recordings inside the player (tests used tones), 4x full demo run with voice, azure/google providers, Gemini full set, any listening judgement.

## Files
`tools/make_voice.py`, `tools/extract_captions.js`, `tools/voice_lexicon.json`, `demo_voice.js`, `chain.diff`, `tests/test_voice.js`, `media/voice/` (manifest.json, manifest.js, ar/ 96 mp3 = 3.6 MB, samples/ = 44 mp3 + samples.html + samples_report.json). The 48 rendered lines belong to the CURRENT demo text; when the demo session changes captions, re-run make_voice (only changed lines render; add `--prune`).
