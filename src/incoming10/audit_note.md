# T.O X audit: explainer graphics + speed (incoming10)

Worked in a private copy of the build (shared chunks untouched). Upstream `c_ui2.js` and `c_ind.js` were byte-identical to my base when I delivered. Upstream `patch_v3.py` has moved on (c_rc_* chunks), so I deliver a snippet, not the whole file.

## What to merge
| File | Action |
|---|---|
| `c_ui2.js` | replace (one shared picture set + one mapping, 4 missing tab descriptions, 2 missing icons aliased) |
| `c_ind.js` | replace (one word: part card asks for `'part'` instead of `'zfit'`) |
| `patch_resize_guard.py` | paste into `patch_v3.py` before the final `open(...lift_station_3d.html...)` line |
| `tools/` | measuring scripts (perf, counters, inventory, screenshot, test runner) |

Build size: +4 KB (4,637,049 -> 4,641,018 bytes). The 21 pictures are new; the old 9-rule function is gone.

## 1. Inventory of explainer graphics

| Where | File / function | Shows | Finding |
|---|---|---|---|
| Hover card on tabs, ribbon buttons, doc tabs, `[data-tip]` | `c_ui2.js` `ui2Illus`, `tipFor` | animated 120x70 picture + text | **191 of 336 hover keys fell to the same spinning cube** (57%). 17 of 19 tabs showed the cube. |
| Guide panel (one card per tab) | `c_ui2.js` `guPanel` | same picture + tab text + command buttons | used a **different mapping** than hover (annot->CAD, anal->clash, out->export, calc->doc...), so the same tab showed two different pictures. |
| 3D part hover card | `c_ind.js` `tipFill` | cube + part name/qty | asked for `'zfit'`, which matched no rule, so the cube was an accident. Now explicit `'part'`. |
| Playback indicator | `c_ind.js` `indRender` | running activity, dates, float | OK, text only. |
| Icon set | `c_icons.js` `XI` (+ `c_prog`, `c_tabs`, `c_menus` extend it) | 160+ glyphs | `bim` (IFC viewer) and `html` (takeoff_56) **missing** -> fell back to the "info" glyph. Fixed (aliases). Duplicate glyphs: setup=gear=settings, view3d=sGlass, rotate=rot (not removed, 3 tiny paths). Unused: `logo`, `constr`. |
| Navigation compass + view buttons | `c_nav.js` | compass SVG | single use, OK. |
| Splash / login ring / app icon | `c_shell.js xSplash`, `c_login.js`, `c_icon.js` | brand mark | brand, not explainers. |
| Idle + adhan + intro scenes | `c_idle.js`, `c_idle2.js`, `c_intro.js` | generative gold scenes / media | not explainers; idle2 reuses idle scenes, no duplicate found. |
| Library thumbnails | `c_lb_core.js` `lbSvg/lbEntSvg/lbGxSvg` | block/symbol previews | one renderer, OK. |
| Charts | `c_qx_bi.js qxChartSvg` and `c_p2tog_office.js chartSvg` | bar/line/pie | **two chart renderers** (Q.X and O.X sheet). Not merged: different specs, no safe merge without tests. |
| Domain drawings | `ganttSvg` (P.X), `rvpSvg/sSvg/redSvg` (R.X), `cadEntSvg` (C.X), `pfSvg` (PDF marks), `xSiteSvg` | plan/section/gantt | single purpose each, OK. |
| Help panel | `c_help.js` | links only | no graphics. |

Missing: 113 of 289 ribbon buttons have **no description** (`XDESC`), so `tipFor` returns null and **no hover card appears at all** (examples: new, open, v_iso, v_plan, t_water, clash, e_pdf). Not fixed: needs bilingual wording from the owner. Tabs without `TABDESC` were hvac, hm, plant, ws: fixed.

### Per-tab picture, before -> after (hover and Guide now identical)
home cube->folder | model cube | site land | annot cube->line | anal cube->clash | hvac cube->pipe | hm cube | plant cube->tank | sched gantt | out cube->file | nav cube->compass | calc cube->grid | office cube->doc | env cube->land | ctrl cube->donut | dc cube->doc | team cube->net | set cube->sliders | ws cube->layers.
Distinct pictures over 19 tabs: 3 -> 16. Whole hover set: 9 pictures (one default) -> 21 pictures, **0 fallbacks** for every ribbon command, tab, window type (checked with `ILMISS`, see `tools/shot.js`).

## 2. What changed
- One table `ILL` (name -> SVG body) and one ordered rule list `ILMAP` + `TABILL` (tab id -> picture). Hover, Guide and part card all call `ui2Illus`. Tabs use key `'tab:<id>'`.
- Fixed wrong matches: `hv_csv`, `du_csv`, `ace_csv`, `csvs`, `e_csv` showed a Gantt; they now show the export file. `sitez/sitest` kept as terrain.
- Only existing CSS animations (`tx-*`) and the existing accent variable are used: same calm style, no new CSS, no external assets.

## 3. Speed
Machine load was 50-113 while I measured and ~170 Chrome processes were alive; software GL (SwiftShader). CPU `TaskDuration` swung 2x between identical runs (base startup 19.0 / 22.3 / 24.4 s, new 22.9 / 29.3 / 36.8 s; idle windows bimodal 0.01 vs 6 s). **I cannot claim a CPU gain from that data.** Deterministic evidence instead:
- Profile of startup: 6.6 s of 19 s sampled was `renderer.setSize` (GL buffer reallocation), the largest single item.
- `resize()` always called `setSize` even when nothing changed. Counted canvas width assignments at startup: **5 -> 1** (same on repeated runs). Guard keys on width x height x pixel ratio. xShot/render paths restore the same size, so the cache stays valid.
- Tab switch: 3-18 ms per switch both builds (noise level). Idle JS excluding GL is ~25 ms per 12 s. JS is not the cost; GL drawing is.
- Tried: drop idle rendering to 5 fps after 12 s without input (`c_speed.js`). Reverted: frame rate under this load was 0-4 fps anyway, so I could not verify it, and it could make ambient animation choppy. Idea stays open for the lead to try on a real GPU.
- Dead code: 10 top-level functions are referenced nowhere (`ll2utm, envCs, tmXi, lbOpen, xaNum, ytAcct, cdeName, pfOpenDoc, codesFor, dtxt`, ~2 KB). Left in place: tests or window hooks may use them. Real size is data (`c_cmddata.js` 166 KB).

## 4. Safety quick pass
- Secret scan over all c_*.js chunks (Google/OpenAI/GitHub/Slack/AWS keys, PEM, Telegram bot token shape, `api_key=` literals): nothing found.
- Touched code: hover text goes through `dcEsc`; `ui2Illus` returns static SVG chosen by regex over command ids, never user text; Guide uses `textContent`.
- Note, not touched: `window.__lsv.ev` runs `eval` when `localStorage['xto-test']==='1'`. Needs an existing script injection to abuse, but I recommend removing the hook from the public build.

## 5. Regression (final build, one Chrome at a time, `nice -n 15`, rc_* chunks not in my copy)
parity 126/126, px2 149/149, link 43/43, qx 75/75, nv_a 48/48, nv_b 32/32, nv_c 38/38, nv_d 24/24. (Earlier run on the previous build: same counts. link showed 34/35 until `site/vendor` was copied in: web-ifc missing in my private dir, identical on the untouched base.)
Final build (after the last 2 mapping rules): first full run had nv_a 36/37 and nv_c 11/12 (machine overloaded, test did not finish); rerun of both alone: nv_a 48/48, nv_c 38/38. Others unchanged. I did not find the cause of the one-off failures; treat as load flakiness, not proven.

## NOT tested
- Real GPU / real-machine CPU; any claim of "faster" beyond the 5->1 canvas reallocations.
- Hover and Guide checked on screenshots of the Guide panel and a sheet of all 21 pictures (Chrome, Arabic UI only); hover timing (750 ms) and RTL tooltip placement not re-checked by hand.
- Build with the c_rc_* reality-capture chunks (I built without them; none of my changes touch them).
- Mobile/touch devices; Safari/Firefox.
