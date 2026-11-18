# Prompt: create a new project from BVT-1

Paste this into Claude Code (any account), with the new project's drawings or data attached.

```
Use the template BVT-1 (BIM Viewer Template) in this repo: template/BVT-1/README.md and src/lift_station_3d.html.
Create a new project page from it:
1. Copy src/lift_station_3d.html to src/<project>.html.
2. Read my drawings/data first. Extract dimensions, levels, components, quantities and specs. Do not invent values: mark anything you assume as `assumed` and list it in the notes.
3. Edit only the four PROJECT BLOCKs (parameters, buildModel geometry, baseItems + ITEM_PARTS + PMETA + SEQ, PD part specs). Keep the ENGINE block unchanged.
4. Build the standalone page: python3 tools/build_standalone.py src/<project>.html index.html
5. Test in a browser: no console errors, hover data works, section planes work, the sheet renders, and exports open (validate DXF with ezdxf and IFC with ifcopenshell).
6. Update docs/MEETING_ROOM.md with the decisions, open questions and what was NOT tested.
7. Reply in short Egyptian Arabic. Never claim a file opens in AutoCAD or Revit unless you actually opened it there.
```
