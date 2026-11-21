/* ====== MEP design sheets, chunk 6/7 (md_route.js): simple MEP ROUTES as R.X geometry, and a wrapper around the N.X clash detective (nv_clash is not edited).
   Three new R.X element kinds registered through the existing hooks (RVX.name / RVX.build / RVX.two / RVX.chain / RVX.fields, same as beams): 'duct' (rectangular w x h, or round d), 'pipe' (round d + insulation ins), 'tray' (cable tray w x h).
   An element is a polyline: e.pts = [[x, z, y], ...] (plan x, plan z, centre-line elevation y in metres ABOVE its level) with size, system code e.sys and level e.lv; two-click elements (the R.X chain tool) carry e.a, e.b and one elevation e.y.
   Each segment becomes one box / cylinder mesh with userData.rv = element id, so N.X item lists and nv_clash see them exactly like beams and walls (category 'R.X duct' / 'R.X pipe' / 'R.X tray'; same-category pairs are ignored by the clash rules).
   Clash boxes are axis-aligned world boxes of each mesh (a sloped or diagonal run reports its box, not its true surface: stated in the note). Pure geometry (segBox, structBox, clashLocal, demoPlan) has no DOM and is tested in node.
   Nothing runs at load except the registration of the three kinds (when RVX exists). Not a design approval: routes are demonstration geometry. ====== */
(function(M){
const RT={}, KINDS=['duct','pipe','tray'], STRUCT=['wall','col','beam','floor','fslab','found','roof','stair','ramp'];
RT.KINDS=KINDS; RT.STRUCT=STRUCT;
const COL={SA:0x4aa3df,RA:0x7fb3d5,EA:0x9e9e9e,CHW:0x1e88e5,CW:0x2e7d32,HW:0xe53935,DR:0x6d4c41,SW:0x795548,FF:0xc62828,RW:0x00897b,TR:0xf9a825};
RT.color=e=>COL[String(e.sys||'').toUpperCase()]||(e.k==='tray'?COL.TR:e.k==='pipe'?0x607d8b:0x90a4ae);
RT.size=e=>{ if(e.k==='pipe'){ const d=(+e.d||.05)+2*(+e.ins||0); return {w:d,h:d,round:true}; } if(e.k==='duct'&&+e.d>0)return {w:+e.d,h:+e.d,round:true}; return {w:+e.w||.3,h:+e.h||.2,round:false}; };
RT.pts=e=>Array.isArray(e.pts)&&e.pts.length>=2?e.pts:(e.a&&e.b?[[e.a[0],e.a[1],+e.y||0],[e.b[0],e.b[1],e.y1==null?(+e.y||0):+e.y1]]:[]);
RT.length=e=>{ const p=RT.pts(e); let L=0; for(let i=0;i+1<p.length;i++)L+=Math.hypot(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1],p[i+1][2]-p[i][2]); return L; };
RT.valid=function(o){ const err=[]; if(KINDS.indexOf(o.k)<0)err.push('kind must be duct, pipe or tray'); const p=RT.pts(o); if(p.length<2)err.push('at least two points [x,z,y]'); p.forEach((q,i)=>{ if(!Array.isArray(q)||q.length<3||!q.every(v=>isFinite(+v)))err.push('point '+(i+1)+' must be [x,z,y] numbers'); });
 const s=RT.size(o); if(!(s.w>0&&s.h>0))err.push('size must be positive'); return err; };
/* world box of one segment: a, b = [x, z, y(above the level)], base = level elevation. Same oriented-box construction as the mesh, then its axis-aligned box (what Box3.setFromObject returns). */
RT.segBox=function(a,b,size,base){ const A=[a[0],base+a[2],a[1]], B=[b[0],base+b[2],b[1]], d=[B[0]-A[0],B[1]-A[1],B[2]-A[2]], L=Math.hypot(d[0],d[1],d[2]), cx=[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2]; let half;
 if(L<1e-9)half=[size.w/2,size.h/2,size.w/2];
 else if(Math.abs(d[1])>.7*L){ half=[size.w/2,L/2,size.h/2]; if(size.round)half=[size.w/2,L/2,size.w/2]; }
 else { const hd=Math.hypot(d[0],d[2]), u=[d[0]/L,d[1]/L,d[2]/L], n1=[-d[2]/hd,0,d[0]/hd], n2=[u[1]*n1[2]-u[2]*n1[1],u[2]*n1[0]-u[0]*n1[2],u[0]*n1[1]-u[1]*n1[0]];
  half=[0,1,2].map(i=>Math.abs(u[i])*L/2+Math.abs(n2[i])*size.h/2+Math.abs(n1[i])*size.w/2); }
 return {min:[cx[0]-half[0],cx[1]-half[1],cx[2]-half[2]],max:[cx[0]+half[0],cx[1]+half[1],cx[2]+half[2]]}; };
RT.boxes=function(e,base){ const p=RT.pts(e), s=RT.size(e), out=[]; for(let i=0;i+1<p.length;i++)out.push(RT.segBox(p[i],p[i+1],s,base)); return out; };
RT.hseg=(a,b,yc,w,h)=>{ const dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz)||1e-9, ux=dx/L, uz=dz/L, hx=Math.abs(ux)*L/2+Math.abs(uz)*w/2, hz=Math.abs(uz)*L/2+Math.abs(ux)*w/2, cx=(a[0]+b[0])/2, cz=(a[1]+b[1])/2; return {min:[cx-hx,yc-h/2,cz-hz],max:[cx+hx,yc+h/2,cz+hz]}; };
RT.structBox=function(e,base){ if(e.k==='beam')return RT.hseg(e.a,e.b,base+e.top-e.h/2,e.w,e.h);
 if(e.k==='col')return {min:[e.p[0]-e.w/2,base,e.p[1]-e.d/2],max:[e.p[0]+e.w/2,base+e.h,e.p[1]+e.d/2]};
 if(e.k==='floor'){ const x0=Math.min(e.a[0],e.b[0]), x1=Math.max(e.a[0],e.b[0]), z0=Math.min(e.a[1],e.b[1]), z1=Math.max(e.a[1],e.b[1]); return {min:[x0,base-e.t,z0],max:[x1,base,z1]}; }
 if(e.k==='wall')return RT.hseg(e.a,e.b,base+e.h/2,e.t,e.h); return null; };
RT.overlap=function(a,b,tol,type){ const dx=Math.min(a.max[0],b.max[0])-Math.max(a.min[0],b.min[0]), dy=Math.min(a.max[1],b.max[1])-Math.max(a.min[1],b.min[1]), dz=Math.min(a.max[2],b.max[2])-Math.max(a.min[2],b.min[2]);
 if(type==='clearance'){ const gx=Math.max(0,a.min[0]-b.max[0],b.min[0]-a.max[0]), gy=Math.max(0,a.min[1]-b.max[1],b.min[1]-a.max[1]), gz=Math.max(0,a.min[2]-b.max[2],b.min[2]-a.max[2]), g=Math.sqrt(gx*gx+gy*gy+gz*gz); return g<tol?{dist:g}:null; }
 return dx>0&&dy>0&&dz>0&&Math.min(dx,dy,dz)>=tol?{dist:-Math.min(dx,dy,dz)}:null; };
/* local clash (pure): mep = routes, st = structure elements; levels = [{z}] ; returns [{a,b,dist}] one row per pair (deepest segment) */
RT.clashLocal=function(mep,st,levels,o){ o=Object.assign({tol:.01,type:'hard',minSize:.01},o||{}); const lz=i=>(levels[i]||{z:0}).z, res=[];
 mep.forEach(m=>{ const mb=RT.boxes(m,lz(m.lv)); st.forEach(s=>{ const sb=RT.structBox(s,lz(s.lv)); if(!sb)return; let best=null; mb.forEach(b=>{ const r=RT.overlap(b,sb,Math.max(o.tol,o.type==='hard'?o.minSize:0),o.type); if(r&&(!best||r.dist<best.dist))best=r; }); if(best)res.push({a:m.id,b:s.id,dist:best.dist}); }); }); return res; };
/* demo layout (pure). frame = {x0,z0,x1,z1,H (storey height), slab (thickness), lv, beams:[{a,b,top,h,w}]} ; o.clash lifts the main duct and the cold-water pipe into the beam depth */
RT.demoPlan=function(fr,o){ o=Object.assign({clash:true},o||{}); const W=fr.x1-fr.x0, D=fr.z1-fr.z0, zm=(fr.z0+fr.z1)/2, soff=fr.H-fr.slab, bsoff=fr.beams&&fr.beams.length?Math.min(...fr.beams.map(b=>b.top-b.h)):soff-.3;
 const ye=Math.min(soff-.2,bsoff-.15)-.125, lift=o.clash&&fr.beams&&fr.beams.length?bsoff+.05:null, ySA=lift!=null?lift+.125:ye, yCW=lift!=null?lift+.05:ye-.05, xa=fr.x0+W*.3, xb=fr.x0+W*.7, lv=fr.lv||0, L=[];
 L.push({k:'duct',sys:'SA',w:.5,h:.25,lv,pts:[[fr.x0+.6,zm,ySA],[xa,zm,ySA],[xa,fr.z0+1.2,ySA]],name:'Supply air main and branch A'});
 L.push({k:'duct',sys:'SA',w:.4,h:.25,lv,pts:[[xa,zm,ySA],[xb,zm,ySA],[xb,fr.z1-1.2,ySA]],name:'Supply air branch B'});
 L.push({k:'duct',sys:'EA',d:.2,lv,pts:[[fr.x0+.6,fr.z1-.5,ye],[fr.x0+Math.min(5,W/2),fr.z1-.5,ye]],name:'Bathroom extract (round)'});
 L.push({k:'pipe',sys:'CW',d:.063,ins:0,lv,pts:[[fr.x0+.4,fr.z0+.3,yCW],[fr.x1-.4,fr.z0+.3,yCW]],name:'Cold water main'});
 L.push({k:'pipe',sys:'HW',d:.04,ins:.02,lv,pts:[[fr.x0+.4,fr.z0+.55,ye-.05],[fr.x1-.4,fr.z0+.55,ye-.05]],name:'Hot water main (insulated)'});
 L.push({k:'pipe',sys:'FF',d:.05,lv,pts:[[fr.x0+.4,fr.z1-.3,ye-.1],[fr.x1-.4,fr.z1-.3,ye-.1]],name:'Fire-fighting main'});
 L.push({k:'tray',sys:'TR',w:.3,h:.06,lv,pts:[[fr.x0+.6,zm+.8,ye],[fr.x1-.6,zm+.8,ye]],name:'Cable tray'});
 const Ld=Math.min(12,W-1.5); L.push({k:'pipe',sys:'DR',d:.11,lv,pts:[[fr.x0+1,fr.z0+1.5,-.25],[fr.x0+1+Ld,fr.z0+1.5,-.25-.02*Ld]],name:'Drain 2 % fall'});
 return L; };
M.RT=RT;

/* ====================== R.X integration (only when the host app is there) ====================== */
if(typeof RVX!=='undefined'){ try{
 const nm={duct:['Duct','دكت'],pipe:['Pipe','ماسورة'],tray:['Cable tray','مجرى كابلات']}, def={duct:{w:.4,h:.25,d:0,y:2.4,sys:'SA'},pipe:{d:.05,ins:0,y:2.4,sys:'CW'},tray:{w:.3,h:.06,y:2.4,sys:'TR'}};
 const fields={duct:[['w','Width m','العرض م'],['h','Height m','الارتفاع م'],['d','Round diameter m (0 = rectangular)','قطر دائري م (0 = مستطيل)'],['y','Centre-line above level m','المحور فوق المستوى م'],['sys','System code','كود النظام','text']],pipe:[['d','Outside diameter m','القطر الخارجي م'],['ins','Insulation thickness m','سمك العزل م'],['y','Centre-line above level m','المحور فوق المستوى م'],['sys','System code','كود النظام','text']],tray:[['w','Width m','العرض م'],['h','Height m','الارتفاع م'],['y','Centre-line above level m','المحور فوق المستوى م'],['sys','System code','كود النظام','text']]};
 const msg={duct:['Duct: click start and end (elevation from the defaults). Esc ends.','دكت: اضغط البداية والنهاية. Esc للإنهاء.'],pipe:['Pipe: click start and end. Esc ends.','ماسورة: اضغط البداية والنهاية. Esc للإنهاء.'],tray:['Cable tray: click start and end. Esc ends.','مجرى كابلات: اضغط البداية والنهاية. Esc للإنهاء.']};
 const mat=(c,hi)=>new T.MeshStandardMaterial({color:hi?0xf6d58a:c,roughness:.7,transparent:true,opacity:hi?1:.9});
 const build=(e,y,hi)=>{ const g=new T.Group(), p=RT.pts(e), s=RT.size(e), c=RT.color(e); for(let i=0;i+1<p.length;i++){ const a=p[i], b=p[i+1], A=new T.Vector3(a[0],y+a[2],a[1]), B=new T.Vector3(b[0],y+b[2],b[1]), d=B.clone().sub(A), L=d.length(); if(L<1e-6)continue; const vert=Math.abs(d.y)>.7*L; let geo;
   if(s.round){ geo=new T.CylinderGeometry(s.w/2,s.w/2,L,16); if(!vert)geo.rotateZ(Math.PI/2); } else geo=vert?new T.BoxGeometry(s.w,L,s.h):new T.BoxGeometry(L,s.h,s.w);
   const m=new T.Mesh(geo,mat(c,hi)); m.position.copy(A.clone().add(B).multiplyScalar(.5)); if(!vert){ const hd=Math.hypot(d.x,d.z), qy=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-Math.atan2(d.z,d.x)), qz=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.atan2(d.y,hd)); m.quaternion.copy(qy.multiply(qz)); } g.add(m); } return g; };
 KINDS.forEach(k=>{ RVX.name[k]=nm[k]; RVX.build[k]=build; RVX.def[k]=def[k]; RVX.fields[k]=fields[k]; RVX.msg[k]=msg[k]; RVX.chain[k]=1; RVX.two[k]=(a,b)=>Object.assign({a,b},def[k]); });
 }catch(x){ try{ console.warn('md_route: R.X registration failed',x); }catch(e){} } }
/* ---- API on the live model ---- */
RT.model=()=>{ if(typeof RV==='undefined')throw new Error('R.X model is not available'); return RV; };
RT.levelZ=lv=>{ const r=RT.model(); return (r.levels[lv]||{z:0}).z; };
RT.add=function(o){ const r=RT.model(), err=RT.valid(o); if(err.length)throw new Error(err.join('; ')); const p=RT.pts(o).map(q=>[+q[0],+q[1],+q[2]]), id=(typeof rvId==='function'?rvId():Math.random().toString(36).slice(2,9));
 const e=Object.assign({id,k:o.k,lv:o.lv||0,a:[p[0][0],p[0][1]],b:[p[p.length-1][0],p[p.length-1][1]],pts:p,sys:String(o.sys||''),mep:1},o.k==='duct'?{w:+o.w||0,h:+o.h||0,d:+o.d||0}:o.k==='pipe'?{d:+o.d||.05,ins:+o.ins||0}:{w:+o.w||.3,h:+o.h||.06},o.name?{name:String(o.name)}:{});
 r.els.push(e); if(!o.defer&&typeof rvChanged==='function')rvChanged(); return e; };
RT.list=()=>RT.model().els.filter(e=>KINDS.indexOf(e.k)>=0);
RT.clear=function(){ const r=RT.model(), n=r.els.length; r.els=r.els.filter(e=>KINDS.indexOf(e.k)<0); if(typeof rvChanged==='function'&&n!==r.els.length)rvChanged(); return n-r.els.length; };
RT.frame=function(){ const r=RT.model(), ws=r.els.filter(e=>e.k==='wall'&&e.a&&e.b), all=ws.length?ws:r.els.filter(e=>e.a&&e.b&&KINDS.indexOf(e.k)<0); let x0=0,z0=0,x1=12,z1=10; if(all.length){ x0=Infinity; z0=Infinity; x1=-Infinity; z1=-Infinity; all.forEach(e=>{ [e.a,e.b].forEach(q=>{ x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); z0=Math.min(z0,q[1]); z1=Math.max(z1,q[1]); }); }); }
 const z1l=(r.levels[1]||{z:3}).z-(r.levels[0]||{z:0}).z, floors=r.els.filter(e=>e.k==='floor'&&(e.lv||0)>=1).map(e=>e.t), slab=floors.length?Math.max(...floors):.2, beams=r.els.filter(e=>e.k==='beam'&&(e.lv||0)===0).map(e=>({a:e.a,b:e.b,top:e.top,h:e.h,w:e.w}));
 return {x0,z0,x1,z1,H:z1l>0?z1l:3,slab,beams,lv:0}; };
RT.demo=function(o){ o=Object.assign({clash:true,clear:true},o||{}); if(o.clear)RT.clear(); const fr=RT.frame(), plan=RT.demoPlan(fr,o), ids=[]; plan.forEach(s=>{ ids.push(RT.add(Object.assign({defer:true},s)).id); }); if(typeof rvChanged==='function')rvChanged(); return {ids,count:ids.length,frame:fr,beams:fr.beams.length,note:fr.beams.length?'Main duct and cold-water pipe were placed inside the beam depth on purpose, so the clash test finds them.':'No beams in the model: routes are clean. Add beams (R.X Beam) and run the demo again to see real clashes.'}; };
/* ---- clash: wraps nv_clash (tests are stored in the N.X data, so they survive and show in the Clash Detective) ---- */
RT.clash=function(o){ if(typeof nvCl!=='function'||typeof nvClashRun!=='function')throw new Error('N.X clash detective is not available'); o=Object.assign({tol:.01,clearance:.05},o||{}); const c=nvCl(), its=nvItems().filter(i=>i.t==='rv');
 const mep=its.filter(i=>KINDS.indexOf(i.kind)>=0).map(i=>i.key), st=its.filter(i=>STRUCT.indexOf(i.kind)>=0).map(i=>i.key);
 const get=(name,a,b,type,tol)=>{ let t=c.tests.find(x=>x.name===name); if(!t){ t={id:'mep'+name.length+Date.now().toString(36),name,a:'all',b:'all',type,tol,results:[]}; c.tests.push(t); } t.a='sel:'+a.join(','); t.b='sel:'+b.join(','); t.type=type; t.tol=tol; return t; };
 const out={mep:mep.length,structure:st.length}; if(!mep.length||!st.length){ out.hard=0; out.clearance=0; out.mepMep=0; out.results=[]; return out; }
 const th=get('MEP vs structure (hard)',mep,st,'hard',o.tol), tc=get('MEP vs structure (clearance)',mep,st,'clearance',o.clearance), tm=get('MEP vs MEP (hard)',mep,mep,'hard',o.tol);
 [th,tc,tm].forEach(t=>nvClashRun(t)); out.hard=th.count; out.clearance=tc.count; out.mepMep=tm.count; out.results=th.results.map(r=>({id:r.id,name:r.name,status:r.status,a:r.aN,b:r.bN,depth:-r.dist,pt:r.pt})); out.note='Clash boxes are axis-aligned world boxes: a diagonal run reports its box, not its true surface.'; return out; };
})(MEP);
