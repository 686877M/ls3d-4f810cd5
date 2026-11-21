/* demo test. Run: NODE_PATH=<SP>/pw/node_modules nice -n 15 node test_demo.js <index.test.html> <scenario> [from] [to] [outdir]
   scenarios: smoke (lazy load, buttons, no startup cost) | run (chapters from..to at 4x, verifies results) | stop (stop mid-way, restore) | pause (pause/resume/skip/jump) | entry (entry-screen button) */
const {chromium}=require('playwright-core'); const fs=require('fs');
const FILE=process.argv[2], SC=process.argv[3]||'smoke', FROM=+(process.argv[4]||0), TO=process.argv[5]!==undefined&&process.argv[5]!==''?+process.argv[5]:99, OUT=process.argv[6]||'/tmp/demo_shots';
fs.mkdirSync(OUT,{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++; };
(async()=>{
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true});
const entry=SC==='entry';
await ctx.addInitScript(e=>{ try{ ['xto-tabs','xto-dc','xto-cdeaud'].forEach(k=>localStorage.removeItem(k)); if(!e)sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(x){} },entry);
const pg=await ctx.newPage(), er=[], dl=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept('')); pg.on('download',d=>dl.push(d.suggestedFilename()));
const E=s=>pg.evaluate(s=>{ const r=__lsv.ev(s); return Promise.resolve(r).then(v=>v===undefined?null:JSON.parse(JSON.stringify(v))); },s);
const shot=async n=>{ try{ await pg.screenshot({path:OUT+'/'+n+'.png'}); }catch(e){} };
const T0=Date.now(); const log=m=>console.log('['+Math.round((Date.now()-T0)/1000)+'s] '+m);
await pg.goto('file://'+FILE,{waitUntil:'domcontentloaded',timeout:180000});
if(entry){ await pg.waitForSelector('#xLogin .xdemo',{timeout:60000}); }
else await pg.waitForTimeout(8000);
const wait=async(f,ms,step)=>{ const t=Date.now(); while(Date.now()-t<ms){ if(await E(f))return true; await pg.waitForTimeout(step||1000); } return false; };
if(SC==='smoke'){
 ok(await E("DMX.api===null&&!document.getElementById('xDemoBar')&&!document.getElementById('xDemoCss')"),'startup: demo not loaded, no demo DOM');
 ok(await E("!!document.getElementById('xDemoSrc')"),'demo source is a plain-text block (not executed)');
 ok(await E("!!startBox.querySelector('.xdemo')"),'Start page has the demo button');
 ok(await E("!!XC.demo_start&&!!XC.demo_stop&&!!XDESC.demo_start"),'commands + descriptions registered');
 ok(await E("typeof TOX.demo.start==='function'"),'TOX.demo API');
 await pg.click('.xdemo'); await pg.waitForTimeout(2500); await shot('smoke_confirm');
 ok(await E("DMX.api!==null&&!!document.getElementById('xDemoBar')"),'click loads the demo and shows the confirm card');
 ok(await E("DMX.api.state().chapters.join()"),'chapters: '+await E("DMX.api.state().chapters.join()"));
 await pg.click('#xDemoBar button:has-text("Cancel"), #xDemoBar button:has-text("إلغاء")'); await pg.waitForTimeout(500);
 ok(await E("!document.getElementById('xDemoBar')&&!document.getElementById('xDemoCur')"),'Cancel on the confirm card leaves nothing behind');
}
if(SC==='run'||SC==='stop'||SC==='pause'){
 const before=await E("({name:dcProjName(),tpl:tpId(),rv:RV.els.length})"); log('before '+JSON.stringify(before));
 await E("demoStart({yes:1,speed:4,from:"+FROM+",to:"+Math.min(TO,98)+"})"); // no await: runs in background
 await pg.waitForTimeout(3000); await shot('run_start');
 if(SC==='pause'){
  await E("DMX.api.pause(true)"); const a=await E("DMX.api.D.stepNo+':'+DMX.api.D.cur"); await pg.waitForTimeout(4000); const c=await E("DMX.api.D.stepNo+':'+DMX.api.D.cur"); ok(a===c,'pause freezes progress ('+a+' -> '+c+')');
  ok(await E("document.getElementById('xDemoShield').style.display==='none'"),'shield off while paused');
  await E("DMX.api.pause(false)"); await pg.waitForTimeout(3000); const d=await E("DMX.api.D.stepNo+':'+DMX.api.D.cur"); ok(d!==c,'resume continues ('+d+')');
  const cur=await E("DMX.api.D.cur"); await E("DMX.api.skip()"); await pg.waitForTimeout(3000); ok(await E("DMX.api.D.cur")>cur||await E("DMX.api.state().finished"),'skip moves to next chapter ('+cur+' -> '+await E("DMX.api.D.cur")+')');
  await E("DMX.api.jump(0)"); await pg.waitForTimeout(3500); ok(await E("DMX.api.D.cur")===0,'jump to chapter 0');
  await E("DMX.api.speed(1)"); ok(await E("DMX.api.D.sp")===1,'speed 1x');
  await E("DMX.api.speed(2)"); ok(await E("DMX.api.D.sp")===2,'speed 2x');
  await E("DMX.api.speed(4)");
 }
 if(SC==='stop'){
  await pg.waitForTimeout(6000); await shot('stop_before');
  const t=Date.now(); await pg.click('#xDemoBar button.stop'); const gone=await wait("!DMX.api.D.on&&DMX.api.D.sum===true",4000,100); ok(gone,'Stop works within '+(Date.now()-t)+' ms (summary shown)');
  await shot('stop_after'); const s1=await E("DMX.api.D.stepNo"); await pg.waitForTimeout(4000); ok(await E("DMX.api.D.stepNo")===s1,'nothing runs after Stop');
  ok(await E("!document.getElementById('xDemoCur')&&!document.getElementById('xDemoShield')"),'cursor and shield removed');
  ok(await E("typeof ribType()==='string'&&!RV.tool"),'R.X tool released, app usable');
  await pg.click('#xDemoBar button:has-text("Restore"), #xDemoBar button:has-text("رجّع")'); await pg.waitForTimeout(3000);
  const after=await E("({name:dcProjName(),tpl:tpId()})"); ok(after.name===before.name&&after.tpl===before.tpl,'Restore returns the previous project ('+JSON.stringify(after)+')');
 } else {
  const fin=await wait("DMX.api.state().finished",1500000,3000); ok(fin,'demo finished'); await shot('run_end');
  const st=await E("DMX.api.state()"); for(const c of st.chapters){ const r=st.results[c]; if(!r)continue; ok(r.fail===0&&r.done,'chapter '+c+': done='+r.done+' asserts ok='+r.okAsserts+' fail='+r.fail+(r.errors.length?' errors='+JSON.stringify(r.errors):'')); r.asserts.filter(a=>!a.ok).forEach(a=>console.log('   failed assert: '+a.en+' '+(a.err||''))); }
  if(SC==='run'){ const after=await E("({name:dcProjName(),tpl:tpId(),walls:RV.els.filter(e=>e.k==='wall').length,rv:RV.els.length,tool:RV.tool})"); log('after '+JSON.stringify(after));
   ok(after.name==='Project 6868','project name is Project 6868'); ok(!dl.length,'no file downloads triggered ('+dl.join()+')');
   await pg.click('#xDemoBar button:has-text("Keep"), #xDemoBar button:has-text("خلّي")'); await pg.waitForTimeout(500); ok(await E("!document.getElementById('xDemoBar')"),'Keep closes the panel'); }
 }
}
if(SC==='entry'){
 await pg.click('#xLogin .xdemo'); ok(await wait("!!document.getElementById('xDemoBar')",60000,500),'entry button opens the app and starts the demo (confirm card)'); await shot('entry_confirm');
 ok(await E("!document.getElementById('xLogin')||document.getElementById('xLogin').classList.contains('out')"),'entry screen closed');
}
const real=er.filter(m=>!/ResizeObserver|Failed to load resource|net::/.test(m)); ok(real.length===0,'no page errors'+(real.length?': '+real.slice(0,5).join(' | '):''));
console.log('FAILS',fails); await b.close(); process.exit(fails?1:0);
})();
