const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1500,height:900}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|')));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
await pg.evaluate(()=>__lsv.ev("tab('site'); spShow(true); spZoom(true)")); await pg.waitForTimeout(1500);
await pg.screenshot({path:'/tmp/site1.png'});
await pg.evaluate(()=>__lsv.ev("spZoom(false)")); await pg.waitForTimeout(1200); await pg.screenshot({path:'/tmp/site2.png'});
console.log(await pg.evaluate(()=>__lsv.ev("JSON.stringify({kids:spG.children.length,masses:spMasses.length,far:camera.far})")),er); await b.close();})();
