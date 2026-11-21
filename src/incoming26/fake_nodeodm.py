#!/usr/bin/env python3
"""Fake NodeODM for tests: the same REST paths as NodeODM 2.x, tiny canned results (ph_fixtures.py). Listens on 127.0.0.1 only.
Usage: python3 fake_nodeodm.py PORT      GET /__log shows what it received (tests only).  FAKE_FAIL=1 makes every task fail at 50 %."""
import json, os, re, sys, threading, time, uuid
from email.parser import BytesParser
from email.policy import default as pol
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote_plus
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ph_fixtures as F

TASKS, LOG, LOCK = {}, [], threading.Lock()
OPTS = ["fast-orthophoto", "dsm", "dtm", "mesh-octree-depth", "feature-quality", "pc-quality", "orthophoto-resolution", "dem-resolution", "3d-tiles", "pc-las", "gltf"]
CODES = {"queued": 10, "running": 20, "failed": 30, "done": 40, "canceled": 50}
ASSETS = lambda: {"dsm.tif": F.dsm_tiff(3), "dtm.tif": F.dsm_tiff(1), "orthophoto.tif": F.ortho_tiff(), "textured_model.zip": F.model_zip(), "all.zip": F.model_zip(True),
                  "georeferenced_model.las": F.las(), "georeferenced_model.laz": b"LAZ-not-real", "cameras.json": b"{}"}


def parts(body, ctype):
    m = BytesParser(policy=pol).parsebytes(b"Content-Type: " + ctype.encode() + b"\r\n\r\n" + body)
    out = []
    for p in m.iter_parts():
        out.append((p.get_param("name", header="content-disposition"), p.get_filename(), p.get_payload(decode=True) or b""))
    return out


class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def send(self, code, obj=None, raw=None, ct="application/json"):
        b = raw if raw is not None else json.dumps(obj).encode()
        self.send_response(code); self.send_header("Content-Type", ct); self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)

    def body(self):
        return self.rfile.read(int(self.headers.get("content-length") or 0))

    def do_GET(self):
        u = urlparse(self.path); p = u.path
        with LOCK: LOG.append(["GET", self.path, self.headers.get("host"), self.headers.get("x-tox-token")])
        if p == "/__log": return self.send(200, LOG)
        if p == "/__tasks": return self.send(200, {k: {"name": v["name"], "images": v["images"], "bytes": v["bytes"], "files": v["files"]} for k, v in TASKS.items()})
        if p == "/info": return self.send(200, {"version": "3.6.2-fake", "taskQueueCount": len([t for t in TASKS.values() if t["state"] in ("queued", "running")]), "totalMemory": 17179869184, "availableMemory": 12e9, "cpuCores": 8, "maxImages": None, "engine": "odm", "engineVersion": "fake"})
        if p == "/options": return self.send(200, [{"name": n, "type": "bool", "value": "false", "domain": "", "help": ""} for n in OPTS])
        if p == "/task/list": return self.send(200, [{"uuid": k} for k in TASKS])
        m = re.match(r"^/task/([0-9a-f-]{36})/(info|output|download/(.+))$", p)
        if not m or m.group(1) not in TASKS: return self.send(404, {"error": "Invalid uuid"})
        t = TASKS[m.group(1)]
        if m.group(2) == "info":
            off = int((parse_qs(u.query).get("with_output") or ["-1"])[0])
            if t["state"] in ("queued", "running"):               # every poll moves the fake job on
                t["polls"] += 1
                if t["polls"] == 1: t["state"] = "running"
                t["progress"] = min(100, t["polls"] * 25)
                t["lines"].append("[INFO] fake step %d (%d %%)" % (t["polls"], t["progress"]))
                if os.environ.get("FAKE_FAIL") and t["progress"] >= 50: t["state"] = "failed"; t["lines"].append("[ERROR] fake failure: not enough memory")
                elif t["progress"] >= 100: t["state"] = "done"
            r = {"uuid": t["uuid"], "name": t["name"], "dateCreated": 0, "processingTime": t["polls"] * 4000, "status": {"code": CODES[t["state"]]}, "options": t["options"], "imagesCount": t["images"], "progress": t["progress"]}
            if off >= 0: r["output"] = t["lines"][off:]
            return self.send(200, r)
        if m.group(2) == "output": return self.send(200, t["lines"])
        a = m.group(3)
        if t["state"] != "done" or a not in ASSETS(): return self.send(404, {"error": "asset not available"})
        raw = ASSETS()[a]
        self.send_response(200); self.send_header("Content-Type", "application/zip" if a.endswith("zip") else "application/octet-stream"); self.send_header("Content-Length", str(len(raw))); self.end_headers(); self.wfile.write(raw)

    def do_POST(self):
        p = urlparse(self.path).path; ct = self.headers.get("content-type") or ""
        b = self.body()
        with LOCK: LOG.append(["POST", self.path, len(b), ct[:40]])
        if p == "/task/new/init":
            f = {n: (v or b"").decode("utf-8", "replace") if fn is None else v for n, fn, v in parts(b, ct)}
            opts = json.loads(f.get("options") or "[]")
            bad = [o["name"] for o in opts if o["name"] not in OPTS]
            if bad: return self.send(400, {"error": "Invalid options: " + ",".join(bad)})
            u = str(uuid.uuid4()); TASKS[u] = {"uuid": u, "name": f.get("name", "task"), "options": opts, "state": "new", "polls": 0, "progress": 0, "lines": [], "images": 0, "bytes": 0, "files": []}
            return self.send(200, {"uuid": u})
        m = re.match(r"^/task/new/(upload|commit)/([0-9a-f-]{36})$", p)
        if m:
            t = TASKS.get(m.group(2))
            if not t: return self.send(404, {"error": "Invalid uuid"})
            if m.group(1) == "upload":
                for n, fn, v in parts(b, ct):
                    if n == "images": t["images"] += 1; t["bytes"] += len(v); t["files"].append([fn, len(v)])
                return self.send(200, {"success": True})
            if t["images"] < 1: return self.send(200, {"error": "Need at least 1 file."})
            t["state"] = "queued"; return self.send(200, {"uuid": t["uuid"]})
        if p in ("/task/cancel", "/task/remove", "/task/restart"):
            raw = b.decode("utf-8", "replace")
            mm = re.search(r"([0-9a-f]{8}-[0-9a-f-]{27})", raw)
            u = mm.group(1) if mm else ""
            if u not in TASKS: return self.send(200, {"error": "Invalid uuid"})
            if p.endswith("cancel"): TASKS[u]["state"] = "canceled"
            if p.endswith("remove"): del TASKS[u]
            return self.send(200, {"success": True})
        self.send(404, {"error": "unknown"})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    srv = ThreadingHTTPServer(("127.0.0.1", port), H)
    sys.stderr.write("fake NodeODM on 127.0.0.1:%d\n" % port); srv.serve_forever()
