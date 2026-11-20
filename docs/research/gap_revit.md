# Gap: Revit vs T.O X `model` (Revit ribbon)

Legend: **[V]** = read on Autodesk help (URL given). **[M]** = from memory, not verified. Own wording, no vendor text.
Data in `cmd_revit.json` (277 keys; 12 verified, 219 from memory, 46 marked app-specific = not a Revit command).

## Verified sources (read)
- UI parts list (File tab, Quick Access, InfoCenter, Options Bar, Type Selector, Properties, Project Browser, Status Bar, View Control Bar, Drawing Area, Ribbon, tabs, contextual tab, panels): https://help.autodesk.com/cloudhelp/2024/ENU/Revit-GetStarted/files/GUID-3197A4ED-323F-4D32-91C0-BA79E794B806.htm
- Ribbon (expanded panels, dialog launcher, contextual tabs): .../Revit-GetStarted/files/GUID-1CA04013-04CE-4F55-9B0C-68FD7E7FF80B.htm
- Project Browser (hierarchy of views/schedules/sheets/groups/links/families; search box; Find in Project Browser): .../GUID-C8D3E5A6-02A5-43A9-AFFC-D49DD27398B1.htm
- Properties palette (Type Selector, instance vs type properties, view properties when nothing selected): .../GUID-A764EA7A-FE26-469B-857C-F3A70812FC34.htm
- Options Bar (below ribbon, shows tool/selection-dependent options): .../GUID-28BDE98C-E8A9-4C74-8ABC-9DABD13163D9.htm
- View Control Bar tool list: .../GUID-42872B9F-A4DE-472A-A88C-77879ACEC93E.htm
- Curtain elements: https://help.autodesk.com/cloudhelp/2021/ENU/Revit-ArchDesign/files/GUID-F20928C1-83F8-4CD0-870E-6F8F123A67C9.htm ; Window: .../2022/ENU/Revit-ArchDesign/files/GUID-3B7BAC64-6120-4372-A29E-95C4A1D853F5.htm
- Pipe (Systems tab, Plumbing & Piping panel; placeholder pipe): https://help.autodesk.com/cloudhelp/2024/ENU/Revit-MEPEng/files/GUID-EEB121ED-6C1F-4728-A615-B3AF36DD6A61.htm
- Panel Schedules (Analyze tab, Reports & Schedules panel): https://help.autodesk.com/cloudhelp/2026/ENU/Revit-DocumentPresent/files/GUID-3D2D0E77-ED17-4FBF-AAE4-CB9185A3F779.htm
- Systems Analysis (Analyze tab, Energy Optimization panel; EnergyPlus workflow): https://help.autodesk.com/cloudhelp/2020/ENU/Revit-Analyze/files/GUID-489D3898-82B1-4615-BDF2-DA1DC37A83BB.htm
- Not verified: the full tab/panel list of the Revit ribbon (no single help page found; pages differ per release).

## Real program frame
- Ribbon tabs [M]: File, Architecture, Structure, Steel, Precast, Systems, Insert, Annotate, Analyze, Massing & Site, Collaborate, View, Manage, Add-Ins, Modify; contextual tabs "Modify | <tool>" [V: contextual tab exists].
- Project Browser [V]: Views (by discipline), Legends, Schedules/Quantities, Sheets, Families, Groups, Revit Links.
- Properties palette [V]: Type Selector + instance parameters + Edit Type; shows active-view properties when nothing is selected.
- View Control Bar [V list]: Scale, Detail Level, Visual Style, Sun Path, Shadows, Rendering dialog (3D), Crop, Show Crop, Lock 3D view, Temporary Hide/Isolate, Reveal Hidden, Worksharing Display, Temporary View Properties, Analytical Model, Displacement Sets, Reveal Constraints.
- Options Bar [V]: per-tool options (e.g. wall height, chain, offset, tag options).

## Missing in ours, by priority
Browser notes: Three.js/web-ifc style scene; data model = JSON elements with `ifc_class`, `type`, parameters; IFC export via web-ifc.

### P1 Modelling
| Real feature | Gap | Browser idea | IFC / data |
|---|---|---|---|
| Wall types with layers, location line, join/cleanup [M] | single wall only | layer stack array, extrude per layer | IfcWall + IfcMaterialLayerSetUsage |
| Curtain System/Grid/Mullion [V] (11 of our 266 commands unbuilt) | not built | grid divisions on face, panel + frame meshes | IfcCurtainWall, IfcPlate, IfcMember |
| Stairs/Ramps by component, Railing on host [M] | basic | run + landing generator | IfcStair/IfcStairFlight, IfcRailing |
| Roof by footprint/extrusion, slope arrows [M] | simple roof | polygon + slope edges | IfcRoof, IfcSlab(ROOF) |
| Openings: By Face, Shaft, Vertical, Dormer [M] | unbuilt | CSG subtract (three-bvh-csg) | IfcOpeningElement |
| Model Group, Parts, In-Place Mass, Place Mass [M] | partly | group node; mass = extrude | IfcGroup, IfcBuildingElementProxy |
| Work plane set/show/ref plane/viewer [M] | unbuilt | plane gizmo and raycast to plane | n/a (editor state) |
| Structural: Brace, Truss, Beam System, rebar tools, fabric sheet [M] | unbuilt | parametric member generators | IfcMember, IfcReinforcingBar, IfcReinforcingMesh |
| Steel tab: connection, plate, bolt, anchor, weld, cope [M] | unbuilt | small parametric parts, no real calc | IfcDiscreteAccessory, IfcFastener, IfcMechanicalFastener |
| Linked models (Revit/IFC/CAD) as references [M] | CAD only | load IFC with web-ifc as locked layer | IfcProject (linked) |

### P2 Documentation
| Real feature | Gap | Browser idea | IFC / data |
|---|---|---|---|
| Dimensions: aligned/linear/angular/radial/diameter/arc length, spot elevation/coord/slope [M] | partly | SVG overlay with snap refs | annotation only (IfcAnnotation) |
| Tags: Tag by Category, Tag All, Material, Keynote [M] | unbuilt | label from param template per category | reads element parameters |
| Detail Line, Region, Detail Component, Revision Cloud, Repeating Detail, Insulation [M] | unbuilt | 2D layer per view in SVG | none (view-specific) |
| View Templates, Filters, Visibility/Graphics overrides [M] | unbuilt | per-view override table applied on render | none |
| Callout, Duplicate View, Legends, Scope Box [M] | unbuilt | view clone with cropped camera | none |
| Sheets: title block, revisions, guide grid, placed views [M] | basic sheet | SVG sheet with viewports | IfcDocumentInformation |
| Text: spelling, find/replace [M] | unbuilt | simple search over notes | none |

### P3 Quantities (Schedules)
| Real feature | Gap | Browser idea | IFC / data |
|---|---|---|---|
| Schedules/Quantities with fields, filter, sort, group, totals, calculated values [M] | ours has BOQ view | table over element params, group-by, sums, CSV | IfcElementQuantity, IfcQuantityArea/Volume/Length |
| Material takeoff, Room/Area schedules [M] | partly | volume x layer; room areas from boundaries | IfcSpace quantities |
| Panel Schedules [V] | unbuilt | circuit table per panel from wire/circuit data | IfcElectricDistributionBoard, IfcElectricFlowStorage... (data in Pset) |
| Project/Shared/Global parameters [M] | project info only | parameter definitions JSON bound to categories | IfcPropertySet |

### P4 MEP systems
| Real feature | Gap | Browser idea | IFC / data |
|---|---|---|---|
| Duct/Pipe/Flex/Placeholder with routing preferences [V pipe] | almost all unbuilt (* in list) | polyline + auto fittings; type with size/slope | IfcDuctSegment/IfcPipeSegment + fittings |
| Fittings, accessories, air terminals, equipment with connectors [M] | unbuilt | families with connector points; snap | IfcDuctFitting, IfcPipeFitting, IfcAirTerminal |
| Electrical: panels, devices, lighting, cable tray, conduit, wire, circuits [M] | unbuilt | devices + circuit graph | IfcElectricDistributionBoard, IfcLightFixture, IfcCableCarrierSegment |
| Plumbing fixtures, sprinklers [M] | unbuilt | families with pipe connectors | IfcSanitaryTerminal, IfcFireSuppressionTerminal |
| Systems browser (assign/rename systems, system graphics) [M] | colour toggle only | systems table + colour filter | IfcSystem / IfcDistributionSystem |
| Spaces/zones, loads, Systems Analysis [V] | partial | simple load estimate, no EnergyPlus | IfcSpace, IfcZone, Pset_SpaceThermalLoad |
| Check systems, Interference Check, pressure loss reports [M] | partial | graph connectivity check; AABB clash | none |
| Duct/Pipe sizing methods [M] | partial | friction/velocity formulas | Pset only |

### P5 Rest
Phasing, Design Options, Worksets, Copy/Monitor, Manage Links, Dynamo (not feasible fully; offer JS scripting), Massing & Site tools (Toposurface etc.), Point Cloud/Decal, View Control Bar items (Sun Path, Shadows, Crop, Temporary Hide/Isolate, Reveal Hidden), Options Bar per-tool.

## Ours but not in Revit (46 entries tagged app-specific)
Examples: Agent hub, Telegram bot, Pulse and handover, Project cycle, Calendar, Ghost concrete, Water, Ground, Levels toggle, Structural/MEP/Quality review, Handover, Live session, Activity log, Search everywhere, Share, Saved projects, Record video, Screenshot, X-ray, BOQ CSV/XLSX, OBJ and SVG export, Station parameters, Plan to CAD. Keep them but label as "T.O X extra" so users do not expect them in real Revit.

## Naming mismatches worth fixing
- "Check" (Analytical Model) is not a Revit command name (Revit: consistency checks).
- Revit visual styles: Wireframe, Hidden Line, Shaded, Consistent Colors, Realistic [M]; ours has Wireframe, Shaded, X-ray.
- Export in real Revit: File > Export (IFC, CAD formats, PDF, FBX, gbXML) [M]; OBJ/SVG are not native.
- Duplicate names in ours (Wall x3, Cut x3, Copy x2, ...) are different tools; see keys with panel suffix in `cmd_revit.json`.
