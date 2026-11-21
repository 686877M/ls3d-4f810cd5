/* ====== privacy.js: project store + "Close out project" wipe, AI data isolation. Prefix PRIV. No network calls of its own.
   Insert at the END of the chain, right before `window.__lsv=` (after templates.js). Needs: el, b2, lang, xSt, say2, XC, XCMD, XDESC, XAS, XAM, XAG, AI, BR, CT, HUB, DR, DATA, DC, TM, MM, IS, GM, projectJson, xPack, tpNew, agentBrief, idbPut.
   Honest limits are in SECURITY_PRIVACY.md: redaction is best-effort, a static page cannot stop the person who has it open. ====== */
const PRIV=(function(){
  const SK='xto-priv', LK='xto-privlog';
  /* app settings that survive a wipe (no project names inside). Anything else in localStorage is treated as PROJECT data and is wiped, so a key added later is private by default. */
  const KEEP=/^(xto-(theme|theme2|layout|preset|skin|role|ui2|noask|askclose|soft|glfb|intro|intro-seen|auth|ytinst|ytacct|ytsz|mediapos|tv|idle|radcustom|pray|orbauto|msstep|msspeed|ribc|ai|fa|news|vx|test|priv|agent|brurl)|lsv-lang)$/;
  const SECRET=/^xto-(agent-key|aikey|aikey2|aikey3|aisttkey|fakeys|fakeys-l|brtok|hub|aimodel|tgtok)$/;     /* removed only on request */
  const SS_KEEP=/^xto-(auth|intro-seen|hub|test)$/;
  const DEF={sensitive:false,basic:true,preview:false,minimal:true,hist:12,geo:false,terms:'',prov:{}};
  const cfg=Object.assign({},DEF); try{ Object.assign(cfg,JSON.parse(localStorage.getItem(SK)||'{}')); }catch(e){}
  const save=()=>{ try{ localStorage.setItem(SK,JSON.stringify(cfg)); }catch(e){} };
  const LOG=[]; try{ (JSON.parse(localStorage.getItem(LK)||'[]')||[]).forEach(x=>LOG.push(x)); }catch(e){}
  const logAdd=o=>{ LOG.unshift(o); if(LOG.length>200)LOG.pop(); try{ localStorage.setItem(LK,JSON.stringify(LOG.slice(0,100))); }catch(e){} };
  const S={locked:false, map:new Map(), rev:new Map(), cnt:{}};
  const projectKeys=()=>{ const o=[]; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(!KEEP.test(k)&&!SECRET.test(k))o.push(k); } }catch(e){} return o; };

  /* ---------- redaction ---------- */
  const GENERIC=/^(untitled project|project|sample project.*|main team|prj|blank|none|n\/a|yes|no|open|closed|draft|issued|pending|received|sent|office|villa|user|admin|team|client|consultant|contractor|site|ground|level \d+)$/i;
  const KINDS=[[/e-?mail/i,'EMAIL'],[/phone|mobile|tel\b|whatsapp/i,'PHONE'],[/file|fname|path|attach|upload|dwg|pdf/i,'FILE'],[/client|owner|org|company|consultant|contractor|supplier|vendor/i,'ORG'],[/loc|addr|place|city|site|plot|street|region/i,'PLACE'],[/name|person|contact|attend|assign|respons|author|\bby\b|from|\bto\b|chair|minute|lead|engineer|manager/i,'PERSON']];
  function harvest(o,add,depth){ if(o==null||depth>3)return; if(Array.isArray(o)){ o.slice(0,400).forEach(x=>harvest(x,add,depth)); return; } if(typeof o!=='object')return;
    for(const k in o){ const v=o[k]; if(typeof v==='string'){ const kd=KINDS.find(q=>q[0].test(k)); if(kd)add(kd[1],v); } else if(v&&typeof v==='object')harvest(v,add,depth+1); } }
  const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function termsList(){ const T=[], seen=new Set(); const add=(k,v)=>{ if(typeof v!=='string')return; v=v.trim(); if(v.length<3||v.length>90||GENERIC.test(v)||/^[\d\s.\-\/:]+$/.test(v))return; const lk=v.toLowerCase(); if(seen.has(lk))return; seen.add(lk); T.push([k,v]); };
    try{ add('PROJECT',DR.title); add('PROJECT',DR.sub); add('PROJECT',DR.dwg); add('PROJECT',DR.proj); add('PERSON',DR.by); add('PERSON',DR.chk); }catch(e){}
    try{ const P=DATA&&DATA.proj; if(P){ add('PROJECT',P.name); add('PROJECT',P.no); add('ORG',P.client); add('PLACE',P.loc); } }catch(e){}
    try{ const D=DC&&DC.proj; if(D){ add('PROJECT',D.name); add('PROJECT',D.code); add('ORG',D.client); add('ORG',D.consultant); add('ORG',D.contractor); } }catch(e){}
    try{ harvest(DC.parties,add,0); harvest(DC.docs,add,0); }catch(e){}
    try{ harvest(TM.teams,add,0); }catch(e){} try{ harvest(MM.mt,add,0); }catch(e){} try{ harvest(IS.list,add,0); }catch(e){}
    try{ add('PLACE',GM.addr); add('PLACE',GM.name); add('PLACE',GM.q); }catch(e){}
    String(cfg.terms||'').split(/[\n,;]+/).forEach(x=>add('TERM',x));
    return T.sort((a,b)=>b[1].length-a[1].length); }
  function secretValues(){ const V=new Set(), add=v=>{ if(typeof v==='string'&&v.trim().length>=8)V.add(v.trim()); };
    try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(SECRET.test(k))add(localStorage.getItem(k)); } for(let i=0;i<sessionStorage.length;i++){ const k=sessionStorage.key(i); if(SECRET.test(k))add(sessionStorage.getItem(k)); } }catch(e){}
    try{ const a=JSON.parse(localStorage.getItem('xto-agent')||'{}'); add(a.key); }catch(e){} try{ const c=JSON.parse(localStorage.getItem('xto-ctrl')||'{}'); add(c.tg&&c.tg.token); }catch(e){} try{ const h=JSON.parse(localStorage.getItem('xto-hub')||'{}'); add(h.secret); }catch(e){}
    try{ add(XAG.key); add(AI.key); add(AI.cheap&&AI.cheap.key); add(AI.sttKey); add(BR.token); add(CT.tg&&CT.tg.token); add(HUB.secret); }catch(e){}
    try{ const f=JSON.parse(localStorage.getItem('xto-fakeys')||'{}'); Object.keys(f).forEach(k=>add(typeof f[k]==='string'?f[k]:'')); }catch(e){}
    return [...V]; }
  const KEYRX=[/\bsk-[A-Za-z0-9_-]{16,}/g,/\bgsk_[A-Za-z0-9]{16,}/g,/\bAIza[0-9A-Za-z_-]{20,}/g,/\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}/g,/\bxox[abprs]-[A-Za-z0-9-]{10,}/g,/\bhf_[A-Za-z0-9]{20,}/g,/\bnvapi-[A-Za-z0-9_-]{20,}/g,/\b\d{8,10}:[A-Za-z0-9_-]{30,}/g,/\bBearer\s+[A-Za-z0-9._~+\/-]{16,}=*/gi,/\b(?:api[_-]?key|secret|token|password)["']?\s*[:=]\s*["']?[A-Za-z0-9._~+\/-]{12,}/gi];
  const EMAILRX=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  const PHONERX=[/(?:\+|\b00)\d[\d\s().-]{7,}\d/g,/\b01[0-25]\d{8}\b/g,/\b0\d{2,3}[\s.-]\d{3,4}[\s.-]\d{3,4}\b/g];
  const COORDRX=[/-?\d{1,3}\.\d{4,}\s*[,;\/ ]\s*-?\d{1,3}\.\d{4,}/g,/\b\d{6,7}\.\d{1,3}\b(?:\s*[,;\/ ]\s*\b\d{6,7}\.\d{1,3}\b)?/g,/\b\d{1,3}°\s*\d{1,2}['′]\s*\d{1,2}(?:\.\d+)?["″]?\s*[NSEW]/g];
  const FILERX=/[A-Za-z0-9_\-؀-ۿ][A-Za-z0-9_\-. ()؀-ۿ]{0,80}\.(?:pdf|dwg|dxf|ifc|rvt|rfa|xlsx?|docx?|pptx?|csv|png|jpe?g|tiff?|zip|rar|7z|nwd|nwc|nwf|xer|mpp|stsw|wtg|las|laz|obj|skp|json)\b/gi;
  const IPRX=/\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/g;
  function tok(kind,orig){ const key=kind+'|'+orig.toLowerCase(); let t=S.rev.get(key); if(!t){ S.cnt[kind]=(S.cnt[kind]||0)+1; t='['+kind+'-'+S.cnt[kind]+']'; S.rev.set(key,t); S.map.set(t,orig); } return t; }
  let N_=0;
  function redactStr(str,full){
    if(typeof str!=='string'||str.length<3)return str; if(/^data:/.test(str)||/^[A-Za-z0-9+\/=]{200,}$/.test(str))return str;
    let s=str;
    secretValues().forEach(v=>{ if(s.indexOf(v)>=0){ s=s.split(v).join('[KEY]'); N_++; } });
    KEYRX.forEach(r=>{ s=s.replace(r,()=>{ N_++; return '[KEY]'; }); });
    s=s.replace(EMAILRX,m=>{ N_++; return tok('EMAIL',m); });
    PHONERX.forEach(r=>{ s=s.replace(r,m=>{ if(m.replace(/\D/g,'').length<8)return m; N_++; return tok('PHONE',m); }); });
    if(full){
      const T=termsList(), ascii=[], other=[]; T.forEach(t=>(/^[\x20-\x7e]+$/.test(t[1])&&t[1].length<6?ascii:other).push(t));
      const kindOf=m=>{ const l=m.toLowerCase(); const f=T.find(t=>t[1].toLowerCase()===l); return f?f[0]:'TERM'; };
      if(other.length)s=s.replace(new RegExp('(?:'+other.map(t=>escRe(t[1])).join('|')+')','gi'),m=>{ N_++; return tok(kindOf(m),m); });
      if(ascii.length)s=s.replace(new RegExp('(?<![\\p{L}\\p{N}])(?:'+ascii.map(t=>escRe(t[1])).join('|')+')(?![\\p{L}\\p{N}])','giu'),m=>{ N_++; return tok(kindOf(m),m); });
      s=s.replace(FILERX,m=>{ N_++; return tok('FILE',m.trim()); });
      COORDRX.forEach(r=>{ s=s.replace(r,m=>{ N_++; return tok('COORD',m); }); });
      try{ [GM.lat,GM.lon].forEach(v=>{ if(typeof v==='number'&&isFinite(v)){ const q=v.toFixed(3).replace(/0+$/,''); if(q.length>=5)s=s.replace(new RegExp(escRe(q)+'\\d*','g'),m=>{ N_++; return tok('COORD',m); }); } }); }catch(e){}
      s=s.replace(IPRX,m=>{ N_++; return tok('TERM',m); });
    }
    return s; }
  const SKIPK=/^(model|role|type|id|tool_call_id|stream|temperature|max_tokens|tool_choice|anthropic_version|n|top_p)$/;
  function redactDeep(o,full,key){ if(typeof o==='string')return SKIPK.test(key||'')?o:redactStr(o,full); if(Array.isArray(o))return o.map(x=>redactDeep(x,full,key)); if(o&&typeof o==='object'){ const r={}; for(const k in o)r[k]=redactDeep(o[k],full,k); return r; } return o; }
  function redactText(text,full){ N_=0; let out; try{ out=JSON.stringify(redactDeep(JSON.parse(text),full)); }catch(e){ out=redactStr(String(text),full); } return {text:out,n:N_}; }
  const TOKRX=/\[(PROJECT|ORG|PLACE|PERSON|FILE|COORD|EMAIL|PHONE|TERM)-(\d+)\]/g;
  const unmask=t=>typeof t==='string'?t.replace(TOKRX,m=>S.map.has(m)?String(S.map.get(m)).replace(/\\/g,'\\\\').replace(/"/g,'\\"'):m):t;
  const scrubText=t=>{ N_=0; return redactStr(String(t),false); };      /* keys / emails / phones only: for logs, error text, exports */

  /* ---------- classify + decide ---------- */
  const LOCAL=/^(localhost|127\.0\.0\.1|\[::1\]|::1)$/;
  function classify(url,init){ let u; try{ u=new URL(url,location.href); }catch(e){ return {cls:'misc',host:'?',path:''}; }
    const host=u.hostname||'file', path=u.pathname, pw=path.replace(/\/bot[^\/]+/,'/bot***').replace(/[A-Za-z0-9_-]{32,}/g,'***'), qk=[...u.searchParams.keys()].join('&');
    const o={host,path:(pw+(qk?'?'+qk:'')).slice(0,120)};
    if(u.protocol==='file:'||u.protocol==='blob:'||u.protocol==='data:'||(location.protocol!=='file:'&&u.origin===location.origin&&!/\/(proxy|inbox|result|mcp)$/.test(path)&&!LOCAL.test(host)))return Object.assign(o,{cls:'local'});
    if(LOCAL.test(host)){ if(/\/proxy$/.test(path))return Object.assign(o,{cls:'proxy'}); if(/\/(inbox|result|mcp)$/.test(path))return Object.assign(o,{cls:'bridge',host:'bridge'}); return Object.assign(o,{cls:'local'}); }
    if(host==='api.telegram.org')return Object.assign(o,{cls:'telegram'});
    if(/nominatim|open-meteo|overpass/.test(host))return Object.assign(o,{cls:'geo'});
    const b=init&&init.body, method=String((init&&init.method)||'GET').toUpperCase();
    if(method!=='GET'&&b!=null){ if(typeof b==='string')return Object.assign(o,{cls:'ai'}); return Object.assign(o,{cls:/audio|transcri/.test(path)?'audio':'upload'}); }
    return Object.assign(o,{cls:'misc'}); }
  function decide(c){ if(c.cls==='local'||c.cls==='misc')return 'allow'; if(!cfg.sensitive)return 'allow';
    const pv=cfg.prov[c.host];
    if(c.cls==='ai')return (pv==='redact')?'redact':'block';
    if(c.cls==='bridge')return cfg.prov.bridge==='block'?'block':'redact';
    if(c.cls==='geo')return cfg.geo?'allow':'block';
    return 'block'; }      /* telegram, audio, upload to a non-local host */
  const histN=()=>cfg.sensitive?Math.min(+cfg.hist||12,6):(+cfg.hist||12);
  function trimMsgs(o){ if(!o||!Array.isArray(o.messages))return o; const n=histN(), sys=o.messages.filter(m=>m&&m.role==='system'), rest=o.messages.filter(m=>!(m&&m.role==='system')); if(rest.length<=n)return o;
    let k=rest.slice(-n); while(k.length&&!(k[0].role==='user'&&typeof k[0].content!=='undefined'&&!(Array.isArray(k[0].content)&&k[0].content.some(c=>c&&c.type==='tool_result'))))k=k.slice(1); if(!k.length)k=rest.slice(-1);
    return Object.assign({},o,{messages:sys.concat(k)}); }
  function shape(text,c,full){ let obj=null; try{ obj=JSON.parse(text); }catch(e){}
    if(obj&&c.cls==='proxy'){ /* {url,method,headers,body}: the model JSON is the nested body string */
      const inner=typeof obj.body==='string'?obj.body:null; if(inner!=null){ let io=null; try{ io=JSON.parse(inner); }catch(e){} if(io)io=trimMsgs(io); const r=redactText(io?JSON.stringify(io):inner,full); obj.body=r.text; return {text:JSON.stringify(obj),n:r.n,show:r.text}; } return {text,n:0,show:''}; }
    if(obj&&c.cls==='ai')obj=trimMsgs(obj);
    const r=redactText(obj?JSON.stringify(obj):text,full); return {text:r.text,n:r.n,show:r.text}; }

  /* ---------- preview ---------- */
  function preview(c,show,n,bytes){ return new Promise(res=>{ const old=document.getElementById('privPrev'); if(old)old.remove();
    let body=show; try{ body=JSON.stringify(JSON.parse(show),null,1); }catch(e){}
    const ov=el('div',{id:'privPrev',style:'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center'}), done=v=>{ ov.remove(); res(v); };
    const box=el('div',{style:'background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:14px;width:min(820px,94vw);max-height:90vh;display:flex;flex-direction:column;gap:8px'});
    box.append(el('b',{text:b2('This will be sent to ','هيتبعت إلى ')+c.host+' ('+c.cls+')'}),el('div',{class:'small',text:b2(n+' item(s) replaced before sending. Your API key goes only in the request header to this provider and is not part of this text.',n+' عنصر اتغيّر قبل الإرسال. مفتاحك بيروح في هيدر الطلب للمزوّد بس ومش جزء من النص ده.')+' · '+bytes+' B'}));
    box.append(el('pre',{id:'privPrevText',style:'overflow:auto;max-height:55vh;margin:0;padding:8px;background:var(--bg);border:1px solid var(--line);border-radius:8px;white-space:pre-wrap;word-break:break-word;font-size:12px',text:body.length>60000?body.slice(0,60000)+'\n…':body}));
    box.append(el('div',{class:'row'},el('button',{id:'privSend',class:'on',text:b2('Send','إرسال'),onclick:()=>done(true)}),el('button',{id:'privCancel',text:b2('Cancel','إلغاء'),onclick:()=>done(false)})));
    ov.append(box); document.body.appendChild(ov); }); }

  /* ---------- the fetch gate: every outbound request of the page passes here ---------- */
  const note=(en,ar)=>{ try{ xSt(b2(en,ar)); }catch(e){} };
  const P={_base:null}, RAW=window.fetch.bind(window);
  async function gated(input,init){
    const base=P._base||RAW; const url=typeof input==='string'?input:(input&&input.url)||String(input);
    const c=classify(url,init); let inner=c; let pb=null;
    if(c.cls==='proxy'&&init&&typeof init.body==='string'){ try{ pb=JSON.parse(init.body); inner=classify(pb.url,{method:pb.method||'POST',body:pb.body}); inner.viaProxy=true; }catch(e){} }
    const eff=c.cls==='proxy'?inner:c, m=decide(eff);
    const ent={t:new Date().toISOString(),cls:eff.cls,host:eff.host,path:(eff.viaProxy?'(proxy) ':'')+eff.path,method:String((init&&init.method)||'GET').toUpperCase(),mode:m,red:0,bytes:0,blocked:false,sent:false};
    if(m==='block'){ ent.blocked=true; logAdd(ent); note('Blocked by Sensitive project mode: '+eff.host+' ('+eff.cls+')','اتمنع بسبب وضع المشروع الحساس: '+eff.host+' ('+eff.cls+')'); throw new TypeError('Blocked by Sensitive project mode: '+eff.host); }
    let masked=false;
    const textual=init&&typeof init.body==='string'&&(c.cls==='ai'||c.cls==='bridge'||(c.cls==='proxy'&&eff.cls==='ai'));
    if(textual&&(cfg.sensitive||cfg.basic||cfg.preview)){
      const full=cfg.sensitive, r=shape(init.body,c.cls==='proxy'?Object.assign({},c,{cls:'proxy'}):c,full); ent.red=r.n; ent.bytes=r.text.length; masked=r.n>0;
      init=Object.assign({},init,{body:r.text});
      if(cfg.preview&&eff.cls!=='local'){ const ok=await preview(eff,c.cls==='proxy'?r.show:r.text,r.n,r.text.length); if(!ok){ ent.blocked=true; ent.mode='cancelled'; logAdd(ent); throw new TypeError('Cancelled in the send preview'); } }
    } else if(init&&typeof init.body==='string')ent.bytes=init.body.length;
    ent.sent=true; logAdd(ent);
    const r=await base(input,init);
    if(masked&&(eff.cls==='ai')&&r&&r.ok&&S.map.size){ try{ const ct=r.headers.get('content-type')||'';
        if(/event-stream/.test(ct)&&r.body){ const dec=new TextDecoder(), enc=new TextEncoder(); let carry='';
          const ts=new TransformStream({transform(ch,ctl){ carry+=dec.decode(ch,{stream:true}); const k=carry.lastIndexOf('['); const safe=k>=0&&carry.length-k<24?carry.slice(0,k):carry; carry=carry.slice(safe.length); if(safe)ctl.enqueue(enc.encode(unmask(safe))); },flush(ctl){ if(carry)ctl.enqueue(enc.encode(unmask(carry))); }});
          return new Response(r.body.pipeThrough(ts),{status:r.status,statusText:r.statusText,headers:r.headers}); }
        const t=await r.clone().text(); if(TOKRX.test(t)){ TOKRX.lastIndex=0; return new Response(unmask(t),{status:r.status,statusText:r.statusText,headers:r.headers}); } TOKRX.lastIndex=0; }catch(e){} }
    return r; }
  window.fetch=function(input,init){ return gated(input,init); };
  /* share links / system share also carry the report text: refuse them in sensitive mode */
  { const wo=window.open.bind(window); window.open=function(u){ if(cfg.sensitive&&/wa\.me|whatsapp|t\.me\/share|telegram|mailto:/i.test(String(u))){ note('Sharing is off in Sensitive project mode','المشاركة مقفولة في وضع المشروع الحساس'); return null; } return wo.apply(window,arguments); };
    if(navigator.share){ const ns=navigator.share.bind(navigator); navigator.share=function(){ if(cfg.sensitive){ note('Sharing is off in Sensitive project mode','المشاركة مقفولة في وضع المشروع الحساس'); return Promise.reject(new Error('blocked')); } return ns.apply(navigator,arguments); }; } }

  /* ---------- minimum context: the agent brief carries no title, link or schedule ---------- */
  { const _ab=agentBrief; agentBrief=function(){ return (cfg.sensitive||cfg.minimal)?MINBRIEF():_ab(); }; }
  const MINBRIEF=()=>'You are connected to the viewer of a T.O X workspace. The project name, location, people and files are withheld on purpose. Ask for what you need through BVT.call(cmd,args) (state, items, clashes, hazards, report); each call returns only its own data. Commands: state, setParam, setDay, runChecks, hazards, clashes, items, report, lesson.';

  /* ---------- project package (data only, no keys) ---------- */
  function stripSecrets(k,v){ if(k==='xto-ctrl'){ try{ const o=JSON.parse(v); if(o.tg)delete o.tg.token; return JSON.stringify(o); }catch(e){} } return v; }
  function packageObj(){ const o={format:'tox-project-package',v:1,exported:new Date().toISOString(),note:'Project data only. No API keys, tokens or settings.',project:JSON.parse(projectJson()),stores:{}};
    projectKeys().forEach(k=>{ if(k==='lsv3-prev'||k===LK)return; const v=localStorage.getItem(k); if(v!=null)o.stores[k]=stripSecrets(k,v); });
    o.agentChat=(typeof XAS!=='undefined'&&XAS.chat||[]).map(m=>({w:m.w,t:String(m.t).slice(0,2000)}));
    return o; }
  const packageText=()=>{ N_=0; return redactStr(JSON.stringify(packageObj(),null,1),false); };     /* last line of defence: key patterns + stored key values never leave in the package */
  async function exportPackage(){ const stamp=new Date().toISOString().slice(0,19).replace(/[:T]/g,'-'); out('Project_data_package_'+stamp+'.json',new Blob([packageText()],{type:'application/json'})); try{ await xPack(); }catch(e){} return true; }

  /* ---------- wipe ---------- */
  const bytes=(k,s)=>{ try{ return (s||localStorage).getItem(k).length; }catch(e){ return 0; } };
  async function wipe(o){ o=o||{}; const R={ls:[],ss:[],idb:[],caches:[],sw:0,mem:[],bridge:'',secrets:[],kept:[]};
    S.locked=true;                                  /* writes to project keys are refused from now until the page reloads */
    try{ tpNew('blank',{download:false}); }catch(e){}
    try{ projectKeys().forEach(k=>{ R.ls.push([k,bytes(k)]); localStorage.removeItem(k); }); }catch(e){}
    try{ const ks=[]; for(let i=0;i<sessionStorage.length;i++)ks.push(sessionStorage.key(i)); ks.forEach(k=>{ if(SS_KEEP.test(k)||(SECRET.test(k)&&!o.keys))return; R.ss.push([k,bytes(k,sessionStorage)]); sessionStorage.removeItem(k); }); }catch(e){}
    try{ let names=['xto-hist']; if(indexedDB.databases)names=[...new Set(names.concat((await indexedDB.databases()).map(d=>d.name).filter(Boolean)))];
      await Promise.all(names.map(n=>new Promise(ok=>{ let t=setTimeout(()=>{ R.idb.push([n,'pending until the page reloads']); ok(); },800); try{ const q=indexedDB.deleteDatabase(n); q.onsuccess=()=>{ clearTimeout(t); R.idb.push([n,'deleted']); ok(); }; q.onerror=q.onblocked=()=>{ }; }catch(e){ clearTimeout(t); ok(); } }))); }catch(e){}
    try{ if(window.caches){ for(const k of await caches.keys()){ await caches.delete(k); R.caches.push(k); } } }catch(e){}
    try{ if(navigator.serviceWorker){ for(const g of await navigator.serviceWorker.getRegistrations()){ await g.unregister(); R.sw++; } } }catch(e){}
    try{ XAS.chat.length=0; R.mem.push('agent chat'); }catch(e){} try{ XAS.log=[]; R.mem.push('agent action log'); }catch(e){} try{ if(XAS.gaps)XAS.gaps=[]; }catch(e){}
    try{ AI.hist=[]; XAM.hist=[]; XAG.log=[]; R.mem.push('model history'); }catch(e){}
    try{ S.map.clear(); S.rev.clear(); S.cnt={}; LOG.length=0; try{ localStorage.removeItem(LK); }catch(e){} R.mem.push('redaction map, outbound log'); }catch(e){}
    try{ if(typeof phWipe==='function'){ const w=await phWipe(); R.mem.push('Photos to 3D: '+w); } }catch(e){ R.mem.push('Photos to 3D wipe failed: '+e.message); }   /* photo job: files in memory, imported layers, local NodeODM container + job data (needs the bridge token, so before the keys are cleared) */
    try{ if(BR&&BR.url&&BR.token){ const r=await fetch(String(BR.url).replace(/\/$/,'')+'/inbox/clear?t='+encodeURIComponent(BR.token),{method:'POST',body:'{}'}); R.bridge=r.ok?'bridge inbox cleared':'bridge answered '+r.status+' (old bridge: delete ~/.tox/inbox.jsonl by hand)'; } else R.bridge='bridge not connected: delete ~/.tox/inbox.jsonl on the computer that runs tox_bridge.py (or restart it with TOX_INBOX_DAYS=0)'; }catch(e){ R.bridge='bridge not reachable: delete ~/.tox/inbox.jsonl by hand'; }
    if(o.keys){ try{ const ks=[]; for(let i=0;i<localStorage.length;i++)ks.push(localStorage.key(i)); ks.forEach(k=>{ if(SECRET.test(k)){ R.secrets.push(k); localStorage.removeItem(k); } }); const sk=[]; for(let i=0;i<sessionStorage.length;i++)sk.push(sessionStorage.key(i)); sk.forEach(k=>{ if(SECRET.test(k)){ R.secrets.push('session:'+k); sessionStorage.removeItem(k); } });
      try{ const a=JSON.parse(localStorage.getItem('xto-agent')||'null'); if(a&&a.key){ delete a.key; localStorage.setItem('xto-agent',JSON.stringify(a)); R.secrets.push('xto-agent.key'); } }catch(e){}
      try{ XAG.key=''; AI.key=''; if(AI.cheap)AI.cheap.key=''; AI.sttKey=''; BR.token=''; R.mem.push('keys in memory'); }catch(e){} }catch(e){} }
    R.kept=['templates','app settings (theme, layout, language, provider choices'+(o.keys?'':', API keys')+')'];
    return R; }
  function wipeText(R){ const L=[]; L.push(b2('Deleted from this browser:','اتمسح من المتصفح ده:'));
    L.push('• localStorage: '+(R.ls.length?R.ls.map(x=>x[0]+' ('+x[1]+' B)').join(', '):'—')); L.push('• sessionStorage: '+(R.ss.length?R.ss.map(x=>x[0]).join(', '):'—'));
    L.push('• IndexedDB: '+(R.idb.length?R.idb.map(x=>x[0]+' — '+x[1]).join(', '):'—')); L.push('• Cache API: '+(R.caches.length?R.caches.join(', '):'none stored')+(R.sw?'; '+R.sw+' service worker(s) removed':'')); L.push('• memory: '+(R.mem.join(', ')||'—'));
    L.push('• '+R.bridge); if(R.secrets.length)L.push('• keys: '+R.secrets.join(', ')); L.push(b2('Kept: ','فضل: ')+R.kept.join('; ')); L.push(b2('Not covered: files you saved to disk, other devices, the AI providers\' own logs, browser history.','مش مشمول: الملفات اللي نزّلتها على الجهاز، الأجهزة التانية، سجلات مزوّدي الذكاء الاصطناعي نفسهم، تاريخ المتصفح.')); return L.join('\n'); }

  /* ---------- dialogs ---------- */
  const modal=(id,w)=>{ const old=document.getElementById(id); if(old)old.remove(); const ov=el('div',{id,style:'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center'}), box=el('div',{style:'background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:16px;width:min('+(w||720)+'px,94vw);max-height:90vh;overflow:auto'}); ov.append(box); ov.onclick=e=>{ if(e.target===ov)ov.remove(); }; document.body.appendChild(ov); return {ov,box,close:()=>ov.remove()}; };
  function wipeDialog(){ const {box,close}=modal('privWipe',640); const word=lang==='ar'?'مسح':'WIPE';
    const pk=projectKeys(), tot=pk.reduce((a,k)=>a+bytes(k),0);
    const keys=el('input',{type:'checkbox',id:'privWipeKeys'}), inp=el('input',{id:'privWipeWord',placeholder:word,style:'width:140px'}), go=el('button',{id:'privWipeGo',class:'on',text:b2('Delete project data','امسح بيانات المشروع'),disabled:true});
    inp.oninput=()=>{ go.disabled=inp.value.trim()!==word; };
    go.onclick=async e=>{ if(!e.isTrusted||inp.value.trim()!==word)return; go.disabled=true; const R=await wipe({keys:keys.checked}); const txt=wipeText(R); box.innerHTML=''; box.append(el('b',{text:b2('Project data deleted','بيانات المشروع اتمسحت')}),el('pre',{id:'privWipeReport',style:'white-space:pre-wrap;font-size:12px',text:txt}),el('div',{class:'small',text:b2('Edits are not saved until you reload. Reload now to start clean.','التعديلات مش بتتحفظ لحد ما تعمل ريلود. اعمل ريلود دلوقتي تبدأ نضيف.')}),el('div',{class:'row'},el('button',{class:'on',id:'privReload',text:b2('Reload','ريلود'),onclick:()=>location.reload()}),el('button',{text:b2('Close','إغلاق'),onclick:close}))); };
    box.append(el('b',{text:b2('Close out project / wipe data','تسليم المشروع / مسح البيانات'),style:'font-size:16px'}),
      el('div',{class:'small',style:'margin:8px 0',text:b2('This deletes everything that belongs to this project from this browser: the project, drawings, documents, schedule, MOM, issues, journal, saved views, uploads, undo history and the agent chat. Templates and app settings stay. It cannot be undone. Only you can do this; the agents can only ask you.','ده بيمسح كل اللي يخص المشروع من المتصفح ده: المشروع والرسومات والمستندات والجدول والمحاضر والملاحظات وسجل التراجع ومحادثة الوكيل. القوالب وإعدادات التطبيق بتفضل. مفيش رجعة. إنت بس اللي تنفذه؛ الوكلاء ممكن يطلبوا منك بس.')}),
      el('div',{class:'small',text:b2('Will be deleted: ','هيتمسح: ')+pk.length+' '+b2('stored items','عناصر محفوظة')+' (~'+Math.round(tot/1024)+' KB), IndexedDB (undo history), sessionStorage, Cache API, '+b2('agent history, bridge inbox note','محادثة الوكيل وملاحظة صندوق البريد')+'.'}),
      el('div',{style:'margin:8px 0'},el('button',{id:'privExportFirst',text:b2('Export project package first','صدّر حزمة المشروع الأول'),onclick:()=>{ exportPackage(); }})),
      el('label',{class:'small',style:'display:flex;gap:6px;align-items:center;margin-bottom:8px'},keys,el('span',{text:b2('Also remove saved API keys and tokens','وامسح كمان مفاتيح الـAPI والتوكنات المحفوظة')})),
      el('div',{class:'row'},el('span',{class:'small',text:b2('Type '+word+' to confirm: ','اكتب '+word+' للتأكيد: ')}),inp,go,el('button',{id:'privWipeCancel',text:b2('Cancel','إلغاء'),onclick:close}))); }
  P.wipeDialog=wipeDialog;
  /* what the agent logged to disk (xto-aglog) never keeps a pasted key / e-mail / phone */
  { const _xl=xaLog; xaLog=function(k,m,w){ return _xl.call(this,k,scrubText(m),w); }; }

  function panel(){ const {box,close}=modal('privPanel',860); const chk=(k,en,ar,extra)=>{ const i=el('input',{type:'checkbox',id:'priv_'+k}); i.checked=!!cfg[k]; i.onchange=()=>{ cfg[k]=i.checked; if(k==='sensitive'&&i.checked){ cfg.preview=true; } save(); badge(); panel(); }; return el('label',{style:'display:flex;gap:6px;align-items:flex-start;margin:6px 0'},i,el('span',{},el('b',{text:b2(en,ar)}),extra?el('div',{class:'small',text:extra}):null)); };
    box.append(el('b',{text:b2('Privacy and project data','الخصوصية وبيانات المشروع'),style:'font-size:16px'}));
    box.append(chk('sensitive','Sensitive project','مشروع حساس',b2('ON: only local models (Ollama, LM Studio, WebLLM) and local Whisper work freely. Any other AI provider, n8n, Telegram, map lookups and share links are blocked unless you allow a provider below, and then only redacted text is sent.','شغّال: بس النماذج المحلية (Ollama وLM Studio وWebLLM) وWhisper المحلي بيشتغلوا عادي. أي مزوّد ذكاء تاني وn8n وتيليجرام وبحث الخرائط وروابط المشاركة بتتقفل إلا لو سمحت لمزوّد تحت، ووقتها بيتبعت نص متنقّح بس.')));
    box.append(chk('basic','Always strip keys, e-mails and phone numbers from AI requests','دايماً شيل المفاتيح والإيميلات والتليفونات من طلبات الذكاء الاصطناعي'),chk('preview','Show exactly what will be sent and ask first','وريني بالظبط اللي هيتبعت واسألني الأول'),chk('minimal','Minimum context: the model gets your message and only the data of the tool it calls','أقل سياق: النموذج بياخد رسالتك وبيانات الأداة اللي بينادي عليها بس'),chk('geo','Allow map / elevation / weather lookups in Sensitive mode (they send coordinates or place names)','اسمح ببحث الخرائط والمناسيب والطقس في الوضع الحساس (بتبعت إحداثيات أو أسماء أماكن)'));
    const hist=el('input',{type:'number',min:1,max:40,value:cfg.hist,id:'priv_hist',style:'width:70px'}); hist.onchange=()=>{ cfg.hist=Math.max(1,Math.min(40,+hist.value||12)); save(); };
    box.append(el('div',{class:'small',style:'margin:6px 0'},b2('Chat messages resent per request (6 max in Sensitive mode): ','عدد رسايل المحادثة المعادة في كل طلب (٦ كحد أقصى في الوضع الحساس): '),hist));
    const ta=el('textarea',{id:'priv_terms',rows:2,style:'width:100%',placeholder:b2('Extra words to hide (one per line): client, site, people, file names','كلمات إضافية للإخفاء (واحدة في السطر): العميل، الموقع، الأشخاص، أسماء الملفات')}); ta.value=cfg.terms||''; ta.onchange=()=>{ cfg.terms=ta.value; save(); };
    box.append(ta);
    const hosts=[...new Set(LOG.filter(x=>x.cls==='ai'||x.cls==='bridge').map(x=>x.host).concat(Object.keys(cfg.prov)))];
    if(hosts.length){ const t=el('div',{style:'margin:8px 0'},el('b',{class:'small',text:b2('AI destinations (Sensitive mode)','وجهات الذكاء الاصطناعي (الوضع الحساس)')})); hosts.forEach(h=>{ const s=el('select',{'data-host':h},...[['block',b2('Block','منع')],['redact',b2('Allow, redacted text only','سماح، نص متنقّح بس')]].map(o=>el('option',{value:o[0],text:o[1]}))); s.value=cfg.prov[h]||(h==='bridge'?'redact':'block'); s.onchange=()=>{ cfg.prov[h]=s.value; save(); }; t.append(el('div',{class:'small',style:'display:flex;gap:8px;align-items:center;margin:3px 0'},el('code',{text:h}),s)); }); box.append(t); }
    const tin=el('textarea',{id:'privTestIn',rows:2,style:'width:100%',placeholder:b2('Type a sentence to see how it would be redacted','اكتب جملة تشوف هتتنقّح إزاي')}), tout=el('pre',{id:'privTestOut',style:'white-space:pre-wrap;font-size:12px;margin:4px 0'});
    tin.oninput=()=>{ N_=0; tout.textContent=redactStr(tin.value,true); };
    box.append(tin,tout);
    const lg=el('table',{id:'privLog',class:'small',style:'width:100%;border-collapse:collapse'}); lg.append(el('tr',{},...['time','to','type','sent','replaced','result'].map(x=>el('th',{text:x,style:'text-align:start'})))); LOG.slice(0,25).forEach(x=>lg.append(el('tr',{},el('td',{text:x.t.slice(11,19)}),el('td',{text:x.host+x.path}),el('td',{text:x.cls}),el('td',{text:x.bytes+' B'}),el('td',{text:String(x.red)}),el('td',{text:x.blocked?(x.mode==='cancelled'?'cancelled':'blocked'):'sent'}))));
    box.append(el('b',{class:'small',text:b2('Outbound log (no keys, no message text)','سجل الصادر (من غير مفاتيح ولا نص الرسايل)')}),lg);
    box.append(el('div',{class:'row',style:'margin-top:10px'},el('button',{id:'privBtnExport',text:b2('Export project package','صدّر حزمة المشروع'),onclick:()=>{ exportPackage(); }}),el('button',{id:'privBtnWipe',text:b2('Close out project / wipe data…','تسليم المشروع / مسح البيانات…'),onclick:()=>{ close(); wipeDialog(); }}),el('button',{text:b2('Close','إغلاق'),onclick:close}))); }
  P.panel=panel;
  function badge(){ let b=document.getElementById('privBadge'); if(!cfg.sensitive){ if(b)b.remove(); return; } if(!b){ b=el('button',{id:'privBadge',style:'position:fixed;inset-inline-start:8px;bottom:8px;z-index:9000;padding:3px 9px;font-size:11px;opacity:.85',onclick:()=>panel()}); document.body.appendChild(b); } b.textContent='🔒 '+b2('Sensitive project','مشروع حساس'); }

  /* ---------- commands: the model may run them, but the wipe only opens the confirmation (needs a real click + typed word) ---------- */
  XCMD('wipe_project','trash','Close out project / wipe data','تسليم المشروع / مسح البيانات',wipeDialog);
  XCMD('privacy_panel','lock','Privacy and project data','الخصوصية وبيانات المشروع',panel);
  XCMD('export_package','export','Export project package (data, no keys)','تصدير حزمة بيانات المشروع (من غير مفاتيح)',()=>{ exportPackage(); });
  if(typeof XDESC!=='undefined'){ XDESC.wipe_project=['Opens the confirmation window to delete this project\'s data after hand-over. Never wipes by itself: the owner must type the confirm word.','يفتح نافذة التأكيد لمسح بيانات المشروع بعد التسليم. مبيمسحش لوحده: المالك لازم يكتب كلمة التأكيد.']; XDESC.privacy_panel=['Sensitive-project switch, what the AI may receive, outbound log','مفتاح المشروع الحساس، اللي يوصل للذكاء الاصطناعي، وسجل الصادر']; XDESC.export_package=['Download the project data as JSON (no API keys) before a wipe','نزّل بيانات المشروع JSON (من غير مفاتيح) قبل المسح']; }
  /* agents and words: "wipe / close out / hand over" only ever opens the question */
  { const _p=xaPre; xaPre=function(t){ const s=norm(t); if(/(امسح|احذف|اشطب|نضف|فضي|سلم|تسليم|انهي).{0,20}(بيانات|المشروع|مشروع)|wipe|close ?out|hand ?over|delete (all |the )?(project|data)/.test(s)){ say2(b2('Wiping deletes this project\'s data from the browser and cannot be undone. I never do it myself. I opened the confirmation window: export the package first if you need a copy, then type the word to confirm.','المسح بيمسح بيانات المشروع من المتصفح ومفيش رجعة. أنا مبعملوش لوحدي. فتحتلك نافذة التأكيد: صدّر الحزمة الأول لو عايز نسخة، وبعدين اكتب الكلمة للتأكيد.'),'a'); wipeDialog(); return true; } return _p.apply(this,arguments); }; }
  /* writes to project keys are refused while locked (after a wipe, until reload); the undo store too */
  { const si=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(S.locked&&this===localStorage&&!KEEP.test(k)&&!SECRET.test(k))return; return si.call(this,k,v); }; }
  { const _ip=idbPut; idbPut=async function(){ if(S.locked)return; return _ip.apply(this,arguments); }; }

  Object.assign(P,{cfg,log:()=>LOG.slice(),clearLog:()=>{ LOG.length=0; try{ localStorage.removeItem(LK); }catch(e){} },save,classify,decide,redactText,redactStr:(t,f)=>{ N_=0; return redactStr(t,f); },unmask,scrubText,terms:termsList,projectKeys,isKeepKey:k=>KEEP.test(k)||SECRET.test(k),packageText,exportPackage,wipe,wipeText,badge,S});
  setTimeout(badge,0);
  return P;
})();
window.PRIV=PRIV;
