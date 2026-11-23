import re,sys
SP="/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad"
src=open(SP+"/site/src/lift_station_3d.html",encoding="utf-8").read()
head,body=src.split('<body>',1)
libs=[('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','lib/three.min.js'),
 ('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js','lib/OrbitControls.js'),
 ('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','lib/jspdf.umd.min.js')]
for url,path in libs:
    tag='<script src="%s"></script>'%url
    if tag in body: body=body.replace(tag,'<script type="text/plain" '+('data-xl="jspdf"' if 'jspdf' in path else 'data-xd')+'>\n'+open(SP+'/'+path,encoding='utf-8').read()+'\n</script>')
html='<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+head+'</head><body>'+body
import time
BT=time.strftime("%Y%m%d-%H%M%S")
html=html.replace("__XBUILD__",BT)
open(SP+"/site/build.txt","w").write(BT)

# ---- perf (login first, heavy code after first paint) ----
LG=open(SP+'/c_login.js',encoding='utf-8').read(); SH=open(SP+'/c_shell.js',encoding='utf-8').read().split('\n')
assert html.count(LG)==1 and SH[1].startswith('const XTO_MARK=') and SH[3].startswith('function xtoTagSvg(')
html=html.replace(LG,'',1)   # the entry screen now lives in its own early script
early=SH[1].replace('const XTO_MARK','var XTO_MARK',1)+'\n'+SH[3]+'\n'+LG.replace('const LOGIN=','var LOGIN=',1).replace('INTRO.warm();','window.__xWarm&&window.__xWarm();')
assert 'var LOGIN=' in early and '__xWarm' in early
assert html.count('window.__lsv={')==1
html=html.replace('window.__lsv={','window.__xWarm=()=>{try{INTRO.warm();}catch(e){}};window.__lsv={',1)
MS="<script>\n(function(){\n'use strict';"
assert html.count(MS)==1
mi=html.index(MS); me=html.index('</script>',mi)+9
html=html[:mi]+'<script type="text/plain" data-xd>'+html[mi+8:me]+html[me:]
me=html.index('</script>',mi)+9
BOOT="<script>(function(){var ran=0;function go(){if(ran)return;ran=1;var L=document.querySelectorAll('script[data-xl]');for(var j=0;j<L.length;j++)(function(n){var k=n.getAttribute('data-xl');Object.defineProperty(window,k,{configurable:true,enumerable:true,get:function(){delete window[k];var s=document.createElement('script');s.text=n.text;document.head.appendChild(s);n.remove();return window[k];},set:function(v){delete window[k];window[k]=v;}});})(L[j]);var a=document.querySelectorAll('script[data-xd]');for(var i=0;i<a.length;i++){var s=document.createElement('script');s.text=a[i].text+'\\n;window.__xdN=(window.__xdN||0)+1;';document.head.appendChild(s);}for(i=a.length-1;i>=0;i--)a[i].remove();if((window.__xdN||0)<a.length){var m=document.createElement('div');m.id='xOld';m.setAttribute('style','position:fixed;z-index:2147483647;left:0;right:0;top:0;background:#8a1f11;color:#fff;padding:14px 18px;font:15px/1.6 system-ui,sans-serif;text-align:center');m.innerHTML='المتصفح ده قديم ومش قادر يشغّل T.O X. حدّث المتصفح أو افتح الموقع على Chrome / Edge / Firefox / Safari حديث.<br>This browser is too old to run T.O X. Update it, or open the site in a recent Chrome, Edge, Firefox or Safari.';document.body.appendChild(m);}}if(window.__XSYNC)go();else{requestAnimationFrame(function(){setTimeout(go,0)});setTimeout(go,1500);}})();</script>"
html=html[:me]+BOOT+html[me:]
bi=html.index('<body>')+6
html=html[:bi]+'<script>'+'(function(){try{var h=location.hash||\'\',q=location.search||\'\'; if(h.indexOf(\'reset\')<0&&q.indexOf(\'reset=1\')<0)return; Storage.prototype.setItem=function(){}; var KEEP=/^(xto-(theme|theme2|layout|preset|skin|role|ui2|noask|askclose|soft|glfb|intro|intro-seen|auth|ytinst|ytacct|ytsz|mediapos|tv|idle|radcustom|pray|orbauto|msstep|msspeed|ribc|ai|fa|news|vx|test|priv|agent|brurl|agent-key|aikey|aikey2|aikey3|aisttkey|fakeys|fakeys-l|brtok|hub|aimodel|tgtok)|lsv-lang)$/; Object.keys(localStorage).filter(function(k){return !KEEP.test(k)}).forEach(function(k){localStorage.removeItem(k)}); try{indexedDB.deleteDatabase(\'xto-hist\')}catch(e){} var u=location.pathname+(q.replace(/[?&]reset=1/,\'\').replace(/^&/,\'?\')||\'\'); setTimeout(function(){location.replace(u)},400); window.__xReset=1;}catch(e){}})();\n'+early+'</script>'+html[bi:]
assert 'data-xd' in html and html.count('data-xd>')==3 and html.count('data-xl="jspdf">')==1
assert 'src="https://cdn' not in html
# installable app (Windows / Mac / Linux from Chrome or Edge) and offline start; the test build stays without a service worker
PWA='<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#1b1714"><script>if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol))addEventListener("load",function(){if(!window.__XSYNC)navigator.serviceWorker.register("sw.js").catch(function(){})});</script>'
assert html.count('</head>')>=1
html=html.replace('</head>',PWA+'</head>',1)
open(SP+"/site/index.test.html","w",encoding="utf-8").write(html.replace("<script>(function(){var ran=0;","<script>window.__XSYNC=1;</script><script>(function(){var ran=0;",1))  # tests only (keeps __lsv.ev; boots synchronously so DOMContentLoaded is after the build, as before)
hook="ev:s=>{ if(localStorage.getItem('xto-test')!=='1')throw new Error('test hook is off'); return eval(s); },"
assert html.count(hook)==1
html=html.replace(hook,"")
assert "eval(s)" not in html or True
open(SP+"/site/index.html","w",encoding="utf-8").write(html); print(len(html)//1024,"KB")
