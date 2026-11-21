const path=require('path'), SP=process.env.SP, fs=require('fs');
const {chromium}=require(path.join(SP,'pw/node_modules/playwright-core'));
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1440,height:900}});
 await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1')}catch(e){}});
 const pg=await ctx.newPage(); const cdp=await ctx.newCDPSession(pg);
 await pg.goto(process.argv[2],{waitUntil:'load',timeout:300000}); await pg.waitForTimeout(3000);
 await pg.evaluate(t=>__lsv.ev("wtNew('"+t+"');0"),process.argv[3]); await pg.waitForTimeout(5000);
 await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{interval:300}); await cdp.send('Profiler.start');
 await pg.waitForTimeout(6000);
 const {profile}=await cdp.send('Profiler.stop'); fs.writeFileSync(process.argv[4],JSON.stringify(profile)); await b.close();
})();
