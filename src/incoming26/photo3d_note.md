# Photos to 3D (F.X Capture): integration note (incoming26)

Photogrammetry in T.O X: photos -> textured 3D mesh + orthophoto + DSM/DTM, processed by a **local NodeODM (OpenDroneMap) Docker container** that the bridge starts on 127.0.0.1. Nothing leaves the machine.

## Files
| File | What |
|---|---|
| `tox_photo.py` | new bridge module (stdlib only), imported by `tox_bridge.py` |
| `tox_bridge_photo.diff` | 3 small hunks for `site/tools/tox_bridge.py`: import `tox_photo`, route `/photo/*` in `do_GET` / `do_POST`, `"photo": true` in `/ping`. Apply: `patch -p1 < tox_bridge_photo.diff` from `site/`, copy `tox_photo.py` to `site/tools/` |
| `ph_core.js` `ph_import.js` `ph_ui.js` | page chunks (prefix `ph` / `PH`), append **after `c_rc_ui.js`** |
| `chain.diff` | the one-line change to `patch_v3.py` (applies cleanly, checked) |
| `privacy_phwipe.diff` | one line in `privacy.js` `wipe()`: calls `phWipe()` if present, before the bridge token is cleared |
| `fake_nodeodm.py` `fake_docker.py` `ph_fixtures.py` | test rig (fake NodeODM REST server, fake `docker` CLI, hand-built result files) |
| `test_photo_bridge.py` (57 checks) `ph_test.js` (page, about 85 checks) `regress.sh` | tests |

## Bridge (`tox_photo.py`)
All routes: token (header only), Host and Origin loopback, otherwise 401 / 403.
- `GET /photo/status`: docker found / daemon up / image present / container state / NodeODM `/info` / host CPUs and RAM / pull progress (layers seen, downloaded, unpacked) / start phase and error.
- `POST /photo/start {memory_gb?, cpus?}`: pulls `opendronemap/nodeodm` if missing (background, progress in status), then `docker run -d --name tox-nodeodm -p 127.0.0.1:3000:3000 --memory Ng --memory-swap Ng --cpus C --pids-limit 4096 --security-opt no-new-privileges --restart no`. Default RAM = 75 % of Docker's VM, CPUs = all but one. Reuses a stopped container (`docker start`).
- `POST /photo/stop`: `docker stop` (job data stays inside).
- `POST /photo/wipe {image?}`: `docker rm -f -v tox-nodeodm` (container, uploaded photos, task data, results all gone); `image:true` also `docker rmi`.
- `* /photo/odm/<path>`: passthrough to **127.0.0.1:3000 only** (host fixed in code, `TOX_ODM_PORT` env for tests). Allow-list: `/info /options /task/list`, `POST /task/new/init`, `/task/new/upload/<uuid>`, `/task/new/commit/<uuid>`, `GET /task/<uuid>/info?with_output=N`, `/output`, `/download/<asset>`, `POST /task/cancel|remove|restart`. Assets: all.zip, orthophoto.tif/png, textured_model.zip, georeferenced_model.laz/las/ply, dsm.tif, dtm.tif, cameras.json, shots.geojson (no 3d_tiles). Query string only `with_output=N`. The init body (max 64 KB) is checked: **no `webhook`**, options only from an allow-list (names and simple values), **`3d-tiles` refused unless false**. Uploads are streamed in 64 KB pieces (max 256 MB per request, the page sends about 12 MB batches), downloads streamed back. The bridge token is never forwarded. Nothing is written to disk by the bridge.
- Override docker binary with `TOX_DOCKER`, image with `TOX_ODM_IMAGE`, container name `TOX_ODM_NAME`.

## Page
New pane `pane:rcphoto` **in the F.X Capture tab** (default layout changed to map 40 % | mission + data 30 % | Photos to 3D 30 %; saved layouts untouched). Command `rc_photo3d`, ribbon group "Photos to 3D" in the F.X Data tab, phrases (EN / AR: "photos to 3D", "تحويل الصور الى 3D"). Every button has an EN/AR hover text; commands have XDESC.
1. **Engine**: check Docker / start / stop, RAM and CPU boxes, pull progress bar.
2. **Photos**: drag and drop (files or folder), pick photos, pick folder, GCP file (`gcp_list.txt`, header and point count checked). Summary: count, size, GPS count, altitude range, extent, spacing, MP. Simple checks: under 8 photos = refused, under 20 = warning, no GPS, some without GPS, mixed sizes / cameras, isolated shots, possible blur (edge test on a 320 px copy, flagged under 35 % of the median), duplicate names, huge set. "Show positions on map" feeds the existing G.X photo layer.
3. **Presets**: fast (`fast-orthophoto`, ortho only), balanced (feature / pc quality medium, `mesh-octree-depth` 11, 5 cm, DSM), high (high / high, depth 12, 2 cm, DSM + DTM). Advanced: ortho cm, mesh depth, feature / pc quality, DTM, GLB (`gltf`), LAS (`pc-las`), job name. `3d-tiles` is never sent. Options the NodeODM does not list in `/options` are dropped and the panel says which. Time guess is a labelled range, not a measurement.
4. **Job**: init, upload in batches (3 tries each), commit, poll every 3 s with console log (`with_output`), progress, elapsed, ETA (only after 5 %, labelled rough), cancel, remove job.
5. **Results**: download + import, or save to disk. Also **import a result file from disk** (works with any ODM output, no Docker needed).

### What goes where
| Result | Into the app |
|---|---|
| `dsm.tif` / `dtm.tif` | new TIFF reader (tiled or strips, none / deflate, predictor 1 / 2 / 3, 8 / 16 / 32 bit, float, GeoKey EPSG) -> `rcGridSurf` = same surface path as `rcTiffImport`, so TIN, contours, slope, cut / fill, `TOX.make_contours`, `TOX.compute_cut_fill` work on it (tested). UTM EPSG sets the tab CRS when the tab is in UTM mode |
| `orthophoto.tif` | decoded to a canvas (max 4096 px side, every n-th pixel), `RC.ortho` + `RC.world` + `rcOrthoPlace` = G.X / F.X map overlay; optional ground plane in the 3D scene |
| `textured_model.zip` / `all.zip` | OBJ + MTL + textures -> `T.Group` `photo3d` in the shared 3D scene (R.X), centred at the origin, lowest point at 0, axes E / N / up -> x / -z / y, offset / scale / rotation boxes, frame, show / hide. With `all.zip` `odm_georeferencing/coords.txt` is read: UTM and lat / lon of the mesh centre are reported |
| `*.glb` | small GLB reader (POSITION, TEXCOORD_0, indices, base colour texture; node transforms ignored) |
| `georeferenced_model.las` | existing `rcImportFile` LAS path (decimated cloud on the map). **LAZ refused** (no LASzip decoder): tick "LAS cloud" before the run |

### Wipe
`phWipe()` (also the "Delete job data and container" button and command `rc_ph_clean`): cancels polling, forgets files / job / downloaded bytes, removes mesh and textures from the scene (geometry and materials disposed, object URLs revoked), removes imported surfaces and orthophoto overlay, then calls `/photo/wipe` (container + job data). If the bridge is not connected it says so and prints `docker rm -f -v tox-nodeodm`. `privacy.js` calls `phWipe()` when present; the result line appears in the wipe report.

## Honest limits (also printed in the pane)
- **Time**: minutes to many hours; depends on CPU. Docker on a Mac has no GPU. Plan estimate: 300 photos of 20 MP need roughly 16 to 32 GB RAM and 30 to 90 min on a recent desktop (from REALITY_CAPTURE_PLAN, marked M/E); the panel guess is 0.1 to 0.3 min per 20 MP photo (balanced) scaled by preset, **a guess, not measured**.
- **Minimum**: about 20+ photos with 70 % front / 60 % side overlap; under 8 refused by the page check.
- **Licence**: ODM, NodeODM are AGPL-3.0. T.O X runs the unmodified `opendronemap/nodeodm` image as a separate program and talks HTTP to it; it includes none of their code. If T.O X ever ships or modifies them, get advice.
- **Privacy**: all page traffic is `fetch` to the bridge on 127.0.0.1 (logged by the privacy gate as local, allowed in Sensitive mode); the container is published on 127.0.0.1 only; no webhook can be set. Docker itself pulls the image from Docker Hub once (the only internet use).
- **Image size** (Docker Hub, read 2026-11-21, `opendronemap/nodeodm:latest`): **741 MB compressed arm64, 802 MB amd64** (under 2 GB; unpacked size not stated by the API, expect a few GB on disk).
- **Mesh position**: the 3D scene has no map coordinates. The mesh is centred at the origin; real-world centre is only known with `all.zip`. It overlaps the demo lift-station model: move or hide it.
- Not done: S.X plan views do not get the orthophoto as an underlay (only the map overlay and the 3D ground plane); PNG / TIFF photos get no EXIF / blur check; BigTIFF, LZW / JPEG-compressed TIFF refused with a message; OBJ over 2.5 M faces refused; asset bigger than 1.5 GB refused (use `docker cp`); 3D Tiles off.

## Regression on the private build (2026-11-21)
parity **126/126**, px2 **149/149**, freeai **88/88**, privacy **109/109**, Photos to 3D page test **84/84**, bridge **57/57**. **link: NOT confirmed (43 not reached).** `link_test.js` times out on this loaded machine (`setInputFiles` on the IFC box on my build, then `page.screenshot` timeout on the current `site/index.test.html` with none of my chunks), so it fails on both builds for load reasons; the first 6 checks pass on mine. Please re-run link on a quiet machine after merge.

## What was and was NOT verified
Verified (all on the private build, Docker-free):
- Bridge, 57 checks (`test_photo_bridge.py`) against a fake `docker` and fake NodeODM: auth, Host / Origin, query token refused, allow-list, traversal, webhook, bad / 3d-tiles options, 413, daemon down message, pull progress, run arguments (127.0.0.1, memory, cpus, name, pids, no-new-privileges), 4 MB streamed upload intact, token not forwarded, polling with `with_output`, downloads equal, cancel / remove, stop, restart reuses container, wipe incl. image, wipe twice. (It found a real bug: a bad `memory_gb` left the start state stuck. Fixed.)
- Page, `ph_test.js`: real bridge + fake docker + fake NodeODM: panes, ribbon, XDESC, bilingual, photo checks on 24 synthetic JPEGs with hand-written EXIF (GPS, altitude, blur, missing GPS), drag and drop, GCP check, presets / options, upload of 25 files, polling, cancel, download + import of every asset type with hand checks (DSM 40 x 30 Z 100 to 109.7, 1199 points; orthophoto pixel values vs PIL; OBJ 12 faces 10 x 10 x 5 m, axes; coords.txt to lat / lon; GLB; LAS; LAZ refusal; strip TIFF; LZW refusal), existing contours and cut / fill on the imported DSM, placement, privacy wipe through `PRIV.wipe`, every `/photo/` request went to 127.0.0.1:38767, no page errors.
- The orthophoto TIFF fixture was read independently by PIL (tiled deflate predictor 2).

NOT verified:
- **No real ODM run.** Docker Desktop was not running when I checked (socket missing), so no image pull and no real job. No real NodeODM / ODM output was ever opened; the fixtures are built from the TIFF / OBJ / GLB / LAS format rules.
- **Predictor 3 (float)** is written and read by my own code from libtiff's rules; no third-party reader confirmed it. ODM's actual DSM compression / predictor is not known to me.
- ODM option names are from the plan and memory: `fast-orthophoto dsm dtm mesh-octree-depth feature-quality pc-quality orthophoto-resolution` are standard; `pc-las` and `gltf` may not exist in your version (the page drops options missing from `/options`).
- The REST paths and fields (`init`, `upload` field `images`, `commit`, `info?with_output`, `cancel` / `remove` with `uuid`, asset names such as `textured_model.zip`) follow the NodeODM API doc named in the plan; real NodeODM was not called.
- Real mesh size / texture count / 3D rendering speed in WebGL: tested with a 12-face cube only; no GL renderer was exercised (headless).
- Real EXIF from real drones (DJI XMP etc.) beyond what `rcExif` already handled.

## First real run (owner), after merging
1. Start Docker Desktop. `python3 tools/tox_bridge.py --serve site`, connect the bridge in the page.
2. F.X tab -> Photos to 3D -> Start NodeODM (first time pulls the ~0.75 GB image). Pick 20+ overlapping photos, preset **fast** first, Upload and start.
3. Report: job time, RAM given to Docker, whether `dsm.tif` and the mesh import, and any "option dropped" line.
