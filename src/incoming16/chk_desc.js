const {chromium}=require('playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}); const ctx=await b.newContext({viewport:{width:1500,height:860}});
await ctx.addInitScript(()=>{ try{ sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
const pg=await ctx.newPage(); await pg.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(8000);
console.log(JSON.stringify(await pg.evaluate(()=>__lsv.ev("({total:Object.keys(XC).length,missing:Object.keys(XC).filter(k=>!XDESC[k]).slice(0,8),n:Object.keys(XC).filter(k=>!XDESC[k]).length,demo:!!XDESC.demo_start&&!!XDESC.demo_stop})")))); await b.close(); })();
