const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1500,height:900}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|')));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
await pg.evaluate(()=>__lsv.ev("tab('rebar'); rbShow(true); state.ghost=true; applyFlags(); controls.target.set(1,2.5,0); camera.position.set(9,6,-9); controls.update()")); await pg.waitForTimeout(1200); await pg.screenshot({path:'/tmp/rb1.png'});
console.log(await pg.evaluate(()=>__lsv.ev("JSON.stringify(RB.rows.map(r=>[r[0],Math.round(r[2]),Math.round(r[3])]))")));
await pg.evaluate(()=>__lsv.ev("tab('site'); rbShow(false); spShow(true); SP.mstyle='dotted'; SP.cut.y.on=0; spBuild(); spPreset('iso')")); await pg.waitForTimeout(1200); await pg.screenshot({path:'/tmp/sp3.png'});
console.log(er.slice(0,4)); await b.close();})();
