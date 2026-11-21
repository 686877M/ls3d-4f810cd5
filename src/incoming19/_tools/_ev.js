const {chromium}=require('playwright-core'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860}});await ctx.addInitScript(()=>{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');sessionStorage.setItem('xto-intro-seen','1');});
const pg=await ctx.newPage();await pg.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:120000});await pg.waitForTimeout(7000);
const exprs=fs.readFileSync(process.argv[3],'utf8').split('\n###\n');
for(const e of exprs){try{const r=await pg.evaluate(x=>__lsv.ev(x),e);console.log('>>',e.slice(0,70).replace(/\n/g,' '));console.log(typeof r==='string'?r:JSON.stringify(r));}catch(er){console.log('ERR',e.slice(0,50),er.message.slice(0,200));}}
await b.close();})();
