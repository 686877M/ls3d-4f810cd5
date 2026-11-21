/* per tab type: open cost (cpu s) + idle cost after settling. fresh page each. node tabidle.js page [types,comma] */
const path=require('path'), SP=process.env.SP;
const {chromium}=require(path.join(SP,'pw/node_modules/playwright-core'));
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 const mk=async()=>{ const ctx=await b.newContext({viewport:{width:1440,height:900}});
  await ctx.addInitScript(()=>{ try{sessionStorage.setItem('xto-auth','1'); localStorage.setItem('xto-test','1');}catch(e){} const P=window.__pf={raf:0,st:0}; const r=requestAnimationFrame.bind(window); window.requestAnimationFrame=f=>{P.raf++;return r(f)}; const s=setTimeout.bind(window); window.setTimeout=(f,t,...a)=>{P.st++;return s(f,t,...a)}; });
  const pg=await ctx.newPage(); const cdp=await ctx.newCDPSession(pg); await cdp.send('Performance.enable');
  const met=async()=>{ const o={}; (await cdp.send('Performance.getMetrics')).metrics.forEach(x=>o[x.name]=x.value); return o; };
  await pg.goto(process.argv[2],{waitUntil:'load',timeout:300000}); await pg.waitForTimeout(3000); return {ctx,pg,met}; };
 let types=process.argv[3]?process.argv[3].split(','):null;
 if(!types){ const {ctx,pg}=await mk(); types=await pg.evaluate(()=>__lsv.ev('Object.keys(WTYPES)')); await ctx.close(); }
 for(const t of types){
  const {ctx,pg,met}=await mk(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,80)));
  const m0=await met(); const w0=Date.now();
  await pg.evaluate(t=>{ window.__q=[]; try{ __lsv.ev("wtNew('"+t+"');0"); }catch(e){ window.__q.push(String(e)); } },t).catch(e=>errs.push('open:'+String(e).slice(0,60)));
  const m1=await met(); const open=Date.now()-w0;
  await pg.waitForTimeout(3000);
  const m2=await met(), p2=await pg.evaluate(()=>({raf:__pf.raf,st:__pf.st}));
  await pg.waitForTimeout(5000);
  const m3=await met(), p3=await pg.evaluate(()=>({raf:__pf.raf,st:__pf.st}));
  console.log(JSON.stringify({type:t,openWall:open,openCpu:+(m1.TaskDuration-m0.TaskDuration).toFixed(3),settleCpu:+(m2.TaskDuration-m1.TaskDuration).toFixed(2),idleTaskPerS:+((m3.TaskDuration-m2.TaskDuration)/5).toFixed(4),idleScriptPerS:+((m3.ScriptDuration-m2.ScriptDuration)/5).toFixed(4),rafPerS:(p3.raf-p2.raf)/5,toPerS:(p3.st-p2.st)/5,heapMB:+(m3.JSHeapUsedSize/1048576).toFixed(1),errs:errs.slice(0,2)}));
  await ctx.close();
 }
 await b.close();
})();
