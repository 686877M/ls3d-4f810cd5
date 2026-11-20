# Gap: Navisworks vs our `coord` tab

Legend: **[V]** verified from a page read. **[M]** from memory. Own wording.

Pages read:
- [V1] https://help.autodesk.com/cloudhelp/2022/ENU/Navisworks/files/GUID-3539A344-FD91-4F2C-8744-2A5A9828B4C1.htm (Reference for Dockable Windows)
- Search-result snippets only (pages not fully read): Dockable Windows 2014; Default Keyboard Shortcuts 2022 (GUID-E5041421-...); Overview of Clash Detective 2014; Use TimeLiner and Animator for Time-Based Soft Clashing 2024; Link to a TimeLiner schedule for soft clashing 2014.

## 1. What real Navisworks has

### Dockable windows [V1]
- **Main Tools**: Clash Detective (Manage only), TimeLiner, TimeLiner Playback, Autodesk Rendering (when rendering system on), Animator, Scripter, Appearance Profiler.
- **Review**: Selection Tree, Sets, Find Items, Selection Inspector, Properties, Comments, Find Comments, Measure Tools, Set Scale by Measurement.
- **Quantification**: Quantification Workbook, Item Catalog, Resource Catalog.
- **Viewpoint**: Saved Viewpoints, Tilt, Plan View, Section View, Section Plane Settings (3D workspace).
- **Multi-Sheet**: Sheet Browser, Find Item in Other Sheets and Models.
- Windows dock, group, auto-hide, pin [V1 related topics].

### Shortcuts [snippet of 2022 shortcuts page]
Ctrl+F2 Clash Detective, Ctrl+F3 TimeLiner, Ctrl+F5 Animator, Ctrl+F6 Scripter, Ctrl+F8 Quantification Workbook, Ctrl+F12 Selection Tree, Shift+F2 Sets.

### Behaviour
- TimeLiner links model objects to schedule tasks (data sources: MS Project, P6 etc. [M]); Clash Detective can run time-based (soft) clashes against TimeLiner/Animator [snippet].
- Clash Detective can ignore same-selection-set clashes [snippet].
- Ribbon tabs [M]: Home, Viewpoint, Review, Animation, View, Output, plus contextual Item Tools, Render. Home panels: Project, Select & Search, Visibility, Display, Tools. Our tab structure already mirrors this.
- File formats [M]: **NWD** (all-in-one published snapshot, includes markups/viewpoints/clash results), **NWF** (federated links to source files + review data), **NWC** (cache created from CAD/BIM exporters, read-only link). Freedom/viewer reads NWD. Native readers for DWG, RVT, IFC, DGN, SKP, etc.

### Details by tool [M unless noted]
- **Selection Tree** [V1 window exists]: views Standard / Compact / Properties / Sets; right-click hide, require, set appearance, scene stats.
- **Sets**: selection sets (static) vs search sets (live rule); folders; export/import XML.
- **Find Items**: conditions on category/property/value with operators; combine with AND/OR; save as search set.
- **Clash Detective**: Tests (Rules / Select / Results / Report tabs). Types: hard, hard (conservative), clearance, duplicates. Tolerance, link to TimeLiner. Result statuses New/Active/Reviewed/Approved/Resolved, grouping, assign, auto-viewpoint, reports.
- **TimeLiner**: Tasks / Data Sources / Configure / Simulate tabs; task types (construct, demolish, temporary); planned vs actual; attach by sets; Gantt; cost columns.
- **Quantification**: takeoff via model/virtual/ 2D; catalogs; export workbook.
- **Animator**: scenes, cameras, animation sets with keyframes (transform, color, transparency); timeline playback.
- **Scripter**: events (start, timer, key, hotspot, variable) + actions (play animation, show viewpoint, set variable, pause, send message).
- **Viewpoints**: camera + hide/required + appearance + markups + section state; animations and cuts; folders.
- **Sectioning**: up to 6 planes, linked, box mode.
- **Measure**: point to point, point to multiple points, accumulate, angle, area, shortest distance; lock axis; convert to redline.
- **Redline/Tags**: ellipse, cloud, line, freehand, text; tags with IDs, comments with status.

## 2. Our `coord` tab (110 rows)
Built*: Append, Reset All, File Options, Selection Tree, Find Items, Hide overlays, Properties, Clash Detective, Coordination, TimeLiner, Quantification, Autodesk Rendering, Animator, Compare, Safety, Save Viewpoint, Views, Record, Play, Perspective, Orthographic, Top, Iso, Walk, Orbit, Pan, Zoom all, Shaded, Wireframe, X-ray, Lighting, Enable Sectioning, Plan cut, Section Z, Clear cuts, all Measure tools, Text, Erase, Add Tag, Comments, Reviews (4), Animation items, Labels, Levels, Show Grid, Split View, Full Screen, Background, Windows, Load Workspace, Site plan, Publish (ZIP/Share), Export IFC/OBJ/DXF/…, Image/Rendered/Animation, reports.
Not built: Refresh, Select/Select All/Select Same, **Sets**, Hide/Require/Hide Unselected/Unhide All, Links, Quick Properties, **Scripter**, Batch Utility, DataTools, Field of View, Align Camera, Look Around, Fly, Realism, Draw, Tag ID, Scripts, Navigation Bar, ViewCube, HUD, FBX, KML, NWD, Viewpoints report.

## 3. Gaps, prioritised

| Pri | Gap | Build in browser |
|---|---|---|
| P0 | **Sets** (selection + search sets, folders) | Store ids or rule objects; used by Clash/TimeLiner/Quantification |
| P0 | **Select / Select Same / Hide / Require / Hide Unselected / Unhide All** | Selection state + visibility overrides on the scene graph |
| P0 | **Selection Tree views** (Standard/Compact/Properties/Sets) + right-click menu | Tree from file→layer→element; alternate grouping by property |
| P0 | **Clash Detective full workflow**: tests, rules, types (hard/clearance/duplicate), tolerance, statuses, grouping, assign, viewpoints, report | AABB broad phase + triangle/segment narrow phase in worker; results table |
| P0 | **TimeLiner**: Tasks/Data Sources/Configure/Simulate, task types, planned vs actual, attach by set, playback with date overlay | Reuse `sched` data; colour by task type; timeline slider |
| P1 | **Quantification workbook** with Item/Resource catalogs, model takeoff by set | Table + catalog tree; export XLSX |
| P1 | **Animator + Scripter** (keyframes, events/actions, enable scripts) | Keyframe timeline for camera/transform/colour; event→action list |
| P1 | Viewpoint fidelity: folders, hide/required & appearance stored, section state, edit/update, animation clips | Serialise scene overrides per viewpoint |
| P1 | Sectioning: multiple planes, box mode, link planes | Clip planes (up to 6) in renderer |
| P1 | Measure: multiple points, accumulate, shortest distance, lock axis, convert to redline | Extend measure tool |
| P1 | Navigation: Look Around, Fly, Realism (collision/gravity), ViewCube, Navigation Bar, HUD, FOV, Align Camera | Camera controllers; simple capsule collision |
| P2 | Redline Draw (ellipse/cloud/line/freehand), Tag ID, comment statuses, Find Comments | Overlay canvas + comment store |
| P2 | Properties/Quick Properties, Links, DataTools (external table join) | Property panel, CSV join |
| P2 | **Formats**: NWD/NWF/NWC naming — we cannot write real binary NWD; offer our own `.tox` package and label honestly. FBX, KML exports | JSON/ZIP package; glTF/OBJ/IFC readers where possible |
| P3 | Appearance Profiler, Batch Utility, Compare detail, Multi-Sheet windows, Autodesk Rendering settings | Later |

## 4. Honesty notes
- Real NWD/NWC are proprietary; do not claim compatibility. Say "TOX package" or "IFC/OBJ import".
- Items in our tab with no verified Navisworks equivalent: Coordination (specs vs codes), Safety, Reviews (Structural/MEP/Quality/Handover), Hide overlays, Plan cut, Site plan, Disassembly/Assembly video, Project package ZIP, Share. Label as "T.O X extra".

## 5. Not verified
Exact ribbon panel contents per release, clash type names/status wording, NWF/NWC description details, Scripter action list, shortcut list beyond the snippet, Navisworks Manage vs Simulate feature split beyond Clash Detective (Manage only [V1]).
