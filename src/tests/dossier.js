// Dump per-button implementation source + help for the parity review. node pw/dossier.js <url> <out.json>
const pw=require('playwright-core');const fs=require('fs');const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const b=await pw.chromium.launch({executablePath:CH,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext();await c.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
 const p=await c.newPage();await p.goto(process.argv[2]);await p.waitForTimeout(10000);
 const out=await p.evaluate(()=>window.__lsv.ev(`JSON.stringify(Object.keys(RIBP).flatMap(t=>RIBP[t].tabs.flatMap(tb=>tb[2].flatMap(g=>g[1].map(id=>{ const m=RIBM[id]||{}; const o=XC[id]||{}; let src=String(o.run||''); let via='';
  if(/^\\(\\)=>base\\.run\\(\\)$/.test(src.replace(/\\s/g,''))&&m.impl&&XC[m.impl]){ via=m.impl; src=String(XC[m.impl].run); }
  if(/^\\(\\)=>\\{try\\{constr=run\\(\\)/.test(src.replace(/\\s/g,''))) via=via||'ov';
  const d=XDESC[id]||(m.impl&&XDESC[m.impl])||(typeof CMDREF!=='undefined'&&CMDREF[t+'|'+m.en])||''; return {id,t,tab:m.tab,panel:m.panel,en:m.en,impl:m.impl,via,honest:!!o.honest,help:Array.isArray(d)?d[d.length>2?1:0]:String(d),src:src.slice(0,1500),len:src.length}; })))))`));
 fs.writeFileSync(process.argv[3],out);console.log('done');await b.close();})();
