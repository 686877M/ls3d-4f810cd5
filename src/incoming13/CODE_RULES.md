# CODE_RULES - rules for every new chunk (speed)

T.O X is one HTML file. Everything in a chunk runs in the same main thread at start, so a chunk that works at load makes the login slower for everybody. These rules keep the app light. They come from `PERF_REPORT.md`.

## 1. Nothing heavy at load
- Top level of a chunk only declares: `const`, `function`, small tables, and one registration (ribbon def, tab type, command table).
- No DOM building, no loops over data, no `JSON.parse` of big data, no canvas drawing, no `getBoundingClientRect` / `clientWidth` (forces layout) at load.
- Build the UI when the user opens it: `let _i; const xFooInit=()=>_i||(_i=build())` and call it from the tab / pane / ribbon open hook.
- If something must run after start, wrap it: `setTimeout(fn,0)` or `requestIdleCallback(fn,{timeout:2000})`. Never inside the synchronous part of `xtoStart` wrappers.
- Big data tables (codes, templates, nets, assets): keep them as plain strings or arrays, parse on first use.

## 2. No WebGL at load
- Do not call `new THREE.WebGLRenderer` or `canvas.getContext('webgl')` at load. The main viewer already uses `lazyGL()` (context made on the first frame that really draws). A second 3D view (render studio, assets, IFC, GIS) must create its renderer when its pane is first shown, and dispose it when closed.
- Never set `canvas.width/height` or call `renderer.setSize` with 0 (hidden pane). Skip until the pane has a size.
- One shader set per material type: do not set `material.needsUpdate=true` per frame.

## 3. Timers and animation loops
- No new `setInterval` unless nothing else works. If you need one: first line `if(document.hidden)return;`, and also return when your pane is not visible. Clear it when the pane closes.
- At most one `requestAnimationFrame` loop per feature. Stop it when the view is static (no hover, no drag, no playing). Draw on demand: call `draw()` from the event that changes something.
- The 3D loop is already throttled by `c_speed.js` (covered, hidden, idle). Do not add a second render loop; hook into `frame` through the existing wrapper pattern.
- Polling (network, `localStorage`, clipboard): 5 s minimum, only while the window is visible.

## 4. Entry screen
- The entry screen is an **early script** made by `build.py` (`LOGIN`, `XTO_MARK`, `xtoTagSvg`, the `c_login.js` text). It must not use anything from the main script. If you change `c_login.js`, it may only use what is defined in the first lines of `c_shell.js` (`XTO_MARK`, `xtoTagSvg`) and `window.__xWarm`.
- Do not add code that needs the main script to be ready at `DOMContentLoaded`. In the public build the main script starts after the first frame.
- Check login state with `typeof LOGIN!=='undefined'&&!LOGIN.done`.

## 5. Libraries
- A library only needed for an export (PDF, XLSX, zip, STT model, assets) is loaded on first use. `jsPDF` is an example: `build.py` keeps its text unexecuted and defines a `window.jspdf` getter that runs it on first access. To lazy-load another library: mark its tag `data-xl="<global name>"` in `build.py`.
- Data files (assets, models) are fetched on demand with `fetch` / a script tag, not inlined, unless the page must work offline from one file.

## 6. Memory
- Free big temporary arrays after use (`x=null`). Revoke object URLs. Dispose geometries, materials, textures and render targets when a pane closes.
- Do not keep a canvas per row or per thumbnail; draw to one canvas and reuse.

## 7. Before you hand over a chunk
1. `python3 patch_v3.py && python3 build.py`.
2. `node perf/measure.js file://<site>/index.html login 5` and `... app 5` three times each. Compare the median with `PERF_REPORT.md`: CPU to ready must not grow, `intervalsActive` must not grow, `idleTask` must stay under 0.01 (1 % of one core).
3. Run parity, px2, freeai, link (126 / 149 / 88 / 43).
4. Say in your note what you did NOT measure (real GPU, real phone).
