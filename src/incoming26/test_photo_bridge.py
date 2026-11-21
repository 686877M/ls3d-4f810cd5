#!/usr/bin/env python3
"""Bridge tests for tox_photo.py with a FAKE docker and a FAKE NodeODM (no Docker, no real job). Run: python3 test_photo_bridge.py [bridge.py]"""
import io, zipfile, http.client, json, os, shutil, signal, subprocess, sys, tempfile, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
BRIDGE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "tox_bridge.py")
sys.path.insert(0, HERE)
import ph_fixtures as F
TOKEN, BP, OP = "tok-photo-test", 38766, 33000
ST = tempfile.mkdtemp(prefix="fakedocker_")
env = dict(os.environ, TOX_PORT=str(BP), TOX_TOKEN=TOKEN, TOX_ODM_PORT=str(OP), TOX_DOCKER=os.path.join(HERE, "fake_docker.py"), FAKE_DOCKER_STATE=ST,
           TOX_INBOX=os.path.join(ST, "inbox.jsonl"), FAKE_DOCKER_DOWN="1", FAKE_PULL_DELAY="0.6")
pass_, fail_ = 0, 0
def ok(c, m):
    global pass_, fail_
    pass_ += bool(c); fail_ += (not c); print(("PASS " if c else "FAIL ") + m)
def req(method, path, body=None, headers=None, token=True, host=None):
    h = {"x-tox-token": TOKEN} if token else {}
    h.update(headers or {})
    c = http.client.HTTPConnection("127.0.0.1", BP, timeout=30)
    c.putrequest(method, path, skip_host=bool(host))
    if host: c.putheader("Host", host)
    for k, v in h.items(): c.putheader(k, v)
    if body is not None: c.putheader("Content-Length", str(len(body)))
    c.endheaders()
    if body is not None: c.send(body)
    r = c.getresponse(); b = r.read(); c.close()
    try: j = json.loads(b)
    except Exception: j = None
    return r.status, j, b
def multipart(fields, files=()):
    bd = "----tox" + str(time.time()).replace(".", ""); out = b""
    for k, v in fields.items(): out += ("--%s\r\nContent-Disposition: form-data; name=\"%s\"\r\n\r\n%s\r\n" % (bd, k, v)).encode()
    for n, data in files: out += ("--%s\r\nContent-Disposition: form-data; name=\"images\"; filename=\"%s\"\r\nContent-Type: image/jpeg\r\n\r\n" % (bd, n)).encode() + data + b"\r\n"
    out += ("--%s--\r\n" % bd).encode()
    return out, {"Content-Type": "multipart/form-data; boundary=" + bd}
P = subprocess.Popen([sys.executable, BRIDGE, "--http-only"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try: urllib.request.urlopen("http://127.0.0.1:%d/ping" % BP, timeout=1); break
        except Exception: time.sleep(0.2)
    s, j, _ = req("GET", "/ping", token=False); ok(s == 200 and j.get("photo") is True, "/ping advertises photo")
    # --- auth and local-only
    ok(req("GET", "/photo/status", token=False)[0] == 401, "status without token: 401")
    ok(req("GET", "/photo/status?t=" + TOKEN, token=False)[0] == 401, "token in the query string is NOT accepted: 401")
    ok(req("GET", "/photo/status", host="evil.example.com")[0] == 403, "foreign Host header: 403 (DNS rebinding)")
    ok(req("GET", "/photo/status", headers={"Origin": "https://evil.example.com"})[0] == 403, "foreign Origin: 403")
    ok(req("GET", "/photo/status", headers={"Origin": "null"})[0] == 200, "Origin null (file://) allowed with token")
    ok(req("POST", "/photo/odm/info", b"{}")[0] == 404, "wrong method on an allowed path: 404")
    # --- daemon down
    s, j, _ = req("GET", "/photo/status"); ok(s == 200 and j["phase"] == "daemon_down" and j["daemon"] is False, "docker daemon down: phase daemon_down, message kept: " + j.get("note", "")[:50])
    s, j, _ = req("POST", "/photo/start", b"{}"); time.sleep(1.2)
    s, j, _ = req("GET", "/photo/status"); ok(j["phase"] == "daemon_down" and "Docker is not running" in j["start"]["err"], "start with daemon down: clear error: " + j["start"]["err"][:60])
    # --- daemon up: pull + run
    env2 = dict(env); os.environ.pop("FAKE_DOCKER_DOWN", None)
    P.send_signal(signal.SIGTERM); P.wait(5)
    env.pop("FAKE_DOCKER_DOWN"); P = subprocess.Popen([sys.executable, BRIDGE, "--http-only"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try: urllib.request.urlopen("http://127.0.0.1:%d/ping" % BP, timeout=1); break
        except Exception: time.sleep(0.2)
    s, j, _ = req("GET", "/photo/status"); ok(j["phase"] == "stopped" and j["image"] is False and j["host"]["cpus"] == 8 and j["host"]["mem_gb"] == 16.0, "daemon up, no image: stopped, host 8 cpus 16 GB: " + json.dumps(j["host"]))
    ok(req("POST", "/photo/start", b'{"memory_gb":"x"}')[0] == 400, "memory_gb not a number: 400")
    s, j, _ = req("POST", "/photo/start", b'{"memory_gb":10,"cpus":4}'); ok(s == 200 and j["ok"], "start accepted")
    seen = []
    for _ in range(80):
        s, j, _ = req("GET", "/photo/status"); seen.append((j["phase"], j["pull"]["dl"] + j["pull"]["done"], 2 * j["pull"]["seen"]))
        if j["phase"] == "running": break
        time.sleep(0.25)
    ok(any(x[0] == "pulling" for x in seen), "pull phase observed in /photo/status")
    ok(any(x[0] == "pulling" and 0 < x[1] < x[2] for x in seen), "pull progress is partial at some point (downloaded + unpacked / 2 x layers seen): " + str([x for x in seen if x[0] == "pulling"][:4]))
    ok(j["phase"] == "running" and j["odm"]["version"].startswith("3.6.2"), "container running, NodeODM /info reached through the bridge")
    ra = open(os.path.join(ST, "run_args.txt")).read()
    ok("-p 127.0.0.1:%d:3000" % OP in ra, "docker run binds 127.0.0.1 only: " + [x for x in ra.split() if x.startswith("127")][0])
    ok("--name tox-nodeodm" in ra and "--memory 10g" in ra and "--memory-swap 10g" in ra and "--cpus 4.0" in ra, "named container, memory 10g (no swap), cpus 4 from the request")
    ok("--pids-limit" in ra and "no-new-privileges" in ra and "--restart no" in ra, "pids limit, no-new-privileges, no auto restart")
    ok(ra.strip().endswith("opendronemap/nodeodm"), "image name opendronemap/nodeodm")
    # --- passthrough allow-list
    ok(req("GET", "/photo/odm/__log")[0] == 404, "unlisted path /__log: 404")
    ok(req("GET", "/photo/odm/task/list?x=1")[0] == 400, "query string on a path that takes none: 400")
    ok(req("GET", "/photo/odm/auth/info")[0] == 404, "auth path: 404")
    ok(req("GET", "/photo/odm/../../etc/passwd")[0] == 404, "path traversal: 404")
    ok(req("GET", "/photo/odm/http://evil.example.com/info")[0] == 404, "absolute URL as path: 404")
    s, j, _ = req("GET", "/photo/odm/options"); ok(s == 200 and any(o["name"] == "dsm" for o in j), "GET /options passes")
    body, h = multipart({"name": "t", "options": json.dumps([{"name": "dsm", "value": True}]), "webhook": "http://evil.example.com/x"})
    ok(req("POST", "/photo/odm/task/new/init", body, h)[0] == 400, "init with a webhook: refused")
    body, h = multipart({"name": "t", "options": json.dumps([{"name": "rerun-from", "value": "x"}])}); s, j, _ = req("POST", "/photo/odm/task/new/init", body, h)
    ok(s == 400 and "not allowed" in j["error"], "init with an option outside the allow-list: " + j["error"])
    body, h = multipart({"name": "t", "options": json.dumps([{"name": "3d-tiles", "value": True}])}); s, j, _ = req("POST", "/photo/odm/task/new/init", body, h)
    ok(s == 400 and "3d-tiles" in j["error"], "3d-tiles true refused: " + j["error"])
    body, h = multipart({"name": "t", "options": json.dumps([{"name": "feature-quality", "value": "../../x"}])}); ok(req("POST", "/photo/odm/task/new/init", body, h)[0] == 400, "option value with path characters: refused")
    big = {"Content-Length": "300000000", "Content-Type": "multipart/form-data; boundary=x"}
    c = http.client.HTTPConnection("127.0.0.1", BP, timeout=10); c.putrequest("POST", "/photo/odm/task/new/upload/" + "0" * 8 + "-0000-0000-0000-" + "0" * 12)
    for k, v in dict(big, **{"x-tox-token": TOKEN}).items(): c.putheader(k, v)
    c.endheaders(); r = c.getresponse(); ok(r.status == 413, "upload request over 256 MB: 413 before any body is read"); c.close()
    # --- a whole job: init, two upload batches (3 MB + 1 MB files), commit, poll, download
    opts = [{"name": "dsm", "value": True}, {"name": "feature-quality", "value": "medium"}, {"name": "mesh-octree-depth", "value": 11}]
    body, h = multipart({"name": "unit job", "options": json.dumps(opts)}); s, j, _ = req("POST", "/photo/odm/task/new/init", body, h)
    ok(s == 200 and len(j["uuid"]) == 36, "init ok, uuid " + str(j.get("uuid"))[:8]); U = j["uuid"]
    blob = os.urandom(3 * 1024 * 1024)
    body, h = multipart({}, [("a.jpg", blob), ("b.jpg", blob[:1024 * 1024])]); s, j, _ = req("POST", "/photo/odm/task/new/upload/" + U, body, h); ok(s == 200 and j.get("success"), "upload batch 1 streamed (4 MB, 2 files)")
    body, h = multipart({}, [("c.jpg", b"x" * 1000), ("gcp_list.txt", b"EPSG:32636\n")]); s, j, _ = req("POST", "/photo/odm/task/new/upload/" + U, body, h); ok(s == 200, "upload batch 2 (image + gcp_list.txt)")
    odm_log = json.loads(urllib.request.urlopen("http://127.0.0.1:%d/__log" % OP).read())
    ups = [x for x in odm_log if x[0] == "POST" and "/upload/" in x[1]]
    ok(len(ups) == 2 and ups[0][2] > 4 * 1024 * 1024, "NodeODM received the 4 MB body intact (%d bytes)" % ups[0][2])
    ok(all(x[3] is None for x in odm_log if x[0] == "GET"), "the bridge token is never forwarded to NodeODM")
    ok(all(x[2] == "127.0.0.1:%d" % OP for x in odm_log if x[0] == "GET" and len(x) > 2 and x[2]), "every request to NodeODM goes to 127.0.0.1:%d only" % OP)
    s, j, _ = req("POST", "/photo/odm/task/new/commit/" + U, b""); ok(s == 200, "commit")
    last, prog, lines = None, [], 0
    for _ in range(12):
        s, j, _ = req("GET", "/photo/odm/task/%s/info?with_output=%d" % (U, lines)); lines += len(j.get("output", [])); prog.append(j["progress"])
        if j["status"]["code"] == 40: break
    ok(prog == [25, 50, 75, 100] and j["status"]["code"] == 40 and lines == 4, "polling with with_output: progress %s, %d console lines, status completed" % (prog, lines))
    ok(req("GET", "/photo/odm/task/%s/info?token=x" % U)[0] == 400, "other query parameters refused")
    for a, exp in [("dsm.tif", F.dsm_tiff(3)), ("orthophoto.tif", F.ortho_tiff()), ("textured_model.zip", F.model_zip()), ("all.zip", F.model_zip(True)), ("georeferenced_model.las", F.las())]:
        s, _, b = req("GET", "/photo/odm/task/%s/download/%s" % (U, a))
        same = b == exp if not a.endswith(".zip") else (lambda x, y: x.namelist() == y.namelist() and all(x.read(n) == y.read(n) for n in x.namelist()))(zipfile.ZipFile(io.BytesIO(b)), zipfile.ZipFile(io.BytesIO(exp)))
        ok(s == 200 and same, "download %s: %d bytes, content identical" % (a, len(b)))
    ok(req("GET", "/photo/odm/task/%s/download/3d_tiles_all.zip" % U)[0] == 404, "3d_tiles asset is not on the allow-list: 404")
    ok(req("GET", "/photo/odm/task/%s/download/..%%2Fsecret" % U)[0] == 404, "asset with traversal: 404")
    s, j, _ = req("POST", "/photo/odm/task/cancel", ("uuid=" + U).encode(), {"Content-Type": "application/x-www-form-urlencoded"}); ok(s == 200 and j.get("success"), "cancel passes")
    s, j, _ = req("POST", "/photo/odm/task/remove", ("uuid=" + U).encode(), {"Content-Type": "application/x-www-form-urlencoded"}); ok(s == 200 and j.get("success"), "remove passes")
    # --- stop, wipe
    s, j, _ = req("POST", "/photo/stop", b"{}"); ok(s == 200 and j["ok"], "stop")
    s, j, _ = req("GET", "/photo/status"); ok(j["container"] == "exited" and j["phase"] == "stopped", "after stop: container exited")
    s, j, _ = req("GET", "/photo/odm/info"); ok(s == 502 and "Start it first" in j["error"], "passthrough with NodeODM down: 502 with a hint")
    s, j, _ = req("POST", "/photo/start", b"{}")
    for _ in range(40):
        time.sleep(0.5); s, j, _ = req("GET", "/photo/status")
        if j["phase"] == "running": break
    ok(j["phase"] == "running", "start again reuses the stopped container (docker start): " + j["phase"])
    ok("start tox-nodeodm" in open(os.path.join(ST, "calls.log")).read(), "docker start tox-nodeodm was called")
    s, j, _ = req("POST", "/photo/wipe", b'{"image":true}'); ok(s == 200 and j["ok"] and j["container_removed"] and j["image_removed"], "wipe: container and image removed " + json.dumps(j))
    ok("rm -f -v tox-nodeodm" in open(os.path.join(ST, "calls.log")).read(), "wipe used docker rm -f -v (anonymous volumes go with it)")
    s, j, _ = req("GET", "/photo/status"); ok(j["container"] == "none" and j["image"] is False, "after wipe: no container, no image")
    s, j, _ = req("POST", "/photo/wipe", b"{}"); ok(j["ok"], "wipe twice is harmless")
finally:
    P.send_signal(signal.SIGTERM)
    try: P.wait(5)
    except Exception: P.kill()
    try: os.killpg(int(open(os.path.join(ST, "pid")).read()), signal.SIGTERM)
    except Exception: pass
    shutil.rmtree(ST, ignore_errors=True)
print("\n%d passed, %d failed" % (pass_, fail_)); sys.exit(1 if fail_ else 0)
