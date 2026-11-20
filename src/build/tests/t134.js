const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-rv','xto-ai'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');localStorage.setItem('xto-msspeed','1');localStorage.setItem('xto-msstep','0');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept()); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
await E("XC.ag_open.run()"); await pg.waitForTimeout(500);
const h0=await E("HI.i+'/'+HI.st.length");
const job=E("xaBuild({kind:'house',W:10,D:8,floors:2,rooms:4,ok:1})"); await pg.waitForTimeout(6500);
console.log('dock visible:',await pg.evaluate(()=>getComputedStyle(document.getElementById('xaDock')).display),'| row text:',(await pg.evaluate(()=>document.querySelector('#xaDock .r').textContent)).slice(0,60),'| bubble numbered:',(await pg.evaluate(()=>document.getElementById('xaBub').textContent)).slice(0,70));
await E("XMS.list[0].paused=true"); const i1=await E("XMS.list[0].i"); await pg.waitForTimeout(1500); const i2=await E("XMS.list[0].i"); console.log('paused: step index frozen',i1,i2);
await E("XMS.list[0].paused=false; XMS.speed=0"); await job; await pg.waitForTimeout(500);
console.log('after build elements:',await E("RV.els.length"),'| mission done row:',(await pg.evaluate(()=>document.querySelector('#xaDock .r').textContent)).slice(0,40));
const h1=await E("HI.i+'/'+HI.st.length"); console.log('history before/after build:',h0,h1);
await E("hiGo(-1)"); await pg.waitForTimeout(500); console.log('one undo -> RV elements:',await E("RV.els.length"),'(0 means whole build undone in one step; R.X is only restored if the snapshot carries it)');
/* stop */
await E("RV.els=[]; XMS.list.length=0"); const job2=E("xaBuild({kind:'house',W:10,D:8,floors:1,rooms:3,ok:1})"); await pg.waitForTimeout(1200); await E("XMS.list[0].stop=true"); await job2; console.log('stopped mid-way, elements:',await E("RV.els.length"),'msg:',(await E("XAS.chat.slice(-1)[0].t")).slice(0,40));
/* step by step */
await E("RV.els=[]; XMS.list.length=0; XMS.step=true"); const job3=E("xaBuild({kind:'house',W:10,D:8,floors:1,rooms:3,ok:1})"); await pg.waitForTimeout(1500); console.log('confirm buttons:',await pg.evaluate(()=>[...document.querySelectorAll('#xaBub button')].map(b=>b.textContent).join('|')));
for(let i=0;i<12;i++){ await pg.waitForTimeout(500); const n=await pg.evaluate(()=>document.querySelectorAll('#xaBub.ask button').length); if(n){ await pg.click('#xaBub.ask button:nth-child(1)'); } } await E("XMS.step=false"); await job3.catch(()=>{}); console.log('step mode finished, elements:',await E("RV.els.length"));
/* split + parallel */
await E("xaSplit(['model','gis','sched','hv'])"); await pg.waitForTimeout(800); console.log('split windows open:',await E("Object.keys(WX.lay).filter(k=>WX.lay[k].open).length"));
await pg.screenshot({path:'out/mission.png'}); console.log('errors',er.slice(0,3)); await b.close();})();
