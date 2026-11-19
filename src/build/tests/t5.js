const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1400,height:850}}); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept(d.type()==='prompt'?'Project 01':undefined));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
const r=await pg.evaluate(()=>__lsv.ev(`(()=>{projSave('Project 01'); const t0=P.t; P.t=0.5; persist(); projSave('thick'); const a=libGet(); hiSnap(); hiApply(a[1].json); const back=P.t; hiApply(a[0].json); return {n:a.length,t0,back,after:P.t}})()`));
console.log(JSON.stringify(r),er.slice(0,3)); await b.close();})();
