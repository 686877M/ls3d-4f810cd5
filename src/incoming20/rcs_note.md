# RC skeleton + rebar detailing (gaps 1 and 4 of PROJECT_PHASES.md)

Files (new only): `rcs_skel.js`, `rcs_rebar.js` (chunks), `rcs_test.js` (node, pure, 99 checks), `rcs_browser_test.js` (page, 48 checks), `chain.diff`.
Wire: append `+rd('rcs_skel.js')+rd('rcs_rebar.js')` after `rd('c_upd.js')` in patch_v3.py (any place after c_templates.js and the rvx_* chunks; keep the two in this order). No shared file edited.
Tests: `node rcs_test.js <dir>`; `NODE_PATH=<pw> node rcs_browser_test.js <index.test.html>`.
Globals: `RCSKEL`, `RCSREB`, `RCSR` (note: `RCB` is taken by the reality-capture chunk). Lazy: at page start only commands are registered; nothing is computed (tested).

## What it does
**Gap 1 - `rcs_skeleton` command + template `house_rc`** (12 x 10 m, grid 4 m x 5 m, 2 storeys, stair, neutral names). Levels: Foundation top -1.0, Ground 0, First 3.0, Roof 6.0.
Order built (also `rcskSteps()` / `upTo` for the demo): grid, isolated footings, neck columns, tie beams, slab on grade, then per storey columns, beams, slab (panels, one/two-way, stair opening), walls between column faces, doors/windows, stair, parapet, rooms. Option `found:'strip'` = continuous strips, no tie beams.
Sizes are rules of thumb, labelled in the UI and in `RCSKEL.RULES`: slab t = short span/35 (two-way) or /30 (one-way, ratio >= 2), min 12 cm; beam depth span/12, tie span/10, width 25; column Ac = Nu/(0.40 fcu) from a tributary take-down (1.4D+1.6L), 25 x 40 minimum; footing area = 1.1 x service load / qa (150 kPa assumed), min 1.0 m, t = cantilever/1.5 min 40 cm. Loads, qa, fcu 25, fy 360 are assumptions, editable in the dialog.
**Numeric checks** (`RCSKEL.check`, command `rcs_skeleton_check`, run on the real R.X data): no wall intersects column/beam/slab/footing (3D box overlap volume), wall tops touch the beam soffit, wall bases fully supported, every door/window inside its wall (length, height, no overlap), slab top flush with beam top and slab thinner than beams, every slab edge on a beam centreline (or stair opening edge), panels + openings tile the footprint exactly, columns stack footing-neck-storeys-roof without gap, columns on grid nodes and beams between columns, footings contain necks and do not overlap, stair riser/tread/rise/headroom >= 2.10 m. Negative tests prove each check can fail.
Net concrete uses exact priority painting (joints counted once): default house 0.34 m3 per m2 built-up area, inside the 0.30-0.40 rule band.
**Gap 4 - rebar** (`rcs_rebar`, `rcs_ld`, `rcs_rebar3d`, `rcs_cover`, `rcs_coupler`, `rcs_member`; ribbon Structure > Reinforcement: Cover, Area, Path, Rebar Couplers are no longer stubs, plus Detail and BBS, Lap and Development, Rebar 3D; the Rebar button opens the BBS when the project is not the lift-station sample).
Per member: footing mats (hooked if the straight length from the column face < ld), neck/column bars (L-bend in footing, lap or coupler above, hook at top), ties with end/mid zones, cross ties, beam bottom/top/support bars + stirrups, slab bottom mesh both ways + top bars over interior supports, slab-on-grade mesh, stair waist bars. Cover per member class (default 75/50/30/50/25/20/50/20 mm for footing/neck/column/tie/beam/slab/sog/stair).
BBS: mark, member group, role, shape (ST, L1, U2, SQ, XT), dia, legs, cut length, no. per member, members, total no., total length, kg; totals per member group (tonnage), per diameter, kg per m3 vs rule band; CSV export. Default house: 7.9 t, 96 kg/m3 average (below the 100-130 average band; each member type is inside its own band).
BOQ: lines RB01..RB05 (footings, columns, beams, slabs, stairs) in kg via getItems, only when the model holds generated (`src:'rcs'`) members.
3D: `rcs_rebar3d` toggles instanced thin cylinders (one InstancedMesh per member type, ~17k segments for the default house), concrete turns transparent; follows model and cover changes.
Steel areas come from simple ratios (column 1 %, beam 0.8 %, tie 0.6 %, footing 0.45 %, slab 0.55 %) unless `cfg.design(info)` returns `{AsCol|AsBot|AsFoot|AsSlab}`: that is the plug-in point for the structural-design session (tested).

## Formulas (printed in the dialog; no clause numbers claimed)
f'c = 0.8 fcu (rough). ld = fy psi_t psi_e / (2.1 lambda sqrt(f'c)) x db for db <= 19, /(1.7 ...) for db >= 22, min 300 mm (ACI 318M simplified form, good spacing/cover case; 1.4/1.1 for other cases), rounded up to 10 mm. Tension lap = 1.3 ld, min 300. Compression lap = max(300, 0.071 fy db); compression ld = max(0.24 fy db/(lambda sqrt(f'c)), 0.043 fy db, 200). 90 deg hook tail 12 db; 135 deg stirrup tail max(6 db, 75). Hooked ldh = max(8 db, 150, 0.24 psi_e fy db/(lambda sqrt(f'c))). Weight d^2/162 kg/m. Cut length = sum of outside legs - bend deductions (90 deg 2 db, 135 deg 3 db).
Hand values: fy 360, fcu 25: ld16 = 613 mm, lap16 = 800, ld25 = 1184, lap25 = 1540; beam stirrup 25 x 40, cover 25 = 1154 mm.

## Honest limits (demo-grade)
- NOT a structural design and NOT approved; every size, load, ratio and grade is a labelled assumption. ECP 203 is not coded (its bond/development expressions differ): compare with a licensed copy.
- Each beam span is detailed as a separate member (bars hooked into columns); real interior supports run bars through. Tie beams with a 0.25 m column face (the 5 m ties) show "CHECK": hook ldh 350 mm > 220 mm available. Left visible on purpose.
- Not detailed: footing/joint ties, slab/stair top steel at landings, edge-beam torsion, openings trimming bars, chairs/spacers, stock-length waste, laps of slab bars, parapet and masonry reinforcement.
- Stair: straight flight along +Z, landing and guard not modelled; slab edge at the stair top has no landing slab.
- R.X BOQ rows R02/R03/R04 (columns/slabs/beams) still count gross volume (overlap at joints); the net figure is in `RCSKEL.netVol` and the BBS density table. Not wired into R03/R04.
- Fabric Sheet ribbon button is still a stub. The R.X plan view does not draw bars.
- Visual check of the 3D rebar view was NOT done: screenshots hung at load average ~500. Geometry, counts and scene membership are asserted in tests only.
- Only 2-3 storeys, rectangular grids, axis-aligned members were tested.

## Regression on my private build (work_rcskel/out, shared chunks read-only, `site/` untouched)
parity 126/126 (first run 125/126, one undo step, passed on rerun), px2 149/149, freeai 88/88 (first run hit a 30 s screenshot timeout, passed on rerun), privacy 109/109.
link 43: NOT confirmed. `link_test.js` dies at `setInputFiles` (30 s timeout) on my build AND on the untouched sibling build `priv/index.test.html` under the same machine load (load average 300-500), so it is environmental here; it passed 43/43 earlier on `priv/` in a quieter moment. Please rerun it on the merged build.
Own tests: rcs_test.js 99/99, rcs_browser_test.js 48/48.
