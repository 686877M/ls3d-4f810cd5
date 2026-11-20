/* shared harness for the wave-2 tests (office / plant / gis). */
const {chromium}=require(process.env.PWCORE||'playwright-core');
const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0, fail=0; const Q=[];
const ok=(c,m)=>{ if(c){ pass++; console.log('  ok   '+m); } else { fail++; console.log('  FAIL '+m); } };
const near=(a,b,t)=>Math.abs(a-b)<=(t===undefined?1e-6:t);
async function open(URL){
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-cdeaud','xto-rv','xto-gis','lsv3-data'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept(Q.length?Q.shift():d.defaultValue()));
 await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await E("window.__id=(ty,tab,panel,en)=>{ const id=Object.keys(RIBM).find(k=>{const m=RIBM[k];return m.type===ty&&m.tab===tab&&m.panel===panel&&m.en===en;}); if(!id)throw new Error('no ribbon entry '+en); return id; }; window.__run=(ty,tab,panel,en)=>{ const id=__id(ty,tab,panel,en); XC[id].run(); return id; }; window.__stub=(ty,tab,panel,en)=>{ const id=__id(ty,tab,panel,en); return !!(XC[id]&&XC[id].stub); }; 1");
 const run=async(ty,tab,panel,en,...answers)=>{ Q.push(...answers); return E("__run("+JSON.stringify([ty,tab,panel,en]).slice(1,-1)+")"); };
 const stubs=async(ty,list)=>{ const r=[]; for(const l of list){ r.push(await E("__stub('"+ty+"',"+JSON.stringify(l).slice(1,-1)+")")); } return r; };
 const count=async ty=>E("(()=>{let s=0,t=0;for(const k in RIBM){if(RIBM[k].type==='"+ty+"'){t++;if(XC[k]&&XC[k].stub)s++;}}return [s,t,RIBP['"+ty+"'].built];})()");
 const st=()=>pg.evaluate(()=>{const s=document.getElementById('xSt'); return s?s.textContent:'';});
 return {b,pg,er,E,run,stubs,count,st};
}
const summary=async(h)=>{ console.log('page errors:',h.er.length?h.er.slice(0,3):'none'); ok(h.er.length===0,'no page errors'); console.log('\n'+pass+' passed, '+fail+' failed'); await h.b.close(); process.exit(fail?1:0); };
module.exports={ok,near,open,summary,Q,CHROME};
