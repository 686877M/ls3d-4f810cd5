# incoming28: separate the pump-station sample from the standard views

Made 2026-11-21 in a private copy (`scratchpad/work_separate/`). Nothing in `site/` or the shared chunks was touched. Apply with `apply.sh` (checks sha1 first, dry-runs every diff, then applies), then `sh make.sh`.

## What changed (short)
* The default project is now **Blank** (`DATA.tpl='blank'`). The pump station is a template you load on purpose: **"Pump station sample (mechanical)"** (id `sewage`, unchanged id, so old files and `tpNew('sewage')` still work).
* Decision: clean boot = **empty scene with the 60 m grid** (the existing blank template look). I did not add a starter room: the grid ground reads fine, and the demo sessions bring their own building.
* Loading any other template removes the sample (tested: parts 0, items < 46, activities 1, panes off, geo note empty).
* Old project **files** without a template flag (saved before this change) open as the pump-station sample. A **browser session** saved before this change (no flag in `lsv3-data`) is copied once to `lsv3-data-pre-sep`, then starts blank. Not tested against a real old browser profile.
* Hook for the demo / RC skeleton sessions: `tpRegister({id,n:[en,ar],title:[en,ar],d:[en,ar],rv:()=>({levels,grids,els,def})})` (also `TOX.registerTemplate`). It adds a chooser card on the clean base (empty scene, start milestone only). `tpRegister` cannot replace `sewage`. Their chunk must come after `c_templates.js` in the chain, or call it lazily. I did not edit any `demo_*` or `rcs_` file.

## Leak table (line numbers are in the CURRENT shared files; fix = what the patch does)
| # | Leak (default state before) | File:line | Fix |
|---|---|---|---|
| 1 | Default project = the station: `tpId()` returned `'sewage'` when no flag | c_templates.js:10 | default `'blank'`; boot code backs up and flags old sessions |
| 2 | Station 3D model (61 root meshes, 36 part groups) in every 3D view | c_templates.js (buildModel wrap, existing) + #1 | now empty at boot because #1 |
| 3 | 4D `buildSite()` always draws pit cylinder, fence 28x28, laydown, gate, even in blank/villa/office | c_4d.js:34,41-43 | hidden when not sample |
| 4 | Site-plan overlay `spG` / `SP.on` not cleared when leaving the sample | c_site3d.js:2-3 state, cleared from c_templates.js `tpEmptyScene` | cleared |
| 5 | N.X coordination checks 1-4 read `SPS`, `SITE.pipes` and `G` (tank overlaps, pipe/excavation, clearance, pipe crossings) | c_coord.js:5-14 | skipped when not sample |
| 6 | Output Center items 1 (sheet PDF), 2 (sheet SVG/PNG/DXF), 6 (design data), 8 (site plan) are sample content | c_outputs.js:3-12,17,20 | hidden/skipped when not sample |
| 7 | ZIP package adds the station sheet and `07_Site/site_plan.svg` | c_pack.js:15,21 | skipped when not sample |
| 8 | Geo defaults `GEO_D` (datum 104.95, note "well centre ...") returned for every project | c_geo.js:2-3 | neutral defaults (`gl:0`, empty note) when not sample |
| 9 | Notes register: pump capacity conflict, assumptions, limits | c_data.js:13 | `notesReg()` empty when not sample (wrapper in c_templates.js) |
| 10 | Camera-view caption "The whole station: wet well, outlet chamber ..." | v2_backup.html:310 `setCap` | caption empty when not sample |
| 11 | Panes that only describe the station: Views (camera presets, 360 points), Params (`renderEdit`), Parts (`PD`, c_ui.js:132), Assembly animation, Lift-station rebar, Site plan | c_ui.js:130-149, c_rebar.js, c_site3d.js | pane content hidden with a one-line note (`tpGate`) |
| 12 | Project title "Sample project (demo)" and sheet notes at boot (start page headline, header, exports) | v2_backup.html:179 `DR`, c_sheet.js:5 `SH` | set from the template at boot |
| 13 | Chooser card name "Sample project: pump station (demo)" | privacy_patch.py:36-37 | now "Pump station sample (mechanical)" (title stays "Sample project (demo)") |

Checked and already clean at boot: S.X survey points (`id,E,N,Z,desc` only), G.X layers (one empty layer), DC register (no docs), issues, MOM, R.X (no elements), P.X (start milestone only), Start page stats (0 alerts, 0%).

## Not changed (known, not fixed here)
* Data constants `SITE`, `NETS`, `MSITE`, `SPS`, `PD`, `GEO_D` and the station `buildModel` are still inside the 4.8 MB page. I did **not** build a lazy boundary: the station is still built once at boot and then emptied (`tpEmptyScene`), because splitting the 3.8 MB script was not safe next to the other sessions' edits. Cost: no size or boot-time gain.
* Export file names still start with `LiftStation_` in the ZIP package (`c_pack.js` 16-19); blank-project exports contain no sample content but keep the name.
* Start page "ديمو موجّه: مشروع 6868" button belongs to the demo session (it runs the old demo).
* The R.X Project Browser still lists the generic view names (3D, Level plans, Section A, side elevations) from the view table; they are empty views in a clean project.
* Pre-existing, unrelated: S.X survey pane prints `m [object HTMLInputElement]` in the "contour every" label.
* Dimensions/BOQ internals (`boq()`, `P`) still compute station numbers internally; nothing shows them when the sample is off.
* Other tabs not individually inspected beyond the screenshots and text scans below: Render Studio output, HX/HV deeper panes.

## Tests
Method: the page boots clean now, so every existing suite got ONE added statement in its `addInitScript`, right after `sessionStorage.setItem('xto-auth','1');`: `localStorage.setItem('lsv3-data', {"data":{...,"tpl":"sewage"}})`, which loads the sample at boot, the same state as before. No assertion was weakened. Diffs: `patches/tests_*.diff`.

| Suite | Result on the patched build (sample preloaded) |
|---|---|
| parity (126) | 126 passed, 0 failed, no assertion changed |
| px2 (149) | 149 passed (needs `px2_test_nx.js` beside it) |
| freeai (88) | 88 passed |
| privacy (109) | 109 passed, **one assertion changed on purpose**: "template card says Sample project" now checks the card name is exactly `Pump station sample (mechanical)` AND the project title still says `Sample project` (privacy_test.js:34) |
| sample_check (32) | 32 passed |
| charts merge (8) / snapshot (84) | 8 / 84 passed |
| demo smoke (`test_demo.js ... smoke`) | passed, FAILS 0 (only the smoke scenario was run, not run/stop/pause/entry) |
| Q.X qx_test (75) | 75 passed (run against `index.test.html`, not `index.html`: `index.html` has no `__lsv.ev`) |
| O.X p2tog_office (95) | 95 passed (preload is in `p2tog_harness.js`; the same harness serves the gis and plant suites, which I did NOT run) |
| link (43) | **not verified**: fails at `setInputFiles('#ifvbox input[type=file]')` timeout. The **untouched baseline build fails at the same step** in this loaded environment, so it is not caused by this change, but I have no green link run. (Earlier in this session's family link was 42/43 with a different step failing.) |
| NEW `incoming28/separation_test.js` | 19 passed: clean boot, 12+ tab types clean, sample loads/unloads, `tpRegister`, legacy file opens as the sample |

Machine load was 150-450 during the runs; several suites needed a rerun after environment errors (a Chrome crash during sample_check, a missing helper file in px2, a wrong page arg in qx), none was an assertion failure of the change.

## Before / after
`shots/before/*.png` and `shots/after/*.png`: default view of every tab type (`start model draft sched survey coord detect takeoff levels sim analysis office plant hx hv gis hub capture`). Before: pump station in R.X/S.X/N.X 3D, station parts, params, sample title. After: grid only, "Untitled project", 1 activity. Headless Chrome with swiftshader, test build.

## sha1 of the shared files this was diffed against
See `SHA1_BEFORE.txt` (19 files). `apply.sh` aborts on drift. Seen drift during the work: `patch_v3.py` changed in the shared folder (not touched by this patch set).
