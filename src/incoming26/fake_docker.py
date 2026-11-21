#!/usr/bin/env python3
"""Fake `docker` CLI for tests (TOX_DOCKER=this file). State in $FAKE_DOCKER_STATE. FAKE_DOCKER_DOWN=1: daemon not running."""
import os, re, signal, subprocess, sys, time
ST = os.environ["FAKE_DOCKER_STATE"]; os.makedirs(ST, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
a = sys.argv[1:]
def P(n): return os.path.join(ST, n)
def rd(n, d=""):
    try: return open(P(n)).read().strip()
    except OSError: return d
def wr(n, v): open(P(n), "w").write(v)
open(P("calls.log"), "a").write(" ".join(a) + "\n")
if os.environ.get("FAKE_DOCKER_DOWN") == "1":
    sys.stderr.write("failed to connect to the docker API at unix:///Users/x/.docker/run/docker.sock; check if the path is correct and if the daemon is running\n"); sys.exit(1)
c = a[0] if a else ""
if c == "info": print("8 17179869184")
elif c == "image" and a[1] == "inspect": sys.exit(0 if os.path.exists(P("image")) else 1)
elif c == "inspect":
    s = rd("state")
    if not s: sys.stderr.write("Error: No such object\n"); sys.exit(1)
    print(s)
elif c == "pull":
    dl = float(os.environ.get("FAKE_PULL_DELAY", "0.15")); ids = ["%012x" % (i + 1) for i in range(4)]
    seq = ["latest: Pulling from opendronemap/nodeodm"] + ["%s: Pulling fs layer" % i for i in ids] + ["%s: Download complete" % i for i in ids] + ["%s: Pull complete" % i for i in ids]
    for l in seq:
        print(l, flush=True); time.sleep(dl)
    wr("image", "1")
elif c == "run":
    wr("run_args.txt", " ".join(a)); port = int(re.search(r"127\.0\.0\.1:(\d+):3000", " ".join(a)).group(1))
    pr = subprocess.Popen([sys.executable, os.path.join(HERE, "fake_nodeodm.py"), str(port)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    wr("pid", str(pr.pid)); wr("port", str(port)); wr("state", "running"); print("c0ffee" * 10)
elif c == "start":
    pr = subprocess.Popen([sys.executable, os.path.join(HERE, "fake_nodeodm.py"), rd("port", "3000")], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True); wr("pid", str(pr.pid)); wr("state", "running")
elif c in ("stop", "rm"):
    if c == "rm" and not rd("state"): sys.stderr.write("Error response from daemon: No such container: x\n"); sys.exit(1)
    try: os.killpg(int(rd("pid", "0")), signal.SIGTERM)
    except Exception: pass
    wr("state", "exited" if c == "stop" else "")
elif c == "rmi":
    if not os.path.exists(P("image")): sys.stderr.write("Error: No such image\n"); sys.exit(1)
    os.remove(P("image"))
else: sys.exit(2)
