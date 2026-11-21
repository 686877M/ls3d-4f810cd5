# incoming18: safe sample project

Files: `chunks/` (12 changed chunks), `sample_neutral.py` (the transform, re-runnable), `patch_v3.diff`, `privacy_patch.diff`, `sample_check.js` (test), `SECURITY_PRIVACY.md` (section 4 updated; supersedes incoming15 copy).

## Merge
1. Copy `chunks/*.js` over the same-named chunks (none of them touch c_chart, c_qx_bi, c_p2tog_office, demo_*). Or run `python3 sample_neutral.py <chunk_dir>` on the original chunks: it asserts every old string, keeps `*.pre_sample` backups and is re-runnable.
2. Apply `patch_v3.diff` (level shift of the base page, `BL=100.00`) and `privacy_patch.diff` (three replacements and the NETS.src step become optional because the chunks are already clean; "hangars loop" wording).
3. `./make.sh`, then `NODE_PATH=<pw/node_modules> nice -n 15 node sample_check.js file://<index.test.html> [old_build.html]`. The optional old build is a negative control (the detector must fire on it).
Do NOT ship `sample_names_map.private.json` or `*.pre_sample` (they hold the old values).

## What was neutralised
| Thing | Before | After |
|---|---|---|
| World origin (GEO_D, SITE.cx/cy, label in site sheet) | real UTM 38N E/N | fictitious UTM 31N E 500000 / N 10000 (open sea). Derived lat/lon (map, sun path, IFC, GIS) follow. |
| Plan rotation to north (GEO_D, SITE.rot, compass `NAV.rot`, help text) | 6.5 deg | 0. Local model coordinates are NOT changed; only the mapping to the world. |
| Levels (B.L, design G.L, all sheet/BOQ/IFC text, calc rows, 5 networks incl. datum, inverts, rims) | B.L +1159.76, G.L +1164.71 | every level shifted by -1059.76 m: B.L +100.00, G.L +104.95 |
| CAD layer names of the site plan (131; drawing codes, contractor words) | real | `LYR-001..131`, category index kept |
| Network node/facility names (74; they described the kind of facility) | real | `BLD-01..74`; generic MH-, J-, CB-, gate, guard-room names kept |
| Model/file/drive names of the network models, master-plan source note, review note with a real document title and initials, DXF file/rotation texts | real | neutral sample wording |

## Checked unchanged (digests before = after)
46 items (code, qty, unit, cost), BOQ CSV, 3D DXF, OBJ, P6 CSV, XER, MSPDI. Sheet SVG differs only in 5 level labels; IFC only in random GUIDs; network slopes/diameters/lengths equal (only levels moved).

## sample_check.js (32 checks)
Static scan of `index.html` and `index.test.html`; live state; 12 in-page exports; 9 downloads (CSV, DXF, IFC, OBJ, XML, XLSX, ZIP package) with XLSX/ZIP entries inflated recursively; sheet PDF; blank template. Old values are kept only as numeric ranges (UTM E/N, old lat/lon +-0.025 deg) and truncated SHA-256 hashes of lower-case tokens/phrases (up to 4 tokens). Plus structural checks (frame, datum, layer/node names, round trip model->world->model) and the pinned digests above.
Limit: the pinned digests fail if someone later changes the sample quantities on purpose; update them then. The hashes cannot catch a NEW identifier nobody listed.

## Honest limits (also in SECURITY_PRIVACY.md section 4)
The shape of the site (footprints, roads, fences, the ~5 km master plan, network layout) is still the real one, only moved and re-levelled. Pipe sizes, tank volumes and the reinforcement values copied from the real calculation remain. The sample is a base-like facility: it was recognisable by names, those are gone, the layout is not. Real values also remain in git history, in the source drawing-text dumps outside the page, and in `incoming15/privacy_test.js` (a redaction example that uses the old UTM numbers; harmless to the page, but replace them if the repo is public).
Decision for the owner: for sensitive work either use a template, or crop/remove `MSITE` and `NETS` (cuts the identifying outline; needs a small follow-up because the Site tab and clash rules read them).

## Results (current chunks, build on commit 50ea347 + this change)
sample_check 32/32, parity 126, freeai 88, privacy 109. px2 149, link 43 (all five suites rerun after rebase onto 50ea347).
