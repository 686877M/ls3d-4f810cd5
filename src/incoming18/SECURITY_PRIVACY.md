# T.O X: security and privacy (threat model for a static page)

Honest scope. T.O X is one static HTML page. Everything below is what the page itself can do. It cannot stop a person who has the page open, a browser extension, malware on the machine, or an AI provider from keeping what it was sent.

## 1. What is protected
| Thing | How |
|---|---|
| Templates and exports carry no real project identity | Title block, sheet number, drawing number, date, IFC project/building/author, file and ZIP entry names (`Project_*`), error bar, share link (no local path on `file://`) are neutral. The built-in demo is labelled **Sample project (demo)**. Checked by `privacy_test.js` over 15 exports, the localStorage dump, downloaded blobs and ZIP entry names, for 4 templates. |
| Project data is separable | Every localStorage key that is not on the app-settings list is project data (a key added later is private by default). |
| Wipe after hand-over | Command **Close out project / wipe data** (`wipe_project`). Needs a typed word (`WIPE` / `مسح`) and a real (trusted) click. Agents, bridge tools and scripts can only open the window. |
| What AI providers receive | One gate on `fetch` sees every outbound request. See section 3. |
| API keys | Not in project JSON, the data package, the outbound log, `xto-aglog`, the preview text or the redacted body. A key goes only in the header to its own provider. The Telegram token has its own key (`xto-tgtok`). |
| Bridge inbox | `tox_bridge.py` (patch in `tox_bridge_privacy.diff`): file mode 0600, lines older than `TOX_INBOX_DAYS` (default 7) pruned at start, `0` = never written, `POST /inbox/clear` empties it. |

## 2. Wipe: what is deleted
localStorage project keys, sessionStorage (login/intro flags kept), IndexedDB (`xto-hist`, the undo history), Cache API, service workers, in-memory agent chat/log/model history, redaction map, outbound log, and the bridge inbox (if the bridge is connected: `POST /inbox/clear`, local, after confirmation). Kept: templates, app settings, and API keys unless the box "also remove keys" is ticked. The window lists what it deleted. After a wipe, writes to project keys are refused until reload.

**Not covered:** files already downloaded, copies on other devices, the AI providers' own logs, browser history, the bridge machine if the bridge was not connected (delete `~/.tox/inbox.jsonl` by hand), a page opened in another tab (it can re-save its own copy: close other tabs first).

## 3. What each AI request contains
- Minimum context: your message, the last 12 chat messages (6 in Sensitive mode, trimmed so it starts with a user turn), the static system prompt, and the data of the tool call. The old agent brief (project title, share link, whole schedule, clashes) is replaced by a short brief; the model asks for data through tool calls. Switch **Minimum context** off to get the old brief back (not allowed in Sensitive mode).
- Always (default): keys, e-mails and phone numbers are removed from AI text; replies are mapped back so you see the real value.
- **Sensitive project** switch: local models (localhost: Ollama, LM Studio, local Whisper, WebLLM) work as before. Any other AI host, n8n, Telegram, cloud speech-to-text, map/elevation/weather lookups, WhatsApp/Telegram share links and `navigator.share` are blocked. A provider can be allowed per host, and then only redacted text is sent: project name/number/sub-title, client, place, people, e-mails, phones, file names, coordinates (decimal, UTM-like, DMS), private IPs, and your own extra words.
- The proxy (`/proxy`) is judged by the inner provider host. Bridge `/inbox` and `/result` text is redacted in Sensitive mode.
- **Preview** (on when Sensitive is switched on in the panel): shows the exact redacted text before it leaves; Cancel sends nothing.
- **Outbound log**: time, host, path with query names only, type, bytes, items replaced, sent/blocked. No headers, no keys, no text.

## 4. What is NOT protected (read this)
- The redaction is **best effort**. It knows names stored in the project (title, client, location, parties, teams, minutes, issues, documents) and your extra words. It does not know a person's name you typed once in free text, nor Arabic-Indic digits, nor a name written with spelling variants. A wrong guess leaks or over-masks. Treat it as a seat belt, not a guarantee.
- Once text reaches a provider you allowed, the provider keeps it under its own policy.
- A static page cannot stop the person at the keyboard: they can read the DOM, localStorage, memory, and turn the switch off. The wipe is a convenience for the owner, not protection against a determined user or malware.
- Anything sent before Sensitive mode was switched on is already out.
- Images, drawings and audio: images/files are not read for names. Cloud audio is blocked in Sensitive mode, not redacted.
- **Sample project (neutralised in incoming18).** Replaced: the world origin (UTM 38N E/N and the lat/lon derived from it) by a fictitious UTM 31N E 500000 / N 10000 (open sea, not a real place); the plan rotation to north (6.5 deg) by 0; every absolute level by -1059.76 m (sump bottom B.L is +100.00, design ground +104.95; depths, heads, slopes, volumes, quantities and schedule are unchanged, digests checked); the 131 CAD layer names of the site plan (drawing codes, a contractor's words) by `LYR-nnn`; the building/facility names in the network data (they described the kind of facility) by `BLD-nn`; model, file and drive names of the network models, the master-plan source note, a review note that quoted a real document title and initials, and the station label coordinates. Checked by `sample_check.js` (numeric ranges + hashes of the old values, over both built pages, the live state and every export incl. XLSX/ZIP entries and PDF).
- **Still in the sample (could identify the project):** the SHAPE of the plan. Local coordinates, building footprints, road/fence/curb linework, the whole master plan (about 5 km long) and the layout of the sewer, storm, water and fire networks are the real ones, only moved and re-levelled. Someone who knows the site, or overlays this outline on satellite imagery, can recognise it. Pipe sizes, tank volumes and the structural/reinforcement values copied from the real calculation also remain. Local model coordinates keep the real orientation relative to the drawing axes. Real values also stay in the git history, in `*.pre_sample` backups and in the source drawing-text dumps kept outside the page. For sensitive work use a template, or remove or crop the sample site data (master plan and networks) first.
- Exports you make from a real project carry what you typed in it (name, client). The ZIP and README use the project name you chose.
- XLSX/ZIP contents that are compressed cannot be scanned by the test for names (entry names are scanned).
- Fonts and PDF: jsPDF writes Producer and creation date; no author field is set. Fonts are the PDF base fonts (no file paths).
- A browser extension, a proxy on your network, or the bridge host can read local-bridge traffic (127.0.0.1 only, token required).
- Login is unchanged; it is a gate in the page, not server security.
- The wipe's bridge call and the redaction need the page code to be the unmodified build.

## 5. Tests
`sample_check.js` (incoming18): see section 4.
`privacy_test.js` (109 checks): neutral templates/exports, redaction, gate (mocked, no real provider), preview, minimum context, keys never in exports/logs/history/package, wipe (untrusted click does nothing, agent only asks, unknown future key wiped, settings/keys kept, after reload clean), panel, bridge retention/clear. Existing suites on the same build: parity 126, px2 149, freeai 88, link 43.
