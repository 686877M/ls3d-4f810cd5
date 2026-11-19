const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:900}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message));
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{timeout:90000}); await pg.waitForTimeout(6000);
console.log('lobby auto',await E("!!document.getElementById('xLobby')"));
await pg.screenshot({path:'/tmp/lobby.png'});
await E("lbAsk('جدول')"); await pg.waitForTimeout(900); console.log('after ask',await E("!!document.getElementById('xLobby')+' tab='+WTAB.tabs.find(t=>t.id===WTAB.cur).type"));
await E("lbShow()"); await pg.waitForTimeout(500); await E("document.querySelectorAll('#xLobby .rm')[9].click()"); await pg.waitForTimeout(600); console.log('dc room',await E("!!document.getElementById('xLobby')+' widgets='+Object.keys(WX.lay).filter(k=>WX.lay[k].open).join()"));
console.log('ERR',er.slice(0,3)); await b.close();})();
