#!/usr/bin/env python3
"""work_split builder: runs the delivered patch_v3.py, the shared privacy_patch.py and the shared build.py with
their outputs redirected to work_split/out/ (nothing under site/ or the work root is written).  XSPLIT=0 = baseline."""
import os,sys,subprocess,runpy
H=os.path.dirname(os.path.abspath(__file__)); R=os.path.dirname(H); OUT=H+'/out/'
os.environ.setdefault('XSPLIT_DIR',H)
p=open(H+'/patch_v3.py',encoding='utf-8').read(); a="open(SP+'site/src/lift_station_3d.html','w'"; assert p.count(a)==1
exec(compile(p.replace(a,"open(%r,'w'"%(OUT+'lift_station_3d.html')),'patch_v3.py','exec'),{'__name__':'__main__'})
subprocess.check_call([sys.executable,R+'/privacy_patch.py',OUT+'lift_station_3d.html',OUT+'lift_station_3d.html',R+'/privacy.js'])
b=open(R+'/build.py',encoding='utf-8').read(); n=b.count('SP+"/site/'); assert n==4,n
b=b.replace('SP+"/site/src/lift_station_3d.html"',repr(OUT+'lift_station_3d.html')).replace('SP+"/site/',repr(OUT)+'+"')
exec(compile(b,'build.py','exec'),{'__name__':'__main__'})
