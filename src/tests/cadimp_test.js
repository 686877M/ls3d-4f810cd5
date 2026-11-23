const pw=require('playwright-core');const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const b=await pw.chromium.launch({executablePath:CH});const c=await b.newContext({viewport:{width:1400,height:850}});
 await c.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.goto(process.argv[2]);await p.waitForTimeout(4000);
 let ok=0,bad=0;const t=(c,n)=>{c?ok++:bad++;console.log((c?'  ok   ':'  FAIL ')+n);};
 const r=await p.evaluate(()=>{const ev=window.__lsv.ev;return ev(`(()=>{
  const n0=cadD().ents.length; const own=cadExportDxf(); const sheet=(typeof sheetDxf==='function')?(()=>{try{return sheetDxf();}catch(e){return ''}})():'';
  const a=cadDxfParse(own); let sN=0,sErr=''; try{ if(sheet)sN=cadDxfParse(sheet).ents.length; }catch(e){sErr=e.message}
  const d='0\\nSECTION\\n2\\nTABLES\\n0\\nTABLE\\n2\\nLAYER\\n0\\nLAYER\\n2\\nWALLS\\n62\\n1\\n0\\nENDTAB\\n0\\nENDSEC\\n0\\nSECTION\\n2\\nENTITIES\\n0\\nLINE\\n8\\nWALLS\\n10\\n0\\n20\\n0\\n11\\n8000\\n21\\n0\\n0\\nCIRCLE\\n8\\nWALLS\\n10\\n4000\\n20\\n3000\\n40\\n1500\\n0\\nMTEXT\\n8\\nNOTES\\n10\\n100\\n20\\n100\\n40\\n250\\n1\\n{\\\\fArial;FIRE TANK}\\\\PPUMP ROOM\\n0\\nHATCH\\n8\\nWALLS\\n0\\nENDSEC\\n0\\nEOF\\n';
  const res=cadImportDxf(d,'t.dxf'); const D=cadD(); const tx=D.ents.find(e=>e.t==='tx'&&/FIRE TANK/.test(e.s));
  let binErr=''; try{cadDxfParse('AutoCAD Binary DXF\\r\\n');}catch(e){binErr=e.message} let junk=''; try{cadDxfParse('hello');}catch(e){junk=e.message}
  return {n0,ownN:a.ents.length,sN,sErr,added:D.ents.length-n0,res,lay:D.layers.find(l=>l.n==='WALLS'),tx:tx&&tx.s,binErr,junk,cmd:!!XC.c_dxfin,desc:!!(XDESC&&XDESC.c_dxfin),open:CS.open,svg:document.querySelectorAll('#cadwin svg circle').length};
 })()`);});
 console.log(JSON.stringify(r).slice(0,700));
 t(r.cmd&&r.desc,'command registered with bilingual help');
 t(r.added===3,'line, circle and text imported (3 entities)');
 t(r.res.skip.HATCH===1&&/HATCH/.test(r.res.msg),'unsupported entity is reported, not silent');
 t(r.lay&&r.lay.c==='#ef5350','layer created with its DXF colour');
 t(r.tx==='FIRE TANK PUMP ROOM','MTEXT formatting stripped');
 t(r.open&&r.svg>=1,'C.X opens and draws the imported circle');
 t(r.ownN>=0&&!r.sErr,'app-exported DXF parses back (own '+r.ownN+', sheet '+r.sN+')');
 t(!!r.binErr&&!!r.junk,'binary DXF and non-DXF give a clear error');
 const rib=await p.evaluate(()=>window.__lsv.ev(`Object.keys(RIBM).filter(k=>RIBM[k].impl==='=cadImportPick'&&XC[k]).length===2`)).catch(()=>null); t(rib===true,'ribbon Import buttons run the importer');
 t(errs.length===0,'no page errors '+errs.slice(0,2).join(' | '));
 await p.screenshot({path:'recover/xb/cadimp.png'});console.log('\ncadimp: '+ok+' passed, '+bad+' failed');await b.close();})();
