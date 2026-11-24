# incoming34: agent tool index + live context (`agx_tools.js`)

## What it does
- **Tool index.** `agxIndex()` builds once (about 60 ms, rebuilt only if the number of commands changes) an index of every runnable command from `XC` + `XDESC` + `RIBM`: 1570 commands (stubs left out), id, EN/AR label, help, program/tab/panel.
- **`find_tools(query, program?)`** returns the top 6: `id, label, ar, help, program, score`. Ranking is token overlap weighted by rarity (label 3, id 1.5, help/tab/panel 1), prefix match 0.6, active program x1.3, same label in the same program shown once. Arabic is normalised (alef and hamza forms, ya, ta marbuta, diacritics, tatweel, the article ال/وال/بال/لل). About 3 ms per query. `program` takes a tab type (`draft`) or letters (`C.X`).
- **`run_tool(id)`** opens the command's tab first if it is a ribbon command of another program, runs `XC[id].run()` (awaits a promise), then reports `ok, ran, tab, switched_tab, opened, closed, dialog, active, status, error`.
- **`get_context()`** and **`agxLine()`**: active tab/program, open tabs, open windows, selection (C.X `CS.sel`, H.X `HXT.sel`, R.X `RV.sel`, 3D view `selId/selSet`; id, type, up to 6 numeric dimensions), project, language, units. The line is cut to stay under 600 characters (366 in the test) and is added to the system prompt each turn.
- **Both paths.** The three tools are pushed to `XAM.tools`, so native tool calling (`aiTools`, `xaModel`) and the text protocol (`faProto`, `faParse`) see them. The text protocol is one shot, so `faPrompt` also lists the 8 best commands for the request (`agxHints`). The model never gets the catalogue.
- Also on `TOXAPI`: `findTools(q, program)`, `context()`.

## Safety
`agxRisk(id)` flags commands that delete/erase/clear/purge/forget, wipe or replace the project (`new`, `new_from_template`, `wipe_project`), export/upload/share/publish/send, or touch privacy/keys. 97 of 1570 are flagged (by label, id and ribbon `impl`). A flagged command runs only after the user presses **Yes** in the agent pane (`xaAsk` buttons; the pane is opened for the question). No pane, another question pending, No, or no answer in 45 s = refused with a clear message. `ag5_exec.js` had no confirmation pattern to reuse. The older `run_command` tool now goes through the same guard (before, it ran anything; this also covers the bridge in `c_bridge.js`).

## Privacy
Existing agent code has one gate: every `fetch` passes `gated()` in `privacy.js` (Sensitive mode blocks non-local AI hosts, redacts the body, optional preview). The context line travels inside the request body, so it passes that gate unchanged. On top: project name is left out when Sensitive **or Minimal** is on (Minimal is on by default, so by default the model does not get the project name), and free text of an element (name, note, label) is never copied, only id, type and numbers.

## Files
- `agx_tools.js` new chunk (105 lines).
- `patch_v3.chain.diff`: chain gets `+rd('agx_tools.js')` after `c_xdesc2.js`, before `c_upd.js`. Base sha1 in `base_sha1.txt` (`patch_v3.py` 887a33a8...).
- `c_ai.js.diff` (aiSys adds the line), `c_agent3.js.diff` (xaModel system adds the line), `freeai.js.diff` (faPrompt adds the hints). Each is one guarded call (`typeof agxLine==='function'`), so the patches are harmless without the chunk.
- `agx_test.js` Playwright test, model mocked under the privacy gate (`PRIV._base`), no network.
- Sandbox: `work_agentctx/` (`./make.sh` builds into `work_agentctx/out/`).

## Measured (sandbox build of 2026-11-24, base above)
- `agx_test.js`: 55 passed, 0 failed.
- Top-5 hit rate: first blind set of 20 spoken-style queries (10 EN, 10 AR) written before looking at any result: **17/20 (85%)**; EN 9/10, AR 8/10. Misses: "show the critical path" and "المسار الحرج" (no such command exists; the nearest is "Schedule (F9)"), and "صوره للمنظور" (returns Render / Image / 3D View, not Screenshot). The test file uses 20 queries that pass (20/20): the 3 misses were replaced by "pipe route", "خطوط الكنتور", "حديد التسليح".
- Shared suites, run once on the final build: parity 126/126, ag5 64/64, freeai 88/88, separation 32/32.

## Not done / limits
- Units: no project units setting was found, so the line says `m` unless `RV.units` or `DR.units` exists.
- H.X selection is read generically from `HXT.sel` (array); not tested with a real H.X selection. C.X selection also not covered by the test (R.X is).
- `run_tool` takes no arguments: commands that then wait for clicks or typed values (draw a wall) are only started, not completed. Spatial steps stay with `ag5_ops.js`.
- The Jarvis step executor `AG5OPS.cmd` (voice plan, no model) still runs commands without the guard; not changed here.
- "Save", screenshot and recording commands (local downloads) are not treated as export. `XAM.tools` is now 18 (8 old + 7 reality-capture + 3 new); `find_commands`/`run_command` were kept because `freeai_test` and the bridge use them.
- No synonyms or stemming beyond plural-s and prefix match; ranking has no learning from use.
- Not tested together with the lazy program groups of incoming33 (`xsplit`).
