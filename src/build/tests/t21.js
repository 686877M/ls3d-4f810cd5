const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({acceptDownloads:true,viewport:{width:1700,height:980}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|'))); pg.on('dialog',d=>d.accept()); pg.on('download',async d=>{try{await d.cancel();}catch(e){}});
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3800);
console.log('start',er.slice(0,3));
const skip=new Set(['new','rec','recdis','recasm','recsch','lang','open','w_add','setup','save','saveas','projects','pack','theme','n_walk']); const log=[];
const tabs=await pg.$$eval('#xTabs button',a=>a.length);
for(let ti=0;ti<tabs;ti++){ await pg.evaluate(i=>document.querySelectorAll('#xTabs button')[i].click(),ti); await pg.waitForTimeout(100);
 const cmds=await pg.$$eval('#xRib .xb',a=>a.map(x=>x.dataset.cmd)); for(const c of cmds){ if(skip.has(c))continue; const n=er.length; await pg.evaluate(c=>document.querySelector('#xRib .xb[data-cmd="'+c+'"]').click(),c); await pg.waitForTimeout(70); if(er.length>n)log.push(c+': '+er[er.length-1].slice(0,170)); } }
console.log('tabs',tabs,'problems',log);
console.log(await pg.evaluate(()=>__lsv.ev(`(()=>{ coRun();
 const d=svD(); d.pts='id,E,N,Z,desc\\n'+[[0,0,1164],[40,0,1164.5],[0,40,1165],[40,40,1164.2],[20,20,1164.8],[10,30,1164.6],[30,10,1164.4]].map((p,i)=>(i+1)+','+(252698.97-20+p[0])+','+(2212944.61-20+p[1])+','+p[2]).join('\\n'); svBuild(); svPanel(); const v=svVolume(1164);
 CC.id='flex'; CC.vals={Mu:120,b:1000,h:400,cv:50,db:16,s:150,fc:32,fy:420,Vu:80}; const c=CALCS[0], rows=c.run({Mu:120,Vu:80,b:1000,h:400,cv:50,db:16,s:150,fc:32,fy:420}); const rev=calReview();
 return JSON.stringify({tri:SV.res.tri.length,cont:SV.res.C.length,vol:[+v.cut.toFixed(1),+v.fill.toFixed(1),v.stn&&+v.stn.v.toFixed(1)],flex:rows.slice(0,5).map(r=>r[0].slice(0,14)+'='+r[1]+' '+r[3]),review:rev.map(r=>r[3]).join(','),bim:document.querySelector('#p-bim').innerText.slice(0,60),coord:CO.issues.map(i=>i.rule).join(',')});})()`)));
await pg.evaluate(()=>__lsv.ev("roleSet('consultant')")); await pg.waitForTimeout(600); await pg.screenshot({path:'/tmp/z1.png'});
console.log(await pg.evaluate(()=>__lsv.ev("JSON.stringify({north:document.getElementById('navArr').getAttribute('transform'),win:Object.keys(WX.lay).filter(k=>WX.lay[k].open)})")));
console.log('errs',er.slice(0,4)); await b.close();})();
