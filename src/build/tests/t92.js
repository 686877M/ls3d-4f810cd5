const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-splash','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
for(const t of ['plant','sched','coord']){ await E("wtNew('"+t+"')"); await pg.waitForTimeout(1500); console.log(t,JSON.stringify(await E("({built:RIBP['"+t+"'].built,tot:RIBP['"+t+"'].tot})")),await pg.evaluate(()=>[...document.querySelectorAll('#xTabs button')].map(b=>b.textContent+(b.classList.contains('on')?'*':'')).join(' | '))); await pg.screenshot({path:'/tmp/pg_'+t+'.png',clip:{x:0,y:30,width:1500,height:140}}); }
console.log(er.slice(0,4)); await b.close();})();
