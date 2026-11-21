/* rcs_test.js - node tests of the pure parts of rcs_skel.js and rcs_rebar.js (no browser). Usage: node rcs_test.js [dir with rcs_skel.js and rcs_rebar.js]
   Every expected number below is computed by hand in the comment next to it (units: m, mm, kN, MPa). */
const fs=require('fs'),vm=require('vm'),path=require('path'),dir=process.argv[2]||__dirname;
const rd=(f,a,b)=>fs.readFileSync(path.join(dir,f),'utf8').match(new RegExp('/\\*@@'+a+'\\*/([\\s\\S]*?)/\\*@@'+b+'\\*/'))[1];
const ctx={}; vm.createContext(ctx); vm.runInContext(rd('rcs_skel.js','RCSK_PURE_BEGIN','RCSK_PURE_END')+rd('rcs_rebar.js','RCSR_PURE_BEGIN','RCSR_PURE_END')+';this.K=RCSKEL;this.R=RCSREB;',ctx);
const K=ctx.K,R=ctx.R; let pass=0,fail=0;
const ok=(c,m,x)=>{ if(c){pass++;console.log('  ok   '+m);} else {fail++;console.log('  FAIL '+m+(x!==undefined?'  -> '+JSON.stringify(x):''));} };
const near=(a,b,t,m)=>ok(Math.abs(a-b)<=(t||1e-6),m+' ('+a+' vs '+b+')');
const cl=o=>JSON.parse(JSON.stringify(o));
console.log('== A. development / lap / hook formulas (fy 360, fcu 25 -> f\'c 20, sqrt 4.4721)');
// ld(16) = 360 /(2.1 x 4.4721) x 16 = 38.334 x 16 = 613.3 ; ld(25) = 360/(1.7 x 4.4721) x 25 = 47.35 x 25 = 1183.8
near(R.ld(16),613.34,0.1,'ld 16 mm = 613.3'); near(R.ld(25),1183.8,0.2,'ld 25 mm = 1183.8 (1.7 form for db >= 22)'); near(R.ld(8),306.7,0.1,'ld 8 mm = 306.7'); near(R.ld(6),300,1e-9,'ld 6 mm = 300 minimum');
ok(R.lap(16)===800&&R.lap(25)===1540,'lap = 1.3 ld rounded up to 10 mm: 16 mm -> 800, 25 mm -> 1540',[R.lap(16),R.lap(25)]);
near(R.ld(16,{confined:false}),920.0,0.2,'ld 16 mm other cases (1.4) = 360/(1.4 x 4.4721) x 16 = 920');
near(R.ldc(16),309.1,0.1,'compression ld 16 = max(0.24 x 360 x 16/4.4721 = 309.1, 247.7, 200)'); ok(R.lapC(16)===410,'compression lap 16 = 0.071 x 360 x 16 = 408.96 -> 410',R.lapC(16));
near(R.ldh(16),309.1,0.1,'hooked ldh 16 = max(128, 150, 309.1)'); ok(R.hook90(16)===192&&R.hook135(8)===75&&R.hook135(16)===96,'hooks: 12 x 16 = 192; 135 deg tail max(6 x 8, 75) = 75; max(96, 75) = 96');
near(R.wkg(16),1.5802,1e-4,'kg/m 16 mm = 256/162'); near(R.wkg(12),0.8889,1e-4,'kg/m 12 mm = 144/162'); near(R.wkg(10),0.6173,1e-4,'kg/m 10 mm = 100/162');
near(R.ld(16,{fcu:30}),360/(2.1*Math.sqrt(24))*16,1e-9,'fcu 30 -> f\'c 24');
const tb=R.table(null); ok(tb.length===11&&tb[4].d===16&&tb[4].lap===800,'calculator table has 11 diameters');
// stirrup 25 x 40 beam, cover 25: A 200, B 350, tail 75: 2 x 550 + 2 x 75 - (3 x 2 x 8 + 2 x 3 x 8) = 1250 - 96 = 1154
const sq=R.mkBar('s',8,'SQ',[[0,0,0],[0,0,0.075],[0,0,0.075]],[]); ok(sq.cut===75&&sq.legs.join()==='75,0','mkBar: legs from the point list, cut = sum of legs');
const A=0.2,B=0.35,e=0.075; const st=R.mkBar('stirrups',8,'SQ',[[-A/2+e*Math.SQRT1_2,0,B/2-e*Math.SQRT1_2],[-A/2,0,B/2],[A/2,0,B/2],[A/2,0,-B/2],[-A/2,0,-B/2],[-A/2,0,B/2],[-A/2,0,B/2-e]],[135,90,90,90,135]); ok(st.cut===1154,'stirrup cut length 1154 mm',st.cut);
console.log('== B. worked example: two bays of 4 m x 5 m, one storey (grid x = 0,4,8; z = 0,5), no walls');
const W=K.plan({bx:[4,4],bz:[5],storeys:1,stair:null,openings:false,rooms:false,parapet:0,open:[]});
const nodes=W.info.nodes;
// roof only: g 6.5, q 1.0 -> service 7.5, factored 1.4 x 6.5 + 1.6 x 1.0 = 10.7 kN/m2. corner tributary 2 x 2.5 = 5, middle 4 x 2.5 = 10 m2
near(nodes[0].trib,5,1e-9,'corner tributary area 5 m2'); near(nodes[1].trib,10,1e-9,'middle tributary area 10 m2'); near(nodes[1].Ns,75,1e-9,'middle service load 10 x 7.5 = 75 kN'); near(nodes[1].Nu,107,1e-9,'middle factored load 10 x 10.7 = 107 kN');
// Ac = 107/(0.4 x 25000) = 0.0107 m2 -> /0.25 = 0.0428 -> 0.05 < 0.40 practical minimum: 25 x 40
ok(W.info.colH===0.4&&W.info.colB===0.25,'column 25 x 40 (minimum governs, Ac 0.0107 m2)');
// footing: 1.1 x 75/150 = 0.55 m2 -> side 0.74 -> 0.8 < 1.0 minimum ; t = max(0.40, ceil5((1.0-0.4)/2/1.5 = 0.2)) = 0.40
ok(W.els.filter(x=>x.k==='found').every(f=>f.w===1&&f.d===1&&f.t===0.4)&&W.els.filter(x=>x.k==='found').length===6,'6 footings 1.0 x 1.0 x 0.40');
// slab: panel 4 x 5 ratio 1.25 two-way: 4/35 = 0.114 -> min 0.12
ok(W.info.tSlab===0.12&&!W.info.anyOne,'slab 12 cm two-way');
ok(W.els.filter(x=>x.rc==='beam').length===7&&W.els.filter(x=>x.rc==='tie').length===7,'7 beams (4 along X, 3 along Z) and 7 tie beams');
const bx=W.els.find(x=>x.rc==='beam'); ok(bx.h===0.4&&bx.w===0.25,'4 m beam 25 x 40 (4/12 = 0.333 -> 0.35 < 0.40 minimum)'); const bz=W.els.filter(x=>x.rc==='beam').find(x=>Math.abs(x.b[1]-x.a[1])>1); ok(bz.h===0.45,'5 m beam depth 5/12 = 0.4167 -> 0.45');
const M=W; const D=R.detailAll(M); const BB=R.bbs(M,null,K.netVol(M),D); const row=(tm,role)=>BB.rows.find(r=>r.tm===tm&&r.role===role);
const mTm=D.members.find(m=>m.el===bx).tm; const bm=D.members.filter(m=>m.tm===mTm);
// beam 4 m, columns 0.40 along X: bars from -0.17 to 4.17 = 4340 + 2 x 192 hooks - 4 x 16 = 4660 ; 4 bars (As 0.8% x 250 x 350 = 700 mm2 -> 4 x 201 = 804)
let r=row(mTm,'bottom'); ok(r.d===16&&r.nPer===4&&r.cut===4660&&r.shape==='U2','beam bottom: 4 x 16 mm, cut 4660 mm',r);
near(r.kg,r.nTot*4.66*256/162,1e-3,'beam bottom kg = total no x 4.66 m x 256/162');
r=row(mTm,'top continuous'); ok(r.d===14&&r.nPer===2&&r.cut===4620,'beam top: 2 x 14 mm, cut 4340 + 336 - 56 = 4620',r);
r=row(mTm,'top at support'); ok(r.d===16&&r.nPer===4&&r.cut===1610,'support top bars: 4 x 16 mm, 1450 + 192 - 32 = 1610 (extension 0.3 x 3.6 = 1.08 + 0.2 + 0.17)',r);
// stirrups: clear 3.6 m, end zone 0.8 m: floor((0.8-0.05)/0.1)+1 = 8 each end, middle ceil(2.0/0.2)-1 = 9 -> 25 ; cut 1154
r=row(mTm,'stirrups'); ok(r.nPer===25&&r.cut===1154&&r.d===8,'beam stirrups: 25 x 8 mm, 1154 mm',r);
// footing 1.0 x 1.0 x 0.40, cover 75: As 0.45 % x 1000 x 305 = 1372 mm2/m -> 16 mm at 125 (201 x 1000/125 = 1608) ; 7 bars each way: floor((850-16)/125)+1 = 7 ; hooked (225 < ld 620): 850 + 2 x 192 - 64 = 1170
const fTm=D.members.find(m=>m.type==='footing').tm; r=row(fTm,'bottom X'); ok(r.d===16&&r.nPer===7&&r.cut===1170&&r.shape==='U2'&&r.nMem===6,'footing X bars: 7 x 16 mm, 1170 mm, 6 footings',r);
near(R.bbs(M).rows.filter(x=>x.type==='footing').reduce((s,x)=>s+x.kg,0),6*14*1.17*256/162,0.01,'footing steel 6 x 14 bars x 1.17 m x 256/162 = 155.3 kg');
// neck column: ties 954 mm ((0.3 + 0.15) x 2 + 0.15 - 0.096), floor((1.0-0.10)/0.15)+1 = 7 ties
const nTm=D.members.find(m=>m.type==='neck').tm; r=row(nTm,'ties'); ok(r.cut===954&&r.nPer===7&&r.nMem===6,'neck ties: 7 x 954 mm in 6 necks',r);
// column: Ag 100000 mm2, 1 % = 1000 mm2 -> 5 x 16 -> 6 (even). bar from footing bottom: 4300 + 192 + 192 - 64 = 4620 ; ties 23 (5 + 5 + 13), cut 1114 ; cross ties 292
const cTm=D.members.find(m=>m.type==='column').tm; r=row(cTm,'main'); ok(r.d===16&&r.nPer===6&&r.cut===4620&&r.shape==='U2','column main: 6 x 16 mm, 1 x 192 + 4300 + 192 - 64 = 4620',r);
r=row(cTm,'ties'); ok(r.nPer===23&&r.cut===1114,'column ties 23 x 1114 mm (lo 0.5 m: 5 + 5 + ceil(2.0/0.15) - 1 = 13)',r); r=row(cTm,'cross ties'); ok(r.cut===292&&r.nPer===23,'cross ties 23 x 292 mm (75 + 190 + 75 - 48)',r);
// slab piece 4 x 5, t 0.12, Ø10 at 150: X bars floor(4960/150)+1 = 34 of 3960 ; Z bars floor(3960/150)+1 = 27 of 4960
const sl=D.members.filter(m=>m.type==='slab'); const sTm=sl[0].tm; r=row(sTm,'bottom X'); ok(r.d===10&&r.nPer===34&&r.cut===3960,'slab X bars 34 x 10 mm x 3960',r); r=row(sTm,'bottom Z'); ok(r.nPer===27&&r.cut===4960,'slab Z bars 27 x 4960',r);
// top bars over the interior edge x = 4: floor((5-0.04)/0.2)+1 = 25 bars of 2 x 0.3 x 4 = 2.4 m
const topRow=BB.rows.find(x=>x.role==='top at support'&&x.type==='slab'); ok(topRow&&topRow.nTot===25&&topRow.cut===2400&&topRow.d===8,'slab top bars 25 x 8 mm x 2400 (one interior edge)',topRow);
// slab on grade [-0.125..8.125] x [-0.125..5.125]: 26 bars of 8.15 + 41 bars of 5.15 = 423.05 m x 0.39506
const sg=BB.rows.filter(x=>x.type==='sog'); near(sg.reduce((s,x)=>s+x.kg,0),(26*8.15+41*5.15)*64/162,0.01,'slab on grade mesh = 423.05 m x 64/162 = 167.1 kg');
ok(BB.rows.every(x=>isFinite(x.kg)&&x.kg>0&&x.cut>0),'every row has a positive finite cut length and weight');
near(BB.totals.kg,BB.rows.reduce((s,x)=>s+x.kg,0),0.01,'total kg = sum of rows'); near(Object.values(BB.totals.byGroup).reduce((a,b)=>a+b,0),BB.totals.kg,0.01,'group tonnage adds up to the total'); near(Object.values(BB.totals.byDia).reduce((a,b)=>a+b,0),BB.totals.kg,0.01,'diameter totals add up to the total');
// independent recomputation of weight from the 3D polylines
let kg3=0; D.members.forEach(m=>m.groups.forEach(g=>g.insts.forEach(pl=>{ let L=0; for(let i=1;i<pl.length;i++)L+=Math.hypot(pl[i][0]-pl[i-1][0],pl[i][1]-pl[i-1][1],pl[i][2]-pl[i-1][2]); const dd=g.bends.reduce((s,a)=>s+(a===90?2:a===135?3:0)*g.d,0); kg3+=(L*1000-dd)/1000*g.d*g.d/162; })));
near(kg3,BB.totals.kg,BB.totals.kg*2e-3,'weight recomputed from the 3D bar polylines matches the schedule (within rounding of legs to mm)');
// every bar vertex lies inside some concrete box of the model (bars are inside the concrete)
const boxes=M.els.map(e=>K.boxOf(e,M.levels)).filter(Boolean); let outside=0,total=0; D.members.forEach(m=>{ if(m.type==='stair')return; m.groups.forEach(g=>g.insts.forEach(pl=>pl.forEach(p=>{ total++; if(!boxes.some(b=>p[0]>=b.x0-1e-6&&p[0]<=b.x1+1e-6&&p[2]>=b.z0-1e-6&&p[2]<=b.z1+1e-6&&p[1]>=b.y0-1e-6&&p[1]<=b.y1+1e-6))outside++; }))); }); ok(outside===0,'all '+total+' bar vertices lie inside concrete',outside);
console.log('== C. net concrete (hand example: column 0.4 x 0.25 x 3, beam 4 x 0.25 x 0.4 on top, slab 2 x 2 x 0.12)');
const tm={levels:[{n:'a',z:0},{n:'b',z:3}],els:[{id:'c',k:'col',lv:0,p:[0,0],w:0.4,d:0.25,h:3},{id:'b',k:'beam',lv:1,a:[0,0],b:[4,0],w:0.25,h:0.4,top:0},{id:'s',k:'floor',lv:1,a:[-1,-1],b:[1,1],t:0.12}]};
const nv=K.netVol(tm); near(nv.column,0.3,1e-9,'column 0.4 x 0.25 x 3 = 0.300'); near(nv.beam,0.38,1e-9,'beam 4 x 0.25 x 0.4 = 0.400 minus 0.2 x 0.25 x 0.4 inside the column = 0.380'); near(nv.slab,0.444,1e-9,'slab 0.48 - 0.012 (column) - 0.024 (beam outside the column) = 0.444'); near(nv.total,1.124,1e-9,'total 1.124 (each cm3 counted once)');
console.log('== D. default 12 x 10 m two-storey house: counts, geometry checks, negative tests');
const H=K.plan(); const cnt=k=>H.els.filter(e=>e.k===k).length;
ok(H.levels.map(l=>l.z).join()==='-1,0,3,6','levels -1, 0, 3, 6'); ok(cnt('found')===12&&H.els.filter(e=>e.rc==='neck').length===12&&H.els.filter(e=>e.rc==='column').length===24,'12 footings, 12 neck columns, 24 columns (12 grid nodes x 2 storeys)');
ok(H.els.filter(e=>e.rc==='tie').length===17&&H.els.filter(e=>e.rc==='beam').length===34,'17 tie beams ((3 lines x 3) + (4 x 2)) and 34 floor beams (17 per level)');
ok(cnt('floor')===14,'14 floor elements: 1 slab on grade + level 2 (5 panels + 2 pieces around the stair opening) + roof (6 panels)',cnt('floor'));
ok(H.els.filter(e=>e.k==='wall'&&e.rc==='wall').length===33&&cnt('stair')===1,'33 walls (16 + 17) and 1 stair');
const ck=K.check(H); ck.forEach(c=>ok(c.pass,'check: '+c.name,c.detail)); ok(ck.length===12,'12 checks ran');
const wl=H.els.find(e=>e.k==='wall'); ok(wl.a[0]===0.2&&wl.b[0]===3.8&&wl.h===2.6&&wl.t===0.25,'first wall runs between column faces 0.2 and 3.8 (columns 0.4 along X), height 3.0 - 0.40 beam = 2.60',wl);
const wz=H.els.find(e=>e.k==='wall'&&Math.abs(e.b[1]-e.a[1])>1); ok(wz.h===2.55,'wall along Z under a 0.45 beam is 2.55 high',wz.h);
const mut=(f,pass)=>{ const m=cl(H); f(m); const r=K.check(m).filter(c=>!c.pass); return r.map(c=>c.name); };
let f;
f=mut(m=>{ const w=m.els.find(e=>e.k==='wall'&&e.rc==='wall'&&!e.ext); w.a=[w.a[0]-0.4,w.a[1]]; }); ok(f.some(n=>/no wall intersects/.test(n)),'negative: a wall that runs into a column fails',f);
f=mut(m=>{ const o=m.els.find(e=>e.k==='window'); o.p=0.1; }); ok(f.some(n=>/inside its host wall/.test(n)),'negative: a window past the wall end fails',f);
f=mut(m=>{ const o=m.els.find(e=>e.k==='window'); o.sill=2.0; }); ok(f.some(n=>/inside its host wall/.test(n)),'negative: a window above the wall top fails',f);
f=mut(m=>{ const c=m.els.find(e=>e.rc==='column'&&e.lv===2); m.els.splice(m.els.indexOf(c),1); }); ok(f.some(n=>/columns stack/.test(n)),'negative: a missing upper column fails the stacking check',f);
f=mut(m=>{ const c=m.els.find(e=>e.rc==='column'&&e.lv===2); c.h=2.5; }); ok(f.some(n=>/columns stack/.test(n)),'negative: a short column fails (gap under the beam)',f);
f=mut(m=>{ const s=m.els.find(e=>e.rc==='slab'&&e.lv===2); s.b=[s.b[0]+0.3,s.b[1]]; }); ok(f.some(n=>/slab/.test(n)),'negative: a slab panel moved off the beam centreline fails',f);
f=mut(m=>{ const w=m.els.find(e=>e.k==='wall'&&e.lv===1&&e.rc==='wall'); w.h=2.7; }); ok(f.some(n=>/wall top|no wall intersects/.test(n)),'negative: a wall 10 cm too high fails',f);
f=mut(m=>{ const s=m.els.find(e=>e.k==='stair'); s.H=3.4; }); ok(f.some(n=>/stair/.test(n)),'negative: stair rise different from the level difference fails',f);
f=mut(m=>{ const s=m.els.filter(e=>e.rc==='slab'&&e.lv===2&&e.op); s.forEach(x=>{ if(x.a[1]===5&&x.b[1]===6.4)x.b[1]=7.2; else if(x.a[1]===6.4)x.a[1]=7.2; }); const o=m.els.filter(e=>e.op); o.forEach(x=>{ x.op[1]=7.2; }); }); ok(f.some(n=>/stair/.test(n)),'negative: a shorter stair opening fails the headroom check',f);
const net=K.summary(H,H); ok(net.inBand,'net concrete '+net.concretePerM2+' m3 per m2 of built-up area is inside the rule-of-thumb band 0.30-0.40',net.concretePerM2);
console.log('== E. other options');
const S=K.plan({found:'strip'}); ok(K.check(S).every(c=>c.pass),'strip footings: all geometry checks pass',K.check(S).filter(c=>!c.pass).map(c=>c.name)); ok(S.els.filter(e=>e.rc==='tie').length===0&&S.info.stripB>=0.8,'strip footing has no tie beams, width '+S.info.stripB);
const nn=S.els.filter(e=>e.k==='found'); let ov=0; for(let i=0;i<nn.length;i++)for(let j=i+1;j<nn.length;j++){ const a=K.boxOf(nn[i],S.levels), b=K.boxOf(nn[j],S.levels); ov+=K.ovol(a,b); } ok(ov<1e-9,'strips do not overlap each other',ov);
const O=K.plan({bx:[2.3,5],bz:[5],stair:null,storeys:1}); ok(O.info.anyOne&&O.els.some(e=>e.way==='one'),'a 2.3 x 5 m panel (ratio 2.17) is one-way'); ok(K.check(O).every(c=>c.pass),'irregular grid 2.3 + 5 x 5: checks pass');
const T3=K.plan({storeys:3,stair:[0,1]}); ok(K.check(T3).every(c=>c.pass),'three storeys: all checks pass',K.check(T3).filter(c=>!c.pass)); ok(T3.els.filter(e=>e.k==='stair').length===2,'three storeys: stair flights to levels 2 and 3');
let thr=false; try{ K.plan({bx:[0.5]}); }catch(e){ thr=/bay widths/.test(e.message); } ok(thr,'bay width 0.5 m is rejected');
console.log('== F. rebar options');
const base=R.bbs(H,null,null).totals.kg;
const cv=R.bbs(H,{cover:{beam:0.04}},null); const cvStir=cv.rows.find(x=>x.type==='beam'&&x.role==='stirrups'); ok(cvStir.cut===1034||cvStir.cut===1054||cvStir.cut>0,'cover 40 mm changes stirrups (A 170, B 320: 2 x 490 + 150 - 96 = 1034 for the 0.40 beam)'); ok(R.bbs(H,{cover:{beam:0.04}},null).rows.some(x=>x.type==='beam'&&x.role==='stirrups'&&x.cut===1034),'beam stirrup cut 1034 mm with 40 mm cover');
const cp=R.bbs(H,{coupler:16},null); const c1=R.bbs(H,null,null); const mainA=c1.rows.find(x=>x.type==='column'&&x.role==='main'&&x.shape==='L1'), mainB=cp.rows.find(x=>x.type==='column'&&x.role==='main'&&x.shape==='L1'); ok(mainA.cut-mainB.cut===800,'couplers from 16 mm remove the 800 mm lap from the ground-storey column bars',[mainA.cut,mainB.cut]);
const dz=R.bbs(H,{design:i=>i.type==='column'?{AsCol:2000}:null},null); ok(dz.rows.find(x=>x.type==='column'&&x.role==='main').nPer>6,'a design result (AsCol 2000 mm2) replaces the preliminary ratio: more column bars',dz.rows.find(x=>x.type==='column'&&x.role==='main').nPer);
const bd=R.bbs(H,null,K.netVol(H)).density; ['Footings','Columns','Beams','Slabs'].forEach(g=>ok(bd[g]&&bd[g].kgPerM3>=bd[g].band[0]&&bd[g].kgPerM3<=bd[g].band[1],'steel per m3 '+g+' '+(bd[g]&&bd[g].kgPerM3)+' inside the rule-of-thumb band '+(bd[g]&&bd[g].band.join('-'))));
ok(R.csv(R.bbs(H,null,null)).split('\n').length>50,'CSV export has a row per bar mark');
console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
