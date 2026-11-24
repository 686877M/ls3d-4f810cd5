/* ====== demo_voice.js - PRE-RECORDED Arabic narration for the guided demo (lazy: evaluated with the demo engine on the first click; nothing is fetched until the user switches Voice ON).
   Audio files are made at BUILD time by tools/make_voice.py and served as static files next to index.html: media/voice/manifest.js + media/voice/ar/<hash>.<f|m>.mp3.
   Same-origin only; no text leaves the page. Without recordings (or in English) the demo silently stays captions-only.
   The browser's own speechSynthesis is used only if the user ticks "Browser voice" (off by default).
   Wraps DEMO.ops.say / DEMO.ops.cap (looked up by the engine at run time) and watches DEMO.D (paused / speed / abort / ff) - demo_core.js is not edited. ====== */
(function(){
 const S=DEMO, D=S.D, h=S.h, B=S.B;
 const V={on:false,g:'f',vol:1,mute:false,rate:1,browser:false,man:null,manP:null,aud:null,fin:null,warm:new Map(),st:'',ui:null,n:0,played:0,fail:0};
 const base=()=>{ let b=(typeof window!=='undefined'&&window.TOX_VOICE_BASE)||'media/voice/'; return /\/$/.test(b)?b:b+'/'; };
 /* cyrb53 of the NFC Arabic caption (identical to tools/make_voice.py caption_hash) */
 function key(s){ s=String(s||'').normalize('NFC').trim(); let h1=0xdeadbeef,h2=0x41c6ce57; for(let i=0,c;i<s.length;i++){ c=s.charCodeAt(i); h1=Math.imul(h1^c,2654435761); h2=Math.imul(h2^c,1597334677); } h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909); h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909); return (4294967296*(2097151&h2)+(h1>>>0)).toString(16); }
 const isAr=()=>S.L()===1;
 const rateNow=()=>Math.max(.9,Math.min(1.5,D.sp>1?1.5:V.rate));          /* 2x / 4x demo speed: narration at its fastest still-clear rate, the step waits for it */
 /* ---------- manifest (a <script>, so it also works from file://) ---------- */
 function loadMan(){ if(V.manP)return V.manP; V.manP=new Promise(res=>{ if(window.TOXVoiceManifest){ V.man=window.TOXVoiceManifest; return res(V.man); } const s=document.createElement('script'); s.src=base()+'manifest.js'; s.onload=()=>{ V.man=window.TOXVoiceManifest||null; res(V.man); }; s.onerror=()=>{ V.man=null; res(null); }; document.head.appendChild(s); }); return V.manP; }
 function item(st){ const m=V.man; if(!m||!m.items||!isAr())return null; const e=m.items[key(typeof st.ar==='function'?st.ar():st.ar)]; const v=e&&e.v&&(e.v[V.g]||e.v.f||e.v.m); return v?{url:base()+v.file+'?v='+(v.sig||''),ms:v.ms}:null; }
 /* ---------- fetch + Cache API (http/https only; file:// plays straight from the file) ---------- */
 const cacheable=()=>/^https?:$/.test(location.protocol)&&typeof caches!=='undefined';
 function prep(it){ if(V.warm.has(it.url))return V.warm.get(it.url); const p=(async()=>{ if(!cacheable()){ const a=new Audio(); a.preload='auto'; a.src=it.url; return it.url; }
   const c=await caches.open('tox-voice-v1'); let r=await c.match(it.url); if(!r){ r=await fetch(it.url); if(!r.ok)throw new Error('http '+r.status); await c.put(it.url,r.clone()); } return URL.createObjectURL(await r.blob()); })(); V.warm.set(it.url,p); p.catch(()=>V.warm.delete(it.url)); return p; }
 function ahead(st,n){ const out=[]; let ci=D.cur, i=((D.chapters[ci]||{}).steps||[]).indexOf(st)+1; while(out.length<n&&D.chapters[ci]){ const ss=D.chapters[ci].steps||[]; for(;i<ss.length&&out.length<n;i++){ if((ss[i].op==='say'||ss[i].op==='cap')&&ss[i].ar)out.push(ss[i]); } ci++; i=0; } return out; }
 function warm(st){ ahead(st,2).forEach(x=>{ const it=item(x); if(it)prep(it).catch(()=>{}); }); }
 /* ---------- playback ---------- */
 function el(){ if(!V.aud){ V.aud=new Audio(); V.aud.preload='auto'; } return V.aud; }
 function halt(ok){ const a=V.aud; if(a){ try{ a.pause(); }catch(e){} } if(V.fin)V.fin(ok); }
 function play(st){ const it=item(st); if(!it)return Promise.resolve(false); halt(true);
  return prep(it).then(url=>new Promise(res=>{ const a=el(); let done=0,last=-1,lt=Date.now();
   const fin=ok=>{ if(done)return; done=1; clearInterval(w); a.onended=a.onerror=null; if(V.fin===fin)V.fin=null; if(ok===false)V.fail++; res(ok); }; V.fin=fin;
   const w=setInterval(()=>{ if(!D.on||D.abort||D.ff||D.sum){ try{ a.pause(); }catch(e){} return fin(true); }                        /* stop / skip / jump / fast-forward / finished */
     if(D.paused){ if(!a.paused)a.pause(); lt=Date.now(); return; }
     a.volume=V.vol; a.muted=V.mute; const r=rateNow(); if(a.playbackRate!==r)a.playbackRate=r;
     if(a.paused&&!a.ended)a.play().catch(()=>{});
     if(a.currentTime!==last){ last=a.currentTime; lt=Date.now(); } else if(Date.now()-lt>6000)fin(false);                  /* no progress (autoplay blocked, decode error): captions only */
   },120);
   a.onended=()=>fin(true); a.onerror=()=>fin(false);
   a.src=url; a.volume=V.vol; a.muted=V.mute; a.defaultPlaybackRate=rateNow(); a.playbackRate=rateNow(); V.n++; const p=a.play(); if(p&&p.catch)p.catch(()=>{ if(!D.paused)fin(false); });
  })).catch(()=>false); }
 /* ---------- wrapped ops ---------- */
 const oSay=S.ops.say, oCap=S.ops.cap;
 S.ops.say=async function(st){
  if(V.on&&!D.ff){ if(!V.man)await loadMan(); S.setCap(st.en,st.ar); warm(st); const ok=await play(st); S.chk(); if(ok){ V.played++; await S.sleep(300); ui(); return; } }
  D.voice=!!(V.on&&V.browser); return oSay(st); };                                       /* no recording / voice off: captions timing (speechSynthesis only when "Browser voice" is ticked) */
 S.ops.cap=async function(st){ await oCap(st); if(V.on&&!D.ff&&V.man&&item(st)){ warm(st); play(st); } };   /* informational caption: played alongside, never blocks */
 /* ---------- UI (own row after the caption; the engine's own rows are untouched) ---------- */
 const T=(en,ar)=>B(en,ar);
 function setOn(f){ V.on=f===undefined?!V.on:!!f; if(!V.on)halt(true); else{ V.st=T('loading…','بيحمّل…'); loadMan().then(m=>{ V.st=m?(isAr()?'':T('Arabic only: captions','عربي بس: الشرح مكتوب')):T('Recordings not installed: captions only','التسجيلات مش موجودة: شرح مكتوب'); ui(); }); } ui(); }
 function ui(){ const u=D.ui; if(!u||!u.root.isConnected)return; if(u.bVoice&&u.bVoice.style.display!=='none')u.bVoice.style.display='none'; let r=u.root.querySelector('.xdv'); if(!r){ r=h('div',{class:'row xdv',style:'margin:4px 0'}); u.cap2.after(r); V.ui=r; r.dataset.lang=''; }
  if(r.dataset.lang!==S.L()+'|'+V.on){ r.dataset.lang=S.L()+'|'+V.on; r.innerHTML='';
   const b=(t,f,c)=>{ const x=h('button',{text:t,onclick:f}); if(c)x.className=c; return x; };
   r.append(b('🔊 '+T('Voice: ','الصوت: ')+(V.on?T('ON','شغال'):T('OFF','مقفول')),()=>setOn(),V.on?'on':''));
   if(V.on){ const g=h('select',{title:T('Voice','الصوت')},h('option',{value:'f',text:T('Female','أنثى')}),h('option',{value:'m',text:T('Male','ذكر')})); g.value=V.g; g.onchange=()=>{ V.g=g.value; halt(true); };
    const vol=h('input',{type:'range',min:0,max:1,step:.05,title:T('Volume','مستوى الصوت'),style:'width:80px'}); vol.value=V.mute?0:V.vol; vol.oninput=()=>{ V.vol=+vol.value; V.mute=V.vol===0; };
    const mu=b(V.mute?'🔇':'🔈',()=>{ V.mute=!V.mute; mu.textContent=V.mute?'🔇':'🔈'; if(!V.mute&&V.vol===0){ V.vol=1; vol.value=1; } });
    const rt=h('select',{title:T('Voice speed','سرعة الصوت')}); [.9,1,1.15,1.3,1.5].forEach(x=>rt.append(h('option',{value:x,text:x+'×'}))); rt.value=V.rate; rt.onchange=()=>{ V.rate=+rt.value; };
    const bv=h('label',{style:'font-size:11px;opacity:.8;display:flex;gap:3px;align-items:center',title:T('Use the browser’s built-in (robotic) voice when there is no recording','يستخدم صوت المتصفح (آلي) لو مفيش تسجيل')},h('input',{type:'checkbox'}),T('Browser voice','صوت المتصفح')); bv.firstChild.checked=V.browser; bv.firstChild.onchange=e=>{ V.browser=e.target.checked; };
    r.append(g,mu,vol,rt,bv); }
   r.append(h('span',{class:'xdvs',style:'font-size:11px;opacity:.7',text:V.st}));
  } const s=r.querySelector('.xdvs'); if(s&&s.textContent!==V.st)s.textContent=V.st; }
 setInterval(()=>{ try{ if(D.ui)ui(); }catch(e){} },500);                                  /* panel is (re)built by the engine at start / end; keep our row present */
 S.vox={state:()=>({on:V.on,gender:V.g,vol:V.vol,mute:V.mute,rate:V.rate,browser:V.browser,loaded:!!V.man,played:V.played,failed:V.fail,starts:V.n,status:V.st}),on:setOn,key,item,audio:()=>V.aud,set:o=>{ Object.assign(V,o); ui(); }};
})();
