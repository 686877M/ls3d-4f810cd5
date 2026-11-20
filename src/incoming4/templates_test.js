/* usage: NODE_PATH=<SP>/pw/node_modules node templates_test.js <built index.html> [templates.js]
   Injects templates.js before `window.__lsv=` into a temp copy, then compares it with the untouched page. Chrome with swiftshader. */
const {chromium}=require('playwright-core'), fs=require('fs'), path=require('path'), os=require('os');
const base=path.resolve(process.argv[2]), chunk=path.resolve(process.argv[3]||path.join(__dirname,'templates.js'));
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const html=fs.readFileSync(base,'utf8'), at=html.lastIndexOf('window.__lsv={'); if(at<0)throw new Error('no window.__lsv= marker');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'tpl-')), pTpl=path.join(tmp,'index_tpl.html');
fs.writeFileSync(pTpl,html.slice(0,at)+'\n'+fs.readFileSync(chunk,'utf8')+'\n'+html.slice(at));
let pass=0,fail=0; const ok=(c,m,x)=>{ if(c){pass++;console.log('  ok   '+m);} else {fail++;console.log('  FAIL '+m+(x!==undefined?'  -> '+JSON.stringify(x):''));} };
async function open(b,file,keep){
  const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true});
  await ctx.addInitScript(()=>{ sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); });
  const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.errs=er;
  await pg.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:120000}); await pg.waitForTimeout(6000); return pg;
}
const E=(pg,s)=>pg.evaluate(s=>__lsv.ev(s),s);
const SNAP="(()=>{ let m=0; root.traverse(o=>{ if(o.isMesh)m++; }); const it=getItems(); return {meshes:m,parts:Object.keys(parts).length,items:it.length,total:+it.reduce((a,x)=>a+x.total,0).toFixed(4),qty:+it.reduce((a,x)=>a+x.qty,0).toFixed(4),bomRows:bomBox.querySelectorAll('tbody tr').length,steps:stepsBox.children.length,act:ACT.length,title:DR.title}; })()";
const RX="(()=>{ const c={}; RV.els.forEach(e=>c[e.k]=(c[e.k]||0)+1); const o={}; Object.keys(c).sort().forEach(k=>o[k]=c[k]); return {c:o,levels:RV.levels.length,grids:RV.grids.length}; })()";
const srt=o=>JSON.stringify({c:Object.fromEntries(Object.entries(o.c).sort()),levels:o.levels,grids:o.grids});
(async()=>{
  const b=await chromium.launch({executablePath:CHROME,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  console.log('== baseline page (no chunk)'); const g0=await open(b,base); const B=await E(g0,SNAP); console.log('  baseline',JSON.stringify(B));
  ok(B.items>0&&B.parts>0&&B.act>1,'baseline is the lift station',B); const CODES=await E(g0,"getItems().map(x=>x.code)"); const baseErr=g0.errs.slice();
  console.log('== page with templates.js'); const pg=await open(b,pTpl); await pg.evaluate(c=>{ window.__codes=c; },CODES);
  ok(JSON.stringify(await E(pg,SNAP))===JSON.stringify(B),'chunk loaded: station untouched (BOM, parts, steps, ACT same as baseline)',await E(pg,SNAP));
  const list=await E(pg,"TOX.templates()"); ok(['blank','sewage','house2','office3'].every(i=>list.some(t=>t.id===i)),'TOX.templates() lists 4 templates',list.map(t=>t.id));
  ok(await E(pg,"typeof TOX.newProject==='function'&&typeof XC.new_from_template.run==='function'"),'TOX.newProject and XC.new_from_template exist');
  /* dirty every project store, then go blank */
  await E(pg,"RV.els.push({id:'tpX1',k:'wall',a:[0,0],b:[3,0],h:3,t:.2,lv:0}); rvSave(); GM.layers[0].feat.push({t:'pt',p:[31,30]}); gmSave(); IS.list.push({id:'i1',t:'issue'}); isSave(); MM.mt.push({id:'m1'}); mmSave(); cadD().ents.push({t:'line',a:[0,0],b:[5,5],l:'0'}); DATA.sv.pts+='1,0,0,0,a\\n2,5,0,1,b\\n3,0,5,1,c\\n'; ACT.push(Object.assign({},ACT[1],{id:'RX9',src:'rx',wbs:'5'})); persist();");
  const D=await E(pg,SNAP); console.log('== blank');
  const r=await E(pg,"TOX.newProject('blank')"); await pg.waitForTimeout(800); const S=await E(pg,SNAP);
  ok(r.id==='blank','newProject returns',r); ok(S.meshes===0&&S.parts===0,'zero station meshes in the 3D scene',S); ok(S.items===0&&S.bomRows===1&&S.qty===0,'empty BOM (table has only its total row; baseline has 46 items + total row)',S); ok(S.steps===0,'no steps',S);
  ok(S.act===1,'schedule holds only the start milestone',S.act); ok(S.title==='Untitled project'&&await E(pg,"dcProjName()")==='Untitled project','DR.title and project name = Untitled project');
  ok((await E(pg,"xTitle()")).startsWith('Untitled project')&&(await pg.evaluate(()=>document.body.innerText)).includes('Untitled project'),'top bar shows the name'); ok((await pg.evaluate(()=>{ const h=document.querySelector('.xdash h1'); return h?h.textContent:null; }))==='Untitled project','Start page heading shows the name');
  const z=await E(pg,"({rv:RV.els.length,gm:GM.layers.length+':'+GM.layers[0].feat.length,is:IS.list.length,mm:MM.mt.length,cad:DATA.cad?DATA.cad.ents.length:0,sv:DATA.sv?DATA.sv.pts:'',rx:ACT.filter(a=>a.src==='rx').length,gridKids:groundG.children.length,tpl:DATA.tpl})");
  ok(z.rv===0&&z.gm==='1:0'&&z.is===0&&z.mm===0&&z.cad===0&&z.rx===0,'R.X, GIS, issues, MOM, CAD, rx activities all reset',z); ok(!z.sv||z.sv.split('\n').filter(Boolean).length<=1,'survey points reset',z.sv); ok(z.gridKids===1&&z.tpl==='blank','empty ground grid only; flag DATA.tpl=blank',z);
  await pg.screenshot({path:path.join(tmp,'blank.png')});
  console.log('== undo returns to the previous project');
  if(0)console.log('  last-two diff:',await E(pg,"(()=>{ const a=JSON.parse(HI.st[HI.st.length-2]), b=JSON.parse(HI.st[HI.st.length-1]), d=[]; const w=(x,y,p)=>{ if(JSON.stringify(x)===JSON.stringify(y))return; if(x&&y&&typeof x==='object'&&typeof y==='object'&&p.length<3){ new Set([...Object.keys(x),...Object.keys(y)]).forEach(k=>w(x[k],y[k],p.concat(k))); } else d.push(p.join('.')+' '+String(JSON.stringify(x)).slice(0,80)+' -> '+String(JSON.stringify(y)).slice(0,80)); }; w(a,b,[]); return d; })()"));
  console.log('  HI before undo',await E(pg,"HI.i+'/'+HI.st.length+' '+HI.st.map(j=>{const o=JSON.parse(j); return (o.data.tpl||'S')+':'+o.tp.rv.els.length}).join(' | ')"));
  await E(pg,"XC.undo.run()"); await pg.waitForTimeout(800); const U=await E(pg,SNAP); console.log('  HI after undo',await E(pg,"HI.i+'/'+HI.st.length"));
  const nb=o=>Object.assign({},o,{bomRows:0}); ok(JSON.stringify(nb(U))===JSON.stringify(nb(D))&&U.meshes===B.meshes&&U.parts===B.parts&&U.steps===B.steps,'after undo: the dirty station is back exactly (BOM, meshes, steps, ACT = state before New)',{U,D});
  ok(await E(pg,"RV.els.some(e=>e.id==='tpX1')&&IS.list.length===1&&MM.mt.length===1&&GM.layers[0].feat.length===1&&cadD().ents.length===1&&ACT.some(a=>a.id==='RX9')"),'after undo: R.X, issues, MOM, GIS, CAD, rx activity of the old project are back');
  ok(await E(pg,"JSON.parse(localStorage.getItem('lsv3-prev')).tp.id==='sewage'"),'previous project is also in lsv3-prev (Open command slot)');
  console.log('== sewage template'); await E(pg,"TOX.newProject('house2')"); await E(pg,"TOX.newProject('sewage')"); await pg.waitForTimeout(800);
  const Sw=await E(pg,SNAP); ok(JSON.stringify(Sw)===JSON.stringify(B),'sewage template = original BOM totals, meshes, steps, ACT',{Sw,B});
  ok(await E(pg,"IS.list.length===0&&RV.els.length===0&&DR.title==='Sewage Lift Station'&&tpId()==='sewage'"),'new sewage project still resets the other stores');
  console.log('== house2 / office3'); const exp={house2:{c:{floor:2,wall:16,room:10,door:9,window:16,stair:1,roof:1},levels:3,grids:4},office3:{c:{floor:3,col:45,wall:24,room:3,door:3,window:24,stair:2},levels:4,grids:8}}, saved={};
  for(const id of ['house2','office3']){
    await E(pg,`TOX.newProject('${id}')`); await pg.waitForTimeout(800); const X=await E(pg,RX), M=await E(pg,SNAP);
    ok(srt(X)===srt(exp[id]),id+' element counts',X); ok(M.meshes===0&&M.parts===0&&M.steps===0,id+': no station meshes / steps; BOM = R.X quantities only ('+M.items+' items, no station codes)',M); ok(await E(pg,"!getItems().some(x=>window.__codes.includes(x.code))"),id+': BOM has no station item codes');
    const bb=await E(pg,"(()=>{ const bx=new T.Box3().setFromObject(RV.g); const s=new T.Vector3(); bx.getSize(s); return [+s.x.toFixed(1),+s.y.toFixed(1),+s.z.toFixed(1),RV.g.children.length]; })()");
    ok(bb[3]>0&&(id==='house2'?bb[0]>=12&&bb[0]<=15:bb[0]>=24&&bb[0]<=27),id+' R.X scene drawn, plan size ok',bb); saved[id]=await E(pg,"projectJson()");
    await pg.screenshot({path:path.join(tmp,id+'.png')});
  }
  console.log('== toolbar undo covers R.X / GIS / issues / MOM / CAD / schedule');
  await E(pg,"TOX.newProject('house2')"); await pg.waitForTimeout(500); const n0=await E(pg,"RV.els.length+'/'+HI.i");
  await E(pg,"RV.els.push({id:'u1',k:'col',p:[1,1],w:.4,d:.4,h:3,lv:0}); rvChanged();"); ok(await E(pg,"HI.i")===+n0.split('/')[1]+1,'rvChanged adds one history entry');
  await E(pg,"XC.undo.run()"); await pg.waitForTimeout(300); ok(await E(pg,"RV.els.length+'/'+RV.els.some(e=>e.id==='u1')")===n0.split('/')[0]+'/false','toolbar undo removes the R.X column');
  await E(pg,"XC.redo.run()"); await pg.waitForTimeout(300); ok(await E(pg,"RV.els.some(e=>e.id==='u1')"),'toolbar redo brings it back');
  const h1=await E(pg,"HI.i"); await E(pg,"IS.list.push({id:'u2'}); isSave(); GM.layers[0].feat.push({t:'pt'}); gmSave(); cadAdd({t:'line',a:[0,0],b:[1,1]}); cadCommit();"); ok(await E(pg,"HI.i")>h1,'issues / GIS / CAD edits add history entries');
  await E(pg,"XC.undo.run(); XC.undo.run(); XC.undo.run();"); await pg.waitForTimeout(400); ok(await E(pg,"IS.list.length===0&&GM.layers[0].feat.length===0&&(!DATA.cad||DATA.cad.ents.length===0)"),'three undos clear issue, GIS feature and CAD line');
  console.log('== undo chain'); await E(pg,"XC.undo.run()"); await pg.waitForTimeout(500);
  ok(await E(pg,"tpId()")==='house2'&&srt(await E(pg,RX))===srt(exp.house2),'undo from office3 -> house2 with its elements');
  console.log('== save / load round trip');
  await E(pg,"TOX.newProject('sewage')");
  for(const id of ['house2','office3']){
    await pg.evaluate(j=>__lsv.ev('(()=>{ hiSnap(); hiApply('+JSON.stringify(j)+'); persist(); })()'),saved[id]); await pg.waitForTimeout(600);
    ok(await E(pg,"tpId()")===id&&srt(await E(pg,RX))===srt(exp[id])&&(await E(pg,SNAP)).meshes===0,id+' reopened from saved JSON: flag, elements, empty station');
    ok(JSON.parse(await E(pg,"projectJson()")).tp.rv.els.length===JSON.parse(saved[id]).tp.rv.els.length,id+' saves again identically (element count)');
  }
  const jb=await E(pg,"(()=>{ TOX.newProject('blank'); return projectJson(); })()"); await E(pg,"TOX.newProject('sewage')");
  await pg.evaluate(j=>__lsv.ev('(()=>{ hiApply('+JSON.stringify(j)+'); persist(); })()'),jb); await pg.waitForTimeout(600);
  ok(await E(pg,"tpId()")==='blank'&&(await E(pg,SNAP)).act===1&&(await E(pg,SNAP)).bomRows===1,'blank reopened from saved JSON');
  const js=await E(pg,"(()=>{ TOX.newProject('sewage'); return projectJson(); })()"); await E(pg,"TOX.newProject('blank')");
  await pg.evaluate(j=>__lsv.ev('(()=>{ hiApply('+JSON.stringify(j)+'); persist(); })()'),js); await pg.waitForTimeout(800);
  ok(JSON.stringify(await E(pg,SNAP))===JSON.stringify(B),'sewage reopened from saved JSON = baseline');
  /* an old file with no "tp" key must not wipe other stores and loads as the station */
  const old=JSON.parse(js); delete old.tp; delete old.data.tpl; await E(pg,"TOX.newProject('house2')");
  await pg.evaluate(j=>__lsv.ev('(()=>{ hiApply('+JSON.stringify(j)+'); })()'),JSON.stringify(old)); await pg.waitForTimeout(600);
  ok(await E(pg,"tpId()")==='sewage'&&(await E(pg,SNAP)).items>=B.items&&(await E(pg,RX)).c.wall===16,'legacy file (no tp key): loads as station, R.X store untouched');
  console.log('== reload keeps a non-station project'); await E(pg,"TOX.newProject('office3')"); await pg.waitForTimeout(600); console.log('  LS tpl before reload:',await pg.evaluate(()=>JSON.parse(localStorage.getItem('lsv3-data')).data.tpl)); await pg.reload({waitUntil:'domcontentloaded'}); await pg.waitForTimeout(6500);
  const R=await E(pg,SNAP); ok(await E(pg,"tpId()")==='office3'&&R.meshes===0&&R.act===1&&R.steps===0&&srt(await E(pg,RX))===srt(exp.office3),'after page reload: office3 still open, station hidden',R);
  console.log('== chooser dialog, hub card, agent'); 
  await E(pg,"XC.new.run()"); ok(await pg.evaluate(()=>document.querySelectorAll('#tpDlg [data-tpl]').length)===5,'New command opens the chooser (4 cards + Blank button)');
  await pg.screenshot({path:path.join(tmp,'chooser.png')}); await pg.evaluate(()=>{ document.getElementById('tpDl').checked=false; document.querySelector('#tpDlg [data-tpl="house2"]').click(); }); await pg.waitForTimeout(600);
  ok(await E(pg,"tpId()")==='house2'&&!(await pg.evaluate(()=>document.getElementById('tpDlg'))),'clicking a card creates the project and closes the dialog');
  await E(pg,"HXM.find(x=>x[0]==='new')[5]()"); ok(await pg.evaluate(()=>!!document.getElementById('tpDlg')),'hub Start from scratch card opens the chooser');
  const dp=pg.waitForEvent('download',{timeout:8000}); await pg.evaluate(()=>{ document.getElementById('tpDl').checked=true; document.querySelector('#tpDlg [data-tpl="blank-btn"]').click(); }); const dwn=await dp.catch(()=>null);
  ok(dwn&&dwn.suggestedFilename()==='LiftStation_previous_project.json'&&await E(pg,"tpId()")==='blank','Blank button + download box saves the previous project file',dwn&&dwn.suggestedFilename());
  await E(pg,"TOX.newProject('sewage')"); await E(pg,"xaHandle('new project')"); await pg.waitForTimeout(1500);
  ok(await E(pg,"tpId()")==='blank','agent "new project" on the station now starts a blank project (was: kept the station)');
  const bad=await pg.evaluate(()=>{ try{ TOX.newProject('nope'); return 'no error'; }catch(e){ return e.message; } }); ok(/unknown template/.test(bad),'unknown template id is refused',bad);
  const newErr=pg.errs.filter(m=>!baseErr.includes(m)); ok(newErr.length===0,'no new page errors vs baseline',newErr); console.log('  baseline page errors:',baseErr.length);
  console.log('\n'+pass+' passed, '+fail+' failed. Screenshots in '+tmp); await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
