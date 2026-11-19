const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({acceptDownloads:true,viewport:{width:1700,height:980}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|'))); pg.on('dialog',d=>d.accept()); pg.on('download',async d=>{try{await d.cancel();}catch(e){}});
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3800); console.log('start',er.slice(0,3)); await pg.screenshot({path:'/tmp/w1.png'});
const skip=new Set(['new','rec','recdis','recasm','recsch','lang','open','w_add','setup','save','saveas','projects','pack','theme','n_walk']);
const tabs=await pg.$$eval('#xTabs button',a=>a.length);
for(let ti=0;ti<tabs;ti++){ await pg.evaluate(i=>document.querySelectorAll('#xTabs button')[i].click(),ti); await pg.waitForTimeout(100);
 const cmds=await pg.$$eval('#xRib .xb',a=>a.map(x=>x.dataset.cmd)); for(const c of cmds){ if(skip.has(c))continue; const n=er.length; const t0=Date.now(); await Promise.race([pg.evaluate(c=>document.querySelector('#xRib .xb[data-cmd="'+c+'"]').click(),c),new Promise(r=>setTimeout(()=>r('TIMEOUT'),8000))]).then(r=>{if(r==='TIMEOUT')console.log('HANG',c)}); await pg.waitForTimeout(60); if(Date.now()-t0>3000)console.log('SLOW',c,Date.now()-t0); if(er.length>n)console.log('ERR',c,er[er.length-1].slice(0,170)); } }
console.log('clickthrough done',tabs); console.log('errs',er.slice(0,3)); await b.close();})();
