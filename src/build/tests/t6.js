const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1300,height:800}}); const er=[]; pg.on('pageerror',x=>er.push(x.message));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
await pg.evaluate(()=>__lsv.ev('wsShow(true)')); await pg.waitForTimeout(500);
const hd=await pg.$('#wswin div[style*="cursor:move"]'); const bb=await hd.boundingBox(); await pg.mouse.move(bb.x+40,bb.y+8); await pg.mouse.down(); await pg.mouse.move(bb.x+140,bb.y+88,{steps:5}); await pg.mouse.up();
const r=await pg.evaluate(()=>__lsv.ev('JSON.stringify({w:wsD().w[0],hi:HI.st.length})')); console.log(r,er.slice(0,3)); await pg.screenshot({path:'/tmp/ws.png'}); await b.close();})();
