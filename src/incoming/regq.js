/* ====== regq (prefix rq): query layer over DC.docs (field:value filters, sort, group-by, saved views, CSV / Excel export) and a Follow-up dashboard tab (overdue by type and party, ageing, ball in court, 8-week trend, oldest open items, weekly digest). Reads DC.docs only; no data is shipped, nothing is stored except saved views (localStorage key xto-rqv). Load after c_dc.js and c_cde.js. ====== */
const RQ={q:'',sort:'date',asc:false,grp:'',views:[],page:200,ms:0,tm:0};
try{ const v=JSON.parse(localStorage.getItem('xto-rqv')||'[]'); if(Array.isArray(v))RQ.views=v.filter(x=>x&&typeof x.n==='string'&&typeof x.q==='string'); }catch(e){}
const RQCLOSED=new Set(['closed','appr','apn']), RQROLE={owner:['Owner','المالك'],contractor:['Contractor','المقاول'],consultant:['Consultant','الاستشاري']};
const RQCOLS=[['ref','Ref','المرجع'],['date','Date','التاريخ'],['type','Type','النوع'],['party','Party','الطرف'],['subject','Subject','الموضوع'],['status','Status','الحالة'],['due','Due','الاستحقاق'],['age','Age','العمر']];
const RQGRP=[['','No grouping','بدون تجميع'],['type','Type','النوع'],['status','Status','الحالة'],['party','Party','الطرف'],['folder','Folder','الفولدر'],['disc','Discipline','التخصص']];
const rqDn=s=>s?Math.floor(Date.parse(String(s).slice(0,10)+'T00:00:00Z')/864e5):NaN;
const rqParty=d=>(d.dir==='out'?d.to:d.from)||'';
const rqCmpS=(a,b)=>a<b?-1:a>b?1:0;
const rqCsvCell=v=>{ let s=String(v==null?'':v); if(/^[=+\-@\t\r]/.test(s))s="'"+s; return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
const rqDlg=ar=>ar?1:0;
/* ---------- query language ---------- */
const RQF=['type','status','dir','party','from','to','disc','discipline','folder','ref','subject','prio','due','date','age','role','overdue','open'];
function rqParse(q){ const toks=[]; let cur='', inq=false; for(const ch of String(q)){ if(ch==='"'){ inq=!inq; cur+=ch; } else if(/\s/.test(ch)&&!inq){ if(cur)toks.push(cur); cur=''; } else cur+=ch; } if(cur)toks.push(cur);
 return toks.map(t=>{ let neg=false; if(t.length>1&&t[0]==='-'){ neg=true; t=t.slice(1); } const m=/^([a-z]+):(<=|>=|<|>|=)?(.*)$/i.exec(t), f=m&&m[1].toLowerCase(); const strip=v=>v.replace(/"/g,'').trim();
  if(m&&RQF.includes(f)&&strip(m[3])!=='')return {neg,f:f==='discipline'?'disc':f,op:m[2]||'',v:strip(m[3]).toLowerCase()};
  return {neg,f:'',op:'',v:strip(t).toLowerCase()}; }).filter(c=>c.v!==''); }
function rqTest(r,c){ const d=r.d; let ok;
 if(!c.f){ if(r.hay===undefined)r.hay=[d.ref,d.subject,d.from,d.to,d.body].join(' ').toLowerCase(); ok=r.hay.includes(c.v); }
 else if(c.f==='age'){ const n=+c.v; ok=r.age!=null&&(c.op==='<'?r.age<n:c.op==='>'?r.age>n:c.op==='<='?r.age<=n:c.op==='>='?r.age>=n:r.age===n); }
 else if(c.f==='due'||c.f==='date'){ const s=d[c.f]||''; ok=!!s&&(c.op==='<'?s<c.v:c.op==='>'?s>c.v:c.op==='<='?s.slice(0,c.v.length)<=c.v:c.op==='>='?s.slice(0,c.v.length)>=c.v:s.startsWith(c.v)); }
 else { const vs=c.v.split(','); ok=vs.some(v=>{ if(c.f==='type'){ const t=dcT(d.type); return d.type.toLowerCase()===v||(v.length>3&&(t[1].toLowerCase().includes(v)||t[2].includes(v))); }
   if(c.f==='status'){ const s=DCS.find(x=>x[0]===d.status)||[d.status,d.status,d.status]; return s[0]===v||(v.length>3&&(s[1].toLowerCase().includes(v)||s[2].includes(v))); }
   if(c.f==='overdue'||c.f==='open')return (c.f==='overdue'?r.od:r.isOpen)===(v==='yes'||v==='y'||v==='true'||v==='1');
   const x=String(c.f==='party'?r.party:c.f==='role'?r.role:c.f==='folder'?r.folder:d[c.f]||'').toLowerCase(); return (c.f==='dir'||c.f==='prio'||c.f==='role')?x===v:x.includes(v); }); }
 return c.neg?!ok:ok; }
function rqRows(today){ const tn=rqDn(today||dcToday()), td=today||dcToday(), cf=typeof cdeFolder==='function', bic=typeof CDEBIC!=='undefined'?CDEBIC:{}; return DC.docs.map(d=>{ const isOpen=!RQCLOSED.has(d.status)&&d.status!=='draft', dn=rqDn(d.date); return {d,isOpen,od:isOpen&&!!d.due&&d.due<td,age:isOpen&&dn===dn?Math.max(0,tn-dn):null,party:rqParty(d),role:isOpen&&bic[d.status]&&bic[d.status]!=='—'?bic[d.status]:'',folder:cf?cdeFolder(d):''}; }); }
const rqKey=(r,k)=>k==='age'?(r.age==null?-1:r.age):k==='party'?r.party.toLowerCase():k==='folder'?r.folder:String(r.d[k]==null?'':r.d[k]).toLowerCase();
function rqRun(q,sort,asc,grp,today){ const t0=performance.now(); const cs=rqParse(q==null?RQ.q:q); sort=sort||RQ.sort; asc=asc==null?RQ.asc:asc; grp=grp==null?RQ.grp:grp;
 let rows=rqRows(today); if(cs.length)rows=rows.filter(r=>cs.every(c=>rqTest(r,c)));
 const dir=asc?1:-1; rows.sort((a,b)=>dir*rqCmpS(rqKey(a,sort),rqKey(b,sort)));
 let groups=null; if(grp){ const gn=r=>grp==='type'?dcName(r.d.type):grp==='status'?dcSt(r.d.status):grp==='party'?(r.party||'—'):grp==='folder'?(r.folder||'—'):(r.d.disc||'—'); const m=new Map(); rows.forEach(r=>{ const k=gn(r); let g=m.get(k); if(!g){ g={k,rows:[]}; m.set(k,g); } g.rows.push(r); }); groups=[...m.values()].sort((a,b)=>rqCmpS(a.k,b.k)); rows=[].concat(...groups.map(g=>g.rows)); }
 RQ.ms=performance.now()-t0; return {rows,groups,ms:RQ.ms,n:rows.length}; }
/* ---------- export ---------- */
function rqCsv(rows){ const H=['Ref','Type','Direction','Date','Due','From','To','Discipline','Subject','Status','Priority','Folder','Age (days)']; return '﻿'+[H].concat(rows.map(r=>{ const d=r.d; return [d.ref,d.type,d.dir==='out'?'Outgoing':'Incoming',d.date,d.due,d.from,d.to,d.disc,d.subject,d.status,d.prio,r.folder,r.age==null?'':r.age]; })).map(a=>a.map(rqCsvCell).join(',')).join('\r\n'); }
function rqXlsx(rows){ const keep=DC.docs; DC.docs=rows.map(r=>r.d); try{ return dcRegXlsx(); } finally{ DC.docs=keep; } }
/* ---------- query tab ---------- */
function rqSaveViews(){ try{ localStorage.setItem('xto-rqv',JSON.stringify(RQ.views)); }catch(e){} }
function rqQuery(b){ const L=dcL(), lab=a=>a[1+L]; const meta=el('span',{class:'small'}), wrap=el('div',{style:'overflow:auto;max-height:56vh;margin-top:6px'}); let tid=0;
 const draw=()=>{ const t0=performance.now(), R=rqRun(); wrap.innerHTML=''; const tb=el('table',{style:'width:100%;border-collapse:collapse;font-size:12.5px'}), hr=el('tr',{style:'text-align:start;opacity:.85'});
  RQCOLS.forEach(c=>hr.appendChild(el('th',{style:'text-align:start;padding:4px;cursor:pointer;white-space:nowrap',text:lab(c)+(RQ.sort===c[0]?(RQ.asc?' ▲':' ▼'):''),onclick:()=>{ if(RQ.sort===c[0])RQ.asc=!RQ.asc; else{ RQ.sort=c[0]; RQ.asc=c[0]!=='date'&&c[0]!=='age'; } RQ.page=200; draw(); }}))); tb.appendChild(hr);
  const fr=document.createDocumentFragment(); let shown=0, last=null; const gmap=new Map(); if(R.groups)R.groups.forEach(g=>gmap.set(g.rows[0],g));
  for(const r of R.rows){ if(shown>=RQ.page)break; const g=gmap.get(r); if(g)fr.appendChild(el('tr',{style:'background:var(--panel2)'},el('td',{colspan:8,style:'padding:5px 4px;font-weight:600',text:g.k+'  ·  '+g.rows.length+(g.rows.some(x=>x.od)?'  ·  ⚠ '+g.rows.filter(x=>x.od).length+b2(' overdue',' متأخر'):'')})));
   const d=r.d; fr.appendChild(el('tr',{class:'cl',style:'border-top:1px solid var(--line);cursor:pointer',onclick:()=>{ DC.ui.sel=d.id; DC.ui.tab='reg'; dcPanel(); }},el('td',{text:d.ref}),el('td',{text:d.date||''}),el('td',{text:d.type}),el('td',{text:r.party}),el('td',{text:d.subject}),el('td',{html:'<span class="tag">'+dcEsc(dcSt(d.status))+'</span>'}),el('td',{class:r.od?'od':'',text:d.due||''}),el('td',{text:r.age==null?'':r.age}))); shown++; }
  tb.appendChild(fr); if(!R.n)tb.appendChild(el('tr',{},el('td',{colspan:8,text:b2('No match.','لا نتائج.')}))); wrap.appendChild(tb);
  if(R.n>shown)wrap.appendChild(el('button',{text:b2('Show more','عرض المزيد')+' ('+(R.n-shown)+')',onclick:()=>{ RQ.page+=500; draw(); }}));
  RQ.tm=performance.now()-t0; meta.textContent=R.n+' / '+DC.docs.length+' · '+RQ.tm.toFixed(0)+' ms'; };
 const qi=el('input',{id:'rqIn',placeholder:b2('type:RFI status:review due:<2026-12-01 party:acme text','type:RFI status:review due:<2026-12-01 party:acme نص'),style:'flex:1;min-width:260px',value:RQ.q,oninput:e=>{ RQ.q=e.target.value; RQ.page=200; clearTimeout(tid); tid=setTimeout(draw,150); }});
 const gs=el('select',{onchange:e=>{ RQ.grp=e.target.value; RQ.page=200; draw(); }},...RQGRP.map(g=>el('option',{value:g[0],text:lab(g),selected:RQ.grp===g[0]?'':null})));
 const vs=el('select',{onchange:e=>{ const v=RQ.views.find(x=>x.n===e.target.value); if(v){ RQ.q=v.q; RQ.sort=v.s||'date'; RQ.asc=!!v.a; RQ.grp=v.g||''; qi.value=RQ.q; gs.value=RQ.grp; RQ.page=200; draw(); } e.target.value=''; }},el('option',{value:'',text:b2('Saved views…','عروض محفوظة…')}),...RQ.views.map(v=>el('option',{value:v.n,text:v.n})));
 const rows=()=>rqRun().rows;
 b.append(el('div',{class:'small',text:b2('Fields: type status dir party from to disc folder ref subject prio due date age role overdue open. Use < > <= >= on due / date / age, commas for OR (type:RFI,SUB), - to exclude, "quotes" for spaces. Other words search ref, subject, parties, body.','الحقول: type status dir party from to disc folder ref subject prio due date age role overdue open. استخدم < > <= >= مع due/date/age، فاصلة لـ أو، - للاستبعاد، "علامات" للمسافات. باقي الكلمات بتبحث في المرجع والموضوع والأطراف والنص.')}),
  el('div',{class:'act',style:'display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:6px 0'},qi,gs,vs,
   el('button',{text:b2('Save view','احفظ العرض'),onclick:()=>{ const n=prompt(b2('View name','اسم العرض'),''); if(!n)return; RQ.views=RQ.views.filter(v=>v.n!==n).concat([{n,q:RQ.q,s:RQ.sort,a:RQ.asc,g:RQ.grp}]); rqSaveViews(); dcPanel(); }}),
   el('button',{text:b2('Delete view','احذف عرض'),onclick:()=>{ const n=prompt(b2('Name of the view to delete','اسم العرض للحذف'),''); if(!n)return; RQ.views=RQ.views.filter(v=>v.n!==n); rqSaveViews(); dcPanel(); }}),
   el('button',{text:'CSV',onclick:()=>out('Register_query_'+dcToday()+'.csv',new Blob([rqCsv(rows())],{type:'text/csv;charset=utf-8'}))}),
   el('button',{text:b2('Excel','إكسل'),onclick:()=>out('Register_query_'+dcToday()+'.xlsx',rqXlsx(rows()))}),meta),wrap); draw(); }
/* ---------- follow-up dashboard ---------- */
function rqCloseDn(d){ for(let i=(d.log||[]).length-1;i>=0;i--){ const e=d.log[i]; if(e&&/→ (closed|appr|apn)/.test(e[1]||''))return rqDn(e[0]); } return rqDn(d.date); }
function rqStats(today){ today=today||dcToday(); const tn=rqDn(today), S={today,tn,n:DC.docs.length,open:0,od:0,odT:{},odP:{},age:[0,0,0,0],bic:{},wk:[],old:[]}, openL=[];
 for(let i=0;i<8;i++){ const e=tn-7*(7-i); S.wk.push({e,o:0,c:0}); }
 for(const d of DC.docs){ const dn=rqDn(d.date), w=Math.floor((tn-dn)/7); if(w>=0&&w<8)S.wk[7-w].o++;
  if(RQCLOSED.has(d.status)){ const cw=Math.floor((tn-rqCloseDn(d))/7); if(cw>=0&&cw<8)S.wk[7-cw].c++; continue; } if(d.status==='draft')continue;
  S.open++; openL.push(d); if(dn===dn){ const a=Math.max(0,tn-dn); S.age[a<=7?0:a<=14?1:a<=30?2:3]++; }
  if(d.due&&d.due<today){ S.od++; S.odT[d.type]=(S.odT[d.type]||0)+1; const p=rqParty(d)||'—'; S.odP[p]=(S.odP[p]||0)+1; }
  const ro=typeof CDEBIC!=='undefined'?CDEBIC[d.status]:''; if(ro&&ro!=='—')S.bic[ro]=(S.bic[ro]||0)+1; }
 S.old=openL.filter(d=>d.date).sort((a,b)=>rqCmpS(a.date,b.date)).slice(0,10); return S; }
const rqTop=(o,n)=>Object.entries(o).sort((x,y)=>y[1]-x[1]||rqCmpS(x[0],y[0])).slice(0,n);
function rqDigest(S,ar){ const t=(e,a)=>ar?a:e, sep=ar?'، ':', ', top=o=>rqTop(o,6).map(x=>x[0]+' '+x[1]).join(sep)||'—', w=S.wk[7], pn=dcProjName();
 return [t('Weekly follow-up digest','ملخص المتابعة الأسبوعي')+' — '+S.today+(pn?' — '+pn:''),
  t('Open ','مفتوح ')+S.open+' · '+t('Overdue ','متأخر ')+S.od+' · '+t('New (7d) ','جديد (٧ أيام) ')+w.o+' · '+t('Closed (7d) ','أُغلق (٧ أيام) ')+w.c,
  t('Overdue by type: ','المتأخر حسب النوع: ')+top(S.odT), t('Overdue by party: ','المتأخر حسب الطرف: ')+top(S.odP),
  t('Ageing (days): ','العمر (أيام): ')+'0-7: '+S.age[0]+' | 8-14: '+S.age[1]+' | 15-30: '+S.age[2]+' | 30+: '+S.age[3],
  t('Ball in court: ','الكرة عند: ')+(Object.keys(S.bic).map(r=>(RQROLE[r]||[r,r])[rqDlg(ar)]+' '+S.bic[r]).join(sep)||'—'),
  t('Oldest open: ','الأقدم مفتوحًا: ')+(S.old.slice(0,3).map(d=>d.ref+' ('+(S.tn-rqDn(d.date))+t('d','ي')+') '+(d.subject||'').slice(0,40)).join(' ; ')||'—')].join('\n'); }
function rqNewsLine(S,ar){ const o=S.old[0]; return (ar?'المتابعة ':'Follow-up ')+S.today+': '+S.open+(ar?' مفتوح، ':' open, ')+S.od+(ar?' متأخر':' overdue')+(o?(ar?'؛ الأقدم ':'; oldest ')+(S.tn-rqDn(o.date))+(ar?' يوم':'d'):'')+(S.od?' — '+rqTop(S.odT,3).map(x=>x[0]+' '+x[1]).join(', '):''); }
function rqHBars(items,color){ if(!items.length)return '<div class="small">—</div>'; const mx=Math.max(1,...items.map(i=>i[1])); return '<svg viewBox="0 0 330 '+(items.length*18+4)+'" width="330" style="direction:ltr;max-width:100%" role="img">'+items.map((it,i)=>'<text x="0" y="'+(i*18+13)+'" font-size="11" style="fill:var(--fg)">'+dcEsc(String(it[0]).slice(0,16))+'</text><rect x="100" y="'+(i*18+3)+'" width="'+Math.max(2,it[1]/mx*180)+'" height="12" rx="2" style="fill:'+color+'"/><text x="'+(104+it[1]/mx*180)+'" y="'+(i*18+13)+'" font-size="11" style="fill:var(--muted)">'+it[1]+'</text>').join('')+'</svg>'; }
function rqCols(cats,cols){ const H=100, bw=12, step=Math.max(54,cols.length*bw+22), W=cats.length*step+8, mx=Math.max(1,...cats.map(c=>Math.max(...c.v))); return '<svg viewBox="0 0 '+W+' '+(H+34)+'" width="'+W+'" style="direction:ltr;max-width:100%" role="img">'+cats.map((c,i)=>{ const x0=4+i*step+(step-cols.length*bw)/2; return c.v.map((v,j)=>{ const h=v/mx*H, x=x0+j*bw; return '<rect x="'+x+'" y="'+(H-h+14)+'" width="'+(bw-1)+'" height="'+Math.max(h,v?1:0)+'" style="fill:'+cols[j]+'"/>'+(v?'<text x="'+(x+bw/2-.5)+'" y="'+(H-h+11)+'" font-size="9" text-anchor="middle" style="fill:var(--muted)">'+v+'</text>':''); }).join('')+'<text x="'+(4+i*step+step/2)+'" y="'+(H+28)+'" font-size="10" text-anchor="middle" style="fill:var(--fg)">'+dcEsc(c.l)+'</text>'; }).join('')+'</svg>'; }
function rqFollow(b){ const S=rqStats(), L=dcL(), card=(t,h)=>el('div',{style:'border:1px solid var(--line);border-radius:10px;padding:10px;min-width:0'},el('b',{text:t}),el('div',{html:h})), ro=r=>(RQROLE[r]||[r,r])[L];
 const kp=(n,l,c)=>el('span',{class:'kpi'+(c?' od':''),html:'<b>'+n+'</b>'+l});
 b.append(el('div',{},kp(S.n,b2('Documents','مستند')),kp(S.open,b2('Open','مفتوح')),kp(S.od,b2('Overdue','متأخر'),1),kp(S.wk[7].o,b2('New (7d)','جديد (٧ أيام)')),kp(S.wk[7].c,b2('Closed (7d)','أُغلق (٧ أيام)'))),
  el('div',{style:'display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:10px'},
   card(b2('Overdue by type','المتأخر حسب النوع'),rqHBars(rqTop(S.odT,8),'#d9534f')), card(b2('Overdue by party','المتأخر حسب الطرف'),rqHBars(rqTop(S.odP,8),'#d9534f')),
   card(b2('Ageing of open items (days)','عمر المفتوح (أيام)'),rqCols(['0-7','8-14','15-30','30+'].map((l,i)=>({l,v:[S.age[i]]})),['var(--xa)'])),
   card(b2('Ball in court','الكرة عند'),rqHBars(Object.keys(S.bic).map(r=>[ro(r),S.bic[r]]),'var(--xb)')),
   card(b2('Opened vs closed, last 8 weeks','المفتوح مقابل المغلق، آخر ٨ أسابيع'),rqCols(S.wk.map(w=>({l:new Date((w.e)*864e5).toISOString().slice(5,10),v:[w.o,w.c]})),['var(--xa)','#3a9d5d'])+'<div class="small"><span style="color:var(--xa)">■</span> '+b2('opened (doc date)','فُتح (تاريخ المستند)')+' &nbsp; <span style="color:#3a9d5d">■</span> '+b2('closed (date of closing log entry)','أُغلق (تاريخ سجل الإغلاق)')+'</div>')));
 const tb=el('table',{style:'width:100%;border-collapse:collapse;font-size:12.5px;margin-top:6px'},el('tr',{style:'text-align:start;opacity:.8'},...['Ref',b2('Subject','الموضوع'),b2('Party','الطرف'),b2('Age (d)','العمر'),b2('Due','الاستحقاق'),b2('Ball','الكرة')].map(h=>el('th',{style:'text-align:start;padding:4px',text:h}))));
 S.old.forEach(d=>tb.appendChild(el('tr',{class:'cl',style:'border-top:1px solid var(--line);cursor:pointer',onclick:()=>{ DC.ui.sel=d.id; DC.ui.tab='reg'; dcPanel(); }},el('td',{text:d.ref}),el('td',{text:d.subject}),el('td',{text:rqParty(d)}),el('td',{text:S.tn-rqDn(d.date)}),el('td',{class:d.due&&d.due<S.today?'od':'',text:d.due||''}),el('td',{text:ro(typeof CDEBIC!=='undefined'&&CDEBIC[d.status]||'')||''}))));
 b.append(el('h4',{text:b2('Top 10 oldest open items','أقدم ١٠ مستندات مفتوحة'),style:'margin:14px 0 2px'}),tb);
 const dg={en:rqDigest(S,0),ar:rqDigest(S,1)}, ta=(k)=>el('textarea',{readonly:'',rows:8,dir:k==='ar'?'rtl':'ltr',style:'width:100%;font-size:12px',value:dg[k]}); const tE=ta('en'), tA=ta('ar'); tE.value=dg.en; tA.value=dg.ar;
 const cp=t=>{ try{ navigator.clipboard.writeText(t).then(()=>xSt(b2('Copied.','اتنسخ.')),()=>{ throw 0; }); }catch(e){ const x=el('textarea',{style:'position:fixed;opacity:0'}); x.value=t; document.body.appendChild(x); x.select(); try{ document.execCommand('copy'); xSt(b2('Copied.','اتنسخ.')); }catch(z){} x.remove(); } };
 b.append(el('h4',{text:b2('Weekly digest','الملخص الأسبوعي'),style:'margin:14px 0 2px'}),el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:8px'},tE,tA),
  el('div',{class:'act',style:'margin-top:6px'},el('button',{text:b2('Copy English','انسخ الإنجليزي'),onclick:()=>cp(dg.en)}),el('button',{text:b2('Copy Arabic','انسخ العربي'),onclick:()=>cp(dg.ar)}),
   el('button',{text:b2('Add to news strip','أضف لشريط الأخبار'),onclick:()=>{ if(typeof TOXAPI!=='undefined'&&TOXAPI.addNews)TOXAPI.addNews(rqNewsLine(S,L)); else xSt(b2('News strip not available.','شريط الأخبار مش متاح.')); }}))); }
/* ---------- wire into the DC panel ---------- */
{ const _t=dcTabs; dcTabs=function(){ const a=_t(), i=Math.max(a.findIndex(x=>x[0]==='fold'),a.findIndex(x=>x[0]==='reg'))+1; a.splice(i,0,['rq',b2('Query','استعلام')],['rqf',b2('Follow-up','المتابعة')]); return a; };
 const _p=dcPanel; dcPanel=function(){ const u=DC.ui; if(u.tab!=='rq'&&u.tab!=='rqf'){ _p(); return; } dcBox.innerHTML=''; const bar=el('div',{class:'dct'}); dcTabs().forEach(t=>bar.appendChild(el('button',{class:u.tab===t[0]?'on':'',text:t[1],onclick:()=>{ u.tab=t[0]; dcPanel(); }}))); const body=el('div',{class:'dcb'}); dcBox.append(bar,body); (u.tab==='rq'?rqQuery:rqFollow)(body); }; }
XCMD('rq_open','sheet','Register query','استعلام السجل',()=>{ DC.ui.tab='rq'; wxOpen('dc',[.1,.08,.8,.82]); });
XCMD('rq_follow','sheet','Follow-up dashboard','لوحة المتابعة',()=>{ DC.ui.tab='rqf'; wxOpen('dc',[.1,.08,.8,.82]); });
