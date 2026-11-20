const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext(); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>er.push(m.text().slice(0,80)));
await pg.goto('http://127.0.0.1:18797/',{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(12000);
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
console.log(await E("JSON.stringify({stt:AI.stt,on:BR.on,url:BR.url,tok:!!BR.token})"), await pg.evaluate(async()=>JSON.stringify(await (await fetch('/ping')).json())), er.filter(x=>!/FILE_NOT|Failed to load/.test(x)).slice(0,4)); await b.close();})();
