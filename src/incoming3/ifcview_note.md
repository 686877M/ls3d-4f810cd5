# MOD-IFV integration note (IFC viewer, pane:ifcview, command ifc_open)

Files
- site/src/incoming3/ifcview.js (chunk, 124 dense lines). Load AFTER c_ifc.js (uses ifc(), el, b2, out, XCMD, wxDefs, wxOpen, wxClose, THREE, THREE.OrbitControls). Globals: ifV, IFV_SP, IFVDEF, ifv*.
- site/vendor/web-ifc/web-ifc.wasm.b64.js (generated, 2.3 MB: window.__IFV_WASM_B64). Regenerate: base64 of web-ifc.wasm wrapped as `window.__IFV_WASM_B64="...";`.
- Must ship site/vendor/web-ifc/{web-ifc-api-iife.js, web-ifc.wasm.b64.js, LICENSE.md} next to index.html (MPL-2.0 notice). web-ifc.wasm itself is NOT needed at runtime. Neither lib is inlined in index.html; both are loaded by script tag on first open/load only.
- Tests: ifcview_test.js (full), ifcview_test_big.js (54 MB). They use a private page = index.html with the chunk spliced before `window.__lsv={ev:`.
Ribbon: command only (XC.ifc_open); no ribbon entry added.
Behaviour: Open IFC (picker), drag-drop on pane, "Project IFC" (loads this app's ifc() export). Tree (project/site/building/storey/class/element), click pick, Properties tab (identity, psets, quantities), Counts tab (per IFC class), Isolate/Hide/Show all on the current selection (tree node, class, storey or picked; shift-click adds), Section Z (clips above Z), Measure (2 points, metres), CSV of visible elements, Close model. No WebGL: message in view area, parse/tree/props/counts/CSV still work, no meshes built.
Test report (Chrome + SwiftShader, file://, no network requests):
- App IFC2X3 export (2.9 MB): 60 products, 57 elements, 21,256 tris; counts per class identical to text count in the file for all 14 classes (Flow Segment 9, Discrete Accessory 11, Building Element Proxy 9, Flow Controller 7, Flow Fitting 6, Slab 4, Flow Moving Device 4, Plate 3, Wall 2, Flow Treatment Device 2, Project/Site/Building/Storey 1).
- Real mouse click picked an element and showed Pset LS_Item and BaseQuantities NetVolume. Isolate class (11 visible), show all (57), hide 3 (54), CSV 54 rows + header. Section slider Z works. Measure 2 picks: dist 2.449 m, equals vector distance. Close: meshes 0, model closed, full close releases renderer. 0 page errors.
- No WebGL (--disable-webgl): gl=false, tree/counts load, 0 errors.
- Stress: 54 MB synthetic IFC (17 copies of the export, 969 elements, 361k tris): 12.9 s, JS heap 123 MB, wasm heap 230 MB; after close JS heap 48 MB (wasm heap does not shrink, model freed).
NOT tested: a real 50 MB architectural IFC (only the repeated app export), IFC4 files, files with colours/styles, a real browser GPU, drag-drop with a real OS drop (handler only), Arabic layout of the pane, ribbon/preset behaviour, https hosting.
Limits: one THREE.Mesh per element (very large models with 50k+ elements will be slow to draw); no recentring of georeferenced coordinates (COORDINATE_TO_ORIGIN false); openings (IfcOpeningElement) not drawn; flat shading, no edges; pane disposal on close relies on a wxClose hook (wxPreset closing panes does not call it, model then stays in memory until Close model).
