/* ====== MOD-CXSX chunk B (AutoCAD C.X): parametric constraints, 16 ribbon stubs. Constraints are stored in the drawing (cadD().cons, saved with the project and undone with Ctrl+Z); entities get a stable id (e.id) the first time they are constrained. A small relaxation solver (max 60 passes, tolerance 1e-9) re-applies every constraint after each command and after every cadCommit(), so moving or editing an object pulls its constrained partners with it. Supported objects: lines (t:'l') and circles (t:'c'). Geometric: Coincident, Collinear, Concentric, Fix, Parallel, Perpendicular, Horizontal, Vertical, Equal. Dimensional (named parameters d1, d2, ...): Linear (horizontal or vertical extent of a line), Aligned (line length), Radius, Diameter. Manage: Delete Constraints, Parameters Manager (rename value: "d1=50"), Show/Hide (glyphs drawn on constrained objects). Not supported: arcs, polylines, rectangles, splines, Angular, Convert, Tangent, Smooth, Symmetric (need an arc/spline model), over-constrained systems are reported not resolved. Load after mod_cxsx_cad_a.js. ====== */
(function(){
const ov=PCX.ov, ask=PCX.ask, D=()=>cadD();
function sel(){ try{ if(!CS.open)XC.cad.run(); }catch(e){} return [...CS.sel].filter(i=>D().ents[i]&&(D().ents[i].t==='l'||D().ents[i].t==='c')); }
function done(msg){ solve(); cadCommit(); xSt(msg); CS.msg=msg; try{ cadLayers(); cadPrompt(); cadRender(); }catch(e){} }
const eid=e=>e.id||(e.id='k'+(++PCX.n)+Date.now().toString(36)), byId=id=>D().ents.find(e=>e.id===id), C=()=>D().cons||(D().cons=[]);
const isL=e=>e&&e.t==='l', isC=e=>e&&e.t==='c', len=e=>Math.hypot(e.x2-e.x1,e.y2-e.y1), ang=e=>Math.atan2(e.y2-e.y1,e.x2-e.x1);
const wrap=a=>{ a=a%Math.PI; if(a>Math.PI/2)a-=Math.PI; if(a<=-Math.PI/2)a+=Math.PI; return a; }; /* angle difference modulo 180 deg, in (-90,90] */
const pt=(e,p)=>p==='c'?[e.x,e.y]:p===1?[e.x2,e.y2]:[e.x1,e.y1];
function setPt(e,p,q){ if(p==='c'){ e.x=q[0]; e.y=q[1]; } else if(p===1){ e.x2=q[0]; e.y2=q[1]; } else { e.x1=q[0]; e.y1=q[1]; } }
function rotMid(e,d){ const mx=(e.x1+e.x2)/2, my=(e.y1+e.y2)/2, c=Math.cos(d), s=Math.sin(d); const f=(x,y)=>[mx+(x-mx)*c-(y-my)*s,my+(x-mx)*s+(y-my)*c]; [e.x1,e.y1]=f(e.x1,e.y1); [e.x2,e.y2]=f(e.x2,e.y2); }
function setLen(e,L){ const m=[(e.x1+e.x2)/2,(e.y1+e.y2)/2], a=ang(e); e.x1=m[0]-L/2*Math.cos(a); e.y1=m[1]-L/2*Math.sin(a); e.x2=m[0]+L/2*Math.cos(a); e.y2=m[1]+L/2*Math.sin(a); }
/* a constraint is {k, r:[ids...], p:[point selectors], n:name, v:value}; apply() moves geometry toward satisfying it and returns the violation measured BEFORE the move */
function apply(c){ const E=c.r.map(byId); if(E.some(x=>!x))return 0; const [A,B]=E, fa=A&&A.fx, fb=B&&B.fx; let res=0;
 switch(c.k){
 case 'hor': case 'ver': { const t=c.k==='hor'?0:Math.PI/2, d=wrap(t-ang(A)); res=Math.abs(Math.sin(d))*len(A); if(!fa)rotMid(A,d); break; }
 case 'par': case 'perp': { const o=c.k==='perp'?Math.PI/2:0, d=wrap(ang(A)+o-ang(B)); res=Math.abs(Math.sin(d))*len(B); if(!fb)rotMid(B,d); else if(!fa)rotMid(A,-d); break; }
 case 'eq': { if(isL(A)){ const la=len(A), lb=len(B); res=Math.abs(la-lb); const t=fa&&!fb?la:fb&&!fa?lb:(la+lb)/2; if(!fa)setLen(A,t); if(!fb)setLen(B,t); } else { res=Math.abs(A.r-B.r); const t=fa&&!fb?A.r:fb&&!fa?B.r:(A.r+B.r)/2; if(!fa)A.r=t; if(!fb)B.r=t; } break; }
 case 'coin': { const pa=pt(A,c.p[0]), pb=pt(B,c.p[1]); res=Math.hypot(pa[0]-pb[0],pa[1]-pb[1]); const m=fa&&!fb?pa:fb&&!fa?pb:[(pa[0]+pb[0])/2,(pa[1]+pb[1])/2]; if(!fa)setPt(A,c.p[0],m); if(!fb)setPt(B,c.p[1],m); break; }
 case 'conc': { res=Math.hypot(A.x-B.x,A.y-B.y); if(!fb){ B.x=A.x; B.y=A.y; } else if(!fa){ A.x=B.x; A.y=B.y; } break; }
 case 'col': { const dx=Math.cos(ang(A)), dy=Math.sin(ang(A)), prj=(e,p)=>{ const q=pt(e,p), t=(q[0]-A.x1)*dx+(q[1]-A.y1)*dy; return [A.x1+t*dx,A.y1+t*dy]; }; res=Math.max(...[0,1].map(p=>{ const q=pt(B,p), r=prj(B,p); return Math.hypot(q[0]-r[0],q[1]-r[1]); })); if(!fb)[0,1].forEach(p=>setPt(B,p,prj(B,p))); break; }
 case 'lin': { const a=(A.x2-A.x1), b=(A.y2-A.y1), horiz=c.h!==undefined?c.h:Math.abs(a)>=Math.abs(b); c.h=horiz; const cur=horiz?Math.abs(a):Math.abs(b); res=Math.abs(cur-c.v); if(!fa){ if(horiz)A.x2=A.x1+(a<0?-1:1)*c.v; else A.y2=A.y1+(b<0?-1:1)*c.v; } break; }
 case 'ali': { res=Math.abs(len(A)-c.v); if(!fa){ const L=len(A)||1, k=c.v/L; A.x2=A.x1+(A.x2-A.x1)*k; A.y2=A.y1+(A.y2-A.y1)*k; } break; }
 case 'rad': res=Math.abs(A.r-c.v); if(!fa)A.r=c.v; break;
 case 'dia': res=Math.abs(2*A.r-c.v); if(!fa)A.r=c.v/2; break;
 default: if(PCX.cx&&PCX.cx[c.k])res=PCX.cx[c.k](c,E,fa,fb);
 } return res; }
function prune(){ const cs=C(); D().cons=cs.filter(c=>c.k==='fix'?c.r.every(byId):c.r.every(byId)); D().ents.forEach(e=>{ if(e.fx&&!D().cons.some(c=>c.k==='fix'&&c.r[0]===e.id))delete e.fx; }); }
function solve(){ prune(); const cs=C(); if(!cs.length)return 0; let res=0; for(let it=0;it<60;it++){ res=0; cs.forEach(c=>{ res=Math.max(res,apply(c)); }); if(res<1e-9)break; } return res; }
function resid(c){ const E=c.r.map(byId); if(E.some(x=>!x))return NaN; const snap=JSON.stringify(E), r=apply(c); E.forEach((e,i)=>Object.assign(e,JSON.parse(snap)[i])); return r; }
PCX.cons={solve,resid,apply};
PCX.capi={KN:null,eid,byId,C,isL,isC,len,ang,wrap,pt,setPt,rotMid,setLen,sel,done}; /* used by c_parity_cad2.js (Tangent, Smooth, Symmetric, Angular, Convert) */
{ const _cc=cadCommit; cadCommit=function(){ if(!PCX.busy&&D().cons&&D().cons.length){ PCX.busy=1; try{ solve(); }finally{ PCX.busy=0; } } _cc(); }; }

/* ---- geometric commands: single-object (Horizontal, Vertical, Fix) and two-object (the FIRST selected is the reference; every other selected object is constrained to it) ---- */
const KN={hor:['Horizontal','أفقي'],ver:['Vertical','رأسي'],fix:['Fix','تثبيت'],par:['Parallel','توازي'],perp:['Perpendicular','تعامد'],eq:['Equal','تساوي'],coin:['Coincident','تطابق'],col:['Collinear','على استقامة'],conc:['Concentric','متحدة المركز'],lin:['Linear','خطي'],ali:['Aligned','محاذي'],rad:['Radius','نصف قطر'],dia:['Diameter','قطر']};
PCX.capi.KN=KN;
function nearestPts(A,B){ const pa=isC(A)?['c']:[0,1], pb=isC(B)?['c']:[0,1]; let best=null; pa.forEach(a=>pb.forEach(b=>{ const p=pt(A,a), q=pt(B,b), d=Math.hypot(p[0]-q[0],p[1]-q[1]); if(!best||d<best.d)best={d,a,b}; })); return best; }
function geo(k,en,tab,panel,need,okType){ ov('draft','Parametric',panel,en,()=>{ const ids=sel(); const bad=ids.some(i=>!okType(D().ents[i])); if(ids.length<need||bad){ xSt(b2(need===1?'Select lines'+(okType===isC?' (circles)':'')+' first.':'Select '+need+' or more objects of the right type (reference object first).','اختار '+(need===1?'عناصر':'عنصرين أو أكتر')+' من النوع المناسب (العنصر المرجعي الأول).')); return; }
  const ents=ids.map(i=>D().ents[i]); let n=0;
  if(need===1){ ents.forEach(e=>{ if(k==='fix'){ e.fx=true; } C().push({k,r:[eid(e)],n:KN[k][0]+(C().length+1)}); n++; }); }
  else { const A=ents[0]; ents.slice(1).forEach(B=>{ const c={k,r:[eid(A),eid(B)],n:KN[k][0]+(C().length+1)}; if(k==='coin'){ const w=nearestPts(A,B); c.p=[w.a,w.b]; } C().push(c); n++; }); }
  const r=solve(); done(b2(n+' '+KN[k][0]+' constraint(s) added'+(r>1e-6?' - NOT satisfied (conflict), residual '+r.toExponential(1):''),'اتضاف '+n+' قيد '+KN[k][1]+(r>1e-6?' - مش متحقق (تعارض)':''))); }); }
geo('hor','Horizontal','Parametric','Geometric',1,isL); geo('ver','Vertical','Parametric','Geometric',1,isL); geo('fix','Fix','Parametric','Geometric',1,e=>isL(e)||isC(e));
geo('par','Parallel','Parametric','Geometric',2,isL); geo('perp','Perpendicular','Parametric','Geometric',2,isL); geo('col','Collinear','Parametric','Geometric',2,isL);
geo('eq','Equal','Parametric','Geometric',2,(e)=>isL(e)||isC(e)); geo('coin','Coincident','Parametric','Geometric',2,e=>isL(e)||isC(e)); geo('conc','Concentric','Parametric','Geometric',2,isC);

/* ---- dimensional: value is asked (default = current), stored as a named parameter d1, d2, ... ---- */
function dimc(k,en,okType,cur){ ov('draft','Parametric','Dimensional',en,()=>{ const ids=sel().filter(i=>okType(D().ents[i])); if(!ids.length){ xSt(b2('Select a '+(okType===isC?'circle':'line')+' first.','اختار '+(okType===isC?'دايرة':'خط')+' الأول.')); return; } let n=0;
  ids.forEach(i=>{ const e=D().ents[i], v=parseFloat(ask(KN[k][0]+' value for '+(en)+' (current '+cur(e).toFixed(3)+')','قيمة '+KN[k][1]+' (الحالية '+cur(e).toFixed(3)+')',cur(e).toFixed(3))); if(!(v>0)){ return; } const used=C().map(c=>/^d(\d+)$/.test(c.n||'')?+RegExp.$1:0); PCX.dn=Math.max(0,...used)+1; C().push({k,r:[eid(e)],n:'d'+PCX.dn,v}); n++; });
  if(n)done(b2(n+' dimensional constraint(s) added','اتضاف '+n+' قيد أبعاد')); }); }
dimc('lin','Linear',isL,e=>Math.max(Math.abs(e.x2-e.x1),Math.abs(e.y2-e.y1))); dimc('ali','Aligned',isL,len); dimc('rad','Radius',isC,e=>e.r); dimc('dia','Diameter',isC,e=>2*e.r);

/* ---- manage ---- */
ov('draft','Parametric','Manage','Delete Constraints',()=>{ const ids=sel(), ents=ids.map(i=>D().ents[i]), idset=new Set(ents.map(e=>e.id).filter(Boolean)); const before=C().length; D().cons=C().filter(c=>!c.r.some(r=>idset.has(r))); ents.forEach(e=>{ delete e.fx; }); done(b2((before-C().length)+' constraint(s) deleted','اتمسح '+(before-C().length)+' قيد')); });
ov('draft','Parametric','Manage','Parameters Manager',()=>{ solve(); const cs=C(); const rows=cs.map(c=>[c.n,KN[c.k][0],c.r.map(r=>{ const e=byId(r); return e?(e.t==='c'?'circle':'line')+'@'+(e.t==='c'?e.x.toFixed(1)+','+e.y.toFixed(1):e.x1.toFixed(1)+','+e.y1.toFixed(1)):'(deleted)'; }).join(' + '),c.v===undefined?'':String(c.v),PCX.fmt(resid(c),6)]); PCX.rep(b2('Parameters Manager','مدير المعاملات'),['name','type','objects','value','residual'],rows,b2(cs.length+' constraint(s)','عدد القيود '+cs.length));
 const a=(ask('Set a parameter: name=value (empty = just list)','عدّل معامل: الاسم=القيمة (فاضي = عرض فقط)','')||'').trim(); if(!a)return; const m=a.match(/^(\w+)\s*=\s*(-?[\d.]+)$/), c=m&&cs.find(x=>x.n===m[1]&&x.v!==undefined); if(!c||!(+m[2]>0)){ xSt(b2('No such dimensional parameter, or value <= 0.','مفيش معامل بالاسم ده أو القيمة <= 0.')); return; } c.v=+m[2]; done(b2(c.n+' = '+c.v+', model re-solved','المعامل '+c.n+' = '+c.v+'، اتحل الموديل تاني')); });
ov('draft','Parametric','Manage','Show/Hide',()=>{ D().cshow=!D().cshow; done(b2('Constraint glyphs '+(D().cshow?'shown':'hidden'),'رموز القيود '+(D().cshow?'ظاهرة':'مخفية'))); });
{ const _es=cadEntSvg, GL={tan:'T',smo:'S',sym:'[]',ang:'∠',hor:'H',ver:'V',fix:'F',par:'//',perp:'⊥',eq:'=',coin:'●',col:'≡',conc:'◎',lin:'d',ali:'d',rad:'R',dia:'Ø'}; cadEntSvg=function(e,s,paper){ const r=_es(e,s,paper); if(!(e&&e.id&&D().cshow&&D().cons))return r; const g=D().cons.filter(c=>c.r.includes(e.id)).map(c=>GL[c.k]).join(' '); if(!g)return r; const x=e.t==='c'?e.x:(e.x1+e.x2)/2, y=e.t==='c'?e.y:(e.y1+e.y2)/2; return r+'<text x="'+x+'" y="'+(-y-(D().th||2.5)*.6)+'" font-size="'+(D().th||2.5)+'" font-family="Arial" fill="#ffb74d" data-cons="1">'+g+'</text>'; }; }
try{ xRibbon(); }catch(e){}
})();
