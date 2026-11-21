#!/bin/sh
# private demo build (mirror of make.sh) -> demo/bld/site ; never touches site/. Reads my demo files from demo/, the voice file from the scratchpad root, lazygl with the set-trap fix.
cd "$(dirname "$0")/.." || exit 1
python3 - <<'PY'
import re
p=open('patch_v3.py').read()
p=p.replace("SP+'site/src/lift_station_3d.html'","SP+'demo/bld/site/src/lift_station_3d.html'")
n=0
def sub(a,b):
    global p,n
    if a in p: p=p.replace(a,b); n+=1
sub("rd('demo_stub.js')","rd('demo/demo_stub.js')")
sub("['demo_core.js','demo_ch1.js']+[f for f in ['demo_ch2.js','demo_ch3.js','demo_voice.js'] if os.path.exists(SP+f)]","['demo/demo_core.js','demo/demo_ch1.js','demo/demo_ch2.js','demo/demo_ch3.js']+[f for f in ['demo_voice.js'] if os.path.exists(SP+f)]")
sub("rd('lazygl.js')","rd('demo/lazygl_fixed.js')")
sub("+rd('c_demohold.js')","")  # the owner's temporary "demo is being rebuilt" notice replaces demoStart: not wanted in my test build
assert n>=3,n
open('demo/_patch.py','w').write(p)
b=open('build.py').read()
for k in ['lift_station_3d.html','build.txt','index.test.html','index.html']:
    b=b.replace('SP+"/site/src/'+k+'"' if k.endswith('3d.html') else 'SP+"/site/'+k+'"', 'SP+"/demo/bld/site/src/'+k+'"' if k.endswith('3d.html') else 'SP+"/demo/bld/site/'+k+'"')
open('demo/_build.py','w').write(b)
PY
nice -n 15 python3 demo/_patch.py && nice -n 15 python3 privacy_patch.py demo/bld/site/src/lift_station_3d.html demo/bld/site/src/lift_station_3d.html privacy.js && nice -n 15 python3 demo/_build.py && ls -la demo/bld/site/index.test.html
