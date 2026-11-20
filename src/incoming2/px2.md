# Parity wave 2: P.X (sched) 23 stubs and N.X (coord) 28 stubs made real (51 total)

Files: `c_px2_sched.js` (89 lines), `c_px2_coord.js` (93 lines), `px2_test.js` + `px2_test_nx.js` (Playwright, 149 checks, all pass). Lines are long, both chunks are far under 400 lines. No library, no network.

## Integration
In `patch_v3.py` line 43 insert both chunks right after `rd('c_parity_p6.js')`, before `rd('c_gantt.js')`:
`...+rd('c_parity_p6.js')+rd('c_px2_sched.js')+rd('c_px2_coord.js')+rd('c_gantt.js')+...` (copy the two files next to the other `c_*.js`).
Each chunk is an IIFE and finds its ribbon entry by program + tab + panel + English name (same `ov()` pattern as parity_p6), re-registers it with `XCMD(id,...)` (stub flag gone, "Working x of y" moves) and bumps `RIBP[type].built`.
Only two new globals: `window.p2x` (sched) and `window.nxx` (coord), the test hooks that return the numbers each dialog shows.
Run: `NODE_PATH=<dir with playwright-core> node px2_test.js <abs path to built index.html> [p6|nx]` (needs `px2_test_nx.js` in the same folder). Built and tested in a private copy (`/private/tmp/mod_px`); nothing in SP/site was edited except this folder.
Regression: `parity_test` 126/126, `mom_test` 27 pass, `issues_test` 40 pass, `regq_test` pass; `gantt_test` 36-37 of 37, its one failing check is a headless-Chrome timing check ("scroll redraw avg < 16 ms", fails the same way on the untouched build, and once a different check failed once and passed on re-run, so it is flaky).

## Stubs before -> after (XC entries with `.stub`)
| program | before | after | wired here |
|---|---|---|---|
| Primavera P.X (sched) | 31 | 8 | 23 |
| Navisworks N.X (coord) | 31 | 3 | 28 |

## P.X, 23 (each asserted in the test with a number)
- **Edit > Cut / Copy / Paste**: one activity with durations, wbs, crew, resources, roles, codes, UDFs, steps, relationships. Paste inserts a "(copy)" with a new `X<n>` id after the selected one, linked to the original predecessors (or the selected activity) and into the finish milestone; Cut = Copy + delete. Undo checked (24 -> 25 -> 24).
- **Edit > Assign Roles** (`ROLE,units/day[,rate]`; a new role needs a rate), **Activity Codes** (`TYPE=VALUE`), **Steps** (`name:weight;...`, `done N`, `undone N`: % complete = weight done / total, weights 2,3,1 -> 50 / 83 / 33 %). Undo/redo of roles checked.
- **View > Activity Network** (SVG boxes by logic level, red = critical; nodes = activities, edges = relationships), **Activity Usage Spreadsheet** (crew-days per 6 working days; total = sum of crew x duration = 586), **Resource Usage Profile** (SVG; peak crew, crew-days and assigned unit-days cross-checked), **Bottom Layout** (cycles the detail tab).
- **Project > Resource Assignments** (cost = units x working days x rate over resources and roles: 2x400x6 + 4x150x6 = 8400), **Thresholds** (`float,duration`; lists match an independent filter).
- **Tools > Store Period Performance**: freezes PV/EV/AC/SPI/CPI at the data date into `DATA.p6x.periods` (same date replaces, new date adds, sorted).
- **Enterprise > Data**: EPS and OBS trees (parent must exist, project assigned to an EPS node, WBS assigned to an OBS node, activity counts roll up the tree), Resources, Roles, Cost Accounts (assign to the selected activity; cost by account adds up to total), Activity Codes (value counts), Project Codes, User Defined Fields (numeric sum 3 + 4 = 7, text refused for numeric fields).
- **Admin > Financial Periods** (contiguous month/week periods covering start..finish), **Currencies** (`CODE,rate`, total converted).
Persistence: new activity keys `roles, codes, udf, steps, cacc` are in `SCHED_KEYS` (and `restoreSched` drops them on undo when the restored state has none); dictionaries are in `DATA.p6x` and the test checks they are in `projectJson()`.

## N.X, 28 (3D scene: `parts`, `selSet`, `camera`, `controls`)
- **Select, Select All, Select Same** (same material colour), **Sets** (selection sets, search sets by regex `NAME~regex` re-evaluated each time, load/delete), **Hide, Require, Hide Unselected, Unhide All** (required parts never hide; hiding is re-applied every frame, after `buildModel` and after the 4D animation re-shows a part; test checked), **Refresh** (rebuilds the model, hidden state kept).
- **Links** (http/https/relative only: `javascript:` refused; rendered with `rel=noopener`), **Quick Properties** (size, mesh count, colour overlay), **Field of View**, **Align Camera** (axes, top, front, iso; keeps distance), **Look Around** (yaw/pitch, camera stays), **Fly** (W S A D E Q), **Realism** (1.7 m eye floor), **ViewCube**, **Navigation Bar**, **HUD**, **Grid Mode** (1 / 5 / 10 m / off), **Redline Draw** (freehand over the view, stored normalized in `DATA.nx.red`).
- **Scripter** (both Home > Tools and Animation > Script), **Enable Scripts**, **Batch Utility**: a small safe command language, no `eval`: `select, selectall, hide, unhide, require, hideunselected, fov N, align AXIS, set NAME, save NAME, grid N`; stops at the first failing command; refused while scripts are off. Batch = `set1,set2|script`.
- **DataTools** (group model items by cat / ifc / unit), **NWD** (publishes `XTO_model.nwd.json`), **Viewpoints report** (HTML table of saved views + current: position, target, distance, yaw, pitch, FOV).
Camera commands stop the view tween, pause the Follow camera (`fPause=4`, the value the app uses after a drag) and flush OrbitControls damping, otherwise Follow / damping pulled the camera away again (found by the test).
Persistence: `DATA.nx` = sets, links, hidden, req, red (checked in `projectJson()`).

## Not done / limits (honest)
- **NWD is not an Autodesk NWD**: it is our own JSON container (`format: XTO-NWD-JSON`, says so inside). Nothing opens it in Navisworks.
- Select / Select Same work at part level (parts are groups of meshes; the app's own Parts pane selects whole groups). Select Same = same material colour of the first mesh.
- Realism is a gravity floor only: **no collision** with parts. Fly and Look Around are keyboard / dialog driven; the real Navisworks mouse fly mode is not copied.
- ViewCube is six buttons plus iso, not a rotating 3D cube. HUD / Quick Properties refresh every 300 ms.
- Redline strokes are a screen overlay (not tied to a saved viewpoint, not exported in the PDF/DXF sheets). Tested with real mouse events in the N.X tab.
- DataTools quantities are summed only when the group has a single unit; otherwise "—".
- P.X Resource Usage Profile / Usage Spreadsheet use the model's `crew` per working day (and, for the profile, assigned resource units); assignment costs still do not feed the earned-value BAC (BOQ based), as in the parity wave.
- Bottom Layout only cycles the existing detail tabs (general, relationships, status, productivity, key data, notes).
- Enterprise dictionaries are one project's data (no multi-project enterprise store): EPS/OBS describe where this project sits.

## Skipped (out of reach) and why
**P.X, 8 left:** Import XER, Import XLSX (parsers; the XER export exists but a safe round-trip importer needs its own test set), Renumber Activity IDs (ids are referenced by fixed maps such as `actOfItem`, unsafe, same as wave 1), Spell Check (no dictionary), Set Default Project (single-project app), Security Profiles, Admin Preferences, Admin Categories (no multi-user admin model: `Users` is a simple team list; a table of permissions that nothing enforces would be a fake).
**N.X, 3 left:** Tag ID (tags are the existing "3D note"; a second numbering system would clash), FBX (cannot be validated here: no FBX reader available, so a writer would be unproven), Google Earth KML (the model has no lat/lon georeference, a guessed placemark would be invented data).
**Ideas from the brief not taken because they are not ribbon stubs or have no model behind them:** calendar editor, relationship-type table, float paths, what-if copies, baseline variance table, S-curve, schedule check report (partly exist: Check Schedule, Claim Digger, Key data S-curve), clash rule sets / grouping / status workflow, TimeLiner linking, appearance profiler, section planes, measure tools (all already wired in earlier waves or outside the stub list).
