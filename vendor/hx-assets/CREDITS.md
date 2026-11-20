# H.X assets: credits and licences

All assets below are **CC0 1.0 (public domain)**; no credit is legally required, but credit is given here and in the app (Materials / Furniture panes). Checked on 2026-11-20:

- Poly Haven: https://polyhaven.com/license says all HDRIs, textures and 3D models are CC0, free for commercial use, no credit needed. Data fetched through https://api.polyhaven.com (info + files). Each asset's authors come from the API `authors` field.
- Kenney Furniture Kit 2.0: https://kenney.nl/assets/furniture-kit lists licence 'Creative Commons CC0'; the zip's License.txt says 'Creative Commons Zero, CC0' (http://creativecommons.org/publicdomain/zero/1.0/).
- three.js `GLTFLoader.js` r128 (examples/js/loaders, from cdn.jsdelivr.net/npm/three@0.128.0): MIT licence, (c) three.js authors.
- No file carries a visible watermark. Textures were resized to 512 px and recompressed to JPEG (quality ~70) by `sips`; Poly Haven models were repacked from glTF+bin+1k textures to GLB with textures reduced to 512 px (Kenney GLBs are used unchanged). The shipped packs are `.js` files holding base64 of those files.

## Download total (what was fetched from the network)

| Item | MB |
|---|---|
| 40 Poly Haven textures, 1k JPG, diffuse + normal GL (80 files) | 52.0 |
| Kenney Furniture Kit zip | 5.1 |
| 6 Poly Haven models, 1k glTF + bin + textures | 4.4 |
| GLTFLoader.js | 0.1 |
| **Total downloaded** | **about 61.6 (limit 80)** |

Shipped size in `vendor/hx-assets/`: see the end of this file.

## Materials (Poly Haven, CC0), 512 px colour + normal, file `hxa_mat_<group>.js`

| id | name | group | tile m | authors | source |
|---|---|---|---|---|---|
| plank_flooring | Oak planks | floor | 1.34 | Dario Barresi, Dimitrios Savva, Rico Cilliers | https://polyhaven.com/a/plank_flooring |
| plank_flooring_02 | Wide planks | floor | 1.98 | Dario Barresi, Dimitrios Savva | https://polyhaven.com/a/plank_flooring_02 |
| laminate_floor_02 | Laminate | floor | 1.7 | Dario Barresi, Charlotte Baglioni | https://polyhaven.com/a/laminate_floor_02 |
| dark_wooden_planks | Dark wood planks | floor | 2.0 | Amal Kumar | https://polyhaven.com/a/dark_wooden_planks |
| diagonal_parquet | Diagonal parquet | floor | 2.36 | Jenelle van Heerden, Sergej Majboroda | https://polyhaven.com/a/diagonal_parquet |
| rectangular_parquet | Rectangular parquet | floor | 2.25 | Jenelle van Heerden, Sergej Majboroda | https://polyhaven.com/a/rectangular_parquet |
| floor_tiles_06 | Floor tiles 06 | floor | 3.0 | Rob Tuytel | https://polyhaven.com/a/floor_tiles_06 |
| floor_tiles_08 | Floor tiles 08 | floor | 1.5 | Rob Tuytel | https://polyhaven.com/a/floor_tiles_08 |
| patio_tiles | Patio tiles | floor | 2.15 | Dario Barresi | https://polyhaven.com/a/patio_tiles |
| terracotta_floor_tiles | Terracotta tiles | floor | 2.08 | Dimitrios Savva | https://polyhaven.com/a/terracotta_floor_tiles |
| interior_tiles | Interior tiles | floor | 1.9 | Charlotte Baglioni | https://polyhaven.com/a/interior_tiles |
| slate_floor_03 | Slate floor | floor | 2.0 | Dimitrios Savva | https://polyhaven.com/a/slate_floor_03 |
| marble_01 | Marble | floor | 1.5 | Rob Tuytel | https://polyhaven.com/a/marble_01 |
| marble_tiles | Marble tiles | floor | 2.0 | Charlotte Baglioni | https://polyhaven.com/a/marble_tiles |
| marble_mosaic_tiles | Marble mosaic | floor | 2.0 | Amal Kumar | https://polyhaven.com/a/marble_mosaic_tiles |
| smooth_concrete_floor | Smooth concrete | floor | 2.0 | Dimitrios Savva | https://polyhaven.com/a/smooth_concrete_floor |
| concrete_floor_02 | Concrete floor | floor | 2.0 | Rob Tuytel | https://polyhaven.com/a/concrete_floor_02 |
| painted_concrete | Painted concrete | floor | 2.0 | Dario Barresi, Dimitrios Savva | https://polyhaven.com/a/painted_concrete |
| scuffed_cement | Scuffed cement | floor | 1.62 | Dario Barresi, Dimitrios Savva | https://polyhaven.com/a/scuffed_cement |
| white_plaster_02 | White plaster | wall | 1.0 | Rob Tuytel | https://polyhaven.com/a/white_plaster_02 |
| beige_wall_001 | Beige wall 1 | wall | 3.0 | Dimitrios Savva, Rico Cilliers | https://polyhaven.com/a/beige_wall_001 |
| beige_wall_002 | Beige wall 2 | wall | 3.0 | Dimitrios Savva, Rico Cilliers | https://polyhaven.com/a/beige_wall_002 |
| plastered_wall_04 | Plastered wall | wall | 3.2 | Rob Tuytel | https://polyhaven.com/a/plastered_wall_04 |
| grey_plaster | Grey plaster | wall | 1.0 | Rob Tuytel | https://polyhaven.com/a/grey_plaster |
| brick_wall_001 | Brick wall | wall | 3.0 | Rob Tuytel, Dimitrios Savva | https://polyhaven.com/a/brick_wall_001 |
| red_brick_03 | Red brick | wall | 1.0 | Rob Tuytel | https://polyhaven.com/a/red_brick_03 |
| white_bricks | White bricks | wall | 1.5 | Rob Tuytel | https://polyhaven.com/a/white_bricks |
| large_red_bricks | Large red bricks | wall | 2.0 | Rob Tuytel | https://polyhaven.com/a/large_red_bricks |
| ceiling_interior | Ceiling panels | metal | 2.0 | Dimitrios Savva | https://polyhaven.com/a/ceiling_interior |
| metal_plate | Metal plate | metal | 0.5 | Rob Tuytel | https://polyhaven.com/a/metal_plate |
| metal_plate_02 | Metal plate 2 | metal | 2.0 | Rob Tuytel | https://polyhaven.com/a/metal_plate_02 |
| blue_metal_plate | Blue metal | metal | 2.5 | Rob Tuytel | https://polyhaven.com/a/blue_metal_plate |
| leather_white | White leather | fabric | 0.3 | Rob Tuytel | https://polyhaven.com/a/leather_white |
| brown_leather | Brown leather | fabric | 0.4 | Rob Tuytel | https://polyhaven.com/a/brown_leather |
| velour_velvet | Velvet | fabric | 0.28 | colormass, Rico Cilliers | https://polyhaven.com/a/velour_velvet |
| rough_linen | Linen | fabric | 0.27 | colormass, Rico Cilliers | https://polyhaven.com/a/rough_linen |
| sparse_grass | Sparse grass | outdoor | 2.0 | Amal Kumar | https://polyhaven.com/a/sparse_grass |
| leafy_grass | Leafy grass | outdoor | 2.0 | Charlotte Baglioni | https://polyhaven.com/a/leafy_grass |
| asphalt_01 | Asphalt | outdoor | 2.08 | Dario Barresi, Charlotte Baglioni | https://polyhaven.com/a/asphalt_01 |
| worn_asphalt | Worn asphalt | outdoor | 2.0 | Amal Kumar | https://polyhaven.com/a/worn_asphalt |

Plain colour / glass entries (paint and glass swatches) are generated in code, no file.

## Models (GLB), file `hxa_mdl_<id>.js`

| id | name | source | licence | author | original id | raw KB |
|---|---|---|---|---|---|---|
| sofa | Sofa | Poly Haven | CC0 | Kirill Sannikov | https://polyhaven.com/a/Sofa_01 | 258 |
| armchair | Armchair | Poly Haven | CC0 | Kirill Sannikov | https://polyhaven.com/a/ArmChair_01 | 348 |
| dchair | Dining chair | Poly Haven | CC0 | James Ray Cock | https://polyhaven.com/a/dining_chair_02 | 682 |
| deskchair | Desk chair | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | chairDesk.glb | 38 |
| dtable | Wooden table | Poly Haven | CC0 | Fran Calvente | https://polyhaven.com/a/WoodenTable_02 | 236 |
| ctable | Coffee table | Poly Haven | CC0 | Amin | https://polyhaven.com/a/modern_coffee_table_01 | 263 |
| desk | Desk | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | desk.glb | 14 |
| tvunit | Television | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | televisionModern.glb | 6 |
| sidetable | Side table | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | sideTable.glb | 8 |
| bed2 | Double bed | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | bedDouble.glb | 22 |
| bed1 | Single bed | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | bedSingle.glb | 18 |
| wardrobe | Wardrobe / bookcase | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | bookcaseClosedDoors.glb | 22 |
| lampfloor | Floor lamp | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | lampRoundFloor.glb | 6 |
| lampceil | Ceiling lamp | Poly Haven | CC0 | James Ray Cock | https://polyhaven.com/a/modern_ceiling_lamp_01 | 255 |
| toilet | Toilet | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | toilet.glb | 17 |
| basin | Wash basin | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | bathroomSink.glb | 22 |
| bathtub | Bathtub | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | bathtub.glb | 34 |
| shower | Shower | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | shower.glb | 50 |
| kcab | Kitchen base unit | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | kitchenCabinet.glb | 10 |
| ksink | Kitchen sink unit | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | kitchenSink.glb | 22 |
| kstove | Cooker | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | kitchenStove.glb | 53 |
| kfridge | Fridge | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | kitchenFridge.glb | 19 |
| door | Door in wall | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | doorway.glb | 14 |
| window | Window in wall | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | wallWindow.glb | 10 |
| plant | Potted plant | Kenney Furniture Kit 2.0 | CC0 | Kenney (www.kenney.nl) | pottedPlant.glb | 7 |

## Shipped size

32 files, 9.7 MB on disk (all lazily loaded; nothing loads until a pane is opened).
