/* ====== MEP design sheets, chunk 1/7 (md_core.js): shared core for the md_* chunks. Global MEP (pure data and maths, no DOM, nothing heavy at load).
   Sheet = {id,grp,en,ar,std:[en,ar],reps:[[en,ar]],fields:[{k,t:'num'|'sel'|'txt'|'tbl',en,ar,def,unit,min,max,opts,cols}],run(i)->{v,rows,tables,checks,notes,svg}}.
   MEP.run(id,inputs) validates, runs, adds pass/fail; MEP.report(id) makes a printable bilingual HTML page with neutral titles. Hydraulic helpers (Hazen-Williams, Darcy-Weisbach with Swamee-Jain, partial-flow Manning)
   are shared by the plumbing, fire and ventilation sheets. Results are PRELIMINARY DEMONSTRATION VALUES, not design approval. Representative table values are labelled in each sheet (verify against the code edition). ====== */
const MEP=(function(){
const M={sheets:{},order:[],last:{},G:9.80665};
M.rnd=(x,d)=>{ const k=Math.pow(10,d==null?2:d); return Math.round(x*k)/k; };
M.up=(a,x)=>{ for(let i=0;i<a.length;i++)if(a[i]>=x-1e-9)return a[i]; return null; };
M.chk=(id,en,ar,ok,val,lim,unit)=>({id,en,ar,ok:!!ok,val:val,lim:lim,unit:unit||''});
M.esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
M.parseTbl=txt=>String(txt==null?'':txt).split(/\n+/).map(l=>l.trim()).filter(l=>l&&l[0]!=='#').map(l=>l.split(/\s*[,;|]\s*/).map(c=>{ const n=+c; return c!==''&&isFinite(n)?n:c; }));
M.CB=[6,10,16,20,25,32,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1000,1250,1600,2000,2500,3200];
M.CS=[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300];
/* ---- sheet registry ---- */
M.reg=d=>{ M.sheets[d.id]=d; if(M.order.indexOf(d.id)<0)M.order.push(d.id); return d; };
M.defaults=id=>{ const d=M.sheets[id], o={}; (d?d.fields:[]).forEach(f=>{ o[f.k]=f.def; }); return o; };
M.inputs=function(d,user){ const i={}, err=[]; user=user||{};
 (d.fields||[]).forEach(f=>{ let v=user[f.k]; if(v===undefined||v===null||v==='')v=f.def;
  if(f.t==='num'){ v=+v; if(!isFinite(v))err.push([f.k,'"'+f.en+'" is not a number','"'+f.ar+'" مش رقم']); else if(f.min!=null&&v<f.min)err.push([f.k,'"'+f.en+'" must be at least '+f.min,'"'+f.ar+'" لازم تكون '+f.min+' على الأقل']); else if(f.max!=null&&v>f.max)err.push([f.k,'"'+f.en+'" must be at most '+f.max,'"'+f.ar+'" لازم تكون '+f.max+' على الأكثر']); }
  else if(f.t==='sel'){ v=String(v); if(!f.opts.some(o=>String(o[0])===v))err.push([f.k,'"'+f.en+'": unknown option '+v,'"'+f.ar+'": اختيار غير معروف '+v]); }
  else v=String(v);
  i[f.k]=v; }); return {i,err}; };
M.run=function(id,user){ const d=M.sheets[id]; if(!d)return {ok:false,id,errors:[['id','Unknown sheet '+id,'شيت مش معروف '+id]]};
 const q=M.inputs(d,user); if(q.err.length)return {ok:false,id,errors:q.err};
 let r; try{ r=d.run(q.i); }catch(e){ return {ok:false,id,errors:[['run',String(e&&e.message||e),String(e&&e.message||e)]]}; }
 r.id=id; r.ok=true; r.checks=r.checks||[]; r.rows=r.rows||[]; r.tables=r.tables||[]; r.v=r.v||{}; r.notes=r.notes||[]; r.pass=r.checks.every(c=>c.ok); r.fails=r.checks.filter(c=>!c.ok).length;
 M.last[id]={inp:q.i,res:r}; return r; };
/* ---- printable report (neutral titles, English + Arabic) ---- */
M.report=function(id,user){ const d=M.sheets[id]; if(!d)return ''; const L=M.last[id], inp=user||(L&&L.inp)||M.defaults(id), res=(user||!L)?M.run(id,inp):L.res; if(!res.ok)return '<!doctype html><meta charset="utf-8"><p>'+M.esc(res.errors.map(e=>e[1]).join('; '))+'</p>';
 const E=M.esc, bi=(a,b)=>E(a)+' <span class="ar" dir="rtl">'+E(b)+'</span>';
 const iv=d.fields.map(f=>'<tr><td>'+bi(f.en,f.ar)+'</td><td class="n">'+(f.t==='tbl'?'<pre>'+E(inp[f.k])+'</pre>':E(inp[f.k]))+'</td><td>'+E(f.unit||'')+'</td></tr>').join('');
 const rv=res.rows.map(r=>'<tr><td>'+bi(r[0],r[1])+'</td><td class="n">'+E(r[2])+'</td><td>'+E(r[3]||'')+'</td></tr>').join('');
 const tb=res.tables.map(t=>'<h3>'+bi(t.en,t.ar)+'</h3><table><tr>'+t.head.map(h=>'<th>'+(Array.isArray(h)?bi(h[0],h[1]):E(h))+'</th>').join('')+'</tr>'+t.rows.map(r=>'<tr>'+r.map(c=>'<td>'+E(c)+'</td>').join('')+'</tr>').join('')+'</table>').join('');
 const ck=res.checks.map(c=>'<tr class="'+(c.ok?'ok':'bad')+'"><td>'+bi(c.en,c.ar)+'</td><td class="n">'+E(c.val)+'</td><td class="n">'+E(c.lim)+'</td><td>'+E(c.unit)+'</td><td><b>'+(c.ok?'PASS / تمام':'FAIL / مش مطابق')+'</b></td></tr>').join('');
 const rp=(d.reps||[]).map(r=>'<li>'+bi(r[0],r[1])+'</li>').join(''), nt=(res.notes||[]).map(r=>'<li>'+bi(r[0],r[1])+'</li>').join('');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>'+E(d.en)+'</title><style>body{font:13px Arial,sans-serif;margin:22px;color:#111}h1{font-size:19px;margin:0 0 3px}h3{font-size:14px;margin:14px 0 4px}table{border-collapse:collapse;margin:4px 0}td,th{border:1px solid #888;padding:3px 8px;text-align:start;vertical-align:top}th{background:#eee}.n{text-align:end;font-variant-numeric:tabular-nums}.ar{color:#444;margin-inline-start:6px}.ok td:last-child{color:#0a6b1d}.bad td{background:#fde7e7}.bad td:last-child{color:#b00020}.box{border:1px solid #c9a227;background:#fff8e1;padding:6px 10px;margin:8px 0}pre{margin:0;font:12px monospace}.np{margin:8px 0}@media print{.np{display:none}}</style></head><body>'
 +'<button class="np" onclick="window.print()">Print / طباعة</button><h1>'+bi(d.en,d.ar)+'</h1><div>'+bi('Method: '+d.std[0],'الأسلوب: '+d.std[1])+'</div>'
 +'<div class="box"><b>'+bi('Preliminary demonstration values - not design approval. A licensed engineer must check every result against the code edition in force.','قيم مبدئية للعرض - مش اعتماد تصميم. لازم مهندس مرخّص يراجع كل نتيجة على إصدار الكود المعمول به.')+'</b></div>'
 +'<h3>'+bi('Inputs','المدخلات')+'</h3><table>'+iv+'</table><h3>'+bi('Results','النتائج')+'</h3><table>'+rv+'</table>'+tb
 +(ck?'<h3>'+bi('Checks','الفحوصات')+'</h3><table><tr><th>'+bi('Check','الفحص')+'</th><th>'+bi('Value','القيمة')+'</th><th>'+bi('Limit','الحد')+'</th><th>'+bi('Unit','الوحدة')+'</th><th>'+bi('Status','الحالة')+'</th></tr>'+ck+'</table><div><b>'+bi('Overall','الإجمالي')+': '+(res.pass?'PASS / تمام':res.fails+' FAIL / مش مطابق')+'</b></div>':'')
 +(res.svg?'<h3>'+bi('Diagram','الرسم')+'</h3>'+res.svg:'')
 +(nt?'<h3>'+bi('Notes','ملاحظات')+'</h3><ul>'+nt+'</ul>':'')
 +(rp?'<h3>'+bi('Representative values used (verify against the code edition)','قيم تمثيلية مستخدمة (راجعها على إصدار الكود)')+'</h3><ul>'+rp+'</ul>':'')+'</body></html>'; };
/* ---- hydraulics (SI) ---- */
M.hw=(Q,L,d,C)=>10.67*L*Math.pow(Math.max(Q,0),1.852)/(Math.pow(C,1.852)*Math.pow(d,4.87));           /* Hazen-Williams head loss, m (Q m3/s, d m) */
M.dw=function(Q,L,d,eps,nu){ nu=nu||1.0e-6; eps=eps==null?1e-5:eps; const A=Math.PI*d*d/4, v=Q/A, Re=v*d/nu; let f; if(Re<2000)f=Re>0?64/Re:0; else { const x=Math.log10(eps/(3.7*d)+5.74/Math.pow(Re,.9)); f=.25/(x*x); } return {v,Re,f,hf:f*L/d*v*v/(2*M.G)}; };  /* Swamee-Jain */
M.circ=function(D,fill){ fill=Math.min(1,Math.max(1e-6,fill)); const th=2*Math.acos(1-2*fill), A=D*D/8*(th-Math.sin(th)), P=D*th/2; return {A,P,R:A/P,th}; };
M.man=function(D,S,n,fill){ const g=M.circ(D,fill), Q=g.A*Math.pow(g.R,2/3)*Math.sqrt(S)/n; return {Q,v:Q/g.A,A:g.A,R:g.R}; };   /* Manning, partially full circular pipe */
M.interp=function(xs,ys,x){ if(x<=xs[0])return ys[0]; for(let i=1;i<xs.length;i++)if(x<=xs[i]){ const t=(x-xs[i-1])/(xs[i]-xs[i-1]); return ys[i-1]+(ys[i]-ys[i-1])*t; } return ys[ys.length-1]; };
M.fmt=(x,d)=>(x==null||!isFinite(x))?'-':String(+(+x).toFixed(d==null?2:d));
return M; })();
