import json, re, glob, os, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
live = json.load(open(os.path.join(HERE, 'registry_dump.json')))
XC = {c[0]: c[1] for c in live['XC']}            # id -> stub flag
RIBM = live['RIBM']
LIBS = set('gxsym gxbase cxblk cxhat cxlt cxds rxfam rxasm sxpt sxkey sxlbl sxsurf sxpipe pxcal pxact pxres txspec vxeq oxdoc oxxls'.split())
CALCS = set('flex float hw ww man mot bear'.split())
WF = set('struct mep qa hand'.split())
TPL = set(['blank', 'sewage', 'house2', 'office3'])
TABS = set(live['WTYPES'].keys())
SRC = ''.join(open(f, errors='ignore').read() for f in glob.glob(os.path.join(SP, 'c_*.js')))

def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + '.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m.PH
PH = load('_p_a') + load('_p_b') + load('_p_c')

bad = []
def resolve(i):
    """returns (display id, status flag) ; status: ok / stub / unknown"""
    if i.startswith('R:'):
        t, tab, panel, en = i[2:].split('|')
        for k, m in RIBM.items():
            if m['type'] == t and m['tab'] == tab and m['panel'] == panel and m['en'] == en:
                return k + ' [' + t.upper() + ' ' + tab + ' > ' + panel + ' > ' + en + ']', ('stub' if XC.get(k) else 'ok'), k
        bad.append(i); return i, 'unknown', i
    if i.startswith('calc:'):
        return i, ('ok' if i[5:] in CALCS else 'unknown'), i
    if i.startswith('wf:'):
        return i, ('ok' if i[3:] in WF else 'unknown'), i
    if i.startswith('tpl:'):
        return i, ('ok' if i[4:] in TPL else 'unknown'), i
    if i.startswith('lib:'):
        return i, ('ok' if i[4:] in LIBS else 'unknown'), i
    if i.startswith('tab:'):
        return i, ('ok' if i[4:] in TABS else 'unknown'), i
    if i.startswith('fn:'):
        return i, ('ok' if re.search(r'function\s+' + re.escape(i[3:]) + r'\b', SRC) else 'unknown'), i
    if i in XC:
        return i, ('stub' if XC[i] else 'ok'), i
    return i, 'unknown', i

def norm_steps(steps):
    out = []
    for n, s in enumerate(steps, 1):
        if isinstance(s, str):
            out.append(dict(n=n, text=s)); continue
        text, st, ids, note = s
        rid = []
        for i in ids:
            d, flag, raw = resolve(i)
            if flag == 'unknown': bad.append(i)
            rid.append(dict(id=raw, label=d, check=flag))
        out.append(dict(n=n, text=text, status=st, ids=rid, note=note))
    return out

for p in PH:
    p['steps'] = norm_steps(p['steps'])
    if 'stages' in p:
        for s in p['stages']:
            s['steps'] = [dict(n=k, text=t) for k, t in enumerate(s['steps'], 1)]
    cnt = {'Y': 0, 'P': 0, 'M': 0, 'F': 0}
    for s in p['steps']: cnt[s['status']] += 1
    p['coverage'] = cnt

sys.path.insert(0, HERE)
from _gaps import GAPS, DATA, DEMO, UNCERTAIN

J = dict(
    title='Project 6868 - complete small-building project phases mapped to T.O X',
    generated='2026-11-21', build_checked='vx_wired.html (scratchpad, built 2026-11-21 09:12), registry dumped headless: 1608 commands, 1462 non-stub',
    legend=dict(Y='tool exists and does the step', P='partly there', M='MISSING', F='field / human step, no software'),
    project=dict(type='2-storey reinforced-concrete villa with MEP on a real plot', region='Egypt / Arab world', codes=['ECP 203 (concrete)', 'ECP 201 (loads)', 'ECP 202 (soil/foundations)', 'Eurocode 1/2/7/8', 'ACI 318 / ASCE 7']),
    phases=PH, gaps=GAPS, data_inventory=DATA, demo_plan=DEMO, uncertain=UNCERTAIN)
json.dump(J, open(os.path.join(HERE, 'phases.json'), 'w'), ensure_ascii=False, indent=1)

# ---------- markdown ----------
L = []
w = L.append
w('# Project 6868 - the complete life of a small building, mapped to T.O X')
w('')
w('Generated 2026-11-21 for the guided-demo session (`mod-demo6868`). Documents in English, phase titles bilingual. Replies to the owner are in Arabic; this file is the engineering map.')
w('')
w('**Project modelled:** 2-storey reinforced-concrete villa (BUA about 300-450 m2) with electrical, HVAC, plumbing/drainage and low-current, on a real plot, Egypt / Arab-world practice. Codes: ECP 203 (concrete), ECP 201 (loads), ECP 202 (soil and foundations); Eurocode 1/2/7/8 and ACI 318 / ASCE 7 noted as equivalents.')
w('')
w('**Reading rules (honesty):** (1) Anything labelled `RULE OF THUMB` is a planning figure, NOT a design approval and NOT from a licensed code. (2) No clause numbers are quoted; where a limit depends on the code the text says "check the clause". (3) Every T.O X id below was checked against the built app (`vx_wired.html`) by dumping its real command registry in headless Chrome; ids marked `[stub]` exist on the ribbon but only say "not built yet". (4) Engineering outputs in the demo are demonstrations, not design approval.')
w('')
w('**Status legend for steps:** `Y` tool exists and does it - `P` partly - `M` MISSING - `F` field/human work (no software role).')
w('')
w('## 0. What is already true in T.O X (verified)')
w('')
w('- 18 program types (`WTYPES`): start, R.X model, C.X draft, P.X sched, S.X survey, N.X coord, D.X detect, Q.X takeoff, L.X levels, M.X sim, E.X analysis, O.X office, T.X plant, H.X home, V.X hvac, G.X gis, Missions hub, F.X capture. Registry: 1608 commands, 1462 working, 146 stubs.')
w('- Ribbon coverage (working of total): R.X 213/280, C.X 138/173, S.X 111/115, N.X 113/115, O.X 90/99, Q.X 83/83, P.X 76/92, T.X 70/84, G.X 79/86, F.X 46/46.')
w('- Calculation sheets (`p_calc`, `CALCS`): ONLY 7 - `flex` (concrete strip/beam flexure + shear, ACI 318 form, SBC 304 cited, cylinder f\'c, simplified), `float` (flotation of a well), `hw` (Hazen-Williams), `ww` (wet-well volume), `man` (Manning full flow), `mot` (motor current + voltage drop), `bear` (bearing pressure W/A vs qa). **The ECP 203 method is deliberately NOT programmed** - the sheet says it needs a verified formula set from the licensed code.')
w('- Codes panel (`p_codes`): 37 entries incl. ECP 203, ECP 201, ECP 202 as titles/scope only (no clauses by design).')
w('- Templates (`TEMPLATES`): blank, sewage (lift station), `house2` (12 x 10 m, 2 floors + roof) and `office3`. **house2 contains 16 walls (t 0.25), 2 floors, 10 rooms, 9 doors, 16 windows, 1 stair, 1 roof - and NO columns, beams, footings or slabs-on-grade.** Its BOQ has 6 rows. This is why the demo "walls/structure" looked wrong: the structural skeleton does not exist in the template.')
w('- R.X defaults (`RV.def`): wall h 3.0 t 0.2; column 0.4 x 0.4 x 3.0; door 0.9 x 2.1; window 1.2 x 1.2 sill 0.9; floor t 0.2; levels "Level 1" z0 and "Level 2" z3 (template uses Ground 0 / First 3 / Roof 6).')
w('- Demo already has 13 chapters in `demo_ch1-3.js`: welcome, project, rx, site, sched, struct, elec, hvac, lowc, plumb, clash, boq, out.')
w('')

w('## Phase index and coverage')
w('')
w('| # | Phase | Y | P | M | F | typical duration |')
w('|---|---|---|---|---|---|---|')
for p in PH:
    c = p['coverage']
    w('| %d | %s / %s | %d | %d | %d | %d | %s |' % (p['id'], p['title_en'], p['title_ar'], c['Y'], c['P'], c['M'], c['F'], p['duration']))
w('')
w('**Dependency chain (must be respected by the demo order):** 0 -> 1 (soil + levels) -> 2 (plan) -> 3 (system + loads) -> 4 (structure) and 5 (MEP) in parallel with a coordination loop to 2/3 -> 6 (coordination, BOQ, spec, estimate) -> 7 (tender) -> 8 (planning) -> 9 (construction, stage order below) -> 10. Key hard dependencies: soil report before foundation type; architectural freeze before structural design; shaft/sleeve positions before slab reinforcement; MEP first-fix tested before plaster; flood/pressure tests before concealment.')
w('')

for p in PH:
    w('---')
    w('')
    w('## Phase %d - %s' % (p['id'], p['title_en']))
    w('**%s**' % p['title_ar'])
    w('')
    w('**Purpose.** ' + p['purpose'])
    w('')
    w('**Inputs**')
    for x in p['inputs']: w('- ' + x)
    w('')
    if 'stages' in p:
        w('**Construction stages in true order (9.1-9.13)** - each: steps, crews, equipment, hold point and record, T.O X support')
        w('')
        for s in p['stages']:
            w('### %s %s / %s' % (s['n'], s['t'], s['ar']))
            for k, t in enumerate(s['steps'], 1): w('%d. %s' % (k, t))
            w('- **Crews:** ' + s['crews'])
            w('- **Equipment:** ' + s['equip'])
            w('- **Hold point / record:** ' + s['hold'])
            w('- **T.O X:** ' + s['tox'])
            w('')
        w('**Cross-cutting steps (T.O X mapping)**')
        w('')
    w('**Steps** (status, T.O X ids)')
    w('')
    for s in p['steps']:
        ids = ', '.join('`%s`%s' % (i['label'], ' **[stub]**' if i['check'] == 'stub' else '') for i in s['ids'])
        w('%d. [%s] %s' % (s['n'], s['status'], s['text']))
        w('   - T.O X: %s%s' % (ids if ids else '(none)', ('  - ' + s['note']) if s['note'] else ''))
    w('')
    w('**Outputs / deliverables**')
    for x in p['outputs']: w('- ' + x)
    w('')
    w('**Checks and acceptance criteria**')
    for x in p['checks']: w('- ' + x)
    w('')
    w('**Quantities, formulas and rules of thumb** (labelled; not design approval)')
    for x in p['rules']: w('- ' + x)
    w('')
    w('**Common mistakes**')
    for x in p['mistakes']: w('- ' + x)
    w('')
    w('**Typical duration:** ' + p['duration'])
    w('')
    w('**Demo hint:** ' + p['demo'])
    w('')

w('---')
w('')
w('## Gap list (ranked by importance for a convincing end-to-end demo)')
w('')
w('Rank logic: (a) the engineer or the owner would notice the hole at once, (b) later chapters depend on it, (c) build cost. "Placeholder" = can be shown honestly with clearly labelled sample data.')
w('')
w('| Rank | Gap | Why it matters | Exists today | Suggested build (size) |')
w('|---|---|---|---|---|')
for g in GAPS:
    w('| %d | **%s** | %s | %s | %s |' % (g['rank'], g['gap'], g['why'], g['have'], g['build']))
w('')
w('## Data the demo needs and where it lives')
w('')
w('| Data | Status | Where it is / what to do |')
w('|---|---|---|')
for d in DATA:
    w('| %s | %s | %s |' % (d['item'], d['status'], d['where']))
w('')
w('## Proposed demo order (maps this document to chapters)')
w('')
w('| Seq | Demo chapter | Phase | Exists in demo_ch1-3 | Needs |')
w('|---|---|---|---|---|')
for d in DEMO:
    w('| %s | %s | %s | %s | %s |' % (d['seq'], d['chapter'], d['phase'], d['exists'], d['needs']))
w('')
w('## Uncertainty and what was NOT verified')
w('')
for u in UNCERTAIN: w('- ' + u)
w('')
open(os.path.join(HERE, 'PROJECT_PHASES.md'), 'w').write('\n'.join(L))
print('phases', len(PH), 'md lines', len(L), 'unresolved ids:', sorted(set(bad)))
