/* privacy_test.js: templates and exports are neutral, redaction + fetch gate, wipe, keys never leave.
   fetch is MOCKED under the gate (PRIV._base): no real provider is contacted. One Chrome, nice -n 15.
   Usage: NODE_PATH=<dir with playwright-core> nice -n 15 node privacy_test.js file:///path/index.test.html [bridge.py] */
const {chromium}=require('playwright-core'); const cp=require('child_process'), fs=require('fs'), os=require('os'), path=require('path');
const URLP=process.argv[2]; const BRIDGE=process.argv[3]||path.resolve(__dirname,'tox_bridge.py');
const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0,fail=0; const ok=(c,m)=>{ if(c){ pass++; console.log('  ok   '+m); } else { fail++; console.log('  FAIL '+m); } };
/* identifiers of the real drawings / files / titles the sample was digitised from: none may appear in any template, export or store */
const REAL=/liftstation|lift station viewer|LS-01|LS-3D|ME-GLY|BIS-ME|SEWEGE|Mecra|Drive TOX|Sewage Lift Station|SEWAGE LIFT STATION|Circular Concrete|2026-11-19/i;
const K1='sk-TESTONLY_abcdefghijklmnop1234', K2='gsk_TESTONLYabcdefghij12345678', K3='AIzaTESTONLY_abcdefghijklmnopqrst', K4='123456789:AATESTONLYabcdefghijklmnopqrstuvwx', K5='n8n-secret-token-ABCDEF123456';
(async()=>{
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});
 await ctx.addInitScript(()=>{ try{ if(!sessionStorage.getItem('__first')){ sessionStorage.setItem('__first','1'); } sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept('1'));
 const boot=async()=>{ await pg.goto(URLP,{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(4500); };
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await boot(); await E("lang='en';1"); console.log('== load');
 ok(er.length===0,'no page errors on load '+JSON.stringify(er.slice(0,2)));
 ok(await E("typeof PRIV==='object'&&typeof PRIV.wipe==='function'"),'PRIV module present');

 console.log('== 1. templates and exports carry no real project identifiers');
 await pg.evaluate(()=>{ window.__dl=[]; window.__bl={}; const cu=URL.createObjectURL.bind(URL); URL.createObjectURL=b=>{ const u=cu(b); window.__bl[u]=b; return u; }; HTMLAnchorElement.prototype.click=function(){ window.__dl.push({name:this.download,url:this.href}); }; });
 const FN={projectJson:"projectJson()",boqCsv:"boqCsv()",ifc:"ifc()",dxf3d:"dxf3d()",sheetSvg:"sheetSvg(mkSheet())",p6Csv:"p6Csv()",xer:"xerText()",mspdi:"mspdiXml()",report:"reportText()",brief:"agentBrief()",share:"shareUrl()",obj:"obj()",dom:"document.body.innerText+document.title",ls:"JSON.stringify(Object.assign({},localStorage))",packageText:"PRIV.packageText()"};
 for(const tpl of ['sewage','blank','house2','office3']){
   if(tpl!=='sewage')await E("tpNew('"+tpl+"',{download:false});1");
   const bad=[]; for(const k in FN){ let v; try{ v=await E("String("+FN[k]+")"); }catch(e){ v=''; } const m=v.match(new RegExp(REAL.source,'gi')); if(m)bad.push(k+':'+[...new Set(m)].slice(0,3)); }
   ok(bad.length===0,'template '+tpl+': no identifier in 15 exports/stores '+JSON.stringify(bad));
 }
 await E("tpNew('blank',{download:false});1");
 const tb=await E("JSON.stringify({t:DR.title,s:DR.sheet,d:DR.dwg,sub:DR.sub,pn:DATA.proj&&DATA.proj.name})").then(JSON.parse);
 ok(tb.s==='SH-01'&&tb.d==='DWG-01'&&tb.sub===''&&/Untitled/.test(tb.t),'blank title block is neutral '+JSON.stringify(tb));
 await E("tpNew('sewage',{download:false});1");
 ok(/Sample project/.test(await E("DR.title")),'the station is labelled "Sample project (demo)"');
 ok(/^Pump station sample \(mechanical\)$/.test(await E("TEMPLATES.sewage.n[0]"))&&/Sample project/.test(await E("TEMPLATES.sewage.title[0]")),'template card says Pump station sample (mechanical); project title says Sample project'); /*separate: card renamed*/
 /* file names of real downloads */
 const cmds=['e_boq','e_csv','e_dxf3','e_ifc','e_obj','xml','xlsxs','csvs','xlsx','e_boq'].filter((x,i,a)=>a.indexOf(x)===i);
 for(const c of cmds){ try{ await E("XC['"+c+"']&&XC['"+c+"'].run();1"); await pg.waitForTimeout(150); }catch(e){} }
 await E("(async()=>{ try{ await xPack(); }catch(e){} })();1"); await pg.waitForTimeout(25000);
 const dls=await pg.evaluate(()=>window.__dl.map(x=>x.name)); console.log('       downloads: '+dls.join(', '));
 ok(dls.length>=6,'export commands produced downloads ('+dls.length+')');
 ok(dls.every(n=>!REAL.test(n)),'no download file name contains a project identifier');
 ok(dls.every(n=>!/^LiftStation/i.test(n)),'no LiftStation_ prefix');
 const blobs=await pg.evaluate(async()=>{ const o=[]; for(const d of window.__dl){ const b=window.__bl[d.url]; if(!b)continue; const buf=new Uint8Array(await b.arrayBuffer()); let s=''; for(let i=0;i<buf.length&&i<3e6;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192)); o.push([d.name,s]); } return o; });
 ok(blobs.length>=6,'captured '+blobs.length+' blobs');
 const badb=blobs.filter(x=>REAL.test(x[1])).map(x=>x[0]); ok(badb.length===0,'no export blob (incl. ZIP entry names, XLSX) contains an identifier '+JSON.stringify(badb));
 const zip=blobs.find(x=>/package.*\.zip$/.test(x[0])); if(zip){ const ents=[...zip[1].matchAll(/\d\d_[A-Za-z]+\/[A-Za-z0-9_.\-]+/g)].map(x=>x[0]); ok(ents.length>5&&ents.every(n=>!REAL.test(n)),'ZIP entry names neutral ('+ents.length+')'); } else console.log('  (zip package not captured: skipped)');
 /* PDF document properties */
 const pdf=await E("(async()=>{ const b=sheetPdf(mkSheet()); const buf=new Uint8Array(await b.arrayBuffer()); let s=''; for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192)); return s.slice(-1500); })()").catch(()=>null);
 ok(pdf!==null&&!/\/Author|\/Creator\s*\(.*(M7|Users)/.test(pdf)&&!REAL.test(pdf),'PDF info dict has no author / identifier'); 
 /* error bar + share link */
 await pg.evaluate(()=>window.dispatchEvent(new ErrorEvent('error',{message:'boom file:///Users/M7/secret/x.js',filename:'file:///Users/M7/secret/index.html',lineno:1,colno:2,error:{stack:'Error: boom\n at f (file:///Users/M7/secret/index.html:1:2)\n at g (file:///Users/M7/secret/index.html:3:4)'}})));
 const eb=await pg.evaluate(()=>document.getElementById('errbar').textContent); ok(/boom/.test(eb)&&!/Users|secret\//.test(eb),'error bar text has no file path: '+eb.slice(0,80));
 await pg.evaluate(()=>{ document.getElementById('errbar').hidden=true; });
 ok(!/Users|scratchpad|tmp/.test(await E("shareUrl()")),'share link / QR source has no local path');

 console.log('== 2. redaction');
 await E("tpNew('blank',{download:false});1");
 await E("DR.title='Acme Wadi Pumping Plant'; DATA.proj=Object.assign(DATA.proj||{},{name:'Acme Wadi Pumping Plant',client:'Nile Consult',loc:'Port Said Free Zone'}); DC.parties=[{name:'Delta Builders',contact:'Ahmed Samir',email:'a.samir@delta.example',phone:'+20 100 123 4567'}]; DC.docs=[{ref:'D1',subject:'x',file:'Plant_Layout_Rev3.dwg'}]; GM.lat=31.2653; GM.lon=32.3019; 1");
 const RS=t=>pg.evaluate(t=>PRIV.redactStr(t,true),t), RB=t=>pg.evaluate(t=>PRIV.redactStr(t,false),t);
 let r1=await RS("Please check Acme Wadi Pumping Plant for Nile Consult in Port Said Free Zone. Contact Ahmed Samir at a.samir@delta.example or +20 100 123 4567, see Plant_Layout_Rev3.dwg at 31.2653, 32.3019 and 252698.97 2212944.61. key "+K1);
 ok(!/Acme|Wadi|Nile Consult|Port Said|Ahmed|Samir|delta\.example|123 4567|Plant_Layout|31\.2653|252698|TESTONLY/.test(r1),'full redaction removes project, client, place, person, email, phone, file, coordinates, key: '+r1.slice(0,160));
 ok(/\[PROJECT-\d\]/.test(r1)&&/\[EMAIL-\d\]/.test(r1)&&/\[COORD-\d\]/.test(r1)&&/\[KEY\]/.test(r1),'pseudonyms are typed tokens');
 const rb=await RB("Acme Wadi Pumping Plant mail a.samir@delta.example "+K2+" Bearer abcdefghijklmnopqrstuvwx12");
 ok(/Acme Wadi/.test(rb)&&!/delta\.example|TESTONLY|abcdefghijklmnopqrstuvwx12/.test(rb),'basic level strips keys/email but leaves project words');
 ok(await pg.evaluate(()=>PRIV.unmask(PRIV.redactStr('mail a.samir@delta.example',true))==='mail a.samir@delta.example'),'unmask restores e-mail');
 ok(await pg.evaluate(k=>{ const t=PRIV.redactStr('x '+k,true); return !PRIV.unmask(t).includes(k); },K1),'a key is never restorable');
 ok(await E("(()=>{ XAG.key='my-agent-key-ABCDEFGH'; const t=PRIV.redactStr('use my-agent-key-ABCDEFGH now',false); XAG.key=''; return !/ABCDEFGH/.test(t); })()"),'stored key values are scrubbed by exact match');
 ok(!/Plant_Layout|Delta/.test(await RS('{"a":"Plant_Layout_Rev3.dwg by Delta Builders"}')),'file names and parties from the project stores are covered');

 console.log('== 3. fetch gate (mock under the gate)');
 await pg.evaluate(()=>{ window.__calls=[]; window.__resp=null; PRIV._base=async(u,o)=>{ window.__calls.push({u:String(u),o:o||{}}); const r=window.__resp; if(r&&r.sse){ const enc=new TextEncoder(); return new Response(new ReadableStream({start(c){ r.sse.forEach(x=>c.enqueue(enc.encode(x))); c.close(); }}),{status:200,headers:{'content-type':'text/event-stream'}}); } return new Response(typeof(r&&r.body)==='string'?r.body:JSON.stringify((r&&r.body)||{ok:1}),{status:200,headers:{'content-type':'application/json'}}); }; });
 const calls=()=>pg.evaluate(()=>window.__calls), reset=()=>pg.evaluate(()=>{ window.__calls=[]; window.__resp=null; }), setr=r=>pg.evaluate(r=>{ window.__resp=r; },r);
 const post=(u,body,h)=>pg.evaluate(async([u,body,h])=>{ try{ const r=await fetch(u,{method:'POST',headers:Object.assign({'content-type':'application/json'},h||{}),body:typeof body==='string'?body:JSON.stringify(body)}); return {ok:r.ok,text:await r.text()}; }catch(e){ return {err:String(e.message||e)}; } },[u,body,h]);
 const GROQ='https://api.groq.com/openai/v1/chat/completions';
 const msgs=n=>{ const m=[{role:'system',content:'sys'}]; for(let i=0;i<n;i++){ m.push({role:'user',content:'u'+i+' Acme Wadi Pumping Plant'}); m.push({role:'assistant',content:'a'+i}); } m.push({role:'user',content:'last Acme Wadi Pumping Plant a.samir@delta.example'}); return m; };
 await E("PRIV.cfg.sensitive=false;PRIV.cfg.preview=false;PRIV.cfg.basic=true;PRIV.cfg.minimal=true;PRIV.cfg.hist=12;PRIV.cfg.prov={};PRIV.cfg.geo=false;1");
 await setr({body:{choices:[{message:{content:'Mail [EMAIL-1] about it'}}]}});
 let x=await post(GROQ,{model:'m',messages:msgs(1)},{authorization:'Bearer '+K2}); let c=await calls();
 ok(c.length===1&&/Acme Wadi/.test(c[0].o.body)&&!/delta\.example/.test(c[0].o.body),'normal mode: e-mail stripped, project words untouched, provider reached');
 ok(c[0].o.headers.authorization==='Bearer '+K2,'API key header passes untouched to its own provider');
 ok(/a\.samir@delta\.example/.test(x.text),'response tokens are mapped back for the user');
 await reset(); await E("PRIV.cfg.sensitive=true;1");
 x=await post(GROQ,{model:'m',messages:msgs(1)},{authorization:'Bearer '+K2}); c=await calls();
 ok(x.err&&/Blocked/.test(x.err)&&c.length===0,'sensitive: unknown AI provider is blocked and never reached');
 ok(/Sensitive/.test(await pg.evaluate(()=>document.getElementById('xSt')?document.getElementById('xSt').innerText:'')),'status bar says why');
 await E("PRIV.cfg.prov['api.groq.com']='redact';1");
 /* sensitive turns the preview on by default in the panel; here set it explicitly */
 await E("PRIV.cfg.preview=true;1"); await reset();
 const pend=pg.evaluate(async([u,m,k])=>{ try{ const r=await fetch(u,{method:'POST',headers:{authorization:'Bearer '+k},body:JSON.stringify({model:'m',messages:m})}); return {ok:r.ok}; }catch(e){ return {err:String(e.message)}; } },[GROQ,msgs(1),K2]);
 await pg.waitForSelector('#privPrev',{timeout:8000}); const pv=await pg.textContent('#privPrevText');
 ok(!/Acme|Wadi|delta\.example/.test(pv)&&/\[PROJECT-\d\]/.test(pv),'preview shows the redacted text exactly');
 ok(!pv.includes(K2),'preview has no key');
 ok((await calls()).length===0,'nothing sent while the preview is open');
 await pg.click('#privSend'); x=await pend; c=await calls();
 ok(x.ok&&c.length===1&&c[0].o.body.includes('[PROJECT-')&&!/Acme|delta\.example/.test(c[0].o.body),'after Send the redacted body goes out');
 ok(JSON.parse(c[0].o.body).messages.length<=7,'history trimmed to 6 + system in sensitive mode ('+JSON.parse(c[0].o.body).messages.length+')');
 ok(JSON.parse(c[0].o.body).messages.filter(m=>m.role!=='system')[0].role==='user','trimmed history starts with a user message');
 await reset(); const pend2=pg.evaluate(async([u,m])=>{ try{ await fetch(u,{method:'POST',body:JSON.stringify({model:'m',messages:m})}); return {}; }catch(e){ return {err:String(e.message)}; } },[GROQ,msgs(1)]);
 await pg.waitForSelector('#privPrev'); await pg.click('#privCancel'); x=await pend2;
 ok(/Cancelled/.test(x.err||'')&&(await calls()).length===0,'Cancel in the preview sends nothing');
 await E("PRIV.cfg.preview=false;1"); await reset();
 /* local provider plain */
 x=await post('http://localhost:11434/v1/chat/completions',{model:'q',messages:msgs(0)}); c=await calls();
 ok(c.length===1&&/Acme Wadi/.test(c[0].o.body),'local model (Ollama) gets plain text in sensitive mode');
 await reset();
 /* proxy */
 const PX='http://127.0.0.1:8766/proxy'; const pbody=h=>({url:h,method:'POST',headers:{authorization:'Bearer '+K2},body:JSON.stringify({model:'m',messages:msgs(0)})});
 await E("delete PRIV.cfg.prov['api.groq.com'];1");
 x=await post(PX,pbody(GROQ)); ok(x.err&&(await calls()).length===0,'proxy to a non-allowed provider is blocked by the INNER host');
 await E("PRIV.cfg.prov['api.groq.com']='redact';1"); await reset();
 x=await post(PX,pbody(GROQ)); c=await calls(); const ob=c[0]&&JSON.parse(c[0].o.body);
 ok(c.length===1&&ob.url===GROQ&&ob.headers.authorization==='Bearer '+K2&&!/Acme|delta/.test(ob.body)&&/\[PROJECT-/.test(ob.body),'proxy: inner body redacted, url/headers intact');
 await reset();
 /* geo, telegram, n8n, bridge, audio */
 let g=await pg.evaluate(async()=>{ try{ await fetch('https://nominatim.openstreetmap.org/search?format=json&q=Port%20Said'); return 'sent'; }catch(e){ return String(e.message); } }); ok(/Blocked/.test(g)&&(await calls()).length===0,'map lookup (sends place name) blocked in sensitive mode');
 await E("PRIV.cfg.geo=true;1"); g=await pg.evaluate(async()=>{ try{ await fetch('https://nominatim.openstreetmap.org/search?format=json&q=Port%20Said'); return 'sent'; }catch(e){ return String(e.message); } }); ok(g==='sent','map lookup allowed after the explicit switch'); await E("PRIV.cfg.geo=false;1"); await reset();
 x=await post('https://api.telegram.org/bot'+K4+'/sendMessage',{chat_id:1,text:'hi'}); ok(x.err&&/Blocked/.test(x.err),'Telegram blocked in sensitive mode');
 x=await post('https://hooks.example.com/webhook/abc',{text:'Acme'},{'x-tox-token':K5}); ok(x.err&&/Blocked/.test(x.err),'n8n webhook blocked unless allowed');
 await E("PRIV.cfg.prov['hooks.example.com']='redact';1"); await reset(); x=await post('https://hooks.example.com/webhook/abc',{text:'Acme Wadi Pumping Plant'},{'x-tox-token':K5}); c=await calls(); ok(c.length===1&&!/Acme/.test(c[0].o.body)&&c[0].o.headers['x-tox-token']===K5,'n8n allowed -> redacted text, token header intact'); await reset();
 x=await post('http://127.0.0.1:8766/inbox?t=tok',{text:'about Acme Wadi Pumping Plant'}); c=await calls(); ok(c.length===1&&!/Acme/.test(c[0].o.body),'bridge inbox text redacted'); await reset();
 x=await post('http://127.0.0.1:8766/result?t=tok',{id:'1',result:{docs:[{subject:'Plant_Layout_Rev3.dwg'}]}}); c=await calls(); ok(c.length===1&&!/Plant_Layout/.test(c[0].o.body),'bridge tool results redacted (only the tool-call data goes, and not raw)'); await reset();
 g=await pg.evaluate(async()=>{ try{ await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',body:new FormData()}); return 'sent'; }catch(e){ return String(e.message); } }); ok(/Blocked/.test(g),'cloud speech-to-text (audio) blocked: only local Whisper');
 g=await pg.evaluate(async()=>{ try{ await fetch('http://127.0.0.1:8766/ping'); return 'sent'; }catch(e){ return String(e.message); } }); ok(g==='sent','bridge /ping and other local calls pass');
 await E("PRIV.cfg.sensitive=false;1"); await reset();
 /* streaming */
 await setr({sse:['data: {"c":"hello [PERS','ON-1] and [EMA','IL-1] bye"}\n\n','data: [DONE]\n\n']});
 await E("PRIV.cfg.prov={};1"); x=await post(GROQ,{model:'m',stream:true,messages:[{role:'user',content:'Ahmed Samir a.samir@delta.example'}]}); ok(/delta\.example/.test(x.text),'streamed reply: tokens split across chunks are restored ('+x.text.slice(0,60).replace(/\n/g,' ')+')'); await reset();
 /* log */
 const lg=await pg.evaluate(()=>JSON.stringify(PRIV.log())+localStorage.getItem('xto-privlog'));
 ok(!/Acme|Samir|delta|TESTONLY|ABCDEF|Plant_Layout|Bearer/.test(lg)&&!lg.includes(K2)&&!lg.includes(K4),'outbound log has no keys, no message text, no names');
 ok(await pg.evaluate(()=>PRIV.log().some(l=>l.blocked)&&PRIV.log().some(l=>l.sent)&&PRIV.log().every(l=>l.t&&l.host&&l.cls)),'log records blocked and sent with host and type');
 ok(!/bot\d/.test(lg),'Telegram token scrubbed from logged path');

 console.log('== 4. minimum context for the model');
 await E("tpNew('sewage',{download:false});PRIV.cfg.sensitive=false;PRIV.cfg.minimal=true;1");
 let ab=await E("agentBrief()"); ok(!/Sample project|SH-01|STATE:|schedule|http|file:|T\.O X#/.test(ab.replace(/T\.O X workspace/,'')),'agent brief has no title, link, schedule or state dump');
 await E("PRIV.cfg.minimal=false;1"); ab=await E("agentBrief()"); ok(/STATE:/.test(ab)&&/Sample project/.test(ab),'with "minimum context" off the old full brief is back (not allowed in Sensitive mode)');
 await E("PRIV.cfg.sensitive=true;1"); ab=await E("agentBrief()"); ok(!/STATE:/.test(ab),'Sensitive mode forces the minimum brief'); await E("PRIV.cfg.sensitive=false;PRIV.cfg.minimal=true;1");
 ok(await E("(()=>{ const s=aiSys()+agSystem(); return /مسح|Never wipe/.test(s); })()"),'agent system prompts forbid wiping');
 ok(!(await E("XAGSAFE().includes('wipe_project')||XAGSAFE().includes('privacy_panel')")),'wipe command is not in the model command list');

 console.log('== 5. keys never reach exports, package, logs, history');
 await E("XAG.key='"+K1+"'; AI.key='"+K2+"'; AI.cheap.key='"+K3+"'; AI.sttKey='"+K4+"'; BR.token='"+K5+"'; CT.tg.token='"+K4+"'; sessionStorage.setItem('xto-aikey','"+K1+"'); localStorage.setItem('xto-fakeys',JSON.stringify({groq:'"+K2+"'})); localStorage.setItem('xto-agent-key','"+K1+"'); xaLog('user','my key is "+K1+" and mail a@b.example'); 1");
 await E("persist(); try{ ctSave&&ctSave(); }catch(e){}; 1");
 const surf={}; for(const k of ['projectJson','packageText','boqCsv','ifc','report','brief','dom']) surf[k]=await E("String("+FN[k]+")");
 surf.aglog=await E("localStorage.getItem('xto-aglog')||''"); surf.xas=await E("JSON.stringify({chat:XAS.chat,log:XAS.log})"); surf.hist=await E("JSON.stringify(AI.hist)+JSON.stringify(XAM.hist)+JSON.stringify(XAG.log)");
 surf.projkeys=await E("PRIV.projectKeys().map(k=>localStorage.getItem(k)).join('\\n')");
 for(const k in surf){ const v=surf[k]; ok(![K1,K2,K3,K4,K5].some(q=>v.includes(q)),'no key in '+k+(k==='packageText'?' (project package)':'')); }
 ok(!/a@b\.example/.test(surf.aglog),'agent action log keeps no pasted e-mail');
 ok(!surf.projkeys.includes('"token":"'+K4+'"')&&!surf.packageText.includes(K4),'Telegram token stays out of the project stores copy / package');
 ok(!/Acme|Wadi/.test(await E("JSON.stringify(PRIV.log())")),'log has no project names');

 console.log('== 6. wipe');
 const seed=async()=>{ await E("tpNew('blank',{download:false});1"); await E("DR.title='Acme Wadi Pumping Plant'; persist(); localStorage.setItem('xto-dc','{\"docs\":[{\"subject\":\"Acme\"}]}'); localStorage.setItem('xto-mom','{\"mt\":[1]}'); localStorage.setItem('xto-future-project-store','Acme'); PRIV.save(); localStorage.setItem('xto-theme','dark'); localStorage.setItem('xto-fa','{\"chain\":[\"groq\"]}'); localStorage.setItem('xto-fakeys','{\"groq\":\"k\"}'); localStorage.setItem('xto-agent-key','"+K1+"'); sessionStorage.setItem('xto-aikey','"+K1+"'); sessionStorage.setItem('xto-agentjunk','Acme'); XAS.chat.push({w:'u',t:'Acme'}); AI.hist=[{role:'user',content:'Acme'}]; 1"); await pg.evaluate(async()=>{ await new Promise((ok,no)=>{ const r=indexedDB.open('xto-hist',1); r.onupgradeneeded=()=>r.result.createObjectStore('kv'); r.onsuccess=()=>{ const t=r.result.transaction('kv','readwrite'); t.objectStore('kv').put('Acme project snapshot','cur'); t.oncomplete=()=>{ r.result.close(); ok(); }; }; r.onerror=()=>no(); }); if(window.caches){ try{ const c=await caches.open('acme-cache'); await c.put(new Request('https://example.invalid/x'),new Response('Acme')); }catch(e){} } }); };
 await seed();
 const before=await E("PRIV.projectKeys().length"); ok(before>=3,'seeded project keys: '+before);
 /* the agent path only ever asks */
 await E("xaHandle('wipe the project data'); 1"); await pg.waitForTimeout(500);
 ok(await pg.isVisible('#privWipe'),'agent words "wipe the project data" open the confirmation window');
 ok((await E("localStorage.getItem('xto-future-project-store')"))==='Acme','…and nothing was deleted by the agent');
 ok(await pg.isDisabled('#privWipeGo'),'delete button disabled until the word is typed');
 await pg.fill('#privWipeWord','nope'); ok(await pg.isDisabled('#privWipeGo'),'wrong word keeps it disabled');
 await pg.fill('#privWipeWord','WIPE');
 await pg.evaluate(()=>document.getElementById('privWipeGo').click());   /* a script click is not trusted */
 await pg.waitForTimeout(600); ok((await E("localStorage.getItem('xto-future-project-store')"))==='Acme','a scripted (untrusted) click does NOT wipe');
 await E("xaTool('run_command',{id:'wipe_project'}); 1"); await pg.waitForTimeout(300); ok((await E("localStorage.getItem('xto-future-project-store')"))==='Acme','tool run_command wipe_project only opens the window');
 await E("window.__calls=[]; BR.url='http://127.0.0.1:8766'; BR.token='tok'; 1");
 if(!await pg.isVisible('#privWipe'))await E("XC.wipe_project.run();1"); await pg.fill('#privWipeWord','WIPE');
 await pg.click('#privWipeGo'); await pg.waitForSelector('#privWipeReport',{timeout:15000}); const rep=await pg.textContent('#privWipeReport');
 console.log(rep.split('\n').map(l=>'       '+l.slice(0,170)).join('\n'));
 ok(await E("localStorage.getItem('xto-future-project-store')===null&&localStorage.getItem('xto-dc')===null&&localStorage.getItem('xto-mom')===null&&localStorage.getItem('lsv3-data')===null&&localStorage.getItem('lsv3-prev')===null"),'project keys (incl. an unknown future key) deleted');
 ok(await E("localStorage.getItem('xto-theme')==='dark'&&localStorage.getItem('xto-fa')!==null&&localStorage.getItem('xto-priv')!==null"),'app settings kept');
 ok(await E("localStorage.getItem('xto-fakeys')!==null&&localStorage.getItem('xto-agent-key')!==null&&sessionStorage.getItem('xto-aikey')!==null"),'API keys kept unless asked');
 ok(await E("sessionStorage.getItem('xto-agentjunk')===null&&sessionStorage.getItem('xto-auth')==='1'"),'sessionStorage project items deleted, login kept');
 ok(await E("XAS.chat.length===0&&AI.hist.length===0"),'agent chat + model history cleared');
 const idbs=await pg.evaluate(async()=>indexedDB.databases?(await indexedDB.databases()).map(d=>d.name):[]); ok(!idbs.includes('xto-hist'),'IndexedDB undo history deleted ('+JSON.stringify(idbs)+')');
 const cs=await pg.evaluate(async()=>window.caches?(await caches.keys()):null); ok(cs===null||cs.length===0,'Cache API emptied '+JSON.stringify(cs));
 ok(/localStorage:.*xto-dc/.test(rep)&&/IndexedDB/.test(rep)&&/Cache API/.test(rep)&&/sessionStorage/.test(rep),'report lists what was deleted');
 ok(/bridge inbox cleared|bridge answered|bridge not/.test(rep),'report says what happened to the bridge inbox');
 ok(/Not covered/.test(rep),'report says what a wipe does not cover');
 ok((await calls()).some(k=>/\/inbox\/clear\?t=tok/.test(k.u)),'bridge /inbox/clear called (local, token, only after confirmation)');
 await E("localStorage.setItem('lsv3-data','late write'); localStorage.setItem('xto-theme2','{}'); 1");
 ok(await E("localStorage.getItem('lsv3-data')===null&&localStorage.getItem('xto-theme2')==='{}'"),'autosave of project keys is refused after the wipe, settings still save');
 ok(/Acme/.test(await E("DR.title"))===false,'in-memory project reset to a blank one');
 await pg.click('#privReload'); await pg.waitForTimeout(5000);
 ok(await E("localStorage.getItem('xto-future-project-store')===null&&!/Acme/.test(DR.title)"),'after reload nothing of the project is back');
 /* wipe with keys */
 await E("lang='en';1"); await seed(); await E("XC.wipe_project.run();1"); await pg.check('#privWipeKeys'); await pg.fill('#privWipeWord','WIPE'); await pg.click('#privWipeGo'); await pg.waitForSelector('#privWipeReport',{timeout:15000});
 ok(await E("localStorage.getItem('xto-fakeys')===null&&localStorage.getItem('xto-agent-key')===null&&sessionStorage.getItem('xto-aikey')===null&&XAG.key===''"),'"also remove keys" removes stored and in-memory keys');
 ok(await E("localStorage.getItem('xto-theme')==='dark'"),'settings still kept');
 await pg.click('#privReload'); await pg.waitForTimeout(4500); await E("lang='en';1");
 /* Arabic confirm word */
 await E("lang='ar';1"); await E("XC.wipe_project.run();1"); ok((await pg.getAttribute('#privWipeWord','placeholder'))==='مسح','Arabic confirm word'); await pg.click('#privWipeCancel'); await E("lang='en';1");

 console.log('== 7. panel');
 await E("PRIV.panel();1"); ok(await pg.isVisible('#privPanel'),'privacy panel opens');
 await pg.check('#priv_sensitive'); ok(await E("PRIV.cfg.sensitive===true&&PRIV.cfg.preview===true")&&await pg.isVisible('#privBadge'),'Sensitive switch on: preview turns on and a badge shows');
 ok(await pg.isVisible('#privBtnWipe')&&await pg.isVisible('#privBtnExport')&&await pg.isVisible('#privLog'),'panel has export, wipe and the outbound log');
 await pg.fill('#privTestIn','mail me a@b.example'); ok(/\[EMAIL-\d\]/.test(await pg.textContent('#privTestOut')),'panel redaction test box works');
 await pg.uncheck('#priv_sensitive'); ok(!(await pg.isVisible('#privBadge').catch(()=>false)),'badge goes away when switched off');
 await E("PRIV.cfg.preview=false;PRIV.save();1");
 ok(await E("(()=>{ try{ PRIV.cfg.terms='X'; PRIV.save(); return /xto-priv/.test(Object.keys(localStorage).join())&&!/sk-|gsk_|AIza/.test(localStorage.getItem('xto-priv')); }catch(e){ return false; } })()"),'privacy settings are stored without secrets');

 console.log('== 8. bridge inbox (retention + clear)');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'toxb-')); const inbox=path.join(tmp,'in.jsonl');
 const run=(env,port)=>cp.spawn('python3',[BRIDGE,'--http-only'],{env:Object.assign({},process.env,{TOX_PORT:String(port),TOX_TOKEN:'tt',TOX_INBOX:inbox},env),stdio:['ignore','ignore','pipe']});
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const ready=async port=>{ for(let i=0;i<40;i++){ try{ await fetch('http://127.0.0.1:'+port+'/ping'); return true; }catch(e){ await sleep(250); } } return false; }; const hp=async(port,p,body)=>{ const r=await fetch('http://127.0.0.1:'+port+p,{method:'POST',body:JSON.stringify(body||{})}); return r.json().catch(()=>({})); };
 let pr=run({},8797); await ready(8797); await hp(8797,'/inbox?t=tt',{text:'secret note'}); ok(fs.readFileSync(inbox,'utf8').includes('secret note'),'bridge writes inbox line');
 ok((fs.statSync(inbox).mode&0o077)===0,'inbox file is owner-only (0600)');
 const cl=await hp(8797,'/inbox/clear?t=tt'); ok(cl.cleared===true&&fs.readFileSync(inbox,'utf8')==='','POST /inbox/clear empties it');
 const bad=await hp(8797,'/inbox/clear?t=bad'); ok(bad.error==='bad token','clear needs the token');
 pr.kill(); await sleep(400);
 fs.writeFileSync(inbox,JSON.stringify({t:'2000-01-01T00:00:00',from:'tab',text:'old'})+'\n'+JSON.stringify({t:new Date(Date.now()-60000).toISOString().slice(0,19),from:'tab',text:'fresh'})+'\n');
 pr=run({TOX_INBOX_DAYS:'1'},8798); await ready(8798); const left=fs.readFileSync(inbox,'utf8'); ok(!/old/.test(left)&&/fresh/.test(left),'startup prunes lines older than TOX_INBOX_DAYS'); pr.kill(); await sleep(400);
 pr=run({TOX_INBOX_DAYS:'0'},8799); await ready(8799); let errs=''; pr.stderr.on('data',d=>errs+=d); await hp(8799,'/inbox?t=tt',{text:'never stored'}).catch(e=>console.log('bridge stderr:',errs.slice(-400))); ok(fs.readFileSync(inbox,'utf8')==='','TOX_INBOX_DAYS=0: nothing is written'); pr.kill();
 fs.rmSync(tmp,{recursive:true,force:true});

 ok(er.length===0,'no page errors in the whole run '+JSON.stringify(er.slice(0,2)));
 console.log('\n'+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
