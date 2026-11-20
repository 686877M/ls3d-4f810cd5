# pdfview: PDF viewer pane (`pane:pdfview`, command `pdf_open`)

Files: `pdfview.js` (88 long lines, one chunk, global names `PF`, `PFS`, `PFT`, `PFC`, `pf*`), `pdfview_test.js` (Playwright, 38 checks, all pass, file://), `pdfview_test50.pdf` (hand-written 50-page test PDF, made by the test), `pdfview_shot.png`.
Vendor (new, nothing else touched): `site/vendor/pdfjs/pdf.min.js`, `pdf.worker.min.js`, `LICENSE` (pdf.js 3.11.174, Apache-2.0, already there) + NEW `pdf.worker.src.js` (1.1 MB: `window.PFW` = worker source as a string).

## Integration
1. `patch_v3.py`: append `+rd('../site/src/incoming3/pdfview.js')` (or copy the chunk next to the `c_*.js`) AFTER `c_dc.js` and `c_cde.js` (uses `wxDefs`, `wxOpen`, `XCMD`, `dcAdd`, `out`, `el`, `b2`, `xSt`).
2. Ship `vendor/pdfjs/` next to `index.html` (relative `vendor/pdfjs/...`). Not inlined: pdf.js loads only on the first file open (the pane and command open without it).
3. Optional register hook: a button in `dcDetail` calling `pfOpenDoc(d.id)` (picker; the RFI body then carries `Source document: <id>`). The register stores only a file NAME string (`d.files`), no bytes, so there is nothing to auto-open; I did not touch c_dc.js.
4. Test: `NODE_PATH=<dir with playwright-core> node pdfview_test.js <site dir>` (injects the chunk into a temp copy of index.html, deletes it after).

## What it does
Open PDF (picker, or `pfLoad(arrayBuffer,name,docId)`), prev/next/page box, zoom -/+ and Fit width, thumbnail strip, text search (Enter = next, Shift+Enter = previous, orange = current hit, yellow = others), markups: select, pen, rectangle, cloud, text note, arrow, highlight, measure, Set scale (draw over a known length, type e.g. `5 m`), 6 colours (also recolours the selected markup), Undo (add / delete / clear page), Delete, Clear page, Create RFI, Export PNG (current page at 2x with markups), Export / Import markups JSON.
- Lazy: only pages within ~600 px of the view are rendered, pages far away release their canvas (test: 2-3 of 50 rendered); thumbnails render when scrolled to.
- Markups: SVG overlay per page in PDF points (zoom independent), saved in `localStorage['xto-pdfmk']` keyed `name|size`. Scale per page.
- Create RFI: `dcAdd({type:'RFI',dir:'out'})`, subject has file + page + note, body has File / Page / Markup / Measured / Note; the markup gets the RFI ref printed beside it. Uses the selected markup, else the last one; a markup without text asks for a question.
- Worker: `window.PFW` -> Blob URL -> `new Worker(blob)` set as `workerPort`, fresh per load (a port dies with its document). `workerSrc` is also set as fallback. Reason: pdf.js's own `workerSrc` route does a nested `importScripts(blob)` which fails on file:// (null origin) and showed a red "Script error" banner; fixed and checked.
- Security: stored or imported markups are coerced (type whitelist, numbers, colour regex, id charset, text escaped) because the SVG is built with innerHTML; tested with a hostile import.

## Honest limits / NOT tested
- Tested: Chrome headless-ish desktop, file://, one generated PDF (Helvetica text, lines, a rectangle). NOT tested: http(s) hosting (the run was blocked here, the code path is the same Blob Worker), real-world scanned or encrypted or huge PDFs, password PDFs (no prompt, shows an error), touch / pen input, Safari / Firefox, Arabic or embedded-font PDFs.
- Search is per text item (a phrase split across two items is not found); hit rectangles are proportional inside an item (approximate for ligatures / proportional fonts); no regex, no case option.
- Page size placeholders use page 1 until a page renders, so mixed-size sets shift a little while scrolling.
- Measure is straight-line only, one scale per page; no area / polyline measure. Calibration trusts the user's known length.
- Markups are not flattened into a PDF (not required); PNG is the export. localStorage is ~5 MB shared with the app; a full store shows a message and JSON export is the backup.
- Colour of an existing markup is changed by selecting it and clicking a swatch; there is no per-markup edit of text.
- Arabic UI labels are included via `b2`, layout of the pane is forced LTR.
