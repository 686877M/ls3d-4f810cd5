const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1400,height:800}}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-theme2'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');localStorage.setItem('xto-noask','{"model":1,"gis":1}');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
await E("wtNew('gis')"); await E("wtNew('gis')"); const n0=await E("WTAB.tabs.length"); const id=await E("WTAB.cur");
console.log('tid attr present:',await pg.evaluate(()=>document.querySelectorAll('#xDocTabs .dt[data-tid]').length),'of',n0);
await E("wtClose('"+id+"')"); await pg.waitForTimeout(40); console.log('still there mid-animation:',await E("WTAB.tabs.length"),'running anims:',await pg.evaluate(()=>document.getAnimations().length>0)); await pg.waitForTimeout(500); console.log('after:',await E("WTAB.tabs.length"));
await E("OTS.motion='none'; otApply(); wtClose(WTAB.cur)"); await pg.waitForTimeout(50); console.log('motion none closes at once:',await E("WTAB.tabs.length"),er.slice(0,3)); await b.close();})();
