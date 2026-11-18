# BVT-1: BIM Viewer Template

A single-file web viewer that turns a project's drawing data into: a 3D model with hover data, movable section planes, ISO-style 2D drawings, a drawing sheet with an editable title block, a disassembly/assembly animation, a BOQ with cost (5D style), a Revit-style families editor, and CAD/BIM exports.

First used for: `Sewage Lift Station` (this repo). Source file: `src/lift_station_3d.html`. Live build: `index.html`.

## What is reusable (the ENGINE) and what changes per project (the PROJECT blocks)

The source file is one HTML page. Search for the banners:

| Banner | What it holds | Edit per project? |
|---|---|---|
| `BVT-1 ENGINE` | scene, camera, 360 views, sections, hover, selection, measuring, drafting engine (hatch, dims, level symbols, tags), drawing sheet composer, exports (DXF, IFC2X3, OBJ, PDF, SVG, PNG, XLSX, CSV), data store, families editor, language switch | No |
| `PROJECT BLOCK 1/4` | parameters (`P0`, `PARAMS`), reference level `BL`, defaults | Yes |
| `PROJECT BLOCK 2/4` | `buildModel()`: the geometry, written with helpers `box`, `cyl`, `pipe`, `extruded`, `part(id, fn, idx)` | Yes |
| `PROJECT BLOCK 3/4` | `baseItems()` (BOQ items with family, type, IFC class, specs), `ITEM_PARTS` (item to part ids), `PMETA` (part to IFC2X3 class), animation sequences `SEQ` | Yes |
| `PROJECT BLOCK 4/4` | `PD`: part groups and their specification lines | Yes |

Sheet defaults (title, notes, legend, callouts) are in the `SH` and `DR` objects.

## How to start a new project from the template

1. Copy `src/lift_station_3d.html` to `src/<new-project>.html`.
2. Update block 1: parameters, units, reference level, project title (`DR.title`, `DR.sub`, `DR.dwg`).
3. Rewrite block 2: model the new project with `part('id', ()=>{...}, idx)` calls. Each part id must be unique and lowercase. Keep helper calls (`box`, `cyl`, `pipe`, `extruded`).
4. Update block 3: one `add(...)` line per BOQ item (code, names EN/AR, quantity formula, unit, IFC class, Revit category, family, type, material, spec lines, status `sheet` or `assumed`). Map each item to part ids in `ITEM_PARTS`, and each part to an IFC2X3 class in `PMETA`.
5. Update block 4: the part groups shown in the Parts tab.
6. Update the animation windows in `SEQ` if the assembly order differs.
7. Update `CONCP` (concrete part ids that get hatched) and `BEYOND_PARTS` (parts drawn as projected lines in sections).
8. Build the standalone file: `python3 tools/build_standalone.py src/<new-project>.html index.html` (inlines Three.js and jsPDF so the file works offline).
9. Push to the `main` branch. GitHub Pages serves `index.html`.

## Data the user can enter on the page (saved in the browser, exportable as JSON)

- Per item: unit cost, brand, model, supplier, mark, phase, LOD (100 to 500), notes, extra parameters, family and type.
- Per family type: manufacturer, model, cost, description, custom parameters. Add types and parameters, then assign them to items.
- Project JSON: "Save project" and "Load project" move everything (parameters, data, sheet fields) between browsers and projects.

## Checks to run after changing a project

- Open the page and read the browser console (no errors).
- Export DXF 3D, IFC, XLSX, and sheet PDF; validate with `ezdxf` and `ifcopenshell` (`pip install ezdxf ifcopenshell openpyxl pypdf`).
- Open the DXF in a CAD program and the IFC in a BIM program before relying on them.

## Naming

Template name: **BVT-1 (BIM Viewer Template)**. Keep the name in the page comment, the `Template BVT-1` tooltip on the language switch, and the project JSON (`"template": "BVT-1"`).
