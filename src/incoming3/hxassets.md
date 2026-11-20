# hxassets: H.X Materials pane, Furniture catalogue, better render lighting

Files in `site/src/incoming3/`: `hxassets_data.js` (catalogue tables + registry `HXA`, made global because the pack files call it), `hxassets.js` (loaders, panes, hooks), `hxassets_render.js` (lighting, `HXR`), `hxassets_test.js` (Playwright, 30 checks, all pass), `hxassets_gen.py` (how the packs and the data chunk were produced from the downloads; paths are from this session). Assets in `site/vendor/hx-assets/` (9.7 MB, 32 files, licences in `CREDITS.md`).

## Integration
1. `patch_v3.py`: add after `rd('c_adhan.js')` (must come after c_home, c_revit*, c_render): `+rd('hxassets_data.js')+rd('hxassets.js')+rd('hxassets_render.js')` (copy the three chunks next to the `c_*.js`).
2. Deploy `site/vendor/hx-assets/` next to `index.html` (same as `vendor/pdfjs`). Everything is loaded by `<script src="vendor/hx-assets/...">` on demand, so the page works from file:// and there is no runtime network.
3. Test: `NODE_PATH=<playwright-core dir> node hxassets_test.js file:///.../site/index.html` (needs a real WebGL context; flags for swiftshader are in the script).
New top-level names: `HXA`, `HXC`, `HXR`, `HXD1`, `HXD2`, `hxaDecorate`, `hxaRoom`, `hxaApply`, `hxmPanel`, `hxfPanel`, `hxaSel`, `hxaHook`, `hxaN`. Wrapped (previous function is called first): `hmBuild`, `hmPanel`, `rvBuild`, `rnLight`, `wxDefs`.

## What it adds
- Ribbon: H.X tab, new group **Assets** (Furniture catalogue, Materials) and **Better lighting** in the Output group. Panes `hxmat`, `hxfur` (floating, like Render).
- **Materials pane**: tabs Floors (19) / Walls (9) / Ceiling+metal (4) / Fabric (4) / Outdoor (4) / Paint+glass (10 colour entries, no file). Swatches show the colour map, preview sphere (offscreen WebGL, colour + normal map), buttons: room floor, room walls, R.X selected wall/floor, clear room. Room materials are stored on the room (`fm`, `wm`) so they save with H.X (`xto-hm`). Tiling uses the real tile size of each texture (metres), per wall/floor mesh.
- **R.X**: R.X had NO material fields (the parity chunk says so), so a new element field `mat` is added on walls and floors (saved with `xto-rv` because rvSave stores the whole element). Selected R.X elements keep a warm tint so the selection stays visible.
- **Furniture pane**: 25 GLB models in 9 categories, thumbnails rendered with three.js from the GLB (cached in memory, rendered the first time the pane opens), click to place in the selected room, drag onto the 2D plan, buttons rotate ±15° / 90°, scale ±10%, delete. Items are normal `HM.items` with `t:'g_<id>'`, so the existing props panel (W/D/H/rotation/colour/delete), areas and save work unchanged. Every catalogue type is registered in `HMC` at load (needed on reload, see Findings).
- **Render**: `rnLight` wrapper turns on, for the duration of one render only: soft PCF shadows from the sun (2048 map, fitted to the model bounds), generated sky environment (PMREM of a gradient dome with a sun disc, hemisphere light cut to 55%), ACES filmic tone mapping, contact-shadow blobs under H.X items. `XC.hx_light` toggles the same settings live in the view. `HXR.hq=false` disables it for renders. Skipped automatically when the software renderer (`SoftR`) is in use.

## Measured (swiftshader = software GL, so numbers are pessimistic; no real GPU was available)
- Live view 898x572, this H.X sample: 154 ms/frame plain, 265 ms/frame with better lighting (about +110 ms in software GL; on a real GPU expect a small fraction of that, NOT measured).
- Render command 1920x1080, 1 sample: 6.3 s plain, 6.9 s with better lighting.

## Not tested / limits
- Never run on a real GPU or in a phone browser; no visual comparison beyond looking at before/after screenshots (walls get brighter and bluer from the sky light; exposure is not tuned and ACES was applied on the app's existing linear output, so colours shift slightly).
- Not path tracing. No ambient occlusion pass, only blobs under items; no shadows from the glTF door/window into the room walls.
- Kenney "doorway" and "wallWindow" models include a bit of wall: they are placed as ordinary items, they do not cut the H.X wall boxes. Model front direction is whatever the author used; rotate if needed.
- Models are scaled non-uniformly to the item W/D/H. Sizes are generic, not product data.
- Opening the Furniture pane parses all 25 GLBs (2.5 MB) once for the thumbnails; the Materials pane loads one pack (floor pack is about 2.4 MB of base64) per tab.
- Only the H.X floor and the 4 wall boxes per room get materials (no ceiling mesh exists in H.X).
- Not tested in Arabic UI layout beyond the screenshot; thumbnails use a second WebGL context (falls back to no thumbnails if it cannot be created).

## Findings during tests
- Items with an unknown `t` crash `hmDraw` (`HMC[it.t][..]`): fixed here by registering all `g_*` types at load. Any future type removal would break saved projects.
- Pack scripts are separate classic scripts, so `HXA` had to be `window.HXA` (an IIFE-scoped const is invisible to them).
