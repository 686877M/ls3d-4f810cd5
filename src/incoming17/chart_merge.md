# One shared SVG chart renderer (Q.X + O.X)

**Files (copy only):** `c_chart.js` (NEW), `c_qx_bi.js`, `c_p2tog_office.js` (changed), tests `chart_snapshot_test.js` + `chart_snapshot.golden.json`, `chart_merge_test.js`.
**Chain:** `patch_v3.py` must load the new chunk before O.X: replace `rd('c_p2tog_office.js')` with `rd('c_chart.js')+rd('c_p2tog_office.js')`.

## What changed
- `toxChartSvg(type,cats,series,o)` (c_chart.js) is the only chart code. Also `window.toxChartSvg`, so Render Studio / vector export can call it.
- Q.X: `qxChartSvg` is now an alias of it (old 22-line body deleted). `QX.dashFile` embeds `toxChartSvg.toString()` plus `const qxChartSvg=toxChartSvg;` so exported dashboards still work standalone.
- O.X: `chartSvg` is a 1-line call with `look:'flat'`, its own palette (`PAL`), `shFmt`, and the same `p2ch`/`bar`/`ln`/`pt`/`sl`/`data-v`/`data-type` hooks.
- Colours: `palette` option; none = CSS variables `--qs1..8` (app theme, light/dark). Q.X unchanged; O.X passes its old fixed palette.
- RTL: any `<text>` containing Arabic letters gets `direction="ltr"`, so `text-anchor` stays positional inside an RTL page (glyphs still shape right-to-left). Only visible change, only for Arabic labels.

## Proof nothing else changed
Golden recorded from the PRE-merge build (`index.test.html` of 11:27), 44 cases (Q.X 5 types x 1/3 series, titles, negatives, 30 points, 12-slice pie, zero/one/empty/9 series, Arabic; O.X column/line/pie x normal/negative/single/Arabic/many/multi-column/no-number; in-app ribbon charts; exported dashboard HTML run in a fresh page). After merge: **84/84**, every Latin case **byte-identical** (SVG hash), Arabic cases identical structure (tags, labels, colours, viewBox). `chart_merge_test.js`: 8/8 (exposed on window, aliases, Arabic direction, bbox.x == x in an RTL page, dashboard embeds one copy, palette option).
Suites on merged `index.test.html`: parity 126, px2 149, freeai 88, link 43, privacy 109, Q.X 75, O.X (p2tog_office) 95, all pass. (link's first run hit a screenshot timeout under load; rerun passed 43/43.)

## Honest limits
- It is one function, not one layout: Q.X ("rich") and O.X ("flat") keep separate layout code inside it, because the owner asked for no visible change. Shared: escaping, palette, pie arc maths, RTL pass, empty states, export. Retiring `flat` later = pass `look` unset (visible change, O.X would look like Q.X); not done.
- O.X escaping still silently strips `<` and `&` from labels (old behaviour kept for byte-identity). Q.X escapes them. Small bug, left alone.
- RTL anchor fix proven only on the merged build; the pre-merge behaviour was not measured.
- Not tested: SVG->PDF / XLSX embedding of charts (no such O.X/Q.X path found; only Q.X "SVG" button and dashboard HTML export exist, the button is unchanged and was not clicked in a test), Safari/Firefox, real Arabic fonts visually (no screenshot review), Render Studio and vector export do not call the helper yet.
- Public `site/index.html` rebuilt with `./make.sh`; tests ran on `index.test.html` only.
