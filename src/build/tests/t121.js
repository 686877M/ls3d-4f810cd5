const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{['xto-tabs'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
console.log('btn:',await pg.evaluate(()=>[...document.querySelectorAll('#xRib [data-cmd^="mn_"]')].map(b=>b.dataset.cmd+':'+b.textContent).join('|')),'old tab_ btns left:',await pg.evaluate(()=>document.querySelectorAll('#xRib [data-cmd^="tab_"]').length));
await pg.click('#xRib [data-cmd="mn_tabs"]'); await pg.waitForTimeout(300); await pg.hover('.mnr:nth-child(2)'); await pg.waitForTimeout(300); await pg.screenshot({path:'out/menu.png'});
const n0=await E("WTAB.tabs.length"); await pg.click('.mnr:nth-child(2) .sub .mnr:nth-child(1)'); await pg.waitForTimeout(500); console.log('tabs',n0,'->',await E("WTAB.tabs.length"),er.slice(0,3)); await b.close();})();
