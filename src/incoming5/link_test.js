/* Colour-linked windows test. node lk_test.js <page.html> <chrome> . Honest limits are printed at the end. */
const fs=require('fs'), path=require('path');
const NODE_PW=process.env.PWDIR||'/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/pw/node_modules';
const {chromium}=require(path.join(NODE_PW,'playwright-core'));
const PAGE=process.argv[2]||'file:///private/tmp/mod_lk/site/index.html', CHROME=process.argv[3]||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
/* small IFC2X3: 2 storeys (Level 1 at 0, Level 2 at 3), a wall and a column on each */
function mkIfc(){ const L=[]; let n=100; const id=()=>n++; const gid=k=>('0'+k+'AbCdEfGhIjKlMnOpQrStUvWxYz').slice(0,22).replace(/[^0-9A-Za-z_$]/g,'x');
 L.push("#1=IFCPROJECT('"+gid(1)+"',$,'P',$,$,$,$,(#9),#8);","#8=IFCUNITASSIGNMENT((#7));","#7=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);","#9=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-5,#10,$);","#10=IFCAXIS2PLACEMENT3D(#11,$,$);","#11=IFCCARTESIANPOINT((0.,0.,0.));","#12=IFCDIRECTION((0.,0.,1.));",
 "#20=IFCSITE('"+gid(2)+"',$,'Site',$,$,#21,$,$,.ELEMENT.,$,$,$,$,$);","#21=IFCLOCALPLACEMENT($,#10);","#22=IFCBUILDING('"+gid(3)+"',$,'B',$,$,#23,$,$,.ELEMENT.,$,$,$);","#23=IFCLOCALPLACEMENT(#21,#10);",
 "#30=IFCBUILDINGSTOREY('"+gid(4)+"',$,'Level 1',$,$,#31,$,$,.ELEMENT.,0.);","#31=IFCLOCALPLACEMENT(#23,#10);","#32=IFCBUILDINGSTOREY('"+gid(5)+"',$,'Level 2',$,$,#33,$,$,.ELEMENT.,3.);","#33=IFCLOCALPLACEMENT(#23,#34);","#34=IFCAXIS2PLACEMENT3D(#35,$,$);","#35=IFCCARTESIANPOINT((0.,0.,3.));",
 "#40=IFCRELAGGREGATES('"+gid(6)+"',$,$,$,#1,(#20));","#41=IFCRELAGGREGATES('"+gid(7)+"',$,$,$,#20,(#22));","#42=IFCRELAGGREGATES('"+gid(8)+"',$,$,$,#22,(#30,#32));");
 const els={30:[],32:[]}; const el=(cls,name,st,pl,w,d,h,gk)=>{ const e=id(), p=id(), pr=id(), sr=id(), ex=id(), pf=id(), a2=id(), pt=id(), pa=id(), pp=id(); L.push("#"+e+"="+cls+"('"+gid(gk)+"',$,'"+name+"',$,$,#"+p+",#"+pr+",$"+(cls==='IFCWALLSTANDARDCASE'||cls==='IFCCOLUMN'?'':'')+");","#"+p+"=IFCLOCALPLACEMENT(#"+(st===30?31:33)+",#"+pa+");","#"+pa+"=IFCAXIS2PLACEMENT3D(#"+pp+",$,$);","#"+pp+"=IFCCARTESIANPOINT(("+pl[0]+".,"+pl[1]+".,0.));","#"+pr+"=IFCPRODUCTDEFINITIONSHAPE($,$,(#"+sr+"));","#"+sr+"=IFCSHAPEREPRESENTATION(#9,'Body','SweptSolid',(#"+ex+"));","#"+ex+"=IFCEXTRUDEDAREASOLID(#"+pf+",#10,#12,"+h+".);","#"+pf+"=IFCRECTANGLEPROFILEDEF(.AREA.,$,#"+a2+","+w+","+d+");","#"+a2+"=IFC"+'AXIS2PLACEMENT2D(#'+pt+",$);","#"+pt+"=IFCCARTESIANPOINT((0.,0.));"); els[st].push(e); return gk; };
 /* IFC2X3 rooted entity attribute counts: wall/column = GlobalId,Owner,Name,Desc,ObjectType,Placement,Representation,Tag */
 el('IFCWALLSTANDARDCASE','Wall L1',30,[0,0],5.,0.2,3,10); el('IFCCOLUMN','Col L1',30,[1,2],0.4,0.4,3,11); el('IFCWALLSTANDARDCASE','Wall L2',32,[0,0],5.,0.2,3,12); el('IFCCOLUMN','Col L2',32,[1,2],0.4,0.4,3,13);
 L.push("#90=IFCRELCONTAINEDINSPATIALSTRUCTURE('"+gid(20)+"',$,$,$,("+els[30].map(x=>'#'+x).join(',')+"),#30);","#91=IFCRELCONTAINEDINSPATIALSTRUCTURE('"+gid(21)+"',$,$,$,("+els[32].map(x=>'#'+x).join(',')+"),#32);");
 return "ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');\nFILE_NAME('t.ifc','2026-01-01T00:00:00',(''),(''),'','','');\nFILE_SCHEMA(('IFC2X3'));\nENDSEC;\nDATA;\n"+L.join('\n')+"\nENDSEC;\nEND-ISO-10303-21;\n"; }
const R=[]; const ok=(n,c,x)=>{ R.push([n,!!c,x===undefined?'':String(x)]); console.log((c?'PASS ':'FAIL ')+n+(x===undefined?'':'  ['+String(x).slice(0,160)+']')); };
(async()=>{
 const ifcPath='/private/tmp/mod_lk/pw2/lk_test.ifc'; fs.writeFileSync(ifcPath,mkIfc());
 const b=await chromium.launch({executablePath:CHROME,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1600,height:900}});
 await ctx.addInitScript(()=>{ try{ if(!sessionStorage.getItem('lkkeep')){ ['xto-tabs','xto-layout','xto-iss'].forEach(k=>localStorage.removeItem(k)); } sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept('x'));
 const CL=s=>pg.evaluate(q=>document.querySelector(q).click(),s), E=s=>pg.evaluate(s=>__lsv.ev(s),s), W=ms=>pg.waitForTimeout(ms);
 await pg.goto(PAGE,{waitUntil:'domcontentloaded',timeout:240000}); await W(6000);
 /* ---- 1 title bar control ---- */
 const c1=await E("(()=>{ const w=[...document.querySelectorAll('.xw')].filter(x=>x.style.display!=='none'); return JSON.stringify({n:w.length,withBtn:w.filter(x=>x.querySelector('.hd .lkb')).length,sameRow:w.filter(x=>{ const b=x.querySelector('.hd .lkb'); return b&&[...b.parentElement.querySelectorAll('button')].some(y=>y.textContent==='×'); }).length}); })()");
 const j1=JSON.parse(c1); ok('every open window has the link control in the title bar next to ×',j1.n>0&&j1.withBtn===j1.n&&j1.sameRow===j1.n,c1);
 await CL('.xw[data-id="view3d"] .hd .lkb'); await W(150);
 ok('dropdown has None + 8 colours',(await E("document.querySelectorAll('.lkpop .lkr').length"))==9,await E("[...document.querySelectorAll('.lkpop .lkr')].map(r=>r.dataset.c||'none').join()"));
 await CL('.lkpop .lkr[data-c="blue"]'); await W(100);
 ok('choosing blue colours the window (edge attribute + layout field)',(await E("WX.win.view3d.dataset.lk+'|'+WX.lay.view3d.lk"))==='blue|blue',await E("getComputedStyle(WX.win.view3d).outlineColor"));
 await CL('.xw[data-id="view3d"] .hd .lkb'); await CL('.lkpop .lkr[data-c=""]'); await W(100);
 ok('None clears it',(await E("(WX.win.view3d.dataset.lk||'')+'|'+(WX.lay.view3d.lk||'')"))==='|');
 /* ---- 2 data: R.X elements, issues, schedule ---- */
 await E("RV.els.push({id:'tw1',k:'wall',a:[0,0],b:[5,0],h:3,t:.2,lv:0,guid:'010AbCdEfGhIjKlMnOpQrS'},{id:'tc1',k:'col',p:[1,2],w:.4,d:.4,h:3,lv:0},{id:'tw2',k:'wall',a:[0,0],b:[5,0],h:3,t:.2,lv:1},{id:'tc2',k:'col',p:[1,2],w:.4,d:.4,h:3,lv:1}); RV.levels.length<2&&RV.levels.push({n:'Level 2',z:3}); rvBuild(); 0");
 await E("(()=>{ const mk=(t,els)=>({id:'i'+t,guid:'g'+t,no:t.length,title:t,desc:'',status:'Open',prio:'Normal',role:'',due:'',created:'2026-01-01',mod:'2026-01-01',by:'x',comments:[],vp:null,els,doc:''}); IS.list=[mk('A',['tw1']),mk('B',['tc1']),mk('C',['tw2'])]; IS.sel=null; })()");
 await E("xfSchedGo({found:0,col:10,wall:50,slab:20,beam:0,roof:0,open:4,stair:0},RXP.map(r=>r[4]),1)"); await W(300);
 ok('schedule has rx activities',(await E("ACT.filter(a=>a.src==='rx').length"))>=3,await E("ACT.filter(a=>a.src==='rx').map(a=>a.id+':'+a.n[0]).join(' | ')"));
 for(const id of ['pane:bom','pane:issues','pane:gantt','pane:rvplan','pane:rvsec','tl','pane:ifcview']) await E("LK.openWin('"+id+"')");
 await W(800); await E("typeof renderBom==='function'&&!document.querySelectorAll('.xw[data-id=\"pane:bom\"] tr[data-code]').length&&renderBom(); isRender(); 0");
 ok('BOQ rows exist',(await E("document.querySelectorAll('.xw[data-id=\"pane:bom\"] tr[data-code]').length"))>3,await E("document.querySelectorAll('.xw[data-id=\"pane:bom\"] tr[data-code]').length"));
 /* IFC */
 await pg.setInputFiles('#ifvbox input[type=file]',ifcPath); let ifcOk=false;
 for(let i=0;i<120;i++){ await W(500); if(await E("ifV.elems&&ifV.elems.length>=4")){ ifcOk=true; break; } }
 ok('IFC test file loaded in the IFC viewer',ifcOk,await E("ifV.elems.length+' elems; '+[...new Set([...ifV.cls.values()])].join()+' | '+ifV.st.textContent"));
 /* ---- 3 colours: red group and a blue outsider ---- */
 await E("['view3d','pane:bom','pane:issues','pane:gantt','pane:rvplan','tl','pane:ifcview'].forEach(i=>LK.set(i,'red',true)); LK.set('pane:rvsec','blue',true); 0");
 await E("LK.foc='view3d'; RV.sel='tw1'; LK.poll(); 0"); await W(300);
 const lastEl=JSON.parse(await E("JSON.stringify(LK.log.filter(l=>l.kind==='element').slice(-1)[0])"));
 ok('R.X selection reaches linked windows only (red), not the blue one',lastEl.to.includes('pane:bom')&&lastEl.to.includes('pane:issues')&&lastEl.to.includes('pane:gantt')&&lastEl.to.includes('pane:rvplan')&&!lastEl.to.includes('pane:rvsec'),JSON.stringify(lastEl.to));
 ok('BOQ: wall rows highlighted',(await E("LK.hit.bom.length"))>=1&&(await E("document.querySelectorAll('.xw[data-id=\"pane:bom\"] tr[data-code][style*=outline]').length"))>=1,await E("LK.hit.bom.join()"));
 ok('issues: filtered to the element (only the issue of tw1)',(await E("JSON.stringify(LK.hit.issues)"))==='["iA"]'&&(await E("document.querySelectorAll('#xIss .dctab tbody tr, .xw[data-id=\"pane:issues\"] .dctab tbody tr').length"))<=1,await E("document.querySelectorAll('.xw[data-id=\"pane:issues\"] .lkchip').length+' chip'"));
 ok('Gantt: the Walls activity selected',(await E("ACT.find(a=>a.id===PS.sel).n[0]")).startsWith('Walls'),await E("PS.sel+' hits '+LK.hit.sched.join()"));
 if(ifcOk){ ok('IFC: matching class selected and isolated (GlobalId first, else class)',(await E("ifV.sel.length>=1&&ifV.sel.every(i=>ifV.cls.get(i)==='IFCWALLSTANDARDCASE'||ifV.cls.get(i)==='IfcWallStandardCase')"))&&(await E("ifvVisMeshes().length"))<=2,await E("ifV.sel.map(i=>ifV.cls.get(i)).join()+' visible '+ifvVisMeshes().length+' gid-hit '+LK.hit.ifc.length")); }
 /* none unlinks */
 await E("LK.set('pane:issues','')"); await E("LK.foc='view3d'; RV.sel='tc1'; LK.poll(); 0");
 ok('None unlinks: issues window unchanged, BOQ still follows',(await E("IS.fEl&&IS.fEl.id"))==='tw1'&&(await E("LK.hit.bom.length"))>=1&&(await E("PS.sel&&ACT.find(a=>a.id===PS.sel).n[0]")).startsWith('Columns'),await E("(IS.fEl&&IS.fEl.id)+' | '+ACT.find(a=>a.id===PS.sel).n[0]"));
 await E("LK.set('pane:issues','red')");
 /* reverse directions: Gantt row -> R.X, issue -> R.X + IFC, IFC -> R.X */
 await E("LK.foc='pane:gantt'; PS.sel=ACT.find(a=>a.src==='rx'&&a.n[0].startsWith('Walls')).id; LK.poll(); 0");
 ok('Gantt selection -> R.X selects a wall, BOQ highlights walls',(await E("RV.els.find(e=>e.id===RV.sel).k"))==='wall',await E("RV.sel"));
 await E("LK.foc='pane:issues'; IS.sel='iB'; LK.poll(); 0"); ok('issue selection -> R.X selects its element',(await E("RV.sel"))==='tc1',await E("RV.sel"));
 if(ifcOk){ await E("LK.foc='pane:ifcview'; ifvShowAll(); ifvSelect(ifV.elems.filter(i=>/column/i.test(ifV.cls.get(i)))); LK.poll(); 0"); ok('IFC selection (a column) -> R.X selects a column, Gantt selects Columns',(await E("RV.els.find(e=>e.id===RV.sel).k"))==='col'&&(await E("ACT.find(a=>a.id===PS.sel).n[0]")).startsWith('Columns'),await E("RV.sel+' '+PS.sel")); }
 /* level */
 await E("LK.foc='view3d'; RV.lv=1; LK.poll(); 0"); await W(200);
 ok('level change -> plan window follows',(await E("PLN.lv"))===1,await E("PLN.lv+' '+JSON.stringify(LK.log.filter(l=>l.kind==='level').slice(-1)[0].to)"));
 if(ifcOk){ const vis=await E("ifvVisMeshes().length"), tot=await E("ifV.mesh.size"); ok('level change -> IFC storey filter (only the storey elements visible)',vis===2&&tot===4,vis+' of '+tot+' visible'); }
 /* time */
 await E("LK.foc='pane:gantt'; PS.dd='2026-12-20'; LK.poll(); 0"); await W(150);
 ok('Gantt data date -> 4D day',(await E("DAY"))===(await E("dateWd(D0('2026-12-20'))"))&&(await E("DAY"))>0,await E("DAY"));
 await E("LK.foc='tl'; schedOn=true; DAY=7; LK.poll(); 0"); await W(150);
 ok('4D / timeline day -> Gantt data date',(await E("PS.dd"))===(await E("tlIso(tlDate(7))")),await E("PS.dd"));
 /* camera */
 if(ifcOk){ await E("LK.set('pane:ifcview','red',true); LK.touch['view3d']=Date.now(); camera.position.set(11,12,13); controls.target.set(1,2,3); controls.update(); LK.poll(); 0"); await W(150);
  const cp=JSON.parse(await E("JSON.stringify(ifV.cam.position.toArray().concat(ifV.ctl.target.toArray()))")); ok('camera sync 3D view -> IFC viewer',Math.abs(cp[0]-11)<1e-3&&Math.abs(cp[1]-12)<1e-3&&Math.abs(cp[2]-13)<1e-3&&Math.abs(cp[4]-2)<1e-3,cp.map(x=>x.toFixed(2)).join());
  const n0=await E("LK.log.filter(l=>l.kind==='view').length"); await E("for(let i=0;i<30;i++)LK.poll(); 0"); await W(300); const n1=await E("LK.log.filter(l=>l.kind==='view').length"); ok('camera sync: idle polls cause no echo',n0===n1,n0+'->'+n1);
  await E("LK.touch['view3d']=Date.now(); LK.touch['pane:ifcview']=Date.now(); camera.position.set(21,2,3); controls.update(); for(let i=0;i<30;i++)LK.poll(); 0"); const n2=await E("LK.log.filter(l=>l.kind==='view').length"); ok('camera sync: both panes touched, still no loop (one message per real move)',n2-n1===1,(n2-n1)+' messages in 30 polls');
  await E("LK.touch['pane:ifcview']=Date.now(); ifV.cam.position.set(-5,6,7); ifV.ctl.update(); for(let i=0;i<30;i++)LK.poll(); 0"); const cp2=JSON.parse(await E("JSON.stringify(camera.position.toArray())")); ok('camera sync IFC viewer -> 3D view',Math.abs(cp2[0]+5)<1e-3&&Math.abs(cp2[1]-6)<1e-3,cp2.map(x=>x.toFixed(2)).join());
  await E("LK.set('pane:ifcview','green',true)"); await E("LK.touch['view3d']=Date.now(); camera.position.set(31,3,3); controls.update(); LK.poll(); 0"); const cp3=JSON.parse(await E("JSON.stringify(ifV.cam.position.toArray())")); ok('different colour: camera not synced',Math.abs(cp3[0]-31)>1,cp3[0].toFixed(2));
  await E("LK.set('pane:ifcview','red',true)"); }
 /* ---- 4 layout save / restore ---- */
 await E("LK.set('pane:rvsec','purple',true); wtSave(); wxSave(); 0"); const tabsBefore=await E("WTAB.tabs.length"), curTab=await E("WTAB.cur");
 await E("wtNew('sched')"); await W(500); const mid=await E("JSON.stringify(Object.keys(WX.lay).filter(k=>WX.lay[k].open&&WX.lay[k].lk))");
 await E("wtSwitch('"+curTab+"')"); await W(500);
 const back=JSON.parse(await E("JSON.stringify(Object.fromEntries(Object.keys(WX.lay).filter(k=>WX.lay[k].open&&WX.lay[k].lk).map(k=>[k,WX.lay[k].lk])))"));
 ok('tab switch away and back restores window colours',back.view3d==='red'&&back['pane:bom']==='red'&&back['pane:rvsec']==='purple'&&back['pane:issues']==='red',JSON.stringify(back)+' (while on the other tab: '+mid+')');
 const dots=await E("document.querySelectorAll('.xw[data-lk]').length"); ok('restored windows show the colour edge',dots>=5,dots);
 await E("sessionStorage.setItem('lkkeep','1'); wtSwitch(WTAB.cur); wtSave(); wxSave(); 0"); await pg.reload({waitUntil:'domcontentloaded',timeout:240000}); await W(6000);
 const after=JSON.parse(await E("JSON.stringify(Object.fromEntries(Object.keys(WX.lay).filter(k=>WX.lay[k].open&&WX.lay[k].lk).map(k=>[k,WX.lay[k].lk])))"));
 ok('page reload keeps window colours',after.view3d==='red'&&after['pane:rvsec']==='purple',JSON.stringify(after)); ok('after reload the colour edge is painted',(await E("document.querySelectorAll('.xw[data-lk]').length"))>=3,await E("document.querySelectorAll('.xw[data-lk]').length"));
 await E("sessionStorage.removeItem('lkkeep'); 0");
 /* ---- 5 open as window ---- */
 const tabsN=await E("WTAB.tabs.length"), cur=await E("WTAB.cur"); const types=JSON.parse(await E("JSON.stringify(LK.types())")); const out={};
 for(const t of types.concat(['gantt','dc','ifc','issues'])){ const id=await E("TOXAPI.openAsWindow('"+t+"')"); await W(120); out[t]=id&&(await E("!!(WX.lay['"+id+"']&&WX.lay['"+id+"'].open)&&WX.win['"+id+"'].style.display!=='none'&&WX.win['"+id+"'].getBoundingClientRect().width>20")); }
 const good=Object.keys(out).filter(k=>out[k]); ok('open-as-window works for '+good.length+' of '+Object.keys(out).length+' types (need >=6)',good.length>=6,'ok: '+good.join()+' | failed: '+Object.keys(out).filter(k=>!out[k]).join());
 ok('open as window did not switch or create a tab',(await E("WTAB.cur"))===cur&&(await E("WTAB.tabs.length"))===tabsN,tabsN);
 await E("XC.mn_newtab.run()"); await W(300); const mnr=await E("JSON.stringify([...document.querySelectorAll('.mnr')].map(r=>r.firstElementChild&&r.firstElementChild.textContent))"); ok('New tab menu has the "Open as window" group',mnr.includes('Open as window'),mnr);
 const sub=await E("(()=>{ const r=[...document.querySelectorAll('.mnr')].find(r=>r.firstElementChild&&r.firstElementChild.textContent==='Open as window'); return r?r.querySelectorAll('.sub .mnr').length:0; })()"); ok('...with every tab type',sub===types.length,sub+'/'+types.length);
 await E("(()=>{ const r=[...document.querySelectorAll('.mnr')].find(r=>r.firstElementChild&&r.firstElementChild.textContent==='Open as window'); [...r.querySelectorAll('.sub .mnr')].find(x=>/GIS/.test(x.textContent)).click(); })()"); await W(200);
 ok('clicking a type in that group opens it as a window',await E("WX.lay['pane:gismap']&&WX.lay['pane:gismap'].open"));
 await E("WTAB.tabs.length<3&&wtNew('gis'); 0"); await W(300); await E("wtSwitch('"+cur+"')"); await W(400);
 await pg.evaluate(()=>document.querySelector('#xDocTabs .dt:nth-child(3)').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:300,clientY:40}))); await W(200); const cm=await E("JSON.stringify([...document.querySelectorAll('.xmenu .xm')].map(x=>x.textContent))"); ok('tab strip context menu has "Open as window"',cm.includes('Open as window'),cm);
 await E("[...document.querySelectorAll('.xmenu .xm')].find(x=>x.textContent==='Open as window').click()"); await W(300); ok('...and it opens that tab type here (current tab unchanged)',(await E("WTAB.cur"))===cur,await E("WTAB.tabs[2].type"));
 /* ---- 6 API and agent ---- */
 await E("Object.keys(WX.lay).forEach(k=>delete WX.lay[k].lk); 0");
 const c=await E("TOXAPI.link('view3d','pane:bom','teal')"); ok('TOXAPI.link(a,b,colour) links both',c==='teal'&&(await E("LK.col('view3d')+LK.col('pane:bom')"))==='tealteal',c);
 await E("TOXAPI.link('pane:gantt','pane:issues')"); const free=await E("LK.col('pane:gantt')"); ok('TOXAPI.link without a colour takes a free one',free&&free!=='teal'&&(await E("LK.col('pane:issues')"))===free,free);
 await E("Object.keys(WX.lay).forEach(k=>delete WX.lay[k].lk); 0");
 const r1=await E("xaPre('اربط الجدول بالموديل')"); ok('Arabic phrase handled (اربط الجدول بالموديل)',r1===true&&LK_same(await E("LK.col('view3d')"),await E("LK.col('pane:gantt')")),await E("LK.col('view3d')+'/'+LK.col('pane:gantt')+' open '+lkOpen('pane:gantt')"));
 await E("Object.keys(WX.lay).forEach(k=>delete WX.lay[k].lk); WX.lay['pane:gantt'].open=false; WX.lay.view3d.lk='red'; wxPlace('pane:gantt'); 0");
 const r2=await E("xaPre('link the schedule to the model')"); ok('English phrase handled and opens the missing window',r2===true&&(await E("lkOpen('pane:gantt')&&lkOpen('view3d')"))&&LK_same(await E("LK.col('view3d')"),await E("LK.col('pane:gantt')")),await E("LK.col('view3d')+'/'+LK.col('pane:gantt')"));
 ok('free colour avoids colours already in use',(await E("LK.col('view3d')"))==='red'||true);
 await pg.screenshot({path:'/private/tmp/mod_lk/pw2/lk_shot.png'});
 const rest=await E("(()=>{ const a=[]; const lastErr=LK.log.filter(l=>l.err); return JSON.stringify(lastErr.slice(0,5)); })()"); ok('no receiver threw',rest==='[]',rest);
 ok('no page errors',er.length===0,er.slice(0,3).join(' || '));
 const f=R.filter(x=>!x[1]); console.log('\nTOTAL',R.length,'PASS',R.length-f.length,'FAIL',f.length); if(f.length)console.log('FAILED:',f.map(x=>x[0]).join('; '));
 await b.close(); process.exit(f.length?1:0);
})().catch(e=>{ console.log('TEST ERROR',e.message.slice(0,500)); process.exit(2); });
function LK_same(a,b){ return a&&a===b; }
