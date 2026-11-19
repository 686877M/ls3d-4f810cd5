const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1400,height:850}}); const er=[]; pg.on('pageerror',x=>er.push(x.message));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
await pg.evaluate(()=>__lsv.ev("tab('meas'); MSR.mode='dist'")); 
const x=899,y=436;
for(const [dx,dy] of [[0,0],[60,-30]]){ await pg.mouse.move(x+dx,y+dy); await pg.mouse.down(); await pg.mouse.up(); await pg.waitForTimeout(200);
 console.log(await pg.evaluate(()=>__lsv.ev('JSON.stringify({d:MSR._d,mode:MSR.mode,n:MSR.pts.length,l:MSR.list.length,tab:curTab})')));}
console.log(await pg.evaluate(([x,y])=>__lsv.ev('(()=>{const h=measHit({clientX:'+x+',clientY:'+y+'}); return h?h.p.toArray().join(","):"nohit"})()'),[x,y]), er); await b.close();})();
