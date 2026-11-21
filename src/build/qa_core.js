/* ====== qa (prefix qa / QA): construction planning and quality helpers for P.X, C.X and G.X (chunk 1 of 8: shared helpers and data store).
   Data lives in DATA.qa (saved with the project): sched, act, hp, cube, snag, cost, rules, perm, logi, tend, asb, chg, om, fa. Nothing is created until a QA command is used (lazy).
   All typical durations, checklists, rules and weights in these chunks are GENERIC SAMPLE TEMPLATES to adapt, NOT regulations, NOT prices and NOT design approval.
   Needs: DATA, ACT, WBSN, PS, CAL, el, b2, lang, out, xlsx, xSt, XCMD, XDESC, persist. Load after c_px2_*.js and c_gantt.js. ====== */
const QA={tab:'wbs',box:null,blocked:new Set(),said:0,tpl:null,msg:''};
function qaD(){ if(!DATA.qa||typeof DATA.qa!=='object')DATA.qa={v:1}; return DATA.qa; }
function qaA(k){ const d=qaD(); if(!Array.isArray(d[k]))d[k]=[]; return d[k]; }
function qaO(k,def){ const d=qaD(); if(!d[k]||typeof d[k]!=='object')d[k]=def||{}; return d[k]; }
const qaL=()=>lang==='ar'?1:0;
const qaE=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const qaR2=n=>Math.round(n*100)/100;
const qaNum=v=>{ const t=String(v==null?'':v).replace(/,/g,'').trim(); const n=+t; return t!==''&&isFinite(n)?n:NaN; };
const qaToday=()=>new Date().toISOString().slice(0,10);
const qaDn=s=>{ const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(s||'')); return m?Math.floor(Date.UTC(+m[1],+m[2]-1,+m[3])/864e5):NaN; };
const qaIso=n=>new Date(n*864e5).toISOString().slice(0,10);
const qaAdd=(s,n)=>{ const d=qaDn(s); return isNaN(d)?'':qaIso(d+n); };
function qaId(arr,p,w){ const s=new Set(arr.map(x=>x.id)); let n=arr.length+1, id; do{ id=p+String(n++).padStart(w||3,'0'); }while(s.has(id)); return id; }
function qaSave(){ try{ persist(); }catch(e){} }
function qaStat(a){ const n=a.length; if(!n)return {n:0,mean:NaN,sd:NaN,min:NaN,max:NaN,cov:NaN}; const m=a.reduce((s,x)=>s+x,0)/n, sd=n>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(n-1)):NaN; return {n,mean:m,sd,min:Math.min(...a),max:Math.max(...a),cov:m?sd/m*100:NaN}; }
/* ---------- export through the existing pipeline: xlsx() + out(), CSV with formula guard ---------- */
const qaCsvCell=v=>{ let s=String(v==null?'':v); if(/^[=+\-@\t\r]/.test(s))s="'"+s; return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
const qaCsv=rows=>'﻿'+rows.map(r=>r.map(qaCsvCell).join(',')).join('\r\n');
function qaXls(name,sheets){ const b=xlsx(sheets.map(s=>({name:String(s.name).slice(0,31),rows:s.rows,widths:s.widths||s.rows[0].map((c,i)=>i===0?14:Math.min(44,Math.max(10,String(c).length+4)))}))); if(name)out(name,b); return b; }
/* ---------- tiny editable grid: cols [{k,t:[en,ar],type:'text|num|date|sel|ro|chk',opts:[[v,en,ar]],w}] ---------- */
function qaGrid(cols,rows,o){ o=o||{}; const L=qaL(), t=el('table',{class:'dctab',style:'width:100%;border-collapse:collapse;font-size:12px'}), hd=el('tr'); cols.forEach(c=>hd.appendChild(el('th',{text:c.t[L],style:'text-align:start;padding:2px 4px;white-space:nowrap'}))); if(o.del)hd.appendChild(el('th')); t.appendChild(el('thead',{},hd)); const tb=el('tbody'); const cap=o.max||400;
 rows.slice(0,cap).forEach(r=>{ const tr=el('tr'); if(o.cls&&o.cls(r))tr.style.cssText=o.cls(r);
  cols.forEach(c=>{ const td=el('td',{style:'padding:1px 3px'+(c.w?';min-width:'+c.w+'px':'')}); let v=typeof c.get==='function'?c.get(r):r[c.k];
   if(c.type==='ro'||(c.ro&&c.ro(r))){ td.textContent=v==null?'':String(v); if(c.tt)td.title=c.tt(r); }
   else if(c.type==='sel'){ const s=el('select',{style:'max-width:150px'}); c.opts.forEach(p=>s.appendChild(el('option',{value:p[0],text:p[1+L]||p[1]}))); s.value=v==null?'':v; s.title=c.t[L]; s.onchange=()=>o.on&&o.on(r,c.k,s.value); td.appendChild(s); }
   else if(c.type==='chk'){ const i=el('input',{type:'checkbox'}); i.checked=!!v; i.title=c.t[L]; i.onchange=()=>o.on&&o.on(r,c.k,i.checked); td.appendChild(i); }
   else { const i=el('input',{type:c.type==='date'?'date':'text',value:v==null?'':String(v),style:'width:'+(c.type==='num'?'72':c.type==='date'?'128':'100%')+'px;'+(c.type==='num'?'':'min-width:90px')}); i.title=c.t[L]; i.onchange=()=>o.on&&o.on(r,c.k,i.value.trim()); td.appendChild(i); }
   tr.appendChild(td); });
  if(o.del){ const td=el('td'); td.appendChild(el('button',{text:'×',title:b2('Delete this row','احذف الصف ده'),onclick:()=>o.del(r)})); tr.appendChild(td); }
  tb.appendChild(tr); }); t.appendChild(tb); if(rows.length>cap){ const w=el('div'); w.append(t,el('div',{class:'small',text:b2('Showing first '+cap+' of '+rows.length+' rows (export to see all).','معروض أول '+cap+' من '+rows.length+' صف (صدّر لرؤية الكل).')})); return w; } return t; }
/* ---------- inline SVG helpers (no libraries) ---------- */
function qaSvgLine(pts,o){ o=o||{}; const W=o.w||520,H=o.h||190,pl=38,pb=22,pt=8,pr=8; const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); const x0=Math.min(...xs,0), x1=Math.max(...xs,1), y0=0, y1=Math.max(o.ymax||0,...ys,1e-9); const X=x=>pl+(x-x0)/(x1-x0||1)*(W-pl-pr), Y=y=>H-pb-(y-y0)/(y1-y0||1)*(H-pb-pt);
 let s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:'+W+'px;height:auto;background:var(--panel);border:1px solid var(--line);border-radius:6px"><g font-size="10" fill="currentColor" stroke="none">';
 for(let i=0;i<=4;i++){ const y=y0+(y1-y0)*i/4; s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(y)+'" y2="'+Y(y)+'" stroke="currentColor" stroke-opacity=".15"/><text x="'+(pl-4)+'" y="'+(Y(y)+3)+'" text-anchor="end">'+(o.pct?Math.round(y)+'%':Math.round(y))+'</text>'; }
 (o.xl||[]).forEach(l=>{ s+='<text x="'+X(l[0])+'" y="'+(H-6)+'" text-anchor="middle">'+qaE(l[1])+'</text>'; }); s+='</g>';
 if(o.bars){ const bw=Math.max(2,(W-pl-pr)/Math.max(1,o.bars.length)*.6); o.bars.forEach(b=>{ const h=(H-pb-pt)*(b[1]/(y1||1)); s+='<rect x="'+(X(b[0])-bw/2)+'" y="'+(H-pb-h)+'" width="'+bw+'" height="'+h+'" fill="'+(b[2]||'#7fb6d8')+'" fill-opacity=".75"/>'; }); }
 if(o.limit!=null&&o.limit>0&&o.limit<=y1)s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(o.limit)+'" y2="'+Y(o.limit)+'" stroke="#e0643a" stroke-dasharray="4 3"/>';
 if(pts.length>1&&!o.bars)s+='<polyline fill="none" stroke="'+(o.col||'#4aa3df')+'" stroke-width="2" points="'+pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')+'"/>'; return s+'</svg>'; }
/* ---------- small UI helpers ---------- */
function qaBtn(en,ar,tipEn,tipAr,fn,on){ const b=el('button',{text:b2(en,ar),title:b2(tipEn,tipAr),onclick:fn}); if(on)b.className='on'; return b; }
function qaNote(en,ar){ return el('div',{class:'small',style:'margin:4px 0;color:var(--muted)',text:b2(en,ar)}); }
function qaSampleBadge(en,ar){ return el('span',{style:'display:inline-block;margin:0 6px;padding:0 6px;border:1px solid #e0a43a;color:#e0a43a;border-radius:4px;font-size:11px',text:b2(en||'SAMPLE - not a regulation',ar||'نموذج - مش لائحة رسمية')}); }
const qaSt=(en,ar)=>{ try{ xSt(b2(en,ar)); }catch(e){} };
