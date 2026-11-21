# se_ structural design engine (gaps 2, 3, 6, 12 partly, 13)

DEMONSTRATION / PRELIMINARY. Not a design approval. Said on screen and on every report (top and bottom).

## Wire-up (you merge)
- `chain.diff`: one replacement in patch_v3.py: `rd('c_rc_ui.js')+rd('sttlocal.js')` -> insert `rd('se_codes.js')+rd('se_loads.js')+rd('se_members.js')+rd('se_members2.js')+rd('se_api.js')+rd('se_ui.js')` between. Must stay BEFORE rs_ui.js (it freezes TOX).
- Globals added: prefix `se`/`SE`/`seStructDesign`... no existing file edited. API on frozen TOX: `structDesign, structTakeDown, structPreSize, structCombos, structSlabToBeam, structContBeam, structReportHtml, structReportCsv`.
- Pane `pane:struct`, command `se_open` (+ se_take, se_slab, se_beam, se_col, se_ftg, se_stair, se_wall, se_set, se_pre, se_rep). Ribbon: Calculate tab group "Structural design" and R.X structure tab. XDESC en+ar on every command and every pane button (tested).
- R.X hand-over: `seApplyRX(rec)` writes b/h (col: w,d; beam: w,h) and `e.se={type,code,As_req_mm2,bars,stirrups,util,pass}` on the selected R.X element. rcskel can read `e.se` or call `TOX.structDesign` directly.

## API
`TOX.structDesign({member,type,code:'ecp'|'ec2'|'aci',fc,fy,...})` -> `{member,type,code,As_req_mm2,bars:[{n,dia,pos,spacing?}],stirrups:{dia,spacing,legs}|null,util,pass,notes,checks[]}` (`details`, `spec` non-enumerable). type = beam | slab1 | slab2 | column | footing | stair | wall | settlement. Bad input never throws: `{error,pass:false}`. pass <=> every check util <= 1.
Units mm, N, MPa, kN, kN*m, m for spans. fc is the code's own grade: ECP fcu (cube), EC2 fck, ACI f'c.

## Implemented (formulas listed in the report and in the Report tab)
- Combinations: ECP style 1.4D+1.6L (+ 0.8(1.4D+1.6L+1.6W), 0.9D+1.3W marked verify; NO seismic), EN 1990 6.10 and 6.10a/b (psi0 .7, xi .85, + W/E), ASCE 7 (1.4D; 1.2D+1.6L; W/E forms). Selectable independent of the design code.
- Take-down: tributary area per column (half bays), slab, beam web, wall line loads, column own weight, per floor cumulative D/L/Nser/Nu, live reduction none/EN/ASCE, beam line loads from slabs (triangle/trapezoid equivalents).
- Flexure rect/T/doubly per code (stress block). ECP: 0.67fcu/1.5, a=0.8c, fy/1.15. EC2: alpha_cc .85 (UK NA; 1.0 option), lambda .8, ecu .0035. ACI: .85f'c, beta1, phi .9 with strain-based phi in capacity. Ductility c/d <= .45 (ACI .4286).
- Shear + stirrups per code, deflection (Branson Ie + long-term factor, limits L/250 total and L/350 after partitions), crack width (EC2 formula for ECP and EC2, Gergely-Lutz for ACI).
- One-way slab (elastic strip envelope with pattern live load, or approximate coefficients); two-way slab coefficients computed from a thin-plate finite-difference solution (3 grids + extrapolation), edges simply supported / continuous; continuous beam solver (three-moment, pattern loading by superposition).
- Columns: interaction diagram by strain compatibility, uniaxial radial utilisation, biaxial exponent method, slenderness (ACI magnifier; ECP / EC2 additional eccentricity), bars + ties.
- Isolated footing (size by equal projections, bearing with eccentricity, one-way shear, punching, flexure, auto depth), stairs, cantilever retaining wall (Rankine: overturning, sliding, bearing, stem/toe/heel), settlement (elastic + 1-D consolidation, 2:1 spread), pre-sizing rules of thumb (labelled).

## NOT verified against the code text (marked `verify` in outputs; no clause numbers are printed anywhere)
ALL ECP items: 0.67fcu/1.5 block with a=0.8c, c/d<=.45, Ec=4400 sqrt(fcu), fr=.6 sqrt(fcu), qcu .24 (beams) / .16 (slabs, footings) sqrt(fcu/gc), qmax .7 sqrt(fcu/gc), stirrups q-.5qcu, min Asw/s .4b/fy, As,min .225 sqrt(fcu)/fy (>=1.1/fy), slab min .6/fy (>=.15%), column .35fcu Ac+.67fy As, min eccentricity max(.05h,20), slenderness 15/10 and He^2/(2000h), punching .316 sqrt(fcu/gc), earth load factor 1.4, tie spacing, ECP crack check (EC2 formula used instead of the ECP method), ECP combos with wind, ECP slab coefficients (plate theory used, not the ECP tables). ECP seismic and wind NOT coded.
## Simplified (state it in the demo)
Plate edges are fully fixed or simply supported (no partial restraint, no torsion steel); rectangular footing steel is uniform (no band rule); frame analysis is beams only (no 2D frame, no sway second order, ACI sway magnifier approximate); wall ignores water and passive resistance unless Df given; beam T flange width is user input; EC2 nominal curvature uses Kr=Kphi=1; settlement has no layered elastic and no immediate-consolidation time; crack service moment defaults to Mu/1.5 when not given; shear in columns not checked; development length, laps and curtailment are NOT here (rcskel).

## Tests (files in this folder)
- `se_test_unit.js` node, no browser: 100/100 pass. Hand-evaluated textbook formula forms (EC2 K/z method after Mosley-Bungey-Hulse, ACI Rn/rho form after MacGregor-Wight, Clapeyron three-moment and an independent slope-deflection solve, Rankine and consolidation after Das, Iw after Bowles, Timoshenko plate coefficients as I recall them 0.0479 / 0.0812 / 0.1017 SSSS, 0.0231 / 0.0513 clamped square: NOT re-read from the book this session). Tolerances stated per line (0.01 % to 6 %). Property tests: required steel never decreases with load for 9 member kinds x 3 codes; pass == (util <= 1); absurd loads FAIL. ECP expected values equal the implemented formula, NOT a published ECP table.
- `se_test_ui.js` playwright (`NODE_PATH=<pw/node_modules> node se_test_ui.js <index.test.html>`): 38/38. Lazy init, commands + XDESC en/ar, every pane button titled, each tab runs, take-down -> footing, solver -> beam, R.X apply, print/report, Arabic, cross-check against the existing `flex` sheet, no page errors.
- Private-build regression: parity 126/126, px2 149/149, freeai 88/88, privacy 109/109. `link` (43): NOT verified: the test times out at `#ifvbox input[type=file]` setInputFiles on my build AND on the current shared `site/index.test.html` (same error, 6 PASS before it), so it is not caused by se_ chunks but I have no green run. Machine was heavily loaded.
- NOT tested: visual look of the pane (no screenshot: headless screenshot timed out), narrow/mobile width, dark theme, real printing, large take-down grids (>10 bays), plate solve time r=2 about 0.5 s.
