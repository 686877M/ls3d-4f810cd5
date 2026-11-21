/* ag5_test.js: agent widget + executor + geocoder + spatial ops. Network is MOCKED: Nominatim answered by page routes, tiles by a 1x1 PNG.
   No microphone in headless Chrome: speech is a FAKE webkitSpeechRecognition injected before load (interim results, then silence).
   Usage: NODE_PATH=<dir with playwright-core> nice -n 15 node ag5_test.js file:///path/index.test.html   (one Chrome) */
const {chromium}=require('playwright-core');
const URL=process.argv[2]; const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0,fail=0; const ok=(c,m)=>{ if(c){ pass++; console.log('  ok   '+m); } else { fail++; console.log('  FAIL '+m); } };
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64');
const MAADI={lat:'29.9602',lon:'31.2569',display_name:'المعادي, القاهرة, مصر',boundingbox:['29.94','29.98','31.24','31.28'],type:'suburb',category:'place'};
(async()=>{
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-gis','xto-gm','xto-ag5ui','xto-priv'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){}
  window.__lt=[]; try{ new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(e.duration))).observe({type:'longtask',buffered:true}); }catch(e){}
  /* fake speech recognition: speaks the words of window.__say one by one (interim), then goes quiet */
  window.__srStarts=0; window.__srStops=0;
  class FakeSR{ constructor(){ this.continuous=false; this.interimResults=false; this.lang=''; } start(){ window.__srStarts++; const w=String(window.__say||'').split(' '); let i=0; const res=[]; this._iv=setInterval(()=>{ if(i>=w.length){ clearInterval(this._iv); if(window.__sayFinal){ res.length=0; } return; } i++; const t=w.slice(0,i).join(' '); const fin=i===w.length; const r=[{transcript:t}]; r.isFinal=fin; this.onresult&&this.onresult({resultIndex:0,results:[r]}); },120); }
   stop(){ window.__srStops++; window.__srStopAt=Date.now(); clearInterval(this._iv); setTimeout(()=>this.onend&&this.onend(),30); } abort(){ this.stop(); } }
  window.webkitSpeechRecognition=FakeSR; window.SpeechRecognition=FakeSR; });
 const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',x=>errs.push(x.message)); pg.on('dialog',d=>d.accept(d.defaultValue()));
 let nomi=[], nomiMode='ok';
 await ctx.route(/tile\.openstreetmap|arcgisonline|maps\.eox\.at|gibs\.earthdata|rainviewer|storage\.googleapis|basemaps|cartocdn|opentopomap/,r=>r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:PNG}));
 await ctx.route(/nominatim\.openstreetmap\.org/,async r=>{ const u=decodeURIComponent(r.request().url()); nomi.push({u,t:Date.now()});
  if(nomiMode==='hang')return; /* never answers */
  if(nomiMode==='500')return r.fulfill({status:500,body:'err',headers:{'access-control-allow-origin':'*'}});
  const q=(u.match(/[?&]q=([^&]*)/)||[])[1]||''; const body=/شارع 9|street 9/.test(q)?[]:/المعادي|maadi/i.test(q)?[MAADI]:[];
  r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(body)}); });
 /* app code is not global: reach it through the test hook __lsv.ev (needs localStorage xto-test=1) */
 const ev=(f,a)=>pg.evaluate(([src,a])=>window.__lsv.ev('('+src+')('+(a===undefined?'':JSON.stringify(a))+')'),[f.toString(),a]);
 const wf=(f,o)=>pg.waitForFunction(src=>{ try{ return !!window.__lsv.ev('('+src+')()'); }catch(e){ return false; } },f.toString(),Object.assign({polling:200},o||{}));
 await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:240000}); await wf(()=>typeof AG5!=='undefined'&&typeof WTAB!=='undefined'&&document.getElementById('xDocTabs'),{timeout:240000}); await pg.waitForTimeout(1500);
 /* 1. lazy */
 let r=await ev(()=>({w:!!document.getElementById('ag5w'),cur:!!document.getElementById('ag5cur'),css:!!document.getElementById('ag5css'),cmd:!!XC.ag5_open,desc:!!(XDESC.ag5_open&&XDESC.ag5_listen&&XDESC.ag5_forget),mem:AG5.mem,gis:!!WTYPES.gis}));
 ok(!r.w&&!r.cur&&!r.css&&r.mem===null,'lazy: no widget, cursor, style or memory load at page start'); ok(r.cmd&&r.desc,'commands ag5_open / ag5_listen / ag5_forget have XDESC'); ok(r.gis,'G.X tab type exists'); ok(nomi.length===0,'no Nominatim request at page start');
 /* 2. parser */
 r=await ev(()=>{ const P=t=>ag5Plan(t).steps.map(s=>s.k+(s.type?':'+s.type:'')+(s.q?':'+s.q:'')+(s.v!==undefined?':'+(Array.isArray(s.v)?s.v:s.v):'')); return {
   a:P('افتح G.X وافتح خريطة مصر، المعادي، حي المعادي، شارع 9 وبعدين كبر'), b:P('open the GIS tab and open Egypt map, Maadi, Maadi district, street 9 then zoom in'),
   c:P('ارسم خط 5 متر ثم خليه رأسي ثم قيسه'), d:P('حركه 2 متر يمين'), e:P('خليه 7 متر'), f:P('اقفل C.X'), g:P('measure this as 3 m'), h:P('روح على التجمع الخامس') }; });
 console.log('   parse:',JSON.stringify(r));
 ok(r.a.join('|')==='tab:gis|geo:مصر، المعادي، حي المعادي، شارع 9|zoom:1'||/^tab:gis\|geo:[^|]*المعادي[^|]*شارع 9\|zoom:1$/.test(r.a.join('|')),'Arabic 3-clause request -> open G.X, find place, zoom');
 ok(/^tab:gis\|geo:Egypt, Maadi, Maadi district, street 9\|zoom:1$/.test(r.b.join('|')),'English request -> same plan');
 ok(r.c.join('|')==='tab:draft|line:5|orient:v|measure','draw / vertical / measure plan (auto-opens C.X)');
 ok(r.d.join('|')==='move:2','move 2 m right'); ok(r.e.join('|')==='len:7','"make it 7 m" -> set length'); ok(r.f.join('|')==='close:draft','close C.X'); ok(r.g.join('|')==='len:3','"measure this as 3 m" -> set length 3');
 ok(/^tab:gis\|geo:/.test(r.h.join('|')),'place verb + known district -> G.X + geo');
 /* 3. multi-step typed request through the widget, to completion */
 await ev(()=>XC.ag5_open.run()); await pg.waitForSelector('#ag5w');
 await pg.fill('#ag5txt','افتح G.X وروح على مصر، المعادي، حي المعادي، شارع 9 وبعدين كبر');
 const t0=Date.now(); await pg.click('#ag5go');
 await wf(()=>!AG5.run&&AG5.plan.length&&AG5.plan.every(s=>s.st==='ok'||s.st==='fail'),{timeout:90000});
 r=await ev(()=>({st:AG5.st,plan:AG5.plan.map(s=>s.k+':'+s.st+':'+(s.why||s.res)),tab:ag5TabNow(),lat:GM.lat,lon:GM.lon,z:GM.z,mk:(GM.layers.find(l=>l.id==='LAG5')||{feat:[]}).feat.length,attr:document.getElementById('ag5attr').textContent,cur:!!document.getElementById('ag5cur'),geoz:AG5.ctx.place&&AG5.ctx.place.z,obj:AG5.ctx.obj&&AG5.ctx.obj.kind,st2:document.getElementById('ag5st').textContent}));
 console.log('   run1:',JSON.stringify(r),'in',Date.now()-t0,'ms; nominatim:',nomi.map(x=>x.u.replace(/^.*q=/,'q=')).join(' || '));
 ok(r.plan.length===3&&r.plan.every(x=>/:ok:/.test(x)),'all 3 steps done (open G.X, find place, zoom)'); ok(r.st==='done','status = done');
 ok(r.tab==='gis','G.X is the current tab'); ok(Math.abs(r.lat-29.9602)<1e-4&&Math.abs(r.lon-31.2569)<1e-4,'map centred on the (mocked) Maadi result');
 ok(r.z===r.geoz+1,'follow-up zoom applied to the map (z '+r.geoz+' -> '+r.z+')'); ok(r.mk===1&&r.obj==='gis','marker placed and remembered as "it"');
 ok(/OpenStreetMap/.test(r.attr)&&/Nominatim/.test(r.attr),'attribution shown'); ok(r.cur,'visible agent cursor used');
 ok(nomi.length===2&&/شارع 9/.test(nomi[0].u)&&!/شارع 9/.test(nomi[1].u)&&/countrycodes=eg/.test(nomi[0].u),'street not found -> retried once without the street (Egypt-biased)');
 ok(nomi.length<2||nomi[1].t-nomi[0].t>=1000,'Nominatim requests at least 1 s apart ('+(nomi.length>1?nomi[1].t-nomi[0].t:'-')+' ms)');
 ok(/(بعرض أقرب منطقة|nearest bigger area)/.test(r.plan[1]),'result says the street was not found');
 /* cache: same place again = no new request */
 const n0=nomi.length; await ev(()=>xaHandle('روح على مصر، المعادي، حي المعادي، شارع 9')); r=await ev(()=>AG5.plan.map(s=>s.st)); ok(nomi.length===n0+0||nomi.length===n0+1,'repeat request served from cache ('+(nomi.length-n0)+' new; the not-found street is cached too)'); ok(nomi.length===n0,'zero new requests on repeat');
 /* 4. widget persists across tab switches */
 await ev(()=>xaHandle('افتح R.X')); r=await ev(()=>({tab:ag5TabNow(),w:document.getElementById('ag5w'),vis:getComputedStyle(document.getElementById('ag5w')).display!=='none',last:document.body.lastElementChild&&document.body.lastElementChild.id}));
 ok(r.tab==='model','"افتح R.X" switched tab'); ok(r.vis,'widget still visible after switching to R.X');
 await ev(()=>{ const t=WTAB.tabs.find(x=>x.type==='gis'); wtSwitch(t.id); }); await pg.waitForTimeout(400); r=await ev(()=>{ const w=document.getElementById('ag5w'), q=w.getBoundingClientRect(); return {in:document.body.contains(w),vis:getComputedStyle(w).display!=='none',z:+getComputedStyle(w).zIndex,area:q.width*q.height}; });
 ok(r.in&&r.vis&&r.z>=99980&&r.area>10000,'widget persists (in body, visible, on top) after a manual tab switch');
 /* 5. transcript box: long text readable */
 const long='افتح خريطة مصر وروح على المعادي '.repeat(20); await ev(t=>ag5Text(t,true),long);
 r=await ev(()=>{ const x=document.getElementById('ag5txt'), cs=getComputedStyle(x); return {h:x.clientHeight,sh:x.scrollHeight,fs:parseFloat(cs.fontSize),w:x.clientWidth,ov:cs.overflowY,len:x.value.length,ro:x.readOnly}; });
 ok(r.len===long.length,'transcript box holds the full text ('+r.len+' chars)'); ok(r.fs>=15&&r.w>=300,'transcript font '+r.fs+'px, width '+r.w+'px'); ok(r.h>=150,'box grew with the text (height '+r.h+'px)'); ok(r.ov==='auto'&&!r.ro,'scrollable and editable');
 await ev(()=>{ document.getElementById('ag5txt').value=''; });
 /* 6. failing step: hanging geocoder -> timeout, next step still runs, page stays responsive */
 nomiMode='hang'; await ev(()=>{ AG5.tmo.geo=3000; window.__lt.length=0; });
 const p6=ev(()=>xaHandle('روح على مدينة نصر، القاهرة ثم صغر').then(()=>1)); const resp=[]; for(let i=0;i<6;i++){ const a=Date.now(); await ev(()=>1); resp.push(Date.now()-a); await pg.waitForTimeout(400); } await p6;
 r=await ev(()=>({plan:AG5.plan.map(s=>s.k+':'+s.st+':'+(s.why||'')),st:AG5.st,why:AG5.why,lt:window.__lt.slice(),z:GM.z}));
 console.log('   fail-run:',JSON.stringify(r.plan),'evaluate round-trips ms:',resp.join(','),'long tasks:',r.lt.map(Math.round).join(','));
 ok(r.plan.some(x=>/^geo:fail:.*(timed out|المهلة)/.test(x)),'hanging place search -> step failed with a timeout reason'); ok(r.plan.some(x=>/^zoom:ok/.test(x)),'the next step (zoom out) still ran');
 ok(r.st==='failed'&&r.why.length>3,'status = failed with reason: '+r.why); ok(Math.max(...resp)<1500,'main thread answered while waiting (max round-trip '+Math.max(...resp)+' ms)'); ok(!r.lt.some(d=>d>400),'no long task over 400 ms during the run (max '+Math.round(Math.max(0,...r.lt))+' ms)');
 nomiMode='500'; await ev(()=>xaHandle('روح على المعادي على الخريطة')); r=await ev(()=>AG5.plan.map(s=>s.k+':'+s.st+':'+(s.why||''))); ok(r.some(x=>/^geo:fail:.*500/.test(x)),'HTTP 500 from the geocoder -> reported, no freeze'); nomiMode='ok';
 /* 7. Sensitive mode blocks the geocoder (and shows an Allow button) */
 const n7=nomi.length; await ev(()=>{ PRIV.cfg.sensitive=true; PRIV.cfg.geo=false; AG5G.cache.clear(); });
 await ev(()=>xaHandle('روح على المعادي، القاهرة')); r=await ev(()=>({plan:AG5.plan.map(s=>s.k+':'+s.st+':'+(s.why||'')),allow:!!document.getElementById('ag5allowgeo')}));
 ok(nomi.length===n7,'Sensitive mode: no request to Nominatim'); ok(r.plan.some(x=>/^geo:fail:.*(Sensitive|الحساس)/.test(x)),'Sensitive mode: step failed with the reason'); ok(r.allow,'Sensitive mode: "Allow and retry" offered');
 r=await ev(()=>{ try{ return fetch('https://nominatim.openstreetmap.org/search?q=x&format=json').then(()=>'sent',e=>'blocked:'+e.message); }catch(e){ return 'blocked'; } }); ok(/blocked/.test(r)&&nomi.length===n7,'privacy.js fetch gate also blocks a direct call');
 await ev(()=>document.getElementById('ag5allowgeo').click()); await wf(()=>!AG5.run&&AG5.plan.some(s=>s.k==='geo'&&s.st==='ok'),{timeout:30000}).catch(()=>{});
 r=await ev(()=>({geo:PRIV.cfg.geo,ok:AG5.plan.some(s=>s.k==='geo'&&s.st==='ok')})); ok(r.geo&&r.ok&&nomi.length>n7,'after "Allow": search runs (user choice stored in privacy settings)');
 await ev(()=>{ PRIV.cfg.sensitive=false; PRIV.cfg.geo=false; PRIV.save(); });
 /* 8. follow-ups refer to the last object (C.X line) */
 await ev(()=>xaHandle('ارسم خط 5 متر ثم خليه رأسي ثم قيسه'));
 r=await ev(()=>{ const e=AG5.ctx.obj&&AG5.ctx.obj.e; return {plan:AG5.plan.map(s=>s.k+':'+s.st),e:e&&[e.x1,e.y1,e.x2,e.y2],tab:ag5TabNow(),res:AG5.plan.map(s=>s.res).join(' | ')}; });
 console.log('   cad:',JSON.stringify(r));
 ok(r.plan.join(',')==='tab:ok,line:ok,orient:ok,measure:ok','line plan done'); ok(r.e&&Math.abs(r.e[0]-r.e[2])<1e-6&&Math.abs(Math.abs(r.e[3]-r.e[1])-5)<1e-6,'line is vertical and 5 m'); ok(/5\.00/.test(r.res),'measure says 5.00 m');
 await ev(()=>xaHandle('خليه 7 متر')); r=await ev(()=>{ const e=AG5.ctx.obj.e; return Math.hypot(e.x2-e.x1,e.y2-e.y1); }); ok(Math.abs(r-7)<1e-6,'follow-up "make it 7 m" changed the same line ('+r+')');
 await ev(()=>xaHandle('حركه 2 متر يمين')); r=await ev(()=>AG5.ctx.obj.e.x1); ok(r!==undefined,'follow-up move ran');
 await ev(()=>xaHandle('خليه أفقي')); r=await ev(()=>{ const e=AG5.ctx.obj.e; return [Math.abs(e.y2-e.y1),Math.abs(e.x2-e.x1)]; }); ok(r[0]<1e-6&&Math.abs(r[1]-7)<1e-6,'"make it horizontal" keeps 7 m');
 const nE=await ev(()=>cadD().ents.length); await ev(()=>xaHandle('امسحه')); r=await ev(()=>({n:cadD().ents.length,obj:AG5.ctx.obj})); ok(r.n===nE-1&&r.obj===null,'"delete it" removed that line only');
 await ev(()=>xaHandle('خليه 3 متر')); r=await ev(()=>AG5.plan.map(s=>s.st+':'+s.why)); ok(/fail:.*(nothing to act on|مفيش حاجة)/.test(r[0]),'no object left -> clear reason, no freeze');
 /* 9. learning: phrase memory */
 r=await ev(async()=>{ await ag5MemLoad(); const k=ag5Key('ارسم خط 5 متر ثم خليه رأسي ثم قيسه'); return {has:AG5.mem.has(k),n:AG5.mem.size,sug:ag5MemSuggest('ارسم خط',3).length}; }); ok(r.has,'successful request stored in phrase memory'); ok(r.sug>=1,'partial typing suggests the learned phrase');
 r=await ev(()=>new Promise(res=>{ const q=indexedDB.open('xto-ag5'); q.onsuccess=()=>{ const db=q.result; const g=db.transaction('mem').objectStore('mem').getAll(); g.onsuccess=()=>{ res(g.result.length); db.close(); }; }; q.onerror=()=>res(-1); })); ok(r>=1,'memory persisted in IndexedDB xto-ag5 ('+r+')');
 r=await ev(()=>{ const s=JSON.stringify(PRIV.packageText?PRIV.packageText():''); return /xto-ag5/.test(s); }); ok(!r,'phrase memory is not in the project package export');
 await ev(()=>{ AG5.mem.set(ag5Key('جهز الخريطه'),{k:ag5Key('جهز الخريطه'),p:'جهز الخريطه',n:1,t:Date.now(),steps:[{k:'tab',type:'gis'},{k:'zoom',v:1}]}); });
 await ev(()=>xaHandle('جهز الخريطه')); r=await ev(()=>({p:AG5.plan.map(s=>s.k+':'+s.st+(s.mem?':mem':'')),tab:ag5TabNow()})); ok(r.p.join(',')==='tab:ok:mem,zoom:ok:mem'&&r.tab==='gis','unknown phrase executed from learned memory');
 await ev(()=>document.getElementById('ag5forget').click()); await pg.waitForTimeout(300); r=await ev(()=>AG5.mem.size); ok(r===0,'"Forget all" wiped the memory');
 /* 10. speech: fake recognizer, end of speech after silence, max length, then auto-send */
 await ev(()=>{ AG5.cfg.sil=1200; AG5.cfg.max=20000; AG5.cfg.auto=true; window.__say='افتح جي اكس'; }); const s0=Date.now(); await ev(()=>ag5Listen());
 await wf(()=>window.__srStops>0,{timeout:15000}); const sAt=await ev(()=>window.__srStopAt), words=3;
 const silence=sAt-s0-words*120; ok(silence>=1000&&silence<2600,'stopped ~1.2 s after the last word (silence measured '+silence+' ms)');
 await wf(()=>!AG5.run&&AG5.plan.length&&AG5.plan[0].k==='tab'&&AG5.plan[0].st==='ok'&&AG5.plan.length===1,{timeout:20000}).catch(()=>{});
 r=await ev(()=>({p:AG5.plan.map(s=>s.k+':'+s.type+':'+s.st),txt:document.getElementById('ag5txt').value})); ok(r.p[0]==='tab:gis:ok','heard text auto-sent after the countdown and executed ('+r.p+')');
 await ev(()=>{ AG5.cfg.max=3000; window.__say=Array(60).fill('كلام').join(' '); window.__srStops=0; }); const m0=Date.now(); await ev(()=>ag5Listen()); await wf(()=>window.__srStops>0,{timeout:15000}); const mAt=await ev(()=>window.__srStopAt);
 ok(mAt-m0<4500,'max listening length enforced (stopped after '+(mAt-m0)+' ms, max 3000)'); await ev(()=>{ ag5CdStop(); document.getElementById('ag5txt').value=''; AG5.cfg.max=20000; });
 /* hands-free: listens again after a request finishes */
 await ev(()=>{ AG5.cfg.mode='free'; window.__srStarts=0; window.__say='كبر'; }); await ev(()=>xaHandle('افتح G.X')); await wf(()=>window.__srStarts>0,{timeout:8000}).catch(()=>{}); r=await ev(()=>window.__srStarts); ok(r>0,'hands-free: listening restarts after the request'); await ev(()=>{ AG5.cfg.mode='ptt'; ag5StopListen(false); ag5CdStop(); });
 /* 11. stop + dock */
 await ev(()=>{ AG5.tmo.geo=20000; }); nomiMode='hang'; const p11=ev(()=>xaHandle('روح على الزمالك، القاهرة ثم كبر')); await pg.waitForTimeout(1500); await pg.click('#ag5stop'); await p11; r=await ev(()=>({st:AG5.st,plan:AG5.plan.map(s=>s.st)})); ok(!/run|wait/.test(r.plan.join(','))&&r.st==='idle','Stop button cancels a hanging step at once ('+r.plan+')'); nomiMode='ok';
 const hb=await pg.locator('#ag5w .h b').boundingBox(); await pg.mouse.move(hb.x+5,hb.y+5); await pg.mouse.down(); await pg.mouse.move(150,150,{steps:5}); await pg.mouse.up(); r=await ev(()=>({c:AG5.cfg.corner,l:document.getElementById('ag5w').getBoundingClientRect().left})); ok(r.c==='tl'&&r.l<=20,'dragging docks the widget to the nearest corner ('+r.c+')');
 ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
 console.log((fail?'FAILED ':'ALL PASS ')+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.log('FAIL crash '+e.stack); process.exit(1); });
