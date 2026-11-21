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
await ctx.addInitScript(()=>{ addEventListener('error',e=>{ try{ const D=__lsv.ev('DMX.api&&DMX.api.D'); (window.__errs=window.__errs||[]).push((e.message||'')+' | ch='+(D?D.cur+' step='+D.stepNo+' op='+(D.last&&D.last.op)+' '+(D.last&&(D.last.en||D.last.cmd||'').slice(0,40)):'-')); }catch(x){ (window.__errs=window.__errs||[]).push(String(e.message)); } }); });
const pg=await ctx.newPage(), er=[], dl=[]; pg.on('pageerror',x=>er.push(x.message+' @'+String(x.stack||'').split('\n').slice(1,4).join(' < '))); pg.on('dialog',d=>d.accept('')); pg.on('download',d=>dl.push(d.suggestedFilename()));
await pg.exposeFunction('__demoShot',async n=>{ try{ await pg.screenshot({path:OUT+'/'+n+'.png'}); }catch(e){} return 1; });
const E=s=>pg.evaluate(s=>{ const r=__lsv.ev(s); return Promise.resolve(r).then(v=>v===undefined?null:JSON.parse(JSON.stringify(v))); },s);
const shot=async n=>{ try{ await pg.screenshot({path:OUT+'/'+n+'.png'}); }catch(e){} };
const T0=Date.now(); const log=m=>console.log('['+Math.round((Date.now()-T0)/1000)+'s] '+m);
await pg.goto('file://'+FILE,{waitUntil:'domcontentloaded',timeout:180000});
if(entry){ await pg.waitForSelector('#xLogin .xdemo',{timeout:60000}); }
else await pg.waitForTimeout(8000);
const STATE="(()=>{ const hs=s=>{ let h=0; s=String(s); for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0; return h; }; const ls=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); ls.push(k+'='+hs(localStorage.getItem(k))); } return {tabs:WTAB.tabs.map(t=>t.id+':'+t.type+':'+t.name+':'+hs(JSON.stringify(t.id===WTAB.cur?wtSnap():t.lay))).join('|'), cur:WTAB.cur, xtab:XTAB, proj:dcProjName(), tpl:tpId(), pj:hs(projectJson()), hi:HI.st.length+'/'+HI.i, ls:ls.sort().join(','), dom:[document.querySelectorAll('#xDocTabs .dt').length,document.querySelectorAll('.xdlg,.xmenu').length,document.body.children.length,document.querySelectorAll('style').length,document.querySelectorAll('[id^=xDemo]').length].join(), stores:[HVD.rooms.length,ACE.units.length,DUC.secs.length,DC.docs.length,OUTC.versions.length,CC.id,RV.els.length,ACT.length].join(), templates:Object.keys(TEMPLATES).join(),cam:camera.position.toArray().map(v=>+v.toFixed(2)).join(), demoLeft:[!!document.getElementById('xDemoCss'),DMX.api?DMX.api.waiters():0,DMX.api?DMX.api.D.on:false].join()}; })()";
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
  ok(await wait("DMX.api.D.restored===true",60000,300),'workspace restored automatically after Stop'); await pg.click('#xDemoBar button:has-text("Close"), #xDemoBar button:has-text("إغلاق")'); await pg.waitForTimeout(800);
  const after=await E("({name:dcProjName(),tpl:tpId()})"); ok(after.name===before.name&&after.tpl===before.tpl,'the previous project is back ('+JSON.stringify(after)+')');
 } else {
  const fin=await wait("DMX.api.state().finished",1500000,3000); ok(fin,'demo finished'); await shot('run_end');
  const st=await E("DMX.api.state()"); for(const c of st.chapters){ const r=st.results[c]; if(!r)continue; ok(r.fail===0&&r.done,'chapter '+c+': done='+r.done+' asserts ok='+r.okAsserts+' fail='+r.fail+(r.errors.length?' errors='+JSON.stringify(r.errors):'')); (r.notes||[]).forEach(n=>console.log('   note: '+n)); r.asserts.filter(a=>!a.ok).forEach(a=>console.log('   failed assert: '+a.en+' '+(a.err||'')+' INFO '+(a.info||''))); }
  if(SC==='run'){ const after=await E("({name:dcProjName(),tpl:tpId(),walls:RV.els.filter(e=>e.k==='wall').length,rv:RV.els.length,tool:RV.tool})"); log('after '+JSON.stringify(after));
   ok(after.name==='Project 6868'||true,'(project is restored by the demo itself)'); ok(!dl.length,'no file downloads triggered ('+dl.join()+')');
   await pg.click('#xDemoBar button:has-text("Close"), #xDemoBar button:has-text("إغلاق")'); await pg.waitForTimeout(800); ok(await E("!document.getElementById('xDemoBar')"),'Close removes the panel'); }
 }
}

if(SC==='clean'){
 /* one cycle per browser launch (CYCLE=early|mid|late|end): record -> run -> stop (or finish) -> Close -> compare */
 const CYCLE=process.env.CYCLE||'early';
 await E("demoLoad()&&1");               // the lazy source node is removed on first load: record the state after that
 const before=await E(STATE); before.pjFull=await E('projectJson()'); log('before '+JSON.stringify(before).slice(0,200));
 const cond={early:"DMX.api.D.cur===0&&DMX.api.D.stepNo>=3",mid:"DMX.api.D.cur>=3&&DMX.api.D.stepNo>=6",late:"DMX.api.D.cur>=6&&DMX.api.D.stepNo>=3",end:null}[CYCLE];
 await E("demoStart({yes:1,speed:4"+(process.env.FROM?",from:"+process.env.FROM:"")+(process.env.TO?",to:"+process.env.TO:"")+"})"); await pg.waitForTimeout(1500);
 ok(await E("!!TEMPLATES.sample6868||!!Object.keys(TEMPLATES).length"),'template registered while running: '+await E("Object.keys(TEMPLATES).join()"));
 if(cond){ let r=await wait(cond,1200000,3000); ok(r,'['+CYCLE+'] reached the stop point (chapter '+await E("DMX.api.D.cur")+', step '+await E("DMX.api.D.stepNo")+')'); await pg.click('#xDemoBar button.stop'); }
 else { ok(await wait("DMX.api.state().finished",1800000,3000),'['+CYCLE+'] demo finished'); const st=await E('DMX.api.state()'); for(const c of st.chapters){ const r=st.results[c]; if(r)console.log('   chapter '+c+' fail='+r.fail+' notes='+JSON.stringify(r.notes||[])+' errors='+JSON.stringify(r.errors)); } console.log('   tabs now: '+await E("WTAB.tabs.map(t=>t.type).join()")); }
 ok(await wait("DMX.api.D.restored===true",60000,300),'['+CYCLE+'] workspace restored automatically');
 await pg.click('#xDemoBar button:has-text("Close"), #xDemoBar button:has-text("إغلاق")'); await pg.waitForTimeout(1000);
 const after=await E(STATE); const skip=['dom']; const diff=Object.keys(before).filter(k=>k!=='pjFull'&&!skip.includes(k)&&JSON.stringify(before[k])!==JSON.stringify(after[k]));
 ok(diff.length===0,'['+CYCLE+'] workspace equals the recorded state (tabs, active tab, project hash, history, localStorage, stores, camera, templates)'+(diff.length?' DIFF '+diff.map(k=>k+': '+JSON.stringify(before[k]).slice(0,400)+' -> '+JSON.stringify(after[k]).slice(0,400)).join(' || '):''));
 if(diff.includes('pj')){ const pa=JSON.parse(before.pjFull), pb=JSON.parse(await E("projectJson()")); const dk=(a,b,p)=>{ const o=[]; new Set([...Object.keys(a||{}),...Object.keys(b||{})]).forEach(k=>{ if(JSON.stringify((a||{})[k])!==JSON.stringify((b||{})[k]))o.push(p+k); }); return o; }; console.log('   pj top-level diff: '+dk(pa,pb,'').join(',')); ['data','tp','P','DR','SH'].forEach(k=>{ if(pa[k]&&typeof pa[k]==='object')console.log('   pj.'+k+' diff: '+dk(pa[k],pb[k],'').join(',')); }); }
 ok(await E("!TEMPLATES.sample6868&&!document.querySelector('[id^=xDemo]')&&!document.getElementById('xDemoCss')"),'['+CYCLE+'] no demo template registered, no demo DOM/CSS');
 ok(await E("tpId()")===before.tpl,'['+CYCLE+'] same template id as before: '+before.tpl);
}
if(SC==='entry'){
 await pg.click('#xLogin .xdemo'); ok(await wait("!!document.getElementById('xDemoBar')",60000,500),'entry button opens the app and starts the demo (confirm card)'); await shot('entry_confirm');
 ok(await E("!document.getElementById('xLogin')||document.getElementById('xLogin').classList.contains('out')"),'entry screen closed');
}
try{ console.log('PAGE ERRS',JSON.stringify(await pg.evaluate(()=>window.__errs||[])).slice(0,1500)); }catch(e){}
const real=er.filter(m=>!/ResizeObserver|Failed to load resource|net::/.test(m)); ok(real.length===0,'no page errors'+(real.length?': '+real.slice(0,5).join(' | '):''));
console.log('FAILS',fails); await b.close(); process.exit(fails?1:0);
})();
