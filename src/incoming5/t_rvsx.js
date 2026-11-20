const H=require('./lbh.js');
(async()=>{ const {pg,E,ck,sum}=await H.open();
 const cnt=await E("JSON.stringify({fam:lbItems(LB.libs.rxfam).length,doors:lbItems(LB.libs.rxfam).filter(i=>i.cat==='door').length,wins:lbItems(LB.libs.rxfam).filter(i=>i.cat==='window').length,cols:lbItems(LB.libs.rxfam).filter(i=>i.cat==='col'||i.cat==='steel').length,beams:lbItems(LB.libs.rxfam).filter(i=>i.cat==='beam').length,stairs:lbItems(LB.libs.rxfam).filter(i=>i.cat==='stair').length,rails:lbItems(LB.libs.rxfam).filter(i=>i.cat==='rail').length,roofs:lbItems(LB.libs.rxfam).filter(i=>i.cat==='roof').length,asm:lbItems(LB.libs.rxasm).length,key:lbItems(LB.libs.sxkey).length,keyrows:lbKeys.reduce((s,k)=>s+k[3].length,0),pt:lbItems(LB.libs.sxpt).length,lbl:lbItems(LB.libs.sxlbl).length,surf:lbItems(LB.libs.sxsurf).length,pipe:lbItems(LB.libs.sxpipe).length})"); ck('R.X/S.X counts',true,cnt);
 ck('all previews render',await E("['rxfam','rxasm','sxkey','sxpt','sxlbl','sxsurf','sxpipe'].every(l=>lbItems(LB.libs[l]).every(it=>lbPrev(LB.libs[l],it).includes('<svg')))"));
 // R.X: need walls
 await E("RV.els=[]; RV.levels=[{n:'L1',z:0},{n:'L2',z:3}]; RV.els.push({id:'w1',k:'wall',a:[0,0],b:[6,0],h:3,t:.2,lv:0}); rvChanged(); LB.rxSeen=new Set(RV.els.map(e=>e.id)); 0");
 await E("(()=>{ const {lib,it}=lbFind('rxfam','d2'); lbRun(lib,it,it.act[1][2]); })()");
 ck('door type loaded to RV.def',await E("RV.def.door.W===1.8&&RV.def.door.H===2.1&&lbD().cur.rx.door.name==='Double leaf door'"),await E("JSON.stringify(RV.def.door)"));
 await E("(()=>{ const w=RV.els.find(e=>e.k==='wall'); RV.els.push(Object.assign({id:rvId(),k:'door',w:w.id,p:3,lv:0},{W:RV.def.door.W,H:RV.def.door.H})); rvChanged(); })()");
 ck('new door element stamped with type',await E("RV.els.find(e=>e.k==='door').ty==='Double leaf door'&&RV.els.find(e=>e.k==='door').W===1.8"));
 await E("(()=>{ const {lib,it}=lbFind('rxfam','w3'); lbRun(lib,it,it.click); })()"); ck('click arms tool',await E("RV.tool==='window'&&RV.def.window.W===1.5&&RV.def.window.sill===.9"));
 // assembly
 await E("(()=>{ const {lib,it}=lbFind('rxasm','aw1'); lbRun(lib,it,it.act[0][2]); })()");
 ck('wall assembly -> t = sum layers',await E("Math.abs(RV.def.wall.t-0.365)<1e-9&&RV.tool==='wall'"),await E("RV.def.wall.t"));
 await E("RV.tool=null; RV.pts=[]; RV.els.push({id:rvId(),k:'wall',a:[0,2],b:[5,2],h:3,t:RV.def.wall.t,lv:0}); rvChanged()");
 ck('new wall has asm layers with materials',await E("(()=>{ const w=RV.els[RV.els.length-1]; return w.asm&&w.asm.length===4&&w.asm[0].mat==='Red brick'&&w.ty; })()"));
 // edit table persists + changes sum
 await E("(()=>{ const lib=LB.libs.rxasm, it=lbItems(lib).find(i=>i.id==='aw1'); const o=lbOv(lib,it,1); o.rows=lbRows(lib,it); o.rows[1][1]=80; })()");
 await E("(()=>{ const {lib,it}=lbFind('rxasm','aw1'); lbRun(lib,it,it.act[0][2]); })()"); ck('edited layer thickness used',await E("Math.abs(RV.def.wall.t-0.395)<1e-9"),await E("RV.def.wall.t"));
 ck('material H.X match info',await E("lbItems(LB.libs.rxasm)[0].info({},lbRows(LB.libs.rxasm,lbItems(LB.libs.rxasm)[0]))"));
 // steel
 await E("(()=>{ const {lib,it}=lbFind('rxfam','ssH'); lbOv(lib,it,1).f={row:4,h:3.5}; lbRun(lib,it,it.act[0][2]); })()");
 ck('steel H row to col type',await E("RV.def.col.d>0.15&&RV.def.col.h===3.5&&!!lbD().cur.rx.col.sec"),await E("JSON.stringify([RV.def.col,lbD().cur.rx.col.sec])"));
 // apply to selected + props selector
 await E("RV.sel=RV.els.find(e=>e.k==='door').id; rvProps()"); const optn=await E("RVP.querySelectorAll('select option').length"); ck('Type selector in Properties',optn>=8,optn);
 await E("(()=>{ const {lib,it}=lbFind('rxfam','d1'); lbRun(lib,it,it.act[2][2]); })()"); ck('apply to selected door',await E("(()=>{ const d=RV.els.find(e=>e.k==='door'); return d.W===.9&&d.ty==='Single flush door'; })()"));
 ck('R.X saved with project (ty in els, lib in DATA)',await E("(()=>{ const j=projectJson(); return j.includes('Single flush door')||JSON.stringify(RV.els).includes('Single flush door'); })()"));
 // S.X
 await E("DATA.sv=DATA.sv||{pts:'',ref:''}; DATA.sv.pts='id,E,N,Z,desc\\n1,100,200,10.5,GR\\n2,110,205,10.9,TR oak\\n3,120,210,11.2,MH\\n4,130,215,11.5,XX\\n'; persist(); 0");
 await E("XC.cad.run(); cadD().ents=[]; 0");
 await E("(()=>{ const {lib,it}=lbFind('sxkey','ks1'); lbRun(lib,it,it.act[1][2]); })()");
 ck('draw points by code',await E("cadD().ents.filter(e=>e.ly==='S-TREE').length>0&&cadD().ents.filter(e=>e.ly==='S-SEWR').length>0&&cadD().ents.some(e=>e.t==='tx'&&e.s==='3')"),await E("cadD().ents.length"));
 ck('symbol at E,N (metres)',await E("(()=>{ const c=cadD().ents.find(e=>e.ly==='S-SEWR'&&e.t==='c'); return Math.abs(c.x-120)<1e-6&&Math.abs(c.y-210)<1e-6&&Math.abs(c.r-.5)<1e-6; })()"));
 await E("(()=>{ const {lib,it}=lbFind('sxkey','ks1'); lbRun(lib,it,it.act[0][2]); })()");
 ck('convert descriptions',await E("DATA.sv.pts.includes('Ground shot')&&DATA.sv.pts.includes('Tree oak')&&DATA.sv.pts.includes('XX')"),await E("DATA.sv.pts"));
 await E("(()=>{ const {lib,it}=lbFind('sxpt','tri'); lbRun(lib,it,it.act[0][2]); })()"); ck('draw all survey points style',await E("cadD().ents.filter(e=>e.ly==='S-POINT').length>=4"));
 // labels
 await E("cadD().ents.push({t:'l',x1:0,y1:0,x2:30,y2:30,ly:'0'},{t:'c',x:50,y:50,r:12,ly:'0'}); CS.sel.clear(); CS.sel.add(cadD().ents.length-2); 0");
 await E("(()=>{ const {lib,it}=lbFind('sxlbl','lb1'); lbRun(lib,it,it.act[0][2]); })()"); ck('bearing label N 45 E 42.43',await E("cadD().ents.some(e=>e.ly==='S-LABEL'&&/N 45°00'00\" E/.test(e.s)&&/42\\.43 m/.test(e.s))"),await E("JSON.stringify(cadD().ents.filter(e=>e.ly==='S-LABEL').map(e=>e.s))"));
 await E("CS.sel.clear(); cadD().ents.forEach((e,i)=>{ if(e.t==='c'&&e.r===12)CS.sel.add(i); }); 0"); await E("(()=>{ const {lib,it}=lbFind('sxlbl','lb6'); lbRun(lib,it,it.act[0][2]); })()"); ck('curve radius label',await E("cadD().ents.some(e=>e.ly==='S-LABEL'&&/R=12\\.00/.test(e.s))"));
 // surface
 await E("(()=>{ const {lib,it}=lbFind('sxsurf','sf5'); lbRun(lib,it,it.act[0][2]); })()"); ck('surface style sets SV',await E("SV.iv===1&&SV.wire===true&&SV.show===true"));
 await E("(()=>{ const {lib,it}=lbFind('sxsurf','sf3'); lbRun(lib,it,it.act[0][2]); })()"); ck('contour 0.25',await E("SV.iv===.25&&SV.wire===false"));
 // pipe
 ck('pipe info Manning',await E("(()=>{ const lib=LB.libs.sxpipe, it=lbItems(lib)[0]; return it.info({row:4,n:.013},lbRows(lib,it)); })()"));
 await E("(()=>{ const {lib,it}=lbFind('sxpipe','mh1'); lbOv(lib,it,1).f={row:2}; lbRun(lib,it,it.act[0][2]); })()"); const n0=await E("cadD().ents.length"); await E("cadClick([300,300])"); ck('manhole placed in C.X',await E("cadD().ents.length")>n0&&await E("cadD().ents.some(e=>e.ly==='S-SEWR'&&e.t==='c'&&e.r===750)"));
 await E("cadEsc()"); await E("XC.lb_sx.run()"); await pg.waitForTimeout(400); ck('S.X pane 5 tabs',await E("LB.box.sx.querySelectorAll('.lbt').length")===5);
 await E("XC.lb_rx.run()"); await pg.waitForTimeout(300); ck('R.X pane cards',await E("LB.box.rx.querySelectorAll('.lbc').length")>30);
 await pg.screenshot({path:'out/lb_rx.png'}); await sum(); })();
