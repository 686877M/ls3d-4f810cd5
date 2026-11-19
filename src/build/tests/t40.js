const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{if(m.type()==='error')er.push('C:'+m.text().slice(0,150));});
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(4500); await pg.screenshot({path:'/tmp/s0.png'});
console.log('init',JSON.stringify(await E("({tabs:WT.tabs.map(t=>t.type),cur:WT.cur,bar:document.querySelectorAll('#xDocTabs .dt').length})")),er.slice(0,4));
await E("wtNew('survey')"); await pg.waitForTimeout(800); await pg.screenshot({path:'/tmp/s1.png'});
console.log('dc',JSON.stringify(await E("(()=>{ const d=dcAdd({type:'RFI',dir:'out',subject:'Test RFI',from:'Contractor',to:'Consultant',body:'Q?'}); const c=dcTndCalc(); const R=dcFeasCalc({rev:100000,opex:20000,life:20,rate:8},500000); const B=dcBearing({c:0,phi:30,gam:18,B:2,Df:1.5,fs:3,shape:'square'}); return {ref:d.ref,rows:c.rows.length,total:c.total,npv:R.npv,irr:R.irr,qu:B.qu,nq:B.Nq}; })()")));
for(const t of ['reg','tnd','fs','ipc','soil','rep','file','crm','gl']){ await E("dcOpen('"+t+"')"); await pg.waitForTimeout(150);} 
await E("dcOpen('reg')"); await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/s2.png'});
await E("wxOpen('soc',[.5,.05,.48,.9]); socPanel();"); await pg.waitForTimeout(400); await pg.screenshot({path:'/tmp/s3.png'});
await E("wxOpen('player',[.6,.5,.38,.45]);"); await pg.waitForTimeout(300);
console.log('card',JSON.stringify(await E("(()=>{const c=socCard(); return [c.width,c.height];})()")),'errors',er.slice(0,6)); await b.close();})();
