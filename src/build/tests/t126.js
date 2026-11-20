const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:1400,height:800}}); await ctx.addInitScript(()=>{try{localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file://'+process.argv[3]+'/site/_t.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(4500);
console.log('shots',await E("INTRO.shots.map(s=>s[0].split('/')[1]+' '+s[1]).join(' | ')"),'bad',await E("INTRO.pre.map(v=>v.__bad?1:0).join('')"),'pattern',await E("OCC.pat"));
await pg.fill('#xlP','6868'); const t0=Date.now(); let end=0; for(let i=0;i<70;i++){ await pg.waitForTimeout(500); const s=await pg.evaluate(()=>!!document.getElementById('xIntro')); if(s)end=(Date.now()-t0)/1000; }
console.log('intro lasted ~',end,'s',er.slice(0,3)); await b.close();})();
