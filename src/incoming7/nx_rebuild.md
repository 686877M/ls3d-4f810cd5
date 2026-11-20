# N.X (Navisworks tab) rebuild: TimeLiner, Navigator, Clash Detective, Viewpoints, Sections, Animator, Tag ID, layout

Chunks (each under 400 lines; long lines): `c_nv_core.js` (71), `c_nv_tl.js` (67), `c_nv_clash.js` (43), `c_nv_view.js` (63). No library, no network. Prefix `nv`. Tests: `nv_h.js` (harness) + `nv_test_a.js` (core + TimeLiner), `nv_test_b.js` (clash), `nv_test_c.js` (viewpoints, sections, animator, Tag ID), `nv_test_d.js W H` (layout + ribbon + stub count).

## Integration (end of the chain)
In `patch_v3.py` line 43 append, **after the last chunk** (`rd('c_idle2.js')` at the time of writing), in this order:
`+rd('c_nv_core.js')+rd('c_nv_tl.js')+rd('c_nv_clash.js')+rd('c_nv_view.js')`
Copy the four files next to the other `c_*.js`. They must come after `c_prog_more.js`, `c_px2_coord.js`, `c_4d*.js`, `c_hub.js` (TOXAPI), `c_gantt.js`. Tested by injecting the four chunks just before `window.__lsv={ev:` in the built `index.html` (same place).
Run: `NODE_PATH=<dir with playwright-core> nice -n 19 node nv_test_a.js` (also `_b`, `_c`, `_d 1500 860`, `_d 1280 720`); each takes the built page path from the harness default `/private/tmp/mod_nv/site/index.html`: edit the `opt.page` default in `nv_h.js` first.

## What it adds
- **Navigator** `pane:nvnav` (cmd `nv_nav`): Selection Tree (3D parts by category, R.X elements by level / kind), Sets (Selection Sets and Search Sets that store the query and re-run it), Find Items (AND conditions on Name, Category, Kind, Level, Type, ID, Colour, Hidden, Mesh count, Size X/Y/Z, Centre Y; ops = != contains not contains > < >= <= matches), Properties (3D part, R.X element with its fields, or the IFC viewer selection class), Appearance Profiler (rules colour / fade by property).
- **Override engine** (`nvFrame`, hooked into `siteFrame`): layers `tl` (TimeLiner), `ap` (profiler), `cl` (clash), `an` (animator show). Colours/opacity go on **cloned materials**, so the shared materials are never changed; rvBuild rebuilds are re-covered next frame; visibility respects Hide / Require from px2.
- **TimeLiner** `pane:timeliner` (cmd `nv_timeliner`): tabs Tasks / Data Sources / Configure / Simulate. Tasks table: name, planned start/end, actual start/end, type (Construct / Demolish / Temporary), status (Planned / In progress / Delayed / Finished / Finished late), attached items (parts, R.X elements, sets, `lv:Level 1`, `kind:wall`, `cat:...`), cost. Gantt with planned (top) and actual (bottom) bars and the simulation date line. Import from P.X (`ACT`, replaces earlier P.X tasks; keys from `a.parts` = the 4D links; actual dates from % complete) and CSV (header `Name,PlannedStart,PlannedEnd,ActualStart,ActualEnd,Type,Cost,Attach`), CSV export. Task types: appearance before / during / after = hidden | model | colour + opacity. Simulate: play / pause / step / rewind, date slider, speed (intervals per s), interval (days), start / end override, loop, basis planned / actual / planned against actual (late = pink), date overlay on the 3D view, unattached items as model / hidden / grey. Opening the pane with no tasks imports from P.X once.
- **Frames hook for Render Studio:** `TOXAPI.timelinerFrame(date)` (ISO string, ms or Date) sets the simulation date, renders and returns `{date, png (data URL), w, h}`; `TOXAPI.timelinerRange()` returns `{start, end, stepDays}`. The Simulate tab has "Export frames" (downloads up to 40 PNGs).
- **Clash Detective** `pane:nvclash` (cmd `nv_clash`): Rules (ignore same category, minimum overlap, ignored pairs), Select (tests: A vs B = everything / saved set / selection snapshot; Hard or Clearance + tolerance; Run, Run all = batch), Results (status New / Active / Reviewed / Approved / Resolved kept across re-runs, vanished = Resolved, group by item / category pair / status, filter, click = fly to the clash and colour A red, B orange, dim the rest), Report (HTML view / download, CSV).
- **Viewpoints** (`pane:nvview` tab 1): save (camera, FOV, hidden items, section planes), Go with an animated glide, Jump, Update, Play all (animated sequence).
- **Section planes** (tab 2): real clipping (`renderer.clippingPlanes`), X / Y / Z planes with slider and flip, add plane, box around selection (6 planes), saved in viewpoints.
- **Animator** (tab 3): tracks Move (m), Rotate (deg), Show / hide, Camera; keyframes at times, linear interpolation, play (real time) / loop / slider / reset (positions restored exactly).
- **Tag ID**: numbers the 3D notes (`DATA.pins[].tid`, stable, new notes get the next number, pin text prefixed `#n` on the pin only).
- **Layout** `WL.coord`: Navigator left, 3D view centre, Properties + sets right, TimeLiner full width at the bottom. Existing users with a saved layout keep theirs.
- **Ribbon**: rebinds Selection Tree, Find Items, Properties, Clash Detective, TimeLiner, Animator (Home and Animation), Save Viewpoint, Views, Play, Tag ID, Output > Clash report; adds Manage Sets, Appearance Profiler, TimeLiner Simulate, Section Planes (3D), Section Box from Selection. `RIBP.coord.built` / `tot` are kept equal to real counts (113 / 115).
- Persistence: `DATA.nv` = sets, ap, vp, sec, anim, tl, clash (rides in the project JSON with `DATA`).

## Stubs (coord ribbon entries with `.stub`)
Before 3 of 110 (Tag ID, FBX, Google Earth KML). After **2 of 115** (FBX, Google Earth KML). Tag ID was wired here. FBX: no reader to validate a writer. KML: no verified geo reference in the model.
Honest note: before this work the stub count was already low because "built" meant "opens something": TimeLiner opened the 4D schedule tab, Clash Detective a flow command, Selection Tree / Properties the Parts / Edit panes, Animator the explode animation, Views the saved-view tab. Those entries now run the real tools above.

## Tests (headless Chrome swiftshader, one at a time, nice 19; every check asserts an effect)
nv_test_a 48 pass, nv_test_b 32 pass, nv_test_c 38 pass, nv_test_d 24 pass at 1500x860 and 24 at 1280x720 (141 checks). Regression: `px2_test.js <built page> nx` (the earlier parity wave N.X test) 85 passed, 0 failed on the build with these chunks; it reports `coord stubs left: 2`.
Layout test asserts: exactly four windows open, all inside the viewport, none overlapping, TimeLiner full width at the bottom, 3D view at least 40% wide and 250 px high, Navigator and Properties at least 220 px wide.

## Limits (honest)
- Clash uses **axis aligned world boxes of the meshes**: a rotated pipe is tested by its box, a diagonal pair of pipes can report a clash that touches only boxes. The report says so. Hard distance = minus the smallest box overlap.
- Selection Tree selects at part level for the 3D model (parts are groups), element level for R.X. IFC viewer elements are shown in Properties (class, id, name) only; they are not items for sets / TimeLiner / clash.
- TimeLiner attaches 3D parts and R.X elements. 14 of 24 P.X activities have no linked part, so their tasks attach nothing until the user attaches items (that is data, not a bug). Actual dates imported from P.X are derived from % complete (start = planned start when % > 0, end = planned end when 100 %).
- Frame export downloads PNGs one by one (browsers may ask to allow multiple downloads); no video encoder here. Render Studio should call `TOXAPI.timelinerFrame`.
- Animator moves and rotates relative to the base pose and restores it on Reset; it does not know about the existing explode / assemble animation, so do not run both together. R.X mesh animation is lost when R.X rebuilds.
- Section planes are real 3D clipping; the existing "Enable Sectioning / Plan cut / Section Z" commands are the 2D drawing sections and were left as they are.
- Not copied from Navisworks: Presenter materials and lighting editor, Autodesk rendering, point-cloud / laser scan tools, collision for walk mode, full BCF-like Comments panel beyond the existing issues, Quantification take-off beyond the existing BOQ, clash rule templates (only 3 rules), clash by true triangles.
- Mouse fly / walk are the existing px2 keyboard / dialog versions; navigation modes were not re-tested here.
