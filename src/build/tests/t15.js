const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({acceptDownloads:true,viewport:{width:1600,height:950}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|'))); pg.on('dialog',d=>d.accept(d.type()==='prompt'?'Test':undefined));
let dl=0; pg.on('download',async d=>{dl++; try{await d.cancel();}catch(e){}});
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3500);
console.log('start errs',er.slice(0,3)); await pg.screenshot({path:'/tmp/x1.png'});
const tabs=await pg.$$eval('#xTabs button',a=>a.map(x=>x.textContent)); console.log('tabs',tabs.length);
const skip=new Set(['new','rec','recdis','recasm','recsch','theme','lang','open','w_add','setup','save','saveas','projects']);
const log=[];
for(let ti=0;ti<tabs.length;ti++){ await pg.evaluate(i=>document.querySelectorAll('#xTabs button')[i].click(),ti); await pg.waitForTimeout(150);
 const cmds=await pg.$$eval('#xRib .xb',a=>a.map(x=>x.dataset.cmd));
 for(const c of cmds){ if(skip.has(c))continue; const before=er.length; await pg.evaluate(c=>document.querySelector('#xRib .xb[data-cmd="'+c+'"]').click(),c).catch(e=>log.push('ERR '+c+' '+e.message.slice(0,80))); await pg.waitForTimeout(120); if(er.length>before)log.push('PAGEERR '+c+': '+er[er.length-1].slice(0,200)); }
}
console.log('log',log.slice(0,12),'downloads',dl);
await pg.evaluate(()=>__lsv.ev("wxPreset('model')")); await pg.waitForTimeout(600);
await pg.mouse.click(700,500,{button:'right'}); await pg.waitForTimeout(400); await pg.screenshot({path:'/tmp/x2.png'});
console.log('menu items',await pg.$$eval('.xmenu .xm',a=>a.length));
console.log('errs',er.slice(0,4)); await b.close();})();
