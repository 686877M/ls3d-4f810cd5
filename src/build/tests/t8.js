const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1300,height:800}}); const er=[]; pg.on('pageerror',x=>er.push(x.message));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
const top=await pg.evaluate(()=>{const t=document.elementFromPoint(300,300); return t.tagName+'#'+t.id;}); console.log('topmost',top);
const cam=()=>pg.evaluate(()=>__lsv.ev('camera.position.toArray().map(v=>+v.toFixed(2)).join(",")+" tgt "+controls.target.toArray().map(v=>+v.toFixed(2)).join(",")'));
console.log('before',await cam()); await pg.evaluate(()=>__lsv.ev('play(1)')); await pg.waitForTimeout(3500); console.log('playing',await cam(), await pg.evaluate(()=>__lsv.ev('A.s.toFixed(2)+" card:"+(fCard&&!fCard.hidden)')));
await pg.screenshot({path:'/tmp/play.png'}); console.log(er.slice(0,3)); await b.close();})();
