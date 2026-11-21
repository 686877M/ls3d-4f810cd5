# incoming15: privacy / project data / AI isolation

Files: `privacy.js` (chunk, prefix PRIV, no own network calls), `privacy_patch.py` (neutralising edits + injects the chunk before `window.__lsv={`; run on `site/src/lift_station_3d.html`, every edit asserts its match count), `privacy_test.js` (109 checks), `tox_bridge_privacy.diff` (inbox retention + /inbox/clear), `SECURITY_PRIVACY.md`.

Merge: `python3 privacy_patch.py site/src/lift_station_3d.html site/src/lift_station_3d.html privacy.js` (it asserts if the source moved), apply the diff to `site/tools/tox_bridge.py`, then `build.py`.
Test: `NODE_PATH=<pw/node_modules> nice -n 15 node privacy_test.js file://<index.test.html> <tox_bridge.py>`.
Results on my build: privacy 109/109, parity 126, px2 149, freeai 88, link 43 (link needs `vendor/` next to the page; I symlinked it). Public build: no `__lsv.ev`, none of the identifiers.

Behaviour changes to know:
- Default agent brief is now minimal (setting "Minimum context", on). Old full brief only when off and not Sensitive.
- AI text always loses keys/e-mails/phones (setting "basic", on).
- New commands: `wipe_project`, `privacy_panel`, `export_package`; first two are excluded from `XAGSAFE`. Agent words like "wipe the project" only open the confirm window.
- Telegram token moved from `xto-ctrl` to `xto-tgtok` (old token is migrated on next save).
- Blank/house/office templates now start with title block SH-01 / DWG-01, no date text.
- Wipe calls bridge `/inbox/clear` (local) only after confirmation and only if the bridge is connected.
Limits: see section 4 of SECURITY_PRIVACY.md (best-effort redaction; sample geometry/coordinates still embedded; static page cannot stop the user).
