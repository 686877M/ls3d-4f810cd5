# Technical Office X: extension plan (plan only, not scheduled work)

الخطة دي للتوسّع (extension) على الأداة، مش شغل جاري. اتكتبت بناءً على المبادئ الأربعة اللي اتفقنا عليها. لو المبادئ الأربعة عندك غير اللي تحت، عدّلها هنا وباقي الخطة بتتبعها.

## 1. The four principles (my reading)

1. **One platform, many disciplines.** Architecture, structure, MEP, electrical, survey, scheduling, cost, render and clash detection live in one workspace. Each discipline is a module, not a separate app.
2. **The tool is not the project.** "Sewage Lift Station" is project 01. Technical Office X must open any project: upload, save, copy, undo/redo, set-up, templates.
3. **A workspace, not a page.** Ribbon on top, dockable widgets, 3D view as one widget, right-click and long-press menus, capture and video from any widget.
4. **Honest engineering.** Every number has a source (drawing, calculation, vendor datasheet) or is marked as an assumption. No invented code values. Exports are validated by independent readers. Anything not opened in the real target program is said so.

## 2. Where we are (built and tested headless)

3D model and parametric edit, sections, 2D drawings, sheet with title block, BOQ and cost, families, IFC2X3, DXF, OBJ, XLSX, Primavera-style schedule with CPM and exports (XER, MS Project XML), measure tab, CAD draw/edit window, rebar layout for the station, site plan in 3D, project library, 120-step undo/redo, workspace shell, capture and video.
Not tested in the real programs: AutoCAD, Revit, Navisworks, Primavera P6, Power BI.

## 3. Architecture

- **Kernel (stays small):** project container (JSON now, IFC-backed later), unit system, undo/redo history, event bus, command registry (`XCMD`), widget registry (`WX.defs`), ribbon definition (`RIB`), icon set (`XI`).
- **Modules (plug-ins):** each module registers commands, widgets, data schemas and exporters. Target folder layout: `modules/<name>/{commands,widgets,exporters,tests}`.
- **Data model:** elements carry id, discipline, level, IFC class, family/type, quantities, cost, source note, assumption flag. One element list feeds 3D, drawings, BOQ, schedule and checks.
- **Build:** the single-file viewer stays the delivery format; source stays in chunks (`c_*.js`), assembled by script. Next step is to move chunks to ES modules with a bundler, keeping the standalone export.
- **Runtime limits:** browser only, no server. Heavy jobs (large IFC, point clouds, FEM) go to optional local workers or an optional local service, never to a third-party upload without consent.

## 4. Module map (what each competitor tool gives us, and our route)

| Area | Reference tools | Our route | Open-source building blocks |
|---|---|---|---|
| 2D drafting | AutoCAD | Layers, linetypes, blocks, hatch, dimension styles, xref-like underlay, DXF round trip, command line | dxf-parser, ezdxf (offline checks), pdf.js |
| BIM authoring | Revit | Parametric families, levels, grids, schedules, phases, IFC4 export | web-ifc, IfcOpenShell (offline validation), three.js |
| Coordination | Navisworks | Federated models, clash rules and groups, viewpoints, markup, timeliner | web-ifc, xeokit (AGPL: check licence first) |
| MEP | Revit MEP, AutoCAD Plant 3D | Pipe/duct/cable routing, sizing checks, isometrics, spools, tag and BOM | custom routing, three.js |
| Structural | ETABS, SAP2000, Tekla, STAAD | Export analysis models (IFC, DXF, CSV, S2K text), import results, reinforcement layout and bar schedule, code-check report | custom exporters; no solver inside the browser at first |
| Electrical | ETAP, DIALux, AutoCAD Electrical | Load schedule, cable sizing sheets, single-line diagram, earthing layout | custom |
| Scheduling | Primavera P6, MS Project | CPM, calendars, resources, baseline, earned value, XER and MSPDI | built; add resource levelling |
| Dashboards | Power BI | Export clean tables (CSV/XLSX/Parquet-like JSON) and a Power BI-ready data pack | none needed |
| Render | Enscape, Twinmotion, V-Ray | Physically based materials, HDR sky, shadows, section renders, turntable video | three.js PBR, WebCodecs |
| Survey and site | Civil 3D, Trimble, Leica | Point cloud (LAS/E57 via worker), TIN surface, contours, cut and fill, setting-out table, alignment | potree-style tiling, proj4 |
| Simulation | Navisworks Simulate | 4D (built), construction logistics, crane reach, safety zones | built; extend |
| Reporting | all | Quantities, specs, price comparison, data validation, transmittals | custom |

## 5. Phases

| Phase | Goal | Main deliverables | Exit test |
|---|---|---|---|
| 0 Foundation | Stable kernel | ES-module split, command and widget registries documented, project container v2 with version field, automated test runner in CI | Build and tests pass on every push |
| 1 Core workspace | Daily-use shell | Saved layouts, multi-viewport (plan, section, 3D), context menus on every widget, drag and drop open, autosave and crash recovery | Open, edit, save, reopen 3 different projects without loss |
| 2 Drafting and BIM | AutoCAD and Revit level basics | Layers and linetypes, blocks, hatch, dimension styles, DXF import, IFC import, levels and grids, family editor with nested parameters | DXF and IFC round trips checked with IfcOpenShell and ezdxf |
| 3 Coordination | Navisworks level basics | Multi-model federation, clash rules with tolerances, clash groups, viewpoints, issue list with BCF export | Known clashes found in a seeded test model |
| 4 MEP and electrical | Plant 3D and Revit MEP basics | Pipe and cable routing, sizing checks from vendor data, isometric sheets, spool lists, load schedules, single-line diagrams | Hand calc matches tool output on 3 samples |
| 5 Structural and survey | ETABS/SAP/Tekla and Civil 3D bridges | Analysis-model exporters, result import, bar bending schedule, point cloud and surface tools | Round-trip a small frame through an external solver and compare |
| 6 Delivery | Output and reporting | Quantities and specs book, price comparison, data validation report, render and video pipeline, Power BI data pack | A full project package produced in one click |
| 7 Harden | Release | Accessibility, performance budget, security review, user guide, template projects | Review by a second engineer |

## 6. Standards and checks (rule engine, not hard-coded numbers)

- A rule is data: `{id, discipline, source, formula, inputs, severity}`. The source field is mandatory (code clause, calculation sheet, vendor datasheet).
- First rule packs: concrete cover and spacing (ACI 318-19, ACI 350, SBC 304 as in the station calculation), pipe velocity limits (from the design note), clearances (ISO 12100, ISO 14122-4), levels and slopes.
- A rule with no source cannot be switched on. Results are reported as pass, fail, or "no data".

## 7. Data, BOQ, specs and prices

- BOQ rows generated from elements, never typed twice. Each row keeps element ids so a change flows to cost, schedule and drawings.
- Spec sheets per family: standard references, vendor datasheet slot, test requirements.
- Price comparison: quotes imported as CSV or XLSX, mapped to BOQ codes, unit-rate and total comparison with outlier flags. No prices are invented; empty means empty.
- Validation report: missing cost, brand, quantity, orphan activities, schedule loops, elements without level, units mismatch, duplicate ids.

## 8. Interaction design

- Ribbon tabs by workflow (Home, Model, Site, Annotate, Analyze, Schedule, Output, Workspace). One command, one place; the command palette (Ctrl+K) finds all of them.
- Context menus: right-click or long-press on any element, widget, empty space or table row. Same command registry as the ribbon.
- Capture: screenshot at 1x to 4x, section or view capture, video of disassembly, assembly and 4D, per-widget capture.
- Icon system: 24-unit grid, 1.6 stroke, one accent, boxes on Fibonacci sizes (89 x 55 buttons, 34 and 21 icons).

## 9. Quality, testing, security

- Tests: headless browser smoke test for every ribbon command, export validators (ezdxf, IfcOpenShell, openpyxl, PyP6XER), golden-image checks for drawings, numeric regression tests for CPM and quantities.
- Evidence rule: a feature is "done" only with a test or a reproducible check. Features checked only by reading code are labelled so.
- Client data: military and ministry projects stay local by default. Public hosting needs an explicit decision per project, and coordinates, calculations and site layouts are treated as sensitive.
- Licences: record every dependency licence; AGPL parts (xeokit) only after a decision.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Scope explosion | Phases with exit tests; modules ship behind flags |
| Large files (174 MB DXF) freeze the browser | Offline preprocess script first, streaming worker later |
| Wrong numbers look authoritative | Source and assumption flags on every value; rule engine refuses sourceless rules |
| Single-file page grows too big | Module split, lazy-loaded modules, standalone export built from modules |
| Export not accepted by the real program | Test in the real program per release; list untested formats in the release note |

## 11. Opening a new project with these specs

1. Copy the template (`template/BVT-1` now, Technical Office X template later) and set the project block: name, number, client, units, codes, currency.
2. Drop in sources (drawings, calculations, site plan) under `00_Source`; run the import scripts (PDF text and render, DXF geometry).
3. Fill the element list from sources; mark every missing value as an assumption.
4. Run validation, then the export set (drawings, 3D, BOQ, schedule).
5. Review with the discipline owners; record decisions in `MEETING_ROOM.md`.

## 12. Definition of done (per phase)

Code merged with tests, docs updated (BRIEF, MEETING_ROOM, this plan), exports validated, known limits written in the release note, one reviewer outside the author.
