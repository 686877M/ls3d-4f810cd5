# Extending T.O X

The page is assembled from chunks (`c_*.js`) into one file. Nothing needs a server.

## Add a command
`XCMD(id, iconName, 'English label', 'Arabic label', () => { ... }, () => isActive)`. Put its id in a ribbon group inside `RIB`, and add a line to `XDESC` for the explanation shown in the command list. Aliases go in `XALIAS`.

## Add a panel (widget)
1. Add `<div class="pane" id="p-name"></div>` to the pane list in `patch_v3.py`.
2. Add `'name'` to `TABS`, and `tab_name` to `c_dict.js`.
3. Fill it from a function, and register the refresh in `WXR` so it renders when opened, not on every change.
4. Add an icon name to the map in `wxDefs` and a command `xpane('name')`.

## Add a ribbon tab or a layout
`RIB` holds tabs, groups and command ids. `WL` holds layout presets as fractions of the workspace.

## Add a calculation
Append to `CALCS`: inputs `[key, label, unit, default]` (leave the default empty when the value must come from the user) and `run(v)` returning rows `[label, value, unit, check]`. Add a review line to `calReview()` when the project documents state the result.

## Add a code reference
Append to `CODES` with `id, reg, t, tags, what, use, src`. Tags connect it to elements (`PART_TAGS`) and activities (`ACT_TAGS`).

## Add a coordination rule
Push an issue inside `coRun()` with a rule id, the two disciplines, severity, text and action. Rules must only use data the project has.

## Project type
Today the model is the sewage lift station. A new project type replaces `buildModel()`, `baseItems()`, `ACT` and the data tables; the shell, ribbon, schedule engine, BOQ, codes, survey, coordination and package export are project independent.

## Build
`python3 patch_v3.py && python3 build.py` assembles `index.html`. Test with a headless browser: click every ribbon command and check for page errors.
