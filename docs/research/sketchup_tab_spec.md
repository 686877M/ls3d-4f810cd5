# SketchUp-style tab: implementable specification (`sk`, working name "SketchUp")

Legend: **[V]** read from page; **[M]** from memory (not verified). Own wording. No SketchUp icons/artwork: draw our own.

Pages read:
- [V1] https://help.sketchup.com/en/sketchup/toolbars (default toolbars and their tools, SketchUp 2027 page dated Oct 2026)
- [V2] https://help.sketchup.com/en/sketchup/dialog-boxes-and-trays (panels and trays)
- Search-result snippets only: help.sketchup.com/en/sketchup/inspecting-entity, .../creating-scenes, .../adding-colors-and-textures-materials, .../sketchup-web/creating-and-editing-models.

## 1. Interface (what the real program has)

**Toolbars [V1]** (each is a group; user can show/hide, dock top/bottom; Large Tool Set docks left only):
Add Location · Camera (Orbit, Pan, Zoom, Zoom Window, Zoom Extents, Previous, Position Camera, Look Around, Walk) · Classifier · Construction (Tape Measure, Dimensions, Protractor, Text, Axes, 3D Text) · Drawing (Line, Freehand, Rectangle, Rotated Rectangle, Circle, Arc, 2-Point Arc, 3-Point Arc, Pie) · Dynamic Components (Interact, Component Options, Component Attributes) · Edit (Move, Push/Pull, Rotate, Follow Me, Scale, Flip, Offset) · Getting Started (Search, Select, Eraser, Line, Arc, Rectangle, Offset, Move, Rotate, Scale, Flip, Tape Measure, Paint Bucket, Orbit, Pan, Zoom, Zoom Extents, 3D Warehouse, Extension Warehouse, Send to LayOut, Comments, User Info) · Large Tool Set (all of Getting Started + Construction + Drawing + Measurement + Edit with variants) · Measurements (box at bottom: type exact value) · Principal (Select, Make Component, Paint Bucket, Eraser) · Sandbox (From Contours, From Scratch, Smoove, Stamp, Drape, Add Detail, Flip Edge) · Section (Section Plane, Display Section Plane, Display Section Cut, Display Section Fill) · Shadows (Shadows, Date, Time) · Solid Tools (Outer Shell, Intersect, Union, Subtract, Trim, Split) · Standard (New, Open, Save, Cut, Copy, Paste, Erase, Undo, Redo, Print, Info) · Styles (X-Ray, Edges, Ambient Occlusion, Wireframe, Hidden Line, Same Shaded, Shaded, Shaded Textures, PBR Materials) · Tags (dropdown) · Trimble Connect · Views (Iso, Top, Front, Right, Left, Back, Bottom) · Warehouse.

**Panels / default tray [V2]** on the right, dockable left/right, pinnable, "Manage Trays": Entity Info, Materials, Components, Styles, Tags, Scenes, Shadows, Fog, Match Photo, Soften Edges, Overlays, Instructor, Outliner.
Panel purposes (snippets + [M]):
- *Entity Info*: name, tag, instance/definition names, hidden, locked, cast/receive shadows, classification, material, section fill; face area / edge length shown [M].
- *Materials*: pick/create/edit colour and texture, In-Model vs library, eyedropper, shows painted area [snippet].
- *Components*: In-Model list, library, make/replace, instances share one definition [M].
- *Styles*: edge, face, background, watermark, modelling settings, presets [snippet].
- *Scenes*: saved views that store camera + style + fog + shadows + environment + axes + visibility [snippet]; transitions animate between scenes [M].
- *Shadows*: date, time, UTC, light/dark sliders, on faces/ground/edges [M].
- *Outliner*: tree of groups/components, drag to regroup, hide/lock [snippet].
- *Tags*: visibility control per tag (SketchUp's replacement for layers) [M].

Other: status bar with prompt text and the **Measurements box** (Value Control Box); axes (red/green/blue); inference engine (endpoint, midpoint, on-edge, on-face, from-point, parallel/perpendicular, colour-coded, arrow-key axis lock) [M].

## 2. Tool behaviour spec (what to implement) [M unless tied to V1 list]

Core data: half-edge or face/edge/vertex mesh; faces are planar polygons that auto-create when a closed coplanar loop of edges exists; edges split at intersections; soft/smooth flags; hidden flags. Groups and component instances with transforms; component definitions shared.

| Tool | Behaviour |
|---|---|
| Select | click, shift-add, ctrl-toggle, window (left→right: fully inside) / crossing (right→left); double-click = face+edges, triple = connected geometry |
| Line | click-click; inference; type length; closes loops to make a face; splits crossing edges |
| Freehand | polyline from pointer path |
| Rectangle / Rotated Rectangle | 2 corners / 3 points; type "w,d" |
| Circle / Arc / 2-Point Arc / 3-Point Arc / Pie | centre+radius (default 24 segments), type radius and `n s` for segments |
| Push/Pull | click face, drag along its normal, type distance; double-click repeats last distance; on a closed loop opening makes a hole; Ctrl = new face (keep original) |
| Move | pick geometry, base point, destination; Ctrl = copy, type distance, `3x`/`/3` to array; auto-fold |
| Rotate | protractor: centre, start, angle; Ctrl copy; type angle |
| Scale | grips on bounding box: uniform / per-axis / about centre (Ctrl); type factor |
| Flip | mirror along axis (Flip Along menu) |
| Follow Me | extrude face along edge path |
| Offset | parallel copy of face edges at distance |
| Tape Measure | measure distance; creates guide lines/points; resize model with typed length |
| Dimensions / Protractor / Text / Axes / 3D Text | linear dimension entities; angle guide; leader/screen text; move origin; 3D text extrusion |
| Paint Bucket | apply material to face/group; Alt = sample; Ctrl = fill adjacent same-material; Shift = whole model same material |
| Eraser | delete edges/faces; Shift hide, Ctrl soften |
| Orbit / Pan / Zoom / Zoom Window / Zoom Extents / Look Around / Walk / Position Camera | middle-mouse orbit, shift+middle pan; Walk with eye height |
| Section Plane | place on a face; active cut; display plane / cut / fill toggles [V1 list] |
| Solid Tools | Outer Shell, Intersect, Union, Subtract, Trim, Split [V1]; operate on solid groups/components (closed manifold) |
| Intersect Faces | split geometry where faces cross (with Model / Selection / Context) |
| Make Group / Make Component / Edit group / Explode | group = unit of geometry with its own context; component = reusable definition |
| Tags | visibility toggles, dropdown [V1] |
| Styles/View | X-ray, wireframe, hidden line, shaded, textured, edge toggles [V1] |
| Shadows | sun from date/time/geolocation |
| Scenes | save/update/delete, play slideshow |
| Views | iso, top, front, right, left, back, bottom [V1] |
| Sandbox | terrain from contours/scratch, smoove, stamp, drape, add detail, flip edge [V1] (defer) |
| Standard | New/Open/Save/Undo/Redo/Erase/Print [V1] |

## 3. Browser architecture
- Three.js for display; own mesh store (`vertices`, `edges`, `faces` with loops and holes) for modelling. Use Three.js only to render and raycast.
- Inference engine = raycast against edge endpoints/midpoints, face planes; snap candidates ranked by distance in screen space; axis lock with arrow keys.
- Face creation: planar loop detection on edge graph (project to plane, find minimal cycles). This is the hardest part; start with rectangle/circle/polygon creating faces directly and make Line close-loop detection second.
- Push/Pull: for planar face with holes, extrude outer loop minus holes, add side faces, translate; merge coplanar neighbours.
- Boolean/solid tools: use an existing library (e.g. manifold-3d WASM or three-bvh-csg) instead of writing CSG. Check licence before use.
- Measurements box: text input bound to active tool state.
- Undo/redo: command stack of mesh diffs.
- Persist model as JSON (our format). Export OBJ/glTF/DXF; import OBJ/glTF. Do **not** claim `.skp` read/write.

## 4. What to build first (order)
1. Shell: ribbon/toolbars (Standard, Getting Started, Camera, Views, Styles) + right tray with **Entity Info**, **Materials**, **Outliner** + Measurements box.
2. Mesh store + Select + Line + Rectangle + Circle (faces auto-form) + inference (endpoint/midpoint/on-axis).
3. **Push/Pull**, Move (with copy), Rotate, Scale, Eraser, Offset, Tape Measure.
4. Groups & Components (Components tray), Paint Bucket + Materials.
5. Orbit/Pan/Zoom/Views/Styles (wireframe, hidden line, x-ray, shaded, textured).
6. Section Plane, Scenes, Shadows, Tags.
7. Follow Me, Arc family, Dimensions/Text/Protractor, Flip.
8. Intersect + Solid Tools via CSG library.
9. Later: Sandbox terrain, Dynamic Components, Match Photo, Classifier (IFC), LayOut-style export.

## 5. Not verified
Exact modifier keys and typed-value syntax (from memory), default segment counts, the exact set of items in each panel beyond the snippets, Tools menu contents, Large Tool Set variants list, keyboard shortcuts, Windows vs macOS differences. Only the toolbar and tray pages were opened in full; individual tool pages were not.
