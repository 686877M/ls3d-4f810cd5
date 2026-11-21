#!/usr/bin/env python3
"""T.O X bridge: lets an AI agent drive the open T.O X page.

Optional: --serve [folder] also serves the T.O X site at http://127.0.0.1:8766/ so the page runs in a secure
context (microphone and Web Speech work, wasm loads, no file:// limits) and connects by itself.

Optional: --whisper [base|small|large-v3-turbo] loads a local Whisper model (faster-whisper if installed, else openai-whisper)
and answers POST /v1/audio/transcriptions, so the page REC button can type Arabic speech with no internet.

Two doors, same tools:
  1. MCP over stdio   (Claude Code, Claude Desktop, any MCP client):
       claude mcp add tox -- python3 tools/tox_bridge.py
  2. Plain HTTP       (any other agent, script or workflow tool):
       python3 tools/tox_bridge.py --http-only
       curl -H "x-tox-token: TOKEN" -d '{"tool":"say","args":{"text":"ابني فيلا 12 في 10 دورين 5 غرف"}}' http://127.0.0.1:8766/call

The page connects OUT to this process (Bridge pane in T.O X, command "Connect an agent"), so nothing in the page
is exposed to the network. Listens on 127.0.0.1 only. A random token is printed on start (or set TOX_TOKEN);
the page and every HTTP call must present it. Standard library only.

Optional: --isolate adds COOP same-origin + COEP credentialless to the --serve pages, so crossOriginIsolated is true and
multithreaded WASM (SharedArrayBuffer, e.g. Whisper wasm threads) works. OFF by default: the page embeds cross-origin
iframes (YouTube, OpenStreetMap) that a COEP page blocks. Chrome/Edge/Firefox only (Safari ignores credentialless).

Also on the same port (token required, 127.0.0.1 only):
  POST /proxy  local CORS proxy for free-model providers (see "proxy" below). Body {url, method, headers, body, stream}.
  POST /mcp    MCP over streamable HTTP (JSON replies) with the same tools, for n8n's MCP Client Tool:
               URL http://127.0.0.1:8766/mcp  header  Authorization: Bearer TOKEN   (or x-tox-token: TOKEN)
"""
import http.client, ipaddress, json, mimetypes, os, queue, re, secrets, socket, ssl, sys, tempfile, threading, time, uuid
from email.parser import BytesParser
from email.policy import default as _mailpolicy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    import tox_photo             # "Photos to 3D": local NodeODM container + restricted /photo/* routes (tools/tox_photo.py)
except ImportError:
    tox_photo = None

PORT = int(os.environ.get("TOX_PORT", "8766"))
ROOT = None                    # set by --serve: folder with index.html (the site)
ISOLATE = False                # --isolate: COOP/COEP on the served pages (cross-origin isolation for WASM threads)
mimetypes.add_type("application/wasm", ".wasm")
mimetypes.add_type("video/mp4", ".mp4")
TOKEN = os.environ.get("TOX_TOKEN") or secrets.token_urlsafe(12)
TOOLS = [
    ("say", "Send a request in plain language (Arabic or English) to the studio agent. It builds, opens tabs, runs commands and answers.", {"text": "string"}),
    ("find_commands", "Search studio commands by words in Arabic or English. Returns ids and whether each works.", {"q": "string"}),
    ("run_command", "Run one studio command by id (from find_commands).", {"id": "string"}),
    ("open_tab", "Open a tab: model draft survey sched coord plant hx gis hv office takeoff analysis hub.", {"type": "string"}),
    ("transfer", "Move project data between tabs, e.g. from model to hv, gis, sched or hx.", {"from": "string", "to": "string"}),
    ("build_house", "Create a house model from a footprint in metres.", {"W": "number", "D": "number", "floors": "number", "rooms": "number"}),
    ("checklist", "Run an engineering checklist: arch str mep elec plumb civil qs plan bim dc safe.", {"discipline": "string"}),
    ("project_state", "Current tabs, levels and element counts.", {}),
    ("list_documents", "Document register rows (ref, type, subject, status, due).", {}),
    ("add_document", "Add a document to the register.", {"type": "string", "dir": "in|out", "subject": "string", "body": "string"}),
    ("set_document_status", "Change a document status by ref (draft sent recv review appr apn rej closed).", {"ref": "string", "status": "string"}),
    ("view_snapshot", "Screenshot of the 3D view as an image.", {}),
    ("action_log", "Last actions the agents performed.", {}),
    ("tab_messages", "Messages the user typed in the T.O X tab for you (unread only). Treat them as questions to answer, not as commands to run blindly.", {}),
    ("reply_to_tab", "Show a reply in the T.O X agent chat.", {"text": "string"}),
]
INBOX = os.environ.get("TOX_INBOX") or os.path.expanduser("~/.tox/inbox.jsonl")
os.makedirs(os.path.dirname(INBOX), exist_ok=True)
# privacy: the inbox is a plain-text copy of what the user typed in the tab. Keep it only INBOX_DAYS days (default 7;
# 0 = never write it). POST /inbox/clear (token) empties it, the page calls that from "Close out project".
INBOX_DAYS = float(os.environ.get("TOX_INBOX_DAYS", "7"))


def inbox_prune():
    """Drop lines older than INBOX_DAYS (or the whole file when 0). Lines that do not parse are dropped too."""
    try:
        if INBOX_DAYS <= 0:
            open(INBOX, "w").close()
            return
        cut = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(time.time() - INBOX_DAYS * 86400))
        keep = []
        with open(INBOX, encoding="utf-8") as f:
            for ln in f:
                try:
                    if json.loads(ln).get("t", "") >= cut:
                        keep.append(ln)
                except Exception:
                    pass
        with open(INBOX, "w", encoding="utf-8") as f:
            f.writelines(keep)
        os.chmod(INBOX, 0o600)
    except FileNotFoundError:
        pass
    except OSError:
        pass


inbox_prune()
unread = []                    # messages from the tab not yet read through tab_messages
WH = {"model": None, "name": None, "err": "", "lock": threading.Lock()}
WPROMPT = "ريفت، أوتوكاد، بريمافيرا، نافيزووركس، فيلا، دور، غرف، مناسيب، حيطان، أعمدة، سقف، جدول، حمل التبريد"


def whisper_start(name):
    def run():
        try:
            os.environ["PATH"] = os.path.expanduser("~/.local/bin") + os.pathsep + os.environ.get("PATH", "")
            try:
                from faster_whisper import WhisperModel
                nm = "small" if name == "auto" else name
                WH["model"] = ("fw", WhisperModel(nm, device="cpu", compute_type="int8"))
            except ImportError:
                import whisper
                nm = "base" if name == "auto" else name
                WH["model"] = ("ow", whisper.load_model(nm))
            WH["name"] = nm
            sys.stderr.write("Whisper %s ready (%s)\n" % (nm, WH["model"][0]))
        except Exception as e:  # noqa
            WH["err"] = str(e)
            sys.stderr.write("Whisper failed: %s\n" % e)
    threading.Thread(target=run, daemon=True).start()


def whisper_run(data, lang):
    if not WH["model"]:
        return {"error": "whisper not ready: " + (WH["err"] or "still loading")}
    kind, m = WH["model"]
    fd, path = tempfile.mkstemp(suffix=".webm")
    os.write(fd, data)
    os.close(fd)
    t0 = time.time()
    try:
        with WH["lock"]:
            if kind == "fw":
                segs, _ = m.transcribe(path, language=lang, beam_size=1, vad_filter=True, condition_on_previous_text=False, initial_prompt=WPROMPT)
                text = " ".join(s.text.strip() for s in segs)
            else:
                text = m.transcribe(path, language=lang, fp16=False, condition_on_previous_text=False, temperature=0, initial_prompt=WPROMPT)["text"]
        return {"text": text.strip(), "took": round(time.time() - t0, 2), "model": WH["name"]}
    except Exception as e:  # noqa
        return {"error": str(e)}
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


calls = queue.Queue()          # tool calls waiting for the page
pending = {}                   # id -> {"ev": Event, "res": ...}
last_poll = [0.0]


def local_tool(tool, args):
    if tool == "tab_messages":
        out = list(unread)
        del unread[:]
        return {"id": "local", "result": out}
    if tool == "reply_to_tab":
        calls.put({"id": uuid.uuid4().hex[:10], "tool": "__reply", "args": {"text": str((args or {}).get("text", ""))[:4000]}})
        return {"id": "local", "result": "queued"}
    return None


def call_page(tool, args, timeout=90):
    lt = local_tool(tool, args)
    if lt is not None:
        return lt
    cid = uuid.uuid4().hex[:10]
    slot = {"ev": threading.Event(), "res": None}
    pending[cid] = slot
    calls.put({"id": cid, "tool": tool, "args": args or {}})
    if not slot["ev"].wait(timeout):
        pending.pop(cid, None)
        return {"error": "timeout: is the T.O X page open and connected? (Bridge pane, token above)"}
    pending.pop(cid, None)
    return slot["res"]


def page_online():
    return time.time() - last_poll[0] < 40


# ---------------------------------------------------------------- /proxy (local CORS proxy for free-model providers)
# Allow-list = the provider hosts in freeai_data.js (exact host match, https, port 443). Extend with TOX_PROXY_HOSTS="a.com,b.com".
# The API key arrives in the request headers from the page, is used for that one upstream call and is never logged or stored.
PROXY_HOSTS = {h.strip().lower() for h in (
    "api.baichuan-ai.com api.cerebras.ai api.cloudflare.com api.cohere.ai api.deepseek.com api.groq.com "
    "api.hunyuan.cloud.tencent.com api.lingyiwanwu.com api.minimax.io api.mistral.ai api.moonshot.ai api.sambanova.ai "
    "api.siliconflow.com api.together.xyz api.z.ai ark.cn-beijing.volces.com dashscope-intl.aliyuncs.com "
    "generativelanguage.googleapis.com integrate.api.nvidia.com models.github.ai open.bigmodel.cn openrouter.ai "
    "router.huggingface.co").split()}
PROXY_HOSTS |= {h.strip().lower() for h in os.environ.get("TOX_PROXY_HOSTS", "").split(",") if h.strip()}
# only the OpenAI-compatible calls the page makes: .../models, .../models/<id>, .../chat/completions, .../completions, .../embeddings
PROXY_PATH = re.compile(r"^(/[A-Za-z0-9._~@:%-]+)*/(models(/[A-Za-z0-9._~@:%/-]+)?|chat/completions|completions|embeddings)$")
PROXY_REQ_HEADERS = {"authorization", "content-type", "accept", "x-api-key", "api-key", "x-goog-api-key", "anthropic-version",
                     "openai-organization", "http-referer", "x-title"}
PROXY_RESP_HEADERS = ("content-type", "retry-after", "x-request-id", "request-id", "date")   # plus x-ratelimit-* / ratelimit-*
PROXY_MAX_REQ = 2 * 1024 * 1024          # request body from the page
PROXY_MAX_RESP = 16 * 1024 * 1024        # response body (buffered or streamed)
PROXY_CONNECT_T, PROXY_IDLE_T, PROXY_TOTAL_T = 10, 60, 180
_ssl_ctx = ssl.create_default_context()  # tests may replace this with a context that trusts a fake CA
UPSTREAM_PORT = 443                      # tests only: the fake provider listens elsewhere


class ProxyErr(Exception):
    def __init__(self, code, msg):
        Exception.__init__(self, msg)
        self.code, self.msg = code, msg


def _resolve(host):
    """All addresses of host (module-level so tests can map a fake name to a local server)."""
    return sorted({ai[4][0] for ai in socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)})


def _is_public(ip):
    a = ipaddress.ip_address(ip)
    if a.version == 6 and a.ipv4_mapped:
        a = a.ipv4_mapped
    return a.is_global and not (a.is_multicast or a.is_loopback or a.is_private or a.is_link_local or a.is_reserved or a.is_unspecified)


def proxy_check_url(url):
    """Validate and return (host, path_with_query). Raises ProxyErr. No network access here."""
    if not isinstance(url, str) or len(url) > 2048 or any(c in url for c in "\r\n\t \\") or not url.isascii():
        raise ProxyErr(400, "bad url")
    u = urlparse(url)
    if u.scheme != "https":
        raise ProxyErr(403, "https only")
    if u.username or u.password or "@" in u.netloc:
        raise ProxyErr(403, "credentials in url not allowed")
    try:
        port = u.port
    except ValueError:
        raise ProxyErr(400, "bad port")
    if port not in (None, 443):
        raise ProxyErr(403, "port not allowed")
    host = (u.hostname or "").lower()
    if host not in PROXY_HOSTS:   # exact match: also rejects IP literals, trailing dot, sub/parent domains
        raise ProxyErr(403, "host not in the provider allow-list: " + host)
    if u.fragment or "%2e" in u.path.lower() or "%2f" in u.path.lower() or "/./" in u.path or "/../" in u.path or "//" in u.path or not PROXY_PATH.match(u.path):
        raise ProxyErr(403, "path not allowed (only .../models, .../chat/completions, .../completions, .../embeddings)")
    return host, u.path + ("?" + u.query if u.query else "")


class _PinnedHTTPS(http.client.HTTPSConnection):
    """Connects to an already vetted IP, but verifies the certificate and sends SNI for the real host name."""
    def __init__(self, host, ip, **kw):
        http.client.HTTPSConnection.__init__(self, host, 443, context=_ssl_ctx, **kw)
        self._ip = ip

    def connect(self):
        sock = socket.create_connection((self._ip, UPSTREAM_PORT), self.timeout)
        self.sock = self._context.wrap_socket(sock, server_hostname=self.host)


def proxy_open(host, path, method, headers, body):
    """Resolve, refuse non-public addresses, connect to the vetted address. Never follows redirects."""
    try:
        ips = _resolve(host)
    except OSError:
        raise ProxyErr(502, "cannot resolve " + host)
    if not ips or not all(_is_public(i) for i in ips):
        raise ProxyErr(403, "host resolves to a private or reserved address")
    last, c = None, None
    for ip in ips:          # only the CONNECT may fall back to the next address; once the request is sent it is never repeated
        c = _PinnedHTTPS(host, ip, timeout=PROXY_CONNECT_T)
        try:
            c.connect()
            break
        except (OSError, ssl.SSLError) as e:
            last = e
            c.close()
            c = None
    if c is None:
        raise ProxyErr(504 if isinstance(last, socket.timeout) else 502, "upstream connection failed: " + type(last).__name__)
    try:
        c.sock.settimeout(PROXY_IDLE_T)
        c.request(method, path, body=body, headers=headers)
        return c, c.getresponse()
    except socket.timeout:
        c.close()
        raise ProxyErr(504, "upstream timed out")
    except (OSError, ssl.SSLError, http.client.HTTPException) as e:
        c.close()
        raise ProxyErr(502, "upstream request failed: " + type(e).__name__)


def proxy_headers_in(h):
    out = {}
    for k, v in (h or {}).items():
        k = str(k).lower()
        if k in PROXY_REQ_HEADERS and isinstance(v, str) and len(v) < 4096 and not re.search(r"[\r\n\x00]", v):
            out[k] = v
    out["accept-encoding"] = "identity"
    out["user-agent"] = "tox-bridge-proxy/1"
    return out


def proxy_headers_out(resp):
    out = []
    for k, v in resp.getheaders():
        kl = k.lower()
        if kl in PROXY_RESP_HEADERS or kl.startswith("x-ratelimit-") or kl.startswith("ratelimit-"):
            out.append((k, v))
    return out


# ---------------------------------------------------------------- MCP (shared by stdio and HTTP)
def mcp_handle(m):
    """One JSON-RPC message -> response dict, or None for notifications."""
    mid, meth = m.get("id"), m.get("method")
    out = None
    if meth == "initialize":
        out = {"protocolVersion": m.get("params", {}).get("protocolVersion", "2024-11-05"), "capabilities": {"tools": {}}, "serverInfo": {"name": "tox", "version": "1"}}
    elif meth == "tools/list":
        out = {"tools": [{"name": n, "description": d, "inputSchema": schema(a)} for n, d, a in TOOLS]}
    elif meth == "tools/call":
        pr = m.get("params", {})
        if pr.get("name") not in [t[0] for t in TOOLS]:
            return {"jsonrpc": "2.0", "id": mid, "error": {"code": -32602, "message": "unknown tool"}} if mid is not None else None
        c, err = result_content(call_page(pr.get("name"), pr.get("arguments")))
        out = {"content": c, "isError": err}
    elif meth == "ping":
        out = {}
    if mid is None:
        return None
    resp = {"jsonrpc": "2.0", "id": mid}
    if out is None:
        resp["error"] = {"code": -32601, "message": "method not found"}
    else:
        resp["result"] = out
    return resp



class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, obj=None, extra=None):
        body = b"" if obj is None else json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type,x-tox-token,authorization,mcp-session-id,mcp-protocol-version,accept")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _auth(self):
        q = parse_qs(urlparse(self.path).query)
        t = self.headers.get("x-tox-token") or (q.get("t") or [""])[0]
        return secrets.compare_digest(t, TOKEN)

    def do_OPTIONS(self):
        self._send(204)

    def _local_only(self):
        """DNS-rebinding guard for /proxy and /mcp: Host must be loopback; a browser Origin must be loopback or null (file://)."""
        host = (self.headers.get("host") or "").rsplit(":", 1)[0].strip("[]").lower()
        if host not in ("127.0.0.1", "localhost", "::1"):
            return False
        o = self.headers.get("origin")
        if o and o != "null":
            oh = (urlparse(o).hostname or "").lower()
            if oh not in ("127.0.0.1", "localhost", "::1"):
                return False
        return True

    def _auth_header(self):
        """Token from x-tox-token or Authorization: Bearer (never from the query string)."""
        t = self.headers.get("x-tox-token") or (self.headers.get("authorization") or "").replace("Bearer ", "", 1)
        return secrets.compare_digest(t, TOKEN)

    def _body(self, limit):
        n = int(self.headers.get("content-length") or 0)
        if n < 0 or n > limit:
            return None
        return self.rfile.read(n)

    def _do_mcp(self):
        if not self._local_only():
            return self._send(403, {"error": "local only"})
        if not self._auth_header():
            return self._send(401, {"error": "bad token"})
        raw = self._body(4 * 1024 * 1024)
        try:
            m = json.loads(raw)
        except Exception:
            return self._send(400, {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "parse error"}})
        batch = isinstance(m, list)
        outs = [r for r in (mcp_handle(x) for x in (m if batch else [m]) if isinstance(x, dict)) if r is not None]
        if not outs:
            return self._send(202)          # only notifications / responses: accepted, no body
        hdr = {"Mcp-Session-Id": uuid.uuid4().hex} if (not batch and m.get("method") == "initialize") else {}
        self._send(200, outs if batch else outs[0], hdr)

    def _do_proxy(self):
        if not self._local_only():
            return self._perr(403, "local only")
        if not self._auth_header():       # header only; the page keeps the token out of URLs
            return self._perr(401, "bad token")
        raw = self._body(PROXY_MAX_REQ + 65536)
        if raw is None:
            self.close_connection = True
            return self._perr(413, "request too large")
        try:
            d = json.loads(raw)
            assert isinstance(d, dict)
        except Exception:
            return self._perr(400, "bad json")
        try:
            method = str(d.get("method") or "GET").upper()
            if method not in ("GET", "POST"):
                raise ProxyErr(405, "method not allowed")
            host, path = proxy_check_url(d.get("url"))
            body = d.get("body")
            if body is not None:
                if not isinstance(body, str) or method != "POST":
                    raise ProxyErr(400, "body must be a string and only for POST")
                body = body.encode("utf-8")
                if len(body) > PROXY_MAX_REQ:
                    raise ProxyErr(413, "request too large")
            hdrs = proxy_headers_in(d.get("headers"))
            conn, resp = proxy_open(host, path, method, hdrs, body)
        except ProxyErr as e:
            return self._perr(e.code, e.msg)
        stream = bool(d.get("stream"))
        t0 = time.time()
        key = hdrs.get("authorization", "")[7:] or hdrs.get("x-api-key") or hdrs.get("api-key") or hdrs.get("x-goog-api-key") or ""
        try:
            data = None
            if not stream:      # read everything first, so a failure can still become a clean error reply
                buf, total = [], 0
                try:
                    while True:
                        if time.time() - t0 > PROXY_TOTAL_T:
                            raise ProxyErr(504, "upstream too slow")
                        chunk = resp.read(65536)
                        if not chunk:
                            break
                        total += len(chunk)
                        if total > PROXY_MAX_RESP:
                            raise ProxyErr(502, "response too large")
                        buf.append(chunk)
                except (OSError, http.client.HTTPException):
                    raise ProxyErr(504, "upstream read failed or timed out")
                data = b"".join(buf)
                if len(key) >= 8:   # an upstream error page that echoes the key must not hand it back
                    data = data.replace(key.encode("utf-8", "ignore"), b"***")
            self.send_response(resp.status)
            for k, v in proxy_headers_out(resp):
                self.send_header(k, v)
            self.send_header("x-tox-proxy", "ok")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Expose-Headers", "*")
            if resp.status in (301, 302, 303, 307, 308):
                self.send_header("x-tox-proxy-note", "redirect not followed")
            if stream:
                self.send_header("Cache-Control", "no-cache")
                self.send_header("X-Accel-Buffering", "no")
                self.send_header("Connection", "close")
                self.close_connection = True
                self.end_headers()
                total = 0
                try:
                    while time.time() - t0 < PROXY_TOTAL_T and total < PROXY_MAX_RESP:
                        chunk = resp.read1(8192)
                        if not chunk:
                            break
                        total += len(chunk)
                        self.wfile.write(chunk)
                        self.wfile.flush()
                except (OSError, http.client.HTTPException):
                    pass            # upstream or browser went away mid-stream: just end it
            else:
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except ProxyErr as e:
            return self._perr(e.code, e.msg)
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True
        finally:
            conn.close()

    def _perr(self, code, msg):
        self._send(code, {"error": msg, "tox_proxy": True}, {"x-tox-proxy-error": "1", "Access-Control-Expose-Headers": "*"})

    def _static(self, p):
        rel = "index.html" if p in ("", "/") else p.lstrip("/")
        f = os.path.realpath(os.path.join(ROOT, rel))
        if not f.startswith(ROOT + os.sep) or any(s.startswith(".") for s in rel.split("/")) or not os.path.isfile(f):
            return self._send(404, {"error": "not found"})
        size = os.path.getsize(f)
        rng = self.headers.get("Range")
        a, b, code = 0, size - 1, 200
        if rng and rng.startswith("bytes="):
            s, _, e = rng[6:].partition("-")
            a = int(s) if s else max(0, size - int(e or 0))
            b = int(e) if (s and e) else size - 1
            b = min(b, size - 1)
            code = 206
        n = max(0, b - a + 1)
        self.send_response(code)
        self.send_header("Content-Type", mimetypes.guess_type(f)[0] or "application/octet-stream")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-cache")
        if ISOLATE:
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "credentialless")
        if code == 206:
            self.send_header("Content-Range", "bytes %d-%d/%d" % (a, b, size))
        self.send_header("Content-Length", str(n))
        self.end_headers()
        try:
            with open(f, "rb") as fh:
                fh.seek(a)
                left = n
                while left > 0:
                    chunk = fh.read(min(65536, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self):
        p = urlparse(self.path).path
        if p == "/boot":   # the page served by this process learns the token; refused for other sites
            if self.headers.get("sec-fetch-site", "") not in ("same-origin", "none") or not ROOT:
                return self._send(403, {"error": "same-origin only"})
            body = json.dumps({"token": TOKEN}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            return self.wfile.write(body)
        if p.startswith("/photo/") and tox_photo:
            return tox_photo.route(self, "GET")
        if p == "/mcp":     # no server-initiated stream: allowed by the streamable HTTP spec
            return self._send(405, {"error": "POST only"}, {"Allow": "POST"})
        if ROOT and p not in ("/ping", "/poll"):
            return self._static(p)
        if p == "/ping":
            return self._send(200, {"ok": True, "page": page_online(), "whisper": WH["name"], "proxy": True, "mcp": True, "photo": bool(tox_photo), "isolate": ISOLATE})
        if not self._auth():
            return self._send(401, {"error": "bad token"})
        if p == "/poll":
            last_poll[0] = time.time()
            try:
                return self._send(200, calls.get(timeout=20))
            except queue.Empty:
                return self._send(204)
        self._send(404, {"error": "unknown"})

    def do_DELETE(self):    # MCP session end: sessions are stateless here, so just acknowledge
        if urlparse(self.path).path == "/mcp":
            return self._send(200, {"ok": True}) if (self._local_only() and self._auth_header()) else self._send(401, {"error": "bad token"})
        self._send(404, {"error": "unknown"})

    def do_POST(self):
        pth = urlparse(self.path).path
        if pth == "/proxy":
            return self._do_proxy()
        if pth.startswith("/photo/") and tox_photo:
            return tox_photo.route(self, "POST")
        if pth == "/mcp":
            return self._do_mcp()
        if pth == "/v1/audio/transcriptions":   # OpenAI-compatible, used by the page's REC button
            tok = (self.headers.get("authorization") or "").replace("Bearer ", "") or self.headers.get("x-tox-token") or ""
            if not secrets.compare_digest(tok, TOKEN):
                return self._send(401, {"error": "bad token"})
            n = int(self.headers.get("content-length") or 0)
            if n > 40 * 1024 * 1024:
                return self._send(413, {"error": "too large"})
            body = self.rfile.read(n)
            try:
                msg = BytesParser(policy=_mailpolicy).parsebytes(b"Content-Type: " + (self.headers.get("content-type") or "").encode() + b"\r\n\r\n" + body)
                parts = {pt.get_param("name", header="content-disposition"): pt.get_payload(decode=True) for pt in msg.iter_parts()}
            except Exception:
                return self._send(400, {"error": "bad multipart"})
            lang = (parts.get("language") or b"ar").decode()[:5]
            r = whisper_run(parts.get("file") or b"", lang)
            return self._send(200 if "text" in r else 503, r)
        if not self._auth():
            return self._send(401, {"error": "bad token"})
        n = int(self.headers.get("content-length") or 0)
        try:
            d = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self._send(400, {"error": "bad json"})
        p = urlparse(self.path).path
        if p == "/result":
            s = pending.get(d.get("id"))
            if s:
                s["res"] = d
                s["ev"].set()
            return self._send(200, {"ok": True})
        if p == "/inbox/clear":      # privacy: wipe the on-disk copy and the unread queue (token required, like /inbox)
            n = len(unread)
            del unread[:]
            try:
                open(INBOX, "w").close()
            except OSError:
                pass
            return self._send(200, {"ok": True, "cleared": True, "unread": n})
        if p == "/inbox":
            m = {"t": time.strftime("%Y-%m-%dT%H:%M:%S"), "from": "tab", "text": str(d.get("text", ""))[:4000]}
            unread.append(m)
            if INBOX_DAYS > 0:
                fd = os.open(INBOX, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o600)
                with os.fdopen(fd, "a", encoding="utf-8") as f:
                    f.write(json.dumps(m, ensure_ascii=False) + "\n")
            return self._send(200, {"ok": True})
        if p == "/reply":
            calls.put({"id": uuid.uuid4().hex[:10], "tool": "__reply", "args": {"text": str(d.get("text", ""))[:4000]}})
            return self._send(200, {"ok": True})
        if p == "/call":
            if d.get("tool") not in [t[0] for t in TOOLS]:
                return self._send(400, {"error": "unknown tool"})
            return self._send(200, call_page(d["tool"], d.get("args")))
        self._send(404, {"error": "unknown"})


def serve():
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    sys.stderr.write("T.O X bridge on http://127.0.0.1:%d  token: %s\n" % (PORT, TOKEN))
    sys.stderr.flush()
    return srv


def schema(args):
    return {"type": "object", "properties": {k: {"type": "number" if v == "number" else "string", "description": v} for k, v in args.items()}}


def result_content(r):
    if r.get("error"):
        return [{"type": "text", "text": "error: " + str(r["error"])}], True
    v = r.get("result")
    if isinstance(v, dict) and v.get("__image"):
        return [{"type": "image", "data": v["__image"], "mimeType": v.get("mime", "image/jpeg")}], False
    return [{"type": "text", "text": v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)}], False


def mcp():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            m = json.loads(line)
        except Exception:
            continue
        resp = mcp_handle(m)
        if resp is not None:
            sys.stdout.write(json.dumps(resp, ensure_ascii=False) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    if "--whisper" in sys.argv:
        i = sys.argv.index("--whisper")
        whisper_start(sys.argv[i + 1] if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("--") else "auto")
    if "--isolate" in sys.argv:
        ISOLATE = True
    if "--serve" in sys.argv:
        i = sys.argv.index("--serve")
        d = sys.argv[i + 1] if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("--") else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
        ROOT = os.path.realpath(d)
        sys.argv.append("--http-only") if "--http-only" not in sys.argv else None
        sys.stderr.write("Serving %s at http://127.0.0.1:%d/ (secure context: microphone and speech work)\n" % (ROOT, PORT))
    serve()
    if "--http-only" in sys.argv:
        while True:
            time.sleep(3600)
    else:
        mcp()
