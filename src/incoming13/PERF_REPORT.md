# PERF_REPORT - startup and idle speed (2026-11-21)

## Honest limits
- The machine had load average 25-150 from other sessions. Numbers are noisy. Base and new were run **interleaved, 5 runs each**, one headless Chrome at a time, `nice -n 15`. Median and (min, max) below.
- Chrome used SwiftShader (software GL). **Real GPU was NOT measured.** Under SwiftShader a WebGL context / first shader compile costs seconds (profile: `getContext`, `getProgramInfoLog`, `canvas.width=0` took 1.5-30 s). On a real GPU these are tens of ms. So the CPU-seconds gain here is mostly "no GL at start", and is bigger than a real machine will show. The order of events gain (login first) is real.
- FCP (first-contentful-paint) is still 4-7 s in both builds here: the GPU process is starved, not the main thread. Do not read it as a result.
- No phone / Safari / Firefox run.

## What was measured (tools in `perf/`: measure.js, tabidle.js, prof*.js, flow.js, gl.js, glspy.js)
Public build (`index.html`), medians (min, max), seconds:

| metric | before | after |
|---|---|---|
| login screen element in DOM | 9.36 (8.56, 17.97) | **0.35 (0.28, 0.52)** |
| first login frame drawn (rAF) | 3.20 (2.93, 5.32) | **0.52 (0.41, 0.67)** |
| workspace ribbon built (login mode) | 9.36 | 2.27 (2.07, 2.58) |
| CPU (task) until ribbon, login mode | 10.70 (10.47, 20.18) | **2.22 (1.94, 2.51)** |
| script CPU until ribbon | 8.83 | 1.38 |
| CPU until ribbon, already logged in | 8.65 (8.28, 10.48) | 2.56 (2.02, 6.29) |
| JS heap MB after start | 29.4 | 25.3 |
| idle CPU (start tab) | ~0.01 core | ~0.01 core (no change) |
| active setInterval | 14 | 14 (no change) |
| WebGL contexts at start | 1 | **0** (1 after the 3D view first draws; spy test `glspy.js`) |
| inline script parse size | 3.8 MB main + 1.0 MB libs, all parsed at start | main same; jsPDF (364 KB) not parsed until a PDF export |
| file size | 4992 KB | 4994 KB (+2 KB boot code) |

## What was wrong (profile, `prof.js`)
1. The login screen was created at the very end of one 3.8 MB synchronous script. Nothing was visible until all of it ran.
2. `xtoStart -> wtInit -> wxOpen -> resize -> renderer.setSize` set the GL canvas to 0x0 (hidden 3D host). With the context created at start, this was the biggest single cost here.
3. The WebGL context was created at start even when the start tab has no 3D view.
4. jsPDF (364 KB) was parsed at start; used only on export.

## What changed (deliver: `build.py`, `patch_v3.py`, `lazygl.js`)
1. **Login first.** `build.py` moves `c_login.js` (+ `XTO_MARK`, `xtoTagSvg` copies, `var LOGIN`) into an early script right after `<body>`. three.js, OrbitControls and the main script are stored as `text/plain` and started after the first frame (`rAF -> setTimeout`, fallback 1.5 s). Logging in before the main script ran still works (tested). `INTRO.warm` is reached through `window.__xWarm`.
2. **Lazy WebGL** (`lazygl.js`, wired in `patch_v3.py`): a Proxy with the same renderer API. The real `WebGLRenderer` is made on the first draw with a visible 3D view, or when a render target / shader-related API is used. `setSize/setPixelRatio/shadowMap` are remembered and applied then. If WebGL fails: sets `xto-soft=1` and reloads once (old code fell back to the software renderer at start).
3. `resize()` returns when the host has 0 width/height.
4. **jsPDF lazy**: `data-xl="jspdf"`; a `window.jspdf` getter runs the library on first access.
5. Test build `index.test.html` boots the main script immediately (`window.__XSYNC`), so `DOMContentLoaded` still comes after the build. The test scripts wait a fixed time after it, so they need this. The public build uses the deferred start.

## Tests (new build, test variant)
parity 126/126, px2 149/149, freeai 88/88, link 43/43 (link needs `vendor/` next to the html: it has the IFC viewer; one run hit a 30 s screenshot timeout under load and passed on rerun). `flow.js` 13/13 (login at DCL, login ok, wrong password, fast login before the app script, no page errors, jsPDF loads on first use and builds a PDF). Before-build on the same tests: same counts.

## Found, not changed
- Idle is already low: 14 intervals, most return when `document.hidden`; idle ~1 % of one core in the start tab; JS idle < 0.2 %. `c_speed.js` already stops the 3D loop when covered/hidden and throttles to ~20 fps.
- Tab survey (`tabidle.js`): in `coord`, `detect`, `plant`, `hx` the idle CPU looks like 0.5-1.1 core. Profile shows it is the **first** frame compiling shaders under SwiftShader (`getProgramInfoLog`), one-time, not a leak (`renderer.info.programs` goes 0 -> 5 and stays). Not a real-GPU finding.
- Non-GL JS at start is small (xtoStart ~0.3 s inflated, sheet preview draw `drawSheetPrev` ~0.2 s inflated, timeline render). Lazy-init of these gives little and risks the parity tests; not done.
- Minifying (terser is on this Mac, not in the project): not done; parse is not the bottleneck on a real machine, and the tests use `__lsv.ev` with local names.

## Not measured
Real GPU, mobile, memory over hours, time to usable ribbon on a quiet machine, network (gzip) transfer.

## How to merge
Do NOT copy whole `build.py` / `patch_v3.py`: the live `patch_v3.py` changed after this work started (other sessions). Apply the two diffs instead (made against the copy taken at start): `patch build.py build.diff`, `patch patch_v3.py patch_v3.diff` (the SP path line differs, ignore that hunk) (or apply by hand: they are ~25 lines), and add `lazygl.js` next to the chunks. Then `python3 patch_v3.py && python3 build.py`. `build.py` asserts the pieces it moves (login text appears once, 3 deferred + 1 lazy script).
