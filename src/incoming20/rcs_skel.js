/* rcs_skel.js - RC skeleton generator for R.X (prefix rcsk / RCSKEL). Chain position: AFTER c_templates.js and the rvx_* chunks (end of chain, before rcs_rebar.js).
   Part 1 (between the PURE markers) has NO browser dependency: it is loaded unchanged by the node tests. Part 2 wires it into R.X: command rcs_skeleton,
   template house_rc, ribbon entries, Properties note. Lazy: nothing heavy runs at page start (only function / command registration).
   ALL sizes, loads and grades here are PRELIMINARY rule-of-thumb DEMONSTRATION values (not design approval, not a code check).
   Levels (R.X): 0 'Foundation top' (neck columns and footings, footing top = this level), 1 'Ground floor' (z=0, top of slab on grade),
   2.. top of each suspended slab, last = 'Roof'. A R.X 'floor' hangs BELOW its level (top flush with the level), a 'beam' with top=0 hangs below the level too.
   Extra element fields written here: src:'rcs', rc:<class>, mk:<mark>; footings carry ztop (top of footing relative to its level, wrapper of RVX.build.found below). */
/*@@RCSK_PURE_BEGIN*/
const RCSKEL=(function(){
const r4=x=>Math.round(x*1e4)/1e4, EPS=1e-9;
const ceilTo=(x,s)=>r4(Math.ceil(x/s-1e-9)*s), floorTo=(x,s)=>r4(Math.floor(x/s+1e-9)*s);
const DEF={
  bx:[4,4,4], bz:[5,5],            /* bay widths along X and along Z (m, centre to centre of grid lines) */
  storeys:2, hs:3.0,               /* number of storeys, storey height floor level to floor level (m) */
  foundZ:-1.0,                     /* top of footings / bottom of neck columns, relative to the ground floor level (m) */
  found:'isolated',                /* 'isolated' (pads + tie beams) | 'strip' (continuous strips under every grid line) */
  fcu:25, fy:360,                  /* concrete cube strength MPa (assumed), steel yield MPa (assumed) */
  qa:150,                          /* allowable soil bearing kPa (ASSUMED: replace with the soil report) */
  g:[7.5,6.5], q:[2.0,1.0],        /* [floor, roof] dead (incl. finishes + wall allowance) and live loads kN/m2 (ASSUMED, rule of thumb) */
  colCf:0.40, colB:0.25, colMinH:0.40,   /* Ac = Nu / (colCf x fcu); short side = wall thickness; practical minimum long side */
  beamW:0.25, beamMinH:0.40,       /* beam width, practical minimum depth; depth = span/12 rounded up to 5 cm */
  tieTop:-0.15, tieMinH:0.40,      /* tie beam top below the ground floor level (= bottom of the slab on grade); depth = span/10 */
  sogT:0.15,                       /* slab on grade thickness */
  slabMinT:0.12,                   /* minimum slab thickness; t = short span / 35 (two-way) or / 30 (one-way), rounded up to 1 cm */
  footMin:1.0, footMinT:0.40,      /* minimum footing side and thickness */
  wallExt:0.25, wallInt:0.12, parapet:1.0,
  stair:[0,1], stairW:1.2, maxR:0.175, roofStair:false,   /* stair in grid cell [ix,iz] (null = none); straight flight along +Z */
  openings:true, rooms:true,
  open:[['V',1,0,1]]               /* interior wall segments left open: ['V',lineIndex,cellRow,storey] = wall along Z; ['H',lineIndex,cellCol,storey] = wall along X */
};
/* ---- geometry helpers ---- */
function rectMinus(R,O){            /* R, O = [x0,z0,x1,z1]; rectangles that cover R minus O (no overlap between them) */
  const ix0=Math.max(R[0],O[0]), iz0=Math.max(R[1],O[1]), ix1=Math.min(R[2],O[2]), iz1=Math.min(R[3],O[3]);
  if(ix1<=ix0+EPS||iz1<=iz0+EPS)return [R.slice()];
  const o=[]; if(iz0>R[1]+EPS)o.push([R[0],R[1],R[2],iz0]); if(iz1<R[3]-EPS)o.push([R[0],iz1,R[2],R[3]]);
  if(ix0>R[0]+EPS)o.push([R[0],iz0,ix0,iz1]); if(ix1<R[2]-EPS)o.push([ix1,iz0,R[2],iz1]); return o.map(q=>q.map(r4));
}
function boxOf(e,L){
  const z=L[e.lv]?L[e.lv].z:0;
  if(e.k==='col')return {x0:e.p[0]-e.w/2,x1:e.p[0]+e.w/2,z0:e.p[1]-e.d/2,z1:e.p[1]+e.d/2,y0:z,y1:z+e.h};
  if(e.k==='wall'||e.k==='beam'){
    const t=e.k==='wall'?e.t:e.w, dx=e.b[0]-e.a[0], dz=e.b[1]-e.a[1]; let b;
    if(Math.abs(dz)<1e-9)b={x0:Math.min(e.a[0],e.b[0]),x1:Math.max(e.a[0],e.b[0]),z0:e.a[1]-t/2,z1:e.a[1]+t/2};
    else if(Math.abs(dx)<1e-9)b={x0:e.a[0]-t/2,x1:e.a[0]+t/2,z0:Math.min(e.a[1],e.b[1]),z1:Math.max(e.a[1],e.b[1])}; else return null;
    if(e.k==='wall'){ b.y0=z; b.y1=z+e.h; } else { b.y0=z+e.top-e.h; b.y1=z+e.top; } return b;
  }
  if(e.k==='floor')return {x0:Math.min(e.a[0],e.b[0]),x1:Math.max(e.a[0],e.b[0]),z0:Math.min(e.a[1],e.b[1]),z1:Math.max(e.a[1],e.b[1]),y0:z-e.t,y1:z};
  if(e.k==='fslab'){ const top=z-0.2; return {x0:Math.min(e.a[0],e.b[0]),x1:Math.max(e.a[0],e.b[0]),z0:Math.min(e.a[1],e.b[1]),z1:Math.max(e.a[1],e.b[1]),y0:top-e.t,y1:top}; }
  if(e.k==='found'){ const top=z+(e.ztop!=null?e.ztop:-0.2); return {x0:e.p[0]-e.w/2,x1:e.p[0]+e.w/2,z0:e.p[1]-e.d/2,z1:e.p[1]+e.d/2,y0:top-e.t,y1:top}; }
  if(e.k==='stair'){ const dx=e.b[0]-e.a[0], dz=e.b[1]-e.a[1], Ln=Math.hypot(dx,dz)||1, nx=-dz/Ln*e.w/2, nz=dx/Ln*e.w/2, xs=[e.a[0]+nx,e.a[0]-nx,e.b[0]+nx,e.b[0]-nx], zs=[e.a[1]+nz,e.a[1]-nz,e.b[1]+nz,e.b[1]-nz];
    return {x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs),y0:z,y1:z+e.H}; }
  return null;
}
const ovol=(A,B)=>Math.max(0,Math.min(A.x1,B.x1)-Math.max(A.x0,B.x0))*Math.max(0,Math.min(A.z1,B.z1)-Math.max(A.z0,B.z0))*Math.max(0,Math.min(A.y1,B.y1)-Math.max(A.y0,B.y0));
const oarea=(A,B)=>Math.max(0,Math.min(A.x1,B.x1)-Math.max(A.x0,B.x0))*Math.max(0,Math.min(A.z1,B.z1)-Math.max(A.z0,B.z0));
/* ---- preliminary sizing rules (each is labelled in the UI; see RULES) ---- */
const beamDepth=(L,P)=>Math.max(P.beamMinH,ceilTo(L/12,0.05));
const tieDepth=(L,P)=>Math.max(P.tieMinH,ceilTo(L/10,0.05));
const slabThk=(Ls,Ll,P)=>{ const one=Ll/Ls>=2-1e-9; return {one,t:Ls/(one?30:35)}; };
const RULES=[
 {id:'slab',en:'RULE OF THUMB slab: t = short span / 35 (two-way, ratio < 2) or / 30 (one-way, ratio >= 2), min 12 cm, rounded up to 1 cm',ar:'قاعدة مبدئية للبلاطة: السمك = البحر القصير / 35 (اتجاهين) أو / 30 (اتجاه واحد)، أدنى 12 سم'},
 {id:'beam',en:'RULE OF THUMB beam: depth = span / 12 (tie beam: span / 10) rounded up to 5 cm, width 25 cm, min depth 40 cm',ar:'قاعدة مبدئية للكمرة: العمق = البحر / 12 (السملة: / 10)، العرض 25 سم'},
 {id:'col',en:'RULE OF THUMB column: Ac = Nu / (0.40 x fcu) with Nu from a tributary-area take-down (1.4 D + 1.6 L); short side 25 cm (= wall thickness), long side >= 40 cm',ar:'قاعدة مبدئية للعمود: المساحة = الحمل التصميمي / (0.40 × fcu) من تحميل المساحة المؤثرة'},
 {id:'foot',en:'RULE OF THUMB footing: area = 1.1 x service load / allowable bearing (assumed 150 kPa), side rounded up to 10 cm, min 1.0 m; t = cantilever / 1.5, min 40 cm',ar:'قاعدة مبدئية للقاعدة: المساحة = 1.1 × الحمل / تحمل التربة (مفترض 150 ك.ن/م²)'},
 {id:'wall',en:'Walls: 25 cm external, 12 cm internal, built BETWEEN column faces on the grid lines; top = soffit of the beam above (wall height = storey height - beam depth)',ar:'الحوائط: 25 سم خارجية و12 سم داخلية، بين وجوه الأعمدة، قمتها عند أسفل الكمرة'},
 {id:'note',en:'All values are demonstration values from rules of thumb. They are NOT a structural design and NOT approved. Loads, soil and grades are assumptions.',ar:'كل القيم تجريبية من قواعد مبدئية. مش تصميم إنشائي ومش معتمدة. الأحمال والتربة والرتب افتراضية.'}
];
const ORD=['Ground','First','Second','Third','Fourth','Fifth'];
/* ---- the generator ---- */
function plan(po,opt){
  const P=Object.assign({},DEF,po||{}), err=m=>{ throw new Error('rc skeleton: '+m); };
  ['bx','bz','g','q'].forEach(k=>{ if(!Array.isArray(P[k]))err(k+' must be an array'); P[k]=P[k].map(Number); });
  P.open=(Array.isArray(P.open)?P.open:[]).map(a=>a.slice());
  if(!P.bx.length||!P.bz.length||P.bx.length>8||P.bz.length>8)err('1 to 8 bays in each direction');
  [...P.bx,...P.bz].forEach(v=>{ if(!isFinite(v)||v<1.5||v>9)err('bay widths must be between 1.5 and 9 m'); });
  const N=Math.round(P.storeys), hs=+P.hs; if(!(N>=1&&N<=5))err('storeys 1 to 5'); if(!(hs>=2.4&&hs<=5))err('storey height 2.4 to 5 m');
  if(P.found!=='isolated'&&P.found!=='strip')err("foundation must be 'isolated' or 'strip'");
  if(!(P.qa>20&&P.fcu>10&&P.fy>200))err('bearing, fcu and fy must be positive and realistic');
  let cnt=0; const idg=(opt&&opt.id)||(()=>'rc'+(++cnt));
  const nx=P.bx.length, nz=P.bz.length, X=[0], Z=[0];
  P.bx.forEach(v=>X.push(r4(X[X.length-1]+v))); P.bz.forEach(v=>Z.push(r4(Z[Z.length-1]+v)));
  const Xn=X[nx], Zn=Z[nz];
  const levels=[{n:'Foundation top',z:r4(P.foundZ)},{n:'Ground floor',z:0}];
  for(let k=1;k<=N;k++)levels.push({n:k===N?'Roof':(ORD[k]||('Floor '+k))+' floor',z:r4(k*hs)});
  const lz=i=>levels[i].z, warn=[];
  const els=[], steps=[]; let cur=null;
  const step=(key,en,ar)=>{ cur={key,en,ar,ids:[]}; steps.push(cur); };
  const mk=(k,lv,o)=>{ const e=Object.assign({id:idg(),k,lv,src:'rcs'},o); els.push(e); if(cur)cur.ids.push(e.id); return e; };
  const markers={}; const mark=(pre,sig)=>{ const m=markers[pre]||(markers[pre]={}); if(!(sig in m))m[sig]=pre+(Object.keys(m).length+1); return m[sig]; };
  /* ---- loads and take-down (tributary areas, per node) ---- */
  const wS=k=>k<N?P.g[0]+P.q[0]:P.g[1]+P.q[1], wU=k=>k<N?1.4*P.g[0]+1.6*P.q[0]:1.4*P.g[1]+1.6*P.q[1];
  const node=(i,j)=>{ const tx=(i>0?P.bx[i-1]/2:0)+(i<nx?P.bx[i]/2:0), tz=(j>0?P.bz[j-1]/2:0)+(j<nz?P.bz[j]/2:0), trib=tx*tz;
    let Ns=0,Nu1=0; for(let k=1;k<=N;k++){ Ns+=trib*wS(k); Nu1+=trib*wU(k); }
    return {i,j,x:X[i],z:Z[j],trib:r4(trib),Ns:r4(Ns),Nu:r4(Nu1)}; };
  const nodes=[]; for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)nodes.push(node(i,j));
  const colB=P.colB; let colH=P.colMinH; nodes.forEach(n=>{ colH=Math.max(colH,ceilTo(n.Nu/(P.colCf*P.fcu*1000)/colB,0.05)); });
  const ori=(i,j)=>(j===0||j===nz)?'X':(i===0||i===nx)?'Z':'X';
  const cdim=(i,j)=>ori(i,j)==='X'?{w:colH,d:colB}:{w:colB,d:colH};
  nodes.forEach(n=>{ const c=cdim(n.i,n.j); n.w=c.w; n.d=c.d; n.ori=ori(n.i,n.j);
    n.B=Math.max(P.footMin,ceilTo(Math.sqrt(1.1*n.Ns/P.qa),0.1)); const cant=(n.B-Math.max(c.w,c.d))/2; n.tf=Math.max(P.footMinT,ceilTo(cant/1.5,0.05)); });
  const nd=(i,j)=>nodes[j*(nx+1)+i];
  /* slab thickness: one value for all panels, governed by the worst panel */
  let tReq=P.slabMinT, anyOne=false; const cells=[];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){ const Ls=Math.min(P.bx[i],P.bz[j]), Ll=Math.max(P.bx[i],P.bz[j]), s=slabThk(Ls,Ll,P); cells.push({i,j,Ls,Ll,one:s.one,rect:[X[i],Z[j],X[i+1],Z[j+1]]}); tReq=Math.max(tReq,s.t); if(s.one)anyOne=true; }
  const tSlab=ceilTo(tReq,0.01);
  /* ---- 1 grids ---- */
  step('grid','Grid lines','خطوط الشبكة');
  const grids=[]; const gl=(hz,n,v,x0,x1)=>grids.push({id:idg(),a:hz?[x0,v]:[v,x0],b:hz?[x1,v]:[v,x1],hz,n});
  for(let j=0;j<=nz;j++)gl(true,String.fromCharCode(65+j),Z[j],-1,Xn+1); for(let i=0;i<=nx;i++)gl(false,String(i+1),X[i],-1,Zn+1);
  cur.ids=grids.map(g=>g.id);
  /* ---- 2 footings ---- */
  step('footings',P.found==='strip'?'Strip footings':'Isolated footings','القواعد');
  let stripB=0, stripT=0;
  if(P.found==='isolated'){
    nodes.forEach(n=>mk('found',0,{p:[n.x,n.z],w:n.B,d:n.B,t:n.tf,ztop:0,rc:'footing',mk:mark('F',n.B+'x'+n.tf),Ns:n.Ns}));
    let gap=1e9; for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++){ const A=nodes[a],B=nodes[b], gx=Math.abs(A.x-B.x)-(A.B+B.B)/2, gz=Math.abs(A.z-B.z)-(A.B+B.B)/2; gap=Math.min(gap,Math.max(gx,gz)); }
    if(gap<0.3)warn.push('footing clear gap '+r4(gap)+' m < 0.3 m: consider strip footings or a raft');
  } else {
    let Lt=0; for(let j=0;j<=nz;j++)Lt+=Xn; for(let i=0;i<=nx;i++)Lt+=Zn;
    let Ns=0; nodes.forEach(n=>{ Ns+=n.Ns; }); stripB=Math.max(0.8,ceilTo(1.1*Ns/(P.qa*Lt),0.1)); stripT=Math.max(P.footMinT,ceilTo((stripB-colB)/2/1.5,0.05));
    const m=mark('FS','strip'+stripB+'x'+stripT);
    for(let j=0;j<=nz;j++)mk('found',0,{p:[Xn/2,Z[j]],w:r4(Xn+stripB),d:stripB,t:stripT,ztop:0,rc:'footing',mk:m,strip:'X'});
    for(let i=0;i<=nx;i++)for(let j=0;j<nz;j++)mk('found',0,{p:[X[i],r4((Z[j]+Z[j+1])/2)],w:stripB,d:r4(P.bz[j]-stripB),t:stripT,ztop:0,rc:'footing',mk:m,strip:'Z'});
  }
  /* ---- 3 neck columns (footing top to ground floor) ---- */
  step('necks','Neck columns','رقاب الأعمدة');
  const neckH=r4(0-lz(0));
  nodes.forEach(n=>mk('col',0,{p:[n.x,n.z],w:n.w,d:n.d,h:neckH,rc:'neck',mk:mark('NC',n.w+'x'+n.d),node:[n.i,n.j]}));
  /* ---- 4 tie beams (isolated footings only) ---- */
  step('ties','Tie beams','السملات');
  const segs=[]; for(let j=0;j<=nz;j++)for(let i=0;i<nx;i++)segs.push({dir:'X',i,j,a:[X[i],Z[j]],b:[X[i+1],Z[j]],L:P.bx[i]});
  for(let i=0;i<=nx;i++)for(let j=0;j<nz;j++)segs.push({dir:'Z',i,j,a:[X[i],Z[j]],b:[X[i],Z[j+1]],L:P.bz[j]});
  if(P.found==='isolated')segs.forEach(s=>{ const h=tieDepth(s.L,P); mk('beam',1,{a:s.a,b:s.b,w:P.beamW,h,top:r4(P.tieTop),rc:'tie',mk:mark('TB',P.beamW+'x'+h+'L'+s.L)}); });
  /* ---- 5 slab on grade ---- */
  step('sog','Slab on grade','أرضية على التربة');
  mk('floor',1,{a:[-P.beamW/2,-P.beamW/2],b:[r4(Xn+P.beamW/2),r4(Zn+P.beamW/2)],t:P.sogT,rc:'sog',mk:'SOG'});
  /* ---- stair geometry (needs the slab thickness) ---- */
  let stair=null;
  if(P.stair&&Array.isArray(P.stair)&&P.stair[0]>=0&&P.stair[0]<nx&&P.stair[1]>=0&&P.stair[1]<nz&&N>=1){
    const [si,sj]=P.stair, w=+P.stairW, x0=X[si], a=[r4(x0+0.2+w/2),r4(Z[sj]+0.25)], b=[a[0],r4(Z[sj+1]-0.25)], Ln=b[1]-a[1];
    if(Ln>2&&P.bx[si]>=0.2+w+0.2){
      const n=Math.ceil(hs/P.maxR-1e-9), sMin=Math.max(0,(hs-tSlab-2.1)/hs*Ln), zo=floorTo(a[1]+sMin,0.05), xo=ceilTo(a[0]+w/2+0.1,0.05);
      stair={cell:[si,sj],a,b,w,H:hs,n,tread:r4(Ln/n),riser:r4(hs/n),open:[x0,zo,Math.min(xo,X[si+1]),Z[sj+1]]};
    } else warn.push('stair cell too small: stair skipped');
  }
  const openings=[]; const stairFlights=stair?(P.roofStair?N:N-1):0;
  /* ---- per storey: columns, beams, slab at the top of the storey, then walls ---- */
  const wallsBy={};
  for(let s=1;s<=N;s++){
    step('cols'+s,'Columns, storey '+s,'أعمدة الدور '+s);
    nodes.forEach(n=>mk('col',s,{p:[n.x,n.z],w:n.w,d:n.d,h:hs,rc:'column',mk:mark('C',n.w+'x'+n.d),node:[n.i,n.j],st:s}));
    const lv=s+1; step('beams'+lv,'Beams, level '+lv,'كمرات المستوى '+lv);
    segs.forEach(sg=>{ const h=beamDepth(sg.L,P); mk('beam',lv,{a:sg.a,b:sg.b,w:P.beamW,h,top:0,rc:'beam',mk:mark('B',P.beamW+'x'+h+'L'+sg.L)}); });
    step('slab'+lv,s===N?'Roof slab':'Floor slab, level '+lv,s===N?'بلاطة السقف':'بلاطة المستوى '+lv);
    const hole=(stair&&s<=stairFlights)?stair.open:null; if(hole)openings.push({lv,rect:hole.slice()});
    cells.forEach(c=>{ const pieces=(hole&&c.i===stair.cell[0]&&c.j===stair.cell[1])?rectMinus(c.rect,hole):[c.rect];
      pieces.forEach(r=>mk('floor',lv,{a:[r[0],r[1]],b:[r[2],r[3]],t:tSlab,rc:'slab',mk:mark('S',c.Ls+'x'+c.Ll),way:c.one?'one':'two',panel:'P'+(c.i+1)+'-'+(c.j+1),Ls:c.Ls,op:hole?hole.slice():null})); });
    /* walls of storey s: between column faces, top at the beam soffit above */
    step('walls'+s,'Walls, storey '+s,'حوائط الدور '+s);
    const ws=[]; wallsBy[s]=ws;
    const isOpen=(type,idx,cell)=>P.open.some(o=>o[0]===type&&o[1]===idx&&o[2]===cell&&o[3]===s);
    segs.forEach(sg=>{
      let a,b,ext,openSeg=false;
      if(sg.dir==='X'){ ext=sg.j===0||sg.j===nz; a=[r4(sg.a[0]+nd(sg.i,sg.j).w/2),sg.a[1]]; b=[r4(sg.b[0]-nd(sg.i+1,sg.j).w/2),sg.b[1]]; if(!ext)openSeg=isOpen('H',sg.j,sg.i); }
      else { ext=sg.i===0||sg.i===nx; a=[sg.a[0],r4(sg.a[1]+nd(sg.i,sg.j).d/2)]; b=[sg.b[0],r4(sg.b[1]-nd(sg.i,sg.j+1).d/2)]; if(!ext)openSeg=isOpen('V',sg.i,sg.j); }
      if(openSeg)return;
      const t=ext?P.wallExt:P.wallInt, h=r4(hs-beamDepth(sg.L,P));
      const w=mk('wall',s,{a,b,h,t,rc:'wall',mk:(ext?'WE':'WI'),ext,seg:sg.dir+sg.i+','+sg.j}); ws.push({w,sg,ext});
    });
    if(P.openings){
      step('open'+s,'Doors and windows, storey '+s,'أبواب وشبابيك الدور '+s);
      const ie=Math.floor((nx-1)/2);
      ws.forEach(o=>{ const w=o.w, L=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);
        if(o.ext){ if(s===1&&o.sg.dir==='X'&&o.sg.j===0&&o.sg.i===ie){ if(w.h>=2.3&&L>=1.6)mk('door',s,{w:w.id,p:r4(L/2),W:1.0,H:2.1,rc:'door'}); }
          else { const W=Math.min(1.5,Math.floor(L*0.4*10)/10); if(W>=0.6&&w.h>=2.1)mk('window',s,{w:w.id,p:r4(L/2),W,H:1.2,sill:0.9,rc:'window'}); } }
        else if(L>=1.5&&w.h>=2.3)mk('door',s,{w:w.id,p:r4(L/2),W:0.9,H:2.1,rc:'door'}); });
    }
    if(stair&&s<=stairFlights){ step('stair'+s,'Stair, storey '+s,'سلم الدور '+s);
      mk('stair',s,{a:stair.a.slice(),b:stair.b.slice(),w:stair.w,maxR:P.maxR,H:hs,rc:'stair',mk:'ST1',tw:ceilTo((stair.b[1]-stair.a[1])/20,0.01)}); }
  }
  /* ---- parapet on the roof (continuous around the perimeter; the columns end at the roof level so the parapet starts above them) ---- */
  if(P.parapet>0){ step('parapet','Roof parapet','برابيت السطح'); const lv=N+1, t=P.wallExt, y=P.parapet;
    mk('wall',lv,{a:[-t/2,0],b:[Xn+t/2,0],h:y,t,rc:'parapet',mk:'WP',ext:true}); mk('wall',lv,{a:[Xn+t/2,Zn],b:[-t/2,Zn],h:y,t,rc:'parapet',mk:'WP',ext:true});
    mk('wall',lv,{a:[Xn,t/2],b:[Xn,Zn-t/2],h:y,t,rc:'parapet',mk:'WP',ext:true}); mk('wall',lv,{a:[0,Zn-t/2],b:[0,t/2],h:y,t,rc:'parapet',mk:'WP',ext:true}); }
  /* ---- rooms (names only, for the plan view) ---- */
  if(P.rooms){ step('rooms','Rooms','الغرف');
    const def3x2={1:[['Living',0,0,1,0],['Kitchen',2,0,2,0],['Stair hall',0,1,0,1],['Guest room',1,1,1,1],['Store and WC',2,1,2,1]],2:[['Master bedroom',0,0,0,0],['Bedroom 2',1,0,1,0],['Bedroom 3',2,0,2,0],['Landing',0,1,0,1],['Bedroom 4',1,1,1,1],['Bath',2,1,2,1]]};
    for(let s=1;s<=N;s++){ let list=(nx===3&&nz===2)?def3x2[Math.min(s,2)]:null;
      if(!list){ list=[]; for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)list.push(['Room '+(i+1)+'-'+(j+1),i,j,i,j]); }
      list.forEach(r=>mk('room',s,{a:[X[r[1]],Z[r[2]]],b:[X[r[3]+1],Z[r[4]+1]],n:r[0],rc:'room'})); } }
  const info={X,Z,nx,nz,N,hs,levels,nodes,colH,colB,tSlab,anyOne,stair,openings,stripB,stripT,steps,rules:RULES,warn,bua:r4(Xn*Zn*N),footprint:[Xn,Zn]};
  return {P,levels,grids,els,info};
}
/* ---- exact net concrete: boxes painted by priority, so overlaps at joints are counted once ---- */
function netVol(model){
  const L=model.levels, pr={footing:0,column:1,tie:2,beam:3,slab:4,sog:5}, cls=e=>e.k==='found'||e.k==='fslab'?'footing':e.k==='col'?'column':e.k==='beam'?(e.rc==='tie'?'tie':'beam'):e.k==='floor'?(e.rc==='sog'?'sog':'slab'):null;
  const bs=[]; model.els.forEach(e=>{ const c=cls(e); if(!c)return; const b=boxOf(e,L); if(b){ b.c=c; bs.push(b); } });
  const uq=(k)=>{ const s=new Set(); bs.forEach(b=>{ s.add(r4(b[k+'0'])); s.add(r4(b[k+'1'])); }); return [...s].sort((a,b)=>a-b); };
  const xs=uq('x'), zs=uq('z'), ys=uq('y'), ix=v=>xs.indexOf(r4(v)), iz=v=>zs.indexOf(r4(v)), iy=v=>ys.indexOf(r4(v));
  const NX=xs.length-1, NZ=zs.length-1, NY=ys.length-1, arr=new Uint8Array(Math.max(0,NX*NZ*NY)).fill(255), out={footing:0,column:0,tie:0,beam:0,slab:0,sog:0,total:0};
  bs.forEach(b=>{ const p=pr[b.c], x0=ix(b.x0),x1=ix(b.x1),z0=iz(b.z0),z1=iz(b.z1),y0=iy(b.y0),y1=iy(b.y1);
    for(let a=x0;a<x1;a++)for(let c=z0;c<z1;c++)for(let d=y0;d<y1;d++){ const k=(a*NZ+c)*NY+d; if(p<arr[k])arr[k]=p; } });
  const names=Object.keys(pr);
  for(let a=0;a<NX;a++)for(let c=0;c<NZ;c++)for(let d=0;d<NY;d++){ const v=arr[(a*NZ+c)*NY+d]; if(v===255)continue; const vol=(xs[a+1]-xs[a])*(zs[c+1]-zs[c])*(ys[d+1]-ys[d]); out[names[v]]+=vol; out.total+=vol; }
  Object.keys(out).forEach(k=>{ out[k]=Math.round(out[k]*1e4)/1e4; }); return out;
}
/* ---- geometric checks on any R.X model {levels,els} (generated or drawn) ---- */
function check(model,o){
  o=o||{}; const tol=o.tol||1e-6, L=model.levels, els=model.els, out=[], add=(name,pass,detail)=>out.push({name,pass:!!pass,detail:detail||''});
  const of=k=>els.filter(e=>e.k===k), cols=of('col'), beams=of('beam'), walls=of('wall'), floors=of('floor'), founds=of('found'), stairs=of('stair');
  const boxes=new Map(); els.forEach(e=>{ const b=boxOf(e,L); if(b)boxes.set(e.id,b); });
  const bad=(A,Bs,lim)=>{ const r=[]; A.forEach(a=>Bs.forEach(b=>{ if(a===b)return; const v=ovol(boxes.get(a.id),boxes.get(b.id)); if(v>(lim||1e-9))r.push(a.id+'x'+b.id+' '+v.toFixed(5)); })); return r; };
  const oblique=els.filter(e=>(e.k==='wall'||e.k==='beam')&&!boxes.get(e.id)); add('walls and beams are axis-aligned',oblique.length===0,oblique.length+' oblique');
  let r=bad(walls,[...cols,...beams,...floors,...founds]); add('no wall intersects a column, beam, slab or footing',r.length===0,r.slice(0,3).join('; ')||(walls.length+' walls checked'));
  r=[]; walls.forEach(w=>{ const z=L[w.lv].z, top=z+w.h; /* wall top meets the soffit of the beam above (gap or overlap < 1 mm) when a beam runs on the wall line */
    const wb=boxes.get(w.id); if(!wb||w.rc==='parapet')return; const above=beams.filter(b=>b.lv===w.lv+1&&oarea(boxes.get(b.id),{x0:wb.x0,x1:wb.x1,z0:wb.z0,z1:wb.z1})>1e-9);
    if(!above.length){ r.push(w.id+': no beam above'); return; } const soffit=Math.min(...above.map(b=>boxes.get(b.id).y0)); if(Math.abs(soffit-top)>1e-3)r.push(w.id+' top '+top.toFixed(3)+' vs soffit '+soffit.toFixed(3)); });
  add('every wall top touches the soffit of the beam above',r.length===0,r.slice(0,3).join('; '));
  r=[]; walls.forEach(w=>{ const wb=boxes.get(w.id); if(!wb)return; const below=[...beams,...floors].filter(b=>{ const bb=boxes.get(b.id); return bb&&Math.abs(bb.y1-wb.y0)<1e-3&&oarea(bb,{x0:wb.x0,x1:wb.x1,z0:wb.z0,z1:wb.z1})>1e-9; });
    if(!below.length)r.push(w.id+': nothing under the wall base'); else { const cov=below.reduce((s,b)=>s+oarea(boxes.get(b.id),{x0:wb.x0,x1:wb.x1,z0:wb.z0,z1:wb.z1}),0); if(cov<(wb.x1-wb.x0)*(wb.z1-wb.z0)-1e-4)r.push(w.id+': base only partly supported '+cov.toFixed(3)); } });
  add('every wall base sits fully on a slab or beam',r.length===0,r.slice(0,3).join('; '));
  const wid=new Map(walls.map(w=>[w.id,w])); r=[]; const byWall={};
  els.filter(e=>e.k==='door'||e.k==='window').forEach(e=>{ const w=wid.get(e.w); if(!w){ r.push(e.id+': host wall missing'); return; } const Ln=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]), s0=e.p-e.W/2, s1=e.p+e.W/2, sill=e.k==='door'?0:e.sill;
    if(s0<0.05-1e-9||s1>Ln-0.05+1e-9)r.push(e.id+': outside wall length ['+s0.toFixed(2)+','+s1.toFixed(2)+'] of '+Ln.toFixed(2)); if(sill<-1e-9||sill+e.H>w.h+1e-9)r.push(e.id+': outside wall height '+(sill+e.H).toFixed(2)+' > '+w.h.toFixed(2));
    (byWall[e.w]=byWall[e.w]||[]).push([s0,s1,e.id]); });
  Object.keys(byWall).forEach(k=>{ const a=byWall[k].sort((p,q)=>p[0]-q[0]); for(let i=1;i<a.length;i++)if(a[i][0]<a[i-1][1]+0.05-1e-9)r.push('openings overlap on wall '+k); });
  add('every door and window is inside its host wall (length, height, no overlap)',r.length===0,r.slice(0,3).join('; ')||(els.filter(e=>e.k==='door'||e.k==='window').length+' openings checked'));
  /* slabs on beams */
  r=[]; const lvls=[...new Set(floors.filter(f=>f.rc!=='sog').map(f=>f.lv))]; const slabs=floors.filter(f=>f.rc!=='sog');
  slabs.forEach(f=>{ const fb=boxes.get(f.id); beams.filter(b=>b.lv===f.lv).forEach(b=>{ const bb=boxes.get(b.id); if(oarea(fb,bb)>1e-9){ if(Math.abs(bb.y1-fb.y1)>1e-6)r.push(f.id+': slab top differs from beam top'); if(fb.y0<bb.y0+1e-6)r.push(f.id+': slab thicker than beam '+b.id); } }); });
  add('slab top is flush with the beam top and the slab is thinner than the beams under it',r.length===0,r.slice(0,3).join('; '));
  r=[]; slabs.forEach(f=>{ const fb=boxes.get(f.id), ed=[[fb.x0,fb.z0,fb.x1,fb.z0,'X',1],[fb.x0,fb.z1,fb.x1,fb.z1,'X',-1],[fb.x0,fb.z0,fb.x0,fb.z1,'Z',1],[fb.x1,fb.z0,fb.x1,fb.z1,'Z',-1]];
    ed.forEach(e=>{ const line=e[4]==='X'?e[1]:e[0], lo=e[4]==='X'?e[0]:e[1], hi=e[4]==='X'?e[2]:e[3], iv=[];
      beams.filter(b=>b.lv===f.lv).forEach(b=>{ if(e[4]==='X'&&Math.abs(b.a[1]-line)<tol&&Math.abs(b.b[1]-line)<tol)iv.push([Math.min(b.a[0],b.b[0]),Math.max(b.a[0],b.b[0])]); if(e[4]==='Z'&&Math.abs(b.a[0]-line)<tol&&Math.abs(b.b[0]-line)<tol)iv.push([Math.min(b.a[1],b.b[1]),Math.max(b.a[1],b.b[1])]); });
      slabs.forEach(g=>{ if(g===f||g.lv!==f.lv||g.panel!==f.panel)return; const gb=boxes.get(g.id); /* the next piece of the same panel (a cut line, not a support) */
        if(e[4]==='X'&&Math.abs((e[5]>0?gb.z1:gb.z0)-line)<tol)iv.push([gb.x0,gb.x1]); if(e[4]==='Z'&&Math.abs((e[5]>0?gb.x1:gb.x0)-line)<tol)iv.push([gb.z0,gb.z1]); });
      if(f.op){ const h=f.op; if(e[4]==='X'&&(Math.abs(line-h[1])<tol||Math.abs(line-h[3])<tol))iv.push([h[0],h[2]]); if(e[4]==='Z'&&(Math.abs(line-h[0])<tol||Math.abs(line-h[2])<tol))iv.push([h[1],h[3]]); }
      iv.sort((p,q)=>p[0]-q[0]); let at=lo; iv.forEach(v=>{ if(v[0]<=at+tol&&v[1]>at)at=v[1]; }); if(at<hi-tol)r.push(f.id+' edge '+e[4]+'@'+line.toFixed(2)+' not on a beam centreline'); }); });
  add('every slab edge lies on a beam centreline (or on a stair opening edge)',r.length===0,r.slice(0,3).join('; '));
  r=[]; lvls.forEach(lv=>{ const sl=slabs.filter(f=>f.lv===lv), bl=beams.filter(b=>b.lv===lv); if(!bl.length)return; const xs=[],zs=[]; bl.forEach(b=>{ xs.push(b.a[0],b.b[0]); zs.push(b.a[1],b.b[1]); });
    const foot=(Math.max(...xs)-Math.min(...xs))*(Math.max(...zs)-Math.min(...zs)); let a=0; sl.forEach(f=>{ const b=boxes.get(f.id); a+=(b.x1-b.x0)*(b.z1-b.z0); }); const ops=new Map(); sl.forEach(f=>{ if(f.op)ops.set(f.op.join(','),f.op); }); ops.forEach(h=>{ a+=(h[2]-h[0])*(h[3]-h[1]); });
    if(Math.abs(a-foot)>1e-4)r.push('level '+lv+': slabs+openings '+a.toFixed(3)+' vs footprint '+foot.toFixed(3));
    r=r.concat(bad(sl,sl).map(x=>'slab overlap '+x)); });
  add('slab panels plus openings tile the footprint exactly, no slab overlap',r.length===0,r.slice(0,3).join('; ')||(lvls.length+' suspended level(s)'));
  /* columns stack */
  r=[]; const byNode={}; cols.forEach(c=>{ const k=c.p[0].toFixed(4)+','+c.p[1].toFixed(4); (byNode[k]=byNode[k]||[]).push(c); });
  Object.keys(byNode).forEach(k=>{ const a=byNode[k].map(c=>({c,y0:L[c.lv].z,y1:L[c.lv].z+c.h})).sort((p,q)=>p.y0-q.y0);
    for(let i=1;i<a.length;i++)if(Math.abs(a[i].y0-a[i-1].y1)>1e-6)r.push(k+': gap/overlap between column '+(i-1)+' and '+i+' ('+a[i-1].y1.toFixed(3)+' vs '+a[i].y0.toFixed(3)+')');
    const fb=founds.map(f=>boxes.get(f.id)).filter(b=>b&&a[0].c.p[0]>=b.x0-tol&&a[0].c.p[0]<=b.x1+tol&&a[0].c.p[1]>=b.z0-tol&&a[0].c.p[1]<=b.z1+tol);
    if(!fb.length)r.push(k+': no footing under the column'); else if(Math.abs(Math.max(...fb.map(b=>b.y1))-a[0].y0)>1e-6)r.push(k+': footing top '+Math.max(...fb.map(b=>b.y1)).toFixed(3)+' vs column base '+a[0].y0.toFixed(3));
    const top=a[a.length-1].y1, px=a[0].c.p[0], pz=a[0].c.p[1]; const at=beams.filter(b=>(Math.abs(b.a[0]-px)<tol&&Math.abs(b.a[1]-pz)<tol)||(Math.abs(b.b[0]-px)<tol&&Math.abs(b.b[1]-pz)<tol)).filter(b=>b.rc!=='tie'); const beamTop=Math.max(...at.map(b=>L[b.lv].z+b.top)); if(isFinite(beamTop)&&Math.abs(top-beamTop)>1e-6)r.push(k+': column top '+top.toFixed(3)+' vs highest beam top '+beamTop.toFixed(3)); });
  add('columns stack from footing to roof with no gap or overlap and land on beams',r.length===0,r.slice(0,3).join('; ')||(Object.keys(byNode).length+' column lines'));
  /* columns on grid nodes and beams between columns */
  r=[]; const grids=model.grids||[]; const vx=[...new Set(grids.filter(g=>!g.hz).map(g=>+g.a[0].toFixed(4)))], hz=[...new Set(grids.filter(g=>g.hz).map(g=>+g.a[1].toFixed(4)))];
  if(vx.length&&hz.length)cols.forEach(c=>{ if(!vx.some(v=>Math.abs(v-c.p[0])<tol)||!hz.some(v=>Math.abs(v-c.p[1])<tol))r.push(c.id+' not on a grid intersection'); });
  beams.forEach(b=>{ const ok=pt=>cols.some(c=>c.lv===b.lv-1&&Math.abs(c.p[0]-pt[0])<tol&&Math.abs(c.p[1]-pt[1])<tol)||cols.some(c=>c.lv===b.lv&&Math.abs(c.p[0]-pt[0])<tol&&Math.abs(c.p[1]-pt[1])<tol)||b.rc==='tie'&&cols.some(c=>c.lv===0&&Math.abs(c.p[0]-pt[0])<tol&&Math.abs(c.p[1]-pt[1])<tol); if(!ok(b.a)||!ok(b.b))r.push(b.id+' end not on a column'); });
  add('columns sit on grid intersections and every beam runs between two columns',r.length===0,r.slice(0,3).join('; '));
  /* footings */
  r=[]; founds.forEach(f=>{ const fb=boxes.get(f.id); cols.filter(c=>c.lv===0).forEach(c=>{ const cb=boxes.get(c.id); if(oarea(fb,cb)>1e-9&&(cb.x0<fb.x0-tol||cb.x1>fb.x1+tol||cb.z0<fb.z0-tol||cb.z1>fb.z1+tol))r.push(f.id+' does not contain neck column '+c.id); }); });
  r=r.concat(bad(founds,founds).map(x=>'footing overlap '+x)); add('every footing contains its neck column and footings do not overlap',r.length===0,r.slice(0,3).join('; '));
  /* stairs */
  r=[]; stairs.forEach(s=>{ const Ln=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]), n=Math.ceil(s.H/s.maxR-1e-9), riser=s.H/n, tread=Ln/n; if(riser>s.maxR+1e-9)r.push('riser '+riser.toFixed(3)); if(tread<0.25-1e-9)r.push('tread '+tread.toFixed(3)+' < 0.25 m');
    const z0=L[s.lv].z, z1=L[s.lv+1]?L[s.lv+1].z:z0+s.H; if(Math.abs((z1-z0)-s.H)>1e-6)r.push('stair rise '+s.H+' vs level difference '+(z1-z0).toFixed(3));
    const up=floors.filter(f=>f.lv===s.lv+1&&f.rc!=='sog'), ux=(s.b[0]-s.a[0])/Ln, uz=(s.b[1]-s.a[1])/Ln; let hmin=1e9;
    for(let t=0;t<=Ln+1e-9;t+=0.01){ const px=s.a[0]+ux*t, pz=s.a[1]+uz*t; [-s.w/2,0,s.w/2].forEach(l=>{ const qx=px-uz*l, qz=pz+ux*l; up.forEach(f=>{ const b=boxes.get(f.id); if(qx>b.x0+tol&&qx<b.x1-tol&&qz>b.z0+tol&&qz<b.z1-tol)hmin=Math.min(hmin,b.y0-(z0+s.H*t/Ln)); }); }); }
    if(hmin<(o.headroom||2.1)-1e-6)r.push('headroom '+hmin.toFixed(3)+' m under the slab'); });
  stairs.forEach(s=>{ const sb=boxes.get(s.id); walls.filter(w=>w.lv===s.lv).forEach(w=>{ if(ovol(sb,boxes.get(w.id))>1e-9)r.push('stair hits wall '+w.id); }); cols.filter(c=>c.lv===s.lv).forEach(c=>{ if(ovol(sb,boxes.get(c.id))>1e-9)r.push('stair hits column '+c.id); }); });
  if(stairs.length)add('stair: riser, tread, rise = level difference, headroom >= 2.10 m, clear of walls and columns',r.length===0,r.slice(0,3).join('; '));
  return out;
}
/* ---- quantities and rule-of-thumb bands (information only) ---- */
function summary(model,plan0){
  const nv=netVol(model), bua=plan0&&plan0.info?plan0.info.bua:0;
  return {net:nv,bua,concretePerM2:bua?r4(nv.total/bua):null,band:[0.30,0.40],inBand:bua?(nv.total/bua>=0.30&&nv.total/bua<=0.40):null};
}
return {DEF,RULES,plan,check,netVol,summary,rectMinus,boxOf,ovol,ceilTo,floorTo,r4,beamDepth,tieDepth,slabThk};
})();
/*@@RCSK_PURE_END*/

/* ==================== Part 2: R.X integration (browser) ==================== */
/* footings keep their own top level (ztop); other found elements draw as before */
{ const _f=RVX.build.found; RVX.build.found=function(e,y,hi){ if(e.ztop==null)return _f(e,y,hi); const m=new T.Mesh(new T.BoxGeometry(e.w,e.t,e.d),rvMat(hi?0xf6d58a:0x8f8a80)); m.position.set(e.p[0],y+e.ztop-e.t/2,e.p[1]); return m; }; }
const rcskIsRc=e=>e.src==='rcs';
function rcskModel(){ return {levels:RV.levels,grids:RV.grids,els:RV.els}; }
function rcskTplRv(po){ const p=RCSKEL.plan(po,{id:tpRid}); return {levels:p.levels,grids:p.grids,els:p.els,def:tpSnap(RV.def)}; }
function rcskApply(po,upTo){
  const p=RCSKEL.plan(po,{id:rvId}); let keep=null;
  if(upTo){ const ix=p.info.steps.findIndex(s=>s.key===upTo); if(ix<0)throw new Error('unknown step '+upTo); keep=new Set(); p.info.steps.slice(0,ix+1).forEach(s=>s.ids.forEach(i=>keep.add(i))); }
  rvPush(); const others=RV.els.filter(e=>!rcskIsRc(e)); RV.levels=p.levels.map(l=>({n:l.n,z:l.z})); RV.grids=p.grids.filter(g=>!keep||keep.has(g.id));
  RV.els=others.concat(p.els.filter(e=>!keep||keep.has(e.id))); RV.lv=Math.min(1,RV.levels.length-1); RV.sel=null; RV.pts=[]; rvChanged();
  return p;
}
/* demo helper: the build order as steps [{key,en,ar,ids}] of a freshly generated skeleton (does not touch the model) */
function rcskSteps(po){ return RCSKEL.plan(po,{id:()=>'x'}).info.steps.map(s=>({key:s.key,en:s.en,ar:s.ar,n:s.ids.length})); }
function rcskReport(p){ const m=rcskModel(), ck=RCSKEL.check(m), sm=RCSKEL.summary(m,p), f=ck.filter(c=>!c.pass).length, i=p.info; const C=n=>RV.els.filter(e=>e.k===n&&rcskIsRc(e)).length;
  return {ok:f===0,failed:f,checks:ck,summary:sm,counts:{footings:C('found'),columns:RV.els.filter(e=>e.k==='col'&&e.rc==='column').length,necks:RV.els.filter(e=>e.rc==='neck').length,beams:RV.els.filter(e=>e.rc==='beam').length,ties:RV.els.filter(e=>e.rc==='tie').length,slabs:RV.els.filter(e=>e.rc==='slab').length,walls:RV.els.filter(e=>e.k==='wall'&&rcskIsRc(e)).length,doors:C('door'),windows:C('window'),stairs:C('stair')},colSize:[i.colB,i.colH],slabT:i.tSlab,warn:i.warn}; }
let RCSK_LAST=null;
function rcskDialog(){
  const old=document.getElementById('rcskDlg'); if(old)old.remove(); const D=Object.assign({},RCSKEL.DEF,RCSK_LAST||{});
  const ov=el('div',{id:'rcskDlg',style:'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center'}), close=()=>ov.remove();
  const box=el('div',{style:'background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:16px;width:min(560px,94vw);max-height:90vh;overflow:auto'});
  const f={}, row=(k,en,ar,v,tp)=>{ const i=el('input',{type:tp||'text',value:v,style:'width:150px'}); f[k]=i; return el('label',{class:'small',style:'display:flex;justify-content:space-between;gap:8px;align-items:center;margin:4px 0'},el('span',{text:b2(en,ar)}),i); };
  const sel=el('select',{},el('option',{value:'isolated',text:b2('Isolated footings + tie beams','قواعد منفصلة + سملات')}),el('option',{value:'strip',text:b2('Strip footings','قواعد شريطية')})); sel.value=D.found;
  const stairCb=el('input',{type:'checkbox'}); stairCb.checked=!!D.stair; const res=el('div',{class:'small',style:'margin-top:8px;white-space:pre-wrap'});
  box.append(el('b',{text:b2('RC skeleton generator','مولّد الهيكل الخرساني'),style:'font-size:16px'}),
    el('div',{class:'small',style:'color:#e0a040;margin:4px 0 8px',text:b2('PRELIMINARY rule-of-thumb sizes for demonstration. Not a structural design, not approved.','مقاسات مبدئية تجريبية. مش تصميم إنشائي ومش معتمدة.')}),
    row('bx','Bays along X (m, comma separated)','البحور في اتجاه X (م)',D.bx.join(',')),row('bz','Bays along Z (m)','البحور في اتجاه Z (م)',D.bz.join(',')),row('st','Storeys','عدد الأدوار',D.storeys,'number'),row('hs','Storey height (m)','ارتفاع الدور (م)',D.hs,'number'),
    row('qa','Allowable soil bearing (kPa, assumed)','تحمل التربة (ك.ن/م²، مفترض)',D.qa,'number'),row('fcu','Concrete cube strength fcu (MPa, assumed)','مقاومة الخرسانة fcu (MPa، مفترضة)',D.fcu,'number'),
    el('label',{class:'small',style:'display:flex;justify-content:space-between;margin:4px 0'},el('span',{text:b2('Foundation','الأساسات')}),sel),
    el('label',{class:'small',style:'display:flex;gap:6px;align-items:center;margin:4px 0'},stairCb,el('span',{text:b2('Stair in the cell [0,1] (back left)','سلم في الخلية [0,1] (الخلفية يسار)')})),
    el('div',{class:'small',text:b2('Replaces the levels, grids and any earlier RC skeleton. Undo restores them.','بيستبدل المستويات والشبكة وأي هيكل سابق. التراجع يرجّعهم.')}),res,
    el('div',{class:'row',style:'margin-top:10px'},el('button',{class:'on',text:b2('Generate','ولّد'),onclick:()=>{ try{
      const nums=s=>String(s).split(/[\s,;]+/).filter(x=>x!=='').map(Number), po={bx:nums(f.bx.value),bz:nums(f.bz.value),storeys:+f.st.value,hs:+f.hs.value,qa:+f.qa.value,fcu:+f.fcu.value,found:sel.value,stair:stairCb.checked?[0,1]:null};
      RCSK_LAST=po; const p=rcskApply(po), r=rcskReport(p); res.textContent=b2('Done: ','تم: ')+r.counts.columns+' columns '+(r.colSize[0]*100)+'x'+(r.colSize[1]*100)+' cm, '+r.counts.footings+' footings, '+r.counts.beams+' beams, '+r.counts.slabs+' slabs ('+(r.slabT*100)+' cm), '+r.counts.walls+' walls, '+r.counts.doors+' doors, '+r.counts.windows+' windows. '+b2('Checks failed: ','فحوص فاشلة: ')+r.failed+(r.warn.length?'\n'+r.warn.join('\n'):''); xSt(res.textContent);
    }catch(e){ res.textContent=String(e.message||e); } }}),el('button',{text:b2('Close','إغلاق'),onclick:close})));
  ov.append(box); ov.onclick=e=>{ if(e.target===ov)close(); }; document.body.appendChild(ov);
}
XCMD('rcs_skeleton','column','RC skeleton','هيكل خرساني',function(a){
  if(a&&typeof a==='object'){ const p=rcskApply(a.params||a,a.upTo); return rcskReport(p); }
  rcskDialog();
});
XCMD('rcs_skeleton_check','safety','RC skeleton checks','فحوص الهيكل',function(){ const ck=RCSKEL.check(rcskModel()); const f=ck.filter(c=>!c.pass); xSt(b2('RC geometry checks: ','فحوص هندسة الهيكل: ')+(ck.length-f.length)+'/'+ck.length+' '+b2('pass','نجحت')+(f.length?' | '+f[0].name+': '+f[0].detail:'')); return ck; });
if(typeof XDESC!=='undefined'){
  XDESC.rcs_skeleton=['Generate a reinforced-concrete skeleton for a house on a column grid: footings, neck columns, tie beams, slab on grade, columns, beams, slabs, stair, walls between columns, doors, windows (preliminary rule-of-thumb sizes). Argument {params:{bx,bz,storeys,hs,found,stair,...},upTo} for scripts','ولّد هيكل خرساني لبيت على شبكة أعمدة: قواعد ورقاب وسملات وأرضية وأعمدة وكمرات وبلاطات وسلم وحوائط بين الأعمدة (مقاسات مبدئية)'];
  XDESC.rcs_skeleton_check=['Check the RC skeleton geometry numerically: walls vs columns, openings, slabs on beams, column stacking, footings, stair headroom','فحص هندسة الهيكل رقميا: الحوائط والأعمدة والفتحات والبلاطات والكمرات والسلم'];
}
/* ---- template house_rc: 12 x 10 m, 2 storeys, column grid 3 x 2 bays (4 m x 5 m), stair, walls between columns ---- */
TEMPLATES.house_rc={id:'house_rc',base:'blank',n:['Two-floor RC house (frame)','بيت دورين هيكل خرساني'],title:['Two-floor RC house','بيت دورين هيكل خرساني'],rv:()=>rcskTplRv(),
  d:['12 x 10 m, 4 m x 5 m column grid: isolated footings, tie beams, columns, beams, slabs, stair, walls between columns. Preliminary sizes, not a design.','١٢ × ١٠ م، شبكة أعمدة ٤ × ٥ م: قواعد وسملات وأعمدة وكمرات وبلاطات وسلم وحوائط بين الأعمدة. مقاسات مبدئية مش تصميم.']};
/* ---- ribbon: Structure / Structure panel ---- */
function rcskRib(tabName,panel,id,en,ar){ try{ const t=RIBP.model.tabs.find(x=>x[1][0]===tabName); if(!t)return; let g=t[2].find(x=>x[0][0]===panel); if(!g)return; if(g[1].indexOf(id)<0)g[1].push(id); RIBM[id]={type:'model',tab:tabName,tabAr:t[1][1],panel,panelAr:g[0][1],en,ar,impl:id}; }catch(e){} }
rcskRib('Structure','Structure','rcs_skeleton','RC Skeleton','هيكل خرساني'); rcskRib('Structure','Structure','rcs_skeleton_check','RC Checks','فحوص الهيكل');
/* ---- Properties: show the RC role, mark and rule used ---- */
{ const _rp=rvProps; rvProps=function(){ _rp.apply(this,arguments); try{ const e=RV.els.find(x=>x.id===RV.sel); if(!e||!RVP||!rcskIsRc(e)||!e.rc)return;
  const nm={footing:['Footing (preliminary size)','قاعدة (مقاس مبدئي)'],neck:['Neck column','رقبة عمود'],tie:['Tie beam','سملة'],sog:['Slab on grade','أرضية على التربة'],column:['Column (preliminary size)','عمود (مقاس مبدئي)'],beam:['Beam (preliminary size)','كمرة (مقاس مبدئي)'],slab:['Slab '+(e.way==='one'?'one-way':'two-way')+' (preliminary thickness)','بلاطة '+(e.way==='one'?'اتجاه واحد':'اتجاهين')],wall:['Wall between columns','حائط بين الأعمدة'],parapet:['Parapet','برابيت'],stair:['Stair','سلم']}[e.rc]; if(!nm)return;
  RVP.append(el('div',{class:'small',style:'margin-top:8px;color:#e0a040'},el('b',{text:b2(nm[0],nm[1])+(e.mk?' - '+e.mk:'')}),el('div',{text:b2('Rule-of-thumb value from the RC skeleton generator. Not a design.','قيمة بقاعدة مبدئية من مولّد الهيكل. مش تصميم.')}))); }catch(x){} }; }
