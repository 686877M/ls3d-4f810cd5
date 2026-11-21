# G.X maps and F.X aerial view: fix (incoming29)

Chunks, in this order: `gm_core.js`, `gm_ui.js`, `gm_catdata.js`, `gm_cat.js` (append to the END of the chain in `patch_v3.py`, after `rd('c_upd.js')`, or after the last chunk any other session added). No shared file is edited. `chain.diff` is the one-line change against `patch_v3.py` as it was at 17:08 (`base_sha1.txt` = sha1 when first copied; at delivery the file was `5ee94bca4777df7a7e96828f0d5ff7749eb09050`, `chain.diff` is against that one); appending the four `rd(...)` calls by hand is equivalent. `gm_catdata.js` is GENERATED (`gen_cat.py` from `catalogue.py` + `probe_final.json`; those three files and `probe.py`/`probe_final.py` are delivered too).

## 1. What was wrong (reproduced, not guessed)

Headless Chrome, real network, current `site/index.test.html`, open G.X (`wxOpen('pane:gismap')`):

- Tile requests **worked**: 29 x `tile.openstreetmap.org ... 200`. No CSP in the page, no service worker, no console error.
- The map was **light blue**: the first view is centred on `geoLL()`, and the sample project origin (`GEO_D`, UTM 31N, E 500000, N 10000) is a fictitious point at about 0.09 N, 3.0 E, in the Gulf of Guinea. The tiles were real, but they showed open sea. That is "GIS does not open maps". Screenshot: `shots/repro_real.png`.
- F.X (`rc_open`) uses the same canvas (`pane:gismap`, overlay painted from a `gmPaint` wrapper), so its aerial view had the same problem: flight lines drawn over the sea.
- Other real defects found on the way: (a) tiles ignored **Sensitive mode** (`privacy.js` only wraps `fetch`; tiles are `new Image()`, and the S.X Geo panel adds `<img>` and an OSM `<iframe>`); (b) a failed tile left a blank canvas: no message, no offline view; (c) every visible tile (plus parents) was requested at once, no queue; (d) `file://` pages send no `Referer`, which the OSM policy requires.
- Not the cause: the privacy default (`DEF.sensitive=false`), `decide()` allows everything in normal mode.

## 2. What the chunks do

`gm_core.js` (wraps `gmTile`, `gmPaint`, `geoTiles`, `geoPanel`; nothing runs until a map opens):
- request queue: 6 in flight, newest tile first, queue capped at 80 (older queued tiles dropped and re-requested if still visible); a 20 s time-out counts as a failure. No prefetch, no bulk or offline download, browser HTTP cache untouched, `referrerPolicy=strict-origin-when-cross-origin` (sends the page origin, not the path).
- **Offline grid**: if a provider fails 6 times with 0 successes, or Offline-grid mode is on, or the provider is blocked or needs a key, tiles become dark canvases with a grid, the north-west corner latitude / longitude and z/x/y. A red banner says why and what to press (Retry). Features, F.X flight lines and footprints still draw on top (tested, `shots/gm_fx_grid.png`).
- **Over-zoom**: a provider with a lower max zoom (EOX 13, NASA 8) is asked only up to its max; higher zooms stretch the parent tile.
- **Provider table with licence notes** (`GMX.LIC`), a flag line on screen at the bottom right of the map, attribution from the existing bottom bar (`BASEMAPS[..][3]`) for every provider. New providers: `img_key` (Esri imagery with your own ArcGIS API key), `eox`, `gibs`, `custom` (your own raster XYZ server, https only).
- Sensitive mode gate **per host**: no request to a host until approved in Maps > Providers. Stored in `xto-gm`. The API key is kept in `sessionStorage` only (never saved, never in the package export, gone with the tab).

`gm_ui.js`:
- 5 demo places, each with a plot polygon in a layer "Demo plots (approximate, not surveyed)" (`LPLOT`), 400 to 800 m2: **nc2** New Cairo A, Fifth Settlement villa district (649 m2, the default for Project 6868), **nc3** New Cairo B, apartment blocks (644 m2), **nc1** New Cairo C, south of the Teseen road (671 m2), **sz** Sheikh Zayed City (501 m2), **alx** Alexandria Smouha area (540 m2). Coordinates were read by eye from public maps (OSM + Esri tiles viewed 2026-11-21), rounded to 4 decimals. They are **approximate, not surveyed parcels**, no owner, no address, no plot number; every note and command text says so. The old pump-station coordinates are not used anywhere.
- First open with the fictitious origin (or a saved view in that sea spot): the map opens on nc2 at z18 with a message. A real saved view or a real project origin is left alone.
- `gmxOrigin(id)` (command `gm_origin`, toolbar "Set origin"): writes the plot centre into the existing geo frame `geoD()` (`sys 'utm'`, zone from `utmZone`, E, N, `rot 0`, note) and `persist()`. S.X, R.X, F.X read the same `geoLL()`. Test: `geoLL()` returns to the plot centre within 0.005 m. Levels are NOT changed (ground level stays relative; set it from a survey).
- `gmxFly(id)` (command `gm_fly`): sets origin, loads the plot polygon into `RC.m.area` (nadir grid), opens F.X, shows flight lines, footprints, GSD on the basemap or on the grid. 
- Toolbar: **Places** list (zoom to plot), **Set origin**, **Maps...** (providers window), Retry when down.
- Commands (bilingual, with XDESC): `gm_plot_nc2 gm_plot_nc3 gm_plot_nc1 gm_plot_sz gm_plot_alx gm_origin gm_fly gm_menu gm_retry gm_grid gm_layers`; ribbon group **Places** (9 buttons) on the G.X Map tab, added without touching the existing ids.
- Exposed for the other sessions: `GMPLOTS`, `gmxPoly(P)`, `gmxGoPlot`, `gmxOrigin`, `gmxFly`, `GMX`.

## 3. Layer catalogue (follow-up request: all free options back, grouped, with status)

What existed before (checked, git history of `site/` included): `BASEMAPS` had OSM, Esri imagery / topo / street, CARTO Voyager and dark, OpenTopoMap, Wayback (+ 2 Esri reference overlays); `c_geo.js` the Wayback 3x3 imagery grid; `c_gis2.js` viewer links. **NASA GIBS, thermal, Sentinel-2, land cover etc. were never wired in any commit**: GIBS appears only in `REALITY_CAPTURE_PLAN.md` (planned), "thermal" only in the imaging-satellite reference table. So nothing was "dropped"; the catalogue below is new.

`gm_cat.js` + `gm_catdata.js`: window **Maps...** (command `gm_layers`, toolbar "Maps...", ribbon Places) = 80 entries in 10 groups (built from open catalogues, see below): streets and OSM variants (OSM, OSM Germany, Humanitarian OSM, CyclOSM, CARTO light / dark / voyager, Esri street, Esri gray), topo (OpenTopoMap, Esri topo, NatGeo, EOX terrain, Esri hillshade overlay), aerial (Esri World Imagery, **Esri Wayback with date list**, **Sentinel-2 cloudless 2016 and 2018-2024 by year (EOX)**, **HLS 30 m by date (GIBS)**), daily satellite (MODIS Terra and VIIRS true colour by date, Blue Marble), **thermal (land surface temperature day / night, sea surface temperature, by date)**, night lights (Black Marble, VIIRS day/night band), NDVI, snow, aerosol, WorldCover, JRC surface water, Hansen forest change, **weather radar (RainViewer)**, OpenRailwayMap, OpenSeaMap, Esri labels / roads, 3 key layers, 14 viewer / portal links (EO Browser, Copernicus Browser incl. Sentinel-1 SAR, Google Earth, Wayback site, NASA Worldview, USGS EarthExplorer = Landsat thermal, OpenTopography = Copernicus DEM / SRTM, ASF Vertex SAR, GHSL, WorldCover, Global Forest Watch, Global Surface Water, Old Maps Online, David Rumsey).
- Basemaps go into the G.X basemap list (now grouped with optgroups); overlays stack on top with **opacity slider**; dated layers have a **date picker** (clamped to the layer's range, today at most; the date goes into the tile URL); each row shows status, licence flag, attribution (also on the map bottom bar) and the licence / limit text.
- **Status** is never silent: WORKING (static curl test 2026-11-21, or live Test now), UNAVAILABLE + reason (static, live, or runtime: 6 failed tiles with no success, then one diagnostic request gives "HTTP 404 (no data for this date, place or zoom)" or "no connection, blocked, or CORS"), NEEDS KEY, LINK. An enabled overlay that is down is named in the red banner on the map with its reason; its tiles are transparent (no blank grey, no grid under data layers).
- **Keys** (Esri, MapTiler, Sentinel Hub instance ID): typed in the row, kept in `sessionStorage` only, never in `xto-gm`, never in the package export (test greps all of localStorage). Not tested: no keys available.
- Sensitive mode unchanged: per-host approval, one checkbox per row, "Approve every host" button.
- 3 New Cairo plots are also **bookmarks** in the existing G.X bookmarks list (`GBK`, localStorage `xto-gisbk`), added once.
- Fires / thermal anomalies: GIBS serves them as **vector tiles only** (needs MapLibre, not bundled): link to NASA FIRMS instead, said on the row.

### Where the layer list comes from (open catalogues reused; only URL templates and metadata are stored, never tiles)

`import_catalogs.py` reads, and `catalogue.py` / `gen_cat.py` merge into `gm_catdata.js` (every row shows its source; `LAYER_STATUS.md` has the column):
- **leaflet-providers** (BSD-2-Clause, github.com/leaflet-extras/leaflet-providers) through **xyzservices**' machine-readable copy `leaflet-providers-parsed.json` (xyzservices is BSD-3-Clause; licence checked with the GitHub API): official **attribution strings and max zoom** for 19 layers (OSM Mapnik / DE / HOT, CyclOSM, CARTO Positron / DarkMatter / Voyager, Esri street / topo / gray / NatGeo / imagery, OpenTopoMap, OpenRailwayMap, OpenSeaMap, NASA GIBS true colour / LST / snow / aerosol), and **18 extra layers** taken from it: OSM France, OPNVKarte, Esri shaded relief / terrain / physical / ocean, Waymarked Trails hiking and cycling, GIBS bands 7-2-1, 3-6-7, city lights 2012, ocean chlorophyll, key layers Stadia (2) and Thunderforest (3).
- **xyzservices-providers.json** (BSD-3-Clause): UN ClearMap, GIBS bands 7-2-1 URL, MapTiler satellite template.
- **NASA GIBS WMTS GetCapabilities** (fetched 2026-11-21, 5.8 MB, parsed): layer id, image format, tile matrix set (zoom limit) and default / date range for every GIBS layer. It also showed that fires / thermal anomalies are vector-tile only.
- **Esri Wayback config JSON** (`waybackconfig.json`, 199 releases): the release list is read at run time by the existing `geoWayback()` code.
- Own research (provider documentation), because these are not in leaflet-providers: EOX Sentinel-2 cloudless by year and terrain, HLS, JRC Surface Water, Hansen Forest Change, ESA WorldCover, RainViewer, Esri hillshade / reference services, Esri keyed endpoint, Sentinel Hub, the viewer links. Existing layers already in `c_gis.js` keep their keys.
- Not copied from those lists: regional or national services (Swiss, Austrian, Dutch, French, Ordnance Survey, USGS US-only, Gaode with its coordinate offset), providers that need a key we cannot test (MapBox, HERE, TomTom, Jawg, Azure, OpenWeatherMap), and anything whose licence the lists do not state beyond the attribution. leaflet-providers does not carry licence terms: the licence flags in our table are from the provider pages / our own reading, flagged "not checked" where we did not read them.
- Result of using the open catalogues: one layer from them is unusable here: **OPNVKarte** answers with an image but sends no CORS header, so the browser cannot use it on the map canvas (shown UNAVAILABLE with that reason).

### Layer status table (real tile from this Mac, curl, 2026-11-21, tile at 30.0045 N 31.4885 E)

55 of 57 fetchable layers returned a usable image (200, image/*, CORS header); WorldCover (no connection) and OPNVKarte (no CORS) did not. Full table with HTTP code, content-type, size, CORS header, licence flag: `LAYER_STATUS.md` (generated, delivered). The in-app live test over the same layers (browser path, Image + CORS): `real_catalog.txt`.

Summary of the honest licence picture (not legal advice):
- **Free incl. commercial with credit (open data, we read the licence name, not the full text)**: ESA WorldCover CC BY 4.0 (server unreachable from this Mac), Hansen forest change CC BY 4.0, JRC surface water (open, cite). NASA GIBS: open NASA data + acknowledgement; commercial not stated on the pages seen.
- **Non-commercial only**: EOX Sentinel-2 cloudless (CC BY-NC-SA 4.0, paid licence for commercial) and EOX terrain.
- **Light use only (community servers, no SLA, no bulk)**: OSM standard (Referer required; policy read 2026-11-21), OSM Germany, HOT and CyclOSM (OSM France), OpenTopoMap, OpenRailwayMap, OpenSeaMap.
- **Unclear**: every Esri `server.arcgisonline.com` layer (imagery, Wayback, street, topo, NatGeo, gray, hillshade, labels, roads): no clear statement found that anonymous direct tile use by a third-party app is licensed; keyed route exists (`img_key`).
- **Not checked**: CARTO (free tier believed non-commercial), RainViewer (free personal and educational per their terms, zoom 7 max; confirm before commercial use).
- Not added on purpose: Sentinel-2 via Copernicus Data Space or Planetary Computer (need a token / STAC + COG client, no plain XYZ), Copernicus DEM tiles (no free XYZ; OpenTopography link), Terrarium elevation tiles (reachable, CORS ok, but RGB-encoded data not a picture: used by the app's elevation code, not a layer), USGS NAIP (US only), OpenHistoricalMap / old-map tile sets (no verified raster XYZ for Egypt: links to Old Maps Online and Rumsey).

OSM request volume: a normal screen is 25 to 40 tiles; the queue keeps 6 parallel and drops stale ones. That is interactive use, not a policy guarantee for many users: if the site gets traffic, switch the default to a self-hosted or commercial raster server (`custom`) and make it the default in `BASEMAPS` / `GM.base`. Vector providers (OpenFreeMap, Protomaps) need MapLibre GL: not in the single file; follow-up.

## 4. Privacy paragraph for SECURITY_PRIVACY (not edited, paste it)

> **Maps and your location.** Every map tile request tells the tile provider (OpenStreetMap, Esri, CARTO and so on) which place you are viewing and your IP address; geocoding (Nominatim) and elevation (Open-Meteo) send the place name or coordinates. Nothing is requested until you open G.X or F.X. In **Sensitive project mode** no map tile host is contacted until you approve that host in G.X > Maps > Providers (the grid with coordinates is shown instead; the S.X Geo imagery and embedded OSM map are off too), and search / elevation stay blocked by the existing "map lookups" rule. **Offline grid** mode makes no map request at all. API keys for map providers are kept in the browser tab only (session storage), never saved, never part of the project package. The approved-host list and any custom tile server URL are project settings (`xto-gm`) and are removed by a project wipe. Demo places are approximate coordinates, not surveyed parcels, and carry no owner or address data.

## 5. Tests

- `gm_test.js` (new, 66 checks, mocked network, one Chrome): lazy start (0 requests), first open on the demo place, queue limit, plots area / count / bounds, zoom, origin round trip, Sensitive mode (0 requests, grid, S.X panel, approval), offline down and Retry, bounded failed requests, F.X plan and overlay pixels over the grid, forced grid, over-zoom, licence flags, key and custom URL validation, 10 commands with bilingual XDESC, ribbon group, catalogue (entries, attribution, thermal group, date picker and clamp, opacity alpha, RainViewer frame list, unavailable-layer banner with reason, keys not saved, live Test, Sensitive-aware live test, bookmarks, window).
- Real network (this Mac, 2026-11-21, `real_shots.js`): OSM 29 x 200, Esri 36 x 200, 0 failures; screenshots `shots/real_osm.png`, `real_esri.png`, `real_fx.png` (flight lines and footprints on the aerial, plot nc2).
- Regression on the private build (details in `REGRESSION.txt`): parity 126, px2 149, freeai 88, privacy 109, p2tog_gis 61 all pass; sample_check 31 pass (brief said 32, not reconciled); **link_test did NOT complete: it times out at the IFC viewer step under the machine load (also on the unchanged site build), so the 43 link checks are unverified**.
- In-app live test of every fetchable layer on the real network (`real_catalog.txt`, browser path Image+CORS): 52 OK, 3 FAIL: WorldCover (no connection), OPNVKarte (no CORS header), VIIRS day/night band once ("HTTP 200 not an image"; curl fetched valid PNG tiles of the same layer right after, so treat as intermittent, retest). Wayback needs its release list loaded first (n/a).

## 6. NOT verified / limits

- Real tiles from `file://`: worked here, but OSM may answer 403 "Referer is required" to pages without a Referer; publish over https and test from the real site.
- Esri licence question is unresolved. The unit tests use a mocked network; the real tiles were fetched by curl and by the in-app live test (see `real_catalog.txt`).
- The 3 key layers (Esri keyed endpoint, MapTiler, Sentinel Hub) are untested: URL forms are from memory of the docs and the Sentinel Hub layer name depends on your configuration.
- GIBS dates: the date picker allows any date in the layer's range, but a given date can be empty (no pass, cloud, or not processed yet); the banner then says HTTP 404 or shows blank. HLS covers only orbit tracks. GIBS day/night-band archive ends 2023-07-07 in the capabilities we read.
- RainViewer frame time and tile were tested once (200, empty tile over a clear Cairo sky).
- Only Chrome headless on macOS; no mobile, no RTL-specific pixel review of the new toolbar (it wraps like the existing one).
- Coordinates of the places: approximate by eye; the plot shapes are neutral rectangles / polygons, not real parcels.
- The Esri "labels / roads" overlays and the Wayback basemap go through the same gate (per host) but were not exercised separately.
- Not done: the apartment building, garden, materials and survey content of the demo 'Project 6868' (other sessions); the F.X ribbon "Basemap" group is unchanged (it lists OSM / Imagery / Topo, which work); MapLibre vector basemap; saving the chosen provider per project.
