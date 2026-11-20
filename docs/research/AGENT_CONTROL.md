# Agent control research for T.O X (2026-11-20)

## ملخص بالعربي (5 سطور)
1. الصفحة عندها فعلاً `window.TOX` و جسر WebSocket (c_hub.js): أوامر تتعرض وتتشغل بـ id، وحالة، وتنبيهات، ومستندات. ناقصها: وسايط للأوامر، نتيجة للأمر، صلاحيات لكل أمر، وسجل تدقيق دائم.
2. أحسن طريق لوكيل خارجي (Claude Code / Gemini CLI / ChatGPT): سيرفر MCP محلي صغير بيتكلم WebSocket مع الصفحة؛ والصفحة ممكن كمان تسجل أدواتها في المتصفح عبر WebMCP لو المتصفح بيدعمه (لسه تجريبي).
3. للأدوات المكتبية: سيرفرات MCP جاهزة لـ Revit (رسمي من Autodesk، Apache 2.0، Revit 2027) و AutoCAD و Blender (مجتمع)؛ كلها بتشغّل كود على جهازك فمحتاجة موافقة بشرية.
4. المخاطر الأساسية: حقن أوامر من محتوى (prompt injection)، سر الجسر المخزّن في localStorage، منفذ CDP مفتوح؛ الحل: صلاحيات لكل أمر + موافقة المستخدم + سجل + حدود.
5. غير متأكد منه: تفاصيل WebMCP الحالية، دعم CORS لكل مزوّد نموذج، ترخيص سيرفرات المجتمع، وإمكانية تشغيل n8n MCP على نسختك.

## Evidence labels
- **VERIFIED** = seen in a search result text from the cited URL on 2026-11-20 (excerpt, not always the whole page).
- **READ** = read directly in the T.O X source (read-only, `c_hub.js`).
- **MEMORY** = my own knowledge, no URL read.
- No vendor code or artwork copied.

---

## 1. What T.O X already has (READ: `scratchpad/c_hub.js`, 6986 bytes)

- `window.TOX` = frozen object, `version:'1'`, methods from `TOXAPI`:
  - `commands()` -> list of `{id,en,ar,help}` from `XC` (every command with a title)
  - `run(id)` -> runs `XC[id].run()`, returns `true` or throws `unknown command`. **No arguments, no result data.**
  - `state()` -> project name, current tab, tab types, history position, docs count, summary
  - `pulse()` -> alert items `{severity,text}`
  - `docs()`, `addDoc(o)` (fields truncated: subject 200, body 8000), `setStatus(ref,st)` (validates ref and status), `search(q)`, `summary()`
- WebSocket bridge (`hubConnect`, `hubHandle`): off by default; JSON `{id, token, method, params}` -> `{id, result|error}`; requires shared secret of 8+ chars; warns with confirm() if the URL is not loopback (`127.0.0.1`, `localhost`, `[::1]`); keeps last 60 log lines in memory; panel `p_hub` under ribbon "Agents".
- The Agent panel (`p_agent`) already calls model APIs from the page (per the hub text: Claude, Gemini, OpenRouter, Mistral, OpenAI-compatible local servers). Keys stay in the browser.
- The hub text mentions `docs/AGENT_BRIDGE.md`. I did not check that it exists.

Gaps against what the owner wants (agents that control tools, ask questions, show indicators, open/close tabs):
1. `run(id)` cannot pass arguments (no "draw wall from A to B", no "open tab X").
2. No structured result or error codes; no way to read back the effect of a command.
3. No per-command permission class: an agent that can `run` can run anything in `XC`, including destructive commands.
4. No human-approval prompt for risky commands.
5. Audit log is 60 lines in memory only.
6. Secret stored in plain `localStorage` (`xto-hub`): readable by any script in the same origin and by browser extensions.
7. No "ask the user" channel and no "indicator" API for agents.
8. The WebSocket token is sent in each message (fine on loopback, bad on a remote `ws://`; use `wss://` only).
9. `hubHandle` has no rate limit and no origin/session binding.

---

## 2. Options compared

### 2.1 MCP (Model Context Protocol)
- Spec: servers expose tools; HTTP transports can use OAuth 2.1 (server = resource server; PKCE required for clients in the 2025-03-26 revision; tokens never in URL; 401 / 403 semantics). Authorization is optional; STDIO servers should take credentials from the environment instead. VERIFIED: https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization and https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization. Newer revision 2026-07-28 prefers Client ID Metadata Documents and treats Dynamic Client Registration as deprecated fallback (VERIFIED: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).
- **Browser MCP**: an MCP server that controls a browser (see 2.4).
- **Filesystem MCP**: reads/writes local files. Risk: exposes the disk; restrict to one project folder (MEMORY).
- **Custom MCP server for T.O X**: a small local process (Node or Python) that (a) speaks MCP over STDIO to Claude Code/Desktop, Gemini CLI, etc., and (b) holds a loopback WebSocket the page connects to (the existing hub). Each MCP tool maps 1:1 to a TOX method. This reuses `c_hub.js` unchanged on the page side. (Design, MEMORY on client support: Claude Code and Claude Desktop support MCP STDIO; other vendors' support changes often, check each.)
- Needs from the user: Node/Python on the machine, one config line in the agent client, a shared secret. No cloud key for the bridge itself.
- Risks: tool-result text from documents/web is untrusted data and can carry prompt injection; a local MCP server runs with your user rights (MEMORY, general MCP practice).

### 2.2 Function calling (no MCP)
- Every major API (Claude, OpenAI, Gemini, Grok, OpenAI-compatible local servers like Ollama/LM Studio) accepts a list of tool definitions with JSON-schema parameters and returns a tool call that your code executes. Behaviour and schema dialect differ slightly per vendor (MEMORY: I did not read each vendor's docs in this session; the search for Gemini/OpenAI docs returned nothing usable).
- Fit for T.O X: the in-page Agent panel can run the loop itself: send tools list, get a tool call, execute via `TOX`, send the result. No bridge needed, the page talks straight to the model API.
- Browser-direct calls: Anthropic requires the opt-in header `anthropic-dangerous-direct-browser-access: true`; the key is visible to anyone with dev tools, so this is only for bring-your-own-key use (VERIFIED: https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access). Other providers' CORS policy: NOT verified; use OpenRouter or a local server and test.
- User provides: their own API key (stored in browser only, per owner rule), or a local model URL.
- Risks: key theft by XSS or extensions; cost runaway (set max steps and max tokens); same prompt injection risk.

### 2.3 WebSocket bridge to the page (already built)
- See section 1. It is the right low-level transport. Keep it, extend the protocol (section 4).
- Risk: cross-site WebSocket hijack (any web page can try to connect to `ws://127.0.0.1`) is a general known issue, which is why a secret is needed (MEMORY, general). Keep the secret mandatory and per-session; reject if missing.

### 2.4 Playwright / Chrome DevTools Protocol (CDP)
- Chrome DevTools MCP can attach to a running Chrome; remote debugging is off by default; with `--autoConnect` Chrome asks the user for permission per session. An open debug port lets any local app control the browser; a non-default profile directory is required with the port on (VERIFIED: https://developer.chrome.com/blog/chrome-devtools-mcp-debug-your-browser-session and https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/SECURITY.md).
- Playwright MCP can launch its own browser or attach through a CDP endpoint; its JavaScript execution capability equals remote code execution in the server process, enable only for trusted clients (VERIFIED, via search summary of https://github.com/microsoft/playwright-mcp; page not read).
- Fit: best for **testing** T.O X and for agents that must click real UI without any `TOX` support. Worse than `TOX` for production control because it drives pixels/DOM (fragile) and can see everything in that browser profile.
- User provides: nothing but a dedicated browser profile. Never use the daily profile signed in to bank/email.

### 2.5 WebMCP (browser-native tools for pages)
- Early API where a page registers tools (imperative `registerTool()` in JS or declarative HTML forms) that an in-browser agent can call; the browser arbitrates access; the agent has a way to ask the user for input during a tool call (VERIFIED: https://webmachinelearning.github.io/webmcp/docs/proposal.html, https://github.com/webmachinelearning/webmcp).
- Naming conflict: `navigator.modelContext` (early previews/tutorials) vs `document.modelContext` (newer draft); a deprecation claim for Chrome 150 appears in one source only. Availability limited; Chrome early preview (VERIFIED, secondary: https://dev.to/thousand_miles_ai/webmcp-in-chrome-149-web-pages-get-a-tool-api-for-ai-agents-bfi). Feature-detect both; do not depend on it.
- Fit: nice-to-have adapter: register the same tool table as section 4 when the API exists.

### 2.6 Desktop tools through MCP and Design Automation
- **Revit**: Autodesk "Revit Public MCP Server", official, for Revit 2027, C#, Apache 2.0 (VERIFIED: https://www.autodesk.com/blogs/aec/2026/06/17/revit-public-mcp-server/). Community `revit-mcp` (TypeScript server + C# add-in) exists (VERIFIED: https://github.com/mcp-servers-for-revit; star counts conflict, ignore).
- **AutoCAD**: community only, e.g. puran-water/autocad-mcp (MIT per aggregator; file IPC backend for live AutoCAD LT on Windows, ezdxf backend for headless DXF) and others; no Autodesk-official AutoCAD MCP found (VERIFIED: https://snyk.io/articles/9-mcp-servers-for-computer-aided-drafting-cad-with-ai, aggregator). Licences of these community servers not verified.
- **Blender** (with Bonsai for IFC): ahujasid BlenderMCP (VERIFIED existence: https://snyk.io/articles/6-mcp-servers-for-using-ai-to-generate-3d-models; licence not verified).
- **Autodesk Design Automation / Automation API**: cloud headless Revit/AutoCAD; WorkItem -> Activity -> Engine + AppBundle; 100 calls/min per app; billed (VERIFIED: https://aps.autodesk.com/en/docs/design-automation/v3/developers_guide/field-guide and rate-limits page). Needs a compiled plugin. Use for batch jobs (extract quantities, export IFC), not interactive drawing.
- User provides: the desktop software with a licence, the add-in installed, and for DA an APS client ID/secret (keep the secret on a server/desktop, never in the page).
- Risks: these servers execute commands on real project files. Rules: work on a copy; read-only tools allowed by default; write tools need approval; log every call.

### 2.7 GitHub / GitLab OAuth
- GitHub OAuth app: web flow does NOT support PKCE or CORS preflight, and the code-for-token POST fails from a browser (CORS); device flow also cannot be called from a browser directly (VERIFIED: https://docs.github.com/en/enterprise-server@3.6/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps and https://www.zonca.dev/posts/2025-01-29-github-auth-browser-device-flow; note: those are Enterprise Server 3.x docs and a blog, not current github.com docs). So a pure browser app needs a tiny proxy, or the user pastes a fine-grained personal access token (MEMORY: PAT works with `fetch` to api.github.com because that API allows CORS; not tested here).
- GitLab: PKCE support not verified this session (search returned nothing). MEMORY: GitLab supports Authorization Code + PKCE for public apps. Test before relying.
- Use: store project files / BCF / IFC in a repo (version history = audit). Scope the token to one repository, no admin rights.
- User provides: a fine-grained token (repo-scoped), or OAuth client ID plus a proxy.
- Risks: token in `localStorage`; use short expiry; never put it in the URL.

### 2.8 n8n workflows
- n8n has an MCP Server Trigger node (exposes workflow tools to MCP clients, SSE/streamable HTTP) and an MCP Client Tool node (VERIFIED: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcpTrigger/). Self-hosting issues with reverse proxies reported on the n8n forum (VERIFIED, secondary: community.n8n.io). Licence summaries ("fair-code / Sustainable Use") come from third-party pages only: NOT verified.
- Fit: glue for things a static page cannot do: webhooks from APS/GitHub, email, schedules, notifications. Page calls an n8n webhook; n8n calls APIs with its own credentials.
- User provides: an n8n instance (self-hosted or cloud), webhook URL + secret header; n8n holds the third-party credentials.
- Risks: public webhook URL = anyone can call it unless a secret/header is checked; credentials live in n8n, keep them least-privilege.

---

## 3. Cross-cutting security rules (all options)
1. Tool results and document texts are data, never instructions. Wrap them in the prompt as untrusted (prompt-injection defence; same principle as the MCP spec's server-side checks, MEMORY).
2. Default deny: only `read` class tools are open. `write` needs the user's session toggle. `danger` needs a confirm dialog per call.
3. No secrets in URLs, no secrets in tool results sent to the model.
4. Bridge only on loopback by default; `wss://` plus token for anything else (the page already asks for confirmation).
5. Rate limit and step budget per agent run; hard stop button.
6. Every call appended to a persistent audit log the agent cannot edit.
7. Agents never type passwords or accept licence terms for the user (also an owner/project rule).
8. Say clearly in the UI which outputs are AI drafts.

---

## 4. Minimal design for T.O X (no source changes made; this is a proposal for the session that owns the code)

### 4.1 Tool schema (JSON, same for TOX / WebSocket / MCP / function calling / WebMCP)
```json
{
  "id": "rv_wall",
  "title": "Wall",
  "class": "write",
  "args": { "type": "object", "properties": {
      "from": {"type":"array","items":{"type":"number"},"minItems":2,"maxItems":2},
      "to":   {"type":"array","items":{"type":"number"},"minItems":2,"maxItems":2},
      "height_mm": {"type":"number","minimum":0}
  }, "required": ["from","to"] },
  "result": { "ok": "boolean", "data": "object|null", "error": {"code":"string","message":"string"},
              "changed": ["element refs"], "undo_id": "string" }
}
```
Classes: `read` (state, list, search, pulse), `write` (create/modify in the model or register), `ui` (open/close tab, show indicator, ask user), `danger` (delete, overwrite, export to outside, any network send). Source of ids: `our_commands.json` in this folder (command, runs_in_app, built flag); expose only commands with `built: true`.

Always-present meta tools:
- `tox.commands()` -> list with class, args schema, built flag (extends the existing `commands()`)
- `tox.state()` / `tox.pulse()` (existing)
- `tox.run(id, args)` -> result object above (extends `run(id)`, keep old call working when args absent)
- `tox.ui.openTab(type)` / `tox.ui.closeTab(type)` (class ui)
- `tox.ui.ask({question, options[], allow_text})` -> returns the user's answer; page shows a modal, the agent waits (class ui)
- `tox.ui.indicator({id,label,state:"idle|working|blocked|done",progress?})` (class ui)
- `tox.stage()` / `tox.gate.request({stage,summary})` -> user approves or rejects (ties to lifecycle in BIM_ECOSYSTEM.md section D)
- `tox.audit.tail(n)` read-only

### 4.2 Wire protocol (extends the existing hub message)
Request: `{"id":"7","token":"…","method":"run","params":["rv_wall",{"from":[0,0],"to":[5000,0]}]}`
Response: `{"id":"7","result":{"ok":true,"changed":["wall-12"],"undo_id":"u31"}}` or `{"id":"7","error":{"code":"denied|unknown|bad_args|user_cancelled|rate_limited","message":"…"}}`
Server-initiated event (new): `{"event":"user_answer","id":"q3","answer":"B"}` so the page can push answers and stage changes to the agent.

### 4.3 Agent loop (works in the page Agent panel or in an outside agent)
```
state = tox.state(); plan = model(brief, state, tools)
repeat up to N steps:
  step = model(next)
  if step.needs_info:   answer = tox.ui.ask(...)      # never guess missing values
  elif step.tool:       check permission(class) ->
                           read: run
                           write: run only if session allows writes, else ask
                           danger: always confirm dialog
                        result = tox.run(id,args); audit(result)
  tox.ui.indicator(progress)
  if stage ends: tox.gate.request(...)  # wait for human
stop on: step budget, token budget, user Stop, 3 consecutive errors
```
Indicators shown: current stage, agent state, open questions count, pending approvals, last 5 audit lines, cost counter (tokens).

### 4.4 Audit log
Append-only list of `{t, who(agent id/model), method, id, args_hash, args (truncated), result_ok, error, approved_by}`. Store in IndexedDB; "Export audit" button downloads JSON; optional mirror to the bridge process file (outside agent cannot edit the page copy). Redact keys/tokens before storing.

### 4.5 Permissions
Per agent profile (e.g. "Architect", "MEP"): allowed command ids or prefixes (`rv_*`), max class, allowed tabs, step budget, expiry. Default profile: read-only. Changing a profile is a user action only, never an agent tool. Bridge secret: do not keep in plain `localStorage`; keep in memory per session or encrypt with a user passphrase (WebCrypto), and rotate on each connect.

### 4.6 What the user must provide
| Path | User provides |
|---|---|
| In-page agent with model API | Own API key (Claude / Gemini / OpenAI / Grok / OpenRouter) or local model URL (Ollama, LM Studio) |
| Outside agent through MCP | Node/Python, MCP client config, the bridge secret |
| Playwright / CDP | Dedicated browser profile, debug port on loopback only |
| Revit/AutoCAD/Blender MCP | Licensed desktop app + add-in installed |
| Design Automation / APS | APS app client ID (+ secret on a server only), Autodesk account, billing for paid APIs |
| GitHub / GitLab | Repo-scoped token or OAuth client ID + proxy |
| n8n | n8n instance, webhook URL + secret |

### 4.7 Suggested build order (smallest first)
1. Add `args` and a result object to `run` + class tags (no new dependencies).
2. `ui.ask`, `ui.indicator`, `ui.openTab/closeTab`, audit log in IndexedDB.
3. Tiny local MCP server (~100 lines) forwarding MCP tool calls to the hub WebSocket.
4. In-page agent loop using function calling (BYO key).
5. Optional: WebMCP adapter, GitHub repo storage, n8n relay, desktop MCP servers.

---

## What was NOT verified
- Current docs of each model vendor's function-calling and browser CORS rules (only Anthropic header seen).
- WebMCP final API name and Chrome status (sources conflict).
- Current github.com OAuth docs (results were Enterprise Server 3.x pages) and GitLab PKCE.
- Licences of community AutoCAD/Blender MCP servers and of n8n.
- Whether `docs/AGENT_BRIDGE.md` exists; whether any code path outside `c_hub.js` defines more `window.TOX` use.
- Nothing was executed or tested: the design above is untested, no code was changed.
