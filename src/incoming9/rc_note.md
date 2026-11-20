# F.X Reality Capture tab: integration note (incoming9)

New tab type `capture`, name **F.X Capture** (letter F was free), icon `XI.tx_rc`, group 2 (next to S.X and G.X).
Default layout: the shared G.X map (`pane:gismap`), mission panel (`pane:rcmis`), data panel (`pane:rcdata`).

## Files (5 chunks, one global scope, every name starts with `rc` / `RC`)

| File | Lines | What |
|---|---|---|
| `c_rc_core.js` | 145 | state, camera maths, mission generators (nadir grid, double grid, oblique, orbit, corridor), statistics, warnings, terrain following through `gmElev`, coverage count, map overlay, **all mission exports** and the mission brief |
| `c_rc_import.js` | 60 | GPX, NMEA, CSV/TXT column mapper, KML/KMZ, GeoJSON, DXF, LandXML, JPEG EXIF + XMP, LAS 1.2 to 1.4 |
| `c_rc_terrain.js` | 71 | TIN, first-estimate DEM, contours, slope, spot, profile, sections, cut and fill, accuracy, coordinate fits, processing hub, world file, ASCII grid, GeoTIFF |
| `c_rc_bld.js` | 79 | building / site capture planner: OpenStreetMap footprint, roof grid + rings, sun, wind, line of sight, 3D extrusion, building brief |
| `c_rc_ui.js` | 131 | tab registration, panels, ribbon, map picking, agent tools, phrases, TOXAPI, Output Center items |

Lines are long, in the style of the other chunks. No library added.

## How to insert

End of the chain in `patch_v3.py`, in this order, after `rd('c_idle2.js')`:

```
+rd('c_rc_core.js')+rd('c_rc_import.js')+rd('c_rc_terrain.js')+rd('c_rc_bld.js')+rd('c_rc_ui.js')
```

They need (already earlier in the chain): c_gis / c_gis2 (GM, gmPaint, gmFinish, gmClick, gmElev, tmFwd, tmInv, utm), c_survey (svTIN, svZ, svContours, svD, svBuild), c_env (sunPos, eHM), c_issues (isUnzip), c_pack (xZip, xBytes), c_ifc (xlsx), c_mod_cxsx_cad_a (PCX.rep), c_prog (progReg), c_agent2/3 (xaPre, xaTool, XAM, TABK, say2), c_bridge (BRT, brTool), c_hub (TOXAPI), c_outputs (OUTL).

Wrapped existing functions (each calls the original): `gmPaint` (overlay, only while the capture tab is in front), `gmFinish` and `gmClick` (only while a capture pick is armed), `rcPaint`, `xaTool`, `brTool`, `xaPre`, `wxDefs`. `window.TOX` is re-frozen with the new functions. localStorage keys: `xto-rc`, `xto-rcb`.

## Agent and voice

Tools in `XAM.tools`, `BRT`, `TOXAPI` / `window.TOX`: `plan_mission`, `plan_building`, `import_survey_file`, `make_contours`, `compute_cut_fill`, `accuracy_report`, `export_mission` (+ camelCase aliases and `captureState`). Phrases go through `xaPre` (typed or spoken), Arabic and English, for example: "plan a drone mission double grid gsd 2 cm overlap 80 70", "خطط مهمة طيران شبكة ارتفاع 60", "خطط تصوير المبنى بالدرون", "كنتور كل 0.5", "قطع وردم عند منسوب 12", "accuracy report", "export the drone mission as litchi". `open_tab` accepts `capture`.
Output Center: "Flight plan" and "Earthworks report" are appended with the next free ids.

## Tests

```
NODE_PATH=pw/node_modules node pw/rc_test.js "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" /tmp/rc_index.html
```

`rc_test.js` loads `rc_page.js` and `rc_bld_page.js` from its own folder (copy the three into `pw/`). One headless Chrome, about 40 s. Network is mocked: tiles aborted, elevation answered by a fixed slope, Overpass and Open-Meteo forecast replaced inside the page.
Result on the private build (2026-11-20): **330 checks, 330 pass** (`rc_test_report.txt`). Each numeric check carries its hand calculation in its name.

## Honest report: what was and was not verified

Verified by test against hand calculations: GSD, footprint, spacing, line and photo counts for a 400 x 300 m rectangle (11 lines, 297 photos, 4716.8 m, matches the worked example in REALITY_CAPTURE_PLAN.md), double grid, margin, orbit, corridor, terrain following on a mocked slope, round trips of KML, GeoJSON, CSV, Litchi, QGC plan, Mission Planner file and the DJI KMZ (zip + well-formed XML + coordinates), every importer on hand-built files (including a hand-built JPEG, LAS 1.2 / 1.3 / 1.4 and GeoTIFF), prism and wedge volumes (grid and TIN), RMSE of a known set, conformal and affine fits of known transforms, sun elevation at solar noon on the solstices and equinox, lit / shadow side of a box, ring geometry and shot counts, wind factors, line-of-sight thresholds.

NOT verified, and labelled so in the interface:
- **DJI WPML KMZ**: built from the public structure from memory of the element names; not validated against a schema, not opened in DJI Pilot 2, not flown. File name carries `NOT_VALIDATED`. Drone and payload enum values are stored fields (`RC.m.droneEnum`, `droneSub`, `payEnum`, default 77 / 0 / 66 from the research note) with no input box yet.
- **Litchi CSV**: header follows the research note; not compared with a real Mission Hub export.
- **QGC plan / Mission Planner file**: structure and commands (22, 178, 205, 16, 206, 201, 203, 20) from memory; parsed back by my own parser only, never opened in QGroundControl or Mission Planner.
- **Camera presets**: three presets with values from the research note (marked [M] there). The panel says "CHECK YOUR CAMERA" and every field is editable.
- **Real files**: no real drone photo, real LAS, real LandXML, real GeoTIFF or real NMEA log was available; all importer tests use files built by hand to the format rules. Real files will show cases these miss.
- **Live services**: Overpass, Open-Meteo forecast and elevation were only mocked. The Overpass query and the forecast parameter names are from memory.
- **ODM option names and docker command** in the processing hub are from memory; the panel says to check them against the ODM version.
- `sunPos` (c_env.js, reused) agrees with 90 - latitude ± 23.44 to 0.3 deg at solar noon; azimuth was only range-checked.
- Existing test `pw/t112.js` shows a drag timeout ("drag err2") on this build; it shows the same on a build without these chunks. `t111.js` passes.

Known limits by design: LAZ refused (needs a LASzip decoder); GeoTIFF only uncompressed, strip-based, classic TIFF, band 1; orthomosaic only as JPG/PNG + world file; TIN capped at 4000 points (thinned, said in the surface note) because the survey triangulation is simple; DXF blocks, splines and binary DXF not read; concave areas are flown straight across; corridor terrain following keeps every sample as a waypoint; surface-against-surface volume uses a composite TIN (approximate where edges cross); the processing hub prepares a job file only, because `tox_bridge.py` has no processing route; building rings are circles around the footprint centroid (long thin buildings get uneven stand-off, the far-side GSD is in the result); obstacle and line-of-sight tests are 2.5D on map footprints and know nothing about trees, cables, cranes or masts; the 3D extrusion sits at the scene origin, not at the project position; the legal height limit and the wind limit are empty until the user types them.

Follow-ups not done: input boxes for the DJI enum values; facade (vertical lawnmower) mission; GCP placement proposals; EGM geoid; bridge route to NodeODM.
