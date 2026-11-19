const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--autoplay-policy=no-user-gesture-required','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-splash','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5500);
console.log(JSON.stringify(await E("(()=>{const p=pryToday(); return p&&{L:p.L,t:Object.fromEntries(Object.entries(p.t).map(e=>[e[0],pFmt(e[1])]))};})()")));
console.log('cairo',JSON.stringify(await E("(()=>{const t=prayerTimes(new Date(2026,10,19),30.0444,31.2357,2,'egy',1); return Object.fromEntries(Object.entries(t).map(e=>[e[0],pFmt(e[1])]));})()")));
console.log('makkah',JSON.stringify(await E("(()=>{const t=prayerTimes(new Date(2026,10,19),21.4225,39.8262,3,'uq',1); return Object.fromEntries(Object.entries(t).map(e=>[e[0],pFmt(e[1])]));})()")));
await pg.screenshot({path:'/tmp/pr1.png'}); console.log(er.slice(0,3)); await b.close();})();
