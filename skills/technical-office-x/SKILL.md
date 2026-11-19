---
name: technical-office-x
description: Use when the user wants an agent to operate T.O X (Technical Office X), the browser engineering workspace for BIM, drawings, schedule (Primavera style), quantities and cost, codes, coordination checks, survey, reports and media. Covers how to open it, the window.BVT command API, the command ids, project JSON, and the honesty rules.
---

# T.O X (Technical Office X)

A single-file browser app. Open the page, sign in with the entry screen if it is shown, then drive it from the page console or an automation tool.

## Drive it

- `window.BVT.call('state')` returns the model parameters, day, and counts.
- `window.BVT.call('commands')` lists every command id with its label.
- `window.BVT.call('xcmd', {id: 'zfit'})` runs a command by id (see `references/commands.md`).
- `window.BVT.call('preset', {name: 'model'})` switches the workspace layout: `model`, `anim`, `draft`, `sched`, `site`, `anal`, `out`, `dash`, `review`.
- `window.BVT.call('setParam', {k: 't', v: 0.4})` changes a model parameter; the model, drawings, quantities and schedule update.
- `window.BVT.call('runChecks')`, `'hazards'`, `'clashes'`, `'items'`, `'report'`, `'lesson', {text}`.
- The command line at the bottom accepts ids, AutoCAD-style aliases (`L`, `C`, `ZE`, `P6`, `PACK`) and plain words in Arabic or English.

## Typical jobs

1. Review: `xcmd p_review` recomputes the project calculation sheets and lists what agrees, differs or needs a check. Then `xcmd p_coord` for cross-discipline conflicts.
2. Quantities and cost: `xcmd p_bom`, `e_boq`, `p_scen` (scenarios, Monte Carlo, price comparison).
3. Schedule: `xcmd p_tl` or `p6`; exports `xer`, `xml`, `xlsxs`, `csvs`.
4. Package everything: `xcmd pack` downloads one ZIP (drawings, 3D, schedule, quantities, analysis, manifest).
5. Media: `xcmd shot`, `rec`, `recdis`, `recasm`, or the Media tab for YouTube, Reels and TikTok shapes.

## Rules

- Do not invent values. A missing price, cover, load or datum stays empty or is marked as an assumption, with its source.
- Say what was not tested: exports were validated with open-source readers, not in AutoCAD, Revit, Navisworks or Primavera P6.
- The entry screen is a visual gate on a static page, not security. Do not treat the project data as private because of it.
- Codes (ACI, SBC, ECP, ISO) are listed by title and scope. Clause numbers and limits come from the user's licensed copy.

## Project data

`projectJson()` returns the whole project; `loadProject(text)` restores it. Save and open from the Home tab, or keep the JSON in git.
