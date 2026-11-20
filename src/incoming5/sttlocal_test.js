/* Playwright test for sttlocal.js. Run from the SP folder:
     NODE_PATH=SP/pw/node_modules node site/src/incoming5/sttlocal_test.js [model]   (model: whisper-tiny | whisper-base, default tiny)
   Serves site/ through tox_bridge.py --serve, injects sttlocal.js into the served index.html on the fly (no file written),
   feeds a WAV through Chrome's fake microphone (--use-file-for-fake-audio-capture) and checks: provider registered, VAD split,
   transcribe of a known sample, stt_selftest from the mic, Cache API second start. Needs `say -v Majed` + ffmpeg only to make the sample. */
const {chromium}=require('playwright-core'), {spawn,execSync}=require('child_process'), fs=require('fs'), path=require('path');
const SITE=path.resolve(__dirname,'../..'), CH=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', MODEL=process.argv[2]||'whisper-tiny', PORT=process.env.TOX_PORT||String(18900+Math.floor(Math.random()*90));
const WAV='/tmp/stt_test_x.wav', TXT='افتح الخريطة وابني فيلا بمساحة اثنا عشر في عشرة، دورين، وخمس غرف';
let fail=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c)fail++; };
(async()=>{
  if(!fs.existsSync(WAV)){ execSync(`say -v Majed -o /tmp/stt_test_x.aiff "${TXT}" && ffmpeg -y -loglevel error -i /tmp/stt_test_x.aiff -ar 16000 -ac 1 ${WAV}`); }
  const srv=spawn('python3',[path.join(SITE,'tools/tox_bridge.py'),'--serve',SITE],{env:{...process.env,TOX_PORT:PORT,TOX_TOKEN:'x'},stdio:'ignore'}); await new Promise(r=>setTimeout(r,3000));
  const b=await chromium.launch({executablePath:CH,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-file-for-fake-audio-capture='+WAV]});
  try{
    const ctx=await b.newContext(); await ctx.grantPermissions(['microphone']);
    await ctx.addInitScript(()=>{ try{ sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); localStorage.setItem('xto-ai',JSON.stringify({stt:'local-browser',sttBase:'local-browser',sttModel:window.__M||''})); }catch(e){} });
    await ctx.addInitScript(m=>{ window.__M=m; try{ localStorage.setItem('xto-ai',JSON.stringify({stt:'local-browser',sttBase:'local-browser',sttModel:m})); }catch(e){} },MODEL);
    const js=fs.readFileSync(path.join(__dirname,'sttlocal.js'),'utf8'), key='window.__lsv={ev:';   // same place the chunk is meant to go
    await ctx.route(`http://127.0.0.1:${PORT}/`,async r=>{ const t=await (await fetch(`http://127.0.0.1:${PORT}/`)).text(); if(t.split(key).length!==2)throw new Error('anchor not found'); await r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:t.replace(key,()=>js+'\n'+key)}); });
    const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
    await pg.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:'commit',timeout:120000}); await pg.waitForFunction(()=>window.__lsv&&window.slTranscribe,null,{timeout:120000});
    ok(await E("!!AIS['local-browser']&&AI.stt==='local-browser'"),'provider local-browser registered and selected');
    ok(await E("(()=>{const s=(n)=>{const x=new Float32Array(16000*n);return x;}; const sil=slSplit(s(3)); const a=new Float32Array(16000*5); for(let i=0;i<16000;i++)a[i]=Math.sin(i/9)*.3; for(let i=16000*3;i<16000*4;i++)a[i]=Math.sin(i/7)*.3; return sil.length===0&&slSplit(a).length===1&&slSplit(a).length>=1;})()"),'VAD: silence -> no segment, speech+gap handled');
    ok(await E("(()=>{const a=new Float32Array(16000*50); for(let i=0;i<a.length;i++)a[i]=(i%16000<12000?Math.sin(i/9)*.3:0.0005); const s=slSplit(a); return s.length>=3&&s.every(x=>x[1]-x[0]<=16000*23);})()"),'VAD: 50 s of speech is cut into <=22 s pieces');
    const b64=fs.readFileSync(WAV).toString('base64');
    let t0=Date.now(); const txt=await E(`(async()=>{ const bin=Uint8Array.from(atob("${b64}"),c=>c.charCodeAt(0)); return await aiTranscribe(new Blob([bin],{type:"audio/wav"})); })()`);
    const L=await E('SL.last'); console.log('file:',JSON.stringify(txt),'| first call (download+compile+run)',((Date.now()-t0)/1000).toFixed(1)+'s | last:',JSON.stringify({model:L.model,ms:L.ms,segments:L.segments,threads:L.threads,audioSec:L.audioSec}));
    ok(typeof txt==='string'&&txt.length>5&&/[؀-ۿ]/.test(txt),'aiTranscribe via local-browser returns Arabic text');
    ok(L.model===MODEL,'model picked from AI.sttModel = '+MODEL);
    const self=await E('slSelfTest()'); console.log('stt_selftest:',JSON.stringify(self)); ok(self&&self.ok&&typeof self.text==='string','stt_selftest runs from the (fake) microphone: engine='+(self&&self.engine));
    ok(await E("typeof XC.stt_selftest.run==='function'"),'command stt_selftest registered');
    ok((await pg.evaluate(()=>caches.keys())).length>0,'model stored in Cache API');
    const pg2=await ctx.newPage(); await pg2.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:'commit'}); await pg2.waitForFunction(()=>window.slPreload,null,{timeout:120000});
    t0=Date.now(); const pre=await pg2.evaluate(()=>slPreload()); console.log('second start (cached):',JSON.stringify(pre),(Date.now()-t0)+' ms'); ok(pre.ok&&pre.loadMs<60000,'second start loads from cache');
    ok(!er.length,'no page errors '+er.slice(0,2).join(' | '));
  }catch(e){ console.log('FAIL exception',e.message); fail++; }
  await b.close(); srv.kill(); console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);
})();
