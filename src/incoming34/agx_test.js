/* agx_test.js: tool index + live context (agx_tools.js). No network: the model is a MOCK put under the privacy fetch gate (PRIV._base),
   so the real gate (block / redact) is exercised and nothing leaves the page.
   Usage: NODE_PATH=<dir with playwright-core> nice -n 15 node agx_test.js file:///path/index.test.html   (one Chrome) */
const {chromium}=require('playwright-core');
const URL=process.argv[2]; const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0,fail=0; const ok=(c,m)=>{ if(c){ pass++; console.log('  ok   '+m); } else { fail++; console.log('  FAIL '+m); } };
/* query -> label that must be in the top 5 */
const EN=[['measure the distance between two points',/^(Measure )?Distance$/i],['zoom to fit the whole model',/^Zoom all$/i],['draw a wall',/^Wall$/],['take a screenshot of the view',/^Screenshot/],['run clash detection',/Clash/],
 ['draw a polyline',/^Polyline$/],['calculate cooling load',/Cooling Loads/],['open the bill of quantities',/BOQ|Quantities and cost/],['add a dimension',/^Dimension$/],['pipe route',/^Route Pipe$/]];
const AR=[['عايز اقيس المسافة بين نقطتين',/^(Measure )?Distance$/i],['ارسم حائط',/^Wall$/],['اعرض الموديل كله في الشاشة',/^Zoom all$/],['افتح جدول الكميات',/BOQ/],['شغل كشف التعارضات',/Clash/],
 ['ارسم دايره',/^Circle$/],['احسب احمال التكييف',/Cooling Loads/],['ضيف بُعد',/^Dimension$/],['خطوط الكنتور',/^Contours$/],['حديد التسليح',/^Rebar$/]];
(async()=>{
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-priv'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(URL); await pg.waitForFunction(()=>window.__lsv&&window.__lsv.ev,null,{timeout:60000}); await pg.waitForTimeout(2500);
 const E=async c=>{ const r=await pg.evaluate(c=>{ try{ const v=window.__lsv.ev(c); return (v&&typeof v.then==='function')?v.then(x=>typeof x==='string'?x:null,e=>'ERR '+e.message):(typeof v==='string'?v:null); }catch(e){ return 'ERR '+e.message; } },c); if(/^ERR /.test(r||''))console.log('   eval error: '+r+' in '+c.slice(0,80)); return r; };
 const J=async c=>{ const r=await E('Promise.resolve('+c+').then(v=>JSON.stringify(v===undefined?null:v))'); try{ return JSON.parse(r); }catch(e){ return r; } };
 /* --- index --- */
 const n=await J('agxIndex().docs.length'); ok(n>1000,'index holds '+n+' runnable commands (over 1000)');
 ok(await J('agxIndex()===agxIndex()'),'index is built once (same object on the next call)');
 ok(await J("agxIndex().docs.every(d=>XC[d.id]&&!XC[d.id].stub)"),'index has no stub (not built) command');
 ok(await J("agxNorm('الإحْداثِيّـات')===agxNorm('الاحداثيات')&&agxNorm('دائرة')===agxNorm('دايره')&&agxNorm('مبنى')===agxNorm('مبني')&&agxTok('والطبقات')[0]===agxTok('طبقات')[0]"),'Arabic normalisation: alef, hamza, ta marbuta, ya, diacritics, tatweel, article');
 let hit=0; for(const [set,name] of [[EN,'EN'],[AR,'AR']]){ for(const [q,rx] of set){ const r=await J('agxFind('+JSON.stringify(q)+').slice(0,5)'); const g=Array.isArray(r)&&r.some(x=>rx.test(x.label)); if(g)hit++; ok(g,name+' "'+q+'" -> '+(Array.isArray(r)?r.map(x=>x.label).join(' | '):r)); } }
 console.log('  top-5 hit rate on the test set: '+hit+'/'+(EN.length+AR.length));
 const f=await J("agxFind('draw a wall')[0]"); ok(f&&f.id&&f.label&&f.ar&&typeof f.help==='string'&&f.program,'a match carries id, label, Arabic label, one-line help, program');
 ok(await J("agxFind('contours','G.X').every(x=>/^G\\.X/.test(x.program))&&agxFind('contours','gis').length>0&&agxFind('contours','S.X').every(x=>/^S\\.X/.test(x.program))"),'program filter (G.X, gis, S.X) keeps only that program');
 /* --- tools reach both paths --- */
 ok(await J("['find_tools','run_tool','get_context'].every(n=>XAM.tools.some(t=>t.name===n))&&XAM.tools.length<=20"),'find_tools, run_tool, get_context are in XAM.tools; list stays short ('+await J('XAM.tools.length')+' tools, not the catalogue)');
 ok(await J("aiTools().some(t=>t.function.name==='run_tool')"),'native tool calling (OpenAI format) sees run_tool');
 ok(await J("(p=>p.acts.length===2&&p.acts[1].tool==='run_tool'&&p.bad===0)(FA.parse('ok\\n```tox\\n[{\"tool\":\"find_tools\",\"args\":{\"query\":\"wall\"}},{\"tool\":\"run_tool\",\"args\":{\"id\":\"zfit\"}}]\\n```'))"),'text protocol (faParse) accepts find_tools and run_tool');
 ok(await J("(p=>/find_tools\\(query, program\\)/.test(p)&&/Commands that may match/.test(p)&&/: Wall \\//.test(p)&&/\\[T\\.O X now\\]/.test(p))(FA.prompt('ارسم حائط'))"),'text protocol prompt lists the tools, the context line and the matching commands for the request');
 /* --- run_tool --- */
 await E("wtNew('model')"); await pg.waitForTimeout(900);
 let r=await J("xaTool('run_tool',{id:'gantt_open'})"); ok(r&&r.ok&&(r.opened||[]).some(x=>/Gantt/i.test(x))&&await J("!!(WX.lay['pane:gantt']&&WX.lay['pane:gantt'].open)"),'run_tool gantt_open opens the Gantt pane and reports it: '+JSON.stringify(r));
 const pid=await J("(agxFind('polyline','C.X')[0]||{}).id"); r=await J("xaTool('run_tool',{id:"+JSON.stringify(pid)+"})"); ok(r&&r.ok&&/C\.X/.test(r.switched_tab||'')&&await J("ribType()==='draft'"),'run_tool on a C.X ribbon command ('+pid+') opens the C.X tab first: '+JSON.stringify(r));
 r=await J("xaTool('run_tool',{id:'no_such_cmd'})"); ok(r&&r.ok===false&&/unknown id/.test(r.error),'unknown id is reported, nothing runs');
 await E("XCMD('agx_t_boom','gear','Boom test','اختبار',()=>{ throw new Error('boom 42'); })"); r=await J("xaTool('run_tool',{id:'agx_t_boom'})"); ok(r&&r.ok===false&&/boom 42/.test(r.error),'an error thrown by the command comes back as error text');
 /* --- safety --- */
 const BAD=['wipe_project','export_package','privacy_panel','p_share','new','rv_del','gis_clear','c_erase','hxt_del','ag5_forget','gis_kml'];
 ok(await J(JSON.stringify(BAD)+".every(id=>XC[id]&&agxRisk(id))"),'risk list covers wipe, export, privacy, share, new, delete, clear, erase, forget');
 ok(await J("['zfit','c_line','xf_gis','tab_model','gantt_open','undo','shot','m_dist'].every(id=>XC[id]&&!agxRisk(id))"),'ordinary commands are not flagged');
 await E("window.__ran={}; AGX.wait=350; "+JSON.stringify(BAD)+".forEach(id=>{ XC[id].run=()=>{ window.__ran[id]=1; }; })");
 let allRef=true; for(const id of BAD){ r=await J("xaTool('run_tool',{id:'"+id+"'})"); if(!(r&&r.refused&&r.ok===false))allRef=false; }
 ok(allRef&&await J("Object.keys(window.__ran).length===0"),'run_tool refuses all '+BAD.length+' destructive ids without a Yes (none ran)');
 r=await J("xaTool('run_command',{id:'wipe_project'})"); ok(r&&r.refused&&await J("!window.__ran.wipe_project"),'the older run_command goes through the same guard');
 ok(/Refused/.test(r.error)&&/Do not retry/.test(r.error),'refusal text is clear: '+r.error.slice(0,90));
 await E("AGX.wait=20000; window.__p=xaTool('run_tool',{id:'rv_del'}).then(v=>window.__pr=v); 1");
 const btn=async rx=>{ try{ await pg.waitForFunction(()=>document.querySelectorAll('.aglog button').length>=2,null,{timeout:4000}); }catch(e){ return false; } return pg.evaluate(rx=>{ const b=[...document.querySelectorAll('.aglog button')].find(x=>new RegExp(rx).test(x.textContent)); if(b){ b.click(); return true; } return false; },rx); };
 ok(await btn('^(No|لا)$'),'the question with Yes / No buttons is shown in the agent pane'); await pg.waitForTimeout(300);
 ok(await pg.evaluate(()=>window.__pr&&window.__pr.refused===true)&&await J("!window.__ran.rv_del"),'user pressed No: refused, not run');
 await E("window.__pr=null; xaTool('run_tool',{id:'rv_del'}).then(v=>window.__pr=v); 1"); await btn('^(Yes|أيوه)'); await pg.waitForTimeout(700);
 ok(await pg.evaluate(()=>window.__pr&&window.__pr.ok===true)&&await J("window.__ran.rv_del===1"),'user pressed Yes: the command runs');
 /* --- live context --- */
 await E("wtSwitch(WTAB.tabs.find(t=>t.type==='model').id)"); await pg.waitForTimeout(700);
 await E("RV.els.push({id:'W-77',k:'wall',h:3,t:0.2,len:4.25,name:'Client villa north wall',note:'call 0100 secret'}); RV.sel='W-77'; DATA.proj=Object.assign(DATA.proj||{},{name:'Secret Tower'}); PRIV.cfg.minimal=false; PRIV.cfg.sensitive=false");
 let c=await J("xaTool('get_context',{})"), line=await J('agxLine()');
 ok(c&&c.tab==='model'&&/R\.X/.test(c.program)&&c.selection&&c.selection.id==='W-77'&&c.selection.type==='wall'&&c.selection.dims.h===3&&c.selection.dims.len===4.25,'get_context: active tab, selected element id, type, dimensions: '+JSON.stringify(c.selection));
 ok(/tab: R\.X/.test(line)&&/id W-77, type wall/.test(line)&&/h=3/.test(line)&&/language: (ar|en)/.test(line)&&/units: /.test(line)&&/windows: /.test(line),'context line names the active tab and the selected element: '+line.trim().slice(0,150));
 ok(line.length<600,'context line is '+line.length+' characters (under 600)');
 ok(/Secret Tower/.test(line)&&!/Client villa|0100 secret/.test(line),'project name is in the line in normal mode; element free text (name, note) never is');
 ok(await J("aiSys().indexOf(agxLine())>0"),'the line is part of the system prompt (aiSys) each turn');
 await E("PRIV.cfg.minimal=true"); ok(!/Secret Tower/.test(await J('agxLine()')),'Minimal mode: project name withheld');
 /* --- model loop (OpenAI-style tool calling, what aiChat sends to Groq / OpenRouter / Ollama), mocked under the privacy gate --- */
 await E("PRIV.cfg.minimal=false; window.__calls=[]; window.__zf=0; XC.zfit.run=()=>{ window.__zf++; }; AI.hist=[]; "+
  "PRIV._base=async(u,i)=>{ const body=JSON.parse(i.body); window.__calls.push({u:String(u),raw:i.body,body}); const k=window.__calls.length; const tc=(n,a)=>({role:'assistant',content:null,tool_calls:[{id:'c'+k,type:'function',function:{name:n,arguments:JSON.stringify(a)}}]}); "+
  "const m=k===1?tc('find_tools',{query:'zoom all'}):k===2?tc('run_tool',{id:'zfit'}):{role:'assistant',content:'done'}; "+
  "return new Response(JSON.stringify({choices:[{message:m}]}),{status:200,headers:{'content-type':'application/json'}}); }; 1");
 const CLOUD="{base:'https://api.groq.com/openai/v1',model:'test-model',key:'test-key'}", LOCAL="{base:'http://localhost:11434/v1',model:'test-model',key:''}";
 await J("aiChat('fit the model in the view',"+CLOUD+")");
 const calls=await pg.evaluate(()=>window.__calls.map(c=>({u:c.u,sys:c.body.messages[0].content,tools:c.body.tools.map(t=>t.function.name),last:JSON.stringify(c.body.messages[c.body.messages.length-1])})));
 if(calls.length!==3)console.log('   debug calls '+JSON.stringify(calls).slice(0,600)+' log '+JSON.stringify(await J('PRIV.log().slice(-2)')).slice(0,400)+' chat '+JSON.stringify(await J('XAS.chat.slice(-2)')).slice(0,300));
 ok(calls.length===3&&/\[T\.O X now\] tab: R\.X/.test(calls[0].sys)&&/id W-77, type wall/.test(calls[0].sys)&&['find_tools','run_tool','get_context'].every(n=>calls[0].tools.indexOf(n)>=0),'native loop: the request carries the context line (tab, selection) and the three tools');
 ok(calls.length===3&&/zfit/.test(calls[1].last)&&/ran/.test(calls[2].last)&&await pg.evaluate(()=>window.__zf===1),'native loop: model found the command with find_tools, ran it with run_tool, got the result back');
 /* --- sensitive mode --- */
 await E("PRIV.cfg.sensitive=true; window.__calls.length=0; AI.hist=[]; 1"); await J("aiChat('fit the model in the view',"+CLOUD+")");
 ok(await pg.evaluate(()=>window.__calls.length===0),'Sensitive mode: nothing is sent to the cloud model (0 requests reached the network layer)');
 ok(await J("PRIV.log().some(e=>e.blocked&&/groq/.test(e.host))"),'Sensitive mode: the privacy log records the blocked request');
 line=await J('agxLine()'); ok(!/Secret Tower/.test(line)&&/withheld/.test(line)&&/id W-77/.test(line),'Sensitive mode: the context line has no project name');
 await J("aiChat('fit the model in the view',"+LOCAL+")"); const raw=await pg.evaluate(()=>window.__calls.map(c=>c.raw).join('\n'));
 ok(raw.length>0&&/localhost:11434/.test(await pg.evaluate(()=>window.__calls[0].u))&&!/Secret Tower|Client villa|0100 secret/.test(raw)&&/T\.O X now/.test(raw),'Sensitive mode: a local model still works, and what it gets has no project name and no element text');
 await E("PRIV.cfg.sensitive=false; PRIV.cfg.minimal=true; PRIV._base=null; AI.hist=[]; 1");
 ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' ; '):''));
 console.log('\n'+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0);
})();
