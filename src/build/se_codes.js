/* ====== se_codes (prefix se / SE): structural design engine, part 1 of 5. Pure functions, no DOM. Code switch ECP 203 / Eurocode 2 / ACI 318: materials, flexure (rectangular, T, doubly), minimum steel, bar selection, shear. Units: mm, N, MPa, kN, kN*m unless a name says otherwise.
   HONESTY: every ECP item marked verify:true is a textbook form that was NOT checked against the licensed ECP text; no clause numbers are printed anywhere. Demonstration / preliminary only. ====== */
const SE_DISC=['Demonstration / preliminary calculation. Not a design approval. A licensed engineer must check it against the code edition in force.','حساب توضيحي مبدئي. مش اعتماد تصميم. لازم مهندس مرخّص يراجعه على إصدار الكود المعمول به.'];
const SE_CODES={
 ecp:{id:'ecp',n:['ECP 203 (cube fcu, γc 1.5, γs 1.15)','ECP 203 (مكعب fcu، γc 1.5، γs 1.15)'],gname:'fcu',gdef:30,gc:1.5,gs:1.15,ecu:.003,lamf:()=>.8,cmax:.45,phi:1,comb:'ecp',
  formulas:['Design strengths: concrete 0.67·fcu/γc (γc 1.5), steel fy/γs (γs 1.15)','Rectangular stress block: depth a = 0.8·c, uniform stress 0.67·fcu/γc, εcu 0.003','Ductility limit used here: c/d ≤ 0.45 (textbook value, verify against the code edition)','Ec = 4400·√fcu; cracking stress 0.6·√fcu (verify)','Shear: qcu = 0.24·√(fcu/γc), max q = 0.7·√(fcu/γc), stirrups carry q − 0.5·qcu (verify)','Columns (short, axial): Pu = 0.35·fcu·Ac + 0.67·fy·As (verify)']},
 ec2:{id:'ec2',n:['Eurocode 2 (cylinder fck, γc 1.5, γs 1.15)','يوروكود 2 (أسطوانة fck، γc 1.5، γs 1.15)'],gname:'fck',gdef:25,gc:1.5,gs:1.15,ecu:.0035,lamf:()=>.8,cmax:.45,phi:1,comb:'en',acc:.85,
  formulas:['Design strengths: αcc·fck/γc (αcc 0.85, the UK National Annex value; set 1.0 for the EN recommended value), fyk/γs (γs 1.15)','Rectangular stress block: λ = 0.8, η = 1.0 (fck ≤ 50 MPa), εcu 0.0035; x/d ≤ 0.45 without redistribution','Ecm = 22·((fck+8)/10)^0.3 GPa; fctm = 0.3·fck^(2/3)','Shear: VRd,c = [0.18/γc·k·(100·ρl·fck)^(1/3)]·b·d ≥ vmin·b·d; stirrups VRd,s = Asw/s·z·fywd·cotθ, cotθ 2.5 → 1.0','Crack width: wk = sr,max·(εsm − εcm), sr,max = 3.4c + 0.425·k1·k2·φ/ρp,eff']},
 aci:{id:'aci',n:['ACI 318 (cylinder f′c, φ factors)','ACI 318 (أسطوانة f′c، معاملات φ)'],gname:"f'c",gdef:28,gc:1,gs:1,ecu:.003,lamf:fc=>fc<=28?.85:Math.max(.65,.85-.05*(fc-28)/7),cmax:.4286,phi:.9,comb:'asce',
  formulas:["Design strengths: 0.85·f′c block, fy; φ = 0.90 flexure (tension-controlled, εt ≥ 0.004 here), 0.75 shear, 0.65 tied columns","Stress block depth a = β1·c, β1 = 0.85 down to 0.65 (f′c above 28 MPa)","Ec = 4700·√f′c; modulus of rupture fr = 0.62·√f′c","Shear: Vc = 0.17·√f′c·b·d, Vs = Vu/φ − Vc, minimum Av and spacing limits d/2 or d/4","Columns: φPn,max = 0.80·φ·[0.85·f′c·(Ag − Ast) + fy·Ast]"]}};
const seCodeList=()=>Object.keys(SE_CODES);
/* material set for a code; fc in the code's own strength (ECP fcu, EC2 fck, ACI f'c), fy in MPa */
function seMat(code,fc,fy,o){ const C=SE_CODES[code]; if(!C)throw new Error('unknown code '+code); o=o||{}; fc=+fc; fy=+fy; if(!(fc>0)||!(fy>0))throw new Error('fc and fy must be positive');
 const m={code,fc,fy,Es:2e5,gc:C.gc,gs:C.gs,ecu:C.ecu,lam:C.lamf(fc),cmax:C.cmax,phi:C.phi,fyd:fy/C.gs};
 if(code==='ecp'){ m.fcd=.67*fc/1.5; m.Ec=4400*Math.sqrt(fc); m.fr=.6*Math.sqrt(fc); m.fcc=fc; }
 else if(code==='ec2'){ const acc=o.acc!=null?o.acc:C.acc; m.fcd=acc*fc/1.5; m.Ec=22000*Math.pow((fc+8)/10,.3); m.fctm=.3*Math.pow(fc,2/3); m.fr=m.fctm; m.fcc=fc; m.acc=acc; }
 else { m.fcd=.85*fc; m.Ec=4700*Math.sqrt(fc); m.fr=.62*Math.sqrt(fc); m.fcc=fc; }
 m.ey=m.fyd/m.Es; return m; }
/* ---------- flexure ---------- */
/* Required tension steel As (and compression steel Asc) for ultimate moment Mu (kN*m) on b x d; dp = depth of compression steel; bf,hf = flange (T section, optional). */
function seFlex(m,o){ const b=o.b,d=o.d,dp=o.dp||Math.min(60,.15*o.d),Mu=Math.abs(o.Mu),phi=m.phi; const R={As:0,Asc:0,mode:'single',ok:true,notes:[]}; if(Mu===0)return R;
 const Md=Mu*1e6/phi, amax=m.lam*m.cmax*d, cmaxv=m.cmax*d;
 const rect=(bw,M)=>{ const disc=d*d-2*M/(m.fcd*bw); const a=disc>=0?d-Math.sqrt(disc):Infinity; if(a<=amax)return {a,As:m.fcd*bw*a/m.fyd,Asc:0};
  const Mmax=m.fcd*bw*amax*(d-amax/2), ss=Math.min(m.fyd,m.Es*m.ecu*(cmaxv-dp)/cmaxv); if(ss<=0.05*m.fyd||dp>=cmaxv)return {a:amax,As:Infinity,Asc:Infinity,fail:true};
  const Asc=(M-Mmax)/(ss*(d-dp)); return {a:amax,As:(m.fcd*bw*amax+Asc*ss)/m.fyd,Asc,dbl:true}; };
 if(o.bf&&o.hf&&o.bf>b){ const r0=rect(o.bf,Md); const aflg=r0.a; if(isFinite(aflg)&&aflg<=o.hf&&!r0.dbl){ R.As=r0.As; R.mode='T (stress block in flange)'; R.a=aflg; R.c=aflg/m.lam; }
  else { const Mf=m.fcd*(o.bf-b)*o.hf*(d-o.hf/2), r=rect(b,Md-Mf); if(r.fail){R.ok=false;R.As=R.Asc=Infinity;R.notes.push('web too small');return R;} R.As=(m.fcd*(o.bf-b)*o.hf+(r.As===Infinity?0:r.As*m.fyd))/m.fyd; R.Asc=r.Asc; R.mode='T (stress block in web)'+(r.dbl?' + compression steel':''); R.a=r.a; R.c=r.a/m.lam; } }
 else { const r=rect(b,Md); if(r.fail){ R.ok=false; R.As=R.Asc=Infinity; R.notes.push('section too small even with compression steel'); return R; } R.As=r.As; R.Asc=r.Asc; R.a=r.a; R.c=r.a/m.lam; if(r.dbl)R.mode='double'; }
 return R; }
/* moment capacity (kN*m) of a rectangular / T section with tension steel As, optional compression steel Asc at dp: strain compatibility, neutral axis found by bisection (robust for over-reinforced sections, where the tension steel does not yield). ACI: phi from the tension strain. */
function seMomCap(m,o){ const b=o.b,d=o.d,dp=o.dp||60,As=o.As,Asc=o.Asc||0,bf=(o.bf&&o.hf&&o.bf>b)?o.bf:b,hf=o.hf||0; const clamp=s=>Math.max(-m.fyd,Math.min(m.fyd,s));
 const parts=c=>{ const a=m.lam*c, af=Math.min(a,hf); const web=m.fcd*b*a, fl=bf>b?m.fcd*(bf-b)*af:0; const sc=clamp(m.Es*m.ecu*(c-dp)/c), st=clamp(m.Es*m.ecu*(d-c)/c); return {a,af,web,fl,sc,st,F:web+fl+Asc*sc-As*st}; };
 let lo=1e-3*d,hi=3*d; for(let i=0;i<80;i++){ const mid=(lo+hi)/2; if(parts(mid).F>0)hi=mid; else lo=mid; } const c=(lo+hi)/2, q=parts(c); const M=q.web*(d-q.a/2)+q.fl*(d-q.af/2)+Asc*q.sc*(d-dp);
 let phi=m.phi; if(m.code==='aci'){ const et=m.ecu*(d-c)/c; phi=et>=.005?.9:et<=.002?.65:.65+(et-.002)*(.25/.003); }
 return {M:phi*M/1e6,a:q.a,c,cd:c/d,phi}; }
function seAsMin(code,kind,b,d,m,h){ h=h||d*1.1; if(code==='ecp'){ if(kind==='slab')return Math.max(.6/m.fy,.0015)*b*d; return Math.max(.225*Math.sqrt(m.fc)/m.fy,1.1/m.fy)*b*d; }
 if(code==='ec2')return Math.max(.26*m.fctm/m.fy,.0013)*b*d; if(kind==='slab')return Math.max(.0018*420/m.fy,.0014)*b*h; return Math.max(.25*Math.sqrt(m.fc)/m.fy,1.4/m.fy)*b*d; }
const SE_DIAS=[8,10,12,14,16,18,20,22,25,28,32];
const seAb=d=>Math.PI*d*d/4;
const seBarW=d=>d*d/162; /* kg per m, d in mm (rule used on the steel weight tables) */
/* beam bars: choose n and dia for As_req in width b (single layer preferred, up to 2 layers) */
function seBeamBars(As,b,cover,dst,minN){ minN=minN||2; if(!(As>0))return {n:minN,dia:12,As:minN*seAb(12),layers:1}; const dias=[12,16,18,20,22,25,28,32]; let best=null;
 for(const dia of dias){ const n=Math.max(minN,Math.ceil(As/seAb(dia)-1e-9)); const sp=Math.max(dia,25), nrow=Math.floor((b-2*(cover+dst)+sp)/(dia+sp)); if(nrow<2)continue; const layers=Math.ceil(n/nrow); if(layers>2)continue; const c={n,dia,As:n*seAb(dia),layers}; if(layers===1){ return c; } if(!best)best=c; }
 return best||{n:Math.ceil(As/seAb(32)),dia:32,As:Math.ceil(As/seAb(32))*seAb(32),layers:3,warn:'more than 2 layers: widen the beam'}; }
/* slab / strip bars: dia + spacing for As per metre width */
function seSlabBars(As,t,smaxIn){ const smax=smaxIn||Math.min(2*t,250); for(const dia of [10,12,14,16,18,20,25]){ const s0=1000*seAb(dia)/Math.max(As,1), s=Math.min(smax,Math.floor(s0/25)*25); if(s>=100||dia===25)return {dia,spacing:Math.max(s,75),As:1000*seAb(dia)/Math.max(s,75),perM:Math.ceil(1000/Math.max(s,75))}; } }
/* ---------- shear (beam, per code) ---------- */
function seStir(Aswreq_s,nleg,smax,minS){ for(const dia of [8,10,12,14]){ const Asw=nleg*seAb(dia); const s=Math.min(smax,Math.floor(Asw/Math.max(Aswreq_s,1e-9)/25)*25); if(s>=(minS||75))return {dia,spacing:s,Asw,Asw_s:Asw/s,legs:nleg}; } const dia=14,Asw=nleg*seAb(dia); return {dia,spacing:minS||75,Asw,Asw_s:Asw/(minS||75),legs:nleg,warn:'stirrups very dense: enlarge the section'}; }
function seShear(m,o){ const b=o.b,d=o.d,Vu=Math.abs(o.Vu),fyst=o.fyst||m.fy,nleg=o.nleg||2,As=o.As||0; const code=m.code, R={code,notes:[],verify:code==='ecp'};
 if(code==='ecp'){ const q=Vu*1e3/(b*d), qcu=.24*Math.sqrt(m.fc/1.5), qmax=.7*Math.sqrt(m.fc/1.5); R.v=q; R.vc=qcu; R.vmax=qmax; R.util=q/qmax; R.unit='MPa';
  const qsu=Math.max(q-.5*qcu,0); let req=qsu*b/(fyst/1.15); const reqMin=.4*b/fyst; /* (Asw/s) >= 0.4 b / fyst (verify) */ req=Math.max(req,reqMin); R.Asw_s_req=req; R.st=seStir(req,nleg,Math.min(200,.75*d)); R.notes.push('stirrups carry q − 0.5·qcu; minimum Asw/s = 0.4·b/fy (verify)'); R.cap=(R.st.Asw_s*fyst/1.15/b+.5*qcu)*b*d/1e3; }
 else if(code==='ec2'){ const fck=m.fc, k=Math.min(2,1+Math.sqrt(200/d)), rho=Math.min(.02,As/(b*d)), CRd=.18/1.5, vmin=.035*Math.pow(k,1.5)*Math.sqrt(fck); const vrdc=Math.max(CRd*k*Math.pow(100*rho*fck,1/3),vmin), VRdc=vrdc*b*d/1e3; R.vc=vrdc; R.VRdc=VRdc; R.unit='MPa'; const z=.9*d, nu=.6*(1-fck/250), fywd=fyst/1.15, acw=1;
  const VRdmax=cot=>acw*b*z*nu*(m.fcd/m.acc)*(1/(cot+1/cot))/1e3; /* fcd for crushing uses fck/gc (alpha_cc = 1 in the strut check kept conservative) */
  let cot=2.5; while(cot>1&&VRdmax(cot)<Vu)cot-=.1; cot=Math.max(1,cot); R.cot=cot; R.vmax=VRdmax(1)*1e3/(b*d); R.util=Vu/VRdmax(1); R.v=Vu*1e3/(b*d);
  const reqS=Vu*1e3/(z*fywd*cot), rhoMin=.08*Math.sqrt(fck)/fyst*b; R.Asw_s_req=Math.max(reqS,rhoMin); R.st=seStir(R.Asw_s_req,nleg,Math.min(.75*d,300)); R.cap=R.st.Asw_s*z*fywd*cot/1e3; R.notes.push('variable strut angle cotθ = '+cot.toFixed(1)+' (limits 1.0 to 2.5)'); if(Vu<=VRdc)R.notes.push('concrete alone resists V; minimum stirrups still provided'); }
 else { const fc=m.fc, Vc=.17*Math.sqrt(fc)*b*d/1e3, phi=.75; R.vc=phi*Vc; R.unit='kN'; const Vsmax=.66*Math.sqrt(fc)*b*d/1e3, Vs=Math.max(0,Vu/phi-Vc); R.util=Vs/Vsmax; R.v=Vu; R.vmax=phi*(Vc+Vsmax); R.Vs=Vs; const reqMin=Math.max(.062*Math.sqrt(fc),.35)*b/fyst, reqS=Vs*1e3/(fyst*d); R.Asw_s_req=Math.max(reqS,reqMin); const smax=(Vs>.33*Math.sqrt(fc)*b*d/1e3)?Math.min(d/4,300):Math.min(d/2,600); R.st=seStir(R.Asw_s_req,nleg,smax); R.cap=phi*(Vc+R.st.Asw_s*fyst*d/1e3); R.notes.push('simplified Vc = 0.17√f′c·b·d (no size or axial terms)'); R.util=Vu/R.vmax; }
 R.Vu=Vu; return R; }
/* generic pass/fail row */
const seChk=(name,demand,limit,unit,o)=>{ o=o||{}; const u=o.util!=null?o.util:(limit?demand/limit:(demand?Infinity:0)); return {name,demand,limit,unit:unit||'',util:u,ok:u<=1+1e-9,note:o.note||'',verify:!!o.verify}; };
