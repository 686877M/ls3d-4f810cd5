/* ====== c_projects.js: (1) start screen with project cards (continue, the site project, blank, templates); a blank or other project hides the master site.
   (2) "Hide project data": real names of the site (building masses, drawing layers) are blurred on screen, and print / file export ask first: with the data or hidden.
   Load after c_templates.js, c_site3d.js, c_ptree.js, c_ui.js (out). Globals: PJ, pjStart, pjApply, pjNames. Honest limit: blur is a screen cover, not protection; the data is in the page. ====== */
const PJ={mask:true,re:null,t:0};
try{ const v=localStorage.getItem('xto-pjmask'); if(v!==null)PJ.mask=v==='1'; }catch(e){}
const pjBot=()=>!!navigator.webdriver&&!window.__pjForce;   /* automated test browsers: no start screen and no export question unless a test asks */
const pjSt=()=>typeof tpStation!=='function'||tpStation();
const pjOn=()=>PJ.mask&&pjSt();
function pjNames(){ const s=new Set(); try{ (MSITE.masses||[]).forEach(m=>{ s.add(m[0]); s.add(m[1]); }); Object.keys(MSITE.lay||{}).forEach(k=>MSITE.lay[k].forEach(r=>s.add(String(r[0])))); }catch(e){}
 return [...s].filter(n=>n&&n.length>=4).sort((a,b)=>b.length-a.length); }
function pjRe(){ if(PJ.re===null){ const N=pjNames(); PJ.re=N.length?new RegExp(N.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g'):false; } if(PJ.re)PJ.re.lastIndex=0; return PJ.re; }
const pjRoots=()=>[typeof pSite!=='undefined'?pSite:null,typeof spLab!=='undefined'?spLab:null,typeof spTip!=='undefined'?spTip:null,typeof ptList!=='undefined'&&ptList?ptList.parentElement:null].filter(Boolean);
function pjTag(){ const re=pjRe(); if(!re)return; pjRoots().forEach(r=>{ const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT); let t; while((t=w.nextNode())){ const p=t.parentElement; if(!p||p.classList.contains('pjm')||p.closest('#pjDlg'))continue; re.lastIndex=0; if(re.test(t.nodeValue||''))p.classList.add('pjm'); } }); }
function pjApply(){ document.body.classList.toggle('pj-mask',pjOn()); if(pjOn())pjTag(); }
document.head.appendChild(el('style',{text:'.pj-mask .pjm{filter:blur(4px);user-select:none}'}));
{ const mo=new MutationObserver(()=>{ if(PJ.t||!pjOn())return; PJ.t=setTimeout(()=>{ PJ.t=0; pjTag(); },300); }); pjRoots().forEach(r=>mo.observe(r,{childList:true,subtree:true,characterData:true})); }

/* ---------- ask before print / export while the data is hidden ---------- */
function pjAsk(kind,blob,done){ const old=document.getElementById('pjDlg'); if(old)old.remove();
 const ov=el('div',{id:'pjDlg',style:'position:fixed;inset:0;z-index:2147483645;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center'}), close=()=>ov.remove();
 const box=el('div',{style:'background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:16px;width:min(460px,92vw)'});
 const go=w=>{ close(); done(w); };
 box.append(el('b',{text:kind==='print'?b2('Print with the project data?','تطبع ببيانات المشروع؟'):b2('Export with the project data?','تصدّر ببيانات المشروع؟')}),
  el('div',{class:'small',style:'margin:8px 0 12px',text:blob?b2('This file type cannot be cleaned: names inside it stay as they are.','نوع الملف ده ما ينفعش يتنضف: الأسماء اللي جواه هتفضل زي ما هي.'):b2('Hidden: building and layer names are replaced (print: blurred). With data: everything as drawn.','مخفي: أسماء المباني والطبقات بتتبدل (في الطباعة: متغبشة). بالبيانات: كل حاجة زي اللوحة.')}),
  el('div',{class:'row'},el('button',{class:'on','data-pj':'with',text:b2('With data','بالبيانات'),onclick:()=>go(true)}),blob?null:el('button',{'data-pj':'hidden',text:b2('Hidden','مخفي'),onclick:()=>go(false)}),el('button',{'data-pj':'cancel',text:b2('Cancel','إلغاء'),onclick:close})));
 ov.append(box); ov.onclick=e=>{ if(e.target===ov)close(); }; document.body.appendChild(ov); }
let pjPrint=window.print.bind(window);   /* let: a test may stub it */
window.print=function(){ if(!pjOn()||pjBot())return pjPrint(); pjAsk('print',false,w=>{ if(w)document.body.classList.remove('pj-mask'); try{ pjPrint(); }finally{ if(w)setTimeout(pjApply,300); } }); };
function pjClean(txt){ const re=pjRe(), m=new Map(); return txt.replace(re,s=>{ if(!m.has(s))m.set(s,'HIDDEN-'+(m.size+1)); return m.get(s); }); }
const pjOut=out; out=function(fn,data){ if(!pjOn()||pjBot()||!pjRe())return pjOut(fn,data); const txt=typeof data==='string'?data:null;
 if(txt!==null&&!pjRe().test(txt))return pjOut(fn,data);
 pjAsk('file',txt===null,w=>pjOut(fn,w||txt===null?data:pjClean(txt))); };

/* ---------- projects: start screen ---------- */
function pjSite(){ const st=pjSt(); try{ SP.master=st; spShow(st); if(st)spPreset('site'); else spZoom(false); }catch(e){} pjApply(); }
const pjTN=tpNew; tpNew=function(){ const r=pjTN.apply(this,arguments); pjSite(); return r; };
function pjStart(){ const old=document.getElementById('pjStart'); if(old)old.remove(); const L=lang==='ar'?1:0;
 const ov=el('div',{id:'pjStart',style:'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center'}), close=()=>ov.remove();
 const box=el('div',{style:'background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:16px;width:min(720px,94vw);max-height:88vh;overflow:auto'});
 const card=(key,t,d,f,on)=>el('button',{'data-pj':key,class:on?'on':'',style:'text-align:start;padding:12px;display:block;white-space:normal',onclick:()=>{ close(); try{ f(); }catch(e){ xSt(String(e.message||e)); } }},el('b',{text:t}),el('div',{class:'small',text:d}));
 const grid=el('div',{style:'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:12px 0'});
 grid.append(card('continue',b2('Continue: ','كمّل: ')+(DR.title||''),b2('Open the project you were working on.','افتح المشروع اللي كنت شغال عليه.'),()=>pjSite(),1));
 Object.keys(TEMPLATES).forEach(id=>{ const t=TEMPLATES[id]; grid.append(card(id,t.n[L],t.d[L],()=>tpNew(id))); });
 const sk=el('input',{type:'checkbox'}); try{ sk.checked=localStorage.getItem('xto-pjstart')!=='0'; }catch(e){ sk.checked=true; }
 sk.onchange=()=>{ try{ localStorage.setItem('xto-pjstart',sk.checked?'1':'0'); }catch(e){} };
 box.append(el('b',{text:b2('Projects','المشاريع'),style:'font-size:16px'}),el('div',{class:'small',text:b2('Pick a project. A new one keeps the current project in the undo history.','اختار مشروع. المشروع الجديد بيحفظ الحالي في سجل التراجع.')}),grid,
  el('label',{class:'small',style:'display:flex;gap:6px;align-items:center'},sk,el('span',{text:b2('Show this screen when the app opens','اعرض الشاشة دي لما البرنامج يفتح')})));
 ov.append(box); ov.onclick=e=>{ if(e.target===ov)close(); }; document.body.appendChild(ov); }
XCMD('projects','new','Projects','المشاريع',pjStart);
XCMD('pj_mask','eye','Hide project data','إخفاء بيانات المشروع',function(on){ PJ.mask=typeof on==='boolean'?on:!PJ.mask; try{ localStorage.setItem('xto-pjmask',PJ.mask?'1':'0'); }catch(e){} pjApply(); const c=document.getElementById('pjMaskCk'); if(c)c.checked=PJ.mask; return PJ.mask; });
try{ XDESC.projects=['Project cards: continue, the site project, a blank project or a template','كروت المشاريع: كمّل، مشروع الموقع، مشروع فاضي أو قالب']; XDESC.pj_mask=['Blur the real building and layer names; print and export ask first','غبّش أسماء المباني والطبقات الحقيقية؛ والطباعة والتصدير يسألوا الأول']; }catch(e){}
TOXAPI.projects=pjStart; TOXAPI.hideData=on=>XC.pj_mask.run(on);
if(typeof pSite!=='undefined'&&pSite)pSite.insertBefore(el('label',{style:'display:block;margin:6px 0'},el('input',{type:'checkbox',id:'pjMaskCk',checked:PJ.mask?'':null,onchange:e=>XC.pj_mask.run(e.target.checked)}),' '+b2('Hide project data (names blurred; print and export ask first)','إخفاء بيانات المشروع (الأسماء متغبشة؛ الطباعة والتصدير يسألوا الأول)')),pSite.children[1]||null);
setTimeout(()=>{ pjApply(); try{ if(pjBot()||(typeof HASHCAM!=='undefined'&&HASHCAM)||localStorage.getItem('xto-pjstart')==='0'||sessionStorage.getItem('xto-pjshown'))return; sessionStorage.setItem('xto-pjshown','1'); }catch(e){} pjStart(); },1200);
/* self-check: cleaning replaces every known name and keeps other text */
(function(){ const N=pjNames(); if(!N.length)return; const s='x '+N[0]+' y '+N[0]; const c=pjClean(s); console.assert(c==='x HIDDEN-1 y HIDDEN-1','pjClean self-check failed'); })();
