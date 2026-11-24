const pw=require('playwright-core');const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const b=await pw.chromium.launch({executablePath:CH,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:1400,height:850}});
 await c.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(process.argv[2]);await p.waitForTimeout(9000);
 const r=JSON.parse(await p.evaluate(()=>window.__lsv.ev(`JSON.stringify({on:SP.on,master:SP.master,built:!!SP.built,h:Math.round(camera.position.y),max:controls.maxDistance,far:camera.far})`)));
 console.log(JSON.stringify(r));let ok=0,bad=0;const t=(c,n)=>{c?ok++:bad++;console.log((c?'  ok   ':'  FAIL ')+n);};
 t(r.on&&r.master&&r.built,'site and master plan are on at start');t(r.h>3000&&r.max>=6000,'camera starts over the whole site with free zoom range');t(errs.length===0,'no page errors '+errs.slice(0,2).join(' | '));
 await p.screenshot({path:'recover/xb/start.png'});console.log('\nstart: '+ok+' passed, '+bad+' failed');await b.close();})();
