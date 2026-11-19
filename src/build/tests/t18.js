const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1700,height:980}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|')));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3500);
await pg.screenshot({path:'/tmp/y1.png'});
// interactions: tick checklist item, mark done, change scale, play
await pg.evaluate(()=>__lsv.ev("TL.sel='B2'; tlRender()")); await pg.waitForTimeout(300);
await pg.evaluate(()=>{const c=document.querySelector('#tlw .tlc input'); c&&c.click();}); await pg.waitForTimeout(300);
await pg.evaluate(()=>{const r=document.querySelector('#tlw tr[data-id="A1"] input[data-f="done"]'); r&&r.click();}); await pg.waitForTimeout(300);
console.log(await pg.evaluate(()=>__lsv.ev("JSON.stringify(ACT.filter(a=>['A1','B2'].includes(a.id)).map(a=>[a.id,a.pct,a.as,a.af,a.ck]))")));
await pg.evaluate(()=>__lsv.ev("TL.scale='hour'; tlRender(); schedOn=true; DAY=12; applyDay();")); await pg.waitForTimeout(500); await pg.screenshot({path:'/tmp/y2.png'});
await pg.evaluate(()=>__lsv.ev("TL.scale='week'; PLAYING=true; tlRender()")); await pg.waitForTimeout(2500);
console.log('day',await pg.evaluate(()=>__lsv.ev("DAY.toFixed(1)")),er.slice(0,4)); await b.close();})();
