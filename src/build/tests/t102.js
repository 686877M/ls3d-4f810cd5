const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-acel','xto-duct','xto-dterm','xto-hvac'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-splash','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
await E("wtNew('hv')"); await pg.waitForTimeout(1500);
console.log(JSON.stringify(await E(`(()=>{ DUC.secs=[{...DUR,n:'Main',L:8,g:[1,2,9,2]},{...DUR,n:'Br',L:4,g:[9,2,9,6]},{...DUR,n:'Br2',L:5,g:[9,2,14,2]}]; DP.terms=[{k:'unit',x:1,z:2,n:'AHU 1'},{k:'diff',x:9,z:6,q:150},{k:'diff',x:14,z:2,q:200},{k:'diff',x:5,z:2.1,q:100}]; dpFlow(); return DUC.secs.map(s=>[s.n,s.L,s.Q,!!s.crit]); })()`)));
console.log('hand: Main(1-5) 450, Main b(5-9) 350, Br 150, Br2 200; critical = longest dp path');
console.log(er.slice(0,4)); await b.close();})();
