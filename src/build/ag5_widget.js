/* ====== ag5_widget: the floating agent widget "Jarvis" (prefix AG5 / ag5). One small window on top of everything that stays with you across tabs and
   windows: a LARGE editable transcript (grows, scrolls, edit before sending), the step plan with live status (listening / thinking / doing k of n /
   done / failed + reason), push-to-talk or hands-free with end-of-speech detection (silence timeout, default 1.2 s, max 20 s), learned-phrase chips.
   Lazy: nothing is built and no listener is attached until first use (command ag5_open, Alt+J, the agent mic, or any agent request).
   Wraps xaVoice (the agent panel mic) without editing c_agent2.js. Settings key xto-ag5ui (UI only, no project data). ====== */
const AG5={w:null,st:'idle',why:'',plan:[],run:null,queue:[],ctx:{},log:[],mem:null,listening:false,lis:null,cd:null,ask:null,
 cfg:{mode:'ptt',sil:1200,max:20000,auto:true,corner:'br',min:false},tmo:{step:15000,tab:8000,geo:20000,old:90000}};
try{ const o=JSON.parse(localStorage.getItem('xto-ag5ui')||'null'); if(o&&typeof o==='object'){ if(o.mode==='free'||o.mode==='ptt')AG5.cfg.mode=o.mode; if(/^(tl|tr|bl|br)$/.test(o.corner))AG5.cfg.corner=o.corner; if(isFinite(+o.sil))AG5.cfg.sil=Math.max(400,Math.min(5000,+o.sil)); if(isFinite(+o.max))AG5.cfg.max=Math.max(3000,Math.min(60000,+o.max)); AG5.cfg.auto=o.auto!==false; AG5.cfg.min=!!o.min; } }catch(e){}
function ag5Save(){ try{ localStorage.setItem('xto-ag5ui',JSON.stringify(AG5.cfg)); }catch(e){} }
const ag5B=(en,ar)=>(typeof lang!=='undefined'&&lang==='ar')?ar:en;
function ag5E(tag,p,kids){ const d=document.createElement(tag); if(p)for(const k in p){ if(k==='text')d.textContent=p[k]; else if(k==='html')d.innerHTML=p[k]; else if(k.slice(0,2)==='on')d.addEventListener(k.slice(2),p[k]); else d.setAttribute(k,p[k]); } (kids||[]).forEach(c=>c&&d.appendChild(c)); return d; }
function ag5Css(){ if(document.getElementById('ag5css'))return; const s=document.createElement('style'); s.id='ag5css'; s.textContent=
 '#ag5w{position:fixed;z-index:99980;width:min(400px,calc(100vw - 24px));max-height:calc(100vh - 24px);display:flex;flex-direction:column;background:#1f2227;color:#e9eef3;border:1px solid #3c444d;border-radius:10px;box-shadow:0 10px 32px rgba(0,0,0,.55);font:14px "Segoe UI",Tahoma,Arial,sans-serif;resize:horizontal;overflow:hidden;min-width:280px}'+
 '#ag5w .h{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#2a2f36;cursor:grab;user-select:none;touch-action:none}#ag5w .h b{font-size:13px;letter-spacing:.3px}#ag5w .h .sp{flex:1}'+
 '#ag5w button{background:#343b44;color:#e9eef3;border:1px solid #4a535e;border-radius:6px;padding:4px 9px;font:inherit;font-size:12.5px;cursor:pointer}#ag5w button:hover{background:#3f4852}#ag5w button.on{background:#2f6fb2;border-color:#4b8fd6}'+
 '#ag5w .st{font-size:12px;padding:2px 8px;border-radius:99px;background:#3a4048;white-space:nowrap;max-width:190px;overflow:hidden;text-overflow:ellipsis}#ag5w .st.listening{background:#a8322d;animation:ag5p 1s infinite}#ag5w .st.thinking{background:#9a6b12}#ag5w .st.doing{background:#2f6fb2}#ag5w .st.done{background:#2e7d4f}#ag5w .st.failed{background:#a8322d}'+
 '@keyframes ag5p{50%{opacity:.6}}#ag5w .b{padding:8px;display:flex;flex-direction:column;gap:7px;overflow:auto}'+
 '#ag5txt{width:100%;box-sizing:border-box;min-height:72px;max-height:40vh;resize:vertical;font:16px/1.55 "Segoe UI",Tahoma,Arial,sans-serif;background:#14171b;color:#fff;border:1px solid #4a535e;border-radius:8px;padding:8px 10px;overflow-y:auto}#ag5txt.live{border-color:#d9534f}'+
 '#ag5w .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}#ag5w .mic.live{background:#a8322d;border-color:#d9534f}#ag5w .cd{font-size:12px;color:#f0b35a}'+
 '#ag5w ol{margin:0;padding:0 0 0 4px;list-style:none;max-height:30vh;overflow:auto}#ag5w ol li{display:flex;gap:7px;padding:3px 4px;border-radius:5px;font-size:13px;align-items:flex-start}#ag5w ol li.run{background:#24344a}#ag5w ol li.fail{color:#ff9a94}#ag5w ol li.ok{color:#a8e0b5}#ag5w ol li i{font-style:normal;width:16px;flex:none;text-align:center}#ag5w ol li small{display:block;color:#b8c0c8;font-size:12px}'+
 '#ag5w .sug span{display:inline-block;margin:2px;padding:2px 9px;border:1px solid #4b8fd6;border-radius:99px;font-size:12px;cursor:pointer}#ag5w .msg{font-size:12.5px;color:#cfd6dd;white-space:pre-wrap}#ag5w .attr{font-size:11px;color:#9aa4ae}#ag5w .attr a{color:#9cc7f0}'+
 '#ag5w .ask{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:13px;color:#f0b35a}#ag5w .set{display:grid;grid-template-columns:auto 1fr;gap:5px 8px;font-size:12.5px;align-items:center}#ag5w .set input[type=number]{width:70px}'+
 '#ag5w.min .b{display:none}#ag5cur{position:fixed;left:0;top:0;z-index:99996;pointer-events:none;will-change:transform;display:none}#ag5cur span{position:absolute;left:16px;top:16px;font:600 11px "Segoe UI",Arial;padding:2px 8px;border-radius:99px;background:#4fc3f7;color:#0b1a22;white-space:nowrap}'+
 '.ag5rip{position:fixed;z-index:99995;width:34px;height:34px;margin:-17px 0 0 -17px;border:2px solid #4fc3f7;border-radius:50%;pointer-events:none;animation:ag5r .6s ease-out forwards}@keyframes ag5r{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}';
 document.head.appendChild(s); }
function ag5Build(){ if(AG5.w)return AG5.w; ag5Css(); const L=k=>ag5B(k[0],k[1]);
 const st=ag5E('span',{class:'st',id:'ag5st',text:L(['Ready','جاهز'])}), mode=ag5E('button',{id:'ag5mode',title:L(['Push-to-talk (one request) or hands-free (keeps listening after each request)','اضغط واتكلم (طلب واحد) أو بدون إيدين (يفضل يسمع بعد كل طلب)']),onclick:()=>{ AG5.cfg.mode=AG5.cfg.mode==='free'?'ptt':'free'; ag5Save(); ag5Paint(); if(AG5.cfg.mode==='free'&&!AG5.listening&&!AG5.run)ag5Listen(); }});
 const h=ag5E('div',{class:'h'},[ag5E('span',{text:'●',style:'color:#4fc3f7'}),ag5E('b',{text:'Jarvis'}),st,ag5E('span',{class:'sp'}),mode,
  ag5E('button',{text:'⚙',title:L(['Settings','الإعدادات']),onclick:()=>{ const s=AG5.w.querySelector('.set'); s.hidden=!s.hidden; }}),
  ag5E('button',{text:'–',title:L(['Minimise','تصغير']),onclick:()=>{ AG5.cfg.min=!AG5.cfg.min; ag5Save(); ag5Paint(); }}),
  ag5E('button',{text:'×',title:L(['Close (the agent keeps working; Alt+J opens it again)','اقفل (الوكيل بيكمل شغل؛ Alt+J يفتحه تاني)']),onclick:()=>ag5Close()})]);
 const tx=ag5E('textarea',{id:'ag5txt',rows:'2',dir:'auto',placeholder:L(['Say or type: open G.X, go to Egypt, Maadi, street 9, then zoom in','قول أو اكتب: افتح G.X وروح على مصر، المعادي، شارع 9 وبعدين كبّر']),
  oninput:()=>{ ag5Grow(); ag5CdStop(); ag5Suggest(tx.value); },onfocus:()=>ag5CdStop(),onkeydown:e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); ag5Send(); } }});
 const mic=ag5E('button',{class:'mic',id:'ag5mic',text:'🎤 '+L(['Talk','اتكلم']),title:L(['Click: listen once, stops by itself when you stop talking. Hold: talk while held.','اضغط: يسمع مرة ويقف لوحده لما تسكت. اضغط مطولاً: يسمع طول ما انت ضاغط.'])});
 let held=0; mic.addEventListener('pointerdown',()=>{ held=Date.now(); if(!AG5.listening)ag5Listen({hold:true}); }); mic.addEventListener('pointerup',()=>{ if(AG5.listening&&AG5.lis&&AG5.lis.hold&&Date.now()-held>600)ag5StopListen(true); else if(AG5.lis)AG5.lis.hold=false; });
 const row=ag5E('div',{class:'row'},[mic,ag5E('button',{id:'ag5go',text:L(['Send ▶','نفّذ ▶']),title:L(['Run the text in the box','نفّذ النص اللي في الصندوق']),onclick:()=>ag5Send()}),
  ag5E('button',{id:'ag5stop',text:L(['Stop ■','وقّف ■']),title:L(['Stop listening and stop the running steps','وقّف السمع ووقّف الخطوات الشغالة']),onclick:()=>{ ag5StopListen(false); ag5Cancel(); }}),ag5E('span',{class:'cd'})]);
 const num=(k,lab,mul)=>ag5E('input',{type:'number',step:'0.1',min:'0.4',value:String(AG5.cfg[k]/mul),title:lab,onchange:e=>{ const v=+e.target.value*mul; if(isFinite(v)&&v>0){ AG5.cfg[k]=k==='sil'?Math.max(400,Math.min(5000,v)):Math.max(3000,Math.min(60000,v)); ag5Save(); } }});
 const auto=ag5E('input',{type:'checkbox',onchange:e=>{ AG5.cfg.auto=e.target.checked; ag5Save(); }}); auto.checked=AG5.cfg.auto;
 const set=ag5E('div',{class:'set'},[ag5E('span',{text:L(['Stop after silence (s)','يقف بعد سكوت (ث)'])}),num('sil','silence',1000),ag5E('span',{text:L(['Max listening (s)','أقصى مدة سمع (ث)'])}),num('max','max',1000),
  ag5E('span',{text:L(['Send by itself after speech','ينفّذ لوحده بعد الكلام'])}),auto,ag5E('span',{text:L(['Learned phrases','العبارات المتعلمة'])}),
  ag5E('button',{id:'ag5forget',text:L(['Forget all','امسحها كلها']),title:L(['Delete the phrase memory kept on this computer','امسح ذاكرة العبارات المحفوظة على الجهاز ده']),onclick:async()=>{ await ag5MemWipe(); ag5Msg(ag5B('Learned phrases deleted.','العبارات المتعلمة اتمسحت.')); ag5Suggest(''); }}),
  ag5E('span',{class:'attr',style:'grid-column:1/3',text:L(['Voice text and phrases stay on this computer. Place search uses OpenStreetMap Nominatim (blocked in Sensitive mode unless you allow it).','نص الكلام والعبارات بتفضل على الجهاز. البحث عن الأماكن من OpenStreetMap Nominatim (ممنوع في الوضع الحساس إلا لو سمحت).'])})]); set.hidden=true;
 const b=ag5E('div',{class:'b'},[tx,row,ag5E('div',{class:'sug'}),ag5E('ol',{class:'plan'}),ag5E('div',{class:'ask'}),ag5E('div',{class:'msg'}),ag5E('div',{class:'attr',id:'ag5attr'}),set]);
 const w=AG5.w=ag5E('div',{id:'ag5w',role:'dialog','aria-label':'Jarvis'},[h,b]); document.body.appendChild(w);
 /* drag anywhere, snap (dock) to the nearest corner on release */
 h.addEventListener('pointerdown',e=>{ if(e.target.closest('button'))return; const r=w.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top; h.setPointerCapture(e.pointerId); h.style.cursor='grabbing';
  const mv=ev=>{ w.style.left=Math.max(0,Math.min(innerWidth-40,ev.clientX-dx))+'px'; w.style.top=Math.max(0,Math.min(innerHeight-30,ev.clientY-dy))+'px'; w.style.right=w.style.bottom='auto'; };
  const up=ev=>{ h.releasePointerCapture(e.pointerId); h.style.cursor=''; h.removeEventListener('pointermove',mv); h.removeEventListener('pointerup',up); const q=w.getBoundingClientRect(); AG5.cfg.corner=(q.top+q.height/2<innerHeight/2?'t':'b')+(q.left+q.width/2<innerWidth/2?'l':'r'); ag5Save(); ag5Place(); };
  h.addEventListener('pointermove',mv); h.addEventListener('pointerup',up); });
 addEventListener('resize',()=>{ if(AG5.w)ag5Place(); });
 document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&AG5.run&&AG5.w&&AG5.w.contains(document.activeElement))ag5Cancel(); });
 ag5Place(); ag5Paint(); ag5MemLoad().then(()=>ag5Suggest('')); return w; }
function ag5Place(){ const w=AG5.w; if(!w)return; const c=AG5.cfg.corner, m=12; w.style.left=w.style.right=w.style.top=w.style.bottom='auto'; if(c[1]==='l')w.style.left=m+'px'; else w.style.right=m+'px'; if(c[0]==='t')w.style.top=(m+40)+'px'; else w.style.bottom=(m+26)+'px'; }
function ag5Open(){ const w=ag5Build(); w.hidden=false; w.style.display='flex'; ag5Front(); return w; }
function ag5Close(){ if(AG5.w){ AG5.w.style.display='none'; } ag5StopListen(false); }
function ag5Front(){ if(AG5.w&&AG5.w.parentNode!==document.body)document.body.appendChild(AG5.w); if(AG5.w&&AG5.w.nextSibling)document.body.appendChild(AG5.w); }
function ag5Grow(){ const t=document.getElementById('ag5txt'); if(!t)return; t.style.height='auto'; t.style.height=Math.min(Math.max(72,t.scrollHeight+2),Math.round(innerHeight*.4))+'px'; }
function ag5Text(t,fin){ ag5Open(); const x=document.getElementById('ag5txt'); x.value=t; x.classList.toggle('live',!fin); ag5Grow(); x.scrollTop=x.scrollHeight; }
function ag5Msg(t){ if(!AG5.w)return; AG5.w.querySelector('.msg').textContent=t||''; }
function ag5Attr(html){ if(!AG5.w)return; document.getElementById('ag5attr').innerHTML=html||''; }
/* status: idle | listening | thinking | doing | done | failed */
function ag5Status(st,txt){ AG5.st=st; AG5.why=txt||''; ag5Paint(); }
function ag5Paint(){ const w=AG5.w; if(!w)return; w.dir=(typeof lang!=='undefined'&&lang==='ar')?'rtl':'ltr'; w.classList.toggle('min',AG5.cfg.min); const s=w.querySelector('#ag5st');
 const T={idle:['Ready','جاهز'],listening:['Listening…','بسمع…'],thinking:['Thinking…','بفكر…'],doing:['Doing','بنفّذ'],done:['Done','تم'],failed:['Failed','فشل']}[AG5.st]||['',''];
 s.className='st '+AG5.st; s.textContent=ag5B(T[0],T[1])+(AG5.why?': '+AG5.why:''); s.title=s.textContent;
 const m=w.querySelector('#ag5mode'); m.textContent=AG5.cfg.mode==='free'?ag5B('Hands-free','بدون إيدين'):ag5B('Push-to-talk','اضغط واتكلم'); m.classList.toggle('on',AG5.cfg.mode==='free');
 const mic=w.querySelector('#ag5mic'); mic.classList.toggle('live',AG5.listening); mic.textContent=(AG5.listening?'■ ':'🎤 ')+(AG5.listening?ag5B('Listening','بسمع'):ag5B('Talk','اتكلم'));
 const ol=w.querySelector('.plan'); ol.innerHTML=''; AG5.plan.forEach((p,i)=>{ const ic={wait:'·',run:'◐',ok:'✓',fail:'✗',skip:'–'}[p.st||'wait']; const li=ag5E('li',{class:p.st||'wait'},[ag5E('i',{text:ic}),ag5E('div',{},[ag5E('span',{text:(i+1)+'. '+p.label}),p.res||p.why?ag5E('small',{text:p.why||p.res}):null])]); ol.appendChild(li); }); }
function ag5CdStop(){ if(AG5.cd){ clearInterval(AG5.cd); AG5.cd=null; } const c=AG5.w&&AG5.w.querySelector('.cd'); if(c)c.textContent=''; }
function ag5Send(){ ag5CdStop(); const x=document.getElementById('ag5txt'); const t=(x&&x.value||'').trim(); if(!t)return; x.value=''; x.classList.remove('live'); ag5Grow(); try{ say2(t,'u'); }catch(e){} AG5.fromWidget=true; return Promise.resolve(xaHandle(t)).finally(()=>{ AG5.fromWidget=false; }); }
/* after speech: put the text in the box, then send it after a short countdown that any edit cancels */
function ag5Heard(t){ t=String(t||'').trim(); ag5Status('idle'); if(!t){ ag5Msg(ag5B('I did not hear anything.','ماسمعتش حاجة.')); if(AG5.cfg.mode==='free'&&!AG5.run)ag5Relisten(); return; } ag5Text(t,true);
 if(!AG5.cfg.auto){ ag5Msg(ag5B('Check the text, then press Send.','راجع الكلام وبعدين دوس نفّذ.')); return; } let n=15; const c=AG5.w.querySelector('.cd'); ag5CdStop();
 AG5.cd=setInterval(()=>{ n--; c.textContent=ag5B('Sending in ','هيتنفذ بعد ')+(n/10).toFixed(1)+ag5B(' s (click the text to edit)',' ث (اضغط على النص عشان تعدّل)'); if(n<=0){ ag5CdStop(); ag5Send(); } },100); }
function ag5Relisten(){ setTimeout(()=>{ if(AG5.cfg.mode!=='free'||AG5.listening||AG5.run||!AG5.w||AG5.w.style.display==='none')return; if(window.speechSynthesis&&speechSynthesis.speaking){ ag5Relisten(); return; } ag5Listen(); },500); }
/* listening: browser speech recognition with interim text, or the configured speech-to-text (bridge Whisper, local Whisper, server) with a level VAD */
function ag5Listen(o){ ag5Open(); if(AG5.listening){ ag5StopListen(true); return; } ag5CdStop(); o=o||{};
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition, srv=(typeof AI!=='undefined'&&AI.stt&&AI.stt!=='webspeech'&&typeof aiTranscribe==='function');
 const L=AG5.lis={hold:!!o.hold,t0:Date.now(),last:0,txt:'',iv:0,stop:null}; AG5.listening=true; ag5Status('listening'); ag5Text('',false);
 const end=(why)=>{ if(AG5.lis!==L)return; clearInterval(L.iv); AG5.lis=null; AG5.listening=false; ag5Paint(); xaLog('ag5','listen end: '+why); };
 L.tick=()=>{ const now=Date.now(); if(L.hold)return; if(L.last&&now-L.last>AG5.cfg.sil)L.stop('silence'); else if(now-L.t0>AG5.cfg.max)L.stop('max'); else if(!L.last&&now-L.t0>8000)L.stop('nothing'); };
 if(SR&&!srv){ const r=new SR(); L.r=r; r.lang=(typeof lang!=='undefined'&&lang==='en')?'en-US':'ar-EG'; r.continuous=true; r.interimResults=true; let fin='';
  r.onresult=e=>{ let it=''; for(let i=e.resultIndex;i<e.results.length;i++){ const x=e.results[i]; if(x.isFinal)fin+=(fin?' ':'')+x[0].transcript.trim(); else it+=x[0].transcript; } L.txt=(fin+(it?' '+it:'')).trim(); L.last=Date.now(); ag5Text(L.txt,false); };
  L.stop=(why)=>{ if(L.done)return; L.done=why||'stop'; try{ r.stop(); }catch(e){} setTimeout(()=>{ if(AG5.lis===L){ end(L.done); if(why!=='cancel')ag5Heard(L.txt); } },700); };
  r.onend=()=>{ if(AG5.lis!==L)return; end(L.done||'ended'); if(L.done!=='cancel')ag5Heard(L.txt); }; r.onerror=e=>{ if(e&&e.error==='not-allowed'){ end('denied'); ag5Status('failed',ag5B('microphone blocked','المايك ممنوع')); } };
  try{ r.start(); }catch(e){ end('start'); ag5Status('failed',ag5B('speech recognition did not start','التعرف على الكلام مابدأش')); return; } L.iv=setInterval(L.tick,150); return; }
 if(!navigator.mediaDevices||!window.MediaRecorder){ end('none'); ag5Status('failed',ag5B('no speech input in this browser: type instead','مفيش إدخال صوت في المتصفح ده: اكتب')); return; }
 navigator.mediaDevices.getUserMedia({audio:true}).then(stm=>{ if(AG5.lis!==L){ stm.getTracks().forEach(t=>t.stop()); return; } const ac=new (window.AudioContext||window.webkitAudioContext)(), an=ac.createAnalyser(); an.fftSize=1024; ac.createMediaStreamSource(stm).connect(an); const buf=new Float32Array(an.fftSize), rec=new MediaRecorder(stm), ch=[]; rec.ondataavailable=e=>{ if(e.data.size)ch.push(e.data); };
  const close=()=>{ try{ stm.getTracks().forEach(t=>t.stop()); ac.close(); }catch(e){} };
  rec.onstop=async()=>{ close(); if(L.done==='cancel'||!L.last){ end(L.done||'nothing'); if(L.done!=='cancel')ag5Heard(''); return; } end(L.done); ag5Status('thinking',ag5B('transcribing','بحوّل الكلام لنص')); try{ ag5Heard(await aiTranscribe(new Blob(ch,{type:rec.mimeType||'audio/webm'}))); }catch(e){ ag5Status('failed',ag5B('speech-to-text error: ','خطأ تحويل الكلام: ')+e.message); } };
  L.stop=(why)=>{ if(L.done)return; L.done=why||'stop'; try{ rec.state!=='inactive'?rec.stop():close(); }catch(e){} };
  const vad=()=>{ if(AG5.lis!==L)return; an.getFloatTimeDomainData(buf); let s=0; for(const v of buf)s+=v*v; if(Math.sqrt(s/buf.length)>.02){ L.last=Date.now(); ag5Text(ag5B('(speaking…)','(بتتكلم…)'),false); } L.tick(); };
  rec.start(250); L.iv=setInterval(vad,100); }).catch(()=>{ end('denied'); ag5Status('failed',ag5B('microphone blocked','المايك ممنوع')); }); }
function ag5StopListen(send){ const L=AG5.lis; if(!L)return; if(L.stop)L.stop(send?'user':'cancel'); else { clearInterval(L.iv); AG5.lis=null; AG5.listening=false; ag5Paint(); } }
/* learned-phrase chips (memory lives in ag5_exec.js) */
function ag5Suggest(t){ if(!AG5.w)return; const box=AG5.w.querySelector('.sug'); box.innerHTML=''; const hits=ag5MemSuggest(t,3); if(!hits.length)return; box.appendChild(ag5E('span',{text:ag5B('Learned:','متعلّم:'),style:'border:0;cursor:default;padding-left:0'}));
 hits.forEach(h=>box.appendChild(ag5E('span',{text:h.p.slice(0,60),title:ag5B('Run it again: ','نفّذها تاني: ')+h.steps.map(ag5Label).join(' → '),onclick:()=>{ const x=document.getElementById('ag5txt'); x.value=h.p; ag5Grow(); ag5Send(); }}))); }
/* entry points: command, Alt+J, the agent panel mic */
XCMD('ag5_open','agent','Agent widget (Jarvis): talk or type, it works across tabs','ويدجت الوكيل (جارفيس): اتكلم أو اكتب، وبيشتغل معاك في كل التابات',()=>{ ag5Open(); document.getElementById('ag5txt').focus(); });
XCMD('ag5_listen','mic','Agent: listen now (stops by itself when you stop talking)','الوكيل: اسمع دلوقتي (بيقف لوحده لما تسكت)',()=>ag5Listen());
XCMD('ag5_forget','trash','Agent: forget learned phrases','الوكيل: امسح العبارات المتعلمة',async()=>{ await ag5MemWipe(); try{ xSt(ag5B('Learned phrases deleted.','العبارات المتعلمة اتمسحت.')); }catch(e){} });
XDESC.ag5_open=['Opens the floating agent window. It stays on top while you change tabs, shows what it heard in a large box you can edit, the plan of steps and what it is doing now. Alt+J opens and closes it.','بيفتح نافذة الوكيل العائمة. بتفضل فوق وانت بتغيّر التابات، وبتعرض اللي سمعه في صندوق كبير تقدر تعدّله، وخطة الخطوات وبيعمل إيه دلوقتي. Alt+J بيفتحها ويقفلها.'];
XDESC.ag5_listen=['Starts listening for one request. Stops after about 1.2 s of silence or 20 s at most (change in the widget settings).','بيبدأ يسمع طلب واحد. بيقف بعد حوالي 1.2 ثانية سكوت أو 20 ثانية بالأكتر (تقدر تغيّرها من إعدادات الويدجت).'];
XDESC.ag5_forget=['Deletes the phrases the agent learned from your past requests. They are kept only on this computer.','بيمسح العبارات اللي الوكيل اتعلمها من طلباتك. محفوظة على الجهاز ده بس.'];
document.addEventListener('keydown',e=>{ if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.code==='KeyJ'){ e.preventDefault(); if(AG5.w&&AG5.w.style.display!=='none')ag5Close(); else ag5Open(); } });
if(typeof xaVoice==='function'){ xaVoice=function(){ if(AG5.listening){ ag5StopListen(true); return; } ag5Listen(); }; }
