# regq.js (prefix `rq`) — register query + Follow-up dashboard

## Integration
- Add `rd('c_regq.js')` (this file) in patch_v3.py **after c_cde.js** (needs dcTabs/dcPanel wrapped by c_cde first; also works before it). Needs: DC, DCT, DCS, dcT, dcName, dcSt, dcL, dcEsc, dcToday, dcProjName, dcRegXlsx, dcBox, el, b2, out, xSt, XCMD, wxOpen, optional CDEBIC/cdeFolder (c_cde), TOXAPI.addNews (c_hubx).
- Globals added (all unique, grep'd clean): `RQ RQCLOSED RQROLE RQCOLS RQGRP RQF rqDn rqParty rqCmpS rqCsvCell rqDlg rqParse rqTest rqRows rqKey rqRun rqCsv rqXlsx rqSaveViews rqQuery rqCloseDn rqStats rqTop rqDigest rqNewsLine rqHBars rqCols rqFollow`.
- Two new DC tabs after "Folders": `rq` (Query) and `rqf` (Follow-up). Two XCMDs: `rq_open`, `rq_follow` (not placed in a ribbon; c_cmd lists unplaced ones automatically; add to RIB if wanted).
- Storage: only `xto-rqv` (saved views). No seed data shipped. Does not edit DC.docs (rqXlsx swaps it for the call and restores in `finally`).

## Behaviour / definitions
- Query: `type:RFI status:review due:<2026-12-01 party:acme -type:NCR "free words"`. Fields: type status dir party from to disc folder ref subject prio due date age role overdue open. `< > <= >=` on due/date/age; `,` = OR; `-` = negate; quotes for spaces. Plain words search ref+subject+from+to+body. `type`/`status` match the code exactly, or the EN/AR name when the term is >3 chars. `party` = `to` for outgoing, `from` for incoming. `role` = ball-in-court (CDEBIC).
- Sort by any column (click header), group-by type/status/party/folder/discipline (headers with count and overdue), saved views (name, query, sort, group), CSV (UTF-8 BOM, formula-injection guard) and Excel via `dcRegXlsx` (filtered rows; Parties sheet included).
- DOM capped at 200 rows, "Show more" adds 500. Typing is debounced 150 ms; only the table redraws (input keeps focus).
- "Open" = status not in closed/appr/apn/draft (same as dcReg/dcOverdue). Overdue = open and due < today. Age = days since doc `date`.
- Closed date for the trend = date in the last log entry matching `→ closed|appr|apn`, else doc date. Weeks are rolling 7-day windows ending today. "Opened" = doc date in window.
- Digest EN + AR textareas, Copy EN / Copy AR, "Add to news strip" sends a one-line (<=200 char) headline in the current UI language via TOXAPI.addNews.

## Tested (Playwright, Chrome, built page from file, `regq_test.js`, 62 checks, ALL PASSED; 5/5 consecutive runs after the reload-delay fix)
- 22 query cases with hand-counted answers on a 9-doc fixed set (fixed today 2026-11-20), sort, group by type/party, stats (open/overdue/by type/by party/ageing/ball-in-court/weekly opened+closed/oldest), EN+AR digest content, news line length.
- CSV content + formula guard; Excel blob via dcRegXlsx and DC.docs restored; CSV/Excel real downloads fire.
- UI: tab renders, typing filters, header sort, group rows, save view -> localStorage, view survives reload and loads into the input, Follow-up renders 5 SVGs + 2 textareas + <=10 oldest rows, news strip gets the line, Register and Folders tabs still render through the wrappers, tab order, Arabic UI renders on Follow-up, no page errors.
- 5,000 seeded docs (in the test file only, seeded PRNG; 2,522 open / 1,943 overdue). Timings, two runs, ms: filtered query 14-15, full sort by date 22-27, sort by subject 9-12, group by party 25-27, free text 8-10, rqStats 9-13, digest 7-37, CSV 35-56, Excel 155-158, Query tab full render (200 rows) 28-41, Follow-up render 10-13. Nothing near a freeze.

## NOT tested
- Visual review of the charts (no screenshot inspection; layout at narrow/mobile width untested), dark theme, RTL pixel layout.
- Real clipboard (Copy buttons use navigator.clipboard with an execCommand fallback; only the news button was exercised). Opening the xlsx in Excel (only blob size/type checked).
- 5,000 docs through a real browser localStorage quota (dcSave not exercised). Docs with malformed dates are skipped by age/trend, untested beyond empty `due`.
- Mixed with other chunks' later wrappers of dcTabs/dcPanel (only c_cde tested).
- Test caveat: with no pause, reload right after the CSV/Excel downloads lost `xto-rqv` in 2 of ~12 runs (raw localStorage in the same setup never lost a key in 8 trials; nothing in the build clears storage). The test now waits 500 ms before reload; treated as a headless-Chrome flush race, not proven.
- Test runs with `NODE_PATH=<dir containing playwright-core>`; `npm root -g` here has none, I borrowed /private/tmp/mod_gantt/pw/node_modules read-only. Default page URL in the test is my private build; pass your file:// URL as argv[3].
