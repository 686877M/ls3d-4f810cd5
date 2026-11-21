const path=require('path'), SP=process.env.SP, fs=require('fs');
const {chromium}=require(path.join(SP,'pw/node_modules/playwright-core'));
const PAGE=process.argv[2], MODE=process.argv[3]||'login';
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1440,height:900}});
 if(MODE==='app')await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1')}catch(e){}});
 const pg=await ctx.newPage(); const cdp=await ctx.newCDPSession(pg);
 await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{interval:500}); await cdp.send('Profiler.start');
 await pg.goto(PAGE,{waitUntil:'load',timeout:300000}); await pg.waitForTimeout(2500);
 const {profile}=await cdp.send('Profiler.stop'); fs.writeFileSync(process.argv[4]||'/tmp/prof.json',JSON.stringify(profile)); await b.close();
})();
