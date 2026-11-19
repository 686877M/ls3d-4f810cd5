# T.O X — roadmap, steps and recommendations (written before the conversation is compressed, 2026-11-19)

Everything the owner asked in the conversation is here, with what is done, the steps for what is left, what I need from the owner, and my recommendation. Read with `STATUS.md` (what exists) and `MEETING_ROOM.md` (history). Full chat text is in `CONVERSATION_LOG.md` and on the Mac in `~/Documents/Projects_MD/`.

## 0. Rules that apply to every package
- Short Egyptian Arabic. Never invent values (prices, soil data, code tables): use inputs or say "missing".
- Say what was not tested. Headless tests only so far; nothing was checked on a real GPU browser or with live accounts.
- Publish only after a fresh yes (the page holds Royal Saudi Air Force project data; the entry gate is visual only). `docs/CONVERSATION_LOG.md` is public if pushed: remove it before sharing.
- A new top-level name must be unique across chunks (a duplicate `const` breaks the whole page). Add every chunk to `site/src/build/patch_v3.py`; build with `python3 patch_v3.py && python3 build.py`; tests in `src/build/tests/` need `localStorage xto-test=1`.
- After each big stage: commit, update MEETING_ROOM / STATUS, re-export the master Markdown (`export_session.py`), then ask before pushing.

## 1. Where things stand (short)
Done and tested headless: model, drawings, BOQ, exports, schedule and timeline with playback indicator, tabs with Start page, technical office / DC (22 document types, tender, feasibility, IPC, soil and survey, reports, filing, CRM, reinforcement tab), project control (pulse, calendar, Telegram bot, collect, reports, assets), teams and live session, review workflows (4), GIS and environment with offline code-based simulation, agent hub, social share, radio and YouTube widgets, render up to 12K (HD tested), autosave every 5 s with 120 steps kept, ask-before-close, right-click menus on tables, hover cards, guide, logo, idle display, Drive review of the tank calculation.
Not done: see the packages below.

## 2. Work packages (suggested order)

### WP1. DWG reading and the clash-detection job (blocked on a tool, in progress)
Why: the owner's Drive network files are DWG; Navisworks is not available here.
Steps: (1) finish building LibreDWG 0.13.3 (source in `/tmp/ldwg_src`, prefix `/tmp/ldwg_install`); (2) download the DWG files through the Drive connector (each is 5–30 MB, base64) and convert to DXF with `dwg2dxf`; (3) read layers, blocks, text, pipes and elevations with `ezdxf`; (4) verify each file's coordinates and units before any test; (5) run the 42-test plan (`08_Review/Clash_plan_2026-11-19.xlsx`) with our geometry code: hard clash, clearance clash (tolerances from the specification, not assumed), duplicates; (6) write the register (Excel), the report (PDF) with screenshots, and a summary of critical clashes with corrective actions; (7) say plainly that it is not a Navisworks NWF.
Needs from the owner: clearance tolerances from the spec; DXF exports if the converter fails; which network folders to enumerate (Drive lists 5 files per call).
Recommendation: also ask the consultant for IFC or NWC exports; profile PDFs carry the invert levels the plan view lacks.
Done when: register, report, screenshots and the load log exist and every file has a status (loaded / not loaded / coordinates checked).

### WP2. Fidelity to the source programs (separate session already started)
Session: "تطابق واجهات Civil 3D وRevit وNavisworks وPrimavera" (also SketchUp and the Coohom-style home module).
Steps per program: research official ribbon tabs, panels, commands, icons, sizes, menus, right-click menus, trees (Toolspace, Project Browser, Selection Tree), status bar, workflow; write `docs/UI_SPEC_<program>.md`; rebuild the tab's ribbon, panels, menus; map each command to an existing feature or show it greyed with "not built yet"; keep maps and satellite as an optional helper only.
Order: Civil 3D (points, surfaces, contours, alignments, profiles, sections, volumes, pipe networks, Survey tab) → Revit (views, Project Browser, Properties, families, schedules, sheets) → Navisworks (Selection Tree, Sets, Clash Detective, Timeliner, Quantification, Viewpoints, Animator) → Primavera (activities, WBS, relationships, resources, baselines, layouts, filters, S-curve, reports) → AutoCAD window (command line, status bar OSNAP / ORTHO / POLAR / GRID, model and layout tabs, ViewCube, wheel zoom, window and crossing selection, grips, layers and groups) → SketchUp and Coohom.
Recommendation: do one program per session and ship each; exact pixel copies are not the goal, same names, order and workflow are.
Honest limit: engines such as alignments, corridors, pipe networks, resource levelling are large; the first pass shows the real menus and wires what exists.

### WP3. Structural analysis tools (SAFE / SAP / ETABS / Tekla style)
Steps: (1) beam and frame solver (direct stiffness, 2D then 3D), supports, loads, load combinations (ASCE 7 / SBC 301 / ECP 201); (2) slab / raft strip method and a plate finite-element option with soil springs (the tank used SAP plate model with subgrade modulus 20000 kN/m3); (3) RC member design (flexure, shear, crack width, development and lap lengths) with ACI 318 / ECP 203 / SBC 304; (4) steel member and connection checks (bolts, welds, base plates) with AISC 360 / ECP 205 / SBC 306; (5) reinforcement and steel detailing outputs (bar schedule, shop drawings); (6) result viewers (diagrams, contours); (7) tie into the review workflows and the DC register.
Needs: the code editions to follow and, if the owner wants Egyptian methods, the tables (ECP) because they are not typed in from memory.
Reference books (for example Dr. Shaker El-Behairy's RC design; Egyptian civil curricula): copyrighted. The tool lists them as references and implements the public formulas and code methods; it does not copy book text or tables.
Recommendation: start with RC beam / slab / footing design and a 2D frame solver; verify against hand calculations and the tank report before anything bigger.

### WP4. Meeting-room desk and Projects tab
Steps: (1) Projects tab: each project has its own data, DC, calendar, versions (save / open / duplicate / delete; project library exists, DC and control stores must be keyed per project); (2) upload and intake: drop soil reports, photos, drawings, schedules; analyse (DXF layers and extents, CSV columns, text dates and revisions, images) and register each as an incoming document with a summary; keep the file in IndexedDB; (3) revision comparison (same name, new revision: diff counts); (4) minutes of meetings with decisions and actions that feed the calendar and the register; (5) "colleagues" dashboard: agents (quantity, schedule, structural, architectural, safety, DC, risk) report what they did, found, and what is missing, in a chat-like brief, rule-based on the data; optional free-form answers through the Agent panel; (6) Drive: assistant-side reading now, page-side link needs an OAuth client id.
Recommendation: build the intake pipeline first; it feeds everything else.

### WP5. Consultant mode (new project from the land)
Steps: owner gives land and requirements → brief → options comparison → tender and BOQ shell → feasibility → cost → schedule skeleton → risk list → report, all from owner inputs and the rate / code tables the owner supplies.
Recommendation: reuse DC tender / feasibility, review workflows and the report templates; add a guided wizard.

### WP6. Home and render module "H.O X" (Coohom-like)
Steps: library (brands, colours, materials, families), room planner and furniture placement, PBR materials, HDRI lighting, 360 panorama capture, render presets, still render up to 12K (exists), video studio presets and resolutions, people and vehicles (realistic or remove), project-type registry (towers, bridges, buildings, interiors).
Blender: export OBJ / IFC / glTF and generate a Blender Python script; BlenderBIM for IFC; Cycles for V-Ray-like lighting. Path tracing inside the page needs a newer three.js plus a path-tracing library (separate step). SketchUp: import / export through standard formats.
Recommendation: PBR + HDRI + 360 first (cheap, visible), path tracing later.

### WP7. Simulation and animation polish
Steps: professional play / pause / stop / step / speed controls for disassembly, assembly and timeline; walk mode; rotate option in the Views pane (exists); site plan in the Views menu (exists); keep the playback indicator compact (done); performance profile on a real GPU; reduce draw calls.
Needs: the owner's feedback on a real machine.

### WP8. Code quality, speed and security pass
Steps: remove duplicated functions and styles (one source of truth); lazy-build panels; measure start time and memory; review innerHTML uses; keep the test hook off by default (done); Content-Security-Policy meta; review localStorage keys; dependency check; accessibility (keyboard, contrast); mobile layout; Arabic proofreading.
Recommendation: run it after WP2, because the interface will change a lot.

### WP9. Operations and sharing
Steps: a small server (optional) for the 24/7 Telegram bot, mailbox intake, Drive and Calendar sign-in (OAuth), real permissions; a presentation dashboard for cost and status; research report on programs, consultancies, contractors and holding companies; explainer video from `docs/VIDEO_SCRIPT.md`.
Needs: OAuth client ids, a hosting choice, the owner's decision on what may leave the browser.

## 3. Open decisions for the owner
1. Publish the latest build now (one commit behind)?
2. Which program first after Civil 3D: Revit or Navisworks?
3. Clearance tolerances and code editions for the clash tests and structural tools.
4. Keep `docs/CONVERSATION_LOG.md` in the public repository, or remove it?
5. Do you want a server for the bot and mailbox?

## 4. What I cannot do (so nothing is promised that is not possible)
- Run Navisworks, AutoCAD, Revit, Civil 3D or Primavera; write DWG from a browser (DXF is exported instead); skip YouTube ads; sign in to Drive from the page without an OAuth client id; read the owner's accounts; guarantee results as a licensed engineer's approval.
