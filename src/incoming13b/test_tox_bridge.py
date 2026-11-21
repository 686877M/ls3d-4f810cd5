#!/usr/bin/env python3
"""Tests for /proxy, /mcp and --isolate in tox_bridge.py (fake HTTPS provider, no real provider, no browser).
Run: nice -n 15 python3 test_tox_bridge.py [path to freeai_data.js]"""
import http.client, io, json, os, re, sys, tempfile, threading, time, contextlib
import proxy_rig as R
B = R.B
KEY = "gsk_TEST_ONLY_not_a_real_key_123456"
ok_n = fail_n = 0
def ok(c, m):
    global ok_n, fail_n
    if c: ok_n += 1; print("  ok   " + m)
    else: fail_n += 1; print("  FAIL " + m)

errcap = io.StringIO(); outcap = io.StringIO()   # nothing the bridge prints may contain the key
rig = None
with contextlib.redirect_stderr(errcap), contextlib.redirect_stdout(outcap):
    rig = R.start()
PORT, TOK = rig["port"], B.TOKEN
FBASE = "https://%s/v1" % R.FAKE

def req(method, path, body=None, headers=None, raw=None, host=None):
    c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=15)
    h = dict(headers or {})
    data = raw if raw is not None else (json.dumps(body) if body is not None else None)
    c.putrequest(method, path, skip_host=bool(host)); 
    if host: c.putheader("Host", host)
    for k, v in h.items(): c.putheader(k, v)
    if data is not None: c.putheader("Content-Length", str(len(data.encode() if isinstance(data, str) else data)))
    c.endheaders(data.encode() if isinstance(data, str) else data)
    r = c.getresponse(); b = r.read(); hd = {k.lower(): v for k, v in r.getheaders()}; c.close()
    try: j = json.loads(b)
    except Exception: j = None
    return r.status, hd, b, j

def px(url, method="POST", headers=None, body=None, stream=False, token=TOK, **kw):
    d = {"url": url, "method": method, "headers": headers if headers is not None else {"authorization": "Bearer " + KEY, "content-type": "application/json"},
         "stream": stream}
    if body is not None: d["body"] = body if isinstance(body, str) else json.dumps(body)
    h = {"content-type": "application/json"}
    if token is not None: h["x-tox-token"] = token
    return req("POST", "/proxy", d, h, **kw)

print("== sync with freeai_data.js")
fd = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "freeai_data.js")
if os.path.exists(fd):
    from urllib.parse import urlparse
    hosts = {urlparse(b).hostname for b in re.findall(r"base:'(https://[^']+)'", open(fd, encoding="utf-8").read())}
    base_hosts = set(B.PROXY_HOSTS) - {R.FAKE, "priv.provider.test", "meta.provider.test"}
    ok(hosts == base_hosts, "allow-list == https hosts in freeai_data.js (%d) diff=%s" % (len(hosts), sorted(hosts ^ base_hosts)))
else:
    print("  skip (no freeai_data.js)")

print("== auth")
s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "ok"}, token=None)
ok(s == 401, "no token -> 401")
s, *_ = px(FBASE + "/chat/completions", body={"mode": "ok"}, token="wrong")
ok(s == 401, "wrong token -> 401")
s, *_ = req("POST", "/proxy?t=" + TOK, {"url": FBASE + "/models", "method": "GET"}, {"content-type": "application/json"})
ok(s == 401, "token in the query string is NOT accepted on /proxy")
s, h, b, j = req("POST", "/proxy", {"url": FBASE + "/models", "method": "GET"}, {"x-tox-token": TOK}, host="evil.example:80")
ok(s == 403, "Host header not loopback (DNS rebinding) -> 403")
s, *_ = req("POST", "/proxy", {"url": FBASE + "/models", "method": "GET"}, {"x-tox-token": TOK, "Origin": "https://evil.example"})
ok(s == 403, "browser Origin of another site -> 403")
s, *_ = req("POST", "/proxy", {"url": FBASE + "/models", "method": "GET"}, {"x-tox-token": TOK, "Origin": "null"})
ok(s == 200, "Origin null (page opened from file://) is allowed with the token")
s, *_ = req("POST", "/proxy", {"url": FBASE + "/models", "method": "GET"}, {"x-tox-token": TOK, "Origin": "http://127.0.0.1:8766"})
ok(s == 200, "loopback Origin allowed with the token")

print("== allow-list / url rules (all refused before any network call)")
n0 = len(R.SEEN)
for u, why in [("https://api.evil.com/v1/chat/completions", "unknown host"),
               ("https://api.groq.com.evil.com/openai/v1/chat/completions", "allowed name as prefix of another domain"),
               ("https://evil.com/api.groq.com/v1/chat/completions", "allowed name in the path"),
               ("https://x.api.groq.com/openai/v1/chat/completions", "subdomain of an allowed host"),
               ("https://api.groq.com./openai/v1/chat/completions", "trailing dot"),
               ("https://127.0.0.1/v1/chat/completions", "IPv4 literal"),
               ("https://[::1]/v1/chat/completions", "IPv6 literal"),
               ("https://localhost/v1/models", "localhost"),
               ("https://169.254.169.254/v1/models", "cloud metadata IP"),
               ("https://api.groq.com@evil.com/openai/v1/models", "userinfo trick"),
               ("https://user:pw@api.groq.com/openai/v1/models", "userinfo"),
               ("http://api.groq.com/openai/v1/chat/completions", "plain http"),
               ("ftp://api.groq.com/openai/v1/models", "other scheme"),
               ("https://api.groq.com:8443/openai/v1/models", "other port"),
               ("https://api.groq.com/openai/v1/files", "path outside the OpenAI-compatible calls"),
               ("https://api.groq.com/openai/v1/../../admin/models", "dot-dot path"),
               ("https://api.groq.com/openai/v1/%2e%2e/x/models", "encoded dot-dot"),
               ("https://api.groq.com/openai/v1/models#x", "fragment"),
               ("https://api.groq.com\\@evil.com/models", "backslash"),
               ("//api.groq.com/openai/v1/models", "no scheme"),
               ("", "empty"), (None, "missing")]:
    s, h, b, j = px(u, "GET", {})
    ok(s in (400, 403) and h.get("x-tox-proxy-error") == "1", "refused (%s): %s -> %s" % (why, u, s))
ok(len(R.SEEN) == n0, "fake provider received nothing from the refused calls")
s, *_ = px("https://api.groq.com/openai/v1/models", "GET", token=TOK) if False else (None,)
s, h, b, j = px(FBASE + "/chat/completions", "PUT", body="{}")
ok(s == 405, "PUT -> 405")
s, h, b, j = px(FBASE + "/models", "GET", body="x")
ok(s == 400, "body on GET -> 400")
s, *_ = req("POST", "/proxy", raw="not json", headers={"x-tox-token": TOK})
ok(s == 400, "non-JSON body -> 400")

print("== private / reserved addresses")
real = rig["real_public"]
for ip, exp in [("127.0.0.1", False), ("127.5.5.5", False), ("10.0.0.5", False), ("172.16.0.1", False), ("192.168.1.1", False), ("169.254.169.254", False),
                ("100.64.0.1", False), ("0.0.0.0", False), ("::1", False), ("fe80::1", False), ("fc00::1", False), ("::ffff:127.0.0.1", False),
                ("::ffff:10.0.0.1", False), ("224.0.0.1", False), ("8.8.8.8", True), ("2606:4700::1111", True)]:
    ok(real(ip) is exp, "_is_public(%s) is %s" % (ip, exp))
s, h, b, j = px("https://priv.provider.test/v1/models", "GET", {})
ok(s == 403 and "private" in (j or {}).get("error", ""), "allow-listed name that resolves to 10.0.0.5 -> 403")
s, h, b, j = px("https://meta.provider.test/v1/models", "GET", {})
ok(s == 403, "allow-listed name that resolves to 169.254.169.254 -> 403")
ok(len(R.SEEN) == n0, "still nothing reached the fake provider")
orig = B._resolve; B._resolve = lambda h: ["93.184.216.34", "10.0.0.5"]
s, h, b, j = px("https://api.groq.com/openai/v1/models", "GET", {})
B._resolve = orig
ok(s == 403, "DNS answer mixing a public and a private address -> 403 (all must be public)")

print("== normal call, headers, key handling")
s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "ok"},
                headers={"authorization": "Bearer " + KEY, "content-type": "application/json", "cookie": "sid=1", "x-evil": "1", "host": "evil.com", "accept": "application/json"})
ok(s == 200 and j["choices"][0]["message"]["content"] == "hi from fake", "POST goes through and the reply comes back (status %s)" % s)
ok(j["seen_auth"] == __import__("hashlib").sha256(("Bearer " + KEY).encode()).hexdigest(), "key from the page reaches the provider in Authorization")
ok(j["seen_cookie"] is None and j["seen_evil"] is None, "cookie and unknown headers are NOT forwarded")
ok(h.get("x-tox-proxy") == "ok" and h.get("access-control-allow-origin") == "*", "success reply is marked x-tox-proxy: ok and has CORS")
ok(R.SEEN[-1][2].get("Host", "").startswith(R.FAKE) and R.SEEN[-1][2].get("user-agent") == "tox-bridge-proxy/1", "Host is the provider's, not the page's")
s, h, b, j = px(FBASE + "/models", "GET", {"authorization": "Bearer " + KEY})
ok(s == 200 and j["data"][1]["pricing"]["prompt"] == "0", "GET /models works")
s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "429"})
ok(s == 429 and h.get("retry-after") == "7" and h.get("x-ratelimit-remaining-requests") == "0", "upstream 429 passes status, retry-after and x-ratelimit-* through")
ok("set-cookie" not in h and "x-secret" not in h, "other upstream headers (Set-Cookie...) are dropped")
s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "401"})
ok(s == 401 and KEY not in b.decode() and "***" in b.decode() and h.get("x-tox-proxy") == "ok", "upstream 401 passes through; a key echoed in its body is masked")
ok(h.get("x-tox-proxy-error") is None, "an upstream 401 is distinguishable from a proxy refusal (no x-tox-proxy-error)")

print("== redirect")
n1 = len(R.SEEN)
s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "redirect"})
time.sleep(0.3)
ok(s == 302 and "location" not in h and h.get("x-tox-proxy-note") == "redirect not followed", "302 returned as-is, Location header dropped")
ok(len(R.SEEN) == n1 + 1 and not any("hit=redirect" in p for _, p, _ in R.SEEN), "redirect target was never requested")

print("== limits")
B.PROXY_MAX_REQ = 1000
s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "ok", "pad": "x" * 2000})
ok(s == 413, "request body over the limit -> 413")
s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "ok", "pad": "x" * 200000})
ok(s == 413, "far over the limit -> 413 (not read)")
B.PROXY_MAX_REQ = 2 * 1024 * 1024
B.PROXY_MAX_RESP = 1000
s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "big"})
ok(s == 502 and "large" in (j or {}).get("error", ""), "response over the limit -> 502")
B.PROXY_MAX_RESP = 16 * 1024 * 1024
B.PROXY_IDLE_T = 1
t0 = time.time(); s, h, b, j = px(FBASE + "/chat/completions", body={"mode": "slow"}); dt = time.time() - t0
B.PROXY_IDLE_T = 60
ok(s == 504 and dt < 2.5, "slow upstream -> 504 after the idle limit (%.1fs)" % dt)

print("== streaming (SSE)")
c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=15)
c.request("POST", "/proxy", json.dumps({"url": FBASE + "/chat/completions", "method": "POST", "stream": True, "body": json.dumps({"mode": "sse"}),
          "headers": {"authorization": "Bearer " + KEY, "content-type": "application/json"}}), {"x-tox-token": TOK, "content-type": "application/json"})
r = c.getresponse(); t0 = time.time(); stamps, got = [], b""
while True:
    ch = r.read1(4096)
    if not ch: break
    stamps.append(time.time() - t0); got += ch
c.close()
ev = [json.loads(x[6:]) for x in got.decode().split("\n\n") if x.startswith("data: ")]
ok(r.status == 200 and r.getheader("content-type") == "text/event-stream" and [e["i"] for e in ev] == [0, 1, 2, 3], "SSE events all arrive in order, content-type kept")
ok(stamps[0] < 0.35 and stamps[-1] > 1.0, "events are relayed as they arrive (first at %.2fs, last at %.2fs), not buffered" % (stamps[0], stamps[-1]))

print("== /mcp (MCP over streamable HTTP)")
def rpc(msg, auth="bearer", **kw):
    h = {"content-type": "application/json", "accept": "application/json, text/event-stream"}
    if auth == "bearer": h["authorization"] = "Bearer " + TOK
    elif auth == "tox": h["x-tox-token"] = TOK
    return req("POST", "/mcp", msg, h, **kw)
s, h, b, j = rpc({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": {"name": "n8n", "version": "1"}}})
ok(s == 200 and j["result"]["protocolVersion"] == "2025-03-26" and j["result"]["serverInfo"]["name"] == "tox" and h.get("mcp-session-id"), "initialize: version echoed, session id header")
s, h, b, j = rpc({"jsonrpc": "2.0", "method": "notifications/initialized"})
ok(s == 202 and b == b"", "notifications/initialized -> 202, empty body")
s, h, b, j = rpc({"jsonrpc": "2.0", "id": 2, "method": "tools/list"}, auth="tox")
names = [t["name"] for t in j["result"]["tools"]]
ok(s == 200 and names == [t[0] for t in B.TOOLS] and len(names) == 15, "tools/list returns the 15 bridge tools (x-tox-token also accepted)")
ok(all(t["inputSchema"]["type"] == "object" for t in j["result"]["tools"]), "each tool has an inputSchema")
s, h, b, j = rpc({"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "tab_messages", "arguments": {}}})
ok(s == 200 and j["result"]["isError"] is False and j["result"]["content"][0]["type"] == "text", "tools/call tab_messages (local tool)")
s, h, b, j = rpc({"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "rm_rf", "arguments": {}}})
ok(j.get("error", {}).get("code") == -32602, "unknown tool -> JSON-RPC error, no 90 s wait")
s, h, b, j = rpc({"jsonrpc": "2.0", "id": 5, "method": "nope"})
ok(j["error"]["code"] == -32601, "unknown method -> -32601")
s, h, b, j = rpc([{"jsonrpc": "2.0", "id": 6, "method": "ping"}, {"jsonrpc": "2.0", "method": "notifications/x"}, {"jsonrpc": "2.0", "id": 7, "method": "tools/list"}])
ok(s == 200 and [x["id"] for x in j] == [6, 7], "batch: notifications get no answer")
# a fake page: poll the bridge and answer one call, to prove tools/call reaches the page and comes back
def fake_page():
    c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=30)
    c.request("GET", "/poll", headers={"x-tox-token": TOK}); r = c.getresponse(); call = json.loads(r.read()); c.close()
    c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=30)
    c.request("POST", "/result", json.dumps({"id": call["id"], "result": {"tabs": ["model"], "tool": call["tool"]}}), {"x-tox-token": TOK, "content-type": "application/json"}); c.getresponse().read(); c.close()
th = threading.Thread(target=fake_page); th.start()
s, h, b, j = rpc({"jsonrpc": "2.0", "id": 8, "method": "tools/call", "params": {"name": "project_state", "arguments": {}}}); th.join()
ok(s == 200 and json.loads(j["result"]["content"][0]["text"]) == {"tabs": ["model"], "tool": "project_state"}, "tools/call project_state round-trips through the page")
s, *_ = rpc({"jsonrpc": "2.0", "id": 9, "method": "tools/list"}, auth=None)
ok(s == 401, "/mcp without token -> 401")
s, *_ = req("POST", "/mcp?t=" + TOK, {"jsonrpc": "2.0", "id": 9, "method": "tools/list"}, {"content-type": "application/json"})
ok(s == 401, "/mcp token in the query string -> 401")
s, *_ = rpc({"jsonrpc": "2.0", "id": 9, "method": "tools/list"}, host="evil.example")
ok(s == 403, "/mcp with a non-loopback Host -> 403")
s, *_ = req("GET", "/mcp", headers={"authorization": "Bearer " + TOK})
ok(s == 405, "GET /mcp -> 405 (no server stream)")
s, *_ = req("DELETE", "/mcp", headers={"authorization": "Bearer " + TOK})
ok(s == 200, "DELETE /mcp (end session) -> 200")
s, h, b, j = req("GET", "/ping")
ok(j.get("proxy") is True and j.get("mcp") is True and j.get("isolate") is False, "/ping advertises proxy and mcp")
ok(req("POST", "/call", {"tool": "tab_messages"}, {"x-tox-token": TOK})[0] == 200, "old /call route unchanged")

print("== --serve and --isolate headers")
tmp = tempfile.mkdtemp(); open(os.path.join(tmp, "index.html"), "w").write("<!doctype html><title>x</title>")
B.ROOT = os.path.realpath(tmp)
s, h, b, j = req("GET", "/")
ok(s == 200 and "cross-origin-opener-policy" not in h and "cross-origin-embedder-policy" not in h, "default: no COOP/COEP (embedded YouTube/OSM iframes keep working)")
B.ISOLATE = True
s, h, b, j = req("GET", "/")
ok(h.get("cross-origin-opener-policy") == "same-origin" and h.get("cross-origin-embedder-policy") == "credentialless", "--isolate: COOP same-origin + COEP credentialless")
s, h, b, j = req("GET", "/ping")
ok(j.get("isolate") is True, "/ping reports isolate:true")
B.ISOLATE = False; B.ROOT = None

print("== nothing logged")
ok(KEY not in errcap.getvalue() and KEY not in outcap.getvalue(), "key not in bridge stdout/stderr")
ok(not os.path.exists(B.INBOX) or KEY not in open(B.INBOX).read(), "key not in the inbox file")
src = open(B.__file__, encoding="utf-8").read()
ok(not re.search(r"(print|sys\.std(err|out)\.write|logging\.)[^\n]*(hdrs|headers|key)", src.split("# ----------------------------------------------------------------")[1]), "proxy code has no print/log call that mentions headers or key")

print("\n%d passed, %d failed" % (ok_n, fail_n))
sys.exit(1 if fail_n else 0)
