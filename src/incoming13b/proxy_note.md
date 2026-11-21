# Bridge: local CORS proxy, MCP over HTTP, optional COOP/COEP (incoming13b)

Files here (a COPY, `site/` untouched, nothing pushed): `tox_bridge.py` (replaces `site/tools/tox_bridge.py`), `freeai.js` (replaces `incoming11/freeai.js`; `freeai_data.js` unchanged), tests `test_tox_bridge.py`, `proxy_rig.py` (fake HTTPS provider + real handler), `freeai_proxy_test.js`, logs, and `build/index.test.html` (current test build with the patched `freeai.js`).

## 1. `POST /proxy`
Body `{url, method:"GET"|"POST", headers, body:string, stream:bool}`. Reply: upstream status, body and a few headers (`content-type`, `retry-after`, `x-ratelimit-*`, `ratelimit-*`, request ids), all readable by the page; `x-tox-proxy: ok` marks a passthrough. A refusal made by the bridge itself carries `x-tox-proxy-error: 1` and `{"error":..,"tox_proxy":true}`, so a provider 401 is never confused with a bad bridge token.
Rules, all checked before any network call unless noted:
- Token in header `x-tox-token` (or `Authorization: Bearer`) only; NOT in the query string. Host header must be loopback (DNS rebinding) and a browser `Origin` must be loopback or `null` (page from file://). Server stays on 127.0.0.1.
- URL: https only, port 443, no userinfo, no fragment, exact host match against the list below (rejects IP literals, `localhost`, trailing dot, subdomains, `api.groq.com.evil.com`), path must end in `/models`, `/models/<id>`, `/chat/completions`, `/completions` or `/embeddings` (no `..`, no encoded dots/slashes). Extra hosts: env `TOX_PROXY_HOSTS="a.com,b.com"`.
- Allow-list = the 23 https hosts of `freeai_data.js` (a test fails if the two drift). Not included: `api.moonshot.cn` (only named in a note text), add via env.
- Network (checked at connect): DNS answers must ALL be public (`is_global`; rejects loopback, 10/8, 172.16/12, 192.168/16, 169.254/16, 100.64/10, CGNAT, link-local, multicast, `::1`, `fc00::/7`, IPv4-mapped IPv6). The connection goes to the vetted IP (no second lookup, so no rebinding window) with normal certificate check and SNI for the host name.
- No redirects are followed: a 3xx is returned with its `Location` dropped and `x-tox-proxy-note: redirect not followed`.
- Request headers forwarded: `authorization content-type accept x-api-key api-key x-goog-api-key anthropic-version openai-organization http-referer x-title` only (no cookie, no Host). Forced `accept-encoding: identity`, own User-Agent.
- Limits: request body 2 MB (413), response 16 MB (502), connect 10 s, idle read 60 s (504), total 180 s. The request is never repeated after it was sent (only the TCP connect may try the next address).
- Key handling: arrives in the request headers, used for that one call, never written anywhere; the handler's `log_message` stays silent; a provider error page that echoes the key gets it masked as `***` (buffered replies; not done for streams).
- `stream:true`: bytes are relayed as they arrive (SSE), `Connection: close`, same size/time caps.

`/ping` now also returns `"proxy":true,"mcp":true,"isolate":bool` (the page uses `proxy` to detect an old bridge).

## 2. `POST /mcp` (MCP streamable HTTP, JSON replies)
For n8n's MCP Client Tool: Endpoint `http://127.0.0.1:8766/mcp`, auth Bearer = the bridge token (or header `x-tox-token`). Same 15 tools as stdio. `initialize` (echoes the client protocol version, returns `Mcp-Session-Id`), `notifications/*` -> 202, `tools/list`, `tools/call`, `ping`, batches; unknown tool -> JSON-RPC -32602 at once (stdio too; it used to wait 90 s). `GET /mcp` -> 405 (no server stream, allowed by the spec), `DELETE /mcp` -> 200. Same Host/Origin/token guard as `/proxy`. Replies are plain JSON, never SSE: if an n8n version insists on `text/event-stream` it will fail (not tested with n8n). Stdio MCP and `/call` share `mcp_handle` / unchanged and were re-run.
`tools/call` blocks up to 90 s while the page answers (as before); concurrent calls use separate threads.

## 3. `--isolate` (COOP same-origin + COEP credentialless) on `--serve`
**Opt-in, not default.** The page embeds cross-origin iframes (`youtube-nocookie.com`, `openstreetmap.org`, found by scanning the build); a COEP page blocks an iframe whose document lacks COEP. Tested in Chrome: with `--isolate` an unrelated cross-origin iframe is blocked, without it loads. `credentialless` (not `require-corp`) keeps no-cors images/video working. With `--isolate`: `crossOriginIsolated=true`, `SharedArrayBuffer` available (multithreaded WASM Whisper). Use it on a session that needs wasm threads, not for normal work. Safari ignores `credentialless`.

## 4. `freeai.js` hook
New `faFetch(url,opts)` replaces the two provider fetches (`faPost` chat, `faList` models): direct first, exactly as before. On a network error of an https URL: if the bridge is connected (token in the Agent bridge pane) and `/ping` says `proxy:true` (cached 20 s, 1.5 s timeout), retry ONCE through `/proxy`; the host is remembered for the session (`FA.fx.px`). If the bridge is down, has no token, is old, or refuses (host not allowed, bad token): the original network error is thrown, with ` [bridge proxy: <reason>]` appended when the bridge answered. localhost providers (Ollama, LM Studio) and n8n/bridge calls are unchanged. Chat is still non-streaming; `FA.viaProxy(url,opts,true)` is there for a streaming UI later (tested reading SSE in Chrome). Exports: `FA.fetch`, `FA.viaProxy`, `FA.bridgeUp`, `FA.fx`.
Integration: copy `tox_bridge.py` to `site/tools/`, `freeai.js` to `incoming11/` (the build already does `rd('freeai.js')`), rebuild.

## Tests (all pass)
- `nice -n 15 python3 test_tox_bridge.py ../freeai_data.js`: 94 checks. Allow-list sync; auth (none, wrong, query string, Host, Origin); 22 URL refusals and that the fake provider received nothing from them; 16 IP classifications; allow-listed names resolving to 10.0.0.5 and 169.254.169.254 refused; mixed public+private DNS answer refused; header filtering (cookie not forwarded); 429 + rate-limit headers passthrough; key echo masked; redirect not followed and target never hit; 413/502/504 limits; SSE incremental (first event at 0.0 s, last at 1.2 s); `/mcp` (initialize, 202, list, call, local tool, round trip through a fake page, unknown tool/method, batch, auth, Host, GET 405, DELETE); `--isolate` headers; key absent from stdout/stderr/inbox.
- `NODE_PATH=../pw/node_modules nice -n 15 node freeai_proxy_test.js file://.../build/index.test.html`: 22 checks in one real Chrome, nothing mocked: blocked provider (DNS failure stands in for CORS) goes through the bridge, key arrives, `FA.chat` end to end, 429 headers readable, no token / wrong token / bridge down / host not allowed behave as written above, SSE read by the page, default vs `--isolate` in a browser.
- `pw/freeai_test.js` against `build/index.test.html` with the patched `freeai.js`: **88 passed, 0 failed** (`freeai_test_patched.log`).
- stdio MCP and `--http-only --serve --isolate` smoke-run by hand.

## NOT tested
- **No real provider**: real hosts, certificates, real SSE framing and whether any provider rejects requests coming from a non-browser client (User-Agent, missing `Origin`) are unverified. The fake provider speaks HTTPS with a test CA; production uses the system CA store.
- Which providers actually block CORS is unknown: the hook tries direct first, so it only helps when direct fails; a provider whose direct call returns a CORS error but a body is indistinguishable from "blocked" (fine, same retry).
- n8n's MCP Client Tool never connected (JSON-RPC checked by hand, per spec text from memory). Claude Code over HTTP MCP not tried.
- Test rig seams (`_resolve`, `UPSTREAM_PORT`, `_ssl_ctx`, `_is_public`) are patched in the tests; the real DNS/443/system-CA path ran only as far as refusals. The real `_is_public` was unit-tested separately.
- `--isolate`: Whisper WASM threads themselves not run; Firefox/Safari not tried; the real page was not loaded under `--isolate` (only a tiny page; the real page was loaded without it).
- Windows: `is_global` and sockets untested. Python: `test_tox_bridge.py` passes 94/94 on both 3.9.6 (the owner's bridge runs on 3.9) and 3.11; the Chrome test ran with 3.11.
- Not covered: HTTP/2 or keep-alive upstream (HTTP/1.1, one connection per call), proxy through a corporate HTTP proxy, IPv6-only hosts, `Content-Encoding` (identity forced).
- Auth model unchanged: anyone who knows the token (printed on start, also returned by `/boot` to the served page) can use the proxy for the allow-listed hosts with THEIR OWN key; the bridge adds no key of its own.
