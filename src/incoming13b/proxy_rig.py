#!/usr/bin/env python3
"""Test rig for tox_bridge /proxy: a fake HTTPS "provider" (self-signed cert, name fake.provider.test) plus the real bridge
handler with the test seams patched (name -> 127.0.0.1, port, trusted CA). Production code paths are the real ones; only
DNS, port and CA trust are redirected. Run directly to leave a bridge up for the Chrome test: prints one JSON line."""
import http.server, json, os, ssl, subprocess, sys, tempfile, threading, time
os.environ.setdefault("TOX_INBOX", os.path.join(tempfile.mkdtemp(), "inbox.jsonl"))
os.environ["TOX_TOKEN"] = "rig-token-123"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tox_bridge as B

FAKE = "fake.provider.test"
SEEN = []   # (method, path, headers dict) of every request the fake provider received


class Fake(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def log_message(self, *a): pass
    def _reply(self, code, obj, extra=None, raw=None):
        b = raw if raw is not None else json.dumps(obj).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(b)))
        for k, v in (extra or {}).items(): self.send_header(k, v)
        self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        SEEN.append(("GET", self.path, dict(self.headers)))
        if self.path.startswith("/v1/models"):
            return self._reply(200, {"data": [{"id": "fake-1"}, {"id": "fake-free:free", "pricing": {"prompt": "0", "completion": "0"}}]})
        self._reply(404, {"error": "nf"})
    def do_POST(self):
        n = int(self.headers.get("content-length") or 0); body = self.rfile.read(n).decode()
        SEEN.append(("POST", self.path, dict(self.headers)))
        try: mode = json.loads(body).get("mode", "ok")
        except Exception: mode = "ok"
        auth = self.headers.get("authorization", "")
        if mode == "ok":
            return self._reply(200, {"choices": [{"message": {"role": "assistant", "content": "hi from fake"}}], "seen_auth": __import__("hashlib").sha256(auth.encode()).hexdigest(),
                                     "seen_cookie": self.headers.get("cookie"), "seen_evil": self.headers.get("x-evil"), "len": n})
        if mode == "401":   # error page that echoes the key
            return self._reply(401, {"error": {"message": "bad key " + auth[7:]}})
        if mode == "429":
            return self._reply(429, {"error": {"message": "slow down"}}, {"Retry-After": "7", "x-ratelimit-remaining-requests": "0", "Set-Cookie": "a=b", "X-Secret": "no"})
        if mode == "redirect":
            return self._reply(302, {}, {"Location": "https://127.0.0.1:%d/v1/models?hit=redirect" % self.server.server_port})
        if mode == "big":
            return self._reply(200, None, raw=b"x" * 5000)
        if mode == "slow":
            time.sleep(3); return self._reply(200, {"late": True})
        if mode == "sse":
            self.send_response(200); self.send_header("Content-Type", "text/event-stream"); self.send_header("Transfer-Encoding", "chunked"); self.end_headers()
            for i in range(4):
                data = ("data: " + json.dumps({"i": i}) + "\n\n").encode()
                self.wfile.write(b"%x\r\n" % len(data) + data + b"\r\n"); self.wfile.flush(); time.sleep(0.4)
            self.wfile.write(b"0\r\n\r\n"); self.wfile.flush(); return
        self._reply(400, {"error": "mode"})


def make_cert(d):
    k, c = os.path.join(d, "k.pem"), os.path.join(d, "c.pem")
    subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", k, "-out", c, "-days", "2", "-subj", "/CN=" + FAKE,
                    "-addext", "subjectAltName=DNS:" + FAKE], check=True, capture_output=True)
    return k, c


def start(patch_public=True):
    d = tempfile.mkdtemp(); k, c = make_cert(d)
    fk = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Fake)
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER); ctx.load_cert_chain(c, k); fk.socket = ctx.wrap_socket(fk.socket, server_side=True)
    threading.Thread(target=fk.serve_forever, daemon=True).start()
    B.PROXY_HOSTS.add(FAKE); B.PROXY_HOSTS.add("priv.provider.test"); B.PROXY_HOSTS.add("meta.provider.test")
    B.UPSTREAM_PORT = fk.server_port
    B._ssl_ctx = ssl.create_default_context(cafile=c)
    real_public, real_resolve = B._is_public, B._resolve
    B._resolve = lambda h: {FAKE: ["127.0.0.1"], "priv.provider.test": ["10.0.0.5"], "meta.provider.test": ["169.254.169.254"]}.get(h) or real_resolve(h)
    if patch_public:   # ONLY the fake provider's loopback address counts as public in the rig; everything else uses the real check
        B._is_public = lambda ip: ip == "127.0.0.1" or real_public(ip)
    br = B.ThreadingHTTPServer(("127.0.0.1", 0), B.H)
    threading.Thread(target=br.serve_forever, daemon=True).start()
    return {"bridge": br, "fake": fk, "port": br.server_port, "fport": fk.server_port, "real_public": real_public}


if __name__ == "__main__":
    r = start()
    print(json.dumps({"port": r["port"], "token": B.TOKEN, "fake_host": FAKE}), flush=True)
    while True: time.sleep(3600)
