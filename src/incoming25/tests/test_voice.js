/* test_voice.js - integration test for demo_voice.js on the real built page (one Chrome, nice -n 15).
   Run: NODE_PATH=<scratchpad>/pw/node_modules nice -n 15 node test_voice.js <index.test.html with the demo> <demo_voice.js> <extract_captions.js dir with demo_ch*.js> [workdir]
   Builds a PRIVATE copy of the page (demo_voice.js injected into the lazy demo source) + fake narration: pure tones of known length keyed by the first 3 real Arabic caption lines. No real sound needed. */
const {chromium}=require('playwright-core'); const fs=require('fs'), path=require('path'), cp=require('child_process');
const [PAGE,VOICEJS,CAPDIR,WORK0]=process.argv.slice(2); const WORK=WORK0||'/tmp/voice_test'; const SITE=path.join(WORK,'site');
fs.rmSync(SITE,{recursive:true,force:true}); fs.mkdirSync(path.join(SITE,'media/voice/ar'),{recursive:true});
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++; };
/* --- fixture page: inject demo_voice.js into the plain-text demo source --- */
let html=fs.readFileSync(PAGE,'utf8'); const i0=html.indexOf('id="xDemoSrc">'); if(i0<0)throw new Error('no xDemoSrc'); const i1=html.indexOf('\n</script>',i0);
html=html.slice(0,i1)+'\n'+fs.readFileSync(VOICEJS,'utf8')+html.slice(i1); fs.writeFileSync(path.join(SITE,'index.test.html'),html);
/* --- fixture media: caption key identical to tools/make_voice.py (checked below against python) --- */
function key(s){ s=String(s||'').normalize('NFC').trim(); let h1=0xdeadbeef,h2=0x41c6ce57; for(let i=0,c;i<s.length;i++){ c=s.charCodeAt(i); h1=Math.imul(h1^c,2654435761); h2=Math.imul(h2^c,1597334677); } h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909); h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909); return (4294967296*(2097151&h2)+(h1>>>0)).toString(16); }
const caps=JSON.parse(cp.execFileSync('node',[path.join(__dirname,'..','tools','extract_captions.js'),CAPDIR],{maxBuffer:1e7}).toString()).filter(c=>c.op==='say');
const py=cp.execFileSync(process.env.PY||'python3',['-c',"import sys;sys.path.insert(0,sys.argv[1]);import make_voice as m;print(m.caption_hash(sys.argv[2]))",path.join(__dirname,'..','tools'),caps[0].ar]).toString().trim();
ok(py===key(caps[0].ar),'caption hash identical in python and JS ('+py+')');
const dur={f:[2.0,2.5,1.5],m:[3.0,3.5,2.5]}, items={};
caps.slice(0,3).forEach((c,i)=>{ const e={v:{}}; for(const g of ['f','m']){ const fn='ar/'+key(c.ar)+'.'+g+'.mp3'; cp.execFileSync('ffmpeg',['-v','error','-y','-f','lavfi','-i','sine=frequency='+(g==='f'?440:330)+':duration='+dur[g][i],'-ac','1','-ar','24000','-b:a','32k',path.join(SITE,'media/voice',fn)]); e.v[g]={file:fn,ms:dur[g][i]*1000,sig:'t'+i}; } items[key(c.ar)]=e; });
fs.writeFileSync(path.join(SITE,'media/voice/manifest.js'),'window.TOXVoiceManifest='+JSON.stringify({version:1,lang:'ar',fmt:'mp3',voices:{f:{},m:{}},items})+';');
(async()=>{
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:1500,height:860}});
await ctx.addInitScript(()=>{ try{ sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(x){}
 window.__au=[]; const P=HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play=function(){ if(!this.__w){ this.__w=1; ['play','pause','ended','error'].forEach(ev=>this.addEventListener(ev,()=>window.__au.push({ev,t:performance.now(),ct:this.currentTime,rate:this.playbackRate,vol:this.volume,mu:this.muted,src:this.currentSrc.split('/').pop()}))); } return P.apply(this,arguments); };
 window.__spk=0; const SS={speak(u){ window.__spk++; setTimeout(()=>{ try{ u.onend&&u.onend(); }catch(e){} },10); },cancel(){},pause(){},resume(){}}; try{ Object.defineProperty(window,'speechSynthesis',{value:SS,configurable:true}); }catch(e){} if(!window.SpeechSynthesisUtterance)window.SpeechSynthesisUtterance=function(t){ this.text=t; }; });
const pg=await ctx.newPage(), er=[], reqs=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept('')); pg.on('request',r=>reqs.push(r.url()));
const E=s=>pg.evaluate(s=>{ const r=__lsv.ev(s); return Promise.resolve(r).then(v=>v===undefined?null:JSON.parse(JSON.stringify(v))); },s);
const log=m=>console.log('   '+m);
await pg.goto('file://'+path.join(SITE,'index.test.html'),{waitUntil:'domcontentloaded',timeout:180000}); await pg.waitForTimeout(8000);
/* 1 nothing at page start */
ok(await E("DMX.api===null"),'startup: demo (and so voice) not loaded'); ok(!reqs.some(u=>/media\/voice/.test(u)),'startup: no request to media/voice');
await pg.click('.xdemo'); await pg.waitForTimeout(2500);
ok(await E("!!DMX.api.vox"),'demo load brings the voice module'); ok(!reqs.some(u=>/media\/voice/.test(u)),'after demo load, voice still OFF: no request to media/voice');
await pg.click('#xDemoBar button:has-text("Cancel"), #xDemoBar button:has-text("إلغاء")'); await pg.waitForTimeout(500);
/* 2 voice OFF run: captions only, no audio, no speechSynthesis */
await E("(lang='ar',1)");
const wall=async f=>{ const t=Date.now(); while(Date.now()-t<60000){ if(await E(f))return true; await pg.waitForTimeout(300); } return false; };
await E("demoStart({yes:1,speed:4,from:0,to:0})"); await pg.waitForTimeout(6000);
ok(!(await pg.evaluate(()=>window.__au.length)),'voice OFF: no audio element activity'); ok(!(await pg.evaluate(()=>window.__spk)),'voice OFF: speechSynthesis not used');
ok(!reqs.some(u=>/media\/voice/.test(u)),'voice OFF: still no request to media/voice');
await E("DMX.api.stop()"); await pg.waitForTimeout(800); await pg.click('#xDemoBar button:has-text("Close"), #xDemoBar button:has-text("إغلاق")').catch(()=>{});
/* 3 voice ON at 1x: audio plays, pacing follows duration */
await pg.evaluate(()=>{ window.__au.length=0; window.__t=[]; }); await E("DMX.api.ops.__mv=DMX.api.ops.move; DMX.api.ops.move=async function(st){ window.__t.push({k:'move',t:performance.now()}); return DMX.api.ops.__mv(st); }; 1");
await E("DMX.api.vox.on(true)"); await E("demoStart({yes:1,speed:1,from:0,to:0})"); await pg.waitForTimeout(1500);
ok(await E("!!document.querySelector('#xDemoBar .xdv')"),'panel has the Voice row'); 
ok(await E("DMX.api.vox.state().on&&document.querySelector('#xDemoBar .xdv select')!==null"),'voice ON: controls appear');
ok(await wall("DMX.api.vox.state().played>=1"),'first caption was played from the recording');
let au=await pg.evaluate(()=>window.__au.slice()); log(JSON.stringify(au.slice(0,6).map(x=>x.ev+'@'+Math.round(x.t)+' '+x.src)));
const p1=au.find(x=>x.ev==='play'), e1=au.find(x=>x.ev==='ended');
ok(!!p1&&!!e1,'audio events: play then ended'); if(p1&&e1){ const d=(e1.t-p1.t)/1000; log('first line: play->ended '+d.toFixed(2)+'s (file 2.0s, f voice)'); ok(Math.abs(e1.ct-2.0)<0.15,'audio ran to the end of the 2.0s file (currentTime at ended '+e1.ct.toFixed(2)+'; wall time is load-dependent)'); ok(/\.f\.mp3/.test(p1.src),'female file used'); }
await wall("1"); const t0=Date.now(); while(Date.now()-t0<30000&&!(await pg.evaluate(()=>window.__t.length)))await pg.waitForTimeout(300);
const mv=await pg.evaluate(()=>window.__t.map(x=>x.t)); log('moves logged '+mv.length);
const tAfter=mv.find(t=>e1&&t>e1.t-50); ok(tAfter!==undefined&&(tAfter-e1.t)>=0,'next step (move) started after the audio ended, not before (paced by the audio): +'+(tAfter!==undefined?Math.round(tAfter-e1.t):'n/a')+' ms');
ok(!(await pg.evaluate(()=>window.__spk)),'no speechSynthesis while recordings play');
ok(reqs.filter(u=>/media\/voice/.test(u)).every(u=>/manifest\.js|\/ar\/[0-9a-f]+\.[fm]\.mp3/.test(u)),'requests only manifest.js + mp3 files (same origin)');
ok(reqs.filter(u=>/^https?:/.test(u)).length===0||true,'(info) http requests '+reqs.filter(u=>/^https?:/.test(u)).length);
/* 4 controls: volume, mute, rate, speed */
await pg.waitForTimeout(100); await E("DMX.api.vox.set({vol:.3})"); await E("DMX.api.vox.set({rate:.9})"); await pg.waitForTimeout(600);
/* wait for 2nd line (next say) to be playing so we can inspect a live element */
await wall("(function(){ const a=DMX.api.vox.audio(); return a&&!a.paused&&DMX.api.vox.state().starts>=2; })()");
let live=await E("(function(){ const a=DMX.api.vox.audio(); return {vol:a.volume,rate:a.playbackRate,paused:a.paused,mu:a.muted}; })()"); ok(live&&Math.abs(live.vol-.3)<.01&&Math.abs(live.rate-.9)<.01,'volume 0.3 and rate 0.9 applied ('+JSON.stringify(live)+')');
await E("DMX.api.vox.set({mute:true})"); await pg.waitForTimeout(500); ok(await E("DMX.api.vox.audio().muted"),'mute works');
await E("DMX.api.vox.set({mute:false})"); await E("DMX.api.speed(2)"); await pg.waitForTimeout(500); ok(await E("DMX.api.vox.audio().playbackRate")===1.5,'demo speed 2x -> narration rate capped at 1.5'); await E("DMX.api.speed(1)");
/* pause / resume */
const c0=await E("DMX.api.vox.audio().currentTime"); await E("DMX.api.pause(true)"); await pg.waitForTimeout(500); const pp=await E("DMX.api.vox.audio().paused"); const c1=await E("DMX.api.vox.audio().currentTime"); await pg.waitForTimeout(1500); const c2=await E("DMX.api.vox.audio().currentTime");
ok(pp&&c1===c2,'pause pauses the audio and it stays put ('+c1.toFixed(2)+' -> '+c2.toFixed(2)+')');
await E("DMX.api.pause(false)"); await pg.waitForTimeout(900); ok(!(await E("DMX.api.vox.audio().paused"))||await E("DMX.api.vox.audio().ended"),'resume continues the audio');
/* voice choice */
await E("DMX.api.vox.set({g:'m'})"); ok(/\.m\.mp3/.test(await E("DMX.api.vox.item("+JSON.stringify(caps[0])+").url")),'male voice selected -> male file'); await E("DMX.api.vox.set({g:'f'})");
/* stop */
await E("DMX.api.stop()"); await pg.waitForTimeout(800); const stp=await E("DMX.api.vox.audio().paused"); ok(stp,'Stop silences the audio'); const nA=(await pg.evaluate(()=>window.__au.length)); await pg.waitForTimeout(2500); ok((await pg.evaluate(()=>window.__au.length))===nA,'no more audio after Stop');
await pg.click('#xDemoBar button:has-text("Close"), #xDemoBar button:has-text("إغلاق")').catch(()=>{});
/* 5 no recording for a line -> silent captions-only; browser voice only when ticked */
await pg.evaluate(()=>{ window.__au.length=0; window.__spk=0; });
ok(await E("DMX.api.vox.item({ar:'جملة مش متسجلة أبدًا'})")===null,'unknown caption -> no item'); ok(await E("(lang='en',DMX.api.vox.item({ar:"+JSON.stringify(caps[0].ar)+"}))")===null,'English UI -> captions only'); await E("(lang='ar',1)");
await E("DMX.api.D.abort=null,DMX.api.D.on=true,DMX.api.D.paused=false,1"); const spk0=await pg.evaluate(()=>window.__spk);
await E("DMX.api.ops.say({en:'x',ar:'جملة مش متسجلة أبدًا',hold:200})").catch(()=>{}); await pg.waitForTimeout(400); ok((await pg.evaluate(()=>window.__spk))===spk0,'missing recording: no speechSynthesis fallback by default');
await E("DMX.api.vox.set({browser:true})"); await E("DMX.api.ops.say({en:'x',ar:'جملة مش متسجلة أبدًا',hold:200})").catch(()=>{}); await pg.waitForTimeout(600); ok((await pg.evaluate(()=>window.__spk))>spk0,'"Browser voice" ticked: speechSynthesis used for that line'); await E("DMX.api.D.on=false,1");
/* 6 Cache API is http-only: file:// plays directly */
ok(await E("location.protocol")==='file:','(info) tested over file:// (direct audio URLs; Cache API path is for http/https)');
ok(er.length===0,'no page errors'+(er.length?': '+er[0]:''));
await b.close(); console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });
