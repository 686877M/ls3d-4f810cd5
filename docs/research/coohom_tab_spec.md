# Coohom-style interior tab: specification + gap vs `H.X Home`

Legend: **[S]** appears in a search-result snippet of a Coohom or review page (pages NOT opened in full, mostly vendor marketing). **[M]** from memory, not verified. **[C]** read from our code `src/build/c_home.js` (read-only). Own wording, no Coohom artwork or catalogue data.

Search results used (snippets only):
- https://coohom.com/b2b/solutions/residential-design (2D start, draw walls or upload CAD/floor plan, 3D)
- https://www.coohom.com/article/floor-plan-creator-for-interior-designers (2D/3D two-way sync)
- https://www.g2.com/products/coohom/features and /reviews (render up to 16K, video and 360 walkthrough rendering)
- https://www.e.coohom.com/coohom-ultimate-rendering (render modes plan / perspective / panorama; panorama and 720 walkthrough)
- https://www.roomsketcher.com/?p=25874 (competitor comparison; weigh with care)
- https://www.capterra.com/p/192882/Coohom/ , https://apps.apple.com/app/id1621093551 (listings)
Claims such as "300,000+ products" and "16K" come from vendor/listing snippets; treat as marketing figures.

## 1. What Coohom-like tools offer

| Area | Capability | Source |
|---|---|---|
| Floor plan | Draw walls in 2D, or upload a floor plan/CAD file and trace it; edits sync 2D↔3D | [S] |
| Floor plan | Wall thickness/height, room auto-detection from closed walls, room names, area labels, dimensions | [M] |
| Openings | Doors, windows, openings placed on walls; resize, sill height, swing direction; cut the wall | [M] |
| Structure | Multi-floor, ceilings, columns, beams, stairs, slab/floor levels | [M] |
| Catalogue | Large library of 3D products by category (furniture, kitchen, bath, lighting, decor, soft furnishings, doors/windows, appliances), brand libraries, upload own models/textures | [S] + categories [M] |
| Materials | Floor/wall/ceiling finishes (paint, tile, wood, wallpaper), per-surface tiling, colour, texture scale/rotation | [M] |
| Lighting | Lights (ceiling, spot, strip, lamps), day/night, light colour/intensity, render-time sun | [M] |
| 3D | Live 3D, orbit, first-person walk, top view, 2D/3D toggle | [S/M] |
| Render | Cloud render stills (plan, perspective, panorama), video/360 walkthrough, 720 tour, resolution tiers incl. very high | [S] |
| Quantities | Floor area, wall area, item lists/BOQ [M]; paid tier detail unknown |
| Styles / templates | Predefined room layouts and style packs (modern, nordic, classic…), AI design suggestions | [M] |
| Collaboration | Share link, export images/PDF, DWG import/export | [M] |
| Pricing note | Core planning/3D preview free; higher-res cloud rendering and premium brand libraries paid | [S] |

## 2. What `H.X Home` has today [C]
- State `HM`: rooms (axis-aligned rectangles: name, x, z, w, d, floor colour, wall colour), items (type, x, z, rotation, w, d, h, colour), room wall height 2.8 m, wall thickness 0.12 m, saved in localStorage key `xto-hm`.
- 17 generic item types: double bed, sofa, dining table, chair, wardrobe, desk, kitchen unit, fridge, toilet, basin, shower, bathtub, TV unit, rug, door, window, ceiling light. Parametric box-style 3D models; sizes editable (W/D/H/rotation/colour).
- 2D canvas plan: grid, select/move, "Draw a room" by dragging a rectangle (0.1 m snap), 90° rotate button, delete.
- Live 3D group in shared Three.js scene, walls at 0.92 opacity, point light for ceiling lights, camera frame button.
- Quantities line: floor area, wall perimeter, wall area ("no openings deducted"), item count.
- Ribbon "Home": Plan (Draw a room, Sample flat), View (Frame 3D, iso, perspective, top, shaded), Output (Render the interior, Screenshot, Render, PDF). Render goes through the existing render panel.
- Not present: walls as separate objects, openings that cut walls, non-rectangular rooms, multiple floors, catalogue/categories/search, materials library, lights beyond a point light per ceiling fixture, walkthrough, panorama, undo/redo, copy/duplicate, snap-to-wall, dimensions, templates/styles.

## 3. Gap list (prioritised; P0 = owner complaint "very poor tabs, tools, editing")

| Pri | Gap | Build |
|---|---|---|
| P0 | **Tabs/panels**: add Design, Walls & Openings, Catalogue, Materials, Lighting, Render, Quantities ribbon tabs mirroring workflow | Extend `RIB` with these tabs; reuse panel infra |
| P0 | **Real walls**: wall segments with thickness/height, draw by click-click polyline, close loop → room; rooms from polygons not only rectangles | Wall graph + polygon room detection (planar cycles) |
| P0 | **Openings on walls**: door/window as wall-hosted object (offset along wall, width, sill, height, swing); cut hole in 3D wall; deduct from wall area | CSG-lite: split wall box into pieces around opening |
| P0 | **Editing**: undo/redo, copy/paste/duplicate, multi-select (box), align/distribute, snap to wall/grid/other item, lock, group, mirror, nudge, dimension labels, delete key | Command stack + selection set |
| P0 | **Catalogue**: categories + search + thumbnails; at least 80 generic parametric items (beds, sofas, tables, storage, kitchen, bath, lighting, decor, appliances, doors/windows, plants, rugs) with dimension variants; drag from panel to plan | Data table `{cat,id,name_ar,name_en,w,d,h,builder}`; no brand data |
| P1 | **Materials**: floor/wall/ceiling presets (paint colours, tile, wood, concrete, marble) with texture scale/rotation; per-room and per-wall surface | Procedural/CC0 textures only; check licences |
| P1 | **Lighting**: light types (ceiling, spot, strip, lamp), intensity/colour, day/night, sun angle, shadows toggle | Three.js lights + shadow maps |
| P1 | **Multi-floor**, ceilings, stairs, columns | Floor array with elevation; stair generator |
| P1 | **3D tools**: first-person walkthrough, top view, 2D/3D split, section/cutaway, wall-hide-when-facing-camera | Camera controllers |
| P1 | **Quantities**: wall area minus openings, floor/ceiling area, paint/tile quantity with waste %, item list/BOQ → Excel export | Extend `hmArea` |
| P2 | **Render outputs**: still sizes, panorama/360, simple video walkthrough along a path | Offscreen canvas + equirect cube render; path keyframes (MediaRecorder) |
| P2 | **Templates and styles**: room layout presets (living, bedroom, kitchen, bath), style packs recolouring items/materials | JSON presets |
| P2 | **Import/export**: trace image/PDF/DWG as 2D underlay (scale by two points), export plan PNG/PDF/DXF, glTF/OBJ | Underlay image layer + scale tool |
| P3 | AI layout suggestion, custom model upload (glTF), collaboration/share | Later; model upload needs size/licence checks |

## 4. Implementable spec (compact)

**Data model**
```
Project { floors:[Floor], styles, units }
Floor { elevation, height, walls:[Wall], rooms:[Room], items:[Item], underlay? }
Wall { id, a:[x,z], b:[x,z], t, h, finishA, finishB, openings:[Opening] }
Opening { id, type:door|window|arch, offset, w, h, sill, swing }
Room { id, name, polygon:[[x,z]...], floorMat, ceilMat, level }  // auto from closed walls
Item { id, cat, typeId, x, z, y, rot, w, d, h, mat, locked, group? }
```
**2D editor modes**: Select/Move, Wall (polyline, ortho lock with Shift, type length), Room (rect/polygon shortcut), Door/Window (hover wall to place), Item (drop from catalogue), Dimension, Text label, Eraser, Pan/Zoom, Underlay scale.
**Panels**: Catalogue (categories, search, favourites), Properties (per selection), Materials, Lighting, Layers/Floors, Quantities.
**3D**: orbit, walk (eye 1.6 m, collision with walls), top, cutaway; shadows on/off; day/night.
**Outputs**: render still, panorama, walkthrough video, PDF plan with dimensions and area table, BOQ xlsx.

## 5. Build order
1. Undo/redo + multi-select + copy + snap (editing fix) on current model.
2. Catalogue panel with categories/search and the expanded generic item set.
3. Wall objects + polygon rooms; migrate saved `xto-hm` rooms (rectangles → 4 walls).
4. Openings on walls + wall area deduction.
5. Materials and lighting panels.
6. Ribbon tabs reorganised to the workflow; Quantities/BOQ export.
7. Walkthrough, panorama, floors, templates, underlay.

## 6. Not verified
No Coohom page was opened in full; catalogue counts, render resolutions and free/paid split are from snippets and may be marketing. Real tool names, tab names and shortcut keys of Coohom were not checked. Competitor comparison (RoomSketcher) may be biased. Legal: do not copy Coohom/brand product models, textures or UI artwork.
