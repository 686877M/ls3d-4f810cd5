const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({acceptDownloads:true,viewport:{width:1700,height:980}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|'))); pg.on('dialog',d=>d.accept()); pg.on('download',async d=>{try{await d.cancel();}catch(e){}});
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3500);
console.log('start',er.slice(0,3));
const skip=new Set(['new','rec','recdis','recasm','recsch','lang','open','w_add','setup','save','saveas','projects']); const log=[];
const tabs=await pg.$$eval('#xTabs button',a=>a.length);
for(let ti=0;ti<tabs;ti++){ await pg.evaluate(i=>document.querySelectorAll('#xTabs button')[i].click(),ti); await pg.waitForTimeout(100);
 const cmds=await pg.$$eval('#xRib .xb',a=>a.map(x=>x.dataset.cmd)); for(const c of cmds){ if(skip.has(c))continue; const n=er.length; await pg.evaluate(c=>document.querySelector('#xRib .xb[data-cmd="'+c+'"]').click(),c); await pg.waitForTimeout(80); if(er.length>n)log.push(c+': '+er[er.length-1].slice(0,160)); } }
console.log('clickthrough',tabs,'tabs; problems',log);
for(const k of ['blueprint','gold','drafting']){ await pg.evaluate(k=>__lsv.ev("XSK.id='"+k+"'; XSK.custom={}; xSkinApply(true); wxPreset('model')"),k); await pg.waitForTimeout(500); await pg.screenshot({path:'/tmp/th_'+k+'.png'}); }
console.log(await pg.evaluate(()=>__lsv.ev("JSON.stringify({cmds:BVT.call('commands').length,agent:!!document.querySelector('#p-agent select'),look:document.querySelectorAll('#p-look button').length})")));
console.log('errs',er.slice(0,4)); await b.close();})();
