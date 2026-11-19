function buildModel(){
 while(root.children.length){const c=root.children[0]; c.traverse(o=>{if(o.geometry)o.geometry.dispose(); if(o.material&&o.material.map)o.material.map.dispose();}); root.remove(c);} parts={}; cur=root; TRIS=null; trisVer++;
 water=new T.Group(); levelsG=new T.Group(); labelsG=new T.Group(); groundG=new T.Group(); root.add(water,levelsG,labelsG,groundG);
 const {t,D,H,cL,cW,cF,n,sp}=P, tB=P.tB??t, tT=P.tT??t, tCW=P.tCW??t, tCF=P.tCF??t, tCT=P.tCT??t, R0=D/2, R1=R0+t, GY=H-.3, PX=.15, VX=Math.min(.75,R0*.55), PY=cF+.5, HX=R1+cL*.34, IY=1.82+.1575;
 const pz=i=>(i-(n-1)/2)*sp; A.pump=Math.min(A.pump,n-1);
 const cx=-.75*R1; let La=0; for(let i=0;i<n;i++)La=Math.max(La,Math.hypot(PX-cx,pz(i))); La+=.5;
 G={t,tB,tT,tCW,tCF,tCT,D,H,cL,cW,cF,n,sp,R0,R1,GY,PX,VX,PY,HX,IY,pz,cx,La,lift:H+.45,dh:H+.5,swing:1.3,J:null,hook:null,cable:null,trol:null,len:{}};
 const lenA=Math.min(3,2*R0*.99), bx=-.57*R0, bz=0, cxo=R1+cL*.7, XL=cL+t+tCW, ZW=cW+2*tCW, xm=R0+XL/2;
 /* ---- concrete elements ---- */
 part('wwall',()=>{const s=new T.Shape(); s.absarc(0,0,R1,0,Math.PI*2,false); const h=new T.Path(); h.absarc(0,0,R0,0,Math.PI*2,true); s.holes.push(h); extruded(s,H,cCon,0);});
 part('wbase',()=>{mesh(new T.CylinderGeometry(R1,R1,tB,64),cCon,0,-tB/2,0);});
 part('pcblind',()=>{mesh(new T.CylinderGeometry(R1+.1,R1+.1,.1,64),cFill,0,-tB-.05,0);});
 part('wtop',()=>{const s=new T.Shape(); s.absarc(0,0,R1,0,Math.PI*2,false); s.holes.push(rectPath(PX-.4,-lenA/2,PX+.4,lenA/2)); s.holes.push(rectPath(bx-.4,bz-.4,bx+.4,bz+.4)); extruded(s,tT,cCon,H-tT);});
 part('cfill',()=>{box(XL,cF-tCF+tB,ZW,cFill,xm,(cF-tCF-tB)/2,0);});
 part('cfloor',()=>{box(XL,tCF,ZW,cCon,xm,cF-tCF/2,0);});
 part('cwalls',()=>{box(tCW,H-cF,ZW,cCon,R0+tCW/2,(cF+H)/2,0); box(tCW,H-cF,ZW,cCon,R1+cL+tCW/2,(cF+H)/2,0); box(cL,H-cF,tCW,cCon,R1+cL/2,(cF+H)/2,cW/2+tCW/2); box(cL,H-cF,tCW,cCon,R1+cL/2,(cF+H)/2,-cW/2-tCW/2);});
 part('ctop',()=>{const s=new T.Shape(); s.moveTo(R0,-ZW/2); s.lineTo(R0+XL,-ZW/2); s.lineTo(R0+XL,ZW/2); s.lineTo(R0,ZW/2); s.closePath(); s.holes.push(rectPath(cxo-.4,cW/2-.8,cxo+.4,cW/2)); extruded(s,tCT,cCon,H-tCT);});
 /* ---- covers with handles ---- */
 const cover=(w,d,x,z,i)=>part('covers',()=>{box(w,.06,d,cCover,x,H+.03,z); box(.18,.03,.04,cDark,x,H+.075,z-d/2+.12); box(.18,.03,.04,cDark,x,H+.075,z+d/2-.12); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(k=>cyl(.012,.03,cDark,x+k[0]*(w/2-.05),H+.075,z+k[1]*(d/2-.05),6));},i);
 cover(.9,lenA+.1,PX,0,0); cover(.9,.9,bx,bz,1); cover(.9,.9,cxo,cW/2-.4,2);
 /* ---- per pump: pump, valves, flanges, bolts, bends, supports, discharge pipe ---- */
 const FX=[R1-.03,R1+.145,R1+.40,R1+.57];
 for(let i=0;i<n;i++){const z=pz(i);
  part('pump',()=>{cyl(.17,.55,cRed,PX,.45,z); cyl(.23,.2,cDark,PX,.12,z); [0,1,2].forEach(k=>cyl(.185,.012,cDark,PX,.3+k*.1,z)); box(.34,.05,.34,cDark,PX,.025,z);
    const te=new T.Mesh(new T.TorusGeometry(.05,.01,6,12),cSteel); te.position.set(PX,.76,z); te.rotation.x=Math.PI/2; cur.add(te); pipe([PX,.76,z],[PX+.35,1.1,z],.006,cSteel); pipe([PX+.35,1.1,z],[PX+.35,1.4,z],.006,cSteel);},i);
  part('dj',()=>{cyl(.085,.14,cDark,R1+.05,PY,z).rotation.z=Math.PI/2; [-.05,0,.05].forEach(k=>{const r=cyl(.095,.01,cSteel,R1+.05+k,PY,z); r.rotation.z=Math.PI/2;});},i);
  part('nrv',()=>{const nv=new T.Mesh(new T.ConeGeometry(.09,.2,16),cYel); nv.rotation.z=-Math.PI/2; nv.position.set(R1+.27,PY,z); cur.add(nv); cyl(.075,.06,cYel,R1+.27,PY+.09,z);},i);
  part('slv',()=>{box(.12,.2,.2,cGrn,R1+.49,PY,z); cyl(.012,.22,cDark,R1+.49,PY+.18,z,8); const hw=new T.Mesh(new T.TorusGeometry(.07,.012,6,16),cDark); hw.position.set(R1+.49,PY+.3,z); hw.rotation.x=Math.PI/2; cur.add(hw);},i);
  part('flg',()=>{FX.forEach(x=>{const f=cyl(.1,.02,cSteel,x,PY,z,24); f.rotation.z=Math.PI/2;});},i);
  part('bolts',()=>{FX.forEach(x=>{for(let k=0;k<8;k++){const a=k*Math.PI/4, b=cyl(.008,.07,cDark,x,PY+Math.cos(a)*.085,z+Math.sin(a)*.085,6); b.rotation.z=Math.PI/2;}});},i);
  part('bends',()=>{sph(.065,cPipe,VX,.25,z); sph(.065,cPipe,VX,PY,z);},i);
  part('supports',()=>{const wx=Math.sqrt(Math.max(.1,R0*R0-z*z))-.02; [1.0,Math.min(2.4,PY-.4)].forEach(y=>{cyl(.07,.04,cSteel,VX,y,z); box(Math.max(.05,wx-VX),.05,.05,cSteel,(VX+wx)/2,y,z);});},i);
  part('pdis',()=>{pipe([PX,.25,z],[VX,.25,z],.05,cPipe); pipe([VX,.25,z],[VX,PY,z],.05,cPipe); pipe([VX,PY,z],[HX,PY,z],.05,cPipe);},i);
 }
 part('rails',()=>{for(let i=0;i<n;i++){pipe([PX+.2,.7,pz(i)],[PX+.2,H-.1,pz(i)],.012,cSteel); box(.06,.08,.06,cSteel,PX+.2,H-.12,pz(i)); box(.06,.08,.06,cSteel,PX+.2,.66,pz(i));}});
 const zh0=-(cW/2-.2), zh1=Math.max(pz(n-1),cW/2-.3), zo=-(cW/2+tCW+1.4);
 part('pheader',()=>{pipe([HX,PY,zh0],[HX,PY,zh1],.075,cPipe); const bf=cyl(.12,.03,cDark,HX,PY,zh1+.03); bf.rotation.x=Math.PI/2; for(let k=0;k<8;k++){const a=k*Math.PI/4,b=cyl(.01,.06,cDark,HX+Math.cos(a)*.1,PY+Math.sin(a)*.1,zh1+.03,6); b.rotation.x=Math.PI/2;}});
 part('poutlet',()=>{pipe([HX,PY,zh0],[HX,PY,zo],.075,cPipe);});
 part('pinlet',()=>{pipe([-(R1+2.27),IY,0],[-R0,IY,0],.1575,cPipe); const fa=cyl(.24,.03,cDark,-(R1+.3),IY,0); fa.rotation.z=Math.PI/2; const co=cyl(.19,.12,cSteel,-(R1+.3),IY,0); co.rotation.z=Math.PI/2;});
 part('penstock',()=>{box(.04,.55,.55,cSteel,-(R0-.08),IY,0); pipe([-(R0-.08),IY+.28,0],[-(R0-.08),H+.6,0],.015,cSteel); const hw=new T.Mesh(new T.TorusGeometry(.1,.015,6,18),cDark); hw.position.set(-(R0-.08),H+.6,0); hw.rotation.x=Math.PI/2; cur.add(hw); box(.05,.7,.04,cSteel,-(R0-.08),IY,.3); box(.05,.7,.04,cSteel,-(R0-.08),IY,-.3);});
 part('screen',()=>{box(.5,1,.7,cMesh,-(R0-.5),1.45,0); [-.3,-.15,0,.15,.3].forEach(zz=>box(.52,1.02,.012,cSteel,-(R0-.5),1.45,zz)); pipe([-(R0-.5)-.15,1.95,0],[-(R0-.5)+.15,1.95,0],.015,cSteel); pipe([-(R0-.5)-.15,1.95,0],[-(R0-.5),2.15,0],.012,cSteel); pipe([-(R0-.5)+.15,1.95,0],[-(R0-.5),2.15,0],.012,cSteel);});
 part('stilling',()=>{cyl(.2,H,cStill,-.37*R0,H/2,-.67*R0,32);});
 const ladder=(x,z,y0,y1,m,w)=>{pipe([x-w/2,y0,z],[x-w/2,y1,z],.02,m); pipe([x+w/2,y0,z],[x+w/2,y1,z],.02,m); for(let y=y0+.3;y<y1;y+=.3)pipe([x-w/2,y,z],[x+w/2,y,z],.012,m);};
 part('ladderS',()=>{ladder(PX-.05,Math.min(R0-.3,Math.max(1.15,(n-1)/2*sp+.55)),.15,H+.9,cSteel,.4);});
 part('ladderG',()=>{ladder(cxo,cW/2-.05,cF,H+.9,cGal,.4);});
 /* ---- jib crane ---- */
 part('crane',()=>{box(.6,.04,.6,cSteel,cx,H+.02,0); cyl(.1,2.4,cYel,cx,H+1.2,0); cyl(.13,.1,cDark,cx,H+2.45,0);
  const J=new T.Group(); J.position.set(cx,0,0); cur.add(J); const pv=cur; cur=J;
  box(La,.1,.1,cYel,La/2-.1,H+2.4,0); pipe([.2,H+2.1,0],[La-.3,H+2.4,0],.025,cYel); pipe([.2,H+2.1,0],[.2,H+2.4,0],.025,cYel); box(.5,.3,.3,cDark,-.45,H+2.3,0);
  G.trol=box(.3,.2,.3,cDark,0,H+2.25,0); G.hook=box(.16,.16,.16,cDark,0,H+1.8,0); G.cable=cyl(.01,1,cDark,0,H+1.9,0,8); cur=pv; G.J=J;});
 /* ---- shed, board, odor unit, vents ---- */
 const sx=-R1-1.1, sz=-1.6;
 part('shed',()=>{box(1.3,.06,.9,cSteel,sx,GY+2.3,sz); [[-.6,-.4],[.6,-.4],[-.6,.4],[.6,.4]].forEach(p=>cyl(.03,2.3,cSteel,sx+p[0],GY+1.15,sz+p[1])); box(1.3,1.6,.02,cSteel,sx,GY+1.5,sz-.42);});
 part('board',()=>{box(.9,1.5,.25,cDark,sx,GY+.95,sz-.2); box(.82,1.4,.02,cSteel,sx,GY+.95,sz-.07); cyl(.012,.12,cSteel,sx+.3,GY+.95,sz-.05,8);});
 const ox=-1.6, oz=-4.3;
 part('skid',()=>{box(2.4,.1,1.4,cDark,ox,GY+.05,oz);});
 part('carbon',()=>{cyl(.45,1.2,cOdor,ox-.5,GY+.75,oz,32); const d1=mesh(new T.SphereGeometry(.45,24,12),cOdor,ox-.5,GY+1.35,oz); d1.scale.y=.4; const d2=mesh(new T.SphereGeometry(.45,24,12),cOdor,ox-.5,GY+.15,oz); d2.scale.y=.4; cyl(.06,.4,cOdor,ox-.05,GY+.7,oz,12).rotation.z=Math.PI/2;});
 part('prefilter',()=>{cyl(.2,.9,cOdor,ox+.4,GY+.55,oz,24); const d3=mesh(new T.SphereGeometry(.2,16,10),cOdor,ox+.4,GY+1,oz); d3.scale.y=.5;});
 part('fan',()=>{box(.45,.4,.4,cYel,ox+.95,GY+.3,oz); cyl(.11,.35,cDark,ox+.95,GY+.3,oz+.38,16).rotation.x=Math.PI/2; pipe([ox+.4,GY+.7,oz],[ox+.95,GY+.7,oz],.05,cPipe);});
 part('podor',()=>{pipe([ox+.4,GY+1,oz],[.9,GY+1,oz],.05,cPipe); pipe([.9,GY+1,oz],[.9,H,-1],.05,cPipe);});
 [-1,1].forEach((sg,i)=>part('pvent',()=>{const vx=-.5,vz=sg*.65*R0; pipe([vx,H,vz],[vx,H+1.6,vz],.05,cPipe); cyl(.09,.08,cPipe,vx,H+1.64,vz); cyl(.06,.03,cPipe,vx,H+1.7,vz);},i));
 G.len={inlet:(R1+2.27)-R0, dis:(VX-PX)+(PY-.25)+(HX-VX), header:zh1-zh0, outlet:zh0-zo, vent:1.7, odor:(.9-(ox+.4))+Math.hypot(GY+1-H,oz+1)};
 /* ---- ground, water, levels, labels ---- */
 {const g=new T.Mesh(new T.CircleGeometry(12,64),cGround); g.rotation.x=-Math.PI/2; g.position.y=GY; groundG.add(g); const gr=new T.GridHelper(24,24,0x888888,0x888888); gr.position.y=GY+.01; gr.material.transparent=true; gr.material.opacity=.22; groundG.add(gr);}
 {const wm=new T.Mesh(new T.CylinderGeometry(R0-.01,R0-.01,1.62,48),cWater); wm.position.y=.81; water.add(wm);}
 [[.92,'LL.W.L +'+f2(BL+.92),0xe57373],[1.02,'L.W.L +'+f2(BL+1.02),0xffb74d],[1.62,'H.W.L +'+f2(BL+1.62),0x4fc3f7],[1.72,'H.H.W.L +'+f2(BL+1.72),0x81c784]].forEach(l=>{const r=new T.Mesh(new T.RingGeometry(R0-.18,R0-.01,64),new T.MeshBasicMaterial({color:l[2],side:T.DoubleSide,transparent:true,opacity:.9})); r.rotation.x=-Math.PI/2; r.position.y=l[0]; levelsG.add(r); label(l[1],-.2,l[0]+.07,-R0*.83,1.5);});
 label('Wet well Ø'+f2(D)+' m',0,H+.55,0,1.8); label('Outlet chamber '+f1(cL)+' × '+f1(cW),R1+cL/2,H+.5,0,2); label(n+' pumps 7.5 kW',PX,1.35,0,1.5);
 label('Inlet Ø315 I.L +'+f2(BL+1.82),-R1-1.2,IY+.35,0,2.3); label('Jib crane 1 t',cx+.8,H+2.85,0,1.4); label('Odor unit 205 CFM',-1.6,GY+2,-4.3,1.9); label('Control board',sx,GY+2.7,sz,1.4); label('Outlet Ø150 to septic tank',HX,PY+.3,zo+.2,2.4); label('Blind flange',HX+.2,PY+.25,zh1+.1,1.2);
 applyFlags(); applyAnim(true);
}

