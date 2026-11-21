/* Chrome test: freeai.js -> bridge /proxy hook (real fetch, nothing mocked) + --isolate headers in a real browser.
   Needs: python3 (proxy_rig.py = real bridge handler + fake HTTPS provider), the patched build page.
   Usage: NODE_PATH=<dir with playwright-core> nice -n 15 node freeai_proxy_test.js file:///.../build/index.test.html   (one Chrome only) */
const {chromium}=require('playwright-core'); const {spawn}=require('child_process'); const http=require('http'); const fs=require('fs'); const os=require('os'); const path=require('path'); const crypto=require('crypto');
const URLP=process.argv[2]; const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0,fail=0; const ok=(c,m)=>{ if(c){pass++;console.log('  ok   '+m);} else {fail++;console.log('  FAIL '+m);} };
const KEY='gsk_TEST_ONLY_not_a_real_key_123456'; const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const kids=[]; const run=(args,env)=>new Promise((res,rej)=>{ const p=spawn('python3',args,{cwd:__dirname,env:Object.assign({},process.env,env||{})}); kids.push(p); let buf=''; p.stdout.on('data',d=>{buf+=d; const m=/^\{.*\}$/m.exec(buf); if(m)res(JSON.parse(m[0]));}); p.stderr.on('data',d=>{ buf+=d; if(/bridge on/.test(buf))res({}); }); p.on('exit',c=>rej(new Error('exit '+c))); setTimeout(()=>rej(new Error('start timeout')),20000); });
(async()=>{
 const rig=await run(['proxy_rig.py']); const BASE='http://127.0.0.1:'+rig.port; const FB='https://'+rig.fake_host+'/v1';
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1300,height:800}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-cdeaud','xto-rv','xto-ai','xto-fa'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message));
 await pg.goto(URLP,{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 const ev=(f,a)=>pg.evaluate(f,a);
 console.log('== direct call to the fake host fails in the browser (no DNS) = stands in for a CORS-blocked provider');
 ok(await ev(async u=>{ try{ await fetch(u+'/models'); return false; }catch(e){ return e instanceof TypeError; } },FB),'plain fetch to the provider throws a network error');
 ok(await E("typeof FA.fetch==='function'&&typeof FA.viaProxy==='function'&&typeof FA.bridgeUp==='function'"),'patched freeai.js exports faFetch/viaProxy/bridgeUp');
 console.log('== no bridge connected: behaviour as today');
 await E("BR.token=''; BR.url='"+BASE+"'; FA.fx.px={}; FA.fx.up={t:0,ok:false}; 1");
 let r=await ev(async u=>{ try{ await FA.fetch(u+'/models'); return 'resolved'; }catch(e){ return e.message; } },FB);
 ok(/Failed to fetch|NetworkError|Load failed/i.test(r)&&!/bridge proxy/.test(r),'no token: original network error, no proxy attempt ('+r+')');
 ok(await E("FA.bridgeUp()")===false,'bridgeUp() false without a token');
 console.log('== bridge connected: blocked provider goes through /proxy');
 await E("BR.token='"+rig.token+"'; FA.fx.up={t:0,ok:false}; 1");
 ok(await E("FA.bridgeUp()")===true,'bridgeUp() true (ping says proxy:true)');
 const raw=await ev(async ([u,k])=>{ const r=await FA.fetch(u+'/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+k},body:JSON.stringify({mode:'ok'})}); return {s:r.status,h:r.headers.get('x-tox-proxy'),j:await r.json()}; },[FB,KEY]);
 ok(raw.s===200&&raw.h==='ok'&&raw.j.choices[0].message.content==='hi from fake','FA.fetch reaches the fake provider through the bridge');
 ok(raw.j.seen_auth===sha('Bearer '+KEY),'the key from the page arrived at the provider');
 ok(await E("FA.fx.px['fake.provider.test']===1"),'host remembered as needing the proxy');
 const m=await ev(async u=>{ const r=await FA.fetch(u+'/chat/completions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:'429'})}); return {s:r.status,ra:r.headers.get('retry-after'),rl:r.headers.get('x-ratelimit-remaining-requests')}; },FB);
 ok(m.s===429&&m.ra==='7'&&m.rl==='0','429 status, retry-after and x-ratelimit-* are readable by the page');
 console.log('== full agent path (FA.chat) through the proxy');
 await E("lang='en'; AI.provider='custom'; AI.base='"+FB+"'; AI.model='fake-1'; AI.key='"+KEY+"'; XAS.chat.length=0; AI.hist=[]; 1");
 await E("FA.chat('hello',AI)"); await pg.waitForTimeout(500);
 const chat=await E("XAS.chat.map(m=>m.t).join('\\n')");
 ok(/hi from fake/.test(chat),'chat answer from the fake provider shows in the agent chat');
 ok(!chat.includes(KEY),'the key is not shown in the chat');
 const list=await E("FA.listed.__t=0, 1")&&await ev(async u=>{ return (await FA.fetch(u+'/models')).status; },FB);
 ok(list===200,'/models GET also works through the proxy');
 console.log('== failures stay honest');
 r=await ev(async()=>{ try{ await FA.fetch('https://api.evil.com/v1/models'); return 'resolved'; }catch(e){ return e.message; } });
 ok(/bridge proxy: host not in the provider allow-list/.test(r),'host not on the allow-list: original error plus the bridge reason ('+r+')');
 await E("BR.token='wrong-token'; FA.fx.px={}; FA.fx.up={t:0,ok:false}; 1");
 r=await ev(async u=>{ try{ await FA.fetch(u+'/models'); return 'resolved'; }catch(e){ return e.message; } },FB);
 ok(/bridge proxy: bad token/.test(r),'wrong bridge token: reported as a bridge problem, not as a provider 401 ('+r+')');
 await E("BR.token='"+rig.token+"'; BR.url='http://127.0.0.1:9'; FA.fx.px={}; FA.fx.up={t:0,ok:false}; 1");
 r=await ev(async u=>{ try{ await FA.fetch(u+'/models'); return 'resolved'; }catch(e){ return e.message; } },FB);
 ok(/Failed to fetch|NetworkError|Load failed/i.test(r)&&!/bridge proxy/.test(r),'bridge not running: falls back to the original network error ('+r+')');
 console.log('== SSE passthrough read by the page');
 await E("BR.url='"+BASE+"'; FA.fx.up={t:0,ok:false}; 1");
 const sse=await ev(async u=>{ const r=await FA.viaProxy(u+'/chat/completions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:'sse'})},true); const rd=r.body.getReader(); const t0=performance.now(); const st=[]; let txt=''; for(;;){ const x=await rd.read(); if(x.done)break; st.push(Math.round(performance.now()-t0)); txt+=new TextDecoder().decode(x.value); } return {s:r.status,ct:r.headers.get('content-type'),st,n:(txt.match(/data: /g)||[]).length}; },FB);
 ok(sse.s===200&&/event-stream/.test(sse.ct)&&sse.n===4,'4 SSE events read from the stream');
 ok(sse.st[0]<400&&sse.st[sse.st.length-1]>1000,'events reach the page incrementally ('+sse.st.join(',')+' ms)');
 ok(er.length===0,'no page errors during the proxy tests '+JSON.stringify(er.slice(0,2)));
 rig.pid&&0;

 console.log('== --serve: default vs --isolate in a real browser');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'toxsite-')); const other=http.createServer((q,s)=>{ s.setHeader('content-type','text/html'); s.end('<script>parent.postMessage("child-loaded","*")</script>child'); }); await new Promise(r=>other.listen(0,'127.0.0.1',r)); const OP=other.address().port;
 fs.writeFileSync(path.join(dir,'index.html'),'<!doctype html><title>t</title><iframe id=f src="http://127.0.0.1:'+OP+'/"></iframe><script>window.__m=[];addEventListener("message",e=>__m.push(e.data));</script>');
 for(const [flag,port,iso] of [[null,18781,false],['--isolate',18782,true]]){
   const args=['../incoming13b/tox_bridge.py','--http-only','--serve',dir].concat(flag?[flag]:[]); const info=await run(['tox_bridge.py','--serve',dir].concat(flag?[flag]:[]),{TOX_PORT:String(port),TOX_INBOX:path.join(dir,'ib')}).catch(e=>({}));
   const p2=await ctx.newPage(); await p2.goto('http://127.0.0.1:'+port+'/',{waitUntil:'load'}); await p2.waitForTimeout(1200);
   const st=await p2.evaluate(()=>({iso:self.crossOriginIsolated,sab:typeof SharedArrayBuffer==='function',msgs:window.__m}));
   ok(st.iso===iso&&st.sab===iso,(flag||'default')+': crossOriginIsolated='+st.iso+', SharedArrayBuffer='+st.sab);
   ok(iso?!st.msgs.includes('child-loaded'):st.msgs.includes('child-loaded'),(flag||'default')+': a cross-origin iframe without COEP '+(iso?'is BLOCKED (why isolate is opt-in: the page embeds YouTube/OSM iframes)':'loads normally'));
   await p2.close(); kids.pop().kill();
 }
 other.close(); await b.close(); kids.forEach(k=>k.kill());
 console.log('\nfreeai proxy: '+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
})().catch(e=>{ console.log('ERR',e); kids.forEach(k=>k.kill()); process.exit(2); });
