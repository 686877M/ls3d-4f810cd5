const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:900}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{if(m.type()==='error')er.push('C:'+m.text().slice(0,150));});
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(5000);
await E("wtNew('sched')"); await pg.waitForTimeout(700);
console.log('tabs',await E("WTAB.tabs.map(t=>t.type).join()"),'bar',await E("[...document.querySelectorAll('#xDocTabs .dt span')].map(s=>s.textContent).join(' | ')"));
await pg.screenshot({path:'/tmp/tabs1.png'});
await pg.click('#xDocTabs .dt.on b'); await pg.waitForTimeout(400); console.log('dialog',await E("!!document.querySelector('[style*=\"z-index:99999\"]')"));
await pg.screenshot({path:'/tmp/askclose.png'});
await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); console.log('cancel keeps tab',await E("WTAB.tabs.length"));
await pg.click('#xDocTabs .dt.on b'); await pg.waitForTimeout(300); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600); console.log('save and close',await E("WTAB.tabs.length"));
/* link motion indicator */
await E("TL.link=true; XC.dis.run()"); await pg.waitForTimeout(2500); console.log('indicator during disassembly',await E("document.getElementById('xInd').style.display+' '+(document.getElementById('xInd').innerText||'').slice(0,80)"));
/* flows */
await E("XC.wf_struct.run()"); await pg.waitForTimeout(4500); console.log('struct flow',await E("JSON.stringify(Object.values(WF.res.struct).map(r=>r.st))"));
await pg.screenshot({path:'/tmp/flow1.png'});
await E("WF.cur='mep'; wfRun('mep')"); await pg.waitForTimeout(3000); console.log('mep',await E("JSON.stringify(Object.values(WF.res.mep).map(r=>r.st))"));
await E("WF.cur='qa'; wfRun('qa')"); await pg.waitForTimeout(2500); console.log('qa',await E("JSON.stringify(Object.values(WF.res.qa).map(r=>r.st+':'+r.t.slice(0,50)))"));
console.log('ERR',er.slice(0,6)); await b.close();})();
