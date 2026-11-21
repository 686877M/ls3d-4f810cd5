/* node measure.js <page> <mode:login|app> [idleSec] -> one JSON line. Run via nice, one chrome at a time. */
const path=require('path'), SP=process.env.SP;
const {chromium}=require(path.join(SP,'pw/node_modules/playwright-core'));
const PAGE=process.argv[2], MODE=process.argv[3]||'app', IDLE=+(process.argv[4]||6);
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{
 const b=await chromium.launch({executablePath:CHROME,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 const ctx=await b.newContext({viewport:{width:1440,height:900}});
 await ctx.addInitScript(m=>{
  try{ if(m==='app'){ sessionStorage.setItem('xto-auth','1'); } }catch(e){}
  const W=window; W.__pf={marks:{},raf:0,st:0,st0:0,iv:new Map(),ivSet:0,t0:performance.now()};
  const P=W.__pf, mk=(k)=>{ if(!(k in P.marks))P.marks[k]=Math.round(performance.now()); };
  const oRaf=W.requestAnimationFrame.bind(W); W.requestAnimationFrame=function(f){ P.raf++; return oRaf(function(t){ if(!P.marks.frame1&&document.getElementById('xLogin'))mk('frame1'); return f(t); }); };
  const oSI=W.setInterval.bind(W), oCI=W.clearInterval.bind(W); W.setInterval=function(f,t,...a){ const id=oSI(f,t,...a); P.ivSet++; P.iv.set(id,{t:t,src:String(f).slice(0,90)}); return id; }; W.clearInterval=function(id){ P.iv.delete(id); return oCI(id); };
  const oST=W.setTimeout.bind(W); W.setTimeout=function(f,t,...a){ P.st++; return oST(f,t,...a); };
  const chk=()=>{ const d=document; if(d.getElementById('xLogin'))mk('login'); const t=d.getElementById('xTabs'); if(t&&t.children.length>0)mk('ribbon'); const a=d.querySelector('.app'); if(a&&getComputedStyle(a).visibility!=='hidden')mk('appvis'); };
  const mo=new MutationObserver(chk); document.addEventListener('DOMContentLoaded',()=>{ mk('dcl'); chk(); mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']}); });
  W.addEventListener('load',()=>{ mk('load'); chk(); });
 },MODE);
 const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,100)));
 const cdp=await ctx.newCDPSession(pg); await cdp.send('Performance.enable');
 const met=async()=>{ const r=(await cdp.send('Performance.getMetrics')).metrics, o={}; r.forEach(x=>o[x.name]=x.value); return o; };
 const t0=Date.now(); await pg.goto(PAGE,{waitUntil:'commit',timeout:300000});
 const key='ribbon';
 await pg.waitForFunction(k=>window.__pf&&(k in window.__pf.marks),key,{timeout:300000,polling:50});
 const wall=Date.now()-t0; const mReady=await met();
 await pg.waitForFunction(()=>'load' in window.__pf.marks,null,{timeout:300000,polling:100}).catch(()=>{});
 await pg.waitForTimeout(4000); /* settle */
 const m1=await met(), p1=await pg.evaluate(()=>({raf:__pf.raf,st:__pf.st}));
 await pg.waitForTimeout(IDLE*1000);
 const m2=await met(), p2=await pg.evaluate(()=>({raf:__pf.raf,st:__pf.st,iv:[...__pf.iv.values()].length,ivSrc:[...__pf.iv.values()].map(x=>x.t+'ms:'+x.src.replace(/\s+/g,' ')),marks:__pf.marks,heap:performance.memory&&performance.memory.usedJSHeapSize,fcp:Math.round((performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime||-1),scripts:performance.getEntriesByType('navigation')[0].toJSON()}));
 const out={mode:MODE,wallToKey:wall,marks:p2.marks,fcp:p2.fcp,
  cpuToReady:+(mReady.TaskDuration).toFixed(2),scriptToReady:+(mReady.ScriptDuration).toFixed(2),
  idleSec:IDLE,idleTask:+((m2.TaskDuration-m1.TaskDuration)/IDLE).toFixed(4),idleScript:+((m2.ScriptDuration-m1.ScriptDuration)/IDLE).toFixed(4),
  idleRafPerSec:+((p2.raf-p1.raf)/IDLE).toFixed(1),idleTimeoutsPerSec:+((p2.st-p1.st)/IDLE).toFixed(1),intervalsActive:p2.iv,
  heapMB:+(m2.JSHeapUsedSize/1048576).toFixed(1),nodes:m2.Nodes,listeners:m2.JSEventListeners,errs:errs.slice(0,3),dclNav:Math.round(p2.scripts.domContentLoadedEventEnd),loadNav:Math.round(p2.scripts.loadEventEnd)};
 if(process.env.IV)out.ivSrc=p2.ivSrc;
 console.log(JSON.stringify(out)); await b.close();
})().catch(e=>{console.log(JSON.stringify({err:String(e).slice(0,200)})); process.exit(1);});
