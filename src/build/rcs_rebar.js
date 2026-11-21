/* rcs_rebar.js - reinforcement DETAILING from the R.X model: per-member bars, development / lap length, bar bending schedule (BBS), rebar line in the Q.X BOQ, 3D rebar with toggle.
   Prefix rcsr / RCSREB. Chain position: right after rcs_skel.js (needs RCSKEL, RV, RVX, XC, getItems, rvChanged). Part 1 (PURE markers) has no browser dependency (node tests load it unchanged).
   WHAT THIS IS: detailing = choosing and drawing bars, computing lengths and weights for the members in the model. WHAT IT IS NOT: structural design. The required steel areas come from simple
   preliminary ratios (rho x b x d, labelled below) unless a design result is supplied through cfg.design(info) (the structural-design engine can plug in there and return {As...}).
   Formulas (all stated again in the BBS dialog; none claims an Egyptian-code clause):
     f'c = 0.8 x fcu (rough cylinder conversion, NEVER for final design)
     tension development length (ACI 318M simplified form, "spacing and cover" case): ld = fy.psi_t.psi_e / (2.1 lambda sqrt(f'c)) x db for db <= 19 mm, / (1.7 ...) for db >= 22 mm, min 300 mm;
       confined = false uses 1.4 / 1.1 (other cases). Rounded UP to 10 mm for detailing.
     tension lap = 1.3 ld (class B), min 300 mm, rounded up to 10 mm. Compression lap = max(300, 0.071 fy db). Compression development = max(0.24 fy db / (lambda sqrt(f'c)), 0.043 fy db, 200).
     standard 90 deg hook: tail 12 db. Standard 135 deg stirrup hook: tail max(6 db, 75 mm). Hooked development: ldh = max(8 db, 150, 0.24 psi_e fy db / (lambda sqrt(f'c))).
     bar weight kg/m = d^2 / 162 (d in mm). Cut length = sum of outside legs - bend deductions (90 deg: 2 db, 135 deg: 3 db, common practice; the bar bender's tables govern).
   The Egyptian code (ECP 203) uses a different bond-stress based expression with fcu: it is NOT coded here, compare with your licensed copy. Preliminary demonstration values, not design approval. */
/*@@RCSR_PURE_BEGIN*/
const RCSREB=(function(){
const r4=x=>Math.round(x*1e4)/1e4, mm=x=>Math.round(x*1000), c10=x=>Math.ceil(x/10-1e-9)*10, fl=(x,s)=>Math.floor(x/s+1e-9)*s;
const CFG0={ fy:360, fcu:25, st:8, psiT:1, psiE:1, lambda:1, confined:true, lapF:1.3, colLap:'tension', coupler:0,
  cover:{footing:0.075,neck:0.05,column:0.03,tie:0.05,beam:0.025,slab:0.02,sog:0.05,stair:0.02},
  rho:{column:0.010,beam:0.008,tie:0.006,footing:0.0045,slab:0.0055,slabOne:0.0065,stair:0.0035},
  colTie:{end:0.10,mid:0.15}, beamTie:{end:0.10,mid:0.20}, tieTie:{end:0.15,mid:0.20}, design:null };
const mergeCfg=c=>{ const o=JSON.parse(JSON.stringify(CFG0)); if(c){ Object.keys(c).forEach(k=>{ if(k==='design'){ o.design=c.design; } else if(c[k]&&typeof c[k]==='object'&&!Array.isArray(c[k])&&o[k]&&typeof o[k]==='object')Object.assign(o[k],c[k]); else o[k]=c[k]; }); } return o; };
const fcy=c=>0.8*c.fcu, area=d=>Math.PI*d*d/4, wkg=d=>d*d/162;
/* ---- development / lap / hook ---- */
function ld(db,c){ c=mergeCfg(c); const k=c.confined?(db<=19?2.1:1.7):(db<=19?1.4:1.1); return Math.max(300,c.fy*c.psiT*c.psiE/(k*c.lambda*Math.sqrt(fcy(c)))*db); }
function ldc(db,c){ c=mergeCfg(c); const rt=Math.sqrt(fcy(c)); return Math.max(0.24*c.fy*db/(c.lambda*rt),0.043*c.fy*db,200); }
function lap(db,c){ c=mergeCfg(c); return c10(Math.max(300,c.lapF*ld(db,c))); }
function lapC(db,c){ c=mergeCfg(c); return c10(Math.max(300,c.fy<=420?0.071*c.fy*db:(0.13*c.fy-24)*db)); }
function ldh(db,c){ c=mergeCfg(c); return Math.max(8*db,150,0.24*c.psiE*c.fy*db/(c.lambda*Math.sqrt(fcy(c)))); }
const hook90=db=>12*db, hook135=db=>Math.max(6*db,75), ded=a=>a===90?2:a===135?3:0;
const BARS=[8,10,12,14,16,18,20,22,25,28,32];
function table(c){ return BARS.map(d=>({d,ld:c10(ld(d,c)),lap:lap(d,c),ldc:c10(ldc(d,c)),lapC:lapC(d,c),ldh:c10(ldh(d,c)),h90:hook90(d),h135:hook135(d),kgm:r4(wkg(d))})); }
/* ---- bars ---- */
const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
function mkBar(role,d,shape,pts,bends){ const legs=[]; for(let i=1;i<pts.length;i++)legs.push(mm(dist(pts[i-1],pts[i]))); const dd=(bends||[]).reduce((s,a)=>s+ded(a)*d,0); return {role,d,shape,pts,bends:bends||[],legs,cut:Math.round(legs.reduce((s,x)=>s+x,0)-dd)}; }
/* choose n bars of diameter d (smallest first) so that n*area >= AsReq, within the width available and maxN */
function pick(AsReq,availMm,list,minN,maxN){ let best=null; for(const d of list){ const s=Math.max(25,d), cap=Math.floor((availMm+s)/(d+s)), n=Math.max(minN,Math.ceil(AsReq/area(d)-1e-9)); best={d,n:Math.min(n,cap),As:Math.min(n,cap)*area(d),cap}; if(n<=Math.min(cap,maxN))return {d,n,As:n*area(d),cap,ok:true}; } best.ok=false; return best; }
/* mesh bars: smallest diameter whose spacing (multiple of 25 mm, 100..200) is >= minS */
function pickMesh(AsPerM,list,minS){ for(const d of list){ const s=Math.min(200,fl(area(d)*1000/AsPerM,25)); if(s>=minS||d===list[list.length-1])return {d,s:Math.max(100,s),As:area(d)*1000/Math.max(100,s)}; } }
const uniq=(n,span,pitch)=>{ const a=[]; for(let i=0;i<n;i++)a.push((i-(n-1)/2)*pitch); return a; };
/* ---- model helpers ---- */
const key=p=>p[0].toFixed(3)+','+p[1].toFixed(3);
function ctx(model){
  const L=model.levels, els=model.els, cols=els.filter(e=>e.k==='col'), chains={};
  cols.forEach(c=>{ (chains[key(c.p)]=chains[key(c.p)]||[]).push(c); }); Object.keys(chains).forEach(k=>chains[k].sort((a,b)=>L[a.lv].z-L[b.lv].z));
  const founds=els.filter(e=>e.k==='found'), foundTop=f=>L[f.lv].z+(f.ztop!=null?f.ztop:-0.2);
  const footAt=(p,y)=>founds.find(f=>p[0]>=f.p[0]-f.w/2-1e-6&&p[0]<=f.p[0]+f.w/2+1e-6&&p[1]>=f.p[1]-f.d/2-1e-6&&p[1]<=f.p[1]+f.d/2+1e-6&&Math.abs(foundTop(f)-y)<0.02);
  const colNear=(p,lv)=>{ const ch=chains[key(p)]; if(!ch)return null; return ch.find(c=>c.lv===lv)||null; };
  return {L,els,cols,chains,founds,footAt,foundTop,colNear};
}
const memberType=e=>e.k==='found'?'footing':e.k==='col'?(e.rc==='neck'?'neck':'column'):e.k==='beam'?(e.rc==='tie'?'tie':'beam'):e.k==='floor'?(e.rc==='sog'?'sog':'slab'):e.k==='stair'?'stair':null;
const GROUP={footing:'Footings',neck:'Columns',column:'Columns',tie:'Beams',beam:'Beams',slab:'Slabs',sog:'Slabs',stair:'Stairs'};
const PREF={footing:'F',neck:'NC',column:'C',tie:'TB',beam:'B',slab:'S',sog:'SG',stair:'ST'};
/* ---- columns ---- */
function detCol(e,X,c){
  const L=X.L, z0=L[e.lv].z, w=e.w, d=e.d, h=e.h, neck=e.rc==='neck', cv=c.cover[neck?'neck':'column'], ds=c.st, out=[], notes=[];
  const longX=w>=d, Lg=Math.max(w,d), Sh=Math.min(w,d), ch=X.chains[key(e.p)]||[], i=ch.indexOf(e), hasAbove=!neck&&ch.slice(i+1).some(q=>q.rc!=='neck');
  const ee=Math.max(6*ds,75)/1000, Aa=Lg-2*cv, Bb=Sh-2*cv, W3=(a,b,y)=>longX?[e.p[0]+a,y,e.p[1]+b]:[e.p[0]+b,y,e.p[1]+a];   /* a along the long side, b along the short side */
  const tie=y=>{ const h2=ee*Math.SQRT1_2, P=[[-Aa/2+h2,Bb/2-h2],[-Aa/2,Bb/2],[Aa/2,Bb/2],[Aa/2,-Bb/2],[-Aa/2,-Bb/2],[-Aa/2,Bb/2],[-Aa/2,Bb/2-ee]]; return mkBar('ties',ds,'SQ',P.map(q=>W3(q[0],q[1],y)),[135,90,90,90,135]); };
  if(neck){ const nT=Math.floor((h-0.10)/c.colTie.mid+1e-9)+1; for(let k=0;k<nT;k++)out.push(tie(z0+0.05+k*c.colTie.mid)); return {bars:out,notes,info:{ties:nT}}; }
  /* longitudinal bars start in the footing (through the neck column if there is one) and end with a hook at the top storey or a lap above */
  const nk=ch[i-1]&&ch[i-1].rc==='neck'?ch[i-1]:null, baseZ=L[(nk||e).lv].z, ft=X.footAt(e.p,baseZ), emb=ft?ft.t-c.cover.footing:0, yBot=ft?baseZ-emb:z0;
  const Ag=w*d*1e6, dh=c.design&&c.design({type:'column',el:e,w,d,h,Ag}), AsReq=(dh&&dh.AsCol)||c.rho.column*Ag, o0=cv+ds/1000;
  const pk=pick(AsReq,(Lg-2*o0)*1000,[16,18,20,22,25],4,12), n=pk.n%2?pk.n+1:pk.n, db=pk.d, o=o0+db/2000, aMax=Lg/2-o, bMax=Sh/2-o, nI=(n-4)/2, hk=hook90(db)/1000;
  const lapL=(c.coupler&&db>=c.coupler)?0:(c.colLap==='compression'?lapC(db,c):lap(db,c))/1000, yTop=z0+h+(hasAbove?lapL:-0.025);
  const pos=[[-aMax,-bMax],[aMax,-bMax],[aMax,bMax],[-aMax,bMax]]; for(let k=1;k<=nI;k++){ const a=-aMax+2*aMax*k/(nI+1); pos.push([a,-bMax],[a,bMax]); }
  pos.forEach(q=>{ const dir=q[0]>1e-9?-1:1, pts=[], bends=[]; let sh='ST';
    if(ft){ pts.push(W3(q[0]+dir*hk,q[1],yBot)); bends.push(90); sh='L1'; } pts.push(W3(q[0],q[1],yBot),W3(q[0],q[1],yTop));
    if(!hasAbove){ pts.push(W3(q[0]+dir*hk,q[1],yTop)); bends.push(90); sh=sh==='L1'?'U2':'L1'; }
    out.push(mkBar('main',db,sh,pts,bends)); });
  if(!pk.ok)notes.push('CHECK: '+pk.n+' bars of '+db+' mm do not fit the section (capacity '+pk.cap+')');
  if(lapL===0&&hasAbove)notes.push('mechanical couplers: '+n+' no. at the top of this column');
  notes.push('splice: '+(lapL===0?'coupler':Math.round(lapL*1000)+' mm lap ('+c.colLap+')')+', ld '+c10(ld(db,c))+' mm; bars start '+Math.round(emb*1000)+' mm above the footing bottom cover with a 90 deg hook');
  const t=c.colTie, lo=Math.max(Lg,h/6,0.45), nE=Math.floor((lo-0.05)/t.end+1e-9)+1, nM=Math.max(0,Math.ceil((h-2*lo)/t.mid-1e-9)-1), ys=[];
  for(let k=0;k<nE;k++)ys.push(0.05+k*t.end); const step=(h-2*lo)/(nM+1); for(let k=1;k<=nM;k++)ys.push(lo+k*step); for(let k=nE-1;k>=0;k--)ys.push(h-0.05-k*t.end);
  ys.forEach(y=>{ out.push(tie(z0+y)); for(let k=1;k<=nI;k++){ const a=-aMax+2*aMax*k/(nI+1), b=mkBar('cross ties',ds,'XT',[W3(a+ee,-Bb/2,z0+y),W3(a,-Bb/2,z0+y),W3(a,Bb/2,z0+y),W3(a+ee,Bb/2,z0+y)],[135,135]); out.push(b); } });
  return {bars:out,notes,info:{n,d:db,As:pk.As,rho:pk.As/Ag,ties:ys.length,nE,nM,lo,lap:Math.round(lapL*1000),AsReq,embed:emb}};
}
/* ---- beams and tie beams ---- */
function detBeam(e,X,c){
  const L=X.L, z=L[e.lv].z, isTie=e.rc==='tie', cv=c.cover[isTie?'tie':'beam'], ds=c.st, w=e.w, h=e.h, dx=e.b[0]-e.a[0], dz=e.b[1]-e.a[1], Lcc=Math.hypot(dx,dz), u=[dx/Lcc,dz/Lcc], l=[-u[1],u[0]];
  const W=(s,t,y)=>[e.a[0]+u[0]*s+l[0]*t,y,e.a[1]+u[1]*s+l[1]*t], ybot=z+e.top-h, ytop=z+e.top, out=[];
  const colDim=(p)=>{ const cs=[...(X.chains[key(p)]||[])].filter(q=>q.lv===e.lv-1||q.lv===e.lv||(isTie&&q.lv<=e.lv)); const q=cs[cs.length-1]; if(!q)return 0.3; return Math.abs(u[0])>0.5?q.w:q.d; };
  const ce0=colDim(e.a), ce1=colDim(e.b), ccol=c.cover.column, Lcl=Lcc-ce0/2-ce1/2, deff=h-0.05;
  const hk=c.design&&c.design({type:isTie?'tie':'beam',el:e,w,h,L:Lcc,Lclear:Lcl}), rho=isTie?c.rho.tie:c.rho.beam;
  const AsB=(hk&&hk.AsBot)||rho*w*deff*1e6, pk=pick(AsB,w*1000-2*(cv+ds/1000)*1000,[12,14,16,18,20,22,25],2,w<=0.30?4:6), db=pk.d, nb=pk.n, dt=Math.max(12,db-2), s0=-ce0/2+ccol, s1=Lcc+ce1/2-ccol;
  const lat=(n,d)=>{ const o=cv+ds/1000+d/2000, span=w-2*o; return n===1?[0]:Array.from({length:n},(_,i)=>-span/2+span*i/(n-1)); };
  const yB=ybot+cv+ds/1000+db/2000, yT=ytop-cv-ds/1000-dt/2000, yS=yT-dt/2000-0.025-db/2000;
  lat(nb,db).forEach(t=>out.push(mkBar('bottom',db,'U2',[W(s0,t,yB+hook90(db)/1000),W(s0,t,yB),W(s1,t,yB),W(s1,t,yB+hook90(db)/1000)],[90,90])));
  lat(2,dt).forEach(t=>out.push(mkBar('top continuous',dt,'U2',[W(s0,t,yT-hook90(dt)/1000),W(s0,t,yT),W(s1,t,yT),W(s1,t,yT-hook90(dt)/1000)],[90,90])));
  const ext=0.3*Lcl;
  lat(2,db).forEach(t=>{ out.push(mkBar('top at support',db,'L1',[W(s0,t,yS-hook90(db)/1000),W(s0,t,yS),W(ce0/2+ext,t,yS)],[90])); out.push(mkBar('top at support',db,'L1',[W(s1,t,yS-hook90(db)/1000),W(s1,t,yS),W(Lcc-ce1/2-ext,t,yS)],[90])); });
  /* stirrups */
  const T=isTie?c.tieTie:c.beamTie, Lz=Math.min(2*h,Lcl/2), nE=Math.floor((Lz-0.05)/T.end+1e-9)+1, nM=Math.max(0,Math.ceil((Lcl-2*Lz)/T.mid-1e-9)-1), ss=[], f0=ce0/2, f1=Lcc-ce1/2;
  for(let k=0;k<nE;k++){ ss.push(f0+0.05+k*T.end); } const gap=Lcl-2*Lz, st=gap/(nM+1); for(let k=1;k<=nM;k++)ss.push(f0+Lz+k*st); for(let k=nE-1;k>=0;k--)ss.push(f1-0.05-k*T.end);
  const A=w-2*cv, B=h-2*cv, ee=Math.max(6*ds,75)/1000, sq=s=>{ const q=(a,b)=>W(s,a,ybot+cv+B/2+b); const T1=[-A/2+ee*Math.SQRT1_2,B/2-ee*Math.SQRT1_2]; return mkBar('stirrups',ds,'SQ',[q(T1[0],T1[1]),q(-A/2,B/2),q(A/2,B/2),q(A/2,-B/2),q(-A/2,-B/2),q(-A/2,B/2),q(-A/2,B/2-ee)],[135,90,90,90,135]); };
  ss.forEach(s=>out.push(sq(s)));
  const notes=['anchorage: hook ldh '+c10(ldh(db,c))+' mm vs '+mm(ce0-ccol)+' mm available in the column ('+(mm(ce0-ccol)>=ldh(db,c)?'ok':'CHECK')+')'];
  return {bars:out,notes,info:{nb,db,dt,As:pk.As,AsReq:AsB,stirrups:ss.length,nE,nM,ce0,ce1,Lcl,rho:pk.As/(w*deff*1e6)}};
}
/* ---- footings ---- */
function detFoot(e,X,c){
  const L=X.L, top=L[e.lv].z+(e.ztop!=null?e.ztop:-0.2), ybot=top-e.t, cv=c.cover.footing, out=[], notes=[];
  const hk=c.design&&c.design({type:'footing',el:e,w:e.w,d:e.d,t:e.t}), deff=e.t-cv-0.02, AsReq=(hk&&hk.AsFoot)||c.rho.footing*1000*deff*1000, pm=pickMesh(AsReq,[12,14,16,18,20],125);
  const q0=X.cols.find(q=>Math.abs(X.L[q.lv].z-top)<0.02&&Math.abs(q.p[0]-e.p[0])<=e.w/2+1e-6&&Math.abs(q.p[1]-e.p[1])<=e.d/2+1e-6);
  const dir=(alongX)=>{ const Lb=(alongX?e.w:e.d)-2*cv, Wd=(alongX?e.d:e.w)-2*cv, n=Math.floor((Wd*1000-pm.d)/pm.s+1e-9)+1, cdim=q0?(alongX?q0.w:q0.d):0, avail=((alongX?e.w:e.d)-cdim)/2-cv, need=ld(pm.d,c)/1000, hooked=q0?avail<need:false, y=ybot+cv+pm.d/2000+(alongX?pm.d/1000:0), hh=hook90(pm.d)/1000;
    if(q0)notes.push((alongX?'X':'Z')+' bars: straight length from the column face '+mm(avail)+' mm vs ld '+c10(need*1000)+' mm: '+(hooked?'90 deg hooks added':'straight bars ok'));
    uniq(n,Wd,pm.s/1000).forEach(t=>{ const P=(s,yy)=>alongX?[e.p[0]+s,yy,e.p[1]+t]:[e.p[0]+t,yy,e.p[1]+s];
      if(hooked)out.push(mkBar('bottom '+(alongX?'X':'Z'),pm.d,'U2',[P(-Lb/2,y+hh),P(-Lb/2,y),P(Lb/2,y),P(Lb/2,y+hh)],[90,90])); else out.push(mkBar('bottom '+(alongX?'X':'Z'),pm.d,'ST',[P(-Lb/2,y),P(Lb/2,y)],[]));  }); return n; };
  const nx=dir(true), nz=dir(false);
  return {bars:out,notes,info:{d:pm.d,s:pm.s,nx,nz,AsReq,As:pm.As}};
}
/* ---- slabs: rectangular pieces, bottom mesh both ways, top bars over interior supports ---- */
function detSlab(e,X,c,tops){
  const L=X.L, z=L[e.lv].z, isSog=e.rc==='sog', t=e.t, x0=Math.min(e.a[0],e.b[0]), x1=Math.max(e.a[0],e.b[0]), z0=Math.min(e.a[1],e.b[1]), z1=Math.max(e.a[1],e.b[1]), Lx=x1-x0, Lz=z1-z0, out=[], notes=[];
  const cv=c.cover[isSog?'sog':'slab'], ybot=z-t;
  if(isSog){ const bar=8, s=0.2, y=z-cv-bar/2000;
    const nz=Math.floor((Lz-2*cv)/s+1e-9)+1, nx=Math.floor((Lx-2*cv)/s+1e-9)+1;
    uniq(nz,0,s).forEach(tt=>out.push(mkBar('mesh X',bar,'ST',[[x0+cv,y,(z0+z1)/2+tt],[x1-cv,y,(z0+z1)/2+tt]],[]))); uniq(nx,0,s).forEach(tt=>out.push(mkBar('mesh Z',bar,'ST',[[(x0+x1)/2+tt,y-bar/1000,z0+cv],[(x0+x1)/2+tt,y-bar/1000,z1-cv]],[])));
    notes.push('single mesh near the top, 8 mm at 200 mm each way (shrinkage / temperature, rule of thumb)'); return {bars:out,notes,info:{d:bar,s:200}}; }
  const way=e.way||(Math.max(Lx,Lz)/Math.min(Lx,Lz)>=2?'one':'two'), shortX=Lx<=Lz, hk=c.design&&c.design({type:'slab',el:e,t,way});
  const rho=way==='one'?c.rho.slabOne:c.rho.slab, deff=(t-cv-0.01)*1000, AsReq=(hk&&hk.AsSlab)||rho*1000*deff, pm=pickMesh(AsReq,[8,10,12],150);
  const lay=(alongX,first)=>{ const Lb=(alongX?Lx:Lz)-2*cv, Wd=(alongX?Lz:Lx)-2*cv, n=Math.floor(Wd*1000/pm.s+1e-9)+1, y=ybot+cv+pm.d/2000+(first?0:pm.d/1000);
    uniq(n,0,pm.s/1000).forEach(tt=>{ const cx=(x0+x1)/2, cz=(z0+z1)/2; out.push(mkBar('bottom '+(alongX?'X':'Z')+(way==='one'&&!first?' (distribution)':''),pm.d,'ST',alongX?[[cx-Lb/2,y,cz+tt],[cx+Lb/2,y,cz+tt]]:[[cx+tt,y,cz-Lb/2],[cx+tt,y,cz+Lb/2]],[])); }); };
  lay(shortX,true); lay(!shortX,false);
  (tops||[]).filter(q=>q.id===e.id).forEach(q=>{ const td=8, ts=200, n=Math.floor((q.hi-q.lo-2*cv)*1000/ts+1e-9)+1, y=z-cv-td/2000, half=q.ext;
    uniq(n,0,ts/1000).forEach(tt=>{ const m=(q.lo+q.hi)/2+tt; out.push(mkBar('top at support',td,'ST',q.vert?[[q.line-half,y,m],[q.line+half,y,m]]:[[m,y,q.line-half],[m,y,q.line+half]],[])); }); });
  notes.push(way+'-way, bottom bars '+pm.d+' mm at '+pm.s+' mm both ways (preliminary ratio '+(rho*100).toFixed(2)+' %)');
  return {bars:out,notes,info:{d:pm.d,s:pm.s,way,AsReq,As:pm.As}};
}
/* ---- stair flight (waist slab) ---- */
function detStair(e,X,c){
  const L=X.L, z=L[e.lv].z, dx=e.b[0]-e.a[0], dz=e.b[1]-e.a[1], Lh=Math.hypot(dx,dz), inc=Math.hypot(Lh,e.H), u=[dx/Lh,dz/Lh], l=[-u[1],u[0]], tw=e.tw||Math.ceil(Lh/20*100-1e-9)/100, cv=c.cover.stair, out=[];
  const P=(s,tt)=>[e.a[0]+u[0]*s+l[0]*tt, z+e.H*s/Lh-tw*inc/Lh+cv+0.006, e.a[1]+u[1]*s+l[1]*tt];
  const hk=c.design&&c.design({type:'stair',el:e,tw}), AsReq=(hk&&hk.AsSlab)||c.rho.stair*1000*(tw*1000-cv*1000-8), pm=pickMesh(AsReq,[10,12,14],125), an=0.3;
  const n=Math.floor((e.w-2*cv)*1000/pm.s+1e-9)+1; uniq(n,0,pm.s/1000).forEach(tt=>{ const a=P(-an,tt), b=P(Lh+an,tt); out.push(mkBar('main (along flight)',pm.d,'ST',[a,b],[])); });
  const nd=Math.floor((inc-2*cv)/0.2+1e-9)+1; uniq(nd,0,0.2).forEach(sv=>{ const s=Lh/2+sv*Lh/inc, a=P(s,-(e.w/2-cv)), b=P(s,e.w/2-cv); a[1]+=pm.d/1000; b[1]+=pm.d/1000; out.push(mkBar('distribution',8,'ST',[a,b],[])); });
  return {bars:out,notes:['waist slab '+Math.round(tw*1000)+' mm, main bars '+pm.d+' mm at '+pm.s+' mm; top steel at the supports and landings not detailed'],info:{d:pm.d,s:pm.s,tw,AsReq}};
}
/* top bars over interior slab supports: edges shared by two slab pieces of different panels */
function slabTops(X){
  const sl=X.els.filter(e=>e.k==='floor'&&e.rc!=='sog'), out=[], bx=e=>({x0:Math.min(e.a[0],e.b[0]),x1:Math.max(e.a[0],e.b[0]),z0:Math.min(e.a[1],e.b[1]),z1:Math.max(e.a[1],e.b[1])}), T=1e-6;
  for(let i=0;i<sl.length;i++)for(let j=i+1;j<sl.length;j++){ const A=sl[i],B=sl[j]; if(A.lv!==B.lv||(A.panel&&A.panel===B.panel))continue; const a=bx(A), b=bx(B);
    const ext=0.3*Math.min(A.Ls||Math.min(a.x1-a.x0,a.z1-a.z0),B.Ls||Math.min(b.x1-b.x0,b.z1-b.z0));
    if(Math.abs(a.x1-b.x0)<T||Math.abs(b.x1-a.x0)<T){ const line=Math.abs(a.x1-b.x0)<T?a.x1:b.x1, lo=Math.max(a.z0,b.z0), hi=Math.min(a.z1,b.z1); if(hi-lo>0.2)out.push({id:A.id,vert:true,line,lo,hi,ext}); }
    if(Math.abs(a.z1-b.z0)<T||Math.abs(b.z1-a.z0)<T){ const line=Math.abs(a.z1-b.z0)<T?a.z1:b.z1, lo=Math.max(a.x0,b.x0), hi=Math.min(a.x1,b.x1); if(hi-lo>0.2)out.push({id:A.id,vert:false,line,lo,hi,ext}); } }
  return out;
}
/* ---- all members ---- */
function detailAll(model,cfg){
  const c=mergeCfg(cfg), X=ctx(model), tops=slabTops(X), mem=[];
  model.els.forEach(e=>{ const ty=memberType(e); if(!ty)return; let r=null;
    if(ty==='column'||ty==='neck')r=detCol(e,X,c); else if(ty==='beam'||ty==='tie')r=detBeam(e,X,c); else if(ty==='footing')r=detFoot(e,X,c); else if(ty==='slab'||ty==='sog')r=detSlab(e,X,c,tops); else if(ty==='stair')r=detStair(e,X,c);
    if(!r)return; /* bar groups per member: identical (role, d, shape, cut) bars are counted */
    const g={}; r.bars.forEach(b=>{ const k=b.role+'|'+b.d+'|'+b.shape+'|'+b.cut; (g[k]=g[k]||{role:b.role,d:b.d,shape:b.shape,legs:b.legs,cut:b.cut,bends:b.bends,n:0,insts:[]}); g[k].n++; g[k].insts.push(b.pts); });
    const groups=Object.keys(g).map(k=>g[k]).sort((p,q)=>p.role<q.role?-1:p.role>q.role?1:p.d-q.d);
    const sig=ty+'|'+groups.map(x=>x.role+':'+x.d+':'+x.shape+':'+x.cut+':'+x.n).join(';'); mem.push({id:e.id,el:e,type:ty,group:GROUP[ty],groups,notes:r.notes,info:r.info,sig,pos:[e.lv,e.p?e.p[0]:Math.min(e.a[0],e.b[0]),e.p?e.p[1]:Math.min(e.a[1],e.b[1])]}); });
  /* type marks by reinforcement signature, numbered in model order */
  mem.sort((a,b)=>a.pos[0]-b.pos[0]||a.pos[1]-b.pos[1]||a.pos[2]-b.pos[2]);
  const mk={}; mem.forEach(m=>{ const pre=PREF[m.type], t=mk[pre]=mk[pre]||{}; if(!(m.sig in t))t[m.sig]=pre+(Object.keys(t).length+1); m.tm=t[m.sig]; });
  return {cfg:c,members:mem};
}
function bbs(model,cfg,vol,D0){
  const D=D0||detailAll(model,cfg), rows=[], byTm={}; D.members.forEach(m=>{ (byTm[m.tm]=byTm[m.tm]||{tm:m.tm,type:m.type,group:m.group,members:[],groups:m.groups,notes:m.notes,info:m.info}).members.push(m.id); });
  const tms=Object.keys(byTm).sort((a,b)=>{ const pa=a.replace(/\d+$/,''), pb=b.replace(/\d+$/,''); return pa===pb?(+a.slice(pa.length))-(+b.slice(pb.length)):Object.keys(PREF).map(k=>PREF[k]).indexOf(pa)-Object.keys(PREF).map(k=>PREF[k]).indexOf(pb); });
  tms.forEach(tm=>{ const T=byTm[tm]; T.groups.forEach((g,i)=>{ const nTot=g.n*T.members.length, totLen=nTot*g.cut/1000, kg=totLen*wkg(g.d);
    rows.push({tm,mark:tm+'-'+(i+1),type:T.type,group:T.group,role:g.role,d:g.d,shape:g.shape,legs:g.legs,cut:g.cut,nPer:g.n,nMem:T.members.length,nTot,totLen:r4(totLen),kg:r4(kg)}); }); });
  const tot={byGroup:{},byDia:{},byType:{},kg:0,couplers:0}; rows.forEach(r=>{ tot.byGroup[r.group]=(tot.byGroup[r.group]||0)+r.kg; tot.byType[r.type]=(tot.byType[r.type]||0)+r.kg; tot.byDia[r.d]=(tot.byDia[r.d]||0)+r.kg; tot.kg+=r.kg; });
  ['byGroup','byType','byDia'].forEach(k=>Object.keys(tot[k]).forEach(x=>{ tot[k][x]=r4(tot[k][x]); })); tot.kg=r4(tot.kg); tot.tonnes=r4(tot.kg/1000);
  const marks=tms.map(tm=>({tm,type:byTm[tm].type,group:byTm[tm].group,n:byTm[tm].members.length,notes:byTm[tm].notes,info:byTm[tm].info,ids:byTm[tm].members}));
  const BAND={Footings:[60,100],Columns:[150,250],Beams:[130,180],Slabs:[70,100]}; let dens=null;
  if(vol){ dens={}; const T=tot.byType, m={Footings:[T.footing,vol.footing],Columns:[(T.column||0)+(T.neck||0),vol.column],Beams:[(T.beam||0)+(T.tie||0),(vol.tie||0)+(vol.beam||0)],Slabs:[T.slab,vol.slab],'Slab on grade':[T.sog,vol.sog]};
    Object.keys(m).forEach(g=>{ if(m[g][1]>0&&m[g][0]!=null)dens[g]={kgPerM3:Math.round(m[g][0]/m[g][1]*10)/10,band:BAND[g]||null}; }); if(vol.total>0)dens.All={kgPerM3:Math.round(tot.kg/vol.total*10)/10,band:[100,130]}; }
  return {rows,marks,totals:tot,cfg:D.cfg,members:D.members.length,density:dens,D};
}
const csv=B=>{ const q=s=>'"'+String(s).replace(/"/g,'""')+'"'; const h=['Bar mark','Member type mark','Member group','Role','Dia (mm)','Shape','Legs (mm)','Cut length (mm)','No. per member','No. of members','Total no.','Total length (m)','Weight (kg)'];
  return [h.map(q).join(',')].concat(B.rows.map(r=>[r.mark,r.tm,r.group,r.role,r.d,r.shape,r.legs.join('/'),r.cut,r.nPer,r.nMem,r.nTot,r.totLen,r.kg].map(q).join(','))).concat([['TOTAL','','','','','','','','','','','',B.totals.kg].map(q).join(','),['Preliminary demonstration values, not design approval'].map(q).join(',')]).join('\n'); };
return {CFG0,mergeCfg,ld,ldc,lap,lapC,ldh,hook90,hook135,table,pick,pickMesh,mkBar,detailAll,bbs,csv,slabTops,BARS,wkg,memberType,GROUP};
})();
/*@@RCSR_PURE_END*/

/* ==================== Part 2: R.X integration (browser) ==================== */
const RCSR={show:false,g:null,memo:null,built:null,timer:null};
const rcsrCfg=()=>RCSREB.mergeCfg((typeof DATA!=='undefined'&&DATA.rcsr&&DATA.rcsr.cfg)||{});
const rcsrModel=()=>({levels:RV.levels,grids:RV.grids,els:RV.els});
function rcsrPatch(p){ DATA.rcsr=DATA.rcsr||{cfg:{}}; const c=DATA.rcsr.cfg; Object.keys(p).forEach(k=>{ if(p[k]&&typeof p[k]==='object'&&!Array.isArray(p[k]))c[k]=Object.assign(c[k]||{},p[k]); else c[k]=p[k]; }); try{ persist(); }catch(e){} if(RCSR.show){ RCSR.built=null; try{ rcsr3d(); }catch(e){} } }
function rcsrFp(){ const s=JSON.stringify(RV.els.filter(e=>RCSREB.memberType(e)))+JSON.stringify(RV.levels)+JSON.stringify((DATA.rcsr&&DATA.rcsr.cfg)||{}); let h=5381; for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0; return s.length+':'+h; }
function rcsrCalc(){ const fp=rcsrFp(); if(RCSR.memo&&RCSR.memo.fp===fp)return RCSR.memo; const m=rcsrModel(), cfg=rcsrCfg(), vol=RCSKEL.netVol(m), D=RCSREB.detailAll(m,cfg), B=RCSREB.bbs(m,cfg,vol,D); RCSR.memo={fp,B,vol,D}; return RCSR.memo; }
const rcsrHas=()=>RV.els.some(e=>RCSREB.memberType(e));
/* ---- Q.X / BOQ: one reinforcing-steel line per member group (kg), computed from the bar bending schedule ---- */
{ const _gi=getItems; getItems=function(){ let a=_gi(); try{ if(RV.els.some(e=>e.src==='rcs')){ const T=rcsrCalc().B.totals, N={Footings:['Footings','القواعد'],Columns:['Columns and neck columns','الأعمدة ورقاب الأعمدة'],Beams:['Beams and tie beams','الكمرات والسملات'],Slabs:['Slabs and slab on grade','البلاطات والأرضية'],Stairs:['Stairs','السلالم']}; let n=0;
  Object.keys(N).forEach(g=>{ if(T.byGroup[g]>0)a.push(applyData({code:'RB0'+(++n),n:['Reinforcing steel: '+N[g][0]+' (BBS, preliminary)','حديد تسليح: '+N[g][1]+' (جدول تقطيع، مبدئي)'],qty:+T.byGroup[g].toFixed(2),unit:'kg',ifc:'IfcReinforcingBar',cat:'Reinforcement',fam:'—',typ:'RB',mat:['Deformed bars, grade as set in the BBS dialog','حديد مشرشر، الرتبة من نافذة الجدول'],lines:[['Computed from the bar bending schedule of the R.X members; preliminary demonstration detailing, not design approval','محسوب من جدول تقطيع حديد عناصر R.X؛ تفصيل مبدئي تجريبي مش اعتماد تصميم']],st:'assumed'})); }); } }catch(e){} return a; }; }
/* ---- 3D rebar: thin instanced cylinders, one InstancedMesh per member type; concrete turns transparent while shown ---- */
function rcsrGhost(){ if(!RV.g)return; RV.g.traverse(o=>{ if(o.isMesh&&o.material&&!o.userData.rcsrG){ o.material=o.material.clone(); o.material.transparent=true; o.material.opacity=Math.min(o.material.opacity,0.16); o.material.depthWrite=false; o.userData.rcsrG=1; } }); }
function rcsr3d(){
  if(typeof scene==='undefined'||!scene)return; const fp=RCSR.show?rcsrFp():null;
  if(RCSR.show&&RCSR.g&&RCSR.built===fp)return;
  if(RCSR.g){ scene.remove(RCSR.g); RCSR.g.traverse(o=>{ if(o.geometry&&o.geometry!==RCSR.geo)o.geometry.dispose(); if(o.material)o.material.dispose(); }); RCSR.g=null; }
  if(!RCSR.show){ RCSR.built=null; return; }
  const C=rcsrCalc(), COL={footing:0xd35f5f,neck:0xd99a4a,column:0xe0b84a,tie:0x6fb36f,beam:0x4fa3d9,slab:0x9a7fd1,sog:0x8aa0a8,stair:0xcf7fb0}, segs={};
  C.D.members.forEach(mb=>mb.groups.forEach(g=>g.insts.forEach(pl=>{ for(let i=1;i<pl.length;i++)(segs[mb.type]=segs[mb.type]||[]).push([pl[i-1],pl[i],g.d]); })));
  const grp=new T.Group(), geo=RCSR.geo=RCSR.geo||new T.CylinderGeometry(1,1,1,6,1,false), y0=rvY0(), M=new T.Matrix4(), q=new T.Quaternion(), up=new T.Vector3(0,1,0), v=new T.Vector3(), sc=new T.Vector3(), ps=new T.Vector3();
  Object.keys(segs).forEach(ty=>{ const a=segs[ty], im=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color:COL[ty]||0xcccccc,roughness:.55,metalness:.25}),a.length);
    a.forEach((s,i)=>{ v.set(s[1][0]-s[0][0],s[1][1]-s[0][1],s[1][2]-s[0][2]); const len=v.length()||1e-6; v.normalize(); q.setFromUnitVectors(up,v); ps.set((s[0][0]+s[1][0])/2,(s[0][1]+s[1][1])/2+y0,(s[0][2]+s[1][2])/2); const r=Math.max(s[2]/2000,0.006); sc.set(r,len,r); M.compose(ps,q,sc); im.setMatrixAt(i,M); });
    im.instanceMatrix.needsUpdate=true; im.userData.rcsr=ty; grp.add(im); });
  scene.add(grp); RCSR.g=grp; RCSR.built=fp; rcsrGhost();
}
function rcsrToggle(force){
  if(!rcsrHas()){ xSt(b2('No beams, columns, footings or slabs in the model to reinforce.','مفيش كمرات أو أعمدة أو قواعد أو بلاطات في الموديل للتسليح.')); return false; }
  RCSR.show=force!=null?!!force:!RCSR.show; RCSR.built=null;
  if(RCSR.show){ rcsr3d(); const n=RCSR.g?RCSR.g.children.reduce((s,m)=>s+m.count,0):0; xSt(b2('Rebar 3D: ON ('+n+' bar segments). Concrete shown transparent. Preliminary detailing, not design.','حديد التسليح 3D: شغّال ('+n+' قطعة). الخرسانة شفافة. تفصيل مبدئي مش تصميم.')); }
  else { rcsr3d(); try{ rvBuild(); }catch(e){} xSt(b2('Rebar 3D: OFF','حديد التسليح 3D: مقفول')); }
  return RCSR.show;
}
{ const _b=rvBuild; rvBuild=function(){ _b.apply(this,arguments); if(RCSR.show){ rcsrGhost(); clearTimeout(RCSR.timer); RCSR.timer=setTimeout(()=>{ try{ rcsr3d(); }catch(e){} },80); } }; }
/* ---- dialogs ---- */
const rcsrOv=(id,w)=>{ const old=document.getElementById(id); if(old)old.remove(); const ov=el('div',{id,style:'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center'}), box=el('div',{style:'background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:14px;width:min('+w+'px,96vw);max-height:92vh;overflow:auto;font-size:12px'}); ov.append(box); ov.onclick=e=>{ if(e.target===ov)ov.remove(); }; document.body.appendChild(ov); return {ov,box,close:()=>ov.remove()}; };
const rcsrNote=()=>el('div',{style:'color:#e0a040;margin:4px 0 8px'},el('b',{text:b2('PRELIMINARY demonstration values - not design approval. ','قيم تجريبية مبدئية - مش اعتماد تصميم. ')}),el('span',{text:b2('Steel areas come from simple ratios (rho x b x d) unless a design result is plugged in; laps use the ACI-form formula below, not ECP 203.','مساحات الحديد من نسب بسيطة إلا لو فيه نتيجة تصميم؛ الوصلات بصيغة ACI مش الكود المصري.')}));
const rcsrTh=(...t)=>el('tr',{},...t.map(x=>el('th',{text:x,style:'text-align:start;padding:2px 6px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--panel);white-space:nowrap'})));
const rcsrTd=(t,st)=>el('td',{text:String(t),style:'padding:2px 6px;white-space:nowrap;'+(st||'')});
function rcsrDialog(){
  const {box,close}=rcsrOv('rcsrDlg',1180); const C=rcsrCalc(), B=C.B, cfg=B.cfg, T=B.totals, f1=x=>(+x).toFixed(1);
  const inp=(k,v,w)=>{ const i=el('input',{type:'number',value:v,style:'width:'+(w||60)+'px'}); i.dataset.k=k; return i; };
  const fy=inp('fy',cfg.fy), fcu=inp('fcu',cfg.fcu), st=inp('st',cfg.st,44), cp=inp('coupler',cfg.coupler,44), lm=el('select',{},el('option',{value:'tension',text:b2('tension lap','وصلة شد')}),el('option',{value:'compression',text:b2('compression lap','وصلة ضغط')})); lm.value=cfg.colLap;
  const apply=()=>{ rcsrPatch({fy:+fy.value,fcu:+fcu.value,st:+st.value,coupler:+cp.value||0,colLap:lm.value}); rcsrDialog(); };
  box.append(el('div',{style:'display:flex;justify-content:space-between;align-items:center'},el('b',{text:b2('Reinforcement detailing and bar bending schedule (BBS)','تفصيل التسليح وجدول تقطيع الحديد'),style:'font-size:15px'}),el('button',{text:b2('Close','إغلاق'),onclick:close})),rcsrNote(),
    el('div',{style:'display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:6px'},el('label',{},el('span',{text:'fy MPa '}),fy),el('label',{},el('span',{text:'fcu MPa '}),fcu),el('label',{},el('span',{text:b2('stirrup mm ','كانة مم ')}),st),el('label',{},el('span',{text:b2('column splice ','وصلة الأعمدة ')}),lm),el('label',{},el('span',{text:b2('couplers from dia (0 = lap) ','وصلات ميكانيكية من قطر (0 = تراكب) ')}),cp),el('button',{class:'on',text:b2('Apply','طبّق'),onclick:apply}),
      el('button',{text:b2('Rebar 3D on/off','حديد 3D تشغيل/إيقاف'),onclick:()=>{ rcsrToggle(); }}),el('button',{text:b2('Export CSV','تصدير CSV'),onclick:()=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([RCSREB.csv(B)],{type:'text/csv'})); a.download='bar_bending_schedule.csv'; a.click(); }}),el('button',{text:b2('Lap / development calculator','حاسبة طول التراكب والتثبيت'),onclick:()=>rcsrLdDialog()})));
  const tb=el('table',{style:'border-collapse:collapse;width:100%'}); tb.append(rcsrTh(b2('Bar mark','علامة'),b2('Member / role','العنصر / الدور'),b2('Shape','الشكل'),'Ø mm',b2('Legs mm','الأضلاع مم'),b2('Cut length mm','طول القطع مم'),b2('No. per member','عدد/عنصر'),b2('Members','عناصر'),b2('Total no.','إجمالي'),b2('Total length m','الطول الكلي م'),b2('Weight kg','الوزن كجم')));
  let last=''; B.rows.forEach(r=>{ if(r.tm!==last){ last=r.tm; const m=B.marks.find(x=>x.tm===r.tm); const tr=el('tr',{style:'background:rgba(127,127,127,.12)'},el('td',{colSpan:11,style:'padding:3px 6px'},el('b',{text:r.tm+'  '+r.group+' - '+r.type+'   x'+m.n+' '+b2('member(s)','عنصر')}),el('span',{style:'opacity:.75',text:'   '+(m.notes||[]).join(' | ')}))); tb.append(tr); }
    tb.append(el('tr',{},rcsrTd(r.mark),rcsrTd(r.role),rcsrTd(r.shape),rcsrTd(r.d),rcsrTd(r.legs.join(' / ')),rcsrTd(r.cut),rcsrTd(r.nPer),rcsrTd(r.nMem),rcsrTd(r.nTot),rcsrTd(f1(r.totLen)),rcsrTd(f1(r.kg),'text-align:end'))); });
  tb.append(el('tr',{style:'font-weight:bold'},el('td',{colSpan:10,text:b2('TOTAL (tonnes: '+T.tonnes.toFixed(3)+')','الإجمالي (طن: '+T.tonnes.toFixed(3)+')'),style:'padding:4px 6px;border-top:2px solid var(--line)'}),el('td',{text:f1(T.kg),style:'padding:4px 6px;border-top:2px solid var(--line);text-align:end'})));
  const sum=el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:10px 0'});
  const mini=(title,rows)=>{ const t=el('table',{style:'border-collapse:collapse'}); t.append(el('tr',{},el('th',{text:title,colSpan:rows[0]?rows[0].length:2,style:'text-align:start;padding:2px 6px;border-bottom:1px solid var(--line)'}))); rows.forEach(r=>t.append(el('tr',{},...r.map((x,i)=>rcsrTd(x,i?'text-align:end':''))))); return t; };
  sum.append(mini(b2('Tonnage per member group','الأطنان لكل مجموعة'),Object.keys(T.byGroup).map(g=>[g,f1(T.byGroup[g])+' kg'])),mini(b2('Weight per diameter','الوزن لكل قطر'),Object.keys(T.byDia).sort((a,b)=>a-b).map(d=>['Ø'+d,f1(T.byDia[d])+' kg'])),
    mini(b2('Steel per m3 of concrete (rule-of-thumb band, information only)','كجم حديد لكل م3 خرسانة (نطاق مبدئي)'),Object.keys(B.density||{}).map(g=>{ const d=B.density[g], bd=d.band; return [g,d.kgPerM3+' kg/m3',bd?(d.kgPerM3>=bd[0]&&d.kgPerM3<=bd[1]?'in band '+bd.join('-'):'OUTSIDE band '+bd.join('-')):'']; })));
  const fm=el('div',{style:'opacity:.85;margin-top:6px;white-space:pre-wrap'},el('b',{text:b2('Formulas used','الصيغ المستخدمة')}),el('div',{text:"f'c = 0.8 fcu (rough). Tension development ld = fy psi_t psi_e / (2.1 lambda sqrt(f'c)) db for db <= 19, / (1.7 ...) for db >= 22, min 300 mm (ACI 318M simplified form, spacing and cover case); tension lap = 1.3 ld, min 300 mm; compression lap = max(300, 0.071 fy db); 90 deg hook tail 12 db; 135 deg stirrup hook tail max(6 db, 75 mm); bar weight = d^2/162 kg/m; cut length = sum of outside legs - bend deductions (90 deg: 2 db, 135 deg: 3 db). ECP 203 uses a different bond-stress expression and is NOT coded: compare with your licensed copy. Stock-length waste, chairs/spacers and laps of slab bars are not added. Preliminary demonstration values, not design approval."}));
  box.append(tb,sum,fm);
}
function rcsrLdDialog(){
  const {box,close}=rcsrOv('rcsrLdDlg',900), cfg=rcsrCfg(); const body=el('div'), I={};
  const mk=(k,l,v)=>{ const i=el('input',{type:'number',value:v,step:'any',style:'width:70px'}); I[k]=i; i.oninput=draw; return el('label',{style:'margin-inline-end:10px'},el('span',{text:l+' '}),i); };
  const cs=el('select',{onchange:draw},el('option',{value:'1',text:b2('good spacing, cover and stirrups (2.1 / 1.7)','تباعد وغطاء وكانات جيدة (2.1 / 1.7)')}),el('option',{value:'0',text:b2('other cases (1.4 / 1.1)','حالات أخرى (1.4 / 1.1)')}));
  function draw(){ const c={fy:+I.fy.value,fcu:+I.fcu.value,psiT:+I.pt.value,psiE:+I.pe.value,lambda:+I.la.value,confined:cs.value==='1',lapF:+I.lf.value}; body.innerHTML=''; const t=el('table',{style:'border-collapse:collapse;width:100%'}); t.append(rcsrTh('Ø mm',b2('ld tension mm','ld شد مم'),b2('lap tension mm','تراكب شد مم'),b2('ld compression mm','ld ضغط مم'),b2('lap compression mm','تراكب ضغط مم'),b2('hooked ldh mm','تثبيت بخطاف مم'),b2('90° tail mm','ذيل 90 مم'),b2('135° tail mm','ذيل 135 مم'),'kg/m'));
    RCSREB.table(c).forEach(r=>t.append(el('tr',{},rcsrTd(r.d),rcsrTd(r.ld),rcsrTd(r.lap),rcsrTd(r.ldc),rcsrTd(r.lapC),rcsrTd(r.ldh),rcsrTd(r.h90),rcsrTd(r.h135),rcsrTd(r.kgm)))); body.append(el('div',{text:"f'c = 0.8 x fcu = "+(0.8*c.fcu).toFixed(1)+' MPa (rough cylinder equivalent)',style:'margin:4px 0'}),t); }
  box.append(el('div',{style:'display:flex;justify-content:space-between'},el('b',{text:b2('Development and lap length calculator','حاسبة طول التثبيت والتراكب'),style:'font-size:15px'}),el('button',{text:b2('Close','إغلاق'),onclick:close})),rcsrNote(),
    el('div',{style:'margin:6px 0'},mk('fy','fy MPa',cfg.fy),mk('fcu','fcu MPa',cfg.fcu),mk('pt','psi_t',cfg.psiT),mk('pe','psi_e',cfg.psiE),mk('la','lambda',cfg.lambda),mk('lf','lap factor',cfg.lapF),cs),body,
    el('div',{style:'opacity:.8;margin-top:8px',text:"ld = fy psi_t psi_e / (2.1 lambda sqrt(f'c)) x db (db <= 19; 1.7 for db >= 22), min 300 mm, rounded up to 10 mm. Lap = lap factor x ld (1.3 = class B). Compression: ld = max(0.24 fy db / (lambda sqrt(f'c)), 0.043 fy db, 200), lap = max(300, 0.071 fy db). Hooked: ldh = max(8 db, 150, 0.24 psi_e fy db / (lambda sqrt(f'c))). Form follows ACI 318M simplified expressions; ECP 203 is not coded. Rule-of-thumb check: ld about 40-50 db for high-yield bars."})); draw();
}
function rcsrMember(){ const e=RV.els.find(x=>x.id===RV.sel); if(!e||!RCSREB.memberType(e)){ xSt(b2('Select a footing, column, beam, slab or stair first.','اختار قاعدة أو عمود أو كمرة أو بلاطة أو سلم الأول.')); return null; }
  const m=rcsrCalc().D.members.find(x=>x.id===e.id); if(!m)return null; const txt=m.tm+': '+m.groups.map(g=>g.n+' x '+g.role+' '+g.d+' mm ('+g.shape+', cut '+g.cut+' mm)').join('; '); xSt(txt); return {tm:m.tm,groups:m.groups.map(g=>({role:g.role,d:g.d,shape:g.shape,cut:g.cut,n:g.n})),notes:m.notes}; }
function rcsrCover(a){ const c=rcsrCfg().cover, k=Object.keys(c);
  if(a&&typeof a==='object'){ rcsrPatch({cover:a}); return rcsrCfg().cover; }
  const s=prompt(b2('Cover in mm (outside of stirrup) for: '+k.join(', '),'الغطاء الخرساني بالمم لـ: '+k.join(', ')),k.map(x=>Math.round(c[x]*1000)).join(',')); if(s==null)return; const v=s.split(/[\s,;]+/).filter(x=>x!=='').map(Number); if(v.length!==k.length||v.some(x=>!isFinite(x)||x<10||x>100)){ xSt(b2('Enter '+k.length+' numbers between 10 and 100.','اكتب '+k.length+' أرقام بين 10 و100.')); return; }
  const o={}; k.forEach((x,i)=>{ o[x]=v[i]/1000; }); rcsrPatch({cover:o}); xSt(b2('Cover updated; the schedule and the 3D bars follow.','تم تحديث الغطاء؛ الجدول والحديد 3D هيتحدثوا.')); try{ if(RCSR.show){ RCSR.built=null; rcsr3d(); } }catch(e){} }
function rcsrCoupler(a){ if(a!=null&&typeof a!=='object'){ rcsrPatch({coupler:+a||0}); return rcsrCfg().coupler; } const s=prompt(b2('Use mechanical couplers instead of laps for bars of this diameter and larger (mm, 0 = laps)','استخدم وصلات ميكانيكية بدل التراكب للأقطار من (مم، 0 = تراكب)'),String(rcsrCfg().coupler||0)); if(s==null)return; rcsrPatch({coupler:+s||0}); xSt(b2('Couplers from Ø'+(+s||0)+' (0 = laps)','وصلات ميكانيكية من قطر '+(+s||0)+' (0 = تراكب)')); }
XCMD('rcs_rebar','rebar','Reinforcement detail and BBS','تفصيل التسليح وجدول الحديد',function(a){ if(!rcsrHas()){ xSt(b2('No structural members in the model. Use RC Skeleton first.','مفيش عناصر إنشائية في الموديل. استخدم الهيكل الخرساني الأول.')); return null; } if(a&&a.silent){ const B=rcsrCalc().B; return {totals:B.totals,marks:B.marks.length,rows:B.rows.length}; } rcsrDialog(); });
XCMD('rcs_ld','gear','Lap and development length','طول التراكب والتثبيت',function(){ rcsrLdDialog(); });
XCMD('rcs_rebar3d','rebar','Rebar 3D on/off','حديد 3D تشغيل/إيقاف',function(a){ return rcsrToggle(a===true||a===false?a:null); },()=>RCSR.show);
XCMD('rcs_cover','layer','Concrete cover','الغطاء الخرساني',rcsrCover);
XCMD('rcs_coupler','link','Rebar couplers','وصلات الحديد',rcsrCoupler);
XCMD('rcs_member','rebar','Bars of the selected member','حديد العنصر المحدد',rcsrMember);
if(typeof XDESC!=='undefined'){
  XDESC.rcs_rebar=['Detail the reinforcement of every footing, column, beam, tie beam, slab and stair in the R.X model and show the bar bending schedule (mark, shape, diameter, cut length, number, weight, tonnage per member type). Preliminary values','فصّل حديد كل القواعد والأعمدة والكمرات والبلاطات والسلالم وأظهر جدول التقطيع (علامة، شكل، قطر، طول، عدد، وزن) - قيم مبدئية'];
  XDESC.rcs_ld=['Development and lap length calculator (ACI 318M simplified form, stated on screen; not ECP 203)','حاسبة طول التثبيت والتراكب (صيغة ACI مبسطة؛ مش الكود المصري)'];
  XDESC.rcs_rebar3d=['Toggle the 3D view of the reinforcing bars (instanced thin cylinders, concrete transparent)','تشغيل/إيقاف عرض حديد التسليح في 3D'];
  XDESC.rcs_cover=['Set the concrete cover per member type (mm); schedule and 3D bars follow. Argument {footing,neck,column,tie,beam,slab,sog,stair} in metres for scripts','ضبط الغطاء الخرساني لكل نوع عنصر (مم)'];
  XDESC.rcs_coupler=['Use mechanical couplers instead of laps from a given bar diameter (0 = laps)','استخدم وصلات ميكانيكية بدل التراكب من قطر معين'];
  XDESC.rcs_member=['Show the bars of the selected member (mark, number, diameter, shape, cut length)','عرض حديد العنصر المحدد'];
}
/* ---- ribbon: Structure / Reinforcement. The stub buttons Cover, Area, Path and Rebar Couplers are now real; Fabric Sheet stays a stub; Rebar opens the BBS when the project is not the lift-station sample ---- */
P2R.ov('Structure','Reinforcement','Cover',()=>XC.rcs_cover.run()); P2R.ov('Structure','Reinforcement','Area',()=>XC.rcs_rebar.run()); P2R.ov('Structure','Reinforcement','Path',()=>XC.rcs_rebar3d.run()); P2R.ov('Structure','Reinforcement','Rebar Couplers',()=>XC.rcs_coupler.run());
rcskRib('Structure','Reinforcement','rcs_rebar','Detail and BBS','تفصيل وجدول حديد'); rcskRib('Structure','Reinforcement','rcs_ld','Lap and Development','تراكب وتثبيت'); rcskRib('Structure','Reinforcement','rcs_rebar3d','Rebar 3D','حديد 3D');
{ const base=XC.p_rebar, _r=base&&base.run; if(_r)base.run=function(){ try{ if(typeof tpStation==='function'&&!tpStation()&&rcsrHas())return XC.rcs_rebar.run(); }catch(e){} return _r.apply(this,arguments); }; }
/* ---- Properties: a button that shows the bars of the selected member (computed on demand, never at selection time) ---- */
{ const _rp=rvProps; rvProps=function(){ _rp.apply(this,arguments); try{ const e=RV.els.find(x=>x.id===RV.sel); if(!e||!RVP||!RCSREB.memberType(e))return;
  const box=el('div',{class:'small',style:'margin-top:6px'}); const show=()=>{ box.textContent=''; const m=rcsrCalc().D.members.find(x=>x.id===e.id); if(!m)return; box.append(el('b',{text:b2('Reinforcement (preliminary) ','التسليح (مبدئي) ')+m.tm}),...m.groups.map(g=>el('div',{text:g.n+' x '+g.role+' Ø'+g.d+'  '+g.shape+'  '+g.cut+' mm'})),...m.notes.slice(0,3).map(t=>el('div',{style:'opacity:.7',text:t}))); };
  if(RCSR.memo&&RCSR.memo.fp===rcsrFp())show(); else box.append(el('button',{text:b2('Show reinforcement','اعرض التسليح'),onclick:show})); RVP.append(box); }catch(x){} }; }
