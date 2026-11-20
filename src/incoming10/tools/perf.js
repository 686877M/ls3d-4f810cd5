const {chromium}=require('playwright-core');
(async()=>{ const page=process.argv[2], N=+process.argv[3]||1; const out=[];
 for(let run=0;run<N;run++){
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message));
 const cdp=await ctx.newCDPSession(pg); await cdp.send('Performance.enable');
 const M=async()=>{ const m=(await cdp.send('Performance.getMetrics')).metrics, o={}; m.forEach(x=>o[x.name]=x.value); return o; };
 await pg.goto('file://'+page,{waitUntil:'domcontentloaded',timeout:120000});
 await pg.waitForFunction(()=>window.__lsv&&document.querySelectorAll('#xTabs button').length>3,{timeout:120000}); await pg.waitForTimeout(3000);
 const m1=await M();
 await pg.waitForTimeout(5000); const m2=await M();
 const n=await pg.evaluate(()=>document.querySelectorAll('#xTabs button').length); const t0=await M();
 for(let i=0;i<n;i++){ await pg.evaluate(i=>document.querySelectorAll('#xTabs button')[i].click(),i); await pg.waitForTimeout(350); }
 const t1=await M();
 await pg.waitForTimeout(13000); const d0=await M(); await pg.waitForTimeout(5000); const d1=await M();
 out.push({startCPU:m1.TaskDuration, startScript:m1.ScriptDuration, idle5s:m2.TaskDuration-m1.TaskDuration, tabs:n, tabSwitchAvg:(t1.TaskDuration-t0.TaskDuration)/n, tabScriptAvg:(t1.ScriptDuration-t0.ScriptDuration)/n, idleLate5s:d1.TaskDuration-d0.TaskDuration, heap:m2.JSHeapUsedSize/1e6, nodes:m2.Nodes, errs:er.length});
 await b.close(); }
 console.log(JSON.stringify(out.map(o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,+(+v).toFixed(3)])))));
})();
