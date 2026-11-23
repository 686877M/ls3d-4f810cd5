# incoming33: lazy program groups (xsplit)

Date 2026-11-23. Built and tested in `work_split/out/` only. Nothing under the work root or `site/` was changed
except this folder. Not committed, not pushed.

## Short answer

- The mechanism works and all suites pass, but the gain is small: main script about 695 ms -> 634 ms (-9%).
- Reason: start-up time is NOT parsing of unused program code. V8 already skips function bodies until they are called.
  The time goes to code that runs at start (shell and UI building, registration) and to native DOM / layout work.
- So moving more function text will not give a large win. The next real win needs changes inside the chunks
  (build panes and ribbons on first open), not in the build.

## Important correction to the task premise

The task said: run a group by appending a real `<script>`, never `eval` in a function.
That cannot work here. The whole main script is ONE strict-mode IIFE (`(function(){'use strict'; ...})()`),
so every chunk's `const` / `function` is a closure local, not a global. A separate `<script>` cannot see `XC`, `XDESC`,
`DATA`, `el`, `b2` and so on. The only way to run deferred text with access to the closure is a direct `eval`
inside it. `demo_stub.js` already does exactly this for `xDemoSrc`, and `__lsv.ev` does it for the tests.

## What the mechanism does

`xsplit.py` (new) is called at the end of `patch_v3.py`, on the assembled page:

1. For each group (a list of chunk files) it finds the top-level `function` declarations of those chunks.
2. Each one is MOVED into `<script type="text/plain" data-xg="group">` placed just before the main script.
3. A one-line stub stays in place: `function seOpen(){return XG('se','seOpen',this,arguments)}`.
4. `XG()` (added right after `'use strict';`) evaluates the block once on the first call, inside the closure,
   removes the text node, and records the load in `window.__xgRan` (`[group, first function, eval ms, time ms]`).

Everything that is not a top-level function stays where it was and still runs at start: state objects,
`XC` / `XDESC` / ribbon registration, wrappers, `window.X =` exports. So buttons, commands and help text stay registered,
and `typeof fn==='function'` checks give the same answer as before.

A function is left untouched (eager) when moving it could change behaviour. `xsplit.py` decides this from the tokens:

| reason | meaning | this build |
|---|---|---|
| dup | declared more than once in the script | 0 |
| assign | the name is assigned somewhere (wrapper pattern) | rcPaint, nvRefresh, rsTabStills |
| prop | used as an object (`f.x`, `f[..]`, `new f`) | qxDashHtml |
| mixed | used as a value (callback / listener) both inside its lazy text and outside: two identities | rcRefresh, rcFromSel, rcDatPanel, rcSave, qaHpBuild, qaCanComplete, rsViewPose |
| hot | called during start-up (measured, `xg_hot.json`) | 13: hxtBtnHook, hxtClickTool, hxtMs, hxtPreDispose, hxtTag, nvAdd, nvFrame, nvOvRib, qaGate, qaRestore, qaSnap, rsSave, rsSetPreset |
| nomatch | text not found exactly once at top level | 0 |

`xg_hot.json` is produced by `hot.js`: it loads the page three ways (hub, no hub, login screen), lists the lazy functions
called in the first 7 s, and the build keeps them eager. Repeat until it prints `groups loaded at start: none` (took 3 rounds).

## Groups split in this build

| group | chunks | functions lazy | text moved |
|---|---|---|---|
| rc (F.X capture) | c_rc_* (5) | 115 | 120 KB |
| qa (planning / QA) | qa_* (8) | 81 | 87 KB |
| se (structural) | se_* (6) | 51 | 71 KB |
| hxt (H.X tools) | hxt_* (6) | 114 | 60 KB |
| nv (N.X) | c_nv_* (4) | 86 | 58 KB |
| rs (render studio) | rs_* (3) | 66 | 56 KB |
| qx (Q.X) | c_qx_* (4) | 80 | 55 KB |
| ph (photos to 3D) | ph_* (3) | 51 | 52 KB |
| total | 39 chunks | 644 | about 560 KB |

Group evaluation on first use costs 1.5 to 2.5 ms each (measured). Opening F.X loads `rc` and `ph` together.

## Numbers (headless system Chrome, `index.test.html`, median of 5 loads, same machine, same minute)

| | baseline (`XSPLIT=0`) | split |
|---|---|---|
| main script parse + run | 694.8 ms | 633.8 ms |
| DOMContentLoaded | 1041 ms | 964 ms |
| load event | 1248 ms | 1203 ms |
| long tasks, first 5 s | 947 ms | 871 ms |
| JS heap after start | 32 MB | 30 MB |
| page size (`index.html`) | 6 171 KB class | +47 KB (stubs and loader) |

Caution on noise: the first baseline run, taken while another session was busy, gave 1383 to 2670 ms for the same page.
Differences under about 50 ms are not reliable on this machine. The direction (-60 to -80 ms) was the same in every metric.

Where baseline start-up time goes (CPU profile, one load, self time):

- about 850 ms `(program)`: native work (parse, compile, DOM, style, layout, GL)
- about 330 ms native functions called from JS
- `c_shell.js` 212 ms, `c_draft.js` 67, `c_upd.js` 60, `c_p6.js` 39, `c_tl.js` 35, `c_dict.js` 31, `c_collect.js` 30,
  `c_sheet.js` 20, `lazygl.js` 20, `c_4d_ui.js` 19, `c_occ.js` 17; every other chunk under 10 ms
- the big data chunks are cheap: `c_msite_data.js` (836 KB) compiles in about 18 ms, the other four data chunks under 3 ms each

## Groups NOT split, and why

- `md_*` (138 KB), `ps_*` (81 KB), `c_rvx_*` (90 KB), `c_p2tog_*` (79 KB), `c_mod_*` (70 KB), `c_px2_*` (49 KB),
  `c_parity_*` (38 KB), `c_prog_*` (37 KB), `freeai*`, `c_hxassets_*`: each chunk is one module expression
  (`const X=(function(){...})()` or similar). They have no top-level function declarations, so there is nothing for this
  mechanism to move. Making them lazy means deferring the whole module, and their registration (`XC`, `XDESC`, ribbon)
  runs inside it at load: this is the registration blocker named in the task. It needs a hand-written stub per module.
- `c_lb_*` (33 of 134 KB movable), `gm_*` (18 of 97 KB), `rcs_*` (17 of 78 KB), `ag5_*` (39 of 58 KB): mostly data and
  top-level statements. Possible, small gain, not done.
- Data chunks (`c_msite_data`, `c_cmddata`, `c_site_data`, `c_nets_data`, `gm_catdata`, 1.2 MB): not worth it, see timings above.
- The 112 general `c_*.js` chunks hold 949 KB of top-level functions (R.X, C.X, S.X, P.X and the shell). The mechanism can
  take them (add a group line), but they have no per-program prefix, need their own hot list, and by the numbers above the
  expected gain is in the same range as this one (tens of ms). Not done.

## Not done

- Phase 3 idea "heavy work off the main thread": not started.
- `privacy_test.js` (109) and `px2_test.js` (149) were not run (not requested; token budget).
- No run on the public `index.html` (it has no `ev`; the build path is the same).
- No Safari / Firefox run. Nothing engine-specific is used (direct eval, `querySelector`), but it is not tested there.

## Tests on the final split build (`work_split/out/index.test.html`), one run each

| suite | result | expected |
|---|---|---|
| `site/src/incoming/parity_test.js` | 126 passed, 0 failed | 126 |
| `pw/ag5_test.js` | 64 passed, 0 failed | 64 |
| `pw/separation_test.js` | 32 passed, 0 failed | 32 |
| `pw/cadimp_test.js` | 11 passed, 0 failed | 11 |
| `pw/hxt_test.js` (extra, because hxt is split) | 45 passed, 0 failed | 45 |
| `xsplit_test.js` (new, this folder) | 20 passed, 0 failed | 20 |

`xsplit_test.js` checks: 8 text blocks in the page, no group evaluated at start, command and help registered before load,
`seOpen` / `rcOpen` are stubs, `se_open` / `qa_wbs` / `rc_open` each evaluate their group once and remove its block,
unused groups (hxt, nv, rs, qx) stay unloaded, no page errors.

## Risks

- Indirect identity: a stub is a different function object from the real one. Direct cases are detected (`mixed`), but a
  function passed through a variable and later compared or removed as a listener from lazy code is not. None seen in the suites.
- `fn.length` / `fn.name` read through an alias see the stub (length 0). Direct `f.` uses are kept eager.
- The regex-versus-division rule in the tokenizer is a heuristic. A wrong guess gives an unbalanced scan and the build
  stops with an error (it does not produce a wrong page silently). All 210 chunks scan clean today.
- `xg_hot.json` is measured, not derived. After chunk changes a group may start loading at start again: still correct,
  only slower. Re-run `hot.js` (or check `window.__xgRan` after load).
- A saved project that carries data for a group (for example QA data) may load that group at start. Correct, costs about 2 ms.
- Error stack lines for lazy functions point into `xg-<group>.js` (sourceURL), not the main script.
- `privacy_patch.py` runs after the split and still passed all its count asserts. A future `rep()` pattern that spans a
  function boundary in a split chunk would fail its assert (loud, not silent).
- Page is about 47 KB larger.

## Files here

- `xsplit.py`: the splitter (new file, goes in the work root). `python3 xsplit.py` runs a self-check.
- `patch_v3.py`: shared file plus the hook (11 lines before the final write). `patch_v3.diff` is the diff.
- `build.py`: NOT changed, no diff. `privacy_patch.py`: not changed.
- `base_sha1.txt`: sha1 of the shared files the work started from
  (`patch_v3.py` 97f8e67cb65c8163e64e89cb8258ed9cda634bb5, `build.py` baea30d0b91c0dd543a5c1b8b71be1dcbf8828ce).
- `xg_hot.json`: start-up hot list (goes in the work root next to `xsplit.py`).
- `xsplit_test.js`: the new test. `hot.js`: makes the hot list. `measure.js`: start-up timing and profile.
- `build_split.py`: builds into `work_split/out/` without touching shared outputs (`XSPLIT=0` gives the baseline).

## To integrate

1. Check `patch_v3.py` still has sha1 97f8e67c..., else apply `patch_v3.diff` by hand (one block before the last line).
2. Copy `xsplit.py` and `xg_hot.json` to the work root, replace `patch_v3.py`, run `./make.sh`.
3. `XSPLIT=0 ./make.sh` turns it off. `XSPLIT_ONLY=se,qa ./make.sh` limits the groups.
4. Run `xsplit_test.js`, then the usual suites.
