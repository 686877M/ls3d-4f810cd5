# AutoCAD ribbon vs our "draft" program: gap list

Provenance: **VERIFIED** = Autodesk help page opened. Everything else is **FROM MEMORY** (AutoCAD 2025/2026 ribbon as I remember it; not re-checked panel by panel).
Verified pages (help.autodesk.com/cloudhelp/2026/ENU/AutoCAD-Core/files/):
- GUID-57CDDB6C-B12B-46CE-B9C5-22EFC17258FF.htm : "To Draw Lines" says Home tab > Draw panel > Line (confirms the Home/Draw path).
- GUID-E8C1190C-A26C-484C-ADDD-DDF81666F69F.htm (LINE), GUID-B1A185EF-07C6-4C53-A76F-05ADE11F5C32.htm (TRIM), GUID-E908848F-4621-43D2-B377-FD3FBC2B8848.htm (DIMLINEAR), GUID-ACC319C8-34EA-4D9D-981E-B69B7B187400.htm (polylines).
- Could NOT open: a single Autodesk page listing every 2026 ribbon tab/panel (autodesk.com support pages return Access Denied; help search gave no full list). The tab list below is therefore FROM MEMORY.

## Real tabs (from memory)
Home, Insert, Annotate, Parametric, View, Manage, Output, Add-ins, Collaborate, Express Tools, (Featured Apps). Ours has the first 7 plus nothing for the last four.

## Our extras / questionable
- `Note in 3D`, `Export SVG`, `Share`, `Measure` palette: not recognised as AutoCAD ribbon commands (see cmd_autocad.json).
- Our Home/Draw puts `Wipeout`, `Revision Cloud` (real: Draw dropdown / Annotate>Markup, OK). Our Home/Modify `Align` real, OK.

## Priority 1: core drafting / design (missing in ours)
| Real tab/panel | Missing | Browser build note |
|---|---|---|
| Home/Draw | Arc and Circle sub-methods (3-point, centre, tangent), Donut | Add submenu per command; each is a different input sequence on the same canvas tool |
| Home/Draw | Rectangle chamfer/fillet options, Polygon inscribed/circumscribed | Option keys in the tool's command-line prompt |
| Home/Modify | Scale reference option, Stretch, Array path/polar variants (we have Array only as one), Overkill, Pedit multiple, Break at point, Fillet polyline | Mostly geometry ops; reuse polyline library |
| Home/Modify | Move/Copy with base point + "Displacement", Copy multiple mode | Command-line option state machine |
| Home/Annotation | Dimension types shown in dropdown (we expose in Annotate only), Multileader | Already in Annotate; add shortcut dropdown |
| Home/Layers | Layer states, Layer Walk, Off, Uniso/Merge/Delete, Match to object | Layer panel state list in memory; trivial |
| Home/Block | Block editor (BEDIT) with parameters/actions, Create Block/Write Block (WBLOCK) | Block definition JSON; editor as sub-canvas |
| Home/Properties | ByLayer/ByBlock drop-downs, Quick Properties | Property bar bound to selection |
| Home/Utilities | Quick Select, Select Similar | Filter selection by property/type |
| Home/View | Viewport/named view shortcuts (covered in View) | n/a |

## Priority 2: documentation and drawing production
| Real | Missing | Browser note |
|---|---|---|
| Insert/Block Definition | Define Attributes, Manage Attributes (ATTMAN), Block Editor, Create Block | Attributes as key/value on block refs |
| Insert/Reference | Xref manager (XREF), Image, Underlay Layers, Point Cloud (RCS) | Xref = load second DWG JSON; point cloud via Potree-like viewer |
| Insert/Import | Import (many formats), PDF Import, Markup Import | Only DXF/PDF.js realistic |
| Insert/Data + Linking & Extraction | Data link manager, field insertion (FIELD), Extract data | Field = text with a formula that re-evaluates |
| Annotate/Text | Text Style, Annotative scaling, Align text, Text Editor tab | Style dialog sets font/height/width |
| Annotate/Dimensions | Dim Break, Space, Jogged/ Ordinate/ Center Mark, Dim Edit, Quick Dimension (QDIM), Inspect, Tolerance | Each dimension kind = a renderer + measuring rule |
| Annotate/Leaders, Tables | Table Style, Data link table (we have link), Insert field | Table object as rows/cols grid |
| Annotate/Markup | Revision Cloud shape options, Markup Set Manager | Cloud already; markup set is a list |
| Annotate/Annotation Scaling | Add/Delete Current Scale, Annotative object toggle | Scale list per object; render by viewport scale |
| Output/Plot | Plot style table (CTB/STB), Plot stamp, Publish dialog, Plot to PDF with layouts | We have Plot/Batch; add layout tabs (paper space) |
| Manage/CAD Standards | Standards checking is there; add Layer Translator maps editor | JSON maps |

## Priority 3: advanced and 3D
| Real | Missing | Browser note |
|---|---|---|
| Home/Modify (3D) | 3D Move/Rotate/Mirror/Array, Align 3D, Fillet Edge, Extrude/Presspull | Needs Three.js; large job |
| Home/Draw (3D) | Box, Cylinder, Sweep, Loft, Revolve, Mesh primitives | Three.js geometries |
| Visualize tab (some versions) / View | Render, Materials Browser, Lights, Camera, Section Plane | Three.js + PBR |
| View/Coordinates & UCS | UCS icon, World UCS, Face UCS, Origin | Transform matrix per viewport |
| View/Viewport Tools | Viewcube, Navigation bar, SteeringWheels | Canvas controls |
| View/Interface | Layout tabs, File tabs, Layout viewports (MVIEW/MVSETUP) | Paper-space viewports map to cropped canvases |
| Parametric/Manage | Block table, Constraint bar settings | Constraint solver (we have constraints; add solver check) |

## Tabs absent in ours
- **Collaborate**: Share, Shared Views, Compare (DWG Compare), Autodesk Docs link. Browser: share link via URL; compare = diff of two DWG JSONs.
- **Express Tools**: Text (Text Fit, Explode), Blocks (Copy Nested, Save as), Layers (Layer Walk, Match), Modify (Break Line, Extended Trim), Tools (Super Hatch). Browser: each is a small macro over core ops.
- **Add-ins / Featured Apps**: marketplace apps, not buildable.

## Honest limits
- No full per-panel list read from Autodesk. Panel contents above come from memory and may be incomplete or version-shifted.
- Command names in cmd_autocad.json come from memory except the 4-5 verified.
