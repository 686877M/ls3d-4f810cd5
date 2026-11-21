/* templates.js - project templates + chooser + real "new project". Prefix tp. No libraries, no network.
   Insert at the END of the chain, right before `window.__lsv=`. Overrides (wrapped, originals kept): buildModel, baseItems,
   renderSteps, drawSheetPrev, projectJson, loadProject, xaHandle, XC.new.run, HXM 'new' card; adds XC.new_from_template,
   TOXAPI.templates/newProject (and re-freezes window.TOX). See templates.md. */
const tpSnap=o=>{ try{ return structuredClone(o); }catch(e){ return JSON.parse(JSON.stringify(o)); } };
/* originals, taken once at load: what "sewage" means (the schedule and sheet defaults of the lift station) */
const tpS={ act:tpSnap(ACT.filter(a=>a.src!=='rx')), wbs:tpSnap(WBSN), cal:tpSnap(CAL), ps:tpSnap(PS), sh:tpSnap(SH), dr:tpSnap(DR) };
let tpBase='sewage';                                   /* which base ACT/WBSN holds now: 'sewage' | 'blank' */
const tpHas=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const tpId=()=>(DATA&&DATA.tpl)||'sewage';             /* the project flag; old files without it are the station */
const tpStation=()=>tpId()==='sewage';
const tpNm=(o,l)=>o[l==='ar'?1:0];
const tpRid=()=>typeof rvId==='function'?rvId():Math.random().toString(36).slice(2,9);
const tpEmptyRv=()=>({levels:[{n:'Level 1',z:0},{n:'Level 2',z:3}],grids:[],els:[],def:tpSnap(RV.def)});
const tpEmptyGm=()=>({layers:[{id:'L1',n:'Drawing',vis:1,op:1,feat:[]}],cur:0});

/* ---------- starters, built straight into the R.X data model ---------- */
function tpRvBuild(levels,fill){
  const els=[], mk=(k,lv,o)=>{ const e=Object.assign({id:tpRid(),k,lv,src:'tpl'},o); els.push(e); return e; };
  const wall=(lv,a,b,t,h)=>mk('wall',lv,{a,b,h:h||3,t}), grids=[];
  const grid=(hz,n,v,x0,x1)=>grids.push({id:tpRid(),a:hz?[x0,v]:[v,x0],b:hz?[x1,v]:[v,x1],hz,n});
  fill({mk,wall,grid,els}); return {levels,grids,els,def:tpSnap(RV.def)};
}
function tpHouse2(){
  return tpRvBuild([{n:'Ground floor',z:0},{n:'First floor',z:3},{n:'Roof',z:6}],({mk,wall,grid})=>{
    grid(true,'A',0,-1,13); grid(true,'B',10,-1,13); grid(false,'1',0,-1,11); grid(false,'2',12,-1,11);
    const rooms=[[['Living',[0,0],[7,6]],['Kitchen',[7,0],[12,6]],['Entry and stair',[0,6],[4,10]],['Guest room',[4,6],[8,10]],['WC',[8,6],[12,10]]],
                 [['Master bedroom',[0,0],[7,6]],['Bedroom 2',[7,0],[12,6]],['Landing',[0,6],[4,10]],['Bedroom 3',[4,6],[8,10]],['Bath',[8,6],[12,10]]]];
    [0,1].forEach(lv=>{
      mk('floor',lv,{a:[0,0],b:[12,10],t:.2});
      const S=wall(lv,[0,0],[12,0],.25), E=wall(lv,[12,0],[12,10],.25), N=wall(lv,[12,10],[0,10],.25), W=wall(lv,[0,10],[0,0],.25);
      const I1=wall(lv,[0,6],[12,6],.12), I2=wall(lv,[7,0],[7,6],.12); wall(lv,[4,6],[4,10],.12); wall(lv,[8,6],[8,10],.12);
      rooms[lv].forEach(r=>mk('room',lv,{a:r[1],b:r[2],n:r[0]}));
      if(lv===0)mk('door',0,{w:S.id,p:3.5,W:1,H:2.1});
      mk('door',lv,{w:I1.id,p:2,W:.9,H:2.1}); mk('door',lv,{w:I1.id,p:6,W:.9,H:2.1}); mk('door',lv,{w:I1.id,p:10,W:.9,H:2.1}); mk('door',lv,{w:I2.id,p:3,W:.9,H:2.1});
      [[S,9.5],[E,3],[E,8],[N,2],[N,6],[N,10],[W,3],[W,8]].forEach(x=>mk('window',lv,{w:x[0].id,p:x[1],W:1.2,H:1.2,sill:.9}));
    });
    mk('stair',0,{a:[.8,6.2],b:[.8,9.8],w:1,maxR:.175,H:3});
    mk('roof',1,{a:[0,0],b:[12,10],base:3,slope:25,over:.4,t:.2});
  });
}
function tpOffice3(){
  return tpRvBuild([{n:'Level 1',z:0},{n:'Level 2',z:3.6},{n:'Level 3',z:7.2},{n:'Roof',z:10.8}],({mk,wall,grid})=>{
    [0,6,12,18,24].forEach((x,i)=>grid(false,String(i+1),x,-1,13)); [0,6,12].forEach((z,i)=>grid(true,String.fromCharCode(65+i),z,-1,25));
    [0,1,2].forEach(lv=>{
      mk('floor',lv,{a:[0,0],b:[24,12],t:.25});
      for(let x=0;x<=24;x+=6)for(let z=0;z<=12;z+=6)mk('col',lv,{p:[x,z],w:.4,d:.4,h:3.6});
      const S=wall(lv,[0,0],[24,0],.25,3.6), N=wall(lv,[24,12],[0,12],.25,3.6); wall(lv,[24,0],[24,12],.25,3.6); wall(lv,[0,12],[0,0],.25,3.6);
      const C=wall(lv,[9,3],[15,3],.2,3.6); wall(lv,[15,3],[15,9],.2,3.6); wall(lv,[15,9],[9,9],.2,3.6); wall(lv,[9,9],[9,3],.2,3.6);
      mk('door',lv,{w:C.id,p:3,W:1,H:2.1}); mk('room',lv,{a:[9,3],b:[15,9],n:'Core'});
      [3,9,15,21].forEach(p=>{ mk('window',lv,{w:S.id,p,W:2,H:1.5,sill:.9}); mk('window',lv,{w:N.id,p,W:2,H:1.5,sill:.9}); });
      if(lv<2)mk('stair',lv,{a:[9.6,3.4],b:[9.6,8.6],w:1.2,maxR:.175,H:3.6});
    });
  });
}
const TEMPLATES={
  blank:{id:'blank',base:'blank',n:['Blank project','مشروع فاضي'],title:['Untitled project','مشروع بدون اسم'],d:['Nothing in it: empty 3D ground, no model, schedule or drawings.','مفيش فيه حاجة: أرضية فاضية بدون موديل أو جدول أو رسومات.']},
  sewage:{id:'sewage',base:'sewage',n:['Sewage lift station','محطة رفع صرف'],title:['Sewage Lift Station','Sewage Lift Station'],d:['The parametric lift station: 3D model, BOM, steps, sheet and schedule.','المحطة الباراميترية: موديل ومقايسة وخطوات ولوحة وجدول.']},
  house2:{id:'house2',base:'blank',n:['Two-floor villa','فيلا دورين'],title:['Two-floor villa','فيلا دورين'],rv:tpHouse2,d:['12 x 10 m, 5 rooms per floor, stair and roof (R.X elements).','١٢ × ١٠ م، ٥ غرف في الدور، سلم وسقف (عناصر R.X).']},
  office3:{id:'office3',base:'blank',n:['Three-storey office block','مبنى مكاتب ٣ أدوار'],title:['Three-storey office block','مبنى مكاتب ٣ أدوار'],rv:tpOffice3,d:['24 x 12 m, 6 x 6 m column grid, central core with stair.','٢٤ × ١٢ م، شبكة أعمدة ٦ × ٦ م، نواة وسلم.']}
};

/* ---------- empty 3D scene, empty BOM / steps / sheet when the project is not the station ---------- */
function tpEmptyScene(){
  const keep=[water,levelsG,labelsG,groundG], dis=o=>o.traverse(q=>{ if(q.geometry)q.geometry.dispose(); if(q.material&&q.material.map)q.material.map.dispose(); });
  root.children.slice().forEach(c=>{ if(keep.indexOf(c)<0){ dis(c); root.remove(c); } });
  keep.forEach(g=>{ while(g.children.length){ const c=g.children[0]; dis(c); g.remove(c); } });
  parts={}; if(G)G.GY=0;                               /* R.X levels sit on G.GY, so the ground is y = 0 */
  const gr=new T.GridHelper(60,60,0x888888,0x888888); gr.material.transparent=true; gr.material.opacity=.22; groundG.add(gr);
  try{ SP.on=false; SP.master=false; spG.visible=false; }catch(e){}   /* the site-plan overlay is sample content */
  TRIS=null; trisVer++; try{ applyFlags(); applyAnim(true); }catch(e){}
}
const tpBM=buildModel; buildModel=function(){ tpBM.apply(this,arguments); if(!tpStation())tpEmptyScene(); };
const tpSC=setCap; setCap=function(){ if(tpStation())return tpSC.apply(this,arguments); cap.textContent=''; };   /* the camera-view caption describes the station */
const tpNR=notesReg; notesReg=function(){ return tpStation()?tpNR.apply(this,arguments):[]; };   /* notes register: pump capacity conflict, assumptions and limits are the sample's */
const tpBI=baseItems; baseItems=function(){ return tpStation()?tpBI.apply(this,arguments):[]; };
const tpRS=renderSteps; renderSteps=function(){ if(tpStation())return tpRS.apply(this,arguments); stepsBox.innerHTML=''; stepB=[]; };
const tpDS=drawSheetPrev; drawSheetPrev=function(){ if(tpStation())return tpDS.apply(this,arguments); clearTimeout(shTimer); shTimer=setTimeout(()=>{ if(curTab==='sheet')shPrev.textContent=b2('No lift-station sheet in this project.','مفيش لوحة محطة رفع في المشروع ده.'); },150); };

/* ---------- schedule base: the station keeps its activities, every other project starts with the start milestone only ---------- */
function tpSetBase(kind){
  ACT.length=0; Object.keys(WBSN).forEach(k=>delete WBSN[k]);
  if(kind==='sewage'){ tpSnap(tpS.act).forEach(a=>ACT.push(a)); Object.assign(WBSN,tpSnap(tpS.wbs)); Object.assign(CAL,tpSnap(tpS.cal)); }
  else { const m=tpSnap(tpS.act.find(a=>a.id==='M0')||tpS.act[0]); ACT.push(m); WBSN[m.wbs]=['Project','المشروع']; }
  Object.assign(PS,tpSnap(tpS.ps),{sel:null,collapsed:{}}); tpBase=kind;
  try{ buildSite(); }catch(e){}
}

/* ---------- panes that only describe the pump-station sample (camera views, parameters, parts, assembly animation, lift-station rebar, sample site plan, hazard register, section presets, sheet composer) ---------- */
const TP_GATED=['views','edit','parts','anim','rebar','site','safety','sec','sheet'];
{ const st=document.createElement('style'); st.textContent='.tpOff>*:not(.tpNote){display:none!important}'; document.head.appendChild(st); }
function tpGate(){ const on=tpStation(); TP_GATED.forEach(k=>{ const p=document.getElementById('p-'+k); if(!p)return; p.classList.toggle('tpOff',!on); let n=null; for(const c of p.children)if(c.classList&&c.classList.contains('tpNote'))n=c;
  if(!on&&!n){ n=document.createElement('div'); n.className='tpNote small'; n.style.padding='14px'; p.insertBefore(n,p.firstChild); } if(n){ n.textContent=b2('This panel belongs to the pump-station sample. Load it from New project > Pump station sample (mechanical).','اللوحة دي خاصة بعيّنة محطة الطلمبات. حمّلها من مشروع جديد > عيّنة محطة طلمبات (ميكانيكا).'); n.style.display=on?'none':''; } }); if(on&&!tpGate.u){ tpGate.u=1; return; } tpGate.u=1; /* boot as the sample: touch nothing */ try{ setCap(); }catch(e){} try{ geoPanel(); }catch(e){} }
/* ---------- save / load: template id rides in DATA.tpl; the stores that live outside DATA ride in "tp" ---------- */
function tpBlob(){ return { id:tpId(), rv:{levels:RV.levels,grids:RV.grids,els:RV.els,def:RV.def}, gm:{layers:GM.layers,cur:GM.cur}, is:{list:IS.list,sel:IS.sel}, mm:{mt:MM.mt,sel:MM.sel}, rx:ACT.filter(a=>a.src==='rx') }; }
const tpPJ=projectJson; projectJson=function(){ const j=tpPJ.apply(this,arguments), i=j.lastIndexOf('}'); return j.slice(0,i)+',"tp":'+JSON.stringify(tpBlob())+'\n}'; };
function tpApply(tp){
  const kind=tpStation()?'sewage':'blank';
  if(kind!==tpBase)tpSetBase(kind);
  tpGate();
  if(!tp)return;                                       /* an old file: leave the other stores as they are */
  ACT.splice(0,ACT.length,...ACT.filter(a=>a.src!=='rx')); (tp.rx||[]).forEach(a=>ACT.push(a)); if(tp.rx&&tp.rx.length&&!WBSN['5'])WBSN['5']=['R.X building','مبنى R.X'];
  if(tp.rv){ RV.levels=tp.rv.levels; RV.grids=tp.rv.grids||[]; RV.els=tp.rv.els||[]; Object.assign(RV.def,tp.rv.def||{}); RV.sel=null; RV.pts=[]; RV.lv=Math.min(RV.lv,RV.levels.length-1); RV.hist=[]; }
  if(tp.gm){ GM.layers=tp.gm.layers; GM.cur=Math.min(tp.gm.cur||0,GM.layers.length-1); GM.sel=null; }
  if(tp.is){ IS.list=tp.is.list||[]; IS.sel=tp.is.sel||null; }
  if(tp.mm){ MM.mt=tp.mm.mt||[]; MM.sel=tp.mm.sel||null; }
  const run=f=>{ try{ f(); }catch(e){} };
  run(()=>{ rvSave(); rvBuild(); rvBrowser(); rvProps(); }); run(gmSave); run(()=>gmPaint()); run(isSave); run(()=>isRender()); run(mmSave); run(()=>mmRerender());
  run(xfSaveRx); run(()=>{ CS.sel.clear(); }); run(svBuild); run(()=>{ xBar(true); });
}
const tpLP=loadProject; loadProject=function(t){ tpLP.apply(this,arguments); let j=null; try{ j=JSON.parse(t); }catch(e){} tpApply(j&&j.tp); };
/* every R.X / GIS / issues / MOM change is one toolbar-undo entry (CAD + schedule already do it: cadCommit and p6Save call persist -> hiSnap) */
[['rvChanged'],['gmSave'],['isSave'],['mmSave']].forEach(([n])=>{ const f=eval(n); if(typeof f!=='function')return; const w=function(){ const r=f.apply(this,arguments); try{ hiSnap(); }catch(e){} return r; }; eval(n+'=w'); });

const tpCleanSh=sh=>{ Object.keys(sh).forEach(k=>{ if(Array.isArray(sh[k])&&/notes|legend|callouts/.test(k))sh[k]=[]; else if(typeof sh[k]==='string'&&k==='notes')sh[k]=''; }); return sh; };
/* boot: the page constants still hold the sample's title and sheet text, so a clean project must not show them */
if(!tpStation()){ const T0=TEMPLATES[tpId()]||TEMPLATES.blank; DR.title=T0.title[0]; tpCleanSh(SH); }
/* ---------- create a project from a template ---------- */
function tpNew(id,o){
  o=o||{}; if(typeof id!=='string'||!tpHas(TEMPLATES,id))throw new Error('unknown template '+id);
  if(typeof TM!=='undefined'&&TM.me&&TM.me.role==='viewer')throw new Error('viewer role cannot start a project');
  const T0=TEMPLATES[id], title=T0.title[0];
  hiSnap(); const old=projectJson();                   /* the project we leave stays in the undo history ... */
  try{ localStorage.setItem('lsv3-prev',old); }catch(e){}   /* ... and in the same slot the Open command uses */
  if(o.download)out('LiftStation_previous_project.json',old);
  const j=JSON.parse(old), today=new Date().toISOString().slice(0,10), st=T0.base==='sewage';
  const sh=tpSnap(tpS.sh); if(!st)tpCleanSh(sh);
  j.P=Object.assign({},P0); j.SH=sh; j.DR=Object.assign({},tpS.dr,{title}); Object.keys(DR).forEach(k=>{ if(!tpHas(tpS.dr,k))delete DR[k]; });
  j.data={items:{},fams:{},cur:'SAR',tpl:id,proj:{name:j.DR.title,no:'',client:'',loc:'',rev:'A',date:today,notes:''}};
  j.tp={id,rv:T0.rv?T0.rv():tpEmptyRv(),gm:tpEmptyGm(),is:{list:[],sel:null},mm:{mt:[],sel:null},rx:[]};
  tpSetBase(st?'sewage':'blank');                      /* before hiApply, so restoreSched sees the right activities */
  hiApply(JSON.stringify(j)); persist();
  try{ if(st)go(views[0]); }catch(e){}
  [rvBuild,()=>xBar(true),hxPanel,startPanel,xSync].forEach(f=>{ try{ f(); }catch(e){} });
  xSt(b2('New project: ','مشروع جديد: ')+j.DR.title);
  return {id,title:j.DR.title,template:id};
}

/* ---------- chooser dialog ---------- */
function tpChooser(){
  const old=document.getElementById('tpDlg'); if(old)old.remove(); const L=lang==='ar'?'ar':'en';
  const ov=el('div',{id:'tpDlg',style:'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center'}), close=()=>ov.remove();
  const box=el('div',{style:'background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:16px;width:min(720px,94vw);max-height:88vh;overflow:auto'});
  const dl=el('input',{type:'checkbox',id:'tpDl'}); dl.checked=false;   /* owner: New must not download a file unless asked (the previous project stays in undo + 'lsv3-prev') */
  const pick=id=>{ const dn=dl.checked; close(); try{ tpNew(id,{download:dn}); }catch(e){ xSt(String(e.message||e)); } };
  box.append(el('b',{text:b2('New project','مشروع جديد'),style:'font-size:16px'}),el('div',{class:'small',text:b2('Your current project stays in the undo history. Pick a starting point:','مشروعك الحالي هيفضل في سجل التراجع. اختار نقطة البداية:')}));
  const grid=el('div',{style:'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:12px 0'});
  Object.keys(TEMPLATES).forEach(id=>{ const t=TEMPLATES[id]; grid.append(el('button',{'data-tpl':id,style:'text-align:start;padding:10px;display:block;white-space:normal',onclick:()=>pick(id)},el('b',{text:tpNm(t.n,L)}),el('div',{class:'small',text:tpNm(t.d,L)}))); });
  box.append(grid,el('label',{class:'small',style:'display:flex;gap:6px;align-items:center;margin-bottom:10px'},dl,el('span',{text:b2('Download the current project first (recommended)','نزّل المشروع الحالي الأول (مفضّل)')})),
    el('div',{class:'row'},el('button',{class:'on','data-tpl':'blank-btn',text:b2('Blank project','مشروع فاضي'),onclick:()=>pick('blank')}),el('button',{text:b2('Cancel','إلغاء'),onclick:close})));
  ov.append(box); ov.onclick=e=>{ if(e.target===ov)close(); }; document.body.appendChild(ov);
}

/* ---------- wiring: New command, hub card, agent, API ---------- */
XC.new.run=tpChooser;
XCMD('new_from_template','new','New from template','مشروع من قالب',function(id){ if(typeof id==='string')return tpNew(id); tpChooser(); });
if(typeof XDESC!=='undefined')XDESC.new_from_template=['Start a new project from a template (blank, lift station, villa, office); the current project stays in undo','ابدأ مشروع جديد من قالب (فاضي، محطة رفع، فيلا، مكتب)؛ المشروع الحالي يفضل في التراجع'];
{ const h=HXM.find(x=>x[0]==='new'); if(h){ h[3]='Pick a template or a blank project, then describe what to add; agents build it with the real tools.'; h[4]='اختار قالب أو مشروع فاضي، وبعدين وصّف المطلوب والوكلاء يبنوه بالأدوات الحقيقية.'; h[5]=()=>XC.new_from_template.run(); try{ hxPanel(); }catch(e){} } }
const tpXH=xaHandle; xaHandle=function(t){ try{ const s=norm(t); if(tpStation()&&(/^(مشروع جديد|new project)/.test(s)||/(ابني|ابنى|اعمل|انشئ|عاوز|عايز|create|build|make).*(فيلا|بيت|منزل|مبني|مبنى|شقه|house|villa|flat|building|office|مكتب)/.test(s)))tpNew('blank'); }catch(e){} return tpXH.apply(this,arguments); };
TOXAPI.templates=()=>Object.keys(TEMPLATES).map(id=>({id,name:TEMPLATES[id].n[0],ar:TEMPLATES[id].n[1],description:TEMPLATES[id].d[0],base:TEMPLATES[id].base,current:id===tpId()}));
/* hook for other chunks (apartment-building demo, RC skeleton ...): tpRegister({id,n:[en,ar],title:[en,ar],d:[en,ar],rv:()=>({levels,grids,els,def}) , base:'blank'}) adds a chooser card.
   base 'blank' = empty scene + start-milestone schedule + R.X data from rv(); only the id 'sewage' (base 'sewage') brings the pump-station sample back. */
function tpRegister(def){ if(!def||typeof def.id!=='string'||!/^[a-z0-9_]+$/.test(def.id)||tpHas(TEMPLATES,def.id)&&def.id==='sewage'||!Array.isArray(def.n)||!Array.isArray(def.title)||!Array.isArray(def.d))throw new Error('bad template definition'); def.base='blank'; TEMPLATES[def.id]=def; return def.id; }
TOXAPI.registerTemplate=tpRegister;
TOXAPI.newProject=id=>tpNew(id===undefined?'blank':id);
window.TOX=Object.freeze(Object.assign({version:'1'},TOXAPI));
/* page reload on a non-station project: persist() kept DATA.tpl, the constants above still hold the station, so swap now */
tpGate();
setTimeout(()=>{ try{ if(!tpStation()){ tpSetBase('blank'); try{ restoreSched(); }catch(e){} rebuild(); computeSched(); renderSched(); } }catch(e){ console.error('tp boot',e); } },0);
