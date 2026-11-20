# Parity pass: 40 ribbon stubs made real (C.X 14, R.X 14, P.X 12)

Files: `parity_cad.js` (60 lines), `parity_rvt.js` (51), `parity_p6.js` (57), `parity_test.js` (Playwright, 126 checks, all pass).
Lines are long; every chunk is far under 400 lines. No library, no network.

## Integration
In `patch_v3.py` line 43, add the three chunks right after `rd('c_prog_more.js')`:
`...+rd('c_prog_more.js')+rd('parity_cad.js')+rd('parity_rvt.js')+rd('parity_p6.js')+rd('c_i18n.js')...`
(copy them next to the other `c_*.js`). Each chunk finds its ribbon entry by program + tab + panel + English name
(not by number, so reordering the DSL does not break it), re-registers it with `XCMD(id,...)` (so `XC[id].stub` is gone
and the "Working x of y" counter and the command reference move with it) and bumps `RIBP[type].built`.
Top-level names added: `PXR` (rvt, multi-select list). Everything else is inside an IIFE.
Run: `NODE_PATH=<dir with playwright-core> node parity_test.js file:///.../site/index.html` (optional `cad|rvt|p6`).

## Stubs before -> after (RIBM entries whose XC has `.stub`)
| program | total | before | after |
|---|---|---|---|
| AutoCAD C.X (draft) | 173 | 75 | 61 |
| Revit R.X (model) | 280 | 152 | 138 |
| Primavera P.X (sched) | 92 | 51 | 39 |
Other programs untouched: gis 24, survey 37, plant 34, coord 31, office 51.
Note: the three Modify/Offset/Trim/Extend/Fillet/Chamfer/Array/Mirror/Explode/Join CAD commands the brief listed were already working; the CAD stubs were different ones, so the CAD picks are the highest-value remaining ones.

## Implemented (40)
Each runs from its ribbon id and is checked in `parity_test.js` for a number or structure.
**C.X (cad):** Boundary (Home/Draw: smallest closed loop round a point, from rectangles, closed polylines, circles, or lines/open polylines meeting at shared end points; area checked 1600 / 10000), Edit Polyline (close/open/reverse/simplify), Mtext (stacked lines, shared group id, 1.5 x height), Make Current, Match (layers; last selected = destination), Color (#hex / BYLAYER), Group, Ungroup (+ picking a member selects the group, shift-pick deselects it), Copy Clip, Cut, Paste (relative geometry, layers re-created), Baseline, Continue (dimension chains: first point / offset step 3 x text height / value x unit factor), Diameter (dimension with "Ø", renders "Ø14").
**R.X (model):** Move, Copy, Rotate, Mirror (x=v or z=v, copy or "move"), Array, Scale, Offset, Trim/Extend (two walls to their crossing), Split (hosted doors/windows re-hosted), Pin (blocks move/rotate/mirror/scale/split/delete), Model Group (move/copy together; empty name ungroups), Tag All (W1,C1,D1, room name; refreshes instead of duplicating; drawn as a 3D label), Beam System (equal spacing across a floor/room/slab), Purge Unused (orphans and zero-length elements). Selection = `RV.sel` + shift+click list `PXR.ids`; group members and a wall's openings travel with it. Undo = `rv_undo` (tested).
**P.X (sched):** Add, Delete (reuse `addAct`/`delAct`), Dissolve (links predecessors to successors), Assign Predecessors, Assign Successors (`ID,type,lag;...`, loops and unknown ids refused), Assign Resources (`RES,units/day,rate`; dictionary `DATA.p6x.res`), Recalculate Assignment Costs (units x working days x rate; remaining uses remaining duration), Level Resources (crew per day limit, serial schedule by early start then float, pushes with a tagged SNET constraint `cs.lv`, CPM re-run, re-runnable), Apply Actuals (progress to the data date, never lowers), Summarize (WBS roll-up into `DATA.p6x.sum`), Global Change (`field=value where field(=|~|<|>)value`, fields crew/pct/lead/rate/fix), Replace (names, EN + AR).

## Real bug fixed on the way (P.X undo)
`loadProject()` calls `persist()` before `restoreSched()`, and `persist()` re-snapshots the old `ACT` over the restored `DATA.sched`, so no schedule edit could be undone with Ctrl+Z. `parity_p6.js` skips `snapSched()` while `HI.lock` is on, and `restoreSched()` now drops custom activities and the keys `cs, res, cs0, as, af` that the restored state does not have. Verified by the tests (Replace, Apply Actuals, Level Resources, Add undo).

## Not done / limits (honest)
- Group ids are copied by the existing Copy/Array (`mapE` clones `g`): a copy of a grouped object joins the same group. Paste is fine (new group ids).
- Diameter prefix "Ø" is drawn on screen only; DXF/SVG-paper export of the dimension text has no prefix.
- Boundary ignores T-junctions (a line ending in the middle of another) and arcs.
- Revit: shift+click multi-select is wired but only the data path is tested (no mouse test); Scale moves positions only (sizes not scaled); Rotate of floor/room/roof rectangles only for multiples of 90 deg; Offset is for line elements, not rooms; Purge cannot purge families/materials (the model has none). Pin does not block edits in the Properties pane.
- P6 Level Resources levels on `crew` only (resources assigned with Assign Resources do not feed it), is a heuristic (not optimal), skips milestones, started activities, activities with a Finish constraint, and ones whose own crew exceeds the limit. Costs do not feed the earned-value BAC (that still comes from the BOQ).
- Not touched by tests: Arabic strings, ribbon button rendering, Gantt screen refresh while the Gantt is open (p6Refresh runs, but only data was asserted).
- `gantt.js` (sibling) wires different sched stubs (Page Setup, Columns, Bars, Timescale, Filters, Group and Sort, Progress Line, Assign Baselines): no id overlap with these 12. Its bar drag writes `cs={t:'SNET'}`; Level Resources only clears constraints tagged `cs.lv`.

## Skipped (and why), by program
**C.X, 61 left:** parametric constraints (Coincident...Equal, Linear...Convert, Delete Constraints, Parameters Manager: need a persistent constraint solver, one-off geometry edits would be misleading); Gradient, Region, Wipeout x2 (need new entity types and rendering); Ray, Blend, Single Line, Find/Check Spelling (low value or text engine); Block Edit / Edit Block / Define Attributes (blocks are inserted copies, no definition store); Attach/Clip/Underlay/PDF Import/Link Data/Hyperlink (external files: no network/file model); Arc Length, Update, Dim Style, Add Leader, Align leaders, Link Table (no arc/style/leader model); Hidden/Conceptual/Sketchy/Shades of Gray, Viewport Configuration, Tool Palettes x2 (3D view / UI only); Edit Aliases, Configure, Layer Translator, Load Application, Run Script, Batch Plot, Page Setup/Plotter Manager, DWF (needs UI or file formats).
**R.X, 138 left:** all of Systems (HVAC/Electrical/Piping, 25+; need MEP element kinds and connectors), Steel connections/fabrication (11), rebar area/path/fabric/cover/couplers, analytical boundary/loads, Curtain System/Grid/Mullion, openings (shaft, dormer, by-face, vertical), Area/Area Boundary/Room Separator/Tag Room/Tag Area, Work Plane set/show/ref/viewer, Brace/Truss, links (Revit/IFC/point cloud/decal/image/PDF/gbXML), Detail Line/Region/Component/Revision Cloud/Insulation/Repeating, Keynote/Material/Beam tags, Symbol/Stair Path/Span Direction, Energy space/zone, Panel Schedules/Check Systems, Mass/Site (site component, pad, split/merge surface, subregion, property line, graded region), Worksets/Copy-Monitor/Reconcile, View Templates/Filters/Thin Lines/Hidden Lines, Callout/Duplicate View/Legends/Scope Box, Title Block/Revisions/Guide Grid, Settings (Materials, Object Styles, Snaps, parameters, units, Transfer Standards), Manage Links/Images/Starting View/Design Options, Select by ID, Dynamo x2, Align, Join/Cut/Cope, Cut/Copy/Paste/Match Type, Find/Replace and Spelling for text. Reason: each needs a new element kind, a views/sheets store, or an external engine that does not exist yet. Cheap next candidates: Align, Select by ID, Find/Replace, Spot Coordinate, Room Separator.
**P.X, 39 left:** Page Setup, Import XER/XLSX (parsers), Cut/Copy/Paste (activity clipboard), Renumber IDs (ids are referenced by fixed maps such as `actOfItem`, unsafe), Assign Roles/Activity Codes/Steps, Spell Check, Activity Network / Usage Spreadsheet / Resource Usage Profile / Columns / Bars / Timescale / Filters / Group and Sort / Bottom Layout / Progress Line (need Gantt UI work, left to `mod-gantt`), Resource Assignments, Thresholds, Assign Baselines, Set Default Project, Enterprise EPS/OBS/Resources/Roles/Cost Accounts/Codes/UDFs (no enterprise model), Store Period Performance, Admin (5; no users/security model).
