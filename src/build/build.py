import re,sys
import os
SP=os.path.dirname(os.path.abspath(__file__))
src=open(SP+"/../lift_station_3d.html",encoding="utf-8").read()
head,body=src.split('<body>',1)
libs=[('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','lib/three.min.js'),
 ('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js','lib/OrbitControls.js'),
 ('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','lib/jspdf.umd.min.js')]
for url,path in libs:
    tag='<script src="%s"></script>'%url
    if tag in body: body=body.replace(tag,'<script>\n'+open(SP+'/'+path,encoding='utf-8').read()+'\n</script>')
html='<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+head+'</head><body>'+body
assert 'src="https://cdn' not in html
open(SP+"/../../index.html","w",encoding="utf-8").write(html); print(len(html)//1024,"KB")
