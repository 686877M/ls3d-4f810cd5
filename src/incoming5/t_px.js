const H=require('./lbh.js');
(async()=>{ const {pg,E,ck,sum}=await H.open();
 ck('counts',true,await E("JSON.stringify({cal:lbItems(LB.libs.pxcal).length,act:lbItems(LB.libs.pxact).length,actRows:lbActD.reduce((s,t)=>s+t[4].length,0),res:lbItems(LB.libs.pxres).length,resRows:lbResD.reduce((s,t)=>s+t[4].length,0),tx:lbItems(LB.libs.txspec).length,txCats:['mat','cls','fit','vlv'].map(c=>c+':'+lbItems(LB.libs.txspec).filter(i=>i.cat===c).length).join(','),vx:lbItems(LB.libs.vxeq).length})"));
 ck('all previews',await E("['pxcal','pxact','pxres','txspec','vxeq'].every(l=>lbItems(LB.libs[l]).every(it=>lbPrev(LB.libs[l],it).includes('<svg')))"));
 // calendars
 await E("(()=>{ const {lib,it}=lbFind('pxcal','k6'); lbRun(lib,it,it.act[0][2]); })()"); ck('Ramadan calendar applied',await E("CAL.hpd===6&&CAL.work.length===6&&CAL.name.startsWith('Ramadan')"),await E("JSON.stringify(CAL)"));
 await E("(()=>{ const {lib,it}=lbFind('pxcal','k1'); lbOv(lib,it,1).f={hol:'2026-12-10,2026-12-11'}; lbRun(lib,it,it.act[0][2]); })()"); ck('5-day Sun-Thu + holidays',await E("CAL.work.join()==='0,1,2,3,4'&&CAL.hol.length===2&&CAL.hpd===8"),await E("JSON.stringify(CAL)"));
 // work-day effect: schedule end changes between 7-day and 5-day
 const end=async id=>{ await E("(()=>{ const {lib,it}=lbFind('pxcal','"+id+"'); lbRun(lib,it,it.act[0][2]); })()"); return E("Math.max(...ACT.map(a=>a.fDate||0))"); };
 const e7=await end('k5'), e5=await end('k1'); ck('7-day finishes earlier than 5-day',e7<e5,{e7,e5});
 // activity templates
 const n0=await E("ACT.length"); await E("(()=>{ const {lib,it}=lbFind('pxact','tb'); lbRun(lib,it,it.act[0][2]); })()");
 const n1=await E("ACT.length"); ck('building template inserted',n1-n0===23,{n0,n1});
 ck('WBS groups + chain',await E("ACT.filter(a=>a.src==='lb').length===23&&WBSN.LtbB3&&ACT.find(a=>a.id==='LBTB2').after[0]==='LBTB1'&&ACT.find(a=>a.id==='LBTB22').after.join()==='LBTB18,LBTB20,LBTB21'"));
 ck('computed dates exist',await E("ACT.filter(a=>a.src==='lb').every(a=>isFinite(a.s)&&isFinite(a.f)&&a.f>=a.s)"),await E("JSON.stringify(ACT.filter(a=>a.id==='LBTB23').map(a=>[a.s,a.f]))"));
 // edit duration, reinsert replaces
 await E("(()=>{ const lib=LB.libs.pxact, it=lbItems(lib).find(i=>i.id==='tb'); const o=lbOv(lib,it,1); o.rows=lbRows(lib,it); o.rows[1][2]=40; })()");
 await E("(()=>{ const {lib,it}=lbFind('pxact','tb'); lbRun(lib,it,it.act[0][2]); })()"); ck('re-insert replaces, edited duration used',await E("ACT.filter(a=>a.src==='lb').length===23&&ACT.find(a=>a.id==='LBTB2').d===40"));
 await E("(()=>{ const {lib,it}=lbFind('pxact','tc'); lbRun(lib,it,it.act[0][2]); })()"); ck('second template coexists',await E("ACT.filter(a=>a.src==='lb').length===23+16"));
 // survive save/load
 const pj=await E("projectJson()");
 await E("(()=>{ for(let i=ACT.length-1;i>=0;i--)if(ACT[i].src==='lb')ACT.splice(i,1); })()");
 await E("loadProject(projectJson())"); await pg.waitForTimeout(500); ck('activities survive save/load',await E("ACT.filter(a=>a.src==='lb').length===39"),await E("ACT.filter(a=>a.src==='lb').length"));
 await E("(()=>{ const {lib,it}=lbFind('pxact','tb'); lbRun(lib,it,it.act[1][2]); })()"); ck('remove template',await E("ACT.filter(a=>a.src==='lb').length===16"));
 // resources
 await E("(()=>{ const {lib,it}=lbFind('pxres','rl'); lbRun(lib,it,it.act[0][2]); })()"); ck('labour resources added',await E("Object.keys(DATA.p6x.res).filter(k=>k.startsWith('LB-')).length===12&&DATA.p6x.res['LB-CAR'].type==='Labor'&&DATA.p6x.res['LB-CAR'].rate===0"));
 await E("DATA.p6x.res['LB-CAR'].rate=55; (()=>{ const {lib,it}=lbFind('pxres','rl'); lbRun(lib,it,it.act[0][2]); })()"); ck('re-add keeps existing rate',await E("DATA.p6x.res['LB-CAR'].rate===55"));
 await E("(()=>{ const {lib,it}=lbFind('pxres','cc'); lbRun(lib,it,it.act[0][2]); })()"); await E("(()=>{ const {lib,it}=lbFind('pxres','ro'); lbRun(lib,it,it.act[0][2]); })()"); ck('cost accounts + roles',await E("Object.keys(DATA.p6x.cacc).length>=8&&Object.keys(DATA.p6x.roles).length>=7"));
 // T.X
 await E("(()=>{ const {lib,it}=lbFind('txspec','m_pvc'); lbRun(lib,it,it.act[0][2]); })()"); ck('PVC spec class set',await E("P2PLT.X().spec==='LB-PVC'&&P2PLT.CLS['LB-PVC'][1]===1400"));
 ck('CS table uses app indicative spec',await E("lbRows(LB.libs.txspec,lbItems(LB.libs.txspec)[0])[7][1]===168.3"));
 const c0=await E("P2PLT.X().custom.length"); await E("(()=>{ const {lib,it}=lbFind('txspec','v_gate'); lbRun(lib,it,it.act[0][2]); })()"); ck('valve added to T.X BOM',await E("P2PLT.X().custom.length")===c0+1&&await E("P2PLT.X().custom.slice(-1)[0].name"));
 ck('BOM function sees it',await E("JSON.stringify(P2PLT.bom(P2PLT.X().runs)).includes('Gate valve DN50')"));
 await E("XC.cad.run(); (()=>{ const {lib,it}=lbFind('txspec','v_gate'); lbRun(lib,it,it.act[1][2]); })()"); const q0=await E("cadD().ents.length"); await E("cadClick([10,10])"); ck('valve plan symbol placed',await E("cadD().ents.length")>q0); await E("cadEsc()");
 // V.X
 await E("(()=>{ const {lib,it}=lbFind('vxeq','fcu'); lbOv(lib,it,1).f={row:3,qty:4}; lbRun(lib,it,it.act[0][2]); })()"); ck('FCU on V.X list',await E("DUC.eqp.length===1&&DUC.eqp[0].model==='FCU-4'&&DUC.eqp[0].qty===4&&DUC.eqp[0].ph===1"),await E("JSON.stringify(DUC.eqp)"));
 await E("(()=>{ const {lib,it}=lbFind('vxeq','ahu'); lbRun(lib,it,it.act[1][2]); })()"); const r0=await E("cadD().ents.length"); await E("cadClick([500,500])"); ck('AHU symbol placed',await E("cadD().ents.length")>r0); await E("cadEsc()");
 await E("XC.lb_px.run()"); await pg.waitForTimeout(300); ck('P.X pane',await E("LB.box.px.querySelectorAll('.lbt').length")===3);
 ck('ribbon buttons present',await E("['plant','sched'].every(t=>JSON.stringify(RIBP[t].tabs).includes('lb_'))&&JSON.stringify(RIB.find(t=>t[0]==='hvac')).includes('lb_vx')"));
 await sum(); })();
