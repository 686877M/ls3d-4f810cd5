const {chromium}=require('playwright-core'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({acceptDownloads:true,viewport:{width:1700,height:980}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|'))); pg.on('dialog',d=>d.accept());
const dls=[]; pg.on('download',async d=>{const p='/tmp/pk_'+d.suggestedFilename(); try{await d.saveAs(p); dls.push([d.suggestedFilename(),fs.statSync(p).size]);}catch(e){}});
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(800); await pg.screenshot({path:'/tmp/sp1.png'}); await pg.waitForTimeout(3000);
console.log('start',er.slice(0,3));
const skip=new Set(['new','rec','recdis','recasm','recsch','lang','open','w_add','setup','save','saveas','projects','pack','theme']); const log=[];
const tabs=await pg.$$eval('#xTabs button',a=>a.length);
for(let ti=0;ti<tabs;ti++){ await pg.evaluate(i=>document.querySelectorAll('#xTabs button')[i].click(),ti); await pg.waitForTimeout(100);
 const cmds=await pg.$$eval('#xRib .xb',a=>a.map(x=>x.dataset.cmd)); for(const c of cmds){ if(skip.has(c))continue; const n=er.length; await pg.evaluate(c=>document.querySelector('#xRib .xb[data-cmd="'+c+'"]').click(),c); await pg.waitForTimeout(80); if(er.length>n)log.push(c+': '+er[er.length-1].slice(0,160)); } }
console.log('tabs',tabs,'problems',log);
// agent builtin
console.log(await pg.evaluate(async()=>{ await __lsv.ev("agSend('اعرض المسقط وفك')"); await __lsv.ev("agSend('امتى النهاية و كام التكلفة')"); return __lsv.ev("JSON.stringify(XAG.log.map(m=>m.t))"); }));
// scenarios + MC + price
console.log(await pg.evaluate(()=>__lsv.ev("(()=>{wxOpen('pane:scen'); const r=SC.sc.map(s=>scOne(s).fin); SC.N=150; SC.mc=scMC(); SC.quotes='supplier,code,unit price\\nA,C01,100\\nB,C01,120\\nC,C01,180\\nA,M01,5000\\nB,M01,5200'; scPanel(); return JSON.stringify({fin:r,p:SC.mc.p,tables:document.querySelectorAll('#p-scen table').length,txt:document.querySelector('#p-scen').innerText.includes('Best basket')||document.querySelector('#p-scen').innerText.includes('أفضل سلة')})})()")));
// codes
console.log(await pg.evaluate(()=>__lsv.ev("(()=>{codesOpen(PART_TAGS.wwall,'wall'); return document.querySelectorAll('#p-codes .xm, #p-codes div[style*=\"cursor:pointer\"]').length+' rows'})()")));
// package
console.log('pack',await pg.evaluate(()=>__lsv.ev("xPack().then(r=>JSON.stringify(r))")));
await pg.waitForTimeout(1500); console.log(dls); console.log('errs',er.slice(0,4)); await b.close();})();
