# BRIEF (read this first, ~1 min). Open other docs only if needed.

Project: Sewage Lift Station 3D/BIM viewer (BVT-1). Single page `index.html`, source `src/lift_station_3d.html`.
Rules: concrete thicknesses per structural calc (not 430); no "limits" section on page; no invented ECP 203 values; no Autodesk logos; never claim a file opened in AutoCAD/Revit/P6 unless tested.
Tabs: views, cad (Draw/Edit: AutoCAD-style 2D editor, DXF/SVG/PNG/PDF), anim, sched (4D + Primavera-style window), safety, sec, edit, parts, fam, bom, sheet, export, share.
Schedule: activities in `ACT` (fix days + qty/rate from BOQ). Dimension change -> BOQ -> durations -> CPM -> 3D timeline. Exports: XER, MS Project XML, XLSX, CSV.
Agent API: `window.BVT.call(...)` (see AGENTS.md). Learning: LEARNING_LOG.md. Decisions/status: MEETING_ROOM.md (long, skip unless needed).
Open: real schedule data, HSE review, electrical specs, pump 7 vs 8 L/S, pipe lengths, rebar design.
Token rule: read BRIEF only; grep exact symbols; never dump whole files.
Also: undo/redo 120 steps (Ctrl+Z/Y), Projects library (save/open/duplicate/upload/download), follow-camera + explain card + voice.
Roadmap (not built): widget workspace, structural/MEP/electrical analysis links (ETABS/SAP/Tekla via IFC/DXF/CSV), reinforcement schedules (needs structural design), specs and price comparison, data validation, Power BI export.
Project calcs (amr.rar): pump selected 8 L/s; codes ACI 318-19 / ACI 350 / SBC 304; C40, fy 420; structural calc governs thicknesses (decided): 400/400/200/300/400/200. Details: MEETING_ROOM.md last section.
Site plan tab (3D): ME-GLY-01.dxf linework + tanks + pipes; footprints approximate, heights assumed.
