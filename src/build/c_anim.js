/* ====================== animation ====================== */
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2, clamp01=x=>Math.min(1,Math.max(0,x));
const u=(a,b)=>ease(clamp01((A.s-a)/(b-a)));
const wv=nm=>{const w=SEQ[A.mode].W[nm]; return w?u(w[0],w[1]):0;};
const EX={covers:[[0,.5,0]],wtop:[[0,1.7,0]],ctop:[[0,1.7,0]],cfill:[[0,-1,0]],crane:[[-1.2,0,0]],pinlet:[[-1.5,0,0]],pdis:[[0,-1.2,0]],pheader:[[0,-1.2,0]],poutlet:[[0,-1.2,0]],bends:[[0,-1.2,0]],rails:[[0,-.8,0]],supports:[[0,-.8,0]],stilling:[[0,3,-2.5]],ladderS:[[-2.2,1,2.2]],ladderG:[[2.2,1,2.2]],skid:[[-1.5,0,-2]],carbon:[[-1.5,0,-2]],prefilter:[[-1.5,0,-2]],fan:[[-1.5,0,-2]],podor:[[-1.5,0,-2]],shed:[[-1.5,0,-1.5]],board:[[-1.5,0,-1.5]],pvent:[[1,2,1]]};
function applyAnim(){ if(!G)return;
 const m=SEQ[A.mode], e=Math.max(wv('exp'),A.e), H=G.H, pi=Math.min(A.pump,G.n-1), zs=G.pz(pi), dx=G.PX-G.cx, rr=Math.hypot(dx,zs), psi=Math.atan2(zs,dx);
 const kc=[wv('covA'),wv('covB'),wv('covC')], jib=wv('jib'), hd=wv('hdn'), lf=wv('lift'), sw=wv('swing'), bw=wv('bolts'), vw=wv('valves'), sc=wv('screen');
 const a0=-psi, phi2=-G.swing*sw, a1=a0+phi2;
 const fn={
  covers:i=>i===0?[1.8*kc[0],.7*kc[0],0]:i===1?[-1.2*kc[1],.7*kc[1],0]:[0,.7*kc[2],1.8*kc[2]],
  pump:i=>i===pi?[rr*Math.cos(a1)-rr*Math.cos(a0),lf*G.lift,-rr*Math.sin(a1)+rr*Math.sin(a0)]:null,
  bolts:i=>(m.all||i===pi)?[0,bw*.4,(i%2?1:-1)*bw*.7]:null,
  screen:()=>[0,sc*(H+1.8),0], penstock:()=>[0,sc*(H+1.8),0]};
 ['dj','nrv','slv','flg'].forEach(id=>{fn[id]=i=>(m.all||i===pi)?[0,vw*(H-G.PY+2.2),0]:null;});
 for(const id in parts){const f=fn[id], ex=EX[id]; parts[id].forEach((g,i)=>{const o=(f&&f(i))||[0,0,0], x=(ex&&(ex[i]||ex[0]))||[0,0,0]; g.position.set(o[0]+x[0]*e,o[1]+x[1]*e,o[2]+x[2]*e);});}
 if(G.J){G.J.rotation.y=a0*jib+phi2; const hookY=H+1.8-G.dh*hd+G.lift*lf; G.trol.position.x=rr; G.hook.position.set(rr,hookY,0); const top=hookY+.08,len=Math.max(.05,H+2.1-top); G.cable.scale.y=len; G.cable.position.set(rr,H+2.1-len/2,0);}
}
function stepIndex(){const st=SEQ[A.mode].steps; for(let i=st.length-1;i>=0;i--)if(A.s>=st[i][1])return i; return 0;}

