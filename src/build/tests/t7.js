const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1300,height:800}}); const er=[]; pg.on('pageerror',x=>er.push(x.message));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
await pg.evaluate(()=>__lsv.ev('wsShow(true)')); await pg.waitForTimeout(500);
const info=await pg.evaluate(()=>{const hs=[...document.querySelectorAll('#wswin div')].filter(d=>d.style.cursor==='move'); const r=hs[0].getBoundingClientRect(); const t=document.elementFromPoint(r.x+40,r.y+8); return {n:hs.length,r:[r.x,r.y],top:t.tagName+':'+(t.id||t.textContent.slice(0,20))};});
console.log(JSON.stringify(info));
await pg.mouse.move(info.r[0]+40,info.r[1]+8); await pg.mouse.down(); await pg.mouse.move(info.r[0]+140,info.r[1]+88,{steps:5}); await pg.mouse.up();
console.log(await pg.evaluate(()=>__lsv.ev('JSON.stringify({w:wsD().w[0],hi:HI.st.length})')),er); await b.close();})();
