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
"""
import json, mimetypes, os, queue, secrets, sys, tempfile, threading, time, uuid
from email.parser import BytesParser
from email.policy import default as _mailpolicy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("TOX_PORT", "8766"))
ROOT = None                    # set by --serve: folder with index.html (the site)
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


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, obj=None):
        body = b"" if obj is None else json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type,x-tox-token")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
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
        if ROOT and p not in ("/ping", "/poll"):
            return self._static(p)
        if p == "/ping":
            return self._send(200, {"ok": True, "page": page_online(), "whisper": WH["name"]})
        if not self._auth():
            return self._send(401, {"error": "bad token"})
        if p == "/poll":
            last_poll[0] = time.time()
            try:
                return self._send(200, calls.get(timeout=20))
            except queue.Empty:
                return self._send(204)
        self._send(404, {"error": "unknown"})

    def do_POST(self):
        pth = urlparse(self.path).path
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
        if p == "/inbox":
            m = {"t": time.strftime("%Y-%m-%dT%H:%M:%S"), "from": "tab", "text": str(d.get("text", ""))[:4000]}
            unread.append(m)
            with open(INBOX, "a", encoding="utf-8") as f:
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
        mid, meth = m.get("id"), m.get("method")
        out = None
        if meth == "initialize":
            out = {"protocolVersion": m.get("params", {}).get("protocolVersion", "2024-11-05"), "capabilities": {"tools": {}}, "serverInfo": {"name": "tox", "version": "1"}}
        elif meth == "tools/list":
            out = {"tools": [{"name": n, "description": d, "inputSchema": schema(a)} for n, d, a in TOOLS]}
        elif meth == "tools/call":
            pr = m.get("params", {})
            c, err = result_content(call_page(pr.get("name"), pr.get("arguments")))
            out = {"content": c, "isError": err}
        elif meth == "ping":
            out = {}
        if mid is not None:
            resp = {"jsonrpc": "2.0", "id": mid}
            if out is None:
                resp["error"] = {"code": -32601, "message": "method not found"}
            else:
                resp["result"] = out
            sys.stdout.write(json.dumps(resp, ensure_ascii=False) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    if "--whisper" in sys.argv:
        i = sys.argv.index("--whisper")
        whisper_start(sys.argv[i + 1] if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("--") else "auto")
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
