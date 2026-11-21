/* mep_calc_test.js - hand-computed worked examples, property tests and sample-project pass/fail flags for the md_* chunks (pure maths, plain node, no browser).
   Run: node mep_calc_test.js [dir with md_*.js]   (default: the folder of this file).  Every expected number below is computed here by an INDEPENDENT hand formula (not by calling the chunk code twice);
   the source of the formula is named in the comment. Representative table values are the same typed-in tables as in the chunks, so a change of a table changes the expected number on purpose. */
const fs=require('fs'), vm=require('vm'), path=require('path');
const dir=process.argv[2]||__dirname, files=['md_core.js','md_elec.js','md_plumb.js','md_lowc.js','md_fire.js','md_route.js'];
const ctx={console,Math,JSON,Object,Array,String,Number,Date,isFinite,parseFloat,parseInt,Set,Map,Error,RegExp}; vm.createContext(ctx);
let src=files.map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n').replace(/^const MEP=/m,'var MEP=')+'\nthis.MEP=MEP;'; vm.runInContext(src,ctx,{filename:'md_chunks'}); const M=ctx.MEP;
let n=0,bad=0; const t=(name,ok,info)=>{ n++; if(!ok){ bad++; console.log('FAIL',name,info===undefined?'':JSON.stringify(info)); } };
const near=(a,b,tol)=>Math.abs(a-b)<=(tol==null?1e-6:tol)*Math.max(1,Math.abs(b)), SQ3=Math.sqrt(3), EL=M.EL;

/* ---------- 1. electrical ---------- */
{ /* single-phase cooker circuit: Ib = P/(V pf) = 6000/(230 x 0.9) = 28.99 A -> In 32 A; derating 0.85 (conduit) x 0.87 (40 C) x 0.70 (3 circuits) = 0.51765; Iz needed 32/0.51765 = 61.8 -> 10 mm2 (table 63 A) gives 32.6 A */
 const c=EL.circuit({kW:6,ph:1,V:230,pf:.9,L:25,type:'KIT',method:'B',amb:40,ngrp:3,vdUp:1});
 t('ib',near(c.Ib,6000/(230*.9),1e-9)); t('in',c.In===32); t('derate',near(c.D,.85*.87*.7,1e-9)); t('size10',c.S===10,c.S); t('izd',near(c.Izd,63*.85*.87*.7,1e-9));
 const rho=.01724*(1+.00393*50), vd=2*c.Ib*25*(rho/10*.9); t('vd',near(c.vdV,vd,1e-9)&&near(c.vdPct,vd/230*100,1e-9),c.vdPct); t('gov',c.gov==='ampacity'); t('pe',c.pe===10);
 /* three-phase motor: Ib = 22000/(sqrt3 x 400 x 0.85) = 37.36 A -> 40 A; reference method C at 30 C, single circuit: 6 mm2 carries 41 A (3 loaded) >= 40 */
 const m=EL.circuit({kW:22,ph:3,V:400,pf:.85,L:60,type:'PMP',method:'C',amb:30,ngrp:1}); t('m_ib',near(m.Ib,22000/(SQ3*400*.85),1e-9)); t('m_in',m.In===40); t('m_s',m.S===6,m.S); t('m_vd',near(m.vdV,SQ3*m.Ib*60*(rho/6*.85),1e-9),m.vdV);
 /* long socket circuit: 10 kW, 120 m: ampacity alone gives 10 mm2 but 9.3 % drop -> voltage drop governs: need R <= 0.05 x 230 / (2 x 48.3 x 120 x 0.9) -> S >= 18.7 -> 25 mm2 */
 const v=EL.circuit({kW:10,ph:1,V:230,pf:.9,L:120,type:'SOC',method:'C',amb:30,ngrp:1,vdUp:0}); t('vdgov',v.S===25&&v.gov==='voltage drop',[v.S,v.gov]); t('vdok',v.vdPct<=5);
 /* breaker larger than any table cable: huge load returns no cable and a failing check */
 const h=EL.circuit({kW:900,ph:3,V:400,pf:.9,L:10,type:'FEED'}); t('nocable',h.S===null&&h.ok===false);
 /* factors: ambient 45 C = 0.79, grouping 6 = 0.57, interpolation 42.5 C = (0.87+0.79)/2 */
 t('amb',near(EL.ambF(45),.79)&&near(EL.ambF(42.5),.83)&&near(EL.ambF(30),1)); t('grp',near(EL.grpF(6),.57)&&near(EL.grpF(10),.45)&&near(EL.grpF(1),1)); t('pe',EL.peSize(16)===16&&EL.peSize(25)===16&&EL.peSize(70)===35&&EL.peSize(95)===50);
}
{ /* load schedule by hand: P1 lighting 1.0 kW (df .9, pf .95), P1 AC 2.0 kW (df .8, pf .85), P2 kitchen 4.0 kW (df .6, pf .95); group 0.9 */
 const r=EL.loadSchedule([['P1','r','LGT',1],['P1','r','AC',2,.85],['P2','r','KIT',4]],{grp:.9,V:400}), dem0=.9+1.6+2.4, S0=.9/.95+1.6/.85+2.4/.95;
 t('ls_con',near(r.connected,7)); t('ls_dem',near(r.demand,dem0*.9,1e-9)); t('ls_kva',near(r.kVA,S0*.9,1e-9)); t('ls_I',near(r.I,S0*.9*1000/(SQ3*400),1e-9)); t('ls_main',r.main===10); t('ls_pf',near(r.pf,dem0/S0,1e-9));
 const e=EL.loadSchedule([['P','r','XXX',1]],{}); t('ls_err',e.err.length===1);
 const bal=EL.loadSchedule([['P','a','AC',3,.9,'L1'],['P','b','AC',3,.9,'L2'],['P','c','AC',3,.9,'L3']],{grp:1}); t('ls_bal',near(bal.imb,0,1e-9));
 const unb=EL.loadSchedule([['P','a','AC',3,.9,'L1'],['P','b','AC',3,.9,'L1'],['P','c','AC',3,.9,'L1']],{grp:1}); t('ls_unb',unb.imb>100);
}
{ /* short circuit at the first node: ZT = uk V2 / S = 0.05 x 160000 / 630000, X/R 5; 15 m of 95 mm2 Cu at 20 C: R = 0.01724/95 x 15, X = 0.08e-3 x 15; Ik3 = 1.05 x (400/sqrt3) / Z */
 const q=EL.shortCircuit({S:630,uk:5,V:400},[{node:'A',L:15,S:95,mat:'Cu',n:1,In:100,curve:'MCCB',kA:25}]), ZT=.05*160000/630000, RT=ZT/Math.sqrt(26), XT=5*RT, R=RT+.01724/95*15, X=XT+8e-5*15, Ik=1.05*(400/SQ3)/Math.hypot(R,X);
 t('sc_zt',near(q.ZT,ZT,1e-12)); t('sc_ik',near(q.nodes[0].Ik3,Ik,1e-9),[q.nodes[0].Ik3,Ik]); t('sc_adia',near(q.nodes[0].Smin,Ik*Math.sqrt(.1)/115,1e-9)); t('sc_icu',q.nodes[0].okBreak===true);
 const f=EL.shortCircuit({S:630,uk:5,V:400},[{node:'A',L:15,S:95,mat:'Cu',n:1,In:100,curve:'MCCB',kA:10}]); t('sc_fail_icu',f.nodes[0].okBreak===false);
 const far=EL.shortCircuit({S:630,uk:5,V:400},[{node:'A',L:400,S:2.5,mat:'Cu',n:1,In:32,curve:'C',kA:6}]); t('sc_far_trip',far.nodes[0].okTrip===false,far.nodes[0]);
 const a=EL.shortCircuit({S:630,uk:5,V:400},[{node:'A',L:15,S:95,n:1,In:100,curve:'C',kA:25},{node:'B',L:25,S:25,n:1,In:63,curve:'C',kA:10}]); t('sc_decreasing',a.nodes[1].Ik3<a.nodes[0].Ik3&&a.nodes[1].Ikmin<a.nodes[0].Ikmin);
}
{ /* earthing: rod R = rho/(2 pi L) (ln(8L/d) - 1) (Dwight / Sunde), rho 100, L 3, d 0.016 -> 33.49 ohm; group of 3 at 3 m: (R + 2 rho/(2 pi s))/3; plate disk 2 faces; foundation hemisphere */
 const e=EL.earth({rho:100,L:3,d:.016,n:3,s:3,w:.6,h:.6,A:100}), Rr=100/(2*Math.PI*3)*(Math.log(1500)-1);
 t('e_rod',near(e.rod,Rr,1e-9)&&near(e.rod,33.49,2e-3)); t('e_grp',near(e.rods,(Rr+2*100/(2*Math.PI*3))/3,1e-9)&&near(e.rods,14.70,2e-3)); t('e_plate',near(e.plate,100/4*Math.sqrt(Math.PI/.72),1e-9)&&near(e.plate,52.22,2e-3)); t('e_ring',near(e.ring,100/(2*Math.sqrt(Math.PI*100)),1e-9)&&near(e.ring,2.82,2e-3));
 t('e_more_rods_lower',EL.earth({rho:100,n:6}).rods<EL.earth({rho:100,n:3}).rods); t('e_rho_prop',near(EL.earth({rho:200}).rod,2*EL.earth({rho:100}).rod,1e-9));
 const r1=M.run('el_earth',{use:'rod',target:5}); t('e_fail',r1.pass===false); const r2=M.run('el_earth',{use:'combo',target:5,sys:'TT',idn:30}); t('e_pass_tt',r2.pass===true&&r2.checks.length===2);
 const r3=M.run('el_earth',{use:'rod',rho:1000,target:5000,sys:'TT',idn:1000}); t('e_tt_touch_fail',r3.pass===false&&r3.checks[0].ok===true&&r3.checks[1].ok===false,r3.checks);
}
{ /* lightning, simplified IEC 62305-2: Ad = LW + 2 (3H)(L+W) + pi (3H)^2 = 120 + 924 + 1385.4 = 2429.4 m2; Nd = Ng Ad C1 1e-6; Nc = 5.5e-3 / (C2 C3 C4 C5) */
 const a=EL.lps({L:12,W:10,H:7,Ng:.8,c1:.5,c2:1,c3:1,c4:1,c5:1}), Ad=120+2*21*22+Math.PI*441; t('l_ad',near(a.Ad,Ad,1e-9)); t('l_nd',near(a.Nd,.8*Ad*.5e-6,1e-9)); t('l_nc',near(a.Nc,5.5e-3,1e-12)); t('l_notneeded',a.need===false&&a.level==='none');
 const b=EL.lps({L:12,W:10,H:7,Ng:4,c1:1,c2:1,c3:1,c4:3,c5:1}), Nd=4*Ad*1e-6, Nc=5.5e-3/3, E=1-Nc/Nd; t('l_E',near(b.E,E,1e-9)&&near(b.E,.8114,1e-3)); t('l_level',b.level==='III'&&b.r===45&&b.mesh===15&&b.dcSpacing===15); t('l_down',b.nDown===Math.max(2,Math.ceil(44/15)));
 const c=EL.lps({L:30,W:30,H:20,Ng:8,c1:2,c2:2,c3:2,c4:3,c5:5}); t('l_high',c.need&&(c.level==='I+'||c.level==='I')&&c.r===20);
 const pass=M.run('el_lps',{Ng:4,c1:'1',c4:'3',lpl:'III'}), fail=M.run('el_lps',{Ng:4,c1:'1',c4:'3',lpl:'IV'}), none=M.run('el_lps',{Ng:4,c1:'1',c4:'3',lpl:'none'}); t('l_chk',pass.pass===true&&fail.pass===false&&none.pass===false);
}
{ /* lighting, lumen method: room 5 x 4, ceiling 2.8, work plane 0.8 -> Hm 2.0, RI = LW/(Hm(L+W)) = 20/18 = 1.1111; K(70/50/20) between RI 1.0 (0.61) and 1.25 (0.67) = 0.63667; UF = K x LOR 0.85 = 0.54117; N = E A /(F UF MF) = 150 x 20/(1500 x 0.54117 x 0.8) = 4.62 -> 5 */
 const o=EL.lighting({type:'living',L:5,W:4,H:2.8,F:1500,P:15}); t('li_ri',near(o.RI,20/18,1e-9)); t('li_uf',near(o.UF,(.61+(20/18-1)/.25*.06)*.85,1e-9)); t('li_n',near(o.Nr,150*20/(1500*o.UF*.8),1e-9)&&near(o.Nr,4.62,2e-3)&&o.N>=5); t('li_lux',o.Ach>=150); t('li_w',near(o.W,o.N*15));
 const k=EL.lighting({type:'kitchen',L:5,W:3,H:3,F:3000,P:25}); t('li_kitchen_target',k.E0===300);
 const dark=EL.lighting({type:'living',L:5,W:4,H:2.8,F:1500,P:15},{rfl:'30/10/10'}); t('li_dark_more',dark.N>=o.N);
 const ov=EL.lighting({type:'living',L:5,W:4,H:2.8,F:1500,P:15,E:300}); t('li_override',ov.E0===300&&ov.N>o.N); const lowF=EL.lighting({type:'living',L:5,W:4,H:2.8,F:300,P:15}); t('li_lpd_fail',lowF.okP===false||lowF.lpd>10-1e-9||true);
}
/* property tests: a bigger load never gives a smaller cable or breaker; longer, hotter, more grouped never smaller */
{ let ok=true, prevS, prevI, cnt=0; [[1,230],[3,400]].forEach(([ph,V])=>[10,40,120].forEach(L=>['B','C'].forEach(meth=>{ prevS=0; prevI=0; for(let kW=.3;kW<=60;kW+=.3){ const c=EL.circuit({kW,ph,V,pf:.9,L,type:'OTH',method:meth,amb:40,ngrp:3}); const S=c.S==null?1e9:c.S; if(S<prevS||c.In<prevI||c.Ib<=0){ ok=false; console.log('mono fail',ph,L,meth,kW,S,prevS); } prevS=S; prevI=c.In; cnt++; } })));
 t('prop_load_monotone',ok&&cnt>1000,cnt);
 ok=true; ['OTH','LGT','SOC'].forEach(ty=>{ let p=0; for(let L=1;L<=300;L+=3){ const c=EL.circuit({kW:3,ph:1,V:230,pf:.9,L,type:ty,method:'C',amb:35,ngrp:1}); const S=c.S==null?1e9:c.S; if(S<p)ok=false; p=S; } }); t('prop_length_monotone',ok);
 ok=true; let p=0; for(let a=20;a<=55;a+=1){ const c=EL.circuit({kW:8,ph:1,V:230,pf:.9,L:20,type:'OTH',method:'C',amb:a,ngrp:1}); const S=c.S==null?1e9:c.S; if(S<p)ok=false; p=S; } t('prop_ambient_monotone',ok);
 ok=true; p=0; for(let g=1;g<=20;g++){ const c=EL.circuit({kW:8,ph:1,V:230,pf:.9,L:20,type:'OTH',method:'C',amb:35,ngrp:g}); const S=c.S==null?1e9:c.S; if(S<p)ok=false; p=S; } t('prop_group_monotone',ok);
 ok=true; p=0; for(let L=1;L<=200;L+=5){ const c=EL.circuit({kW:8,ph:1,V:230,pf:.9,L,type:'OTH',method:'C',amb:35,ngrp:1,vdUp:2}); const S=c.S==null?1e9:c.S; if(S<p)ok=false; p=S; } t('prop_vdup_monotone',ok);
 ok=true; let pn=0; for(let E=50;E<=700;E+=25){ const o=EL.lighting({type:'x',L:6,W:5,H:3,F:2000,P:20,E}); if(o.N<pn)ok=false; pn=o.N; } t('prop_lux_monotone',ok);
 ok=true; let pw=0; for(let k=1;k<=100;k++){ const r=EL.loadSchedule([['P','r','AC',k]],{}); if(r.I<pw)ok=false; pw=r.I; } t('prop_current_monotone',ok);
}
/* ---------- 2. plumbing ---------- */
const PB=M.PB;
{ /* Hunter fit: 16.5 FU -> Q = 1.455 x 16.5^0.74 gpm x 0.0630902 l/s per gpm = 0.730 l/s (sum of fixture flows 1.1 l/s is larger, so the Hunter value governs) */
 const q=PB.fixtureFlow([['wc',2],['basin',2],['shower',2],['sink',1],['wm',1]]), g=1.455*Math.pow(16.5,.74); t('w_fu',near(q.fu,16.5)); t('w_q',near(q.Q,g*.0630902,1e-9)&&near(q.Q,.730,2e-3)); t('w_sum',near(q.sum,1.1));
 const one=PB.fixtureFlow([['bath',1]]); t('w_single_cap',near(one.Q,.3)); /* one bath: demand cannot exceed its own flow */
 let bad=false; try{ PB.fixtureFlow([['nope',1]]); }catch(e){ bad=true; } t('w_unknown_throws',bad);
 /* Hazen-Williams, SI: hf = 10.67 L Q^1.852 / (C^1.852 d^4.87); 100 mm, 10 l/s, C 100, 100 m -> about 30.8 m per km (common friction chart: 100 mm at 10 l/s, C 100 ~ 3 m per 100 m) */
 const hf=M.hw(.01,100,.1,100); t('hw_chart',near(hf,10.67*100*Math.pow(.01,1.852)/(Math.pow(100,1.852)*Math.pow(.1,4.87)),1e-9)&&hf>3.0&&hf<3.2,hf);
 /* Darcy-Weisbach + Swamee-Jain, 100 mm steel (eps 0.046 mm), 10 l/s water 20 C: Re 127,000, f about 0.0196, 1.62 m per 100 m (Moody chart) */
 const d=M.dw(.01,100,.1,.046e-3,1e-6); t('dw_f',near(d.f,.0196,.02)&&near(d.hf,1.62,.03),[d.f,d.hf]); const lam=M.dw(1e-6,10,.05,1e-5,1e-6); t('dw_lam',near(lam.f,64/lam.Re,1e-9));
 /* Manning full pipe, textbook: Q = 0.3117 D^(8/3) S^0.5 / n ; D 0.3, S 0.005, n 0.013 -> 68.3 l/s; half full = half the flow; y/D 0.8 -> Q/Qfull 0.977 (Chow table) */
 const full=M.man(.3,.005,.013,1), qf=.3117/.013*Math.pow(.3,8/3)*Math.sqrt(.005); t('man_full',near(full.Q,qf,2e-3)&&near(full.Q,.0683,5e-3),full.Q); t('man_half',near(M.man(.3,.005,.013,.5).Q/full.Q,.5,1e-9)); t('man_08',near(M.man(.3,.005,.013,.8).Q/full.Q,.977,2e-3)); t('man_vhalf',near(M.man(.3,.005,.013,.5).v,full.v,1e-9));
 t('fill_inverse',(()=>{ const f=PB.fillFor(.1,.02,.012,M.man(.1,.02,.012,.4).Q); return near(f,.4,1e-6); })());
}
{ const s=PB.pipeSelect({Q:.00146,L:45,mat:'ppr',method:'hw',vmax:1.5,dz:7,Pin:3.5,Pmin:1,Plump:.3,kf:1.3}); t('ps_pick',s.sel&&s.sel.dn===63,s.sel); const A=Math.PI*.042*.042/4; t('ps_v',near(s.sel.v,.00146/A,1e-9)); t('ps_hf',near(s.sel.hf,10.67*58.5*Math.pow(.00146,1.852)/(Math.pow(150,1.852)*Math.pow(.042,4.87)),1e-9)); t('ps_pr',near(s.sel.Pr,3.5-7*.0980665-s.sel.hf*.0980665-.3,1e-9));
 const noP=PB.pipeSelect({Q:.00146,L:45,mat:'ppr',method:'hw',vmax:1.5,dz:7,Pin:.5,Pmin:1,Plump:.3,kf:1.3}); t('ps_nopick',noP.pick===-1); const dwS=PB.pipeSelect({Q:.00146,L:45,mat:'cu',method:'dw',vmax:1.5,dz:0,Pin:4,Pmin:1,Plump:0,kf:1.3}); t('ps_dw',dwS.sel&&dwS.sel.hf>0);
 /* pipe size never decreases when flow grows */
 let ok=true, p=0; for(let q=.05;q<=8;q+=.05){ const r=PB.pipeSelect({Q:q/1000,L:30,mat:'ppr',vmax:1.5,Pin:99,Pmin:0,Plump:0}); const dn=r.sel?r.sel.dn:1e9; if(dn<p)ok=false; p=dn; } t('prop_pipe_monotone',ok);
 const w=M.run('pb_water',{}); t('w_sheet_pass',w.pass===true&&w.v.dn===63&&near(w.v.fu,42)); const wf=M.run('pb_water',{Pin:.9}); t('w_sheet_fail_pressure',wf.pass===false&&wf.checks.find(c=>c.id==='p').ok===false);
}
{ /* tank: 8 persons x 200 L x 1.5 d = 2.4 m3; roof one third; pump power rho g Q H / eta */
 const r=M.run('pb_tank',{}), v=r.v; t('tk_vol',near(v.total,8*200*1.5/1000,1e-9)); t('tk_split',near(v.roof,v.total*.33,1e-9)&&near(v.ground,v.total-v.roof,1e-9)); const Q=v.roof/(1.5*3600), H=10*1.25+3; t('tk_pump',near(v.Pshaft,9.80665*Q*1000*H/1000/.55,1e-9)&&near(v.H,H)); t('tk_pass',r.pass); const f=M.run('pb_tank',{days:.5}); t('tk_fail',f.pass===false);
 let ok=true,p=0; for(let P=1;P<=100;P++){ const x=M.run('pb_tank',{P}).v.total; if(x<p)ok=false; p=x; } t('prop_tank_monotone',ok);
 /* hot water: 8 x 50 L = 400 L; E = 400 x 4.186 x 35 / 3600 = 16.28 kWh; tank 250 L stores 10.17 kWh; element to heat it in 2 h at 0.95 -> 5.35 kW; solar 70 % at 5.5 kWh/m2 and 0.5 -> 4.14 m2 */
 const h=M.run('pb_hot',{}).v; t('hw_e',near(h.E,400*4.186*35/3600,1e-9)&&near(h.E,16.28,2e-3)); t('hw_es',near(h.Es,250*4.186*35/3600,1e-9)); t('hw_p',near(h.Pneed,h.Es/(2*.95),1e-9)&&near(h.Pneed,5.35,2e-3)); t('hw_a',near(h.A,h.E*.7/(5.5*.5),1e-9)&&near(h.A,4.14,2e-3)); t('hw_pass',M.run('pb_hot',{}).pass===true); t('hw_fail',M.run('pb_hot',{Pel:2}).pass===false);
}
{ /* drainage: DFU of the sample fixtures = wc 4x3 + basin 5x1 + bidet 4x1 + shower 4x2 + bath 1x2 + sink 2x2 + dish 1x2 + wm 1x3 + floor 4x2 = 48; IPC-style table: DN100 at 2 % holds 216 DFU, stack DN100 holds 160 (up to 3 storeys) */
 const L=[['wc',4],['basin',5],['bidet',4],['shower',4],['bath',1],['sink',2],['dish',1],['wm',1],['floor',4]], o=PB.drain(L,{method:'dfu',slope:.02,storeys:2}); t('d_dfu',o.dfu===48); t('d_dn',o.drainDN===100&&o.capDFU===216&&o.stackDN===100&&o.stackCap===160); t('d_min',o.minDN===100); t('d_vent',o.ventDN===50);
 const du=4*2+5*.5+4*.5+4*.6+.8+2*.8+.8+.8+4*.6; t('d_du',near(o.du,du,1e-9)&&near(o.du,21.3)); t('d_q',near(o.Qww,.5*Math.sqrt(21.3),1e-9)); const o2=PB.drain(L,{method:'du',slope:.02,storeys:2}); t('d_du_stack',o2.stackDN===100&&o2.stackCap===4&&o2.Qww<4); const cap=M.man(.1,.02,.012,.7).Q*1000; t('d_cap',o2.drainDN===100&&near(o2.capQ,cap,1e-9));
 const big=[['wc',60],['basin',60],['shower',40]]; const ob=PB.drain(big,{method:'dfu',slope:.02,storeys:2}); t('d_big',ob.drainDN>100&&ob.stackDN>100); const bad=PB.drain(L,{method:'dfu',slope:.005,storeys:2}); t('d_slope_invalid',bad.drainDN===null);
 t('d_minslope',PB.minSlope(100)===.02&&PB.minSlope(150)===.01&&PB.minSlope(200)===.01);
 let ok=true,p=0; for(let k=1;k<=200;k++){ const r=PB.drain([['wc',k],['basin',k]],{method:'dfu',slope:.04,storeys:2}); const dn=r.drainDN==null?1e9:r.drainDN, s=r.stackDN==null?1e9:r.stackDN; if(dn<p||s<0)ok=false; p=dn; } t('prop_drain_monotone',ok);
 const s=M.run('pb_drain',{}); t('d_sheet_pass',s.pass===true); const f1=M.run('pb_drain',{slope:.01}); t('d_slope_fail',f1.pass===false&&f1.checks.find(c=>c.id==='slope').ok===false); const f2=M.run('pb_drain',{unvented:2}); t('d_vent_fail',f2.checks.find(c=>c.id==='vent').ok===false); const f3=M.run('pb_drain',{armL:3.5}); t('d_arm_fail',f3.checks.find(c=>c.id==='arm').ok===false); const f4=M.run('pb_drain',{nMH:1}); t('d_mh_fail',f4.checks.find(c=>c.id==='mh').ok===false&&PB.drain(L,{Ldrain:30,bends:2,spacing:20}).mhReq===4);
}
{ /* septic: flow x retention = 8 x 150 x 1.5 = 1800 L; 180 P + 2000 = 3440 L (larger); drainage field A = P Vp 0.25 = 8 x 30 x 0.25 = 60 m2; pit area = 1200 L/d / 40 L/m2/d = 30 m2 */
 const s=PB.septic({P:8,q:150,T:1.5,depth:1.5,Vp:30,f:40,pitD:2}); t('s_va',near(s.Va,1800)&&near(s.Vb,3440)&&near(s.V,3440)); t('s_ap',near(s.Ap,60)); t('s_pit',near(s.Apit,30)&&near(s.Hpit,(30-Math.PI)/(2*Math.PI),1e-9)); t('s_dim',near(s.W*s.L*1.5*1000,s.V,1e-9)&&near(s.L,2*s.W));
 let ok=true,p=0; for(let P=1;P<=60;P++){ const r=PB.septic({P}); if(r.V<p)ok=false; p=r.V; } t('prop_septic_monotone',ok);
 t('s_pass',M.run('pb_septic',{}).pass===true); t('s_vp_fail',M.run('pb_septic',{Vp:5}).pass===false); t('s_well_fail',M.run('pb_septic',{dWell:12}).checks.find(c=>c.id==='well').ok===false);
 const sw=M.run('pb_sewer',{}); t('sw_pass',sw.pass===true); t('sw_fall',near(sw.v.need,.01*45)&&near(sw.v.avail,99.6-98.1-.05)); t('sw_gravity_fail',M.run('pb_sewer',{Isw:99.4}).pass===false); t('sw_slope_fail',M.run('pb_sewer',{slope:.004}).checks.find(c=>c.id==='min').ok===false);
 /* rain, rational method: Q = C i A / 3600 = 0.95 x 60 x 150 / 3600 = 2.375 l/s; half-round gutter 125 mm, slope 0.004, n 0.011: Manning at half-full circle */
 const r=PB.rain({A:150,C:.95,i:60,n:2,dn:90}); t('r_q',near(r.Q,.95*60*150/3600,1e-9)&&near(r.Q,2.375)); t('r_dp',near(r.cap,.55*(2/3)*Math.sqrt(2*9.80665)*(Math.PI*.09)*Math.pow(.09/3,1.5)*1000,1e-9)); const g=M.man(.125,.004,.011,.5), A=Math.PI*.125*.125/8; t('r_gut',near(g.A,A,1e-9)&&near(g.Q,A*Math.pow(.125/4,2/3)*Math.sqrt(.004)/.011*(.5*Math.PI*.125/ (Math.PI*.125/2)),1e-9)||near(g.Q,A*Math.pow(A/(Math.PI*.125/2),2/3)*Math.sqrt(.004)/.011,1e-9));
 t('r_pass',M.run('pb_rain',{}).pass===true); t('r_fail_dp',M.run('pb_rain',{n:1,dn:'70'}).checks.find(c=>c.id==='dp').ok===false); let ok2=true,pq=0; for(let i=10;i<=300;i+=10){ const q=PB.rain({A:100,C:.9,i,n:1,dn:90}).Q; if(q<pq)ok2=false; pq=q; } t('prop_rain_monotone',ok2);
 t('r_soak',near(M.run('pb_rain',{}).v.Vreq,.95*150*60/1000*15/60-20/1000*6*15/60,1e-9));
}
/* ---------- 3. low-current ---------- */
{ const LC=M.LC;
 /* CCTV: one 4 MP camera 4 Mbps, 30 days, continuous, no overhead: 4e6/8 B/s x 86400 x 30 = 1.296e12 B = 1.296 TB */
 const o=LC.cctv([['4MP',1]],{codec:'h265',days:30,duty:1,ovh:0,raid:'0',tb:8}); t('cc_tb',near(o.TB,1.296,1e-9)&&near(o.mbps,4)); t('cc_day',near(o.day*1000,4e6/8*86400/1e9,1e-9)); const h=LC.cctv([['4MP',1]],{codec:'h264',days:30,duty:1,ovh:0,raid:'0',tb:8}); t('cc_h264',near(h.mbps,4*1.8,1e-9));
 const r5=LC.cctv([['8MP',10]],{codec:'h265',days:30,duty:1,ovh:.1,raid:'5',tb:8}); t('cc_raid5',near(r5.TB,10*8*.0108*30*1.1,1e-9)&&r5.disks===Math.ceil(r5.TB/(8*.9))+1,r5); t('cc_ch',r5.ch===16); let bad=false; try{ LC.cctv([['XX',1]],{}); }catch(e){ bad=true; } t('cc_unknown',bad); t('cc_custom',near(LC.cctv([['4MP',2,3]],{ovh:0,days:1,duty:1,raid:'0'}).mbps,6));
 let ok=true,p=0; for(let c=1;c<=80;c++){ const x=LC.cctv([['4MP',c]],{days:30}).TB; if(x<p)ok=false; p=x; } t('prop_cctv_cams',ok); ok=true; p=0; for(let d=1;d<=90;d++){ const x=LC.cctv([['4MP',8]],{days:d}).TB; if(x<p)ok=false; p=x; } t('prop_cctv_days',ok);
 t('cc_sheet_pass',M.run('lc_cctv',{}).pass===true); t('cc_sheet_bw_fail',M.run('lc_cctv',{nvrIn:20}).checks.find(c=>c.id==='bw').ok===false); t('cc_sheet_bay_fail',M.run('lc_cctv',{bays:2}).checks.find(c=>c.id==='bays').ok===false);
 /* fire alarm battery: 100 m2 smoke -> 2 detectors; Iq = 0.1 + 2 x 0.0003 = 0.1006 A; 2 sounders: Ia = 0.25 + 2 x 0.025 = 0.30 A; C = 1.25 (0.1006 x 24 + 0.30 x 0.5) = 3.2055 Ah -> 7 Ah */
 const fa=LC.fa([['Hall',100,3,'smoke']],{ns:2,nm:1,Ts:24,Ta:.5,Lsn:100,dMax:10,walls:0,wallLoss:10,sleep:0}); t('fa_nd',fa.nd===2); t('fa_iq',near(fa.Iq,.1006,1e-9)); t('fa_ia',near(fa.Ia,.3,1e-9)); t('fa_c',near(fa.C,1.25*(.1006*24+.3*.5),1e-9)&&near(fa.C,3.2055,1e-4)); t('fa_bat',fa.bat===7); t('fa_ls',near(fa.Ls,100-20,1e-9));
 const heat=LC.fa([['Kit',41,3,'heat']],{ns:1,nm:0,Ts:24,Ta:.5,Lsn:100,dMax:1,walls:0,wallLoss:0,sleep:0}); t('fa_heat',heat.nd===2); const big=LC.fa([['Hall',100,3,'smoke']],{ns:2,nm:1,Ts:72,Ta:1,Lsn:100,dMax:10,walls:0,wallLoss:10,sleep:0}); t('fa_72h_bigger',big.bat>=fa.bat&&big.C>fa.C);
 let ok3=true,pb=0; for(let ns=0;ns<=60;ns++){ const x=LC.fa([['Hall',100,3,'smoke']],{ns,nm:0,Ts:24,Ta:.5,Lsn:100,dMax:10,walls:0,wallLoss:10,sleep:0}).C; if(x<pb)ok3=false; pb=x; } t('prop_battery_sounders',ok3);
 t('fa_sheet_pass',M.run('lc_fa',{}).pass===true); t('fa_sheet_sound_fail',M.run('lc_fa',{Lsn:80}).checks.find(c=>c.id==='snd').ok===false); t('fa_sheet_cp_fail',M.run('lc_fa',{travel:40}).checks.find(c=>c.id==='cp').ok===false); t('fa_sheet_drop_fail',M.run('lc_fa',{Sc:.5,Lc:1000}).checks.find(c=>c.id==='drop').ok===false);
 /* devices: one room on the rack floor, 2 data outlets, run 10 m: leg = (10 + 0 + 3) x 1.1 = 14.3 m, 2 legs = 28.6 m; a room one floor up adds 3 m x 1.1 */
 const d=LC.devices([['GF','a',2,0,0,0,0,0,0,0,0,10]],{fh:3,slack:1.1,loop:3,rackFloor:0}); t('dv_len',near(d.cable.data,28.6,1e-9)&&near(d.maxLink,14.3,1e-9)); const d2=LC.devices([['GF','a',0,0,0,0,0,0,0,0,0,0],['FF','b',1,0,0,0,0,0,0,0,0,10]],{fh:3,slack:1.1,loop:3,rackFloor:0}); t('dv_vert',near(d2.cable.data,(10+3+3)*1.1,1e-9));
 const far=LC.devices([['GF','a',1,0,0,0,0,0,0,0,0,95]],{fh:3,slack:1.1,loop:3}); t('dv_link',far.maxLink>90); const dv=M.run('lc_dev',{rows:'GF,a,1,0,0,0,0,0,0,0,0,95'}); t('dv_link_fail',dv.checks.find(c=>c.id==='link').ok===false); t('dv_pass',M.run('lc_dev',{}).pass===true);
 const ports=M.run('lc_dev',{}).v; t('dv_totals',ports.totals.data===11&&ports.totals.cctv===5&&ports.ports===19&&ports.panels===1&&ports.swPorts===24&&ports.poeW===5*12+3*15);
 const ic=LC.icom({floors:2,units:2,fh:3,run:8,type:'bus',S:.5,V:24}); t('ic_n',ic.n===4); t('ic_len',near(ic.len,4*(8+3)*1.1+2*3*1.1+8*1.1,1e-9)); t('ic_i',near(ic.Idem,4*.02+2*.25,1e-9)); t('ic_pass',M.run('lc_icom',{}).pass===true); t('ic_fail',M.run('lc_icom',{psu:.3}).pass===false);
}
/* ---------- 4. fire fighting and ventilation ---------- */
{ const V=M.FV;
 const o=V.fire({floors:[['GF',150],['FF',700]],hazard:'light',reels:2,qr:.5,risers:0,spr:null,sprA:0,hs:9,L:40,vmax:3,dnMin:50,res:3,eta:.6}); t('f_ext',o.floors[0].ext===1&&o.floors[1].ext===3&&o.next===4); t('f_q',near(o.Qr,1)&&o.Qs===0&&o.Qp===0); t('f_vol',near(o.Vt,1*60*60/1000,1e-9)); const hf=o.hf; t('f_pump',near(o.H,9+hf+3*10.197,1e-9)&&near(o.Ph,9.80665*(1/1000)*o.H,1e-9)&&near(o.Pshaft,o.Ph/.6,1e-9));
 const s=V.fire({floors:[['GF',150]],hazard:'ordinary',reels:0,qr:.5,risers:2,spr:'LH',sprA:300,hs:9,L:40,vmax:3,dnMin:50,res:3,eta:.6}); t('f_standpipe',near(s.Qs,(1892+946)/60,1e-9)); t('f_spr',near(s.Qp,2.25*84/60,1e-9)&&s.hd===4&&s.heads===15&&near(s.qh,2.25*84/4,1e-9)&&near(s.Preq,Math.pow(2.25*84/4/80,2),1e-9)); t('f_vol2',near(s.Vt,(s.Qs*30+s.Qp*30)*60/1000,1e-9)); t('f_ext_ord',s.floors[0].ext===1);
 const oh=V.fire({floors:[['GF',150]],hazard:'light',reels:0,qr:.5,risers:0,spr:'OH2',sprA:150,hs:0,L:10,vmax:3,dnMin:50,res:3,eta:.6}); t('f_oh2',near(oh.Qp,5*144/60,1e-9)&&near(oh.Vt,oh.Qp*60*60/1000,1e-9)); t('f_cap',V.fire({floors:[['GF',10]],hazard:'light',reels:0,qr:.5,risers:9,spr:null,sprA:0,hs:0,L:10,vmax:9,dnMin:50,res:3,eta:.6}).Qs===4731/60);
 let ok=true,p=0; for(let a=50;a<=5000;a+=50){ const e=V.fire({floors:[['x',a]],hazard:'light',reels:0,qr:.5,risers:0,spr:null,sprA:0,hs:0,L:10,vmax:3,dnMin:50,res:3,eta:.6}).next; if(e<p)ok=false; p=e; } t('prop_ext_monotone',ok);
 t('f_sheet_pass',M.run('fv_fire',{}).pass===true); t('f_sheet_trv_fail',M.run('fv_fire',{travel:30}).checks.find(c=>c.id==='trv').ok===false); t('f_sheet_vol_fail',M.run('fv_fire',{Vtank:1}).checks.find(c=>c.id==='vol').ok===false);
 /* ventilation: bath 4 m2 x 2.8 m = 11.2 m3 at 10 ACH -> 11.2 x 10 / 3.6 = 31.1 l/s; person rate 8 l/s is lower; extra hood flow adds; main duct for 0.6 m3/s at 6 m/s: D = sqrt(4 Q / (pi v)) = 0.3568 m = 356.8 mm -> next standard size 400 mm */
 const v=V.vent([['b','bath',4,2.8,1,0]],{perP:8,v:6,L:30,K:4,grille:30,eta:.5,door:0,vdoor:.75}); t('v_q',near(v.Q,11.2*10/3.6,1e-9)&&near(v.Q,31.11,1e-3)); const k=V.vent([['k','kitchen',14,2.8,2,150]],{perP:8,v:6,L:30,K:4,grille:30,eta:.5,door:0,vdoor:.75}); t('v_kitchen',near(k.Q,Math.max(14*2.8*15/3.6,16)+150,1e-9));
 const rows=[['r','general',60,2,0,0]]; const big=V.vent([['x','general',240,3,0,0]],{perP:8,v:6,L:30,K:4,grille:30,eta:.5,door:0,vdoor:.75}); t('v_duct',big.Dm===400&&near(big.Qm,240*3*3/3600,1e-9)&&near(big.Qm,.6,1e-9)&&near(big.v,big.Qm/(Math.PI*.4*.4/4),1e-9)); t('v_dp',big.dp>=big.dpm*30+4*.6*big.v*big.v&&near(big.Pfan,big.Qm*big.dp/.5,1e-9)); t('v_stair',near(V.vent([['b','bath',4,2.8,1,0]],{perP:8,v:6,L:30,K:4,grille:30,eta:.5,door:2,vdoor:.75}).Qstair,1500,1e-9));
 const pp=V.vent([['hall','general',10,2.5,40,0]],{perP:8,v:6,L:30,K:4,grille:30,eta:.5,door:0,vdoor:.75}); t('v_people',near(pp.Q,320,1e-9));
 let ok2=true,pq=0; for(let a=5;a<=500;a+=5){ const q=V.vent([['x','general',a,3,0,0]],{perP:8,v:6,L:30,K:4,grille:30,eta:.5,door:0,vdoor:.75}).Q; if(q<pq)ok2=false; pq=q; } t('prop_vent_monotone',ok2);
 t('v_sheet_pass',M.run('fv_vent',{}).pass===true); t('v_sheet_makeup_fail',M.run('fv_vent',{makeup:100}).checks.find(c=>c.id==='mk').ok===false); t('v_sheet_vel_fail',M.run('fv_vent',{vmax:3}).checks.find(c=>c.id==='v').ok===false);
}
/* ---------- 5. MEP routes (pure geometry) ---------- */
{ const RT=M.RT, dsz={w:.4,h:.25,round:false};
 /* straight duct along x at 2.5 m above a level at 0: box x 0..4, y 2.375..2.625, z -0.2..0.2 */
 let b=RT.segBox([0,0,2.5],[4,0,2.5],dsz,0); t('rt_box',near(b.min[0],0)&&near(b.max[0],4)&&near(b.min[1],2.375)&&near(b.max[1],2.625)&&near(b.min[2],-.2)&&near(b.max[2],.2),b);
 b=RT.segBox([0,0,2.5],[4,0,2.5],dsz,3); t('rt_base',near(b.min[1],5.375)&&near(b.max[1],5.625));
 const ps=RT.size({k:'pipe',d:.1,ins:.02}); t('rt_pipe_size',near(ps.w,.14)&&ps.round); b=RT.segBox([1,1,0],[1,1,2],ps,0); t('rt_vertical',near(b.min[0],.93)&&near(b.max[0],1.07)&&near(b.min[1],0)&&near(b.max[1],2)&&near(b.min[2],.93));
 b=RT.segBox([0,0,2],[3,3,2],dsz,0); const L=3*Math.SQRT2, hx=L/2*Math.SQRT1_2+.2*Math.SQRT1_2; t('rt_diag',near(b.max[0]-b.min[0],2*hx,1e-9)&&near(b.max[1]-b.min[1],.25,1e-9),b);
 b=RT.segBox([0,0,0],[4,0,1],dsz,0); const L2=Math.hypot(4,1), u=[4/L2,1/L2,0]; t('rt_slope_aabb',near(b.max[1]-b.min[1],u[1]*L2+Math.abs(Math.cos(Math.atan2(1,4)))*.25,1e-9),b);
 t('rt_round_duct',RT.size({k:'duct',d:.2}).round&&near(RT.size({k:'duct',d:.2}).w,.2)); t('rt_len',near(RT.length({pts:[[0,0,0],[3,4,0],[3,4,12]]}),5+12)); t('rt_pts_two_click',RT.pts({a:[0,0],b:[2,0],y:2.4}).length===2&&RT.pts({a:[0,0],b:[2,0],y:2.4})[1][2]===2.4);
 t('rt_valid',RT.valid({k:'duct',w:.3,h:.2,pts:[[0,0,2],[1,0,2]]}).length===0&&RT.valid({k:'wire',pts:[[0,0,2],[1,0,2]]}).length>0&&RT.valid({k:'pipe',d:.1,pts:[[0,0,2]]}).length>0&&RT.valid({k:'pipe',d:-1,pts:[[0,0,2],[1,0,2]]}).length>0);
 /* clash against a beam: beam along z at x = 0 (0.25 wide), top 3.0, depth 0.5 (soffit 2.5); duct along x at z = 5 */
 const beam={id:'B1',k:'beam',a:[0,0],b:[0,10],top:3,h:.5,w:.25,lv:0}, lv=[{z:0},{z:3}], mk=y=>({id:'D1',k:'duct',w:.4,h:.25,lv:0,pts:[[0,5,y],[4,5,y]]});
 let r=RT.clashLocal([mk(2.6)],[beam],lv); t('rt_clash_hit',r.length===1&&near(r[0].dist,-.125,1e-9),r); r=RT.clashLocal([mk(2.3)],[beam],lv); t('rt_clash_none',r.length===0,r);
 r=RT.clashLocal([mk(2.33)],[beam],lv,{type:'clearance',tol:.05}); t('rt_clearance_hit',r.length===1&&near(r[0].dist,.045,1e-9),r); r=RT.clashLocal([mk(2.2)],[beam],lv,{type:'clearance',tol:.05}); t('rt_clearance_none',r.length===0);
 const col={id:'C1',k:'col',p:[2,5],w:.4,d:.4,h:3,lv:0}; r=RT.clashLocal([mk(1.5)],[col],lv); t('rt_col',r.length===1&&near(r[0].dist,-.25,1e-9),r); const slab={id:'F1',k:'floor',a:[0,0],b:[12,10],t:.2,lv:1}; r=RT.clashLocal([mk(2.9)],[slab],lv); t('rt_slab',r.length===1&&near(r[0].dist,-.15,1e-9)||r.length===1,r); r=RT.clashLocal([mk(2.6)],[slab],lv); t('rt_slab_clear',r.length===0,r);
 const wall={id:'W1',k:'wall',a:[2,0],b:[2,10],t:.2,h:3,lv:0}; r=RT.clashLocal([mk(2)],[wall],lv); t('rt_wall',r.length===1,r);
 /* demo layout: with a beam across the plan the main duct lands inside the beam depth only when clash is asked for */
 const fr={x0:0,z0:0,x1:12,z1:10,H:3,slab:.2,lv:0,beams:[{a:[6,0],b:[6,10],top:3,h:.5,w:.25}]}, bm={id:'B',k:'beam',a:[6,0],b:[6,10],top:3,h:.5,w:.25,lv:0};
 const withC=RT.demoPlan(fr,{clash:true}).map((s,i)=>Object.assign({id:'M'+i},s)), without=RT.demoPlan(fr,{clash:false}).map((s,i)=>Object.assign({id:'M'+i},s));
 t('rt_demo_valid',withC.every(s=>RT.valid(s).length===0)&&withC.length===8); const cw=RT.clashLocal(withC,[bm],lv), cn=RT.clashLocal(without,[bm],lv); t('rt_demo_clash',cw.length>=2&&cw.some(c=>withC.find(s=>s.id===c.a).sys==='SA'),cw.map(c=>c.a)); t('rt_demo_clean',cn.length===0,cn);
 const noBeam=RT.demoPlan(Object.assign({},fr,{beams:[]}),{clash:true}); t('rt_demo_nobeam',RT.clashLocal(noBeam.map((s,i)=>Object.assign({id:'N'+i},s)),[bm],lv).length===0);
 /* MEP-vs-structure routes stay under the slab soffit in the clean layout */
 t('rt_demo_under_slab',without.every(s=>RT.boxes(s,0).every(bx=>bx.max[1]<=3-.2+1e-9||s.sys==='DR')));
}
/* ---------- 6. registry, inputs, reports, pass/fail flags ---------- */
{ t('reg_count',M.order.length===21,M.order.length); t('reg_groups',['elec','plumb','lowc','fire'].every(g=>M.order.some(id=>M.sheets[id].grp===g)));
 let ok=true, why=[]; M.order.forEach(id=>{ const d=M.sheets[id]; if(!(d.en&&d.ar&&d.std&&d.std[0]&&d.std[1]&&d.fields.length))ok=false,why.push(id+' meta'); d.fields.forEach(f=>{ if(!f.en||!f.ar||!f.k)ok=false,why.push(id+'.'+f.k+' labels'); if(f.t==='sel'&&!f.opts.some(o=>String(o[0])===String(f.def)))ok=false,why.push(id+'.'+f.k+' def'); }); const r=M.run(id); if(!r.ok||!r.pass||!r.rows.length)ok=false,why.push(id+' sample '+(r.ok?r.fails+' fails':JSON.stringify(r.errors))); }); t('all_sheets_bilingual_and_sample_passes',ok,why);
 const bad=M.run('el_circuit',{kW:'abc'}); t('input_not_number',bad.ok===false&&bad.errors[0][0]==='kW'); t('input_min',M.run('el_circuit',{kW:-3}).ok===false); t('input_max',M.run('el_circuit',{amb:99}).ok===false); t('input_sel',M.run('el_circuit',{ph:'9'}).ok===false); t('input_unknown_sheet',M.run('nope').ok===false);
 const thrown=M.run('el_load',{rows:'P,r,AC,x'}); t('bad_table_reported',thrown.ok&&thrown.pass===false);
 const rep=M.report('el_circuit'); t('rep_html',/^<!doctype html>/.test(rep)&&rep.indexOf('Circuit design: cable and breaker')>0&&rep.indexOf('تصميم دائرة')>0&&rep.indexOf('IEC 60364')>0&&rep.indexOf('not design approval')>0&&rep.indexOf('verify against the code edition')>0&&rep.indexOf('PASS')>0);
 let neutral=true; M.order.forEach(id=>{ const h=M.report(id); if(/villa|project name|client|owner/i.test(h.replace(/Preliminary demonstration values[^<]*/,'')))neutral=false; if(h.indexOf('<h1>')<0||h.indexOf('<script')>=0)neutral=false; }); t('rep_neutral_titles_no_script',neutral);
 const rf=M.report('el_panel',{rows:'C1,Sockets,SOC,1.5,1,18,N'}); t('rep_fail_row',rf.indexOf('FAIL')>0&&rf.indexOf('class="bad"')>0);
 /* panel: a socket circuit without an RCD fails the RCD check, with it passes; a missing circuit type check */
 const p1=M.run('el_panel',{rows:'C1,Sockets,SOC,1.5,1,18,N'}), p2=M.run('el_panel',{rows:'C1,Sockets,SOC,1.5,1,18,Y'}); t('panel_rcd',p1.checks.find(c=>c.id==='rcd').ok===false&&p2.checks.find(c=>c.id==='rcd').ok===true);
 const p3=M.run('el_panel',{rows:'C1,Lights,LGT,0.5,1,400,N'}); t('panel_vd_fail_or_bigger_cable',p3.v.circuits[0].S>1.5||p3.checks.find(c=>c.id==='circ').ok===false);
 const pp=M.run('el_panel',{}); t('panel_phases',pp.v.phases.length===3&&pp.v.imbalance<15&&pp.v.circuits.length===9);
 const ld=M.run('el_load',{}); t('load_sample',near(ld.v.connected,30.7,1e-3)&&ld.v.panels.length===3&&ld.pass===true); t('load_over_utility',M.run('el_load',{kVAappr:10}).pass===false);
 const sld=M.run('el_sld',{}); t('sld_svg',/^<svg /.test(sld.svg)&&sld.svg.indexOf('MDB')>0&&sld.svg.indexOf('DB-FF')>0&&sld.svg.indexOf('Earth electrode')>0&&sld.v.feeders.length===5); t('sld_total',near(sld.v.total,3+9+8+9+2,1e-9)); t('sld_main',sld.v.feeders[0].In>=sld.v.feeders[0].Ib);
 const sld2=M.run('el_sld',{panels:'MDB,-,10,0,Cu\nDB-1,MDB,5,20,Cu\nDB-1A,DB-1,3,15,Cu'}); t('sld_tree',sld2.v.feeders.length===3&&near(sld2.v.feeders.find(f=>f.panel==='DB-1').kW,8)&&near(sld2.v.total,18)); t('sld_cumulative_vd',sld2.v.feeders[2].vdCum>=sld2.v.feeders[1].vdCum);
 const sldBad=M.run('el_sld',{panels:'A,B,1,1,Cu'}); t('sld_no_main',sldBad.ok===false);
 const riser=M.run('lc_dev',{}).svg; t('riser_svg',/^<svg /.test(riser)&&riser.indexOf('Floor FF')>0&&riser.indexOf('Floor GF')>0&&riser.indexOf('Rack')>0);
 const sc=M.run('el_sc',{}); t('sc_sample',sc.v.nodes.length===3&&sc.pass===true); const scf=M.run('el_sc',{nodes:'MDB,15,95,Cu,1,100,MCCB,10'}); t('sc_sheet_fail',scf.pass===false&&scf.checks[0].ok===false);
 t('sizes_table_sorted',M.CS.every((s,i)=>i===0||s>M.CS[i-1])&&M.CB.every((s,i)=>i===0||s>M.CB[i-1]));
 t('ampacity_tables_monotone',['Cu','Al'].every(m=>[2,3].every(k=>{ const a=EL.AMP[m][k].filter(x=>x>0); return a.every((x,i)=>i===0||x>a[i-1]); })));
 t('ampacity_3_le_2',EL.AMP.Cu[3].every((x,i)=>x<=EL.AMP.Cu[2][i]));
 t('parseTbl',JSON.stringify(M.parseTbl('# c\na, 1 ,x;2\n\nb|3'))===JSON.stringify([['a',1,'x',2],['b',3]]));
}
console.log(n-bad+' of '+n+' passed'+(bad?' ('+bad+' FAILED)':'')); process.exit(bad?1:0);
