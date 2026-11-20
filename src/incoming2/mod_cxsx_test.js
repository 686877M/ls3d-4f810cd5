/* Playwright test for mod_cxsx_cad_a/b.js (C.X) and mod_cxsx_sv_a/b.js (S.X). Usage: NODE_PATH=<dir with playwright-core> node mod_cxsx_test.js [file:///path/index.html] [cad|sv]. CHROME=<path> overrides Chrome.
   Each command is run from its ribbon id (found by program/tab/panel/name); prompt() answers come from the queue Q; a number or structure is asserted. */
const {chromium}=require('playwright-core');
const URL=process.argv[2]&&!/^(cad|sv)$/.test(process.argv[2])?process.argv[2]:'file://'+require('path').resolve(__dirname,'../../index.html');
const ONLY=process.argv.slice(2).filter(a=>/^(cad|sv)$/.test(a)); const SECT={};
const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0, fail=0; const Q=[];
const ok=(c,m)=>{ if(c){ pass++; console.log('  ok   '+m); } else { fail++; console.log('  FAIL '+m); } };
const near=(a,b,t)=>Math.abs(a-b)<=(t||1e-6);
SECT.cad=require('./mod_cxsx_test_cad.js')(ok,near);
SECT.sv=require('./mod_cxsx_test_sv.js')(ok,near);
(async()=>{
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:860}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-cdeaud','xto-rv'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept(Q.length?Q.shift():'1'));
 await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await E("window.__find=(ty,tab,panel,en)=>Object.keys(RIBM).find(k=>{const m=RIBM[k];return m.type===ty&&m.tab===tab&&m.panel===panel&&m.en===en;}); window.__run=(ty,tab,panel,en)=>{ const id=__find(ty,tab,panel,en); if(!id)throw new Error('no ribbon entry '+en); XC[id].run(); return id; }; window.__stub=(ty,tab,panel,en)=>{ const id=__find(ty,tab,panel,en); return !!(XC[id]&&XC[id].stub); }; 1");
 const run=async(ty,tab,panel,en,...answers)=>{ Q.push(...answers); return E("__run("+JSON.stringify([ty,tab,panel,en]).slice(1,-1)+")"); };
 const stubs=async(ty,list)=>{ const r=[]; for(const l of list){ r.push(await E("__stub('"+ty+"',"+JSON.stringify(l).slice(1,-1)+")")); } return r; };
 const count=async ty=>E("(()=>{let s=0,t=0;for(const k in RIBM){if(RIBM[k].type==='"+ty+"'){t++;if(XC[k]&&XC[k].stub)s++;}}return [s,t,RIBP['"+ty+"'].built];})()");
 const want=s=>!ONLY.length||ONLY.includes(s);
 if(want('cad')) await SECT.cad({E,run,ok,near,stubs,count,Q,pg});
 if(want('sv')) await SECT.sv({E,run,ok,near,stubs,count,Q,pg});
 console.log('page errors:',er.length?er.slice(0,3):'none'); ok(er.length===0,'no page errors');
 console.log('\n'+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0);
})();
