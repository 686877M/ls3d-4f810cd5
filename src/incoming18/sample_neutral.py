#!/usr/bin/env python3
"""sample_neutral.py [chunk_dir]  -- make the built-in sample project safe (incoming18).

It rewrites chunk files in place. The first run writes <file>.pre_sample backups of the ORIGINAL chunks; every later run restores
them first, so the script is re-runnable and always asserts against the originals (a moved string fails loudly).

What it does (all relationships and quantities are kept; only the frame of reference changes):
  * world origin: well centre -> fictitious UTM 31N E 500000.00 / N 10000.00 (open ocean, zone 31 is not the real zone),
    plan rotation to north 6.5 deg -> 0 (the model/local coordinates are NOT changed, only the mapping to the world)
  * level datum: every absolute level is shifted by DZ = -1059.76 m, so the sump bottom (B.L) is +100.00 and the
    design ground level +104.95. Differences (depths, heads, slopes, volumes) are unchanged.
  * CAD layer names of the site plan (they carried drawing codes and a contractor's words) -> LYR-001..131 (category kept)
  * building / facility names in the networks (a base layout) -> BLD-01.. ; model / file names -> neutral
  * review notes that quoted real document titles / initials -> generic wording
patch_v3.py gets the same level shift for the base page (see sample_patch_v3.diff)."""
import re, sys, os, json
from decimal import Decimal, ROUND_HALF_UP
D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
DZ = Decimal('-1059.76')
for _f in sorted(os.listdir(D)):                      # restore originals first (re-runnable)
    if _f.endswith('.pre_sample'): open(os.path.join(D, _f[:-11]), 'w', encoding='utf-8').write(open(os.path.join(D, _f), encoding='utf-8').read())
LV = re.compile(r'(?<![\w.])11[5-7]\d\.\d+(?![\d])')          # a level written with decimals, 1150..1179.x

def shift_tok(m):
    t = m.group(0); dec = len(t.split('.')[1])
    return str((Decimal(t) + DZ).quantize(Decimal(1).scaleb(-dec), rounding=ROUND_HALF_UP))

def rd(f): return open(os.path.join(D, f), encoding='utf-8').read()
def wr(f, s):
    p = os.path.join(D, f)
    if not os.path.exists(p + '.pre_sample'): open(p + '.pre_sample', 'w', encoding='utf-8').write(open(p, encoding='utf-8').read())
    open(p, 'w', encoding='utf-8').write(s)

def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, 'sample_neutral: %r found %d times (want %d)' % (a[:70], c, n)
    return s.replace(a, b)

def shift_levels(f, expect_min=1):
    s = rd(f); n = len(LV.findall(s)); assert n >= expect_min, (f, n)
    wr(f, LV.sub(shift_tok, s)); return n

# ---- numbers kept as text: parse_float=Decimal and write them back unchanged ----
def ser(o):
    if o is None: return 'null'
    if isinstance(o, bool): return 'true' if o else 'false'
    if isinstance(o, Decimal): return format(o, 'f')
    if isinstance(o, int): return str(o)
    if isinstance(o, str): return json.dumps(o)
    if isinstance(o, list): return '[' + ','.join(ser(x) for x in o) + ']'
    if isinstance(o, dict): return '{' + ','.join(json.dumps(k) + ':' + ser(v) for k, v in o.items()) + '}'
    raise TypeError(type(o))
def load_obj(f, name):
    s = rd(f); i = s.index('{'); j = s.rindex('}')
    assert s.startswith('const ' + name + '='), f
    return s[:i], json.loads(s[i:j + 1], parse_float=Decimal), s[j + 1:]

# ===== 1. levels in text chunks =====
tot = 0
for f in ('c_calc.js', 'c_draft.js', 'c_sheet.js', 'c_ui.js', 'c_geo.js'):
    tot += shift_levels(f)
print('levels shifted in text chunks:', tot)

# ===== 2. geo (UTM origin, rotation, ground level, note) =====
s = rd('c_geo.js')
s = rep(s, "{sys:'utm',zone:38,north:1,E:252698.97,N:2212944.61,lat:'',lon:'',gl:104.95,rot:6.5,note:'Taken from the site plan ME-GLY-01.dxf (coordinates of the well centre). Datum and zone are assumed (WGS84, UTM 38N): confirm with the approved survey.'}",
        "{sys:'utm',zone:31,north:1,E:500000,N:10000,lat:'',lon:'',gl:104.95,rot:0,note:'Sample project: fictitious origin and datum (well centre at E 500000, N 10000, UTM 31N; levels relative to B.L +100.00). It is not a real location. Replace with the approved survey values for a real project.'}")
wr('c_geo.js', s)

# ===== 3. site sheet: station label in the new frame (local x,z are unchanged; rot 0: E = E0 + x, N = N0 - z) =====
s = rd('c_sheet.js')
s = rep(s, "['Station label (E, N)','252692.4, 2212941.6']", "['Station label (E, N)','499993.8, 9996.3']")
wr('c_sheet.js', s)

# ===== 4. SITE: origin, rotation, layer names, one label =====
pre, SITE, post = load_obj('c_site_data.js', 'SITE')
assert str(SITE['rot']) == '6.5' and str(SITE['cx']) == '252698.97' and str(SITE['cy']) == '2212944.61'
SITE['rot'] = Decimal('0'); SITE['cx'] = Decimal('500000'); SITE['cy'] = Decimal('10000')
nl = len(SITE['layers']); SITE['layers'] = [['LYR-%03d' % (i + 1), c] for i, (nm, c) in enumerate(SITE['layers'])]
hit = 0
for l in SITE['labels']:
    if l[0] == 'TO HANGERS FIRE': l[0] = 'TO ZONE B FIRE'; hit += 1
assert hit == 1
wr('c_site_data.js', pre + ser(SITE) + post)
print('SITE layers renamed:', nl)

# ===== 5. master plan source note =====
s = rd('c_msite_data.js')
s = rep(s, '"src":"Owner master plan DXF (xref WUT-MASTER-PLAN-XREF), world E/N -> site model (same rot 6.5 deg and origin as SITE). 2D only: no invert, slope or diameter in the file."',
        '"src":"Master plan DXF (sample), world E/N -> site model (same rotation and origin as SITE). 2D only: no invert, slope or diameter in the file."')
wr('c_msite_data.js', s)

# ===== 6. networks: datum + levels shifted, neutral names, neutral source text =====
pre, N, post = load_obj('c_nets_data.js', 'NETS')
assert str(N['datum']) == '1164.71'
N['datum'] = N['datum'] + DZ
N['src'] = {'sew': 'Sewer network model (sample data), checked against sample profile sheets', 'storm': 'Storm network model (sample data)',
            'water': 'Water network model (sample data). Node elevation is the model junction elevation; pipe cover is not in the model.',
            'fireb': 'Fire-fighting network model (sample data, buildings loop)', 'fireh': 'Fire-fighting network model (sample data, zone B loop)'}
KEEP = re.compile(r'^(MH|J|P|R|PMP|CB|CS|O)-[\w-]+$|^(terminal|SUMP-PIT|DISPOSAL_POINT.*|SEWAGE PUMPSTATION|GUARD ROOM-\d|Security Room \d|Fence Gate|MAIN GATE ?|Main Gate)$', re.I)
names = {}
def nn(x):
    if x is None or KEEP.match(x): return x
    if x not in names: names[x] = 'BLD-%02d' % (len(names) + 1)
    return names[x]
def sh(v): return None if v is None else v + DZ
for k in ('sew', 'storm', 'water', 'fireb', 'fireh'):
    for n in N[k]['nodes']:
        n[0] = nn(n[0]); n[3] = sh(n[3]); n[4] = sh(n[4])
    for p in N[k]['pipes']:
        p[1] = nn(p[1]); p[2] = nn(p[2]); p[4] = sh(p[4]); p[5] = sh(p[5])
wr('c_nets_data.js', pre + ser(N) + post)
print('NETS: %d facility names -> BLD-nn' % len(names))
json.dump(names, open(os.path.join(D, 'sample_names_map.private.json'), 'w'), indent=1)   # keep OUT of the delivery

# ===== 7. site 3D texts: model/file names, rotation, hangars =====
s = rd('c_site3d.js')
s = rep(s, 'from ME-GLY-01.dxf (aligned to the well, rotated 6.5 degrees)', 'from a sample site plan (aligned to the well)')
s = rep(s, "Source: site plan ME-GLY-01.dxf, aligned to the well centre and rotated 6.5°.", "Source: sample site plan, aligned to the well centre.")
s = rep(s, 'المصدر: لوحة الموقع العام ME-GLY-01.dxf، متوازية مع مركز البئر ومدارة 6.5°.', 'المصدر: لوحة موقع عام تجريبية، متوازية مع مركز البئر.')
s = rep(s, "Fire main (hangars) ','خط حريق (هناجر) '", "Fire main (zone B) ','خط حريق (منطقة ب) '")
s = rep(s, "Fire network: hangars (model FIRE-HANGERS)','شبكة الحريق: الهناجر (موديل FIRE-HANGERS)'", "Fire network: zone B (sample model)','شبكة الحريق: منطقة ب (موديل تجريبي)'")
s = rep(s, "(model SEW-03: real inverts and sizes)','شبكة الصرف 3D (موديل SEW-03: مناسيب وأقطار حقيقية)'", "(sample model: inverts and sizes)','شبكة الصرف 3D (موديل تجريبي: مناسيب وأقطار)'")
s = rep(s, "(model STORM_Add)','شبكة الأمطار 3D (موديل STORM_Add)'", "(sample model)','شبكة الأمطار 3D (موديل تجريبي)'")
s = rep(s, "(model WAT-23102026)','شبكة مياه الشرب 3D (موديل WAT-23102026)'", "(sample model)','شبكة مياه الشرب 3D (موديل تجريبي)'")
s = rep(s, "(model Building)','شبكة الحريق: المباني (موديل Building)'", "(sample model)','شبكة الحريق: المباني (موديل تجريبي)'")
s = rep(s, "/* owner review 2026-11-19: the DXF gives", "/* review note: the DXF gives")
wr('c_site3d.js', s)

# ===== 8. compass =====
s = rd('c_nav.js'); s = rep(s, 'const NAV={rot:6.5,', 'const NAV={rot:0,'); wr('c_nav.js', s)

# ===== 9. review findings that quoted a real document =====
s = rd('c_pdata.js')
s = rep(s, "/* ====== Reference data read from the owner's Drive review (tank structural calculation REV 01, 2026-11-13): ", "/* ====== Sample reference data (tank structural calculation, sample): ")
a = "Footer of pages 67-70 says \"WORKSHOP & STORE STRUCTURAL CALCULATIONS\" dated 07/11/2026; the file properties name \"Guard Room\"; document number is a placeholder (XXX); checked and approved by the same initials (H.M.)."
b = "The footer of the last pages names a different structure and date; the file properties name another building; the document number is a placeholder; checked and approved by the same person."
s = rep(s, a, b)
s = rep(s, "Review findings from the Drive files','ملاحظات المراجعة من ملفات الدرايف'", "Sample review findings','ملاحظات مراجعة (عيّنة)'")
wr('c_pdata.js', s)
# ===== 10. coordinate help: plan rotation =====
s = rd('c_gis2.js')
s = rep(s, "Site grid (this project: DXF drawing rotated 6.5° to the well)','شبكة الموقع (المشروع ده: رسم الـDXF مدوّر 6.5° على البئر)'", "Site grid (sample: plan rotation 0° to north, fictitious origin)','شبكة الموقع (العيّنة: دوران المسقط 0° عن الشمال، أصل افتراضي)'")
wr('c_gis2.js', s)
print('done')
