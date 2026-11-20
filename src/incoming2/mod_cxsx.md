# mod_cxsx: AutoCAD C.X and Civil 3D S.X parity wave 2 (26 + 33 = 59 stubs made real)

Files (each < 100 long lines): `mod_cxsx_cad_a.js` (+ shared helper object `PCX`), `mod_cxsx_cad_b.js`, `mod_cxsx_sv_a.js`, `mod_cxsx_sv_b.js`,
test `mod_cxsx_test.js` + `mod_cxsx_test_cad.js` + `mod_cxsx_test_sv.js` (Playwright, 105 checks, all pass; the 40 old `parity_test.js cad` checks still pass on the combined build).
No library, no network. Only new top-level name: `PCX` (everything else is inside IIFEs).

## Integration
In `patch_v3.py` add after `rd('c_parity_p6.js')`, in this order (cad_a defines `PCX`, the others use it):
`+rd('mod_cxsx_cad_a.js')+rd('mod_cxsx_cad_b.js')+rd('mod_cxsx_sv_a.js')+rd('mod_cxsx_sv_b.js')`
(copy the four chunks next to the `c_*.js`). Same pattern as `c_parity_*.js`: entry found by program + tab + panel + English name, re-registered with `XCMD`, `RIBP[type].built++`, undo through `cadCommit()`/`persist()`/`hiSnap()`.
Test: `NODE_PATH=<dir with playwright-core> node mod_cxsx_test.js file:///.../site/index.html [cad|sv]` (the three test files must sit together).
Extra ids touched by nobody else: none. If another chunk also wraps `cadEntSvg`, `dimEnt` or `cadCommit`, load order matters (mine wrap, they call the previous function).

## Stubs before -> after
| program | before | after |
|---|---|---|
| AutoCAD C.X (draft, 173) | 61 | 35 (26 made real) |
| Civil 3D S.X (survey, 115) | 37 | 4 (33 made real) |

## C.X (26)
**Draw/Modify:** Region (rect / closed polyline / circle -> filled polyline `rg:1`, area; circle keeps exact pi r^2 in `ar`), Ray (finite 5000 long, `ray:1`), Blend (cubic Hermite between nearest ends of two lines, tangent at both ends).
**Text/Annotate:** Single Line (C: prefix centres), Find (selects; `find|replace` replaces), Dim Style (`NAME th= k= pr= pre= suf=`, stored in `cadD().dst`, applied to selected dims, new dims use the current style; drawn text = pre + length x k + suf), Update (re-copies style onto dims), Add Leader (arrow + elbow landing + text, one group, roles `lr`), Align (leaders: texts to the first leader's y, tip stays), Hyperlink (`e.hl`; only http/https/mailto accepted).
**Parametric (16):** stored in `cadD().cons` (saved, undoable): Horizontal, Vertical, Fix, Parallel, Perpendicular, Collinear, Equal, Coincident, Concentric, and dimensional Linear, Aligned, Radius, Diameter (named parameters d1, d2..), Delete Constraints, Parameters Manager (table + `d1=15` edit re-solves), Show/Hide (glyph drawn on constrained objects). A relaxation solver (60 passes) runs after each command and on every `cadCommit`, so editing a constrained object pulls the others back.

## S.X (33)
Data in `DATA.sv.x` (saved with project). Results open as a small table overlay with CSV button (`PCX.rep`; last result kept in `PCX.last`).
**Survey:** Point groups, Linework codes, Figures (polylines into CAD), Survey Query, Networks (traverse with Bowditch adjustment, precision ratio, adds T1.. points), Survey Databases (named point sets), Import survey data (PNEZD-style column formats).
**Ground/surface:** Feature Lines + Modify Feature Line (raise/set/grade; optional densified points so the TIN follows the line), Slope analysis (class table, plan + 3D area), Elevation analysis (exact band clipping), Watershed (steepest-descent sinks, catchment areas), Add Labels / Surface labels / Add Tables (written into the CAD drawing), LandXML export + Import LandXML (CgPoints, TIN surface Pnts/Faces, alignments as Line/Curve).
**Design:** Alignments (tangents + circular fillets, stationing) + Modify Alignment (move/insert/delete PI, R), Intersections (stations, angle), Profile (ground profile from the TIN), Modify Profile (PVIs, parabolic vertical curves, cut/fill depth table), Profile View (drawn in CAD with vertical exaggeration), Sample Lines (+ cross-sections extracted every step, drawn in CAD), Assembly, Corridor + Modify Corridor (end-area cut/fill volumes with daylight slopes), Grading + Modify Grading (pad + cut/fill slopes, volumes by 0.25 m grid), Parcels (area, perimeter, centroid, drawn) + Modify Parcel (subdivide by area with a straight line), Pipe Network (+ Modify: invert / slope propagation, slope and cover checks).
Numbers checked in the test against closed-form values (e.g. fillet length 195.708, vertical curve Z 100.9, corridor 8.0 m2 / 800 m3, pad grading 484 m3 within 1.5%, parcel split 2000 / 3000 m2, traverse 1:2001).

## Not done, and why
**C.X (35 left):** Gradient, Wipeout x2 (need fill/mask rendering in the SVG painter), Block Edit / Edit Block / Define Attributes (no block definition store), Attach / Clip / Underlay / PDF Import / Link Data / Link Table (external files or databases), Check Spelling (no dictionary), Arc Length / Align (arcs are polylines, no arc entity), Tangent / Smooth / Symmetric / Angular / Convert / Linear-by-reference constraints (need arc/spline entities and a real solver), Hidden / Conceptual / Sketchy / Shades of Gray (3D view only), Viewport Configuration, Tool Palettes x2, Edit Aliases, Configure, Layer Translator, Load Application, Run Script, Batch Plot, Page Setup, Plotter Manager, DWF (UI or file formats, outside a browser).
**S.X (4 left):** Panorama and Tool Palettes (UI panels only), Pressure Network (needs a hydraulic model, not a data table), Attach image (no raster pipeline for the map).

## Honest limits
- Constraints: lines and circles only; over-constrained or conflicting sets are reported (residual) but not resolved; arcs, polylines, rectangles are not constrainable. The solver is iterative relaxation, not a full geometric solver.
- Dim Style changes the drawn text and its copied fields; DXF / SVG paper export of dimensions still uses the old text.
- Region is a polygon flag, not a true region: no boolean ops here, a circle is a 72-gon with exact area stored.
- Feature lines: densified points approximate a breakline; the TIN is NOT constrained to follow it exactly.
- Alignments: no spirals, curves only at PIs (R at all PIs the same), radius too big for the tangents is refused. Intersections sample the alignment every <= 0.5 m (exact for tangents).
- Profile/Corridor/Grading read ground from the TIN; parts outside the TIN are skipped (ground null). Corridor is a single symmetric assembly, flat formation with crossfall, end-area method, no superelevation, no subassemblies, no material layers. Grading uses a 0.25 m grid (error about 1%), Euclidean offset so corners are rounded.
- Watershed: no flat-area or depression handling. Slope/elevation use TIN triangles as they are.
- Surface and point data come from the point list only; no point-cloud or LandXML alignments import (export only).
- Pipe network: invert / slope / cover table only, no hydraulics (HGL, flow) and no network drawn in 3D.
- Not tested: Arabic strings, overlay appearance, file chooser of Import LandXML (the paste route is tested), mouse interaction with the CAD canvas (commands run from the ribbon ids).
- `Import survey data` expects whitespace/comma separated columns; quoted fields are not handled.
