"""T.O X bridge extension: "Photos to 3D" (photogrammetry) through a LOCAL NodeODM container.

Imported by tox_bridge.py (see tox_bridge_photo.diff). Standard library only.

  GET  /photo/status            docker / image / container / NodeODM state, pull progress
  POST /photo/start             pull the image if missing (progress in /photo/status), run the container
  POST /photo/stop              docker stop (job data kept inside the container)
  POST /photo/wipe              docker rm -f -v the container (job data + uploaded photos gone); {"image":true} also removes the image
  *    /photo/odm/<NodeODM path>  restricted passthrough to 127.0.0.1:<port> ONLY (task API paths on an allow-list)

All routes: token required (header x-tox-token or Authorization: Bearer, never the query string), Host and Origin must be loopback.
Nothing is written to disk by the bridge: uploads are streamed straight into the container, downloads straight back to the page.
ODM / NodeODM are AGPL-3.0: T.O X only runs the unmodified image as a separate program and talks HTTP to it.
"""
import http.client, json, os, re, shutil, subprocess, threading, time

IMAGE = os.environ.get("TOX_ODM_IMAGE", "opendronemap/nodeodm")
NAME = os.environ.get("TOX_ODM_NAME", "tox-nodeodm")
ODM_PORT = int(os.environ.get("TOX_ODM_PORT", "3000"))     # host port; the fake server in tests listens here
ODM_HOST = "127.0.0.1"                                       # fixed: no other host is ever contacted
DOCKER_CANDIDATES = ["/usr/local/bin/docker", "/opt/homebrew/bin/docker", "/Applications/Docker.app/Contents/Resources/bin/docker", "/usr/bin/docker"]
MAX_INIT = 64 * 1024                  # /task/new/init body (options + name)
MAX_UPLOAD = 256 * 1024 * 1024        # one upload request (the page sends batches of about 24 MB)
MAX_SMALL = 64 * 1024

# NodeODM task API: (method, regex). uuid = 36 chars. Anything else is a 404.
_U = r"[0-9a-fA-F-]{36}"
ASSETS = {"all.zip", "orthophoto.tif", "orthophoto.png", "textured_model.zip", "georeferenced_model.laz", "georeferenced_model.las",
          "georeferenced_model.ply", "dsm.tif", "dtm.tif", "cameras.json", "shots.geojson"}      # 3d_tiles_* deliberately not listed
ROUTES = [
    ("GET", re.compile(r"^/info$"), "info"),
    ("GET", re.compile(r"^/options$"), "options"),
    ("GET", re.compile(r"^/task/list$"), "list"),
    ("POST", re.compile(r"^/task/new/init$"), "init"),
    ("POST", re.compile(r"^/task/new/upload/(%s)$" % _U), "upload"),
    ("POST", re.compile(r"^/task/new/commit/(%s)$" % _U), "small"),
    ("GET", re.compile(r"^/task/(%s)/info$" % _U), "tinfo"),
    ("GET", re.compile(r"^/task/(%s)/output$" % _U), "tinfo"),
    ("GET", re.compile(r"^/task/(%s)/download/([A-Za-z0-9_.]+)$" % _U), "download"),
    ("POST", re.compile(r"^/task/cancel$"), "small"),
    ("POST", re.compile(r"^/task/remove$"), "small"),
    ("POST", re.compile(r"^/task/restart$"), "small"),
]
# option names the page may send (everything else is refused). 3d-tiles is only accepted as false.
OPTIONS_OK = {"fast-orthophoto", "dsm", "dtm", "mesh-octree-depth", "feature-quality", "pc-quality", "orthophoto-resolution", "dem-resolution",
              "min-num-features", "matcher-neighbors", "use-3dmesh", "skip-3dmodel", "auto-boundary", "orthophoto-png", "orthophoto-compression",
              "gltf", "force-gps", "use-exif", "ignore-gsd", "resize-to", "optimize-disk-space", "max-concurrency", "texturing-single-material",
              "pc-las", "mesh-size", "pc-filter", "pc-sample", "pc-rectify", "smrf-threshold", "smrf-window", "smrf-slope", "smrf-scalar", "3d-tiles"}

S = {"lock": threading.Lock(), "pull": {"running": False, "seen": [], "done": [], "dl": [], "line": "", "ok": None, "err": "", "t0": 0},
     "start": {"running": False, "err": "", "phase": ""}, "cache": (0, None)}


def docker_bin():
    p = os.environ.get("TOX_DOCKER")
    if p:
        return p
    return shutil.which("docker") or next((c for c in DOCKER_CANDIDATES if os.path.exists(c)), None)


def _run(args, timeout=8):
    """Run docker. Returns (rc, stdout, stderr); rc -1 = could not run / timed out."""
    d = docker_bin()
    if not d:
        return -2, "", "docker not found"
    try:
        r = subprocess.run([d] + args, capture_output=True, text=True, timeout=timeout)
        return r.returncode, r.stdout, r.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "docker did not answer in %ds" % timeout
    except OSError as e:
        return -2, "", str(e)


def odm_get(path, timeout=3):
    try:
        c = http.client.HTTPConnection(ODM_HOST, ODM_PORT, timeout=timeout)
        c.request("GET", path)
        r = c.getresponse()
        b = r.read(1 << 20)
        c.close()
        return r.status, b
    except Exception:
        return 0, b""


def status(fresh=False):
    t, v = S["cache"]
    if v and not fresh and time.time() - t < 2:
        return v
    out = {"docker": bool(docker_bin()), "daemon": False, "image": False, "container": "none", "odm": None, "image_name": IMAGE,
           "container_name": NAME, "port": ODM_PORT, "bind": "127.0.0.1", "phase": "no_docker", "note": "", "host": {}}
    if out["docker"]:
        rc, so, se = _run(["info", "--format", "{{.NCPU}} {{.MemTotal}}"], 6)
        if rc == 0:
            out["daemon"] = True
            try:
                n, m = so.split()
                out["host"] = {"cpus": int(n), "mem_gb": round(int(m) / 2 ** 30, 1)}
            except Exception:
                pass
            out["image"] = _run(["image", "inspect", IMAGE], 6)[0] == 0
            rc, so, _ = _run(["inspect", "--format", "{{.State.Status}}", NAME], 6)
            out["container"] = so.strip() if rc == 0 else "none"
            if out["container"] == "running":
                code, b = odm_get("/info")
                if code == 200:
                    try:
                        out["odm"] = json.loads(b)
                    except Exception:
                        out["odm"] = {}
            out["phase"] = "running" if out["odm"] is not None else ("starting" if out["container"] == "running" else "stopped")
        else:
            out["phase"] = "daemon_down"
            out["note"] = se.strip()[:300]
    with S["lock"]:
        p = dict(S["pull"])
        p["seen"], p["done"], p["dl"] = len(p["seen"]), len(p["done"]), len(p["dl"])
        out["pull"] = p
        out["start"] = dict(S["start"])
        if p["running"]:
            out["phase"] = "pulling"
        elif S["start"]["running"] and out["phase"] in ("stopped", "starting"):
            out["phase"] = "starting"
        elif S["start"]["err"] and out["phase"] == "stopped":
            out["phase"] = "error"
    S["cache"] = (time.time(), out)
    return out


_LAYER = re.compile(r"^([0-9a-f]{12}): (.+)$")


def _pull_thread():
    with S["lock"]:
        S["pull"].update(running=True, seen=[], done=[], dl=[], line="starting pull", ok=None, err="", t0=time.time())
    d = docker_bin()
    try:
        p = subprocess.Popen([d, "pull", IMAGE], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        for ln in p.stdout:
            ln = ln.strip()
            m = _LAYER.match(ln)
            with S["lock"]:
                S["pull"]["line"] = ln[:200]
                if m:
                    if m.group(1) not in S["pull"]["seen"]:
                        S["pull"]["seen"].append(m.group(1))
                    if re.search(r"Download complete|Pull complete|Already exists", m.group(2)) and m.group(1) not in S["pull"]["dl"]:
                        S["pull"]["dl"].append(m.group(1))
                    if re.search(r"Pull complete|Already exists", m.group(2)) and m.group(1) not in S["pull"]["done"]:
                        S["pull"]["done"].append(m.group(1))
        p.wait()
        with S["lock"]:
            S["pull"].update(running=False, ok=(p.returncode == 0), err="" if p.returncode == 0 else S["pull"]["line"])
    except Exception as e:  # noqa
        with S["lock"]:
            S["pull"].update(running=False, ok=False, err=str(e))
    S["cache"] = (0, None)


def _start_thread(memory_gb, cpus):
    def fail(msg):
        with S["lock"]:
            S["start"].update(running=False, err=msg, phase="error")
    try:
        with S["lock"]:
            S["start"].update(running=True, err="", phase="checking")
        st = status(True)
        if not st["daemon"]:
            return fail("Docker is not running. Open Docker Desktop, wait until it says running, then try again.")
        if not st["image"]:
            with S["lock"]:
                S["start"]["phase"] = "pulling"
            _pull_thread()
            if not S["pull"]["ok"]:
                return fail("image pull failed: " + S["pull"]["err"])
        if st["container"] in ("running",):
            pass
        elif st["container"] in ("exited", "created", "paused"):
            rc, _, se = _run(["start", NAME], 30)
            if rc:
                return fail("docker start failed: " + se.strip()[:300])
        else:
            host = st.get("host") or {}
            mem = memory_gb or max(2, int(host.get("mem_gb", 8) * 0.75))
            cp = cpus or max(1, int(host.get("cpus", 2)) - 1)
            args = ["run", "-d", "--name", NAME, "--label", "tox=photo", "-p", "%s:%d:3000" % (ODM_HOST, ODM_PORT),
                    "--memory", "%dg" % mem, "--memory-swap", "%dg" % mem, "--cpus", str(cp), "--pids-limit", "4096",
                    "--security-opt", "no-new-privileges", "--restart", "no", IMAGE]
            with S["lock"]:
                S["start"]["phase"] = "creating"
            rc, _, se = _run(args, 60)
            if rc:
                return fail("docker run failed: " + se.strip()[:300])
        with S["lock"]:
            S["start"]["phase"] = "waiting for NodeODM"
        for _ in range(60):
            if odm_get("/info")[0] == 200:
                break
            time.sleep(1)
        else:
            return fail("container started but NodeODM did not answer on 127.0.0.1:%d in 60 s" % ODM_PORT)
        with S["lock"]:
            S["start"].update(running=False, err="", phase="running")
    except Exception as e:  # noqa
        fail(str(e))
    S["cache"] = (0, None)


def start(memory_gb=None, cpus=None):
    mg = int(memory_gb) if memory_gb and 1 <= int(memory_gb) <= 512 else None      # may raise: before any state is touched
    cp = float(cpus) if cpus and 0.5 <= float(cpus) <= 128 else None
    with S["lock"]:
        if S["start"]["running"] or S["pull"]["running"]:
            return {"ok": True, "already": True}
        S["start"].update(running=True, err="", phase="checking")
    threading.Thread(target=_start_thread, args=(mg, cp), daemon=True).start()
    return {"ok": True}


def stop():
    rc, _, se = _run(["stop", NAME], 60)
    S["cache"] = (0, None)
    return {"ok": rc == 0, "error": se.strip()[:300] if rc else ""}


def wipe(image=False):
    """Remove the container with its anonymous volumes: uploaded photos, task data and results all go with it."""
    res = {"container_removed": False, "image_removed": False, "errors": []}
    rc, _, se = _run(["rm", "-f", "-v", NAME], 90)
    res["container_removed"] = rc == 0 or "No such container" in se
    if not res["container_removed"]:
        res["errors"].append(se.strip()[:300])
    if image:
        rc, _, se = _run(["rmi", IMAGE], 120)
        res["image_removed"] = rc == 0 or "No such image" in se
        if not res["image_removed"]:
            res["errors"].append(se.strip()[:300])
    S["cache"] = (0, None)
    res["ok"] = not res["errors"]
    return res


def check_init(body, ctype):
    """The init body is small multipart/urlencoded: refuse a webhook (the container would call any URL) and unknown or unsafe options."""
    if b"webhook" in body.lower():
        return "webhook is not allowed"
    m = re.search(rb'name="options"\r?\n\r?\n(.*?)\r?\n--', body, re.S)
    if not m:
        m = re.search(rb"(?:^|&)options=([^&]*)", body)
        if m:
            from urllib.parse import unquote_to_bytes
            raw = unquote_to_bytes(m.group(1).replace(b"+", b" "))
        else:
            return None            # no options sent: NodeODM defaults
    else:
        raw = m.group(1)
    try:
        opts = json.loads(raw.decode("utf-8"))
    except Exception:
        return "options is not valid JSON"
    if not isinstance(opts, list) or len(opts) > 40:
        return "options must be a list of {name, value}"
    for o in opts:
        if not isinstance(o, dict) or not isinstance(o.get("name"), str):
            return "bad option entry"
        n = o["name"].lstrip("-")
        if n not in OPTIONS_OK:
            return "option not allowed: " + n[:40]
        v = o.get("value")
        if not isinstance(v, (bool, int, float, str)) or (isinstance(v, str) and (len(v) > 20 or not re.fullmatch(r"[A-Za-z0-9._-]*", v))):
            return "bad value for " + n
        if n == "3d-tiles" and v not in (False, "false", 0):
            return "3d-tiles is switched off in T.O X"
    return None


def _hdrs(h):
    return {"Access-Control-Allow-Origin": "*", "Cache-Control": "no-store"}


def route(h, method):
    """Handle one /photo/* request on bridge handler h (an instance of tox_bridge.H). Always answers."""
    from urllib.parse import urlparse
    u = urlparse(h.path)
    p = u.path
    if not h._local_only():
        return h._send(403, {"error": "local only"})
    if method == "OPTIONS":
        return h._send(204)
    if not h._auth_header():
        return h._send(401, {"error": "bad token"})
    if p == "/photo/status" and method == "GET":
        return h._send(200, status(True))
    if p == "/photo/start" and method == "POST":
        d = _json_body(h)
        if d is None:
            return h._send(400, {"error": "bad json"})
        try:
            return h._send(200, start(d.get("memory_gb"), d.get("cpus")))
        except (TypeError, ValueError):
            return h._send(400, {"error": "memory_gb / cpus must be numbers"})
    if p == "/photo/stop" and method == "POST":
        _json_body(h)
        return h._send(200, stop())
    if p == "/photo/wipe" and method == "POST":
        d = _json_body(h)
        return h._send(200, wipe(bool((d or {}).get("image"))))
    if p.startswith("/photo/odm/"):
        return _passthrough(h, method, p[len("/photo/odm"):], u.query)
    return h._send(404, {"error": "unknown"})


def _json_body(h):
    n = int(h.headers.get("content-length") or 0)
    if n < 0 or n > MAX_SMALL:
        return None
    try:
        return json.loads(h.rfile.read(n) or b"{}")
    except Exception:
        return None


def _passthrough(h, method, path, query):
    kind, groups = None, ()
    for m, rx, k in ROUTES:
        mm = rx.match(path)
        if m == method and mm:
            kind, groups = k, mm.groups()
            break
    if not kind:
        return h._send(404, {"error": "path not allowed"})
    if kind == "download" and groups[1] not in ASSETS:
        return h._send(404, {"error": "asset not allowed"})
    if query and not (kind == "tinfo" and re.fullmatch(r"with_output=\d{1,9}", query)):
        return h._send(400, {"error": "query not allowed"})
    n = int(h.headers.get("content-length") or 0)
    ct = h.headers.get("content-type") or ""
    limit = MAX_UPLOAD if kind == "upload" else MAX_INIT if kind == "init" else MAX_SMALL
    if n < 0 or n > limit:
        return h._send(413, {"error": "body too large"})
    head = {}
    if method == "POST":
        head = {"Content-Type": ct, "Content-Length": str(n)}
    body = None
    if kind in ("init", "small"):
        body = h.rfile.read(n)
        if kind == "init":
            err = check_init(body, ct)
            if err:
                return h._send(400, {"error": err})
    try:
        c = http.client.HTTPConnection(ODM_HOST, ODM_PORT, timeout=600)
        c.putrequest(method, path + ("?" + query if query else ""))
        for k, v in head.items():
            c.putheader(k, v)
        c.endheaders()
        if body is not None:
            c.send(body)
        elif method == "POST":
            left = n
            while left > 0:
                b = h.rfile.read(min(65536, left))
                if not b:
                    break
                c.send(b)
                left -= len(b)
        r = c.getresponse()
    except Exception as e:  # noqa
        return h._send(502, {"error": "NodeODM not reachable on 127.0.0.1:%d (%s). Start it first." % (ODM_PORT, type(e).__name__)})
    h.send_response(r.status)
    for k in ("content-type", "content-length", "content-disposition"):
        v = r.getheader(k)
        if v:
            h.send_header(k, v)
    h.send_header("Access-Control-Allow-Origin", "*")
    h.send_header("Cache-Control", "no-store")
    h.end_headers()
    try:
        while True:
            b = r.read(65536)
            if not b:
                break
            h.wfile.write(b)
    except (BrokenPipeError, ConnectionResetError):
        pass
    finally:
        c.close()
