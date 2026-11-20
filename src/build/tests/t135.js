const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-rv','xto-ai'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');localStorage.setItem('xto-msspeed','0');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{ if(m.type()==='error')er.push('C:'+m.text().slice(0,100)); }); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
console.log('speed',await E("XMS.speed"),'list',await E("XMS.list.length"));
const r=await E("xaBuild({kind:'house',W:10,D:8,floors:2,rooms:4,ok:1}).then(()=>'ok',e=>'ERR '+e.message)"); console.log('build result:',r,'| list',await E("XMS.list.length+' '+JSON.stringify(XMS.list.map(m=>[m.title,m.i,m.done]))"),'| els',await E("RV.els.length"),'| chat tail',(await E("XAS.chat.slice(-2).map(m=>m.t).join(' / ')")).slice(0,150),er.slice(0,3)); await b.close();})();
