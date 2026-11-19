# MEETING ROOM: agreements, decisions and status

Template used: **BVT-1 (BIM Viewer Template)**. See `template/BVT-1/README.md`. Any new project reuses the same idea: copy the source, edit only the PROJECT blocks.

Project: Sewage Lift Station (sheets BIS-ME-LST-01 plan, 02 roof plan, 03 section A; scale 1:25).
Live page: `index.html` (GitHub Pages). Source: `src/lift_station_3d.html`.

## Decisions agreed with the owner

- Concrete thickness: 430 mm for every wall and slab (measured on sheets; the owner asked to treat all concrete the same). The remark "2 x 2" is ignored.
- Wet well: round, internal Ø3000; depth 5.25 m (B.L +1159.76 to top +1165.01). Outlet chamber: internal 2000 x 3200, floor +1162.91.
- Openings (sheet 02): 3000 x 800 along the pump row; 800 x 800 on the well, inlet side next to the crane; 800 x 800 on the outlet chamber roof. Two Ø100 GRP vents on the well top.
- The only crane of the station is the 1 t, 360 degree electric jib crane. "Crane 2000 Kg" printed on the sheets belongs to the building plan in the background.
- Pump capacity conflict on the sheets: 8 L/S on sheet 01 and 7 L/S in the table. Open: confirm before ordering.
- The page must not carry a "limits / honesty" section. Honest status goes in the chat replies and in this file.
- Drawings follow ISO 128 conventions: wide cut outlines, narrow hatch for cut reinforced concrete, chain dimensions, level symbols, section marks, tags with leaders, scale bar. Levels can be shown relative to G.L (+0.00).
- Egyptian Code (ECP 203): the reference is written in the sheet notes. Reinforcement, concrete cover and crack-width limits are NOT invented: they stay with the structural design. A web search did not return the exact cover values for wet wells.
- Hover on any element shows its data (code, family, type, IFC class, quantity, brand, cost, LOD). Cost and brand can be typed in (BIM 5D style). Families can be edited like Revit types.
- Autodesk logos or product names are not placed on the sheet. The sheet has a free "format label" field.

## Features built

3D model (about 35 parts, detailed flanges, bolts, supports, crane, odor unit), views and 360 look-around points, ghost concrete, water and levels, parametric edit panel, multi-plane section cut, 2D drawings (PDF, SVG, DXF), drawing sheet (PDF, PNG, SVG, DXF) with editable title block, notes, legend and 3D callouts, disassembly/assembly animation (5 sequences, pump selector), BOQ (45 items) with cost, families editor, notes register, Excel (BOQ, Schedule, Notes, Plant3D, Families, Specs, Pipes, Sequences, Parameters), IFC2X3 with Revit family/type properties, DXF 3D, OBJ, project JSON save and load, Arabic and English.

## Validation status

- Checked with open-source readers: DXF (ezdxf, no audit errors), IFC2X3 (ifcopenshell: 57 products with geometry created, 0 failures), XLSX (openpyxl), PDF (pypdf), SVG (XML parse).
- NOT tested: opening any file in AutoCAD, Revit, Plant 3D or Navisworks. DWG and native Revit files (.rvt, .rfa) cannot be produced in a web page. DXF to DWG: Save As in AutoCAD or the ODA File Converter.
- NOT tested: the page on phones and Safari.

## Open items

- Electrical specifications (control board, cables, starters, VFD).
- Pipe lengths beyond the model, valve bodies, ladder length, slab thicknesses if different from the walls.
- Pump capacity (7 or 8 L/S) and pump model.
- Water table level (dewatering) and soil data.
- Reinforcement design and bar schedule (structural engineer).
- Whether the concrete under the outlet chamber is solid (assumed solid).

## 4D, safety, clashes, sharing, agents (added later)

Agreed with the owner:
- A 4D schedule drives the model: parts appear as activities progress. Durations, lags, supplier lead times and crews are editable assumptions.
- Site simulation: workers, vehicles, supplier deliveries, materials on site and exclusion zones move with the timeline. Everything has hover data.
- One icon hides all data overlays and tooltips; the model and its titles stay.
- Clash detection: model clashes (mesh-level bounding boxes), clearances (maintenance, ladder, crane arm, headroom) and time-based conflicts (workers near vehicles, the crane swing radius, the open excavation).
- Hazard register with ISO references (ISO 45001, ISO 12100, ISO 7010, ISO 3864-1, ISO 12480-1, ISO 9927-1, ISO 31000, local law); severity and likelihood are editable.
- Accepting an item teaches the tool to ignore it next time. Lessons are recorded and exportable.
- Notes: 3D note pins and pen/text markup on the 2D drawings (kept in exports).
- Sharing: WhatsApp, Telegram, phone share, copy link. The link carries the state in the `#s=` hash.
- Agents: `window.BVT.call(...)`, postMessage, and "Copy agent brief". See `docs/AGENTS.md`. Learning: `docs/LEARNING_LOG.md`.

Not decided yet: real schedule data, real site layout, HSE officer review.

## Project calculations received (amr.rar, 2026-11-19)

- Mechanical calc: peak flow 14.70 L/s, 3 pumps (2 duty + 1 standby), calculated 7.35 L/s each, SELECTED 8.00 L/s. This settles 7 vs 8: use 8 L/s.
- Structural calc (44 sheets, SAP plate model): ACI 318-19, ACI 350, ACI 350.3, ACI 224R, SBC 301/304, ASCE 7. Concrete C40, steel fy 420. Cover: 50 mm soil and internal water faces, 40 mm walls, 25 mm slabs. Bearing 200 kN/m2; water table not considered (base to water table: nil).
- Thickness and bars in the calc: 400 mm with T16@150, 300 mm with T14@150, 200 mm with T12@150. DECIDED 2026-11-19: the structural calculation governs. The model now uses well wall 400, base 400, well top slab 200, chamber walls 300, chamber floor 400, chamber roof 200 mm (six editable parameters). The old 430 mm rule is replaced.
- Earlier note about ECP 203 is replaced: the project design basis is ACI/SBC.
- ME-GLY-01.dxf (174 MB) is the site plan; not loaded yet.

Entered on the drawings (2026-11-19): water levels on the section now follow the mechanical calc (H.W.L start +1161.28, H.H.W.L +1161.38). Sheet page 2 carries three tables: mechanical design data, structural design data, site context (from ME-GLY-01.dxf, label-to-label distances). Sheet notes now state 8.00 L/S at 10.00 m head and the ACI/SBC basis. Thickness 430 vs calc 400/300/200 is flagged, not changed.

Site plan in 3D (2026-11-19): new tab "Site plan" shows ME-GLY-01.dxf linework (4,164 segments in 5 categories), the UG sewage storage tank 1000 m3 (2 cells) with 4 pits, the potable and firefighting tank 2500 m3, the workshop/irrigation complex, the electrical building, pipes (100 runs, buried 1.2 m assumed) and labels, aligned to the well centre and rotated 6.5 degrees. Footprints are read from the linework; heights and depths are assumptions. Not resolved: split between workshop and irrigation tank, exact electrical building outline.


---
## Session log 2026-11-19: T.O X (Technical Office X) — what is done, what is running, what is left
Read this first if you open the work from another account or machine. Full conversation text is in `docs/CONVERSATION_LOG.md` (the repo may be public; remove that file before publishing if you do not want it readable).

### How to resume
1. Sources are in `src/build/` (chunks `c_*.js`, `patch_v3.py`, `build.py`, base `v2_backup.html`, `lib/`). Run `cd src/build && python3 patch_v3.py && python3 build.py` → writes `src/lift_station_3d.html` and `index.html` (one file, about 1.8 MB).
2. Tests are Playwright scripts in `src/build/tests/` (`node t46.js <path to Chrome for Testing>`; they load `file:///tmp/ls_index.html`, so copy `index.html` there). Code is reached in tests through `__lsv.ev("...")`.
3. Conventions: command = `XCMD(id,icon,en,ar,run,on)`; ribbon = `RIB` array; dock widget = `WX.defs.<id>` set inside a `wxDefs` wrapper; panel refresh on open = `WXR.<id>`; bilingual text = `b2(en,ar)`; DOM helper `el(tag,props,...kids)`. A new chunk is added to the list in `patch_v3.py`. Top-level names must be unique across chunks (a duplicate `const` breaks the whole page: this happened with `WT`).
4. User rules: short Egyptian Arabic; never invent values (prices, soil data, win numbers); no "limits" section on the page; ask before publishing (the page holds Royal Saudi Air Force project data and coordinates; the entry gate is only visual); say what was not tested.

### Done (headless-tested with mocks; real-browser and live-internet behaviour NOT verified)
- Core (earlier): 3D/BIM model, parametric edit, sections, sheets, BOQ and cost, IFC2X3 / DXF / OBJ / XLSX, Primavera-style CPM schedule (XER, MSP XML), timeline dock with link-motion, measure, CAD editor, site plan in 3D, rebar, scenarios, Monte Carlo risk, codes library (Egypt, Saudi, USA), calculation sheets and review, coordination rules, survey TIN and contours, BIM health, map / Wayback / DEM, navigation, roles, themes, agent bridge, command bar, office spaces (sheet, report, slides, media), ZIP package, entry screen, idle display.
- Document tabs (`c_tabs.js`): Start page + tabs per discipline (model, drafting, schedule, survey, coordination, detection, take-off, levels, simulation, analysis, office); each tab keeps its own layout. Start page offers tabs, project, role, learning, web search.
- Player: Quran radio filtered to Egypt and Saudi from the mp3quran.net station list (needs internet), custom stream URL, YouTube link embed, pop-out small browser window for radio and for video, web widget.
- Technical office and document control (`c_dc.js`): register (22 document types: letters, RFI, submittal, shop drawing, MS, MIR, IR, NCR, VO, IPC, claims, MOM, transmittal, reports...), incoming / outgoing, auto reference numbers, status, due dates, history, link to a schedule activity, print / PDF, save HTML, email (mail app and Gmail compose), Drive link field, 3D screenshot attach, reply and duplicate, import of .eml / .txt / .json, tender and BOQ pricing (overhead, profit, contingency, VAT), feasibility (NPV, IRR, payback, B/C, sensitivity), IPC (cumulative percent, retention, advance recovery, VAT, print, close period), soil log with Terzaghi preliminary bearing, survey report data, report templates, filing index, parties (CRM), glossary.
- Share and social (`c_social.js`): caption and hashtag writer (Arabic / English, tones), post-image maker for Instagram, Story / Reels / TikTok, Facebook / LinkedIn, X, YouTube, Telegram sizes, share intents for Telegram, WhatsApp, Facebook, LinkedIn, X, Reddit, email; Instagram / TikTok / Discord / YouTube / GitHub open the site after copying the text. The page cannot log in or post for you.
- GIS and environment (`c_env.js`): sun path and seasons (computed), day cycle on the 3D light, optional shadows; wind rose from Open-Meteo plus ASCE 7 velocity pressure; ECP-neutral ASCE 7 equivalent lateral force; USGS recent earthquakes; clear-sky solar and NASA POWER climate; USCS helper, Darcy / Sichardt dewatering, SoilGrids lookup; satellites and elevation sources table and viewer links; pump, motor, transformer and voltage-drop quick calcs.
- Project control (`c_ctrl.js`): Pulse (rules over documents, activities, risks, data date; handover readiness with the named blockers), calendar (document due dates, milestones, critical activities, asset dates, reminders; .ics export; Google Calendar links), Telegram bot (token and chat id; /status /due /handover /rfi /ncr /note /done /rej /appr; photos logged into the register; only while the page is open), collect (paste, drop, clipboard image, 3D and sheet capture, social source tag), follow-up reports for owner / consultant / contractor / internal / research, asset register (7D, COBie-lite), project cycle map.
- Teamwork (`c_team.js`): teams and members, separate 120-step history per team, named versions with roll-back, activity log (CSV), live session (BroadcastChannel in the same browser; WebRTC copy-paste link between devices), chat, camera share, search everywhere (Ctrl+Shift+F). Roles are cooperative, not security.
- Workspace comfort (`c_ui2.js`): density levels, zoom 50–140 %, collapse arrow for the top bars; autosave every 5 s; 120 steps kept in IndexedDB and restored after a restart (tested with a page reload); hover cards with a moving picture for every ribbon button, tab and document tab; Guide centre (the "!" button) with every tab explained; one-click export of everything.
- Export all: package ZIP now also holds the technical-office register, documents, tender, progress report, project pulse, calendar, asset register and an app-state backup. DWG cannot be written by a browser: the DXF files open in AutoCAD / BricsCAD and save as DWG.
- Logo: new T.O X wordmark (skewed grid, rounded-left T bar, tilted O, geometric X, gold triangle) following the user's reference picture; caption width matches the mark.

### In progress / needs checking
- (done) Reception-screen contour lines now fill the whole screen; ridge lines hide only a thin band under themselves.
- (done) Radio: Cairo and Saudi Quran streams verified to play (stream.radiojar.com ids 8s5u5tpdtwzuv and 0tpy1h0kxtzuv), Egyptian stations loaded from radio-browser.info, pop-out opens the stream itself in a small window. YouTube: embed no longer sends `no-referrer` (that caused the player error); fallback buttons "Pop-out video" and "Open on YouTube". Embedding still depends on the video owner and on the page not being opened from a file.
- Logo polish in the top bar at the compact density and on the splash screen.
- Live endpoints were not reachable from the build sandbox: Open-Meteo, NASA POWER, USGS, SoilGrids, mp3quran.net, Telegram, YouTube, Google. Code paths are mock-tested only.
- Shadows on the 3D model (heavy, not profiled), pop-out windows (browser may block), Notification reminders, WebRTC between two real devices.

### Still to do
- Plant-3D-style output with logos, render quality and a site-plan render.
- Video studio presets and resolutions; the explanation video (script is in `docs/VIDEO_SCRIPT.md`; a video file was not produced).
- Technicians and people figures, realistic site people and vehicles (currently off by default; do them well or remove).
- Coohom-like library (brands, colours, 360 panorama) and a project-type registry (towers, bridges, buildings, interiors).
- A small server for what a page cannot do: a Telegram bot that runs 24/7, reading the mailbox, Google Drive and Calendar sign-in (needs OAuth client ids), real permissions.
- Egyptian code (ECP) calculation methods; national seismic zone and wind maps as data; more engineering sheets (MEP, fire, drainage, irrigation).
- Mobile layout, accessibility pass, performance on very large models, Arabic proofreading of all new text.
- Decide when to publish: the deployed page (GitHub Pages) still shows the older build until the new one is pushed.
