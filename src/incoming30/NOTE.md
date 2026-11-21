# incoming30: pump-station content only while the pump sample is the current project

Replaces incoming28 (do NOT apply both; incoming28 made blank the default). Made 2026-11-21 against site commit ea656b3, in a private copy (`scratchpad/work_separate2/`, built from the CURRENT chunks; its `lift_station_3d.html` is byte-identical to the shared `site/src/lift_station_3d.html`). Nothing in `site/` git or the shared chunks was touched.
Apply: `sh apply.sh` (checks sha1 of the 8 target files, dry-runs, applies; stops on drift), then `sh make.sh`.

## Rules implemented
* **A. Default unchanged.** `tpId()` still defaults to `'sewage'`; no blank default, no title/header change, no `lsv3-data-pre-sep` copy, no legacy-file wrapper. Checked: the state fingerprint of the default boot (title, 61 root meshes, 36 parts, 46 items, 24 activities, caption, geo datum 104.95, 16 outputs, 31 notes, pane gating, 4D objects) is identical before/after, and the visible text of Start, R.X, S.X and P.X plus every gated pane is identical apart from the clock (`shots/default/before.json` vs `after.json`; the first text-hash compare differed only by clock and autosave/undo text, a second compare with a 16 s settle differed only by the clock).
* **B. Any other project (house2, blank, imported, `tpRegister`ed ones, a future sample6868) shows none of it**, and switching back to the sample restores everything. Everything is gated on `tpStation()` (current template is `sewage`), so it follows the project, not the boot.

## What the patch does (7 chunk files + 1 test line)
| # | Sample content | Where (current shared files) | Gate |
|---|---|---|---|
| 1 | 4D pit, fence, laydown, gate | c_4d.js:43 (end of `buildSite`) | hidden when not sample; `tpSetBase` rebuilds on every switch |
| 2 | Site-plan overlay (`spG`, `SP.on`, labels) | cleared in `tpEmptyScene` (c_templates.js) | cleared when leaving the sample |
| 3 | N.X coordination checks 1-4 (`SPS`, `SITE.pipes`, station geometry) | c_coord.js:5-14 | skipped |
| 4 | Output Center items 1, 2, 6, 8 | c_outputs.js:3,17,20 | hidden / skipped |
| 5 | ZIP package: station sheet, `07_Site/site_plan.svg` | c_pack.js:15,21 | skipped |
| 6 | Geo defaults (datum 104.95, "well centre" note) | c_geo.js:3 `geoD` | neutral defaults; geo panel is redrawn on every switch |
| 7 | Notes register (pump capacity conflict, limits) | `notesReg` wrapper in c_templates.js | empty |
| 8 | Camera caption "The whole station: wet well ..." | `setCap` wrapper in c_templates.js | empty; recomputed on every switch |
| 9 | Panes: Views (camera presets + 360 points), Params, Parts, Assembly animation, Lift-station rebar, Sample site plan, Safety (hazard register), Sections (presets), Sheet (composer, also what T.X Plant uses) | `TP_GATED` + `tpGate()` in c_templates.js, called from `tpApply` and at boot | content hidden, one-line note "This panel belongs to the pump-station sample ... New project > Pump station sample (mechanical)" |
| 10 | Project title / sheet text at boot of a non-sample project | boot block in c_templates.js | set from the template (a reload of a villa no longer shows the sample title); never runs for the default |
| 11 | Chooser card name | privacy_patch.py:37 | "Pump station sample (mechanical)" (title stays "Sample project (demo)") |
| 12 | Hook | `tpRegister({id,n,title,d,rv})` / `TOX.registerTemplate` in c_templates.js | adds a chooser card on the clean base; cannot replace `sewage` |

## Tests (default is the sample again, so NO suite needed a preload; shared tests run unmodified)
On the patched build, one headless Chrome at a time, `nice -n 15`:
parity 126/126 · px2 149/149 · freeai 88/88 · privacy 109/109 · sample_check 32/32 (you said 31; the shared `incoming18/sample_check.js` has 32 checks) · gm 66/66 · Q.X 75/75 · O.X 95/95 · charts 8/8 and 84/84 · demo smoke FAILS 0 (smoke scenario only) · **link 43/43 on a rerun; the first patched run was 42/43 ("camera sync: idle polls cause no echo", a timing check); the untouched baseline build passed 43/43 twice and the patched build passed 43/43 once more. Treat that check as load-flaky, not proven.**
* ONE test line changed on purpose (`patches/tests_privacy_test.js.diff`, privacy_test.js:34): "template card says Sample project" now requires the card name to be exactly `Pump station sample (mechanical)` and the project title to still say `Sample project`.
* NEW `tests/separation_test.js`, 32 checks: default is the sample with every sample feature present and no session copy; house2, blank and a `tpRegister`ed template each have no parts, no sample items, 1 activity, no 4D objects, all 9 panes off, no caption / geo note / datum / notes, 4 fewer outputs, no site-plan overlay, no N.X sample checks; round trip house2 -> sample -> house2 (sample fully back incl. visible 4D gate, then clean again).
* Leak scan of house2 after the patch (`shots/leak_scan_house2_after.json`): the only remaining station vocabulary in visible text is in the **reference libraries**, not the project: Codes tab (pump standards, "Gully tops and manhole tops"), Help tab ("Submersible pump installation") and the E.X calc-sheet list ("Flotation of the wet well", "Wet well working volume"). I left them: they are generic catalogues, not sample data. Say if you want them filtered too.

## Screenshots (`shots/`)
* `default/before_*.png` vs `default/after_*.png` (start, model, survey, sched): same content (read model + start).
* `before_h2/2_house2_*.png`: house2 before the patch: Views pane with 'Pumps', 'Chamber valves', '360 wet well' buttons, Edit pane 'Well wall thickness', the 3D caption about the station.
* `after_h2/`: `1_default` (sample), `2_house2` (clean, panes show the note), `3_sewage` (sample fully back: 61 meshes, title "Sample project (demo)", panes, 24 activities), `4_house2` (clean again), `5_blank`; each with model, survey and coord views.
* Not loadable here: the real `sample6868` / Project 6868 template (registered only while the demo runs); house2 + blank + a `tpRegister`ed template stand in. House2 is a pure R.X template, so a template that adds non-R.X content of its own (the apartment demo's survey points, site plan, etc.) was not exercised.

## Not changed / limits
* Data constants and the station builder are still in the page; the station is still built once at boot for the default (no lazy boundary).
* For a non-sample project the ZIP package and exports keep `LiftStation_` file names.
* Panes are hidden with a note, not rebuilt; Safety/Sections/Sheet are hidden entirely for non-sample projects (their generic parts, hazard checks and clip planes, are therefore also off there; they were driven by the station's tables).
* The R.X Project Browser still lists generic view names (3D, level plans, Section A, side elevations) with nothing behind them.
* sha1 of the shared files diffed against: `SHA1_BEFORE.txt`.
