/* ====== ag5_ops: what each step does, on the existing tools only (tabs WTAB/wtNew/wtSwitch/wtClose, C.X cadD/CS/cadCommit, R.X RV/rvChanged,
   G.X GM/gmGo/gmDraw, commands XC: zin, zout, zsel, undo, c_dim, m_dist, rv_del, gis_layers ...). Every op waits for its visible result.
   "It" = the last object the agent made or touched (AG5.ctx.obj) unless you selected another one yourself (your selection wins).
   C.X: drawing units are taken as metres (1 unit = 1 m), said in the result. Each change is one undo step (xaTxn from c_mission.js). ====== */
const ag5Tx=f=>(typeof xaTxn==='function')?xaTxn(f):Promise.resolve().then(f);
const ag5M=v=>(Math.round(v*100)/100).toFixed(2)+ag5B(' m',' م');
function ag5TabRendered(type){ if(type==='gis')return ag5MapReady(); try{ return Object.values(WX.lay).some(l=>l.open); }catch(e){ return true; } }
AG5OPS.tab=async(st,R)=>{ const type=st.type; if(!WTYPES[type])throw ag5Err('unknown tab "'+type+'"','تاب مش معروف "'+type+'"'); const t=WTAB.tabs.find(x=>x.type===type);
 await ag5Point(t?xaTabEl(type):(document.querySelector('#xDocTabs .plus')||document.getElementById('xDocTabs')),R); if(R.cancel)throw ag5Err('stopped','اتوقف');
 if(!t)wtNew(type); else if(WTAB.cur!==t.id)wtSwitch(t.id);
 await ag5Until(()=>ag5TabNow()===type&&ag5TabRendered(type),AG5.tmo.tab,'the tab did not open in time','التاب ماتفتحش في الوقت',R);
 if(type==='draft'&&typeof cadShow==='function'&&!CS.open)cadShow(true);
 await ag5Point(xaTabEl(type),R,false); AG5.ctx.tab=type; return ag5B('Opened ','فتحت ')+xfTypeName(type); };
AG5OPS.close=async(st,R)=>{ const type=st.type||ag5TabNow(); const t=WTAB.tabs.find(x=>x.type===type); if(!t||type==='start')throw ag5Err('that tab is not open','التاب ده مش مفتوح'); await ag5Point(xaTabEl(type),R);
 if(type==='draft'&&typeof cadShow==='function'&&CS.open)cadShow(false); wtClose(t.id); await ag5Until(()=>!WTAB.tabs.includes(t),3000,'the tab did not close','التاب ماتقفلش',R); AG5.ctx.tab=ag5TabNow(); return ag5B('Closed ','قفلت ')+xfTypeName(type); };
AG5OPS.undo=async(st,R)=>{ if(!XC.undo)throw ag5Err('undo is not available','التراجع مش متاح'); await ag5Point(xaBtn('undo'),R); XC.undo.run(); await ag5Sleep(150); return ag5B('Undone','اتراجعت'); };
AG5OPS.stop=async(st,R)=>{ R.cancel=true; return ''; };
AG5OPS.cmd=async(st,R)=>{ const c=XC[st.id]; if(!c)throw ag5Err('unknown command '+st.id,'أمر مش معروف '+st.id); if(c.stub)throw ag5Err('"'+c.t[0]+'" is not built yet','"'+c.t[1]+'" لسه متبناش'); await ag5Point(xaBtn(st.id),R);
 const r=c.run(); if(r&&typeof r.then==='function')await r; await ag5Sleep(150); return ag5B('Ran: ','شغّلت: ')+c.t[(typeof lang!=='undefined'&&lang==='ar')?1:0]; };
AG5OPS.old=async(st,R)=>{ await AG5.old(st.text); return ag5B('Passed to the agent (see its answer in the chat)','اتبعت للوكيل (شوف رده في الشات)'); };
/* ---------- the object "it" ---------- */
function ag5Obj(){ const c=AG5.ctx.obj, tab=ag5TabNow();
 try{ if(typeof CS!=='undefined'&&CS.open&&CS.sel.size===1){ const e=cadD().ents[[...CS.sel][0]]; if(e&&!(c&&c.e===e))return AG5.ctx.obj={kind:'cad',e}; } }catch(x){}
 try{ if(tab==='model'&&RV.sel){ const e=RV.els.find(x=>x.id===RV.sel); if(e&&!(c&&c.e===e))return AG5.ctx.obj={kind:'rv',e}; } }catch(x){}
 if(c){ try{ if(c.kind==='cad'&&cadD().ents.includes(c.e))return c; if(c.kind==='rv'&&RV.els.includes(c.e))return c; if(c.kind==='gis'&&ag5GisHas(c.f))return c; }catch(x){} }
 return null; }
function ag5Need(){ const o=ag5Obj(); if(!o)throw ag5Err('nothing to act on: select an object or ask me to draw one first','مفيش حاجة أشتغل عليها: اختار عنصر أو اطلب مني أرسم واحد الأول'); return o; }
/* segment view of a line-like object: a, b as [x,y] in metres; set(a,b) writes back */
function ag5Seg(o){ const e=o.e; if(o.kind==='cad'&&(e.t==='l'||e.t==='dim'))return {a:[e.x1,e.y1],b:[e.x2,e.y2],set:(a,b)=>{ e.x1=a[0]; e.y1=a[1]; e.x2=b[0]; e.y2=b[1]; }};
 if(o.kind==='rv'&&e.a&&e.b)return {a:e.a.slice(),b:e.b.slice(),set:(a,b)=>{ e.a=a; e.b=b; }}; return null; }
function ag5Commit(o){ if(o.kind==='cad'){ cadCommit(); } else if(o.kind==='rv'){ rvChanged(); } else if(o.kind==='gis'){ try{ gmDraw(); }catch(e){} } }
function ag5Where(o){ if(o.kind==='cad')return CW.querySelector('svg'); if(o.kind==='gis')return GM.cv; try{ return document.querySelector('#xWin_view3d,canvas'); }catch(e){ return null; } }
const ag5KindName=o=>o.kind==='cad'?ag5B('C.X line','خط C.X'):o.kind==='rv'?(o.e.k==='wall'?ag5B('wall','الحيطة'):ag5B(o.e.k,o.e.k)):ag5B('map marker','علامة الخريطة');
/* ---------- drawing ---------- */
AG5OPS.line=async(st,R)=>{ if(!CS.open)cadShow(true); await ag5Until(()=>CS.open&&CW.querySelector('svg'),3000,'C.X did not open','C.X ماتفتحش',R); const sv=CW.querySelector('svg'); await ag5Point(sv,R);
 const V=CS.V, cx=V.x+V.w/2, cy=V.y+V.h/2, L=st.v; let e; await ag5Tx(()=>{ e={t:'l',x1:+(cx-L/2).toFixed(3),y1:+cy.toFixed(3),x2:+(cx+L/2).toFixed(3),y2:+cy.toFixed(3)}; cadAdd(e); CS.sel=new Set([cadD().ents.length-1]); cadCommit(); });
 if(L>V.w*.9){ CS.V={x:cx-L*.65,y:cy-L*.4,w:L*1.3,h:L*.8}; cadRender(); } AG5.ctx.obj={kind:'cad',e}; AG5.ctx.tab='draft'; return ag5B('Line ','خط ')+ag5M(L)+ag5B(' (drawing units as metres)',' (وحدات الرسم بالمتر)'); };
AG5OPS.wall=async(st,R)=>{ await ag5Point(document.querySelector('canvas'),R); let e; await ag5Tx(()=>{ rvPush(); const d=RV.def.wall; e={id:rvId(),k:'wall',a:[0,0],b:[+st.v.toFixed(3),0],h:d.h,t:d.t,lv:RV.lv}; RV.els.push(e); RV.sel=e.id; rvChanged(); });
 AG5.ctx.obj={kind:'rv',e}; AG5.ctx.tab='model'; return ag5B('Wall ','حيطة ')+ag5M(st.v)+ag5B(', height ',' بارتفاع ')+ag5M(e.h); };
AG5OPS.marker=async(st,R)=>{ await ag5EnsureMap(R); await ag5Point(GM.cv,R); const f={t:'pt',g:[GM.lat,GM.lon],n:ag5B('Pin ','علامة ')+(ag5GisLayer().feat.length+1),c:'#4fc3f7',ag5:1};
 ag5GisLayer().feat.push(f); gmDraw(); AG5.ctx.obj={kind:'gis',f}; return ag5B('Marker at ','علامة عند ')+GM.lat.toFixed(5)+', '+GM.lon.toFixed(5); };
AG5OPS.del=async(st,R)=>{ const o=ag5Need(); await ag5Point(ag5Where(o),R); const nm=ag5KindName(o);
 await ag5Tx(()=>{ if(o.kind==='cad'){ const D=cadD(), i=D.ents.indexOf(o.e); if(i>=0)D.ents.splice(i,1); CS.sel.clear(); cadCommit(); } else if(o.kind==='rv'){ rvPush(); RV.els=RV.els.filter(x=>x!==o.e); RV.sel=null; rvChanged(); } else { GM.layers.forEach(l=>{ l.feat=l.feat.filter(x=>x!==o.f); }); gmDraw(); } });
 AG5.ctx.obj=null; return ag5B('Deleted the ','مسحت ')+nm; };
/* ---------- geometry edits ---------- */
async function ag5SegEdit(st,R,fn,okMsg){ const o=ag5Need(), s=ag5Seg(o); if(!s)throw ag5Err('this works on a line or a wall, not on a '+(o.kind==='gis'?'map marker':(o.e.t||o.e.k)),'ده بيشتغل على خط أو حيطة، مش على '+(o.kind==='gis'?'علامة خريطة':(o.e.t||o.e.k)));
 await ag5Point(ag5Where(o),R); await ag5Tx(()=>{ if(o.kind==='rv')rvPush(); const r=fn(s.a,s.b,Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1])); s.set(r[0].map(v=>+v.toFixed(4)),r[1].map(v=>+v.toFixed(4))); ag5Commit(o); }); AG5.ctx.obj=o; return okMsg(o); }
AG5OPS.orient=(st,R)=>ag5SegEdit(st,R,(a,b,L)=>[a,st.v==='v'?[a[0],a[1]+(b[1]>=a[1]?L:-L)]:[a[0]+(b[0]>=a[0]?L:-L),a[1]]],o=>ag5KindName(o)+' '+(st.v==='v'?ag5B('is vertical now','بقى رأسي'):ag5B('is horizontal now','بقى أفقي')));
AG5OPS.rot=(st,R)=>ag5SegEdit(st,R,(a,b)=>{ const c=[(a[0]+b[0])/2,(a[1]+b[1])/2], r=st.v*Math.PI/180, f=q=>[c[0]+(q[0]-c[0])*Math.cos(r)-(q[1]-c[1])*Math.sin(r),c[1]+(q[0]-c[0])*Math.sin(r)+(q[1]-c[1])*Math.cos(r)]; return [f(a),f(b)]; },o=>ag5KindName(o)+ag5B(' rotated ',' اتلف ')+st.v+'°');
AG5OPS.len=(st,R)=>{ if(!(st.v>0))return Promise.reject(ag5Err('length must be more than 0','الطول لازم يكون أكبر من صفر')); return ag5SegEdit(st,R,(a,b,L)=>{ const k=L>1e-9?st.v/L:1, d=L>1e-9?[b[0]-a[0],b[1]-a[1]]:[st.v,0]; return [a,[a[0]+d[0]*(L>1e-9?k:1),a[1]+d[1]*(L>1e-9?k:1)]]; },o=>ag5KindName(o)+ag5B(' length ',' طولها ')+ag5M(st.v)); };
AG5OPS.move=async(st,R)=>{ const o=ag5Need(), dx=st.d[0]*st.v, dy=st.d[1]*st.v; await ag5Point(ag5Where(o),R);
 await ag5Tx(()=>{ if(o.kind==='cad'){ if(cadD().ents.indexOf(o.e)<0)throw ag5Err('the line is gone','الخط مش موجود'); const n=mapE(o.e,q=>[q[0]+dx,q[1]+dy]); Object.keys(o.e).forEach(k=>delete o.e[k]); Object.assign(o.e,n); cadCommit(); }
  else if(o.kind==='rv'){ rvPush(); const e=o.e; ['a','b','p'].forEach(k=>{ if(Array.isArray(e[k]))e[k]=[e[k][0]+dx,e[k][1]+dy]; }); rvChanged(); }
  else { const m=gmxM(o.f.g[0]); o.f.g=[o.f.g[0]+dy/m[0],o.f.g[1]+dx/m[1]]; gmDraw(); } });
 return ag5KindName(o)+ag5B(' moved ',' اتحرك ')+ag5M(st.v); };
AG5OPS.height=async(st,R)=>{ const o=ag5Need(); if(o.kind!=='rv'||!('h' in o.e))throw ag5Err('height works on R.X walls and columns (a C.X line or a map marker has no height)','الارتفاع للحيطان والأعمدة في R.X (خط C.X أو علامة الخريطة ملهمش ارتفاع)'); if(!(st.v>0))throw ag5Err('height must be more than 0','الارتفاع لازم يكون أكبر من صفر');
 await ag5Point(ag5Where(o),R); await ag5Tx(()=>{ rvPush(); o.e.h=+st.v.toFixed(3); rvChanged(); }); return ag5KindName(o)+ag5B(' height ',' ارتفاعها ')+ag5M(st.v); };
const ag5Hav=(p,q)=>{ const R=6371008.8, t=Math.PI/180, a=Math.sin((q[0]-p[0])*t/2)**2+Math.cos(p[0]*t)*Math.cos(q[0]*t)*Math.sin((q[1]-p[1])*t/2)**2; return 2*R*Math.asin(Math.min(1,Math.sqrt(a))); };
AG5OPS.measure=async(st,R)=>{ const o=ag5Obj();
 if(!o){ const tab=ag5TabNow(); if(tab==='gis'&&typeof gmTool==='function'){ await ag5Point(GM.cv,R); gmTool('measure'); gmDraw(); return ag5B('Map measure tool on: click the points','أداة القياس شغالة: اضغط على النقط'); }
  if(typeof CS!=='undefined'&&CS.open&&XC.c_dim){ XC.c_dim.run(); return ag5B('C.X dimension tool on','أداة الأبعاد في C.X شغالة'); } if(XC.m_dist){ await ag5Point(xaBtn('m_dist'),R); XC.m_dist.run(); return ag5B('Distance tool on: pick two points','أداة المسافة شغالة: اختار نقطتين'); } throw ag5Err('nothing to measure','مفيش حاجة أقيسها'); }
 await ag5Point(ag5Where(o),R);
 if(o.kind==='gis'){ const pts=ag5GisLayer().feat.filter(f=>f.t==='pt'); if(pts.length<2)throw ag5Err('a single map marker has no length: place a second marker, then say "measure"','علامة واحدة ملهاش طول: حط علامة تانية وقول "قيس"'); const a=pts[pts.length-2], b=pts[pts.length-1]; return ag5B('Distance between the last two markers: ','المسافة بين آخر علامتين: ')+ag5M(ag5Hav(a.g,b.g)); }
 const s=ag5Seg(o); if(!s)throw ag5Err('I can measure lines and walls','بقيس الخطوط والحيطان'); const L=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]); AG5.ctx.lastLen=L;
 return ag5KindName(o)+ag5B(': length ',': الطول ')+ag5M(L)+(o.kind==='rv'&&o.e.h?ag5B(', height ','، الارتفاع ')+ag5M(o.e.h):'')+(o.kind==='cad'?ag5B(' (drawing units as metres)',' (وحدات الرسم بالمتر)'):''); };
/* ---------- view ---------- */
AG5OPS.zoom=async(st,R)=>{ const tab=ag5TabNow();
 if(tab==='gis'||(AG5.ctx.tab==='gis'&&ag5MapReady())){ await ag5EnsureMap(R); await ag5Point(GM.cv,R); const z0=GM.z; gmGo(GM.lat,GM.lon,GM.z+st.v); await ag5Until(()=>GM.z!==z0||GM.z>=19||GM.z<=1,2000,'the map did not zoom','الخريطة مازوّمتش',R); return ag5B('Map zoom ','زوم الخريطة ')+GM.z; }
 if(typeof CS!=='undefined'&&CS.open){ const sv=CW.querySelector('svg'); await ag5Point(sv,R); const V=CS.V, k=Math.pow(2,-st.v), cx=V.x+V.w/2, cy=V.y+V.h/2; CS.V={x:cx-V.w*k/2,y:cy-V.h*k/2,w:V.w*k,h:V.h*k}; cadRender(); return ag5B('C.X view width ','عرض منظر C.X ')+ag5M(CS.V.w); }
 const id=st.v>0?'zin':'zout'; if(!XC[id])throw ag5Err('zoom is not available here','الزوم مش متاح هنا'); await ag5Point(xaBtn(id),R); for(let i=0;i<Math.abs(st.v);i++)XC[id].run(); await ag5Sleep(120); return XC[id].t[(typeof lang!=='undefined'&&lang==='ar')?1:0]; };
AG5OPS.zoomsel=async(st,R)=>{ const o=ag5Obj();
 if(o&&o.kind==='gis'){ await ag5EnsureMap(R); await ag5Point(GM.cv,R); gmGo(o.f.g[0],o.f.g[1],Math.max(GM.z,18)); return ag5B('Map centred on the marker','الخريطة اتوسطت على العلامة'); }
 if(o&&o.kind==='cad'){ const b=ebox(o.e), w=Math.max(b[2]-b[0],b[3]-b[1],1)*1.6, cx=(b[0]+b[2])/2, cy=(b[1]+b[3])/2; CS.V={x:cx-w/2,y:cy-w*.31,w,h:w*.62}; cadRender(); await ag5Point(CW.querySelector('svg'),R); return ag5B('C.X zoomed to the line','C.X زوّم على الخط'); }
 if(o&&o.kind==='rv')RV.sel=o.e.id; if(!XC.zsel)throw ag5Err('nothing selected','مفيش حاجة متحددة'); await ag5Point(xaBtn('zsel'),R); XC.zsel.run(); await ag5Sleep(120); return XC.zsel.t[(typeof lang!=='undefined'&&lang==='ar')?1:0]; };
