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


### Update 2026-11-19 (later): offline code-based simulation (`c_sim.js`)
The user asked for weather, wind, seismic and soil as code-based simulation, not internet data. Removed from the GIS tab: Open-Meteo wind archive, USGS earthquake list, NASA POWER, SoilGrids. Added, all offline:
- Wind: ASCE 7 method (SBC 301 follows it): Kz, qh, windward / leeward / side wall pressures with Gf and GCpi. Synthetic wind rose (Weibull, prevailing direction and spread, seeded). ECP 201 wind chapter NOT implemented.
- Seismic: ASCE 7 / SBC 301 spectrum and base shear (Fa, Fv default to the ASCE 7-10 tables, editable); Eurocode 8 form used by ECP 201 (ag, ground type, spectrum type 1 / 2, q, lower bound 0.2 ag, lambda 0.85). The EC8 reference spectrum parameters are the Eurocode 8 values; the ECP 201 edition in use may differ, so S, TB, TC, TD are editable. Seismic zone ag and Ss / S1 / SBC 301 city values are inputs from the code maps (no tables of national values were typed in, to avoid wrong numbers).
- Site class from Vs30 / SPT N / su (ASCE 7 and Eurocode 8 tables), liquefaction screening (simplified SPT: CSR, CRR, magnitude scaling, FS).
- Weather: synthetic year from user inputs (annual and daily temperature swing, sky clearness, Weibull wind) with exact sun position; monthly table, HDD / CDD, solar kWh/m2, PV yield estimate. It is a scenario, not recorded weather.
- To do next on this thread: add ECP 201 / SBC 301 national tables once the user supplies the edition (seismic zones, wind speeds, soil classes), Egyptian wind chapter, ECP soil and foundation chapters, ASHRAE-style design-day tables if wanted.


### Update 2026-11-19 (later): remove buttons and undo for placed items (`c_undo.js`)
- Tray at the bottom-left of the 3D view: one chip with × for each active section cut, each measurement, pending measure points, site cuts and the site plan, plus "Remove all". Ribbon Home → Edit has "Remove last placed item" and "Remove all cuts and measurements".
- Undo / redo (120 steps) now covers section cuts, measurements and site cuts: the view state is saved in every history step and inside the project file (`view` key). Before this, only parametric data was in the history, so undo did nothing for cuts and measures.
- Not covered: CAD window entities (they keep their own undo inside the CAD window), sheet callouts (edit them in the sheet notes).


### Update 2026-11-19 (later): new Radio and YouTube widgets (`c_media.js`)
- Radio widget: LCD display (station, status: connecting / on air / paused / no signal), play / pause, previous / next, tuning dial (slide through the stations of the current group), volume, groups Egypt / Saudi / Reciters / All, station list, auto fallback to a second stream URL, add your own stream URL, pop-out small window. Stations: built-in Cairo and Saudi Quran radios (verified streaming on 2026-11-19), reciter streams from qurango.net, and about 100 more Egyptian and Saudi stations loaded from radio-browser.info and mp3quran.net. Mock-free test with real internet: Cairo and Saudi both played, next / pause worked.
- YouTube widget: search box and results with thumbnails; click plays inside the widget (youtube-nocookie embed, no account) or, in "my browser account" mode, opens YouTube in a small window. Search uses public Piped servers (api.piped.private.coffee worked; others are tried in turn); if all fail the page offers "Search in a YouTube window". Pasting a link plays it. Playing inside the page depends on the video owner allowing embedding; the sandbox browser showed a black frame, so in-page playback itself is not verified.


### Update 2026-11-19 (late): media, logo, and the next big requests
Done:
- Media that does not stop (`c_media2.js`): the YouTube video lives in a floating widget outside every panel (drag the title to move, drag the bottom corner to resize, buttons for smaller / bigger / hide-picture-keep-sound / close; 120 px up to 640 px). A slim media bar (top of the page, movable to the bottom) holds radio and video controls (play / pause, previous / next, volume) and stays on every tab. "With my account" plays the video with the youtube.com embed so the signed-in browser account applies; no popup windows. Radio has a Minshawi tab: 4 live radios plus on-demand recordings (murattal, mujawwad, teaching mushaf, 1967 recording; 114 surahs, 110 in the 1967 set) with search, seek bar and auto-next.
- Ad skipping was NOT built (not possible from the page, and not something to build). Use a YouTube account without ads if needed.
- Logo: angular T.O X mark (T as a leaning "7", O as a leaning parallelogram ring with chamfers, X from two straight strokes, no triangle), tight spacing, same lean (38 degrees) for all, matches the reference picture's angles and proportions as closely as could be read from it.
To do next (owner's latest requests, not started):
1. Make each tool window imitate its source program exactly (AutoCAD for the CAD window: command line, ribbon Home groups Draw / Modify / Annotation / Layers / Block / Properties, status bar OSNAP / ORTHO / POLAR / GRID, model and layout tabs, black canvas, crosshair, ViewCube, wheel zoom and pan, window / crossing selection, grips, right-click menus, command aliases; Revit, Civil 3D, Primavera, Excel, Navisworks, mechanical, architecture likewise). Needs a per-program spec and many passes; one program per session is realistic.
2. Animation and simulation controls (play, pause, disassemble, assemble, walk) need a professional pass; add a Rotate on/off option; make the site plan and display options easy to find in the Views menu.
3. Timeline playback must show an indicator: current activity name, highlight the matching row in the schedule table and scroll to it, highlight its dates, type, early / late start and finish and the critical path while it plays.


### Update 2026-11-19 (night): logo final and the next requests
- Logo: T as a leaning 7 whose bar enters a notch of the O; O as a leaning parallelogram ring; X as a leaning inverted Y (one long leaning stroke with a leg branching down-right); one lean (38 degrees) for every part; under it a line with "6 8 6 8" in the middle and the small caption "TECHNICAL OFFICE X". The owner approved the look ("جميل").
- Requests received, not started (owner asked to begin with details and be told what comes next):
  1. Google Drive link: pull files from the owner's Drive, analyse them and write a log per file (what it is, what data it holds, dates, key facts) into the DC register. The web page cannot sign in to Drive without an OAuth client id; the assistant session can read Drive through its connector.
  2. A full Meeting Room / project desk: upload soil reports, photos, drawings, schedules; each upload is analysed, reviewed, archived and registered; minutes of meetings, incoming / outgoing, BIM matching, project management and risk management rules, recognised codes and engineering principles.
  3. A "colleagues" dashboard: agents (quantity, schedule, structural, architectural, safety, DC, risk) that report what they did, what they found, what is missing (e.g. rebar detail sheet, section, quantity differs from BOQ, drawing revision differs from the previous one), as a chat-like brief.
  4. A Projects tab: work on several projects, each with its own data, DC, calendar and room.
  5. Layers, groups and full options of AutoCAD, Revit, Civil 3D, Primavera and Navisworks; a research report on what those programs offer, and on consultancies, contractors and holding companies, to design the automation of our agents.
  6. A presentation dashboard for cost and project status.


### 2026-11-19 (late): see docs/STATUS.md for the full done / not-done list.


### Update 2026-11-19 (night): Drive review
Drive folder TOX (owner amrhamed913, shared): infra networks and Mechanical Wet utility, about 100 folders. The Lift Station branch holds 3 calculation PDFs and 4 DWG files. Read in full: SEWEGE TANK CALCULATIONS REV 01 (70 pages). Findings (10), reinforcement schedule and a model update (tank depth 6.45 m) are in the app (DC > التسريح) and in the Excel report kept on the Mac (08_Review/Drive_review_2026-11-19.xlsx, not in this repository). DWG files could not be read; export DXF or PDF. The page no longer flashes the old viewer at reload (the old container is hidden until the shell is ready). The red label with tag names on hover and the element chips in the chat come from the desktop app's element-selection tool (pointer icon in the browser pane toolbar), not from this page.


### Update 2026-11-19 (night): logo and render
- Logo: the first letter is now a true 7 (bar with rounded left end, stem flush at the bar's right end); every leaning stroke has the same width (3.8 horizontal = 3.0 perpendicular at the 38 degree lean, horizontal bars 3.0); O is a plain leaning ring; X is a leaning inverted Y.
- Render (`c_render.js`, Output tab > Render): HD, 4K, 8K, 12K, square, current view x4; tile by tile with sub-pixel averaging (1 to 16 samples), light presets (current, day from the sun path, golden hour, soft, studio), transparent background, PNG or JPEG. Tested: 1920x1080 with 2 samples and golden hour (15 s in a software GL browser). 8K and 12K were NOT run (too slow in the test browser); the size limits were checked. It is a raster render, not path tracing; for V-Ray-like lighting export OBJ / IFC to Blender (Cycles). Next options: a path-tracing renderer in the page (needs a newer three.js), HDRI and PBR materials, 360 panorama capture, Blender script export.


### 2026-11-19 (end of day): hand-over notes before the conversation is compressed
- Latest build committed locally (site repo, last commit: idle scene with contours); published page is one commit behind (publish needs the owner's yes).
- A separate session was started for source-program fidelity (Civil 3D first, then Revit, Navisworks, Primavera, SketchUp, Coohom-style home module); it writes docs/UI_SPEC_<program>.md.
- LibreDWG 0.13.3 is being built from source in /tmp/ldwg_src (install prefix /tmp/ldwg_install) to read the Drive DWG files; the clash-detection request (42-test plan in 08_Review/Clash_plan_2026-11-19.xlsx) waits for it. Nothing is claimed about clashes yet.
- Open items: DWG reading and clash run, Drive enumeration of the network folders, structural analysis tools (SAFE / SAP / ETABS / Tekla style), meeting-room desk and Projects tab, consultant mode, H.O X home / render module (PBR, HDRI, 360), path tracing.


### 2026-11-19 (last): lobby and pending list at the moment of compression
Done: 3D lobby after the password (`c_lobby3d.js`): long hall, door and sign for each of 16 offices, round table, pendant lamps, camera walk (entrance, side, plan, final frame) of 14 s, logo drawing itself, greeting, then the choices grouped by department (Design, Planning and cost, Quality and coordination, Documents and office, Project management, Environment and studio); click a door or use the list; Esc or Skip jumps to the end; flat lobby (`c_lobby.js`) is the fallback; the lobby button in the top line and the command `lobby` reopen it. Tested headless (screenshots checked); not tested on a real GPU.
Pending (owner's last messages):
1. Make the lobby closer to the reference picture (glass offices with screens, light strips, central table, hanging lights), department doors named by management structure (do not copy the owner's examples literally, derive the best set), and keep it free of "generated" looks: no emoji icons (replace the robot, lobby, radio, TV, speaker emoji with drawn icons), no purple / blue glow gradients, plain wording.
2. Reload shows stale builds: add a build stamp and a small "new version, reload" notice that checks `index.html` without cache every few minutes and on focus.
3. 3D view sometimes shows missing or inconsistent items: add a cheap model integrity check (parts vs BOQ items vs drawings vs site masses) that runs at load and on demand, and keep reviews limited to what changed.
4. Idle display after 7 minutes: logo at the bottom next to the "TECHNICAL OFFICE X" caption; large outlined moving text passing through horizontal and vertical bands in the middle third of the screen, cut by the bands (kinetic typography), more current motion ideas.
5. From before: DWG reading (converter works, one storm profile file read), clash job, source-program fidelity session (Civil 3D ribbon done), structural analysis tools, meeting-room desk and Projects tab, consultant mode, render module, security and speed pass.
Latest commits are local; the published page is several commits behind (needs a yes).

## Backlog after owner review 2026-11-19 (nothing below is built yet unless marked)
Done and published (dba4da8): top bar shows project, file and tab; dock widgets resize from every edge; new-version banner (build.txt).
1. Temporary auto-refresh every 15 min for today only, with a reminder to switch it off. Password: refresh keeps the session, closing the tab asks again (already so).
2. Intro after password (about 9 s, smooth, light and shadow motion) then a cut to the lobby. No Makkah footage in the repo: owner supplies licensed aerial footage or photos, otherwise an abstract aerial scene from code (labelled abstract).
3. Lobby merged with the Start page; each door: program name as small text (Revit, AutoCAD, Civil 3D, Tekla, SAP2000, ETABS, SAFE, Navisworks, Primavera P6, SketchUp, Coohom, Excel), one short line of abilities, hover card with 3-4 abilities; same text in the platform guide file. Vendor logos are trademarks: owner supplies official files, otherwise own neutral coloured icons.
4. Live radio and TV as floating mini player (audio only or video, movable, resizable from any edge, keeps playing): Saudi Quran, Makkah, Madinah, Egyptian Quran. Official stream URLs must be opened and checked one by one, none typed from memory.
5. YouTube mini widget: resize from every edge (still corner only).
6. Review simulation (M.X) and the assemble/disassemble animation; screenshots at several steps with the lobby hidden.
7. Right-click menus: each tool behaves like its program (CAD, Civil 3D, Excel, Primavera...).
8. BIM 7D and LOD (LOD 100-500, 7D asset management): owner to confirm which; review and add.
9. Library: official documents with references and screenshots, structural reinforcement, finishing, quantities, QC, site (ECP, SBC, ASCE, Eurocode, ACI; Shaker El-Behairy, Lacey). Owner supplies PDFs; nothing typed from memory. Two sources to mark "confirmed".
10. Watch unit for code updates and news (scheduled check, writes to Drive file).
11. Unified event log plus a log per item; storage and requests on Google Drive; e-mail link slot; periodic reminder to download a local backup.
12. Project modes: create, follow, modify; agents per discipline plus a reviewer; checks for missing data, clash, duplicate, error.
13. AI connection: user API key option, platform guide file (rules, prohibitions), MCP/WebSocket bridge (TOXAPI exists), GitHub and GitLab OAuth (needs client ID), n8n workflow; Jarvis/Hermes-like identity via the guide file.
14. Older items: DWG clash run (42 tests), Revit/Navisworks/Primavera/AutoCAD/SketchUp/Coohom fidelity, DC forms and BIM 360 intake, structural analysis tools, H.O X home/render module, security and speed pass, kinetic typography for the idle screen, integrity check of the model.

## Owner decisions 2026-11-19 (late)
- Automatic 3D lobby walk after login REMOVED (looks like a car garage / obviously generated). The hall stays reachable only by the "lobby" command (no camera walk).
- Intro after password: 2-3 shots (9-13 s) from the owner's own videos, full screen, object-fit cover, low volume; one of the two adhan sounds chosen per start. Waiting for the videos.
- Idle screen after the wait: the three code scenes plus shots from the owner's videos, full screen (cropped to fill, keep quality); adhan sound at prayer time (prayer times from an offline calculation with the method shown, editable; never invented).
- Videos go in a folder the owner names; files stay out of the repo unless the owner agrees (size, licence).

## Plan additions 2026-11-19 (owner)
- Logo as the browser tab icon (favicon, apple-touch icon, theme colour) - done in c_shell.js (drawn from the same mark).
- Mobile view: the page must be usable on a phone (touch targets, single-column dashboard, easy access to every option). Started: dashboard collapses to one column under 1000 px. Still to do: ribbon and docks on small screens.
- Later (not the online page): a mobile app and desktop software for every operating system (Windows, macOS, Linux, Android, iOS). Candidate route: package the same page (PWA first, then Tauri/Electron wrappers), no separate code base. Not started.
- Another session was opened by the owner to convert the Drive files into the three models with quantities, reviewed; this session does not duplicate it.
- Keep: sun, wind and seismic calculation option (offline code simulation, c_env/c_sim); review that it can compute and check.

## 2026-11-19 pm
- Site "pipes" from ME-GLY-01.dxf were drawn as 0.12 m cylinders buried 1.2 m: both values were assumptions (the DXF has X/Y only) and many of the 100 pieces are 1 m squares (pits, manholes). Now thin lines on the ground, coloured by layer class; nothing sized or buried by assumption. Real diameters/inverts to come from the other session's annotation scan.
- New tab T.X Plant (AutoCAD Plant 3D style): ribbon tab Plant, colour by pipe system, iso views, lists, checks, A1 iso sheet (plant layout). Final output sheets like EG24SAD0012-PS-3D-AW-Z3-01/02 (key plan, notes, legend, title block) are the target; the existing sheet maker is the base. Not yet matched 1:1.
- Coohom (interior design + render module) is NOT built. Render panel exists (tile on the dashboard).
- Simulation / assembly review: still open. Need an audit of every part against the sequence (late, missing).

## Simulation audit 2026-11-19
Measured when each of the 36 model parts first moves in every sequence (pw/t82.js).
- Full overhaul: only covers, pump, bolts, valves, screen move in the first 80 %; the other 25 parts (pipes, ladders, rails, odor unit, shed, board, slabs, crane...) only move in the last 20 % (exploded view). Five parts never move: wet-well wall and base, blinding, chamber floor and walls (structure).
- Pump removal, valve removal and screen removal move 2-6 parts by design.
- Step labels checked against c_dict.js: consistent.
- Added mode "Construction order" (SEQ.build): all 36 parts appear one by one in a construction order (blinding, base, walls, slabs, pipework, rails and ladders, valves, crane, pumps lowered, covers and equipment). The order is my engineering assumption; the owner/consultant should confirm it. 3D text labels still show for parts not yet built.

## Adhan and calculation checks 2026-11-19
- Adhan videos downloaded from Drive folder TOX/X into Media_X and media/ (not in the repo): azan_drone_1080p.mp4 (78 s, landscape, adhan audio) and azan_haram_720p.mp4 (43 s, portrait, adhan audio). c_adhan.js: prayer times computed offline (PrayTimes method: Egyptian, Umm al-Qura, MWL, ISNA; Asr school), dashboard card, adhan plays on the idle screen at the prayer minute (toggle). Checked: Cairo and Makkah results match typical published times within a couple of minutes; not an official timetable. I could not listen to the audio: confirm which voice you want.
- Calculation checks (pw/t86.js): sun (Cairo noon elevation 40.66, declination -19.29, sunrise 06:23, sunset 16:58), wind (Kz 1.0009 at 10 m exposure C, qh 834.5 N/m2 = hand value), ASCE 7-10 spectrum and base shear (Fa 1.56, Fv 2.4, SDS 0.312, SD1 0.16, Cs 0.0624, V 624 for W 10000). Missing: the extra minimum Cs for S1 >= 0.6 g; Eurocode 8 uses editable reference parameters; ECP 201 and SBC national tables are NOT typed in.

## Program shells 2026-11-20
Owner: each tab must feel like the real program (all menus, tools, tasks). Engine c_prog.js: a per-tab ribbon (RIBP) with the program's own tabs and panels, three rows of small buttons; commands that already work are wired, the rest are listed dimmed and answer "not built yet". A counter shows working / listed.
- Revit (R.X): 14 ribbon tabs, 274 commands listed, 101 wired.
- AutoCAD (C.X): 7 tabs, 172 listed, 59 wired.
- Civil 3D (S.X): 9 tabs, 115 listed, 78 wired (many point to the same survey pane).
Names and panels are from memory of current releases, not checked against Autodesk help page by page. Icons are our own line icons.
Next: Plant 3D, Primavera P6, Navisworks, Office ribbons; Project Browser / Properties / command line / status bar per program; then build the dimmed commands one group at a time (walls, doors, levels, grids first).
- 2026-11-20: Plant 3D (T.X) 6 tabs, 84 listed, 50 wired. Primavera P6 (P.X) 7 menus, 92 listed, 40 wired. Navisworks (N.X) 6 tabs, 110 listed, 79 wired. Still to do: Office ribbon, side panels per program, then the dimmed commands.
- 2026-11-20: c_revit.js. R.X now has real authoring tools: Level, Grid, Wall (chained, endpoint and grid snap, axis assist), Door and Window hosted in walls with real openings, Column, Floor; select, edit in Properties, Delete, own undo; Project Browser (views, levels, grids, quantities, CSV) and Properties panes in the model layout. Tested with real mouse clicks (pw/t93.js): 4 walls, door, window, column, grid; wall area deducts openings. Not built: roofs, stairs, ceilings, beams, rooms, tags, dimensions on these elements, families, plan views with cut planes, IFC export of these elements, link to BOQ. No WebGL in a browser = these tools cannot draw.
- 2026-11-20: c_panels.js. AutoCAD tab: Layer Properties Manager on the real CAD layers (new, rename, current, on/off, lock, colour, object count, delete empty, isolate / all on). Primavera tab: WBS tree with real activities, dates, total float, critical in red. Office tab (O.X): 8 ribbon tabs, 97 listed, 46 wired. Not built: layer freeze / linetype / lineweight, EPS / OBS / resources, cell formatting commands of the Office ribbon.
- 2026-11-20: c_cad2.js. AutoCAD tab gained 14 working commands: Arc (3 points), Polygon, Ellipse, Construction Line, Point, Trim, Extend, Fillet, Chamfer, Array, Join, Hatch, Area, ID Point. Curves are stored as polylines (no true arc / ellipse entity). Checked numerically in pw/t95.js and t96.js. AutoCAD now 78 working of 173 listed. Still dimmed: spline, gradient, region, stretch, break, blend, lengthen, align, blocks, xrefs, leaders, tables, parametric constraints, plot styles.
- 2026-11-20: c_revit2.js. R.X gained Beam, Roof (flat or gable by footprint), Ceiling, Stair, Ramp, Railing, Isolated Foundation, Foundation Slab, Room (area tag), Aligned Dimension, Model Line, Model Text, all through extension hooks (RVX) in c_revit.js. Numbers checked in pw/t97.js (stair 18 risers of 167 mm for 3.0 m; ramp 1:6; gable roof surface 66.03 m2; beam 1.0 m3; foundations 20.33 m3). Revit tab: 127 working of 279 listed. Not built: rooms detected from walls, tags by category, hip roofs, stair landings, curtain walls, families, plan cut views, IFC export of these elements.
- 2026-11-20: c_revit3.js. R.X elements now feed the BOQ (rows R01-R12 through getItems(): walls, columns, slabs, beams, foundations m3; roofs, ceilings m2; doors, windows, stairs, ramps no.; railings m; unit cost edited in the BOQ like any item) and the IFC2X3 export (IfcWall, IfcColumn, IfcBeam, IfcSlab FLOOR/BASESLAB/ROOF, IfcDoor, IfcWindow, IfcStair, IfcRamp, IfcRailing, IfcFooting, IfcCovering as faceted solids under the storey, Pset TOX_RX). Checked with ifcopenshell 0.9.0: file opens, 13 RX elements contained, 0 validation issues. Openings are real geometry gaps, not IfcOpeningElement; one storey only; no materials or types.
- The Claude desktop browser pane currently returns null for webgl / webgl2 (checked with getContext): the 3D view cannot draw there until the app or its GPU process restarts. Not a page fault.
- 2026-11-20: c_soft.js. Software 3D renderer (2D canvas, painter's algorithm, flat shading, lines, sprites, section planes) used automatically when WebGL cannot be created; force with localStorage xto-soft=1 or command "soft3d". Verified with WebGL disabled in Chromium (7282 triangles in 15 ms) and in the Claude desktop browser pane, where webgl / webgl2 return null: the model now draws there. Limits: no textures, no per-pixel lighting, no shadows, intersecting transparent faces can sort wrongly; redraws only when something changes.
- 2026-11-20: c_hvac2.js. V.X: AC unit electrical (input kW from cooling / COP, current, design current, breaker from the standard series, cable size from voltage drop; ampacity only if the user pastes a code table) and Duct plan (draw runs on a plan, each run is a duct-table row with its length, drawn at sized width, diffusers and units as markers). Checked by hand (pw/t101.js). No automatic flow balancing, no earth conductor / short-circuit checks.
- 2026-11-20: c_duct2.js: duct flow distribution (tree rooted at the AC unit marker, runs split at diffusers, flow = sum of downstream diffusers, critical path = highest pressure drop root-to-leaf; loops and unconnected runs reported). Checked by hand (pw/t102.js). c_cad3.js: AutoCAD Spline, Stretch, Break, Lengthen, Align, Block create / insert (copies, no live references), Table, Leader, Revision Cloud, Match Properties; layers Freeze, Linetype, Lineweight, Previous. Checked numerically (pw/t103.js). AutoCAD 98 working of 173. Still dimmed: gradient, region, wipeout, blend, parametric constraints, dimension styles, plot styles, xrefs, data extraction.
- Note: the build grew to about 3 MB because the other session added c_msite_data.js (whole-site master plan data, 856 KB).
- 2026-11-20: c_rvplan.js. R.X floor plan with a horizontal cut (default 1.2 m, editable): walls cut as hatched poche with real openings, doors with swing arc, windows (3 lines), columns taller than the cut, stairs with treads and arrow, ramps, railings, rooms with name and area, grid lines with bubbles, dimensions, beams and roof above the cut dashed. Level picker, layer toggles, pan and wheel zoom, click selects the element, SVG export, and "To CAD editor" (copies the plan onto layers A-WALL, A-DOOR, A-GLAZ, A-COLS, A-STRS, A-ROOM, A-GRID, A-DIMS in metres, so the CAD PDF / SVG / DXF exports work). Checked in pw/t104.js: 8 wall pieces, 2 doors, 1 window; a 1.0 m column is cut only when the cut is below 1.0 m. Not built: plan scale and print sheet, elevations and sections cut from R.X elements, view range with a bottom clip, multi-level stairs.
- 2026-11-20: c_rvsec.js. R.X elevations (N, S, E, W) and sections along X or Z at an offset, drawn as SVG (no WebGL): cut elements hatched, elements beyond the cut light, openings cut in walls, roof profile, stairs and ramps in profile, level lines, grids that run along the view direction, SVG export and "to CAD". Checked in pw/t105.js (z=3 section: 2 walls, column, floor, roof, beam, slab cut; z=0 section: south wall cut around the door and window). Limits: only axis-aligned cut lines, only four elevation directions, no section marks on the plan, no scale or print sheet.
- 2026-11-20: c_gis.js + c_gis2.js. New tab G.X GIS (ArcGIS Pro / QGIS workflow): real interactive web map (OSM, Esri imagery / topo / street, CARTO, OpenTopoMap, Esri Wayback history, place-name and road overlays), project marker, cursor coordinates (WGS84 DD and DMS, UTM, Web Mercator, custom TM), Go-to / geocoder search (Nominatim), identify with elevation (Open-Meteo), geodesic distance (Vincenty) and area, point / line / polygon drawing, buffer (circle for a point, convex hull for a line or polygon), layers, bookmarks, import GeoJSON / KML / GPX / CSV, export GeoJSON / KML / CSV, coordinate converter (WGS84, DMS, UTM, Web Mercator, custom Transverse Mercator with ellipsoid and 3-parameter datum shift) and reference tables (coordinate system types, imaging satellites, GNSS). Ribbon Map / Edit / Analysis / Imagery / Coordinates / Share. Checked: Vincenty reproduces the Flinders Peak - Buninyong test line (54972.271 m); the Krüger TM agrees with the older Redfearn UTM code to under 1 mm for Cairo, Riyadh, Makkah, Sydney, Moscow; datum shift and TM with latitude of origin round-trip exactly; 21 of 21 tiles loaded. Not pre-filled: any national grid or datum parameters (enter yours). Not built: elevation profile along a line, raster analysis, true buffer for concave shapes, vector tiles, 3D scene, attribute tables.
- 2026-11-20: Command reference. Four background research sessions wrote docs/research/ (BIM_ECOSYSTEM.md, AGENT_CONTROL.md, cmd_*.json with Arabic and English descriptions of 939 commands, gap_*.md per program, sketchup_tab_spec.md, coohom_tab_spec.md). c_cmddata.js embeds the descriptions (64 backed by a cited help page, the rest from memory and marked with a dot). c_cmdref.js adds the "Commands reference" button at the end of every program ribbon: table of tab, panel, command, real command key, status (works / not built), what it runs in T.O X and the Arabic or English explanation; search, filter, CSV; hover tooltips on ribbon buttons show the explanation. Coverage: 100 % of listed commands have a description (AutoCAD 173, Revit 280, Civil 3D 115, Plant 3D 84, Primavera 92, Navisworks 110, Office 97, GIS 84). Next: build from gap_*.md in priority order.

## 2026-11-20 — One project many tabs + Agent studio
- c_xfer.js: tab grouping, drag tabs/project card, transfers model>hx/gis/hv/sched (tested t111/t112).
- c_agent2.js: agent panel (text/voice), visible agent cursors, brief wizard builds house via real R.X tools, screen record, action log CSV (t113).
- c_agent3.js: 11 discipline checklists with auto-checks, gap list, optional Claude model bridge with tool loop (key in sessionStorage only, not tested against the live API) (t114).
- Not done: richer tools for model, web research tool, learning memory, more agents' skills; reports from compare/security/tools sessions not yet acted on.

## 2026-11-20 — Cinematic entry, Missions hub, news strip, smart save prompt
- Entry: password → 3 cinematic shots (Kaaba, Green Dome, Kaaba; slow push-in, cross-dissolve, letterbox, drifting slogans, 6868 under Technical Office X) → logo card → Missions hub tab.
- c_hubx.js: Missions tab (5 intents, roles owner/contractor/consultant, lifecycle, icon grid with drop of the project), news strip with x (XC.news_toggle), TOXAPI.addNews.
- c_ind.js xAskSave: asks only for main project tabs with real changes; "do not ask again" per tab type.
- Footage note: Kaaba is small in the source drone footage; clips are crops. A close Kaaba shot needs new footage. Source clips carry third-party watermarks (Ezzat photography, Ahmed Insta Design): check rights before publishing; cine_dome clips crop the watermark, the top-down haram_s clip may show one.
- Pending: research session cde-opensource-research (OPENSOURCE_CDE_PLAN.md); real news feeds; parallel multi-cursor agent runs; hub icon colours.

## 2026-11-20 (later) — CDE layer, menus, occasions, themes
- c_cde.js (plan items 1-4): DC "Folders" tab (explorer, back/up/breadcrumb, counts, overdue), ISO-style states + revisions, role workflow (A/B/C/D codes), naming check, hash-chained audit, transmittal export/import with SHA-256 (tamper test passes). Roles are labels, no server. Tests t120.
- c_menus.js: "New tab" written once as a drop-down with nested groups; any 3+ buttons sharing "X:" prefix collapse to "X ▾". t121.
- c_occ.js: Hijri occasions (Ramadan, Eid, Hajj, Dhul-Hijjah, new year, Mawlid, Jumu'ah, Saudi and Egypt days), daily seed for intro shots/slogans/idle order, themes (accent, tab-open motion, icon weight) + auto-follow occasion. Hero card in the middle of the hub follows the occasion. t122.
- Watermarks: Kaaba shots now from makkah_aerial (no mark), Madinah shots crop the bottom mark; haram_top_s1 ends before the AHMED logo (appears about 21-26 s).
- Pending: media-sources-research (free-licence video list; owner approves downloads), plan items 5-10 (IFC viewer, BCF, Gantt, pdf.js, MOM, SQL), loading spinner variants, ribbon option parity per program, hub icon colours.

## 2026-11-20 (evening) — icons, bridge, media pool, 7-second rhythm
- Icons: global svg.xi style (no more black icons), settings icon added, hub cards use the line icons, hub tab has its own ribbon tab set.
- tools/tox_bridge.py + c_bridge.js: MCP stdio and plain HTTP door for any agent (token, 127.0.0.1, page connects out). 13 tools incl. say (Arabic), run_command, build_house, view_snapshot. Typed or spoken answers to agent questions now work. Tested via HTTP (t125) and MCP initialize/tools/list; not tested inside Claude Code itself.
- Media: 11 clips from the 12 approved downloads (a04 tawaf skipped: close-ups of people; a02 night skipped: washed out). Burned-in caption on Commons clip cropped. Credit line in Themes pane (CC BY 3.0 Amm Salim). Occasion pools pick the middle shot.
- 7-second rhythm: shots 7 s, idle slot 21 s, slogan motion = one of 7 patterns by date, 7 s cycle.
- Parallel sessions writing chunks into site/src/incoming/: mod-gantt, mod-mom-issues, mod-regq, mod-parity. Integrate when they report.

## 2026-11-20 (night) — four modules merged
- Merged into the chain: c_mom, c_issues, c_regq (after c_cde); c_parity_cad/rvt/p6 (after c_prog_more); c_gantt (after parity). Page 3.54 MB.
- Merged-build checks: gantt 37/37, mom ALL PASS, issues ALL PASS, parity 126/126, regq 61/62 (the one miss is only tab order: MOM tab sits between Folders and Query).
- Stubs now working: +14 AutoCAD, +14 Revit, +12 Primavera (+8 Primavera view commands wired by the Gantt chunk).
- Not validated: BCF against a third-party reader; charts visuals/dark/mobile for the follow-up dashboard; Gantt in Safari/Firefox/touch.

## 2026-11-20 (late night) — AI providers and always-on voice (c_ai.js)
- Pane "AI and voice" (command ai_open): provider presets (rules, Ollama, LM Studio, Groq, OpenRouter, Gemini, any OpenAI-compatible, Claude by key), model name, key (tab only), test button. Egyptian persona system prompt, tool-calling loop over the same 8 studio tools.
- Speech to text: browser, or any /v1/audio/transcriptions server (local faster-whisper, whisper.cpp, Groq...). Hands-free listening (ai_listen) with energy-based voice detection and a wake word = assistant name (default جارفيس).
- Tested with a mock OpenAI server (tool call then reply, key header, wake word on/off, unreachable message) and a mock STT endpoint (multipart with language=ar). NOT tested: real Ollama/Groq/Gemini, real microphone, Web Speech continuous mode, speaking replies. Model tags and base URLs are suggestions from memory.
- Research running: ai-stack-research -> site/docs/research/AI_STACK_PLAN.md.

## 2026-11-21 (after midnight) — tab-to-Claude inbox, tab close motion, second parity wave
- Bridge: POST /inbox (tab -> ~/.tox/inbox.jsonl + unread list), POST /reply and MCP tools tab_messages / reply_to_tab (reply shows in the tab chat). Provider "Claude Code session" in the AI pane. Tested end to end (t128). Live use needs the bridge running and a Monitor on the inbox file (expires every 30 min, must be re-armed by the session).
- Tab close animation follows the theme motion (t129).
- Second parity wave running: p2-cad-survey, p2-revit, p2-p6-nav, p2-plant-office-gis (chunks land in site/src/incoming2/).
- Waiting for owner approval: web-ifc (MPL-2.0, npm 0.0.80) and pdfjs-dist (Apache-2.0, npm 6.5.438) to be fetched into the page for an IFC viewer and PDF markup. Sizes not verified (CDN gave no length).
- Known test caveats: regq test expects a different tab order (MOM tab sits between Folders and Query); pw/t118.js points to a deleted temp page.

## 2026-11-21 — orb, now-playing widget, clip pruning, libraries
- c_orb.js: animated orange orb (idle breathing, listening ripples driven by the mic level, thinking = chasing dots, speaking pulse) in the agent panel, hub and the floating ball. Dictation: REC (red) fills the text box live, nothing is sent until Send (or "send when I stop"). "Talking to" picker: rules, Ollama, LM Studio, Groq, OpenRouter, ChatGPT/OpenAI, Gemini, any server, Claude key, Claude Code session. Tested with a fake microphone (t130).
- c_nowplay.js: one control in the top bar next to search for radio, YouTube (hidden picture too), TV, playlist and any audio/video: pause, stop, back/forward 10 s, timeline, volume, skip, source link, switch when several play. YouTube ads cannot be skipped from outside the frame. Commands np_toggle/np_stop/np_back/np_fwd/np_skip for the agent.
- Idle/intro clips pruned by measurement (jitter via phase correlation, brightness): removed haram_s2-4, cine_kaaba_b, madinah_s2, makkah_s1/s2, haram_top_s1, cine_dome_b, n_crescent, n_gold, n_topo, n_iftar. Kept 12.
- Downloaded (owner approved): web-ifc 0.0.80 (MPL-2.0; iife js 6.3 MB, wasm 1.7 MB) and pdfjs-dist 3.11.174 (Apache-2.0; 0.32 + 1.09 MB) into site/vendor/. Older pdf.js chosen on purpose: the 6.x build is ES-module only and fails from file://.
- Sessions running: mod-ifc, mod-pdf, mod-hx-assets, and the four p2-* parity sessions.

## 2026-11-21 — calm HUD, REC fixes, local serve, Egypt scenes, wave 2 merged
- Agent look: thin-line HUD orb (monochrome), neutral discipline chips with small line icons, one quiet colour for agent cursors, floating yellow ball removed, small monochrome agent icon in the top bar next to search. Model picker uses plain English API names.
- REC: instant feedback, errors are shown (blocked mic / speech service, no mic, offline), speech starts before the mic level meter. Root cause of "nothing happens": Web Speech and the microphone are unreliable from a file:// page.
- tools/tox_bridge.py --serve serves the site at http://127.0.0.1:8766/ (secure context, range requests for video, /boot hands the token only to same-origin requests, traversal and dotfiles refused) and the page connects by itself.
- Idle: 5 procedural Egyptian scenes (pyramids and caravan, Cairo mosques skyline over the Nile, Ibn Tulun style arcade, geometric star lattice, felucca on the Nile) with a palette chosen by date.
- Wave 2 merged: C.X 26, S.X 33, R.X 71, P.X 23, N.X 28, T.X 20, O.X 44, G.X 19 more commands. Test log: runall.log.

## 2026-11-21 (morning) — missions, free typing, units, tiers, Whisper, icons, merges
- c_mission.js: slow cursors (fast/normal/slow), highlight on touched controls, numbered narration card away from the cursor, dock with progress bars and pause/stop per mission, step-by-step mode (Do it / Skip / Stop), pause-all, chime + tab flash + title flash when a mission ends, split view of 4 tabs (ag_split), one undo step per mission (xaTxn; needs the template session's snapshot of R.X to restore it on toolbar undo).
- c_agent4.js: every wizard question accepts typed or spoken answers; lengths in m/cm/mm/ft with the interpretation echoed; "3 houses" builds side by side; floors/rooms in digits or words.
- c_ai.js: cheap model first with an escalate tool, strong model second (optional); providers ChatGPT/OpenAI added; STT provider "T.O X local Whisper (bridge)".
- tools/tox_bridge.py: --whisper [auto|base|small|large-v3-turbo] (faster-whisper if installed, else the existing openai-whisper venv), POST /v1/audio/transcriptions. Measured on this Intel i7: base 3-4 s for a 6 s Arabic sentence with visible mistakes; small ~11 s; turbo too slow. Groq Whisper or faster-whisper int8 recommended for speed and accuracy.
- Start_TOX.command in the Viewer folder starts server + bridge + Whisper and opens http://127.0.0.1:8766/.
- Merged: IFC viewer (web-ifc), PDF viewer (pdf.js 3.11.174), icons (favicon, manifest, apple-touch, maskable). Egypt: 3 real Giza aerials (Pexels, Blanka OG); procedural Egypt scenes removed on the owner's request.
- Waiting: templates (blank project vs sewage template), H.X materials/furniture session.

## 2026-11-21 (noon) — templates and H.X assets merged
- c_templates.js: TEMPLATES blank / sewage / house2 / office3, chooser dialog (New command, hub card, agent "new project"), blank project hides the station (BOM 0), toolbar undo now carries R.X, GIS, issues, MOM (snapshot under "tp"). Known: Params tab and boq() still show station numbers when the station is hidden; DC register stays cross-project; GIS pane internal undo not snapshotted.
- c_hxassets*: 40 CC0 textures, 25 GLB models, Materials pane, Furniture catalogue, better-lighting render (soft shadows, sky, ACES). Assets in vendor/hx-assets (9.4 MB, CREDITS.md). Tested only on software GL.
- Merged-build checks: parity 126, rvx 203, cxsx 105, own smoke t140 (templates, undo, sewage back with BOM 46).

## 2026-11-21 (afternoon) — Output Center, voice fallback chain
- c_outputs.js: Output Center (command out_open): 10 numbered deliverables from the open project (sheet PDF, sheet SVG/PNG/DXF, IFC/DXF/OBJ, schedule, BOQ, design data, technical office pack, site plan, 3D image, project JSON), versioned ZIP packages with README, style fields (paper, theme, revision, project, drawing no., notes) editable by words ("paper A1, revision B"), mission progress, download, "mark final". Tested end to end (zip integrity, v2 after an edit, final download). Sheet 3D view falls back to a placeholder when the 3D canvas is hidden. Sample sheets from the owner will refine font, scale and title block.
- Voice: REC now falls back by itself (browser speech -> local Whisper through the bridge), shows the reason, and has a "Voice check" button. Likely cause for the owner: an embedded browser without Web Speech; open http://127.0.0.1:8766 (Start_TOX.command) so the bridge Whisper connects. In headless Chrome Web Speech did work from file://.
- Sessions running: mod-stt-local (in-browser Whisper/Vosk), res-render-tools, mod-render-studio, mod-libraries, mod-links.

## 2026-11-21 (evening) — slowness, media menu, compact ribbon
- Cause of the "very slow" report: the Mac was running 6 parallel sessions (headless Chrome with software GL, ffmpeg minterpolate x4, Whisper): load average 200-750 on 12 threads. Reniced test processes, killed the ffmpeg batch, stopped 3 sessions (render-studio, libraries, haram media), told all sessions to run one browser/encode at a time. Rule going forward: at most 2 heavy sessions at once.
- Code speed-ups (unmeasured under that load): login canvas 880 px at ~22 fps and paused when hidden; 3D loop does not render while login/splash/intro/idle/hidden covers it and drops to ~20 fps when untouched and nothing plays (c_speed.js); intro videos load only after the first touch of the login fields.
- c_mediamenu.js: the radio button in the top bar now opens a small popover with TV / Radio / Video tabs, play/pause, stop, mute, volume and quick picks; full player kept.
- c_menus.js: compact ribbon (groups with more than 4 commands become 2-3 row grids of small icon+label buttons), toggle ribbon_compact.
- Pending: perf audit (mod-perf), render studio, libraries, haram footage, colour links and local STT deliveries.

## 2026-11-21 (night) — idle rebuilt, adhan interlude, libraries merged
- c_idle2.js: idle shots are plain video/img layers cross-faded by CSS (no canvas copy, normal playback speed, slow CSS zoom), next shot preloaded; generative scenes on a 45% canvas at ~24 fps. Adhan = adhan.m4a over 10 shots from inside Masjid al-Haram (5 videos, 8 photos, 10.5 MB, credits in ADH_CREDITS.txt). No Masa'a, Zamzam, roof or courtyard footage qualified. Tested: cross-fades, removal, adhan audio plays.
- Libraries merged (c_lb_core/cad/rvsx/px/ox): 91 CAD blocks, 32 hatches, 13 linetypes, 45 R.X family types + 12 assemblies, S.X/P.X/T.X/V.X/O.X/G.X libraries. Session tests 119 checks in its copy; merged build only load-checked.
- Stubs now: gis 7/86, model 67/280, draft 35/173, survey 4/115, plant 14/84, sched 8/92, coord 3/110, office 9/99. 1418 commands, 17 tab types.
- Delivered, NOT merged: colour links (incoming5/c_link*.js, untested by its session), perf.js (in progress), render studio (stopped mid-way), local STT (benchmark unfinished; whisper-tiny WER 0.55).
- Running: mod-navis. Rule: at most 2 heavy sessions at once.

## 2026-11-21 (night) — Navisworks rebuild and Q.X spreadsheet merged
- N.X (c_nv_core/tl/clash/view): Navigator (selection tree, sets, find items, properties, appearance profiler), TimeLiner (tasks, data sources, configure, simulate with date overlay, Gantt planned vs actual, TOXAPI.timelinerFrame for the render studio), Clash Detective (hard/clearance, grouping, status), viewpoints, sections, animator, Tag ID, default layout. Tests on the merged page: 48 + 32 + 38 + 24 (x2 sizes). Stubs for coord: 2 of 115 (FBX and Google Earth KML).
- Q.X (c_qx_*): own grid engine (canvas, 20,000 rows in ~0.5 s, formulas with dependency graph, ~60 functions, pivot, charts, dashboard, xlsx with formulas, TSV paste, Excel shortcuts, Excel-style ribbon tabs for the takeoff tab, 83 commands). Browser test 75/75, engine 136/136 in Node. Not opened in real Excel.
- Regression on the merged page: parity 126/126, px2 149/149.
- Not merged: colour links (fixing), reality capture (running), local STT, perf audit.

## 2026-11-20 — colour-linked windows merged
c_link.js + c_link2.js at end of chain (after c_qx_bi.js). Colour dropdown per window, same colour = linked (element/level/time/view/selection/camera), open any tab as a window, TOXAPI.link/unlink. Tests: link_test 43/43, parity 126, px2 149. Not tested: on the Start tab itself, real GPU.

## 2026-11-20 — F.X Capture (reality capture) merged
5 chunks c_rc_*.js at end of chain. Flight planner (grid/double grid/oblique/orbit/corridor), building planner (OSM, sun, wind, LOS), imports (GPX, NMEA, CSV, KML, GeoJSON, DXF, LandXML, EXIF, LAS), terrain/contours/cut-fill/accuracy, exports. rc_test 330/330, parity 126. Not tested: DJI KMZ/Litchi/QGC/Mission Planner in real apps; Overpass/Open-Meteo only mocked.

## 2026-11-20 — free AI providers + local in-browser Whisper merged
freeai_data.js + freeai.js after c_orb.js (28 presets with Free badges, free chain with 429 fallback, copy/paste relay, n8n webhook, WebLLM stub); sttlocal.js at end of chain (Whisper tiny/base via transformers.js, vendor/stt/ ~142 MB kept OUT of git, ship locally). Tests: freeai 88/88, parity 126, rc 330, link 43. Not tested: real providers/CORS, WebGPU, merged-page STT end-to-end (harness double-injects), n8n for real.

## 2026-11-20 — audit: explainer graphics + resize guard merged
c_ui2.js/c_ind.js: one picture set (21 pictures, 0 fallbacks) shared by hover, Guide, part card; 4 tab descriptions + 2 icon aliases added; resize guard (GL setSize 5->1 at startup). Tests: parity 126, px2 149, rc 330, freeai 88, link 43. Open: 113 ribbon buttons have no description (need bilingual wording); two chart renderers (Q.X, O.X) not merged; window.__lsv.ev eval hook should be removed from public build; no CPU gain proven (machine overloaded).

## 2026-11-21 ribbon hover text
c_xdesc2.js: bilingual hover descriptions for the 85 ribbon commands that had none (0 left). Public build has no __lsv.ev; tests use site/index.test.html.

## 2026-11-21 login + auto-update
Login accepts Arabic-Indic digits, spaces, empty user. c_upd.js polls build.txt every 60s and shows a refresh banner.

## 2026-11-21 Render Studio merged
rs_core/rs_out/rs_ui in chain before c_xdesc2. Stills (to 8K tiled), turntable/walk/fly/timelapse/section/day video as WebM or PNG zip. Own test 52/52 in session; after merge parity 126, px2 149, freeai 88, link 43. Not tested: real GPU, MP4, audio.

## 2026-11-21 bridge proxy merged
tox_bridge.py: /proxy (allow-listed, no redirects, public IPs only), /mcp (streamable HTTP for n8n), --isolate opt-in. freeai.js retries blocked providers through /proxy. Tests: 94 bridge, 22 chrome, 88 freeai. Not tested: real providers, n8n.

## 2026-11-21 vector 3D export merged
vx.js: current/saved view as SVG, PDF, DXF (true vectors); ribbon vx_export; Render Studio Stills tab block. Test 34/35 in session (35th screenshot timeout), parity 126, px2 149. Not opened in Illustrator/Inkscape/AutoCAD.

## 2026-11-21 perf merged
Login first (early script), main script and three.js started after first frame, lazy WebGL (lazygl.js), jsPDF lazy, resize never to 0. Login frame 3.2s->0.52s, CPU to ribbon 10.7s->2.2s (SwiftShader, loaded Mac, median of 5; real GPU not measured). parity 126, px2 149, freeai 88, link 43.

## 2026-11-21 privacy merged
privacy.js + privacy_patch.py (run by ./make.sh after patch_v3.py): neutral templates/exports, wipe_project (typed confirm, trusted click), AI request gate with redaction, Sensitive-project switch, minimum context, outbound log; bridge inbox retention + /inbox/clear. Tests: privacy 109, parity 126, px2 149, freeai 88, link 43. Limits in docs SECURITY_PRIVACY.md (best-effort redaction; sample geometry/coordinates still embedded).

## 2026-11-21 demo stage 1 merged
Project 6868 guided demo: player engine + chapters 0-2 (welcome, project from template, R.X building), lazy-loaded; buttons on Start page and entry screen; TOX.demo.start(). Chapters 3-12 not written yet. Tests: demo smoke/run/stop, parity 126, px2 149, freeai 88, link 43, privacy 109.

## 2026-11-21 demo stage 2, shared chart renderer, lazygl fix
Demo: all 13 chapters (3-12 real where state asserts are possible; rebar design, construction phases, detailed specs NOT done). Charts: one toxChartSvg for Q.X and O.X (84/84 golden). lazygl set-trap fix (Render Studio no longer kills the live 3D view). Tests: parity 126, px2 149, freeai 88, link 43, privacy 109, demo run 0-12 at 4x, charts 8. docs/PROJECT_PHASES.md = phase map for the next demo rewrite.

## 2026-11-21 big merge: structure, MEP, price/spec, QA/plan, photo-to-3D, voice samples, safe sample
New chunks in chain (before c_xdesc2): ph_* (Photos to 3D via NodeODM/Docker through tox_photo.py in the bridge), se_* (structural design engine), ps_* (price book, specs, finishes), rcs_* (RC skeleton + rebar BBS), qa_* (WBS, hold points, cash flow, permit), md_* (MEP sheets). Bridge: tox_photo.py + diff. Privacy: phWipe hook. Demo voice chunk (demo_voice.js) added; audio samples in media/voice/samples (owner must listen). Sample project neutralised (incoming18, sample_check 31/31 with one documented false-positive hash). Tests: parity 126, px2 149, freeai 88, link 43, privacy 109, charts 8, sample_check 31, demo smoke. Size now 5.4 MB (all text). NOT done: demo rewrite (clean exit, apartment building), separation of the pump-station sample from standard views, GIS maps and imagery list, house model research. These sessions are still open.
