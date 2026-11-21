/* ====== ag5_exec: request -> explicit step plan -> steps run one after another with a visible cursor, each awaited until it really finished
   (tab opened and drawn, place found and shown, command returned) with a timeout. A step that fails says why and the rest go on (or the agent
   asks: retry / skip / stop). Never blocks the page: cursor = requestAnimationFrame tween with a timer fallback, cancelable; no busy waits.
   Session context (AG5.ctx: last tab, last object, last place) lets follow-ups refer back ("now zoom in", "make it vertical", "measure it").
   Phrase memory: successful requests -> steps, in IndexedDB "xto-ag5" on this computer only (not in the project package; deleted by the
   "Forget" button and by the privacy close-out wipe). Wraps xaHandle; questions (XAS.q) and anything it does not understand go to the old chain. ====== */
const AG5OURS=new Set(['tab','close','geo','zoom','zoomsel','line','wall','marker','del','orient','rot','move','len','height','measure','undo','stop']);
const ag5Sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ag5TabNow=()=>{ try{ return (WTAB.tabs.find(t=>t.id===WTAB.cur)||{}).type||''; }catch(e){ return ''; } };
function ag5Err(en,ar){ const e=new Error(ag5B(en,ar)); e.ag5=1; return e; }
function ag5Race(p,ms,why){ let t; return Promise.race([Promise.resolve(p),new Promise((_,j)=>{ t=setTimeout(()=>j(why instanceof Error?why:ag5Err('timed out: '+why,'المهلة خلصت: '+why)),ms); })]).finally(()=>clearTimeout(t)); }
function ag5Until(cond,ms,en,ar,R){ const t0=Date.now(); return new Promise((ok,no)=>{ const f=()=>{ let v=false; try{ v=cond(); }catch(e){} if(v)return ok(v); if(R&&R.cancel)return no(ag5Err('stopped','اتوقف')); if(Date.now()-t0>ms)return no(ag5Err(en,ar)); setTimeout(f,50); }; f(); }); }
/* ---------- cursor: rAF tween, timer fallback (background tabs pause rAF), cancel token ---------- */
function ag5CurEl(){ let c=document.getElementById('ag5cur'); if(c)return c; ag5Css(); c=ag5E('div',{id:'ag5cur',html:'<svg width="22" height="22" viewBox="0 0 20 20"><path d="M2 2l14 6-6 2-2 6z" fill="#4fc3f7" stroke="#0b1a22" stroke-width="1.2"/></svg><span>Jarvis</span>'}); document.body.appendChild(c); c._x=innerWidth-140; c._y=innerHeight-140; return c; }
function ag5Point(target,R,click){ const c=ag5CurEl(); let x,y; if(target&&target.getBoundingClientRect&&target.isConnected){ const r=target.getBoundingClientRect(); if(r.width||r.height){ x=r.left+Math.min(r.width/2,80); y=r.top+r.height/2; } } else if(Array.isArray(target)){ x=target[0]; y=target[1]; } if(x===undefined){ x=innerWidth/2; y=innerHeight/2; }
 c.style.display='block'; const x0=c._x, y0=c._y, d=Math.max(180,Math.min(650,Math.hypot(x-x0,y-y0)*.9)), t0=performance.now(); const set=(px,py)=>{ c._x=px; c._y=py; c.style.transform='translate('+Math.round(px)+'px,'+Math.round(py)+'px)'; };
 return new Promise(res=>{ let done=false; const fin=()=>{ if(done)return; done=true; set(x,y); if(click!==false){ const rp=ag5E('div',{class:'ag5rip',style:'left:'+x+'px;top:'+y+'px'}); document.body.appendChild(rp); setTimeout(()=>rp.remove(),650); } res(); };
  if(document.hidden){ fin(); return; } const fb=setTimeout(fin,d+250);
  const step=now=>{ if(done)return; if(R&&R.cancel){ clearTimeout(fb); fin(); return; } const k=Math.min(1,(now-t0)/d), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; set(x0+(x-x0)*e,y0+(y-y0)*e); if(k<1)requestAnimationFrame(step); else { clearTimeout(fb); fin(); } };
  requestAnimationFrame(step); }); }
/* ---------- parsing ---------- */
const AG5VERB='(?:افتح|اقفل|سكر|روح|وديني|خدني|ابحث|دور|اعمل|ارسم|قيس|قيسه|قيسها|كبر|صغر|قرب|زوم|زووم|حرك|حركه|حركها|انقل|لف|خلي|خليه|خليها|اجعل|حط|ضيف|امسح|احذف|شيل|طول|open|close|go|show|search|find|fly|zoom|measure|move|rotate|make|set|place|put|add|delete|remove|erase|draw|run|switch)';
function ag5Split(text){ const t=String(text||'').replace(/\s+/g,' ').trim(), n=norm(t), out=[];
 const re=new RegExp('\\s*(?:[;؛\\n]|(?:^|\\s)(?:ثم|بعدين|وبعدين|وبعد كده|وبعد كدا|بعد كده|بعد كدا|بعد ما تخلص|then|and then|after that|next)(?=\\s|$|[,،]))\\s*[,،]?\\s*|\\s*[,،]?\\s+(?:و\\s*|and\\s+)(?='+AG5VERB+'(?:\\s|$|[,،.]))|\\s*[,،]\\s*(?='+AG5VERB+'(?:\\s|$))','gi');
 let i=0, m; while((m=re.exec(n))){ if(m[0]===''){ re.lastIndex++; continue; } out.push(t.slice(i,m.index)); i=m.index+m[0].length; } out.push(t.slice(i));
 return out.map(x=>x.replace(/^[\s,،.]+|[\s,،.]+$/g,'')).filter(x=>x.length>0); }
const AG5U=[[/^(مم|ملي|مللي|ملليمتر|mm|millimet(er|re)s?)$/,.001],[/^(سم|سنتي|سنتيمتر|cm|centimet(er|re)s?)$/,.01],[/^(م|متر|مترا|امتار|meters?|metres?|m)$/,1],[/^(قدم|ft|feet|foot)$/,.3048],[/^(كم|كيلو|km)$/,1000]];
function ag5Num(s){ const n=norm(s).replace(/٫/g,'.'); let m=n.match(/(-?\d+(?:[.,]\d+)?)\s*([a-z؀-ۿ]+)?/); let v=null,u='';
 if(m){ v=+m[1].replace(',','.'); u=m[2]||''; } else if(typeof XAW!=='undefined'){ const w=n.split(/\s+/); for(let i=0;i<w.length;i++){ const k=w[i].replace(/^و/,''); if(XAW[k]!=null){ v=XAW[k]; u=w[i+1]||''; break; } } }
 if(v===null)return null; let k=1, unit='m'; for(const [re,f] of AG5U)if(re.test(u)){ k=f; unit=u; break; } if(/(ونص|و نص|and a half)/.test(n))v+=.5; return {v:v*k,raw:v,unit}; }
function ag5Deg(s){ const m=norm(s).match(/(-?\d+(?:\.\d+)?)\s*(درجه|درجات|deg|degrees?|°)/); return m?+m[1]:null; }
function ag5Dir(s){ if(/(يمين|right|شرق|east)/.test(s))return [1,0]; if(/(يسار|شمال|left|غرب|west)/.test(s)&&!/(ناحيه الشمال|للشمال|north)/.test(s))return [-1,0]; if(/(فوق|لفوق|up|north|للشمال|ناحيه الشمال)/.test(s))return [0,1]; if(/(تحت|لتحت|down|جنوب|south)/.test(s))return [0,-1]; return null; }
const AG5MAPW=/(?:^|\s)(خريط\S*|الخريط\S*|map|maps|gis|جي اي اس|g\.?x|جي اكس)(?=\s|$|[,،])/;
const AG5PLACEV=/(?:^|\s)(روح|رح|وديني|خدني|ابحث|دور علي|دور عن|go to|fly to|take me|find|search|locate|show me|zoom to)(?=\s|$)/;
const AG5PLACEH=/(مصر|egypt|القاهره|cairo|الجيزه|giza|اسكندريه|alexandria|شارع|street|st\.|حي|district|منطقه|مدينه|city|طريق|road|ميدان|square|كمبوند|compound|محافظه)/;
const AG5STOPW=/^(و?(افتح|روح|رح|وديني|خدني|ابحث|دور|علي|على|عن|لـ?|الي|الى|خريطه|خريطة|الخريطه|الخريطة|خريطت|تاب|التاب|تبويب|جي|اي|اس|اكس|gis|g\.?x|map|maps|the|open|go|to|fly|take|me|find|search|locate|show|tab|of|on|a|an|please|لو|سمحت|هات|وريني|ورينى))$/i;
function ag5Query(clause){ const toks=String(clause).replace(/[،]/g,', ').split(/\s+/), out=[]; toks.forEach(w=>{ const p=w.match(/[,.]+$/), core=w.replace(/[,.]+$/,''); if(/^(في|فى|in|بـ)$/i.test(core)){ out.push(','); return; } if(core&&!AG5STOPW.test(norm(core)))out.push(core); if(p&&out.length)out[out.length-1]+=','; }); return out.join(' ').replace(/\s*,\s*/g,', ').replace(/^[,\s]+|[,\s]+$/g,'').replace(/(,\s*)+/g,', ').trim(); }
function ag5TabOf(s){ if(/(?:^|\s)(map|maps)(?=\s|$)/.test(s))return 'gis'; try{ for(const k of TABK)if(k[0].test(s))return k[1]; }catch(e){}
 const AL={'جي':'G','ار':'R','سي':'C','اس':'S','بي':'P','ان':'N','كيو':'Q','اتش':'H','اي':'E','ام':'M','ال':'L','دي':'D','اف':'F','او':'O'}; let L=null; const m=s.match(/(?:^|[^a-z])([a-z])\s?\.\s?x(?![a-z])|(?:^|[^a-z])([a-z])x(?![a-z])/); if(m)L=(m[1]||m[2]).toUpperCase(); else { const m2=s.match(/(?:^|\s)(جي|ار|سي|اس|بي|ان|كيو|اتش|اي|ام|ال|دي|اف|او)\s?\.?\s?اكس(?=\s|$)/); if(m2)L=AL[m2[1]]; }
 if(L){ try{ for(const k in WTYPES){ const c=String(WTYPES[k].n[0]||'').split(' ')[0]; if(c===L+'.X')return k; } }catch(e){} } return null; }
/* one clause -> steps. tab0 = tab that will be current when this clause runs */
function ag5Clause(c,tab0){ const s=norm(c).replace(/[ًٌٍَُِّْـ]/g,''), num=ag5Num(s), has=re=>re.test(s);
 if(/^(وقف|بطل|خلاص|الغي|كفايه|stop|cancel|abort)( كده| خلاص| دلوقتي)?[.!]*$/.test(s))return [{k:'stop'}];
 const mem=ag5MemGet(c); if(mem)return mem.steps.map(x=>Object.assign({},x,{mem:1}));
 if(/^(تراجع|ارجع خطوه|undo)/.test(s))return [{k:'undo'}];
 if(has(/(?:^|\s)(اقفل|سكر|close)(?=\s|$)/)){ const ty=ag5TabOf(s); return [{k:'close',type:ty||''}]; }
 if(has(/(ارسم|draw|اعمل|create|ضيف|add)/)&&has(/(?:^|\s)(خط|line)(?=\s|$)/))return [{k:'line',v:num?num.v:5}];
 if(has(/(ارسم|draw|اعمل|create|ضيف|add)/)&&has(/(حيطه|حيط|حائط|جدار|wall)/))return [{k:'wall',v:num?num.v:5}];
 if(has(/(حط|ضيف|place|put|add|drop|mark|علم)/)&&has(/(علامه|نقطه|marker|pin|point|دبوس|ماركر)/))return [{k:'marker'}];
 if(has(/(?:^|\s)(امسح|احذف|شيل|delete|remove|erase)(?=\s|$|ه|ها)/)||/^(امسحه|امسحها|احذفه|احذفها|شيله|شيلها)/.test(s))return [{k:'del'}];
 if(has(/(راسي|عمودي|vertical|واقف)/))return [{k:'orient',v:'v'}]; if(has(/(افقي|horizontal|نايم)/))return [{k:'orient',v:'h'}];
 const deg=ag5Deg(s); if(deg!==null&&has(/(لف|دور|rotate|turn)/))return [{k:'rot',v:deg}];
 if(has(/(حرك|انقل|زق|move|shift)/)){ const d=ag5Dir(s); return [{k:'move',v:num?num.v:1,d:d||[1,0]}]; }
 if(num&&has(/(ارتفاع|ارتفاعه|ارتفاعها|height|high|tall|طلع|عالي)/))return [{k:'height',v:num.v}];
 if(num&&(has(/(طول|طوله|طولها|length|long)/)||has(/(قيس|measure)/)||has(/(خلي|خليه|خليها|اجعل|make|set)/)))return [{k:'len',v:num.v}];
 if(has(/(قيس|قيسه|قيسها|measure|مسافه|distance|كام متر|how long|how far)/))return [{k:'measure'}];
 if(has(/(زوم علي المحدد|zoom (to )?(the )?sel|زوم على المحدد|زوم علي العنصر|zoom to it|zoom on it)/))return [{k:'zoomsel'}];
 if(has(/(?:^|\s)(كبر|قرب|زوم ان|زووم ان|zoom in|closer|enlarge|zoom)(?=\s|$)/)&&!has(/(zoom out|صغر|ابعد)/))return [{k:'zoom',v:has(/(كمان|more|اكتر|اوي)/)?2:1}];
 if(has(/(صغر|ابعد|zoom out|farther)/))return [{k:'zoom',v:has(/(كمان|more|اكتر|اوي)/)?-2:-1}];
 const mapw=AG5MAPW.test(s), pv=AG5PLACEV.test(s), q=ag5Query(c), preset=ag5Preset(q);
 if(q&&q.length>1&&(mapw||preset||(pv&&(tab0==='gis'||AG5PLACEH.test(norm(q))))||AG5PLACEH.test(norm(q))&&has(/(افتح|open|show)/))){ const qt=ag5TabOf(norm(q)); if(!qt||qt==='gis'||AG5PLACEH.test(norm(q)))return [{k:'geo',q}]; }
 const ty=ag5TabOf(s); if(ty&&(has(/(افتح|روح|رح|open|go|show|switch|وريني)/)||s.split(' ').length<=3))return [{k:'tab',type:ty}];
 try{ const hit=xaFind(c); if(hit)return [{k:'cmd',id:hit.id}]; }catch(e){}
 return [{k:'old',text:c}]; }
const AG5NEED={geo:'gis',marker:'gis',line:'draft',wall:'model'};
function ag5Plan(text){ const whole=ag5MemGet(text), cl=whole?[text]:ag5Split(text), steps=[]; let tab=ag5TabNow();
 cl.forEach(c=>{ (whole?whole.steps.map(x=>Object.assign({},x,{mem:1})):ag5Clause(c,tab)).forEach(st=>{ const need=AG5NEED[st.k]; if(need&&tab!==need&&!(st.k==='line'&&typeof CS!=='undefined'&&CS.open)){ steps.push({k:'tab',type:need,auto:1}); tab=need; } if(st.k==='tab')tab=st.type; st.src=c; steps.push(st); }); });
 steps.forEach(ag5Label); const take=steps.some(s=>AG5OURS.has(s.k))&&!(steps.length===1&&(steps[0].k==='cmd'||steps[0].k==='old'||(steps[0].k==='stop'&&!AG5.run)));
 return {steps,take}; }
function ag5Label(st){ const tn=t=>{ try{ return xfTypeName(t); }catch(e){ return t; } }, m=v=>(+v).toFixed(2).replace(/\.00$/,'')+ag5B(' m',' م');
 const T={tab:()=>[ag5B('Open ','افتح ')+tn(st.type)],close:()=>[ag5B('Close ','اقفل ')+(st.type?tn(st.type):ag5B('this tab','التاب ده'))],geo:()=>[ag5B('Find on the map: ','دوّر على الخريطة: ')+st.q],
  zoom:()=>[st.v>0?ag5B('Zoom in','قرّب')+(st.v>1?' ×'+st.v:''):ag5B('Zoom out','بعّد')+(st.v<-1?' ×'+(-st.v):'')],zoomsel:()=>[ag5B('Zoom to it','زوم عليه')],line:()=>[ag5B('Draw a line ','ارسم خط ')+m(st.v)],wall:()=>[ag5B('Draw a wall ','ارسم حيطة ')+m(st.v)],
  marker:()=>[ag5B('Place a marker','حط علامة')],del:()=>[ag5B('Delete it','امسحه')],orient:()=>[st.v==='v'?ag5B('Make it vertical','خليه رأسي'):ag5B('Make it horizontal','خليه أفقي')],rot:()=>[ag5B('Rotate ','لف ')+st.v+'°'],
  move:()=>[ag5B('Move ','حرّك ')+m(st.v)],len:()=>[ag5B('Set length ','خلي الطول ')+m(st.v)],height:()=>[ag5B('Set height ','خلي الارتفاع ')+m(st.v)],measure:()=>[ag5B('Measure it','قيسه')],undo:()=>[ag5B('Undo','تراجع')],stop:()=>[ag5B('Stop','وقّف')],
  cmd:()=>{ const c=XC[st.id]; return [c?c.t[(typeof lang!=='undefined'&&lang==='ar')?1:0]:st.id]; },old:()=>[ag5B('Ask the agent: ','اسأل الوكيل: ')+String(st.text).slice(0,50)]}[st.k];
 st.label=(T?T()[0]:st.k)+(st.mem?ag5B(' (learned)',' (متعلّم)'):''); return st.label; }
/* ---------- run ---------- */
let AG5RID=0;
function ag5Cancel(){ const R=AG5.run; if(R){ R.cancel=true; if(R.ac)try{ R.ac.abort(); }catch(e){} } AG5.queue.length=0; if(AG5.ask){ AG5.ask('stop'); } }
function ag5Ask(R,q,opts){ const box=AG5.w.querySelector('.ask'); box.innerHTML=''; box.appendChild(ag5E('span',{text:q})); return new Promise(res=>{ AG5.ask=v=>{ AG5.ask=null; box.innerHTML=''; res(v); }; opts.forEach(o=>box.appendChild(ag5E('button',{text:o[0],onclick:()=>AG5.ask&&AG5.ask(o[1])}))); }); }
async function ag5Start(text,steps){ if(steps.length&&steps[0].k==='stop'){ ag5Cancel(); ag5StopListen(false); ag5Status('idle',ag5B('stopped','اتوقف')); return; }
 if(AG5.run){ return new Promise(res=>{ AG5.queue.push({text,steps,res}); ag5Msg(ag5B('Queued after the current request.','في الطابور بعد الطلب الحالي.')); }); }
 return ag5Exec(text,steps); }
async function ag5Exec(text,steps){ ag5Open(); if(!AG5.fromWidget)ag5Text(text,true); const R=AG5.run={id:++AG5RID,text,steps,cancel:false,k:0,t0:Date.now()}; AG5.plan=steps; steps.forEach(s=>{ s.st='wait'; s.res=s.why=''; });
 ag5Status('thinking'); ag5Paint(); ag5Msg(''); ag5Attr(''); xaLog('ag5','plan: '+steps.map(s=>s.label).join(' | ')); let fails=0, first='';
 try{ for(let k=0;k<steps.length;k++){ const st=steps[k]; if(R.cancel){ steps.slice(k).forEach(x=>x.st='skip'); break; } R.k=k; st.st='run'; ag5Status('doing',(k+1)+' / '+steps.length+' · '+st.label);
   try{ const tmo=st.k==='geo'?AG5.tmo.geo:st.k==='old'?AG5.tmo.old:st.k==='tab'?AG5.tmo.tab+2000:AG5.tmo.step; R.ac=(typeof AbortController!=='undefined')?new AbortController():null;
    st.res=String(await ag5Race(ag5Do(st,R),tmo,ag5Err('timed out after '+Math.round(tmo/1000)+' s','المهلة خلصت بعد '+Math.round(tmo/1000)+' ث'))||''); st.st='ok'; ag5Log(st,true,st.res);
   }catch(e){ if(R.ac)try{ R.ac.abort(); }catch(x){} if(R.cancel){ st.st='skip'; steps.slice(k+1).forEach(x=>x.st='skip'); break; } st.st='fail'; st.why=String(e&&e.message||e); fails++; if(!first)first=st.why; ag5Log(st,false,st.why);
    const dep=steps.slice(k+1).some(x=>(st.k==='tab'&&AG5NEED[x.k]===st.type)||(st.k==='geo'&&(x.k==='marker'||x.k==='zoomsel')));
    if(dep){ ag5Paint(); const a=await ag5Ask(R,ag5B('Step '+(k+1)+' failed: ','الخطوة '+(k+1)+' فشلت: ')+st.why,[[ag5B('Retry','حاول تاني'),'retry'],[ag5B('Skip it','كمّل من غيرها'),'skip'],[ag5B('Stop','وقّف'),'stop']]); if(a==='retry'){ fails--; st.why=''; k--; continue; } if(a==='stop'){ steps.slice(k+1).forEach(x=>x.st='skip'); break; } } }
   ag5Paint(); }
 }finally{ AG5.run=null; try{ const c=document.getElementById('ag5cur'); if(c)setTimeout(()=>{ if(!AG5.run)c.style.display='none'; },2500); }catch(e){} }
 const ok=steps.filter(s=>s.st==='ok').length; if(R.cancel)ag5Status('idle',ag5B('stopped','اتوقف')); else if(fails)ag5Status('failed',first); else ag5Status('done',ok+' / '+steps.length);
 const sum=R.cancel?ag5B('Stopped.','وقفت.'):fails?ag5B('Done '+ok+' of '+steps.length+'. Failed: ','خلصت '+ok+' من '+steps.length+'. فشل: ')+first:ag5B('Done: ','تمام: ')+steps.map(s=>s.res||s.label).filter(Boolean).slice(-2).join(' · ');
 ag5Msg(sum); try{ say2(sum,'a'); }catch(e){}
 if(!fails&&!R.cancel&&steps.every(s=>s.k!=='old'&&s.k!=='stop')&&steps.some(s=>AG5OURS.has(s.k)&&!s.mem))ag5MemPut(text,steps);
 const nx=AG5.queue.shift(); if(nx){ ag5Exec(nx.text,nx.steps).then(nx.res); } else if(AG5.cfg.mode==='free')ag5Relisten(); return {ok:!fails&&!R.cancel,fails,steps}; }
function ag5Log(st,ok,msg){ const o={t:new Date().toISOString(),k:st.k,label:st.label,ok,msg:String(msg).slice(0,200)}; AG5.log.push(o); if(AG5.log.length>200)AG5.log.shift(); try{ xaLog('ag5',(ok?'ok ':'FAIL ')+st.label+(msg?' -> '+msg:'')); }catch(e){} }
async function ag5Do(st,R){ const f=AG5OPS[st.k]; if(!f)throw ag5Err('no handler for '+st.k,'مفيش منفّذ لـ '+st.k); return await f(st,R); }
const AG5OPS={};
/* ---------- phrase memory (IndexedDB xto-ag5 / mem, this computer only) ---------- */
const ag5Key=t=>norm(String(t||'')).replace(/[ًٌٍَُِّْـ.,،!?؟]/g,' ').replace(/\s+/g,' ').trim();
function ag5Idb(){ return new Promise((ok,no)=>{ try{ const r=indexedDB.open('xto-ag5',1); r.onupgradeneeded=()=>r.result.createObjectStore('mem',{keyPath:'k'}); r.onsuccess=()=>ok(r.result); r.onerror=()=>no(r.error); }catch(e){ no(e); } }); }
async function ag5MemLoad(){ if(AG5.mem)return AG5.mem; AG5.mem=new Map(); try{ const db=await ag5Idb(); await new Promise(ok=>{ const q=db.transaction('mem').objectStore('mem').getAll(); q.onsuccess=()=>{ (q.result||[]).forEach(x=>AG5.mem.set(x.k,x)); ok(); }; q.onerror=ok; }); db.close(); }catch(e){} return AG5.mem; }
const AG5KEEP=['k','type','q','v','d','id'];
async function ag5MemPut(text,steps){ await ag5MemLoad(); const k=ag5Key(text); if(k.length<3)return; const o=AG5.mem.get(k)||{k,p:String(text).trim().slice(0,200),n:0}; o.n++; o.t=Date.now(); o.steps=steps.filter(s=>!s.auto).map(s=>{ const x={}; AG5KEEP.forEach(f=>{ if(s[f]!==undefined)x[f]=s[f]; }); return x; }); AG5.mem.set(k,o);
 if(AG5.mem.size>200){ [...AG5.mem.values()].sort((a,b)=>a.t-b.t).slice(0,AG5.mem.size-200).forEach(x=>AG5.mem.delete(x.k)); }
 try{ const db=await ag5Idb(); await new Promise(ok=>{ const tx=db.transaction('mem','readwrite'), st=tx.objectStore('mem'); st.clear(); AG5.mem.forEach(v=>st.put(v)); tx.oncomplete=ok; tx.onerror=ok; }); db.close(); }catch(e){} }
function ag5MemGet(t){ if(!AG5.mem)return null; const o=AG5.mem.get(ag5Key(t)); return o&&o.steps&&o.steps.length?o:null; }
function ag5MemSuggest(t,n){ if(!AG5.mem)return []; const k=ag5Key(t), w=new Set(k.split(' ').filter(x=>x.length>1)); const all=[...AG5.mem.values()].filter(o=>o.steps&&o.steps.length);
 if(!k)return all.sort((a,b)=>b.t-a.t).slice(0,n);
 return all.map(o=>{ const ow=new Set(o.k.split(' ')); let i=0; w.forEach(x=>{ if(ow.has(x))i++; }); const sc=o.k.indexOf(k)===0?2:i/Math.max(1,new Set([...w,...ow]).size); return [sc,o]; }).filter(x=>x[0]>=.34).sort((a,b)=>b[0]-a[0]||b[1].t-a[1].t).slice(0,n).map(x=>x[1]); }
async function ag5MemWipe(){ AG5.mem=new Map(); try{ await new Promise(ok=>{ const r=indexedDB.deleteDatabase('xto-ag5'); r.onsuccess=r.onerror=r.onblocked=()=>ok(); }); }catch(e){} }
/* ---------- hook: every agent request (typed, widget, always-on listener, bridge) comes through xaHandle ---------- */
{ const _h=xaHandle; AG5.old=_h; xaHandle=async function(t){ if((typeof XAS!=='undefined'&&XAS.q)||AG5.pass)return _h.apply(this,arguments); let P; try{ await ag5MemLoad(); P=ag5Plan(String(t||'')); }catch(e){ return _h.apply(this,arguments); } if(!P.take)return _h.apply(this,arguments); return ag5Start(String(t),P.steps); }; }
{ const _ws=wtSwitch; wtSwitch=function(){ const r=_ws.apply(this,arguments); try{ if(AG5.w&&AG5.w.style.display!=='none')ag5Front(); }catch(e){} return r; }; }
