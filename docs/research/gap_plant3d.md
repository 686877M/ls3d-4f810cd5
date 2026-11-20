# Gap: AutoCAD Plant 3D vs T.O X `plant`

Legend: **[V]** = read on Autodesk help. **[M]** = memory, not verified. Own wording.
Data in `cmd_plant3d.json` (83 keys; 5 verified, 47 memory, 31 app-specific).

## Verified sources (read)
- About the Ribbon (all tabs/panels below): https://help.autodesk.com/cloudhelp/2024/ENU/Plant3D-UserGuide/files/GUID-D792AEF2-E0E9-450A-9C5D-970F156E4AE4.htm
- Project Manager (Home > Project panel, command `projectmanager`, project name list, Publish, Reports, Data Manager, Export/Import data): https://help.autodesk.com/cloudhelp/2018/ENU/Plant3D-UserGuide/files/GUID-B05A7C7B-A0CD-4484-813D-84C5B212C8C8.htm
- Visibility of Plant 3D objects (separate from AutoCAD layers): https://help.autodesk.com/cloudhelp/2021/ENU/Plant3D-UserGuide/files/GUID-118AAFEF-9E27-48A3-86FD-DE1E67F3089B.htm
- Ortho insulation tool (Home > Ortho Views panel; Ortho View tab): https://help.autodesk.com/cloudhelp/2021/ENU/Plant3D-UserGuide/files/GUID-01868409-F942-4F00-9DAF-FCAC69D7C4B9.htm
- Not read: individual pages for Equipment, Pipe Supports, Spec Editor, Iso annotation commands (only panel names confirmed via search results).

## Real ribbon [V]
- **3D Piping > Home**: Project, Part Insertion, Ortho Views, Compass, Elevation & Routing, Slope, Pipe Supports, Equipment, Visibility, View, Layers, Plugin.
- **Isos**: Iso Creation, Iso Annotation, Export.
- **Structure**: Parts, Modify, Cutting, Visibility, Export, Views, Layers.
- **Ortho Editor** (contextual): OrthoCube, Select Library, Output Appearance, Output Size, Location Offset, Create.
- **Ortho View** (contextual, green): Ortho Views, Plant Object Tools, Single Line Piping, Table Placement & Setup, Annotation, Dimensions, Model Viewports, Layers.
- **P&ID Home** (other workspaces): Project, P&ID Schematic, Line, Line Group, Validate, Layers, Block, Annotation, Properties, View, Utilities.
- Not verified: Project Browser-like Project Manager tabs (Plant 3D DWG, P&ID DWG, Orthographic DWG, Isometric DWG) [M for exact tab names; Ortho and Iso tab mention seen in search snippets]. Spec Editor, Catalog Editor, Properties palette, Tool Palette, Data Manager details [M].

## Missing in ours, by priority
| Pri | Real feature | Gap | Browser idea | IFC / data |
|---|---|---|---|---|
| P1 modelling | Spec-driven piping: Spec Editor / Catalog, pipe route with auto fittings, slope, elevation & routing panel [M; panels V] | most Home items unbuilt | spec JSON (size, class, parts) + route tool that picks fittings | IfcPipeSegment, IfcPipeFitting, IfcValve; Pset_PipeSegmentTypeCommon |
| P1 | Equipment: Create from templates (tank, vessel, pump), nozzles [M] | Create/Attach/Nozzle unbuilt | parametric templates + nozzle connector points | IfcTank, IfcPump, IfcFlowTerminal; IfcDistributionPort for nozzles |
| P1 | Valves, custom parts / placeholders [M] | unbuilt | catalog of valve shapes; placeholder box | IfcValve, IfcBuildingElementProxy |
| P1 | Pipe supports [M] | unbuilt | support symbol snapped to pipe | IfcDiscreteAccessory / IfcPipeSupport? (verify class) |
| P1 | Structure tab: members, railing, stairs, ladders, plates, footings; cutting [V panels, M tools] | unbuilt | profile library + member generator | IfcBeam/IfcColumn/IfcMember, IfcRailing, IfcStair, IfcFooting |
| P2 documentation | Isos: production/quick iso, annotation, PCF [V panels, M tools] | partial | isometric projection of pipe graph on SVG, with BOM table; PCF text writer | IfcPipeSegment graph; PCF text |
| P2 | Ortho views (create/edit, insulation symbol, dimensions, single-line) [V] | partial | 2D projection with hidden-line, annotation layer | none (derived) |
| P2 | Compass, Layers, View panels [V] | missing | north arrow + layer table | none |
| P3 quantities | Project Manager / Data Manager reports, line list [V PM] | BOQ only | JSON report engine over components; CSV export | IfcElementQuantity, IfcPropertySet |
| P3 | P&ID side: lines, valves, instruments, validate, line list [V panels] | none | SVG P&ID editor with tags linked to 3D lines | IfcDistributionSystem / link by tag |
| P4 systems | Line groups, validation, publish to DWF, import/export data [V PM menu] | missing | line group table, consistency checks | IfcSystem |
| P5 | Plugin panel, Navisworks export (NWC) [M] | NWC unbuilt | export IFC instead; NWC needs vendor tool | IFC |

## Ours but not in Plant 3D (31 tagged app-specific)
Compare panel (Colour by system, X-ray, Ghost concrete, Hide overlays), Parts list, Families, Section/Side/Adjacent View, Iso view, Analysis tab (Clashes, Coordination, MEP review, Safety, Pump and pipe calcs, Engineering analysis, HVAC), Output (Iso sheet A1, Drawing sheet, Render, Screenshot, OBJ, BOQ XLSX, Share, ZIP). Keep but label "T.O X extra".

## Notes
- Key `plant|X-ray` is the same app toggle in two panels.
- Several Iso annotation and Structure tool names are our guesses of real names; marked unverified in `src`.
