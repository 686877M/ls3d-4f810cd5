# R.X wave 2: 71 more ribbon stubs made real (model: 138 -> 67 stubs left)

Files: `rvx_core.js` (92 lines), `rvx_arch.js` (64), `rvx_annot.js` (61), `rvx_views.js` (71), `rvx_data.js` (60), `rvx_test.js` (Playwright, 203 checks, all pass).
Lines are long; every file is far under 400 lines. No library, no network, no vendor code.

## Integration
In `patch_v3.py` line 43 add the five chunks right after `rd('c_parity_p6.js')`, in this order (core first, data after views):
`...+rd('c_parity_p6.js')+rd('c_rvx_core.js')+rd('c_rvx_arch.js')+rd('c_rvx_annot.js')+rd('c_rvx_views.js')+rd('c_rvx_data.js')+rd('c_gantt.js')...`
(copy them next to the other `c_*.js`, renamed `rvx_x.js` -> `c_rvx_x.js`). They need `c_parity_rvt.js` (uses `PXR`, the parity Tag chunk's `RVX.build.tag`) and the plan code in `c_rvplan.js`.
Only one new top-level name: `P2R` (shared helpers: `ov`, `sel`, `kind`, `plan[kind]`, `rowFns`, `pre`, `vis`, `flt`, `net`, `sheetSvg`, `takeoff`...). Everything else is inside IIFEs.
Run: `NODE_PATH=<dir with playwright-core> node rvx_test.js file:///.../site/index.html [core|arch|annot|views|data]` (default page `../../index.html`). Parity regression (`parity_test.js rvt`, 46 checks) also still passes with these chunks in.

## How it plugs in (no edits to existing chunks)
Same pattern as the parity wave: each ribbon entry is found by tab + panel + English name, re-registered with `XCMD`, `RIBP.model.built` bumped, undo = `rvPush()` then `rvChanged()` (`rv_undo`, tested).
Wrapped (reassigned) functions: `rvChanged` (runs `P2R.pre`: curtain data, global parameters, tag follow), `rvQty` (floor area/volume net of shafts and Cut Geometry), `rvBuild` (curtain grid lines, drops the pane of wall openings, applies filters and object styles), `rvpGeo` (filters, no window symbol for wall openings), `rvpSvg` (overlay of the new 2D / site / component kinds, tags, thin lines, hidden lines), `RVX.rows` (Project Browser rows), `rvBrowser` (saved views are clickable).
New element kinds live in `RV.els`, so they save, undo and export with the model. Non-geometry items (views, templates, sheets, legends, revisions, worksets, options, materials, styles, global parameters, spaces, filters, monitor snapshot) are meta kinds (`P2R.META`) stored the same way.

## Stubs before -> after (RIBM entries of type model whose XC has `.stub`)
138 -> 67 (total 280, built 213). 71 commands, each run from its ribbon id and asserted on a number or structure.

## Implemented (71)
**Modify / Manage (12, core):** Align (x=v / z=v / x=RP1 reference plane / primary selection; c, min, max edge), Join (collinear walls merge and re-host openings; non-parallel walls meet at the corner), Cut Geometry (floor net area and volume minus a cutter; run again to uncut), Copy / Cut / Paste (wall travels with openings, paste on the active level centred on x,z), Match Type, Select by ID (ids or a kind), Find/Replace (tags, model text, room names, level names), Shorten (steel beam end), Copy/Monitor (snapshot, then moved / changed / deleted / added report + CSV), Reconcile Hosting (openings pulled back inside a trimmed wall, orphans removed).
**Architecture / Structure (14, arch):** Curtain System / Curtain Grid / Mullion (panels = nu x nv, mullion length and volume, 3D grid lines, recomputed when the wall changes), Room Separator (splits a room, areas add up), Tag Room, Area Boundary, Area (Gross Building / Rentable minus shafts), Tag Area, Opening Wall (cuts the wall: area, volume, plan pieces), Shaft (multi-level) and Vertical (one level) openings (floor net area), Ref Plane (named, used by Align), Brace (between two columns, 3D length), Boundary Conditions (fixed / pinned / roller / free on columns and foundations).
**Annotate (12, annot):** Detail Line, Region (hatch solid / diag / cross), Revision Cloud (scallops, current revision), Repeating Detail (count), Insulation (loops, area), Symbol (north arrow etc.), Spot Coordinate (E = x, N = -z), Spot Slope (stair / ramp / roof %), Beam Annotations, Tag by Category (prefix + start number), Material Tag, Keynote (+ legend). Every tag, including Tag All, is now drawn in the Floor Plan SVG.
**View / Collaborate / Manage (13, views):** Filters (hide / isolate / show by kind, 3D + plan), Thin Lines, Show Hidden Lines (dashed foundations), View Templates (save / apply cut, layers, thin, filters), Duplicate View, Callout (cropped child view + bubble), Scope Box (crops the plan), Legends (category counts), Revisions (numbered), Title Block (Sheet: A1 / A3 / A4 SVG with title block, revision table, legend tables and the plan views as viewports with scale labels; also downloads the SVG), Guide Grid, Worksets (new / assign / hide / show / list), Design Options (new / assign / show one / all).
**Data (20, data):** Materials (+ takeoff by material: volume, mass, cost), Object Styles (3D colour per kind), Global Parameters (NAME=value, bind NAME prop, unbind), Space (area, volume from ceiling or level height, occupancy), Zone (totals), Place Mass / In-Place Mass (volume, storeys, gross floor area) / Show Mass, Building Pad, Property Line (polygon area and perimeter), Subregion, Load Combinations (EN 1990 6.10, ASCE 7, characteristic on floors, net of shafts), Panel Schedules (loads to the nearest panel, circuits, connected W and A), and 7 generic component placements (Mechanical Equipment, Electrical Equipment, Lighting Fixture, Plumbing Fixture, Air Terminal, Device, Sprinkler).

## Honest limits
- The 7 component placements are sized boxes with an elevation and watts. No families, connectors, systems, flow or sizing. Same for Space / Zone: area, volume, occupancy only, no energy simulation. Load Combinations is a floor-load calculator (slab self-weight 25 kN/m3 assumed), not an analysis; Boundary Conditions is a tag.
- Wall Opening starts at the floor (a doorway cut, no sill). Cut Geometry / shafts only cut floors in the schedule; overlapping shafts and cutters are counted twice. Curtain walls are data + grid lines: the solid wall is still drawn and counted in wall quantities.
- New 2D / site / component kinds are not movable by Move / Copy / Rotate / Mirror / Array (parity chunk lists fixed kinds). Align, Copy, Cut, Paste, Select by ID work on them.
- Filters, thin lines and hidden lines act on the 3D scene and the Floor Plan SVG, not on CAD export, Plan-to-CAD or IFC. Object Styles colours 3D only. Annotation items belong to a level, not to one view: every plan of that level shows them. Duplicate View stores view settings only.
- Tag All (parity chunk) refreshes the first tag found on a host: it can overwrite a keynote or material tag sitting on the same element.
- Sheets are SVG only (no PDF), no drag layout: views are laid out in a grid. Scale labels are computed from the viewBox and the viewport width.
- Worksets / Design Options are tags + visibility, with no ownership, borrowing or alternatives comparison. Starting View not done.
- Not tested: Arabic strings, ribbon button rendering, real mouse picking (selection set through `RV.sel` / `PXR.ids`), download of SVG / CSV files (called inside try, not asserted).

## Skipped (and why), the 67 left
- **External files / engines (no file model, no network):** Link Revit, Link IFC, Point Cloud, Decal, Image, Import PDF, Import gbXML, Load as Group, Insert Views from File, Manage Links, Manage Images, Transfer Project Standards, Dynamo, Dynamo Player.
- **MEP networks (need connectors, systems, sizing):** Duct, Duct Fitting, Duct Accessory, Flex Duct, Duct Placeholder, Cable Tray, Conduit, Wire, Pipe, Pipe Fitting, Pipe Accessory, Pipe Placeholder, Mechanical Settings, MEP Settings, Pipe Sizing, Check Duct Systems, Check Pipe Systems, Check Circuits. (A geometry-only run without connectors would be misleading, so not faked.)
- **Steel and rebar (no connection, bar or cut-solid model):** Connection, Plate, Bolt, Anchor, Weld, Steel Cut, Cope (x2), Rebar Area / Path / Fabric Sheet / Cover / Couplers, Truss.
- **Need arcs, surfaces or a work-plane viewer:** Diameter, Arc Length, Opening By Face, Dormer, Work Plane Set / Show / Viewer, Split Surface, Merge Surface, Graded Region (the toposurface has no editable mesh here).
- **Low value or redundant:** Detail Component (Symbol covers it), Stair Path (the plan already draws the stair arrow), Span Direction, Check Spelling, Site Component, Parking Component (the generic component pattern would do, left out to keep the set honest), Snaps, Shared Parameters, Project Units, Structural Settings, Starting View.
