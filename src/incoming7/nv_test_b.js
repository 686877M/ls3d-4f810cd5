const {run}=require('./nv_h.js');
run('nv_test_b (Clash Detective)',async({pg,E,ok})=>{
 await E("RV.els.length=0; RV.els.push({id:'nvw1',k:'wall',a:[0,0],b:[4,0],h:3,t:.2,lv:0},{id:'nvw2',k:'wall',a:[2,-2],b:[2,2],h:3,t:.2,lv:0},{id:'nvw3',k:'wall',a:[0,1],b:[4,1],h:3,t:.2,lv:0}); rvBuild();"); await pg.waitForTimeout(500);
 ok('R.X walls are items',(await E("nvx.items().filter(i=>i.t==='rv').length"))===3);
 await E("DATA.nv=null; nvD().sets.W1={keys:['r:nvw1']}; nvD().sets.W2={keys:['r:nvw2']}; nvD().sets.W3={keys:['r:nvw3']}");
 /* rule: same category ignored */
 await E("nvcl.cfg().tests=[{id:'t1',name:'cross',a:'set:W1',b:'set:W2',type:'hard',tol:0.01,results:[]}]; nvcl.cfg().rules.sameCat=true"); ok('same-category rule ignores wall/wall',(await E("nvcl.run(nvcl.cfg().tests[0]).length"))===0);
 await E("nvcl.cfg().rules.sameCat=false"); const r=JSON.parse(await E("JSON.stringify(nvcl.run(nvcl.cfg().tests[0]))")); ok('hard clash found with rule off',r.length===1,r.length); ok('hard distance = -0.2 (overlap depth)',r.length&&Math.abs(r[0].dist+0.2)<0.011,r[0]&&r[0].dist); ok('clash point inside overlap (x~2,z~0)',r.length&&Math.abs(r[0].pt[0]-2)<.3&&Math.abs(r[0].pt[2])<.3,r[0]&&r[0].pt); ok('new result has status New',r[0]&&r[0].status==='New');
 await E("nvcl.cfg().tests.push({id:'t2',name:'clear',a:'set:W1',b:'set:W3',type:'clearance',tol:1,results:[]})");
 const c1=JSON.parse(await E("JSON.stringify(nvcl.run(nvcl.cfg().tests[1]))")); ok('clearance clash at tolerance 1 m (gap 0.8)',c1.length===1&&Math.abs(c1[0].dist-0.8)<0.02,c1); await E("nvcl.cfg().tests[1].tol=0.5"); ok('no live clearance clash at tolerance 0.5 m (old one turns Resolved)',(await E("nvcl.run(nvcl.cfg().tests[1]).filter(r=>r.status!=='Resolved').length"))===0);
 await E("nvcl.cfg().tests[1].tol=1; nvcl.cfg().tests[1].type='hard'"); ok('hard test of the parallel walls finds nothing live',(await E("nvcl.run(nvcl.cfg().tests[1]).filter(r=>r.status!=='Resolved').length"))===0); await E("nvcl.cfg().tests[1].type='clearance'");
 await E("nvcl.cfg().tests[0].a='all'; nvcl.cfg().tests[0].b='all'"); const all=await E("nvcl.run(nvcl.cfg().tests[0]).length"); ok('everything vs everything: walls cross (and the 3D model is included)',all>=2,all);
 await E("nvcl.cfg().tests[0].a='set:W1'; nvcl.cfg().tests[0].b='set:W2'; nvcl.run(nvcl.cfg().tests[0])");
 /* status workflow */
 await E("nvcl.cfg().tests[0].results.find(r=>r.a==='r:nvw1'&&r.b==='r:nvw2').status='Reviewed'"); await E("nvcl.run(nvcl.cfg().tests[0])"); ok('status survives re-run',(await E("nvcl.cfg().tests[0].results.find(r=>r.a==='r:nvw1'&&r.b==='r:nvw2').status"))==='Reviewed');
 await E("RV.els.splice(RV.els.findIndex(e=>e.id==='nvw2'),1); rvBuild(); nvD().sets.W2={keys:[]}; nvcl.cfg().tests[0].b='all'; nvcl.cfg().tests[0].a='set:W1'"); await E("nvcl.run(nvcl.cfg().tests[0])"); ok('vanished clash becomes Resolved',(await E("nvcl.cfg().tests[0].results.some(r=>r.status==='Resolved')"))===true);
 await E("RV.els.push({id:'nvw2',k:'wall',a:[2,-2],b:[2,2],h:3,t:.2,lv:0}); rvBuild(); nvD().sets.W2={keys:['r:nvw2']}; nvcl.cfg().tests[0].b='set:W2'; nvcl.run(nvcl.cfg().tests[0])"); ok('re-found clash goes Active again',(await E("nvcl.cfg().tests[0].results.find(r=>r.b==='r:nvw2').status"))==='Active');
 /* ignore pair rule */
 await E("nvcl.cfg().rules.ignore='r:nvw1|r:nvw2'"); ok('ignore-pair rule drops the clash',(await E("nvcl.run({a:'set:W1',b:'set:W2',type:'hard',tol:.01,results:[]}).filter(r=>r.status!=='Resolved').length"))===0); await E("nvcl.cfg().rules.ignore=''");
 await E("nvcl.cfg().rules.minSize=0.5"); ok('min size rule drops 0.2 overlap',(await E("nvcl.run({a:'set:W1',b:'set:W2',type:'hard',tol:.01,results:[]}).filter(r=>r.status!=='Resolved').length"))===0); await E("nvcl.cfg().rules.minSize=0.01");
 /* batch */
 await E("nvcl.cfg().tests.forEach(t=>{t.results=[];}); nvcl.cfg().tests[0].b='set:W2'"); ok('batch run all tests',(await E("nvcl.runAll()"))>=2);
 /* UI */
 await E("XC.nv_clash.run()"); await pg.waitForTimeout(800); ok('pane open',await E("!!(WX.lay['pane:nvclash']&&WX.lay['pane:nvclash'].open)")); const tabs=await pg.locator('#nvCl .nvt button').allInnerTexts(); ok('4 tabs Rules/Select/Results/Report',tabs.length===4,tabs);
 await pg.click('#nvCl .nvt button[data-t=tests]'); ok('test cards listed',(await pg.locator('#nvCl [data-test]').count())===2); await pg.click('#nvCl [data-test] button[data-a=run]'); await pg.waitForTimeout(300); ok('Run button jumps to Results with rows',(await pg.locator('#nvCl tbody tr[data-id]').count())>=1);
 await pg.selectOption('#nvCl select[data-f=group]','cat'); ok('group by category pair shows a group header',(await pg.locator('#nvCl .nvc b').count())>=1);
 await pg.selectOption('#nvCl select[data-f=group]','none'); const p0=await E("camera.position.toArray().join()"); await pg.click('#nvCl tbody tr[data-id]'); await pg.waitForTimeout(1600);
 ok('clicking a result flies the camera',(await E("camera.position.toArray().join()"))!==p0); ok('highlight layer holds A, B and the dimmed rest',(await E("NV.lay.cl.size"))>=2);
 const a=await E("(()=>{const r=nvcl.all()[0]; const m=nvMeshes(nvItem(r.a))[0]; return '#'+m.material.color.getHexString();})()"); ok('item A coloured red e53935',a==='#e53935',a);
 await pg.selectOption('#nvCl select[data-f=status]','Approved'); ok('status dropdown changes result',(await E("nvcl.all().some(r=>r.status==='Approved')"))===true);
 await pg.selectOption('#nvCl select[data-f=filter]','Approved'); ok('filter by status',(await pg.locator('#nvCl tbody tr[data-id]').count())>=1);
 await pg.click('#nvCl button[data-a=clearhl]'); ok('clear highlight restores colours',(await E("NV.lay.cl.size"))===0);
 await pg.click('#nvCl .nvt button[data-t=rules]'); await pg.uncheck('#nvCl input[data-f=sameCat]'); ok('rules checkbox writes rule',(await E("nvcl.cfg().rules.sameCat"))===false);
 const rep=await E("nvcl.report()"); ok('HTML report lists clashes and method',/Clash1/.test(rep)&&/bounding boxes/.test(rep)); ok('CSV report has header + rows',(await E("nvcl.csv().split('\\n').length"))>=2);
 await pg.click('#nvCl .nvt button[data-t=rep]'); await pg.click('#nvCl button[data-a=view]'); await pg.waitForTimeout(300); ok('report viewer iframe filled',(await pg.locator('#nvCl iframe').getAttribute('srcdoc')||'').includes('Clash report'));
 /* output ribbon: Clash report */
 const id=await E("nvRibId('Output','Export Data','Clash report')"); ok('Output>Clash report rebound (not stub)',!(await E("!!XC['"+id+"'].stub")));
 await pg.screenshot({path:'/private/tmp/mod_nv/out/nv_b.png'});
});
