/* F.X Reality Capture tests. Run: NODE_PATH=pw/node_modules node pw/rc_test.js "<chrome path>" [index.html path]. Network is mocked: tiles aborted, elevation = 100 + 20 m per 150 m north of latitude 30. */
const {chromium}=require('playwright-core'), fs=require('fs'), path=require('path');
(async()=>{ const b=await chromium.launch({executablePath:process.argv[2]}); const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true});
await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-rc','xto-gis'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept('x'));
const mock=global.RCMOCK||(()=>null); let elevCalls=0;
await pg.route(/^https?:\/\//,r=>{ const u=r.request().url(); if(u.includes('api.open-meteo.com/v1/elevation')){ elevCalls++; const lat=+new URL(u).searchParams.get('latitude'); return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({elevation:[100+(lat-30)*110852/150*20]})}); } const m=mock(u); if(m)return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(m)}); return r.abort(); });
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file://'+(process.argv[3]||'/tmp/rc_index.html'),{waitUntil:'domcontentloaded',timeout:120000}); await pg.waitForTimeout(5000);
let pass=0, fail=0; const show=R=>R.forEach(r=>{ r[1]?pass++:fail++; console.log((r[1]?'PASS ':'FAIL ')+r[0]+(r[1]?'':'   -> '+r[2])); });
for(const f of (process.env.RCPAGES||'rc_page.js,rc_bld_page.js').split(',')){ console.log('--- '+f); show(await E(fs.readFileSync(path.join(__dirname,f),'utf8'))); }
console.log('--- tab, agent, outputs'); const R=[], ok=(n,c,d)=>R.push([n,!!c,d===undefined?'':String(d)]);
ok('elevation calls went through the mocked service',elevCalls>50,elevCalls);
await E("lang='en'; rcClearData(); RC.surf={}; RC.ctrl=[]; RC.cf=null; wtNew('capture')"); await pg.waitForTimeout(900);
ok('tab type capture registered with its own icon and name F.X',await E("!!WTYPES.capture&&WTYPES.capture.n[0]==='F.X Capture'&&!!XI.tx_rc&&WTV.capture[0]==='tx_rc'&&WTGRP.capture===2"));
ok('default layout: map, mission panel, data panel are on screen',await E("RCB.mis.isConnected&&RCB.dat.isConnected&&!!GM.cv&&GM.cv.isConnected&&rcOn()"));
ok('ribbon: every button of the capture ribbon is wired (no stubs)',await E("RIBP.capture.built===RIBP.capture.tot&&RIBP.capture.tot>30"),await E("RIBP.capture.built+'/'+RIBP.capture.tot"));
ok('mission panel shows the camera warning and inputs',await E("/CHECK YOUR CAMERA/.test(RCB.mis.textContent)&&RCB.mis.querySelectorAll('input').length>15"));
const poly=await E("JSON.stringify([[-200,-150],[200,-150],[200,150],[-200,150]].map(rcPlane([30,31]).i))");
let r=await E("TOXAPI.plan_mission({type:'grid',camera:'m3e',polygon:"+poly+",gsd_cm:2,front:80,side:70,speed:10,heading:'auto',margin:0})");
ok('TOXAPI.plan_mission: 11 lines, 297 photos, camera note',r.stats&&r.stats.lines===11&&r.stats.photos===297&&/check your camera/.test(r.cameraNote),JSON.stringify(r).slice(0,200));
ok('window.TOX carries the six tools',await E("['plan_mission','import_survey_file','make_contours','compute_cut_fill','accuracy_report','export_mission'].every(k=>typeof window.TOX[k]==='function')"));
ok('model tool list and bridge allow-list carry the six tools',await E("['plan_mission','import_survey_file','make_contours','compute_cut_fill','accuracy_report','export_mission'].every(k=>XAM.tools.some(t=>t.name===k)&&BRT.includes(k))"));
r=await E("xaTool('plan_mission',{type:'double'})"); ok('xaTool plan_mission double grid: 577 photos',r.stats&&r.stats.photos===577,JSON.stringify(r).slice(0,120));
r=await E("xaTool('plan_mission',{type:'grid',terrain:true})"); ok('plan_mission with terrain: clearance returned',r.terrain&&r.terrain.minClearance>60,JSON.stringify(r.terrain)); await E("RC.m.terrain=false; rcRefresh()");
ok('result table and terrain profile drawn in the panel',await E("/297|photos/i.test(RCB.mis.textContent)&&!!RCB.mis.querySelector('table')"));
r=await E("xaTool('import_survey_file',{name:'pts.csv',text:'1,500000,3300000,0,a\\n2,500010,3300000,2,b\\n3,500010,3300010,2,c\\n4,500000,3300010,0,d',order:'P,E,N,Z,D'})"); ok('import_survey_file from text: 4 points',r.nPts===4,JSON.stringify(r));
r=await E("brTool('make_contours',{interval:0.5})"); ok('make_contours through the bridge tool: levels 0.5, 1, 1.5',r.levels&&r.levels.join()==='0.5,1,1.5',JSON.stringify(r));
r=await E("xaTool('compute_cut_fill',{level:1,cell:1})"); ok('compute_cut_fill: cut 25, fill 25 (TIN and grid)',r.tin&&Math.abs(r.tin.cut-25)<1e-6&&Math.abs(r.tin.fill-25)<1e-6&&Math.abs(r.grid.cut-25)<1e-6,JSON.stringify(r).slice(0,200));
r=await E("xaTool('accuracy_report',{})"); ok('accuracy_report with no points says not tested',typeof r==='string'&&/not tested/.test(r),r);
await E("RC.ctrl=[{id:'C1',kind:'check',E:0,N:0,Z:0,mE:0.03,mN:0.04,mZ:0.1}]; 0"); r=await E("xaTool('accuracy_report',{})"); ok('accuracy_report: RMSE horizontal 0.05, vertical 0.1',r.n===1&&Math.abs(r.rmseH-.05)<1e-9&&Math.abs(r.rmseZ-.1)<1e-9);
for(const f of ['kml','geojson','csv','photos','litchi','qgc','mp','dji','brief']){ const dl=pg.waitForEvent('download',{timeout:15000}); const res=await E("xaTool('export_mission',{format:'"+f+"'})"); const d=await dl; const fp='/tmp/rc_dl_'+f; await d.saveAs(fp); ok('export_mission '+f+' downloads '+d.suggestedFilename(),fs.statSync(fp).size>200&&/downloaded/.test(res)&&(f!=='dji'||/NOT validated/.test(res)),res); }
ok('downloaded QGC plan parses outside the page: 22 waypoints',JSON.parse(fs.readFileSync('/tmp/rc_dl_qgc','utf8')).mission.items.filter(x=>x.command===16).length===22);
ok('downloaded KMZ starts with PK',fs.readFileSync('/tmp/rc_dl_dji').slice(0,2).toString()==='PK');
r=await E("xaTool('export_mission',{format:'xyz'})"); ok('unknown export format is refused',/unknown format/.test(r),r);
ok('phrase (English): plan a drone mission double grid gsd 3 cm overlap 75 65',await E("xaPre('plan a drone mission double grid gsd 3 cm overlap 75 65')")===true); await pg.waitForTimeout(700);
ok('  -> type double, GSD 3, overlaps 75 / 65',await E("RC.m.type==='double'&&RC.m.gsd===3&&RC.m.front===75&&RC.m.side===65&&RC.plan.stats.gsdCm>2.99"),await E("JSON.stringify([RC.m.type,RC.m.gsd,RC.m.front,RC.m.side])"));
ok('phrase (Arabic): خطط مهمة طيران شبكة ارتفاع 60',await E("xaPre('خطط مهمة طيران شبكة ارتفاع 60')")===true); await pg.waitForTimeout(700);
ok('  -> type grid, height 60 m',await E("RC.m.type==='grid'&&RC.m.useGsd===false&&RC.m.H===60&&Math.abs(RC.plan.stats.H-60)<1e-9"));
ok('phrase (Arabic): قطع وردم عند منسوب 1.5',await E("xaPre('قطع وردم عند منسوب 1.5')")===true); await pg.waitForTimeout(500); ok('  -> cut and fill ran against level 1.5',await E("RC.cf&&/level 1.5/.test(RC.cf.design)"));
ok('phrase: contours every 0.25 / كنتور كل 0.25',await E("xaPre('كنتور كل 0.25')")===true); await pg.waitForTimeout(400); ok('  -> interval 0.25',await E("RC.cont&&RC.cont.iv===0.25"));
ok('phrase: accuracy report',await E("xaPre('accuracy report')")===true);
{ const dl=pg.waitForEvent('download',{timeout:15000}); ok('phrase: export the drone mission as litchi',await E("xaPre('export the drone mission as litchi')")===true); const d=await dl; ok('  -> litchi file downloaded',/litchi/.test(d.suggestedFilename()),d.suggestedFilename()); }
ok('unrelated phrase is not swallowed',await E("rcPhrase('open the schedule')")===false&&await E("rcPhrase('اعمل بيت دورين')")===false);
ok('Output Center lists Flight plan and Earthworks report',await E("OUTL.some(x=>x[1]==='Flight plan')&&OUTL.some(x=>x[1]==='Earthworks report')"));
r=await E("(async()=>{ const ids=OUTL.filter(x=>x[1]==='Flight plan'||x[1]==='Earthworks report').map(x=>x[0]); const v=await outBuild(ids); const V=OUTC.versions[0], M=await isUnzip(await OUTC.blobs[v].arrayBuffer()); return {files:V.files,fails:V.fails,names:[...M.keys()].join('|'),readme:new TextDecoder().decode(M.get('00_README.txt'))}; })()");
ok('Output Center build: 9 flight files + 3 earthworks files + README, no failures',r.files===13&&r.fails===0&&/11_Flight_plan\/.*_brief\.html/.test(r.names)&&/12_Earthworks\/earthworks\.xlsx/.test(r.names),JSON.stringify(r).slice(0,400));
await E("rcTabGo('acc')(); 0"); await pg.waitForTimeout(200); ok('data panel tabs render (accuracy table, hub how-to)',await E("!!RCB.dat.querySelector('table')")&&await E("(rcTabGo('hub')(),/does not process/.test(RCB.dat.textContent))")&&await E("(rcTabGo('qty')(),/Bulking/.test(RCB.dat.textContent))")&&await E("(rcTabGo('ter')(),/TIN from imported points/.test(RCB.dat.textContent))"));
await E("RC.pick=null; rcPick('area'); 0"); await pg.waitForTimeout(400); ok('Draw area arms the polygon tool on the shared G.X map',await E("GM.tool==='poly'&&RC.pick==='area'"));
await E("GM.pts=[[30.01,31.01],[30.01,31.02],[30.02,31.02]]; gmFinish(); 0"); ok('finishing the polygon sets the mission area (not a GIS feature)',await E("RC.m.area.length===3&&RC.pick===null&&GM.tool==='pan'"));
await E("xaTool('plan_mission',{type:'grid',polygon:"+poly+",gsd_cm:2,front:80,side:70}); gmGo(30,31,16); RC.show.foot=true; rcCoverage(RC.plan.photos,0,RC.plan.cam); RC.show.heat=true; gmDraw(); 0"); await pg.waitForTimeout(900);
fs.mkdirSync(path.join(__dirname,'../out'),{recursive:true}); await pg.screenshot({path:path.join(__dirname,'../out/rc.png')});
await E("RC.m.type='building'; Object.assign(RC.b,{fp:[[-10,-5],[10,-5],[10,5],[-10,5]].map(rcPlane([30,31]).i),h:12,obs:[],takeoff:rcPlane([30,31]).i([0,-40]),hr:10,date:'2026-06-21',tz:2,wind:{spd:5,gust:8,dir:100,src:''}}); rcRefresh(); gmGo(30,31,18.5); 0"); await pg.waitForTimeout(700);
ok('building mission in the panel: building inputs, ring table, sun line',await E("/Building capture/.test(RCB.mis.textContent)&&/Ring 3/.test(RCB.mis.textContent)&&/Sun: azimuth/.test(RCB.mis.textContent)&&/Pick building/.test(RCB.mis.textContent)"));
await E("rcPick('bld'); 0"); await pg.waitForTimeout(300); ok('Pick building arms a map click on the shared G.X map',await E("RC.pick==='bld'&&GM.tool==='point'")); await E("RC.pick=null; gmTool('pan'); rcPick('to'); 0"); await pg.waitForTimeout(300); await E("gmClick(GM.cv.width/2,GM.cv.height/2+60); 0"); await pg.waitForTimeout(300); ok('Mark take-off: a map click sets the take-off point',await E("RC.pick===null&&!!RC.b.takeoff&&RC.b.takeoff[0]<30"));
{ const dl=pg.waitForEvent('download',{timeout:15000}); await E("XC.rc_x_bbrief.run(); 0"); const d=await dl; ok('building brief downloads from the ribbon',/_building_brief\.html$/.test(d.suggestedFilename()),d.suggestedFilename()); }
await pg.screenshot({path:path.join(__dirname,'../out/rc_bld.png')});
ok('no page errors',er.length===0,er.slice(0,3).join(' | ')); show(R);
console.log('\nTOTAL '+(pass+fail)+'  PASS '+pass+'  FAIL '+fail); await b.close(); process.exit(fail?1:0); })();
