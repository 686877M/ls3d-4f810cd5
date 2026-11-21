# Prices, specs, finishes, tender (prefix `ps_`, 3 chunks) - closes gaps 5 and 16, data part of 17/18

**Chain:** insert right after `c_qx_bi.js` (one line, see `chain.diff`):
`+rd('c_qx_bi.js')+rd('ps_data.js')+rd('ps_core.js')+rd('ps_ui.js')+`
No existing file was edited. Needs Q.X (`qxModelSync`, `qxK`, `qxAfter`, `QX.addSheet`), R.X (`RV`), `OUTL`, `XCMD`, `XDESC`, `RIBP/RIBM`. Globals added: `PSD` (data), `PSX` (pure logic, Node-testable), `PSU` (UI). Data lives in `DATA.ps` (created on first use, rides in project save).

## What the owner gets
Open with the new ribbon tab **Prices & specs** inside the Q.X workspace (13 commands, all with EN/AR help text) or command `ps_open`. One pane, four tabs:
1. **Prices** - editable unit price book. Fields: currency, price date, region. 60 SAMPLE items (earthwork, blinding/plain/RC concrete C15-C35, formwork, rebar per tonne, masonry, plaster, paint, floor/skirting/wall tile/ceiling types, doors, windows, waterproofing, MEP rough-in per point/metre). CSV import (`,` `;` tab, quoted fields, BOM) and export (round trip tested). Apply to Q.X: dialog lists the Q.X model lines, suggests a price item per line (same unit only), writes nothing until lines are ticked and **Apply** is pressed; rates already typed are protected unless "overwrite" is ticked; unit mismatch is warned; a remark naming the item, currency, date and "SAMPLE, replace with your own rates" goes into the Remarks column.
2. **Specs** - 31 short original clauses (EN + AR) for earthwork, concrete (grades, cover, curing), formwork, steel, masonry, plaster, paint, floors, skirting, wall tiles, ceilings, doors, windows, waterproofing, MEP materials. Pick clauses per BOQ line (or per finishes line, or "General"), "Suggest clauses" ticks the usual trade. Spec book export = one HTML (EN, AR or both), grouped by trade, line-to-clause table, neutral title.
3. **Finishes** - room schedule from R.X rooms (doors and windows are found by their host wall position, a door shared by two rooms is counted once), or rooms added by hand (area, perimeter, height, openings like `0.9x2.1*2`). Per room: floor, skirting, wall, ceiling finish. Door and window marks (D1.., W1..) with a price item each. BOQ lines generated and summed by price code, summary by trade, cost per m2 of room floor area, **Send BOQ to Q.X** (new sheet with Qty x Rate = Amount formulas), CSV and HTML export.
4. **Tender** - bid comparison / normalisation (3+ bidders, estimate column, missing items filled at the median of the other bids or the estimate, adjustments, qualifications, rank, flags: missing, unbalanced rate below half or above double the median, more than 15 % below estimate (rule of thumb from PROJECT_PHASES), CSV in/out) and 6 neutral contract templates (instructions to bidders, form of tender, agreement skeleton, award letter, variation procedure, pre-start checklist) with blanks in `[brackets]`, EN/AR.

Output Center: new items **11** Specification book, **12** Price book and finishes, **13** Tender helpers (contract templates + bid comparison if one exists). They use neutral file names and no project data.

## Opt-in rules (as the owner asked)
- Nothing is loaded at start; the pane, ribbon rows and `DATA.ps` appear only on use (`DATA.ps` is `undefined` until then, tested).
- The book is empty until **Load sample rates** or an import. Q.X rate cells stay empty; `qxModelSync`, BOQ and Cost summary are unchanged (tested: with a loaded book a fresh model sync still has no rate).
- Rates only enter Q.X through **Apply ticked lines**, or into the finishes lines through **Fill rates from book** / **Send BOQ to Q.X**. Suggestions are pre-selected but never ticked.
- Every sample figure is labelled "SAMPLE, replace with your own rates": banner on the Prices tab, column header "Rate (SAMPLE)", source column, apply preview, Q.X remark, finishes screen, CSV `note` column, HTML pages. A rate you edit becomes "your rate" and loses the label.

## Files here
`ps_data.js` (data), `ps_core.js` (logic), `ps_ui.js` (pane, commands, ribbon, outputs), `ps_core_test.js` (Node, 78 checks), `ps_test.js` (browser, 83 checks), `chain.diff`, this note.

## Tests (private build, one headless Chrome at a time)
- `node ps_core_test.js [dir]` : 78 / 78 (CSV round trip incl. quotes, `;` delimiter, formula-injection guard; plan/apply rules; 2-room finishes hand calculation: Room A 4x5 m, h 3, door 0.9x2.1, window 1.2x1.2 -> walls 50.67 m2, skirting 17.1 m; Room B 3x3 with the shared door -> walls 34.11, skirting 11.1; lines FL01 29, SK01 28.2, PL01 84.78, PT01 113.78, DW01 1, DW03 1.44; bids; spec book and contracts have no project identity).
- `NODE_PATH=<SP>/pw/node_modules node ps_test.js <index.test.html>` : 83 / 83 (lazy start, ribbon + XDESC, no silent apply, Apply writes only ticked lines, Q.X BOQ total = sum qty x rate, CSV import through the real file chooser, finishes vs hand calculation through R.X rooms, Finishes BOQ sheet total, spec book, bids, Output Center items 11-13, Arabic render of all tabs with every button titled, JSON round trip of `DATA.ps`, no page errors).
- Regression on the private build: see the result block at the end of this note.

## Not done / not verified
- Prices are invented samples in a neutral unit, not market data; nothing was looked up online. Clauses are generic and short, not a code-compliant specification: the cover and strength remarks say "confirm against the governing code".
- Finishes assume rectangular R.X rooms (that is what the Room tool makes); L-shaped rooms need to be entered by hand. Wall tile is full height only (no dado). No waste allowance is added (tiles 7-10 %, per PROJECT_PHASES rule of thumb): add it in the rate or the quantity.
- Q.X integration reads `qxModelSync(true)` (creates the Model quantities sheet if absent, like the Data > Model quantities button).
- Contract templates are not legal advice; a lawyer must review them. Not tested: Safari/Firefox, a real Excel open of the exported CSV, phone layout of the pane.
- Project wipe: `DATA.ps` is stored with the project in localStorage, and `privacy.js` wipes every localStorage key that is not on its keep list, so the price book, selections, finishes and bids go with "Close out project" (privacy suite result below).

## Result block (private build `work_pricespec/out`, built 2026-11-21, 4912 KB, one Chrome at a time, nice 15)
| Suite | Result |
|---|---|
| parity (`incoming/parity_test.js file://index.test.html`) | 126 / 126 |
| px2 | 149 / 149 |
| freeai | 88 / 88 |
| privacy (incl. project wipe) | 109 / 109 |
| Q.X (`incoming8/qx_test.js index.test.html`) | 75 / 75 |
| ps_core_test (Node) | 78 / 78 |
| ps_test (browser) | 83 / 83 |
| link (`incoming5/link_test.js`) | NOT 43/43: stops after 6 PASS at `page.setInputFiles('#ifvbox input[type=file]')` (30 s timeout, IFC viewer upload). The same stop happens, with the same 6 PASS, on the shared `site/index.test.html` without my chunks, so it is not caused by this work (suspect: machine load or the IFC viewer upload step). Not re-checked on an idle machine. |
Note: the Q.X test needs `index.test.html` (it uses the `__lsv.ev` hook); `index.html` has no hook.
