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
