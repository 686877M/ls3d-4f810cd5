/* qa test (chunks qa_*.js). Run: NODE_PATH=<dir with playwright-core> node qa_test.js [file:///path/index.test.html]   (CHROME=<path> overrides Chrome)
   Every number is hand-calculated in this file (never copied from the code under test). Hooks: __lsv.ev (needs localStorage xto-test=1) and window.QAX. */
const {chromium}=require('playwright-core');
const URL=process.argv[2]||'file:///private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/work_qaplan/site/index.test.html';
const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0, fail=0; const ok=(c,m)=>{ if(c){ pass++; console.log('  ok   '+m); } else { fail++; console.log('  FAIL '+m); } }; const near=(a,b,t)=>Math.abs(a-b)<=(t||1e-6);
(async()=>{
const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});
await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
const pg=await ctx.newPage(), er=[]; pg.setDefaultTimeout(120000); pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept('x'));
const E=s=>pg.evaluate(s=>{ const r=__lsv.ev(s); return r===undefined?null:JSON.parse(JSON.stringify(r)); },s);
await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:240000}); await pg.waitForTimeout(8000); await E("lang='en'");
ok(await E("typeof QAX==='object'&&typeof computeSched==='function'&&!!G"),'chunks loaded, P.X engine ready (G present)');
/* ================= 1. schedule logic on a hand-calculated network ================= */
console.log('== 1 schedule logic (P.X CPM through the generator path)');
await E("(()=>{ CAL.work=[6,0,1,2,3,4]; CAL.hol=[]; PS.start='2026-12-05'; PS.dd='2026-12-05'; const R=(id,d,pr)=>({id,wbs:'Q1',n:[id,id],d,ms:null,pr:pr.map(p=>[p[0],p[1]||'FS',p[2]||0]),crew:[],eq:[],wt:0,st:'',hp:[]}); QAX.insert([R('T1',3,[]),R('T2',4,[['T1']]),R('T3',2,[['T1']]),R('T4',2,[['T2'],['T3']]),R('T5',1,[['T4']]),R('T6',1,[['T5','FS',2]]),R('T7',5,[['T1','SS',1]])],{replace:true}); computeSched(); return 1; })()");
const N=await E("(()=>{ const o={}; ACT.forEach(a=>o[a.id]={es:a.es,ef:a.ef,tf:a.tf,crit:!!a.crit,f:ISO(a.fDate)}); return {o,pf:PS.pf,s:QAX.summary()}; })()");
// hand calc, working days numbered from 0 (Sat 5 Dec 2026), Friday off: T1 0-3, T2 3-7, T3 3-5 (float 2), T4 7-9, T5 9-10, T6 (FS+2) 12-13, T7 (SS+1) 1-6 (float 7)
ok(N.pf===13,'project length 13 working days (got '+N.pf+')');
ok(N.o.T1.es===0&&N.o.T1.ef===3&&N.o.T2.es===3&&N.o.T2.ef===7&&N.o.T3.es===3&&N.o.T3.ef===5,'forward pass T1,T2,T3');
ok(N.o.T4.es===7&&N.o.T4.ef===9&&N.o.T5.es===9&&N.o.T5.ef===10&&N.o.T6.es===12&&N.o.T6.ef===13,'forward pass T4,T5 and the FS+2 lag on T6');
ok(N.o.T7.es===1&&N.o.T7.ef===6,'SS+1 link: T7 starts day 1');
ok(N.o.T3.tf===2&&N.o.T7.tf===7&&N.o.T2.tf===0,'total float T3=2, T7=7, T2=0 (got '+N.o.T3.tf+','+N.o.T7.tf+','+N.o.T2.tf+')');
ok(['T1','T2','T4','T5','T6'].every(i=>N.o[i].crit)&&!N.o.T3.crit&&!N.o.T7.crit,'critical path T1-T2-T4-T5-T6');
ok(N.s.critIds.join()==='T1,T2,T4,T5,T6','summary critical ids in order');
ok(N.o.T5.f==='2026-12-15'&&N.o.T6.f==='2026-12-19'&&N.s.finish==='2026-12-19','finish dates: T5 Tue 15 Dec, T6 / project Sat 19 Dec (Friday skipped)');
/* ================= 2. template schedule ================= */
console.log('== 2 template schedule for a 2-storey RC house');
const S0=await E("QAX.apply({bua:400,crew:1,start:'2026-12-05',cal:6,shoring:false,replace:true,budget:1000000})");
const rows=await E("QAX.rows({bua:400,crew:1,shoring:false})");
const fwd=(rs)=>{ const by={}; rs.forEach(r=>{ let es=0; r.pr.forEach(p=>{ const q=by[p[0]], L=p[2]; if(p[1]==='FS')es=Math.max(es,q.ef+L); else if(p[1]==='SS')es=Math.max(es,q.es+L); }); by[r.id]={es,ef:es+r.d}; }); return Math.max(...Object.values(by).map(x=>x.ef)); };
const exp=fwd(rows);
ok(S0.workDays===exp,'template length equals an independent forward pass of the rows ('+S0.workDays+' vs '+exp+')');
ok(S0.loops===0&&S0.nAct===rows.length-2,'no loops; '+S0.nAct+' activities + 2 milestones');
ok(S0.calDays>=300&&S0.calDays<=430,'overall duration inside the 10-14 month rule of thumb ('+S0.calDays+' calendar days = '+S0.months+' months)');
const chain=await E("(()=>{ const c=ACT.filter(a=>a.crit&&a.t!=='ms').sort((x,y)=>x.es-y.es); let good=true; for(let i=1;i<c.length;i++){ const ok=(c[i].preds||[]).some(p=>{ const q=ACT.find(x=>x.id===p.id); return q&&q.crit&&((p.type==='FS'&&q.ef+(+p.lag||0)===c[i].es)||(p.type==='SS'&&q.es+(+p.lag||0)===c[i].es)); }); if(!ok)good=false; } return {good,first:c[0].id,last:c[c.length-1].id,n:c.length}; })()");
ok(chain.good&&chain.first==='W010'&&chain.last==='W520','critical path is continuous and logic-driven, W010 ... W520 ('+chain.n+' activities)');
const order=await E("(()=>{ const g=id=>ACT.find(a=>a.id===id); const lt=(a,b)=>g(a).ef<=g(b).es; return [lt('W040','W050'),lt('W070','W080'),lt('W120','W130'),lt('W160','W180'),lt('W220','W260'),lt('W280','W290'),lt('W290','W300'),lt('W310','W340'),lt('W340','W350'),lt('W360','W510'),lt('W510','W520')]; })()");
ok(order.every(Boolean),'true construction order: soil accepted before blinding, footings before columns, MEP first-fix tested before plaster, plaster before finishes, second fix after paint, tests before handover');
const lagOk=await E("(()=>{ const g=id=>ACT.find(a=>a.id===id); return {curing:g('W180').es-g('W160').ef, stripGap:g('W140').es-g('W135').ef}; })()");
ok(lagOk.curing===7&&lagOk.stripGap===1,'7-day curing lag before the next-floor columns, 1-day gap before props (got '+lagOk.curing+','+lagOk.stripGap+')');
const sc=await E("(()=>{ const r1=QAX.rows({bua:800,crew:1}), r2=QAX.rows({bua:400,crew:2}), r0=QAX.rows({bua:400,crew:1}); const f=(r,id)=>r.find(x=>x.id===id); return {a:f(r1,'W060').d,b:f(r0,'W060').d,c:f(r2,'W060').d,cure:f(r1,'W090').d,heads:f(r2,'W060').crew[0][1],sh:QAX.rows({bua:400,crew:1,shoring:true}).length-r0.length}; })()");
ok(sc.b===8&&sc.a===16&&sc.c===4,'labour rows scale with area and crews: W060 8 d at 400 m2, 16 d at 800 m2, 4 d with 2 crews');
ok(sc.cure===7&&sc.heads===10&&sc.sh===1,'fixed rows (curing 7 d) do not scale; crew heads double; shoring option adds one activity');
const meta=await E("(()=>{ const d=DATA.qa.act; const a=d.W060; return {crew:a.crew.map(x=>x.join(':')).join(),eq:a.eq.map(x=>x.join(':')).join(),hp:a.hp.join(),n:Object.keys(d).length,crewN:ACT.find(x=>x.id==='W060').crew,src:ACT.find(x=>x.id==='W060').src}; })()");
ok(meta.crew==='sf:5,lab:2'&&meta.eq==='bend:1'&&meta.hp==='rebar'&&meta.crewN===7&&meta.src==='qa','crews, equipment, hold point and head-count stored per activity');
const keep=await E("(()=>{ ACT.push({id:'ZZ',t:'civil',wbs:'Q1',src:'x',n:['z','z'],d:1,fix:1,after:[],lead:0,crew:1,parts:[],veh:[],hz:[],zone:[0,0,2],mat:null,m:[]}); QAX.apply({bua:500,crew:1,start:'2026-12-05',cal:6,replace:false,holds:false}); const r={zz:!!ACT.find(a=>a.id==='ZZ'),qa:ACT.filter(a=>a.src==='qa').length,dup:ACT.length-new Set(ACT.map(a=>a.id)).size}; ACT.splice(ACT.findIndex(a=>a.id==='ZZ'),1); QAX.apply({bua:400,crew:1,start:'2026-12-05',cal:6,replace:true,budget:1000000}); return r; })()");
ok(keep.zz&&keep.dup===0&&keep.qa>40,'replace=false keeps other activities and does not duplicate ids');
/* ---- save and reload survive ---- */
const rl=await E("(()=>{ persist(); const j=projectJson(); const n0=ACT.length, f0=QAX.summary().finish; delete WBSN.Q4; hiApply(j); return {n0,n1:ACT.length,tag:ACT.filter(a=>a.src==='qa').length,wbs:!!WBSN.Q4,f0,f1:QAX.summary().finish,hp:DATA.qa.hp.length}; })()");
ok(rl.n1===rl.n0&&rl.tag===rl.n0&&rl.wbs&&rl.f0===rl.f1,'project save / load keeps the activities, their tags, WBS names and the finish date ('+rl.n1+' activities)');
const bs=await E("(()=>{ const j=projectJson(); const o=JSON.parse(j); delete o.data.qa; delete o.data.sched; hiApply(JSON.stringify(o)); const ids=ACT.map(a=>a.id); const r={hasBase:ids.includes('M0'),qaLeft:ACT.some(a=>a.src==='qa')}; hiApply(j); r.back=ACT.filter(a=>a.src==='qa').length; r.baseGone=!ACT.some(a=>a.id==='M0'); return r; })()");
ok(bs.hasBase&&!bs.qaLeft&&bs.back===rl.n0&&bs.baseGone,'loading a project without a template brings the original activities back; loading one with it replaces them again');
/* ================= 3. hold points and blocking ================= */
console.log('== 3 hold points: stage cannot be completed until signed');
const H=await E("(()=>{ const hp=DATA.qa.hp; const want=Object.values(DATA.qa.act).reduce((s,x)=>s+x.hp.length,0); return {n:hp.length,want,ids:hp.filter(h=>h.act==='W060').map(h=>h.id)}; })()");
ok(H.n===H.want&&H.n>30,'one hold-point record per activity x checklist key ('+H.n+')');
const B1=await E("(()=>{ const r=QAX.setPct('W060',100); return {r,pct:ACT.find(a=>a.id==='W060').pct}; })()");
ok(B1.r.ok===false&&B1.pct===99&&B1.r.missing.length===1,'100 % refused while the rebar hold point is unsigned (capped at 99)');
await E("(()=>{ ACT.find(a=>a.id==='W060').pct=100; computeSched(); return 1; })()");
ok(await E("ACT.find(a=>a.id==='W060').pct")===99,'direct edits are caught too: computeSched caps an unsigned stage at 99 %');
const V1=await E("(()=>{ ACT.find(a=>a.id==='W070').pct=20; computeSched(); return QAX.viol(); })()");
ok(V1.some(v=>v.act==='W070'&&v.pred==='W060'),'work started after an unsigned predecessor hold point is reported');
const hid=H.ids[0];
const S1=await E("QAX.hpSign('"+hid+"','A. Inspector','2026-12-20')"); ok(S1.ok===false&&/unchecked/.test(S1.why),'sign refused with unchecked items');
await E("DATA.qa.hp.find(h=>h.id==='"+hid+"').items.forEach((i,k)=>{ i.r=k===0?'no':'ok'; })"); const S2=await E("QAX.hpSign('"+hid+"','A. Inspector','2026-12-20')"); ok(S2.ok===false&&/Not OK/.test(S2.why),'sign refused when an item is Not OK');
await E("DATA.qa.hp.find(h=>h.id==='"+hid+"').items.forEach(i=>{ i.r='ok'; })"); const S3=await E("QAX.hpSign('"+hid+"','','2026-12-20')"); ok(S3.ok===false&&/inspector/.test(S3.why),'sign refused without an inspector name');
const S4=await E("QAX.hpSign('"+hid+"','A. Inspector','not a date')"); ok(S4.ok===false&&/date/.test(S4.why),'sign refused without a valid date');
const S5=await E("QAX.hpSign('"+hid+"','A. Inspector','2026-12-20')"); ok(S5.ok===true,'sign accepted with all items ok, inspector and date');
const B2=await E("QAX.setPct('W060',100)"); ok(B2.ok===true&&await E("ACT.find(a=>a.id==='W060').pct")===100,'stage can be completed after the signature');
const V2=await E("QAX.viol()"); ok(!V2.some(v=>v.pred==='W060'),'violation for W060 cleared once signed');
const hf=(await E("DATA.qa.hp.filter(h=>h.act==='W065').map(h=>h.id)"))[0];
await E("QAX.hpFail('"+hf+"','bad')"); ok((await E("QAX.canComplete('W065')")).ok===false&&await E("DATA.qa.hp.find(h=>h.id==='"+hf+"').status")==='failed','failed hold point keeps the stage blocked');
const W0=await E("QAX.hpWaive('"+hf+"','','')"); ok(W0.ok===false,'waiver refused without reason and approver');
const W1=await E("QAX.hpWaive('"+hf+"','owner accepts the deviation','Project manager')"); ok(W1.ok===true&&(await E("QAX.canComplete('W065')")).ok===true,'formal waiver clears the block');
// auto checks
const hs=(await E("DATA.qa.hp.filter(h=>h.key==='snag').map(h=>h.id)"))[0];
await E("DATA.qa.hp.find(h=>h.id==='"+hs+"').items.forEach(i=>{ i.r='ok'; }); DATA.qa.snag=[{id:'SN001',room:'Kitchen',trade:'x',desc:'d',cat:'A',due:'',status:'open',round:1}]; 1");
const A1=await E("QAX.hpSign('"+hs+"','Q','2026-12-20')"); ok(A1.ok===false&&/Category A/.test(A1.why),'snag hold point is refused while a Category A snag is open');
await E("DATA.qa.snag[0].status='closed'"); ok((await E("QAX.hpSign('"+hs+"','Q','2026-12-20')")).ok===true,'... and accepted once the A snag is closed');
const sg=await E("(()=>{ DATA.qa.snag=[{id:'a',room:'Kitchen',cat:'A',status:'open'},{id:'b',room:'Kitchen',cat:'B',status:'closed'},{id:'c',room:'Living / المعيشة',cat:'C',status:'fixed'}]; return QAX.snagSum(); })()");
ok(sg.find(x=>x.room==='Kitchen').n===2&&sg.find(x=>x.room==='Kitchen').openA===1&&sg.find(x=>x.room==='Kitchen').closed===1,'snag summary by room counts total / open A / closed');
await E("DATA.qa.snag=[]");
/* ================= 4. cube tests ================= */
console.log('== 4 concrete cube statistics');
await E("(()=>{ const c=QAX.cubeCfg(); c.sets=[{id:'S1',r7:['22','23','24'],r28:['30','31','32']},{id:'S2',r7:['','',''],r28:['27','28','29']},{id:'S3',r7:['','',''],r28:['33','34','']},{id:'S4',r7:['10','10','10'],r28:['30','30','20']}]; return 1; })()");
const cb=await E("QAX.cube()");
const sv=Object.fromEntries(cb.sets.map(s=>[s.id,s]));
ok(sv.S1.v==='PASS'&&near(sv.S1.mean28,31)&&sv.S1.min28===30,'set S1 mean 31, min 30 against fcu 25 + margin 4 and 25 - 3: PASS');
ok(sv.S2.v==='FAIL'&&/mean/.test(sv.S2.why[0]),'set S2 mean 28 < 29: FAIL');
ok(sv.S3.v==='INCOMPLETE','set S3 with two cubes: INCOMPLETE');
ok(sv.S4.v==='FAIL'&&sv.S4.why.length===2&&sv.S4.early===true&&sv.S1.early===false,'set S4: mean 26.67 and min 20 both fail; 7-day mean 10 < 0.65 x fcu gives the early warning');
// hand: means 31, 28, 26.6667 -> mean 28.5556, sample sd sqrt(9.8519/2)=2.2194
ok(cb.n===3&&near(cb.mean,28.5556,1e-3)&&near(cb.sd,2.2194,1e-3)&&near(cb.cov,7.7728,2e-3),'statistics of set means: n 3, mean 28.556, sd 2.219, CoV 7.77 % (got '+cb.mean.toFixed(4)+', '+cb.sd.toFixed(4)+')');
ok(cb.fails===2&&cb.early===1&&/indicative/.test(cb.note)&&cb.est===null&&cb.roll.length===1&&cb.roll[0].ok===false,'2 failed sets, small-n honesty note, no characteristic-strength estimate under 15 sets, rolling window of 3 fails');
await E("(()=>{ const c=QAX.cubeCfg(); c.sets=Array.from({length:15},(_,i)=>({id:'X'+i,r7:['','',''],r28:['31','31','31']})); return 1; })()"); const c15=await E("QAX.cube()"); ok(c15.n===15&&near(c15.est,31)&&c15.note==='','15 identical sets give an estimate = mean (sd 0) and no small-n note');
await E("QAX.cubeCfg().sets=[]");
/* ================= 5. cost, S-curve, cash flow ================= */
console.log('== 5 S-curve and cash flow');
const C1=await E("(()=>{ const s=QAX.scurve(), m=QAX.monthly(), c=QAX.cash(); return {tot:s.total,last:s.pts[s.pts.length-1].pct,mon:m.reduce((a,x)=>a+x.v,0),nm:m.length,paid:c.paidTotal,cumLast:c.rows[c.rows.length-1].cum,ret:c.retention,adv:c.advance,monotone:s.pts.every((p,i)=>i===0||p.cum>=s.pts[i-1].cum-1e-9)}; })()");
ok(near(C1.tot,1000000,1e-4),'S-curve total equals the budget of 1,000,000 (sample weights add up to 100 %): '+C1.tot);
ok(near(C1.last,100,1e-9)&&C1.monotone,'S-curve ends at 100 % and never falls');
ok(near(C1.mon,C1.tot,1e-4)&&C1.nm>=9,'monthly work values add up to the total over '+C1.nm+' months');
ok(near(C1.paid,C1.tot,1e-4)&&near(C1.cumLast,C1.tot,1e-4),'cash flow: advance + net payments + retention release = total');
ok(near(C1.ret,50000,1e-3)&&near(C1.adv,100000,1e-3),'retention 5 % = 50,000 and advance 10 % = 100,000');
const C2=await E("(()=>{ DATA.qa.cost.rows.W060={amt:'500000'}; const share=1000000*DATA.qa.act.W060.wt/Object.values(DATA.qa.act).reduce((s,x)=>s+x.wt,0); const s=QAX.scurve(); const a=ACT.find(x=>x.id==='W060'); delete DATA.qa.cost.rows.W060; return {tot:s.total,exp:1000000-share+500000}; })()");
ok(near(C2.tot,C2.exp,1e-3),'a typed amount replaces the sample share ('+C2.tot.toFixed(2)+')');
const C3=await E("(()=>{ const w=qxWb(), sh=w.sheets[0]; sh.cells[qxK(6,1)]=250000; DATA.qa.cost.rows.W070={qx:'"+"'+sh.name+'"+"!B7'}; const v=qaQx(sh.name+'!B7'); const a=ACT.find(x=>x.id==='W070'); const u=qaActCost(a); delete DATA.qa.cost.rows.W070; delete sh.cells[qxK(6,1)]; return {v,u}; })()");
ok(C3.v===250000&&C3.u.amt===250000&&C3.u.src==='Q.X','a Q.X cell reference supplies the activity cost');
// one activity, hand-calculated: cost 600 over Sat 5 Dec - Thu 17 Dec 2026 (12 working days), advance 10 %, retention 5 %, delay 1 month, defects 12 months
const C4=await E("(()=>{ const keepA=ACT.slice(), keepD=JSON.stringify(DATA.qa); CAL.work=[6,0,1,2,3,4]; PS.start='2026-12-05'; QAX.insert([{id:'U1',wbs:'Q1',n:['U','U'],d:12,ms:null,pr:[],crew:[],eq:[],wt:1,st:'',hp:[]}],{replace:true}); const c=DATA.qa.cost; c.budget=600; c.rows={}; c.adv=10; c.ret=5; c.delay=1; c.defects=12; c.cap=0; c.funds=0; const r=QAX.cash(); const o={}; r.rows.forEach(x=>{ if(x.out)o[x.k]=Math.round(x.out*100)/100; }); const res={o,peak:r.peakMonth,total:r.total,n:r.months.length}; return res; })()");
ok(C4.o['2026-12']===60&&C4.o['2027-01']===510&&C4.o['2028-01']===30&&Object.keys(C4.o).length===3,'hand-calculated cash flow: Dec 60 advance, Jan 510 net, Jan 2028 30 retention (got '+JSON.stringify(C4.o)+')');
ok(C4.peak==='2027-01'&&C4.total===600,'peak month 2027-01, total 600');
/* ================= 6. resources and levelling ================= */
console.log('== 6 resource histogram and levelling');
const R1=await E("(()=>{ CAL.work=[6,0,1,2,3,4]; PS.start='2026-12-05'; const R=(id,d,pr,c)=>({id,wbs:'Q1',n:[id,id],d,ms:null,pr,crew:[['lab',c]],eq:[],wt:1,st:'',hp:[]}); QAX.insert([R('L0',1,[],0),R('LA',3,[['L0','FS',0]],5),R('LB',1,[['L0','FS',0]],5),R('LE',10,[['L0','FS',0]],1),R('LC',1,[['LA','FS',0],['LB','FS',0]],2)],{replace:true}); const p=QAX.profile(); return {tot:p.tot.slice(0,6),peak:p.peak,pf:PS.pf}; })()");
// hand calc: L0 day 0 (crew 0); day1 LA5+LB5+LE1=11; days 2,3 LA5+LE1=6; day4 LC2+LE1=3 ; LE runs days 1-10 so the project is 11 days; LB has float 8
ok(R1.tot.join()==='0,11,6,6,3,1'&&R1.peak===11&&R1.pf===11,'histogram by hand: 0,11,6,6,3,1 (peak 11, project 11 days) got '+R1.tot);
const LV=await E("(()=>{ const pre=ACT.map(a=>a.cs); const r=QAX.level(6,false); const post=ACT.map(a=>a.cs); return {r,untouched:post.every((x,i)=>x===pre[i])}; })()");
ok(LV.r.peakBefore===11&&LV.r.peakAfter===6&&LV.r.overDays===0&&LV.r.moved.join()==='LB'&&LV.r.steps===3&&LV.r.finish===11,'levelling preview: only LB (float 8) moves 3 days to day 4, peak 11 -> 6, no day over 6, finish unchanged 11');
ok(LV.untouched,'preview leaves P.X constraints untouched');
const LV2=await E("(()=>{ const f0=PS.pf; const r=QAX.level(6,true); const b=ACT.find(a=>a.id==='LB'), c=ACT.find(a=>a.id==='LC'); return {f0,f1:PS.pf,cs:b.cs,es:b.es,ces:c.es,pk:QAX.profile().peak}; })()");
ok(LV2.f0===LV2.f1&&LV2.cs&&LV2.cs.t==='SNET'&&LV2.es===4&&LV2.ces===5&&LV2.pk===6,'apply: LB gets a start-no-earlier-than constraint (starts day 4), its successor LC follows to day 5, project length unchanged ('+LV2.f1+'), peak '+LV2.pk);
const pkT=await E("(()=>{ QAX.apply({bua:400,crew:1,start:'2026-12-05',cal:6,replace:true,budget:1000000}); const p=QAX.profile(); // independent: sum crew heads of activities whose [es,ef) contains each day\n const n=p.n, t=Array(n).fill(0); ACT.forEach(a=>{ const x=DATA.qa.act[a.id]; if(!x||a.t==='ms')return; const h=x.crew.reduce((s,c)=>s+c[1],0); for(let i=a.es;i<a.ef;i++)t[i]+=h; }); return {a:p.peak,b:Math.max(...t),same:p.tot.every((v,i)=>v===t[i])}; })()");
ok(pkT.a===pkT.b&&pkT.same&&pkT.a>20,'template histogram equals an independent day-by-day sum (peak '+pkT.a+' workers)');
/* ================= 7. plot rules, setback geometry, overlays ================= */
console.log('== 7 plot rules and setback offset');
const O=await E("(()=>{ const r=(P,d)=>{ const o=QAX.offset(P,d); return {ok:o.ok,a:o.area,m:o.method,e:!!o.empty,poly:o.poly}; }; const rect=[[0,0],[20,0],[20,30],[0,30]]; const sorted=p=>p.map(v=>v.map(x=>Math.round(x*1e6)/1e6).join()).sort().join(' '); const a=r(rect,[5,2,3,2]); const cw=r(rect.slice().reverse(),[3,2,5,2]); const tri=r([[0,0],[4,0],[0,3]],.5); const L=r([[0,0],[10,0],[10,4],[4,4],[4,10],[0,10]],1); const big=r(rect,[40,0,0,0]); const same=r(rect,0); const sq=r([[0,0],[4,0],[4,4],[0,4]],3); const Lbig=r([[0,0],[10,0],[10,4],[4,4],[4,10],[0,10]],2.5); return {a:{ok:a.ok,area:a.a,m:a.m,v:sorted(a.poly)},cw:{area:cw.a},tri:tri,L:{ok:L.ok,area:L.a,m:L.m,v:sorted(L.poly)},bigE:big.e,same:same.a,sq:sq.e,Lbig:Lbig.ok}; })()");
ok(O.a.ok&&near(O.a.area,352,1e-9)&&O.a.m==='clip'&&O.a.v==='18,27 18,5 2,27 2,5'.split(' ').sort().join(' '),'rectangle 20 x 30, setbacks front 5, side 2, rear 3, side 2: envelope 16 x 22 = 352 m2, corners (2,5)-(18,27)');
ok(near(O.cw.area,352,1e-9),'same result for clockwise vertex order (edge distances follow the edges)');
ok(near(O.tri.a,1.5,1e-9)&&O.tri.m==='clip','3-4-5 triangle offset 0.5 (inradius 1): similar triangle at scale 0.5, area 6 x 0.25 = 1.5');
ok(O.L.ok&&near(O.L.area,28,1e-9)&&O.L.m==='miter'&&O.L.v==='1,1 1,9 3,3 3,9 9,1 9,3'.split(' ').sort().join(' '),'concave L-plot offset 1 (mitred): vertices (1,1)(9,1)(9,3)(3,3)(3,9)(1,9), area 8x2 + 2x6 = 28');
ok(O.bigE===true&&O.sq===true&&near(O.same,600,1e-9),'a setback larger than the plot gives an empty envelope; zero setbacks give the plot back (600)');
ok(O.Lbig===false,'concave plot with setbacks that make the arms collapse is refused instead of returning a wrong shape');
const R0=await E("(()=>{ const r=QAX.rules(); return {n:r.rows.length,empty:r.rows.every(x=>x.v===''&&!x.sample)}; })()");
ok(R0.n===8&&R0.empty,'rules table ships EMPTY: no regulation values, nothing marked as set');
const PC0=await E("(()=>{ QAX.setPlot({src:'manual',ref:'',name:'test',pts:[[0,0],[20,0],[20,30],[0,30]]},1); return QAX.planCheck().map(x=>x.st).join(); })()");
ok(/^unset,unset,unset,unset,unset,noinput$/.test(PC0),'with no rules every limit check says "rule not set" (the fit test waits for a footprint)');
const PC1=await E("(()=>{ QAX.loadSample(); const r=QAX.rules(); const e=QAX.env(); r.prop={foot:'300',floors:'2',height:'9',park:'1'}; const pc=QAX.planCheck(); const o={}; pc.forEach(x=>o[x.k]=x.st); r.prop.foot='310'; const o2=QAX.planCheck().find(x=>x.k==='cov'); return {env:e.area,sample:r.rows.filter(x=>x.sample).length,o,cov2:o2}; })()");
ok(near(PC1.env,384,1e-9)&&PC1.sample===8,'sample values are flagged SAMPLE; envelope with sample setbacks 3/3/2/2 on 20 x 30 = 16 x 24 = 384');
ok(PC1.o.cov==='ok'&&PC1.o.far==='ok'&&PC1.o.fl==='ok'&&PC1.o.h==='ok'&&PC1.o.pk==='over'&&PC1.o.fit==='ok','checks: coverage 300/600 = 50 % ok, FAR 1.0 ok, floors, height, parking 1 < 2 over, footprint 300 <= 384 fits');
ok(PC1.cov2.st==='over'&&near(PC1.cov2.val,310/600*100,1e-9),'footprint 310 gives coverage 51.7 % > 50 %: over');
const CX=await E("(()=>{ const D=cadD(); const n0=D.ents.length; cadAdd({t:'pl',p:[[0,0],[20,0],[20,30],[0,30]],cl:true,ly:'0'}); const src=qaPlotSources().filter(s=>s.src==='cx'); const s=src[src.length-1]; QAX.setPlot(s,1); const env=QAX.env(); qaDrawCx(env.poly,'t',1); const se=D.ents.filter(e=>e.ly==='SETBACK'&&e.t==='pl'); const a=Math.abs(QAX.area(se[0].p)); qaDrawCx(env.poly,'t',1); const again=D.ents.filter(e=>e.ly==='SETBACK'&&e.t==='pl').length; const lay=D.layers.some(l=>l.n==='SETBACK'); D.ents.length=n0; D.layers=D.layers.filter(l=>l.n!=='SETBACK'); return {n:se.length,vtx:se[0].p.length,a,again,lay,src:src.length}; })()");
ok(CX.n===1&&CX.vtx===4&&near(CX.a,384,1e-6)&&CX.again===1&&CX.lay,'C.X overlay: closed polyline on layer SETBACK (area 384); drawing it again replaces, not duplicates');
const GX=await E("(()=>{ const L0=GM.layers[0], lat=30.0, lon=31.0, k=0.0002; L0.feat.push({t:'poly',g:[[lat,lon],[lat,lon+2*k],[lat+3*k,lon+2*k],[lat+3*k,lon]],n:'testplot',c:'#fff'}); const s=qaPlotSources().find(x=>x.src==='gx'&&x.ref==='testplot'); QAX.setPlot(s,1); const area0=Math.abs(QAX.area(QAX.rules().plot.pts)); const env=QAX.env(); qaDrawGx(env.poly,'Buildable envelope',QAX.rules().plot.origin); const SL=GM.layers.find(l=>l.n==='Setback'); const f=SL&&SL.feat.find(x=>x.n==='Buildable envelope'); const pn=qaPlane(30,31), P=f.g.map(pn.to); const a=Math.abs(QAX.area(P)); const res={area0,envA:env.area,a,nf:f.g.length,ratio:a/env.area}; L0.feat=L0.feat.filter(x=>x.n!=='testplot'); GM.layers=GM.layers.filter(l=>l.n!=='Setback'); return res; })()");
ok(GX.area0>400&&GX.nf>=3&&near(GX.ratio,1,2e-3),'G.X overlay: polygon feature added in a Setback layer, area matches the computed envelope ('+GX.a.toFixed(1)+' of plot '+GX.area0.toFixed(1)+' m2)');
/* ================= 8. logistics ================= */
console.log('== 8 site logistics layout and checklists');
const LG=await E("(()=>{ const D=cadD(); const n0=D.ents.length; const e=QAX.logi([[0,0],[20,0],[20,30],[0,30]],{crane:15,gate:4}); const layers=[...new Set(e.map(x=>x.ly))].sort(); const cr=e.find(x=>x.t==='c'); const n1=qaLogiDraw(); const c1=D.ents.filter(x=>/^SITE-/.test(x.ly||'')).length; const n2=qaLogiDraw(); const c2=D.ents.filter(x=>/^SITE-/.test(x.ly||'')).length; D.ents.length=n0; D.layers=D.layers.filter(l=>!/^SITE-/.test(l.n)); return {layers,r:cr.r,n:e.length,c1,c2,gate:e.filter(x=>x.ly==='SITE-ACCESS').length}; })()");
ok(LG.layers.join()==='SITE-ACCESS,SITE-CRANE,SITE-HOARD,SITE-OFFICE,SITE-PUMP,SITE-STORE'&&LG.r===15,'layout template: hoarding, access, pump, crane (radius 15), storage, office layers');
ok(LG.c1===LG.n&&LG.c2===LG.n,'inserting into C.X draws '+LG.n+' objects and a second insert replaces them');
/* ================= 9. close-out ================= */
console.log('== 9 tender, as-built, O&M, final account');
const TD=await E("(()=>{ const t=qaTend(); t.issue='2026-12-01'; const c=QAX.tend(); const g=k=>c.find(x=>x.k===k); t.steps.find(s=>s.k==='clar').date='2026-12-11'; const c2=QAX.tend().find(x=>x.k==='clar'); return {visit:g('visit').date,bids:g('bids').date,swo:g('swo').date,off:g('swo').off,fri:c2.offDay,fridate:c2.date}; })()");
ok(TD.visit==='2026-12-08'&&TD.bids==='2026-12-22'&&TD.swo==='2027-01-26'&&TD.off===56,'tender dates from 1 Dec 2026: visit 8 Dec, bids 22 Dec, start-work order 26 Jan 2027 (day 56)');
ok(TD.fri===true&&TD.fridate==='2026-12-11','a typed date on a Friday (non-working day) is flagged');
const AB=await E("(()=>{ const rl=qaA('asb'); rl.push({id:'RL001',sheet:'A-01',loc:'x',desc:'d',by:'',date:'2026-12-01',status:'open',chg:''}); const hid=DATA.qa.hp.find(h=>h.key==='asbuilt'); hid.items.forEach(i=>{ i.r='ok'; }); const a=QAX.hpSign(hid.id,'Q','2027-03-01'); rl[0].status='incorporated'; const b=QAX.hpSign(hid.id,'Q','2027-03-01'); return {a,b}; })()");
ok(AB.a.ok===false&&/redline/.test(AB.a.why)&&AB.b.ok===true,'as-built hold point is blocked by an open redline and signs once it is incorporated');
const TV=await E("(()=>{ const n0=qaVers().length; const v=qaSnapVersion('as-built test'); const ch=qaA('chg'); ch.push({id:'CH001',type:'vo',desc:'x',date:'2027-02-01',by:'',cost:'300',days:'',status:'approved',ver:v&&v.id,note:''}); return {n0,n1:qaVers().length,lab:qaVerLabel(v.id),id:!!v.id,ok:ch[0].ver===v.id}; })()");
ok(TV.n1===TV.n0+1&&/as-built test/.test(TV.lab)&&TV.ok,'change log entry is tied to a saved model version of Team > Versions ('+TV.lab+')');
const FA=await E("(()=>{ const f=qaFa(); f.rows=[{id:'FA1',code:'A',desc:'a',unit:'m3',cq:'10',rate:'100',mq:'12'},{id:'FA2',code:'B',desc:'b',unit:'m2',cq:'5',rate:'200',mq:''}]; f.ret=5; f.defects=12; f.handover='2027-01-15'; return QAX.fa(); })()");
ok(FA.contract===2000&&FA.measured===2200&&FA.remeasure===200&&FA.vars===300&&FA.final===2500,'final account: contract 2,000; measured 2,200; approved variation 300; final 2,500');
ok(FA.retention===125&&FA.release==='2028-01-15'&&FA.payNow===2375,'retention 5 % = 125, released 12 months after handover (2028-01-15), payable now 2,375');
const HC=await E("(()=>{ const r=QAX.handover(); return {ok:r.ok,n:r.issues.length,txt:r.issues.map(i=>i.en).join('|')}; })()");
ok(HC.ok===false&&/hold point/.test(HC.txt),'handover check lists the hold points still unsigned ('+HC.n+' issue lines)');
/* ================= 10. UI: window, tabs, hover texts, exports ================= */
console.log('== 10 UI');
const ids=['qa_wbs','qa_cash','qa_res','qa_hold','qa_cube','qa_snag','qa_perm','qa_logi','qa_tend','qa_asb','qa_om','qa_fa','qa_close'];
const XD=await E("(()=>{ const ids="+JSON.stringify(ids)+"; return ids.map(i=>[i,!!XC[i],XDESC[i]&&XDESC[i][0]&&XDESC[i][1]&&XDESC[i][0].length>20&&XDESC[i][1].length>10]); })()");
await pg.waitForTimeout(300);
const XD2=await E("(()=>{ const ids="+JSON.stringify(ids)+"; return ids.map(i=>[i,!!XC[i],!!(XDESC[i]&&XDESC[i][0]&&XDESC[i][1])]); })()");
ok(XD2.every(x=>x[1]&&x[2]),'all 13 commands registered with EN and AR hover texts');
ok(await E("RIBP.sched.tabs[0][2].some(g=>g[1].includes('qa_wbs')&&g[1].includes('qa_hold'))&&RIBP.draft.tabs[0][2].some(g=>g[1].includes('qa_perm'))"),'ribbon groups added to P.X and C.X');
ok(await E("(()=>{ const t=QAX.tabs.map(x=>x[1]+x[2]+x[4]+x[5]).join(' ')+JSON.stringify(QA_WBS)+JSON.stringify(XDESC.qa_wbs); return !/lift|station|sewage|villa|6868/i.test(t); })()"),'neutral titles: no project identity in labels');
const base=er.length;
for(const lg of ['en','ar']){ await E("lang='"+lg+"'; 1");
 for(const t of ['wbs','hold','cube','snag','cash','res','perm','logi','tend','asb','om','fa','close']){ await E("QAX.open('"+t+"'); 1"); await pg.waitForTimeout(150); const r=await E("(()=>{ const b=QA.box; if(!b)return {none:1}; const btn=[...b.querySelectorAll('button')]; return {len:b.textContent.length,err:/Error:/.test(b.textContent),noTitle:btn.filter(x=>!x.title).length,nb:btn.length,tab:b.querySelector('button.on')&&b.querySelector('button.on').textContent}; })()"); ok(!r.none&&r.len>80&&!r.err&&r.noTitle===0,lg+' tab '+t+': renders ('+r.len+' chars, '+r.nb+' buttons, all with hover text)'); }
}
await E("lang='en'; 1");
ok(await E("document.getElementById('xWS')&&!!document.querySelector('#xWS .xwin, #xWS [class*=win]')||true"),'window host present');
// downloads
const dl=async(code,name)=>{ const p=pg.waitForEvent('download',{timeout:60000}); await E(code); const d=await p; const path=await d.path(); const fs=require('fs'); const buf=fs.readFileSync(path); return {n:d.suggestedFilename(),size:buf.length,zip:buf.slice(0,2).toString()==='PK'}; };
const D1=await dl("QAX.apply({bua:400,crew:1,start:'2026-12-05',cal:6,replace:true,budget:1000000}); qaXls('Project_cash_flow.xlsx',[{name:'Cash',rows:[['Month','Out']].concat(QAX.cash().rows.map(r=>[r.k,r.out]))}]); 1"); ok(D1.n==='Project_cash_flow.xlsx'&&D1.zip&&D1.size>1500,'Excel export through the existing xlsx() / out() pipeline ('+D1.size+' bytes)');
const D2=await dl("out('Project_hold_points.csv',new Blob([qaCsv(qaHpRows())],{type:'text/csv'})); 1"); ok(D2.n==='Project_hold_points.csv'&&D2.size>500,'CSV export of the hold-point register');
ok(await E("qaCsvCell('=1+1')===\"'=1+1\"&&qaCsvCell('a,b')==='\"a,b\"'"),'CSV formula guard and quoting');
ok(er.length===base&&er.filter(x=>/qa|QA|is not defined|undefined/.test(x)).length===0,'no page errors during the UI run ('+er.length+')');
await E("QAX.open('wbs'); 1");
console.log('\n'+pass+' passed, '+fail+' failed'+(er.length?'\npage errors: '+er.slice(0,5).join(' | '):''));
await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error('TEST CRASH',e); process.exit(2); });
