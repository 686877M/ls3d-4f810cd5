/* Playwright test for gantt.js. Usage: NODE_PATH=$(npm root -g) node gantt_test.js <path to built index.html> [screenshot.png] */
const {chromium}=require('playwright-core'); const fs=require('fs');
const HTML=process.argv[2]||'/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/site/index.html', SHOT=process.argv[3]||'';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0, fail=0; const ok=(c,m,x)=>{ if(c){pass++; console.log('PASS',m,x===undefined?'':x);} else {fail++; console.log('FAIL',m,x===undefined?'':x);} };
(async()=>{ const b=await chromium.launch({executablePath:CHROME});
 const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true}); await ctx.addInitScript(()=>{ try{ ['xto-tabs'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await pg.goto('file://'+HTML,{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
 /* 1 wiring */
 const ids=['sched_5','sched_37','sched_38','sched_39','sched_40','sched_41','sched_43','sched_56'];
 ok(await E("JSON.stringify("+JSON.stringify(ids)+".map(i=>!!XC[i].stub))")==='[false,false,false,false,false,false,false,false]','8 stub ids are wired (stub flag removed)');
 ok(await E("RIBP.sched.tabs.find(t=>t[0]==='view')[2][0][1].includes('gantt_open')"),'gantt_open added to sched View > Layout ribbon group');
 await E("XC.gantt_open.run()"); await pg.waitForTimeout(600);
 ok(await E("WX.lay['pane:gantt'].open===true&&!!document.querySelector('#gtbox')"),'gantt_open opens pane:gantt');
 const q=s=>pg.evaluate(s=>document.querySelectorAll(s).length,s);
 /* 2 render */
 const nCrit=await E("ACT.filter(a=>a.crit&&a.d>0).length"), nAct=await E("ACT.length");
 ok(await q('#gtbox svg [data-h=m]')>=20,'bars/milestones rendered',await q('#gtbox svg [data-h=m]'));
 ok(await q('#gtbox svg rect[data-h=m][fill="#e53935"]')===nCrit,'critical bars red = CPM critical count',nCrit);
 ok(await q('#gtbox svg path[fill="none"]')>10 && await q('#gtbox svg polygon')>10,'dependency arrows drawn (FS)');
 ok(await q('#gtbox svg path[data-h=m]')>=1&&await E("[...GT.svg.querySelectorAll('path[data-h=m]')].every(p=>p.getAttribute('d').includes('l7 7'))"),'milestones are diamonds',await q('#gtbox svg path[data-h=m]'));
 ok(await E("GT.svg.innerHTML.includes('stroke=\"#ff9800\"')"),'today line drawn');
 ok(await E("GT.svg.innerHTML.includes('stroke-dasharray=\"4 3\"')"),'data-date line drawn');
 ok(await q('#gtbox [data-w]')===4,'WBS tree rows on left',4);
 /* baseline */
 ok(await q('#gtbox svg rect[fill="#43a047"]')===0,'no baseline bar before baseline exists');
 await E("gtBaseline()"); await pg.waitForTimeout(300);
 ok(await q('#gtbox svg rect[fill="#43a047"]')>10,'baseline bars appear under actual bars',await q('#gtbox svg rect[fill="#43a047"]'));
 /* collapse */
 const rowsBefore=await E("GT.rows.length"); await pg.click('#gtbox [data-w="2"]'); await pg.waitForTimeout(200);
 ok(await E("GT.rows.length")<rowsBefore,'collapse WBS 2 removes its rows',rowsBefore+' -> '+await E("GT.rows.length")); await pg.click('#gtbox [data-w="2"]'); await pg.waitForTimeout(200);
 /* zoom */
 const w0=await E("GT.g.W"); await E("PS.zoom='day'; gtRefresh()"); await pg.waitForTimeout(150); const wd=await E("GT.g.W"); await E("PS.zoom='month'; gtRefresh()"); await pg.waitForTimeout(150); const wm=await E("GT.g.W"); await E("PS.zoom='week'; gtRefresh()"); await pg.waitForTimeout(150);
 ok(wd>w0&&w0>wm,'zoom day > week > month width',[wd,w0,wm].join(' / '));
 /* 3 dependency types + lag */
 await E("(()=>{ const a=ACT.find(x=>x.id==='B7'); a.preds=[{id:'B3',type:'SS',lag:2}]; a.after=[]; a._ak=''; })(); computeSched(); gtRefresh(); 0"); await pg.waitForTimeout(250);
 ok(await E("GT.svg.innerHTML.includes('>SS+2<')"),'SS+2 link labelled with type and lag');
 await E("(()=>{ const a=ACT.find(x=>x.id==='B7'); a.preds=[{id:'B3',type:'FS',lag:0}]; a.after=['B3']; a._ak='B3'; })(); computeSched(); gtRefresh(); 0");
 /* RX tag */
 await E("(()=>{ WBSN['5']=['R.X building','مبنى R.X']; ACT.splice(ACT.length-1,0,{id:'RX1',t:'civil',wbs:'5',src:'rx',n:['Slab (12 m3)','بلاطة'],d:4,fix:4,after:['B12'],lead:0,crew:4,parts:[],veh:[],hz:[],zone:[0,0,2],mat:null,m:[]}); computeSched(); gtRefresh(); })(); 0"); await pg.waitForTimeout(250);
 await E("GT.vp.scrollTop=1e6; GT.vp.scrollLeft=0; gtDraw()"); ok(await E("GT.svg.innerHTML.includes('>RX<')&&GT.lrows.innerHTML.includes('>RX<')"),'src:rx activity carries an RX tag (chart and tree)');
 /* 4 drag move: B9 is critical, drag later => SNET constraint, successors recompute */
 await E("PS.zoom='week'; PS.sel=null; GT.vp.scrollTop=0; GT.vp.scrollLeft=0; gtRefresh()"); await pg.waitForTimeout(250);
 const box=async(id,h)=>pg.evaluate(([id,h])=>{ const r=document.querySelector('#gtbox svg [data-a="'+id+'"][data-h="'+h+'"]').getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; },[id,h]);
 const bf0=await E("ACT.find(a=>a.id==='B12').sDate"), s0=await E("ACT.find(a=>a.id==='B9').sDate"); let bx=await box('B9','m');
 await pg.mouse.move(bx[0]+bx[2]/2,bx[1]+bx[3]/2); await pg.mouse.down(); await pg.mouse.move(bx[0]+bx[2]/2+7*7,bx[1]+bx[3]/2,{steps:6}); await pg.mouse.up(); await pg.waitForTimeout(400);
 const s1=await E("ACT.find(a=>a.id==='B9').sDate"), cs=await E("JSON.stringify(ACT.find(a=>a.id==='B9').cs)");
 ok(s1>s0&&cs&&cs.includes('SNET'),'drag bar right: start moved + SNET constraint written',new Date(s0).toISOString().slice(0,10)+' -> '+new Date(s1).toISOString().slice(0,10)+' '+cs);
 ok(await E("ACT.find(a=>a.id==='B12').sDate")>bf0,'CPM recomputed: successor B12 moved');
 ok(await E("DATA.sched.act.B9.cs&&DATA.sched.act.B9.cs.t==='SNET'"),'edit persisted into DATA.sched');
 /* drag earlier than logic: constraint should not stick */
 bx=await box('B9','m'); await pg.mouse.move(bx[0]+bx[2]/2,bx[1]+bx[3]/2); await pg.mouse.down(); await pg.mouse.move(bx[0]+bx[2]/2-7*30,bx[1]+bx[3]/2,{steps:6}); await pg.mouse.up(); await pg.waitForTimeout(400);
 ok(await E("ACT.find(a=>a.id==='B9').cs===undefined")&&await E("ACT.find(a=>a.id==='B9').sDate")===s0,'drag earlier than logic: logic holds, non-binding constraint dropped');
 /* 5 drag right edge => duration */
 const d0=await E("ACT.find(a=>a.id==='B4').d"), f0=await E("ACT.find(a=>a.id==='B5').sDate"); await E("GT.vp.scrollTop=0"); await pg.waitForTimeout(150); bx=await box('B4','r');
 await pg.mouse.move(bx[0]+3,bx[1]+5); await pg.mouse.down(); await pg.mouse.move(bx[0]+3+7*4,bx[1]+5,{steps:6}); await pg.mouse.up(); await pg.waitForTimeout(400);
 const d1=await E("ACT.find(a=>a.id==='B4').d");
 ok(d1>d0,'drag right edge: duration grows (survives auto-duration recompute)',d0+' -> '+d1+' (auto='+await E("PS.auto")+')'); ok(await E("ACT.find(a=>a.id==='B5').sDate")>f0,'successor B5 moved after duration change');
 /* stub commands */
 await E("XC.sched_37.run()"); ok(await E("GT.cols")===2,'sched_37 Columns cycles'); await E("XC.sched_38.run()"); ok(await E("GT.bars")===0,'sched_38 Bars cycles');
 await E("XC.sched_43.run()"); await pg.waitForTimeout(150); ok(await E("GT.pline===true&&GT.svg.innerHTML.includes('polyline')"),'sched_43 Progress line draws a polyline');
 await E("XC.sched_39.run()"); ok(await E("PS.zoom")==='month','sched_39 Timescale cycles'); await E("PS.zoom='week'");
 await E("XC.sched_40.run()"); await pg.waitForTimeout(150); ok(await E("GT.rows.filter(r=>r.k==='a').every(r=>r.a.crit)"),'sched_40 Filters: critical only'); await E("XC.sched_40.run()"); await pg.waitForTimeout(150);
 await E("XC.sched_41.run()"); await pg.waitForTimeout(150); ok(await E("GT.rows.every(r=>r.k==='a')"),'sched_41 Group and Sort: flat list'); await E("XC.sched_41.run()"); await pg.waitForTimeout(150);
 await E("XC.sched_5.run()"); ok(await E("GT.page")==='portrait','sched_5 Page Setup toggles print orientation');
 await E("GT.bars=3; GT.pline=false; GT.cols=1; gtRefresh()");
 /* 6 exports */
 let dl=pg.waitForEvent('download'); await E("gtExport('svg')"); let d=await dl; await d.saveAs('/tmp/g.svg'); let sv=fs.readFileSync('/tmp/g.svg','utf8');
 ok(sv.startsWith('<svg')&&sv.includes('RX1')&&sv.includes('polygon'),'SVG export: full chart with table, RX1 row and arrows',(sv.length/1024|0)+' KB');
 dl=pg.waitForEvent('download'); await E("gtExport('png')"); d=await dl; await d.saveAs('/tmp/g.png'); const png=fs.readFileSync('/tmp/g.png');
 ok(png.slice(1,4).toString()==='PNG'&&png.length>5000,'PNG export is a real PNG',png.length+' bytes');
 await pg.evaluate(()=>{ window.__pw=null; window.open=()=>({document:{write:t=>{window.__pw=t;},close(){}},focus(){},print(){window.__pp=1;}}); }); await E("gtPrint()"); await pg.waitForTimeout(500);
 ok(await pg.evaluate(()=>!!window.__pw&&window.__pw.includes('@page')&&window.__pp===1),'Print builds a page with @page and calls print');
 /* 7 500 activities */
 const t=await E(`(()=>{ const m9=ACT.find(a=>a.id==='M9'); const ins=[]; for(let i=0;i<500;i++){ ins.push({id:'T'+i,t:'civil',wbs:String(1+i%4),n:['Task '+i,'مهمة '+i],d:1+(i*7)%9,fix:1+(i*7)%9,after:i?['T'+Math.max(0,i-1-(i%7))]:['M0'],lead:0,crew:2,parts:[],veh:[],hz:[],zone:[0,0,2],mat:null,m:[],pct:i%11===0?40:0}); } ACT.splice(ACT.indexOf(m9),0,...ins); const t0=performance.now(); computeSched(); const tc=performance.now()-t0; GT.dirty=true; const t1=performance.now(); gtDraw(); const td=performance.now()-t1; return {n:ACT.length,rows:GT.rows.length,tc,td,domRows:GT.lrows.children.length,svgNodes:GT.svg.querySelectorAll('*').length}; })()`);
 ok(t.n>=520,'500 extra activities loaded',t.n+' total'); ok(t.domRows<=60&&t.svgNodes<4000,'virtualised: DOM rows / svg nodes stay small',t.domRows+' rows, '+t.svgNodes+' svg nodes of '+t.rows+' rows');
 const sc=await E("(()=>{ const v=GT.vp, ts=[]; for(let i=0;i<20;i++){ v.scrollTop=i*400; const t0=performance.now(); gtDraw(); ts.push(performance.now()-t0); } v.scrollTop=1e6; gtDraw(); return {avg:ts.reduce((a,b)=>a+b,0)/ts.length, max:Math.max(...ts), maxTop:v.scrollTop, H:GT.g.H}; })()");
 ok(sc.avg<16,'scroll redraw avg < 16 ms on 520 activities (headless Chrome)','avg '+sc.avg.toFixed(1)+' ms, max '+sc.max.toFixed(1)+' ms, CPM '+t.tc.toFixed(0)+' ms, full draw '+t.td.toFixed(1)+' ms');
 const tf=await E("(()=>{ const t0=performance.now(); const s=gtFull(); return {ms:performance.now()-t0,kb:s.length/1024|0}; })()"); ok(tf.kb>100,'full export of 520 rows builds',tf.ms.toFixed(0)+' ms, '+tf.kb+' KB');
 await E("GT.vp.scrollTop=0; GT.vp.scrollLeft=0; gtRefresh()"); await pg.waitForTimeout(300);
 if(SHOT)await pg.screenshot({path:SHOT});
 ok(er.length===0,'no page errors',er.slice(0,3).join(' | '));
 console.log('\n'+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0); })();
