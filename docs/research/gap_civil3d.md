# Civil 3D ribbon vs our "survey" program: gap list

Provenance: **VERIFIED** = page opened. Others **FROM MEMORY**.
Verified:
- https://help.autodesk.com/cloudhelp/2026/ENG/Civil3D-UserGuide/files/GUID-02175AB9-4C31-480C-99AD-B4C28815531D.htm : "Click Home tab > Create Ground Data panel > Points menu > Create Points - Alignments Profile Geometry Points" (confirms Home tab, Create Ground Data panel, Points menu).
- https://help.autodesk.com/cloudhelp/2026/ENG/Civil3D-Tutorials/files/GUID-C0C6F25C-B0A8-486E-9C32-13948DEF1995.htm : layout profile tutorial (Profile drop-down under Create Design).
- https://c3dkb.dot.wi.gov/Content/c3d/c3d-intrfc/c3d-intrfc-intro.htm (WisDOT, updated 2026-01-06, third-party but reliable): ribbon = tabs, each split into panels; Toolspace, command line, status bar. An older Civil 3D guide lists static tabs Home, Insert, Annotate, Modify, Analyze, View, Output, Manage.
- Could NOT open: an Autodesk page listing every 2026 tab/panel (autodesk.com pages return Access Denied). Panel lists below are FROM MEMORY.

## Real tabs (memory)
Home, Insert, Annotate, Modify, Analyze, View, Manage, Output, Survey, Autodesk Docs (Collaborate), Help, Add-ins; contextual tabs appear on selection (TIN Surface, Alignment, Profile, Corridor, Pipe Network, Parcel...). Ours has all static ones; no contextual tabs.

## Our entries that are NOT real Civil 3D commands
`Terrain map`, `Site safety`, `Calculations`, `Seismic, wind, soil`, `Zoom to station`, `Zoom to site`, `Remove last`, `3D note`, `Survey Query`, `Project info`, `Saved projects`, `Team and versions`, `Contours DXF`, `Surface DXF 3D` (see cmd_civil3d.json notes). Keep only if labelled app-specific.

## Priority 1: core design workflows (missing)
| Real | Missing | Browser note |
|---|---|---|
| Home/Create Ground Data | Point creation methods (manual, from alignment, along polyline, grid, by surface), Surface from DEM/contours/points file, Boundaries/Breaklines/Edit Surface (add line, delete line, swap edge) | TIN via Delaunay (e.g. d3-delaunay / earcut); each creation method = input sequence |
| Home/Create Design | Alignment: create by layout (tangent-curve-spiral), from polyline, offset alignments, widenings; Profile: layout tools (PVI, parabolic curves); Assembly sub-assemblies; Intersection wizard; Grading groups/criteria | Alignment = list of tangent/curve/spiral elements with station math; profile = PVI list |
| Home/Profile & Section Views | Profile from surface, Profile View wizard options (bands, split), Section sampling groups, Section view bands, Quantity takeoff | Plot profile on canvas from alignment station + surface elevation |
| Modify (contextual) | Edit alignment geometry (Geometry Editor), profile (Profile Layout Tools), surface edit, feature line edit, corridor properties/regions/targets | Each as a toolbar when object selected |
| Analyze/Ground Data | Volumes Dashboard, Add Slope/Elevation/Contour Labels, Catchment, Water Drop, Flow arrows | Triangle-based volume (prismoidal), water drop = steepest descent on TIN |
| Analyze/Design | Alignment/ superelevation checks, Design checks (design criteria files), Pipe interference check | Rule tables per design speed |
| Home/Draw+Modify | Same as AutoCAD (Arc, Ellipse, Fillet, Trim, Extend, Array...) missing in ours | Reuse the AutoCAD tab code |

## Priority 2: documentation and output
| Real | Missing | Browser note |
|---|---|---|
| Annotate/Labels & Tables | Station/offset labels, Line/Curve labels, Spot elevation, Contour labels, Pipe/Structure labels; Label styles; Tables (Point, Parcel, Alignment, Pipe) | Label = text bound to an object + style; recompute on edit |
| Annotate/Labels (Dimension, Text) | Multileader, Note, Match Label | Reuse AutoCAD |
| Insert/Import | Points from file, Import LandXML, Import Survey Data, Import Civil 3D object from Autodesk Docs, Image, GIS data | LandXML = parse XML; points = CSV import |
| Output/Plan Production | Create View Frames, Create Sheets, Match Lines, Sheet Set | Slice alignment into frames; each frame to a sheet layout |
| Output/Export | Export to AutoCAD (explode Civil objects), Export LandXML, Export to DWG for Map | Flatten objects to lines/3D faces |
| Output/Quantities | Takeoff, Quantity reports, Pay item lists, Mass Haul diagrams | Mass haul = cumulative cut-fill vs station |
| Manage | Drawing Settings, Settings tab styles, Label style composer, Data shortcuts, Reports Manager, Command Settings | JSON style store + report templates |

## Priority 3: survey and extended
| Real | Missing | Browser note |
|---|---|---|
| Survey/Survey Toolspace | Survey databases, equipment databases, figure prefix, linework code sets, survey networks (least squares adjustment), Import wizard (FBK, RAW) | Least squares needs a small matrix solver |
| Survey/Points & Figures | Point groups, description keys, figure styles/breaklines | Description key = rule table mapping codes to styles |
| Analyze/ Raster / Map | Geolocation tab (online maps), Raster Design | Map tiles via Leaflet; raster tools are heavy |
| Corridors | Corridor surfaces, sample lines by corridor, feature lines from corridor, section editor | Heavy: sweep assembly along alignment |
| Pipes | Gravity network parts lists, hydraulic design (Storm and Sanitary Analysis export), pressure network fittings | Parts list JSON; HGL via Manning/ Hazen-Williams |
| Collaboration | Autodesk Docs, Data shortcuts, Vault, Share | Cloud storage layer, not Civil-specific |
| Extensions / Add-ins | Subassembly Composer, Dynamo for Civil 3D | Not buildable |

## Honest limits
- Panel lists and command names are from memory except the pages above.
- 2026 specifics (new tools, renamed panels) could differ; check Help > What's New in Civil 3D 2026.
