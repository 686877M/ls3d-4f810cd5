# UI spec: Civil 3D  ->  T.O X tab S.X (Survey)

Status: v1, 2026-11-19. Goal: S.X follows the Civil 3D user interface. Maps stay an optional helper (command "Map and GIS").

## Honesty about sources
Checked against public pages (web search, snippets only, no full help page read):
- Home tab has the panels Palettes, Create Ground Data, Create Design, Profile & Section Views, Draw (Autodesk tutorial "Finding Tools", Davenport textbook ch. 1).
- Toolspace has the tabs Prospector, Settings, Survey, Toolbox; the Survey tab holds survey data outside any drawing (Autodesk help "About the Toolspace Survey Tab").
- A Survey Query tool exists for searching survey points and figures.
Everything else below is **from memory of Civil 3D 2023-2025, not verified**. Marked `[mem]`. Check against the Autodesk help of the owner's release before calling it identical. Exact icon artwork is Autodesk's and is NOT copied: T.O X uses its own line icons in the same size classes.

## Ribbon (implemented in c_civil.js, shown only while an S.X tab is active)
Large button = 34 px icon + label under it. Small button = 16 px icon + label beside, three stacked per column. Panel title at the bottom.

| Tab | Panels (order) | Source |
|---|---|---|
| Home | Palettes, Create Ground Data, Create Design, Profile & Section Views, Draw, Modify | first five confirmed, Modify `[mem]` |
| Insert | Import, Map | `[mem]` |
| Annotate | Labels & Tables, Dimension, Text | `[mem]` |
| Modify | Ground Data, Design, Edit | `[mem]` |
| Analyze | Ground Data, Design | `[mem]` |
| View | Navigate, Views, Visual Styles, Palettes | `[mem]` |
| Output | Export, Plot | `[mem]` |
| Survey | Survey Toolspace, Points, Figures and Networks, Query | `[mem]` |
| Manage | Settings | `[mem]` |
| TIN Surface (contextual, only when a surface is built) | Modify, Analyze, Labels | contextual tab exists in Civil 3D `[mem]` |

### Command map (built vs not built)
Built (real, already working in the app):
- Toolspace (Prospector / Settings / Survey tree built from the real project data)
- Create Surface (TIN Delaunay from the points, contours at the interval)
- Points (paste / edit CSV E,N,Z), Import points
- Contour interval, Show / hide surface in 3D, Wireframe
- Volume against a reference level, station excavation from the surface
- Export Contours DXF, Surface DXF (3DFACE)
- Draw / Modify basics through the CAD window, Dimension, Text, Distance measure
- Orbit, Pan, Zoom, Plan, Iso, shaded / wire / x-ray
- Map and GIS (helper)

Greyed "not built yet" (no behaviour invented): Properties palette, Tool Palettes, Feature Lines, Parcels, Alignments, Profiles, Corridors, Grading, Intersections, Pipe Networks, Pressure Networks, Assemblies, Profile View, Sample Lines, Section Views, Labels and Tables, Styles, Survey databases, Figures, Survey Networks, Survey Query, Equipment and Figure-prefix databases, Linework code sets, breaklines, boundaries, point groups, point-cloud import, LandXML, Toolbox.

## Toolspace (dock window "Toolspace")
Tabs: Prospector, Settings, Survey, Toolbox (Toolbox greyed).
- Prospector tree: Points (count), Point Groups (not built), Surfaces (TIN: points, triangles, Z range, interval), Sites, Alignments, Catchments, Pipe Networks, Corridors, Assemblies, Intersections (all: 0, not built), Survey link.
- Settings tree: Drawing (units and zone: real values from the Map tab), Surface (contour interval, real), other collections listed greyed.
- Survey tree: Survey Databases, Equipment Databases, Figure Prefix Databases, Linework Code Set Databases, Survey Queries (all not built).
- Right-click on Surfaces / Points items gives a menu with the built commands only.

## Not covered yet (record for next rounds)
Status bar of Civil 3D (model / layout tabs, snaps), Panorama, Properties palette, command line, ViewCube / navigation bar, quick-access toolbar, Application menu, real Civil 3D object model (alignments, profiles, sections, corridors, pipe networks): these need new geometry code, not only menus.
