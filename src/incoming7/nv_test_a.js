const {run}=require('./nv_h.js');
run('nv_test_a (core + TimeLiner)',async({pg,E,ok,er})=>{
 await E("nvx.open('tree')"); await pg.waitForTimeout(800);
 ok('navigator pane open',await E("!!(WX.lay['pane:nvnav']&&WX.lay['pane:nvnav'].open)"));
 ok('tree rows',(await pg.locator('#nvTree, .nvb .tr').count())>=30,await pg.locator('.nvb .tr').count());
 const n=await E("nvx.items().length"); ok('items >= 36',n>=36,n);
 ok('find Name contains pump',(await E("nvx.find([{p:'Name',o:'contains',v:'pump'}]).length"))>=1);
 ok('find Size Y > 1',(await E("nvx.find([{p:'Size Y',o:'>',v:'1'}]).length"))>=1);
 ok('find AND (name contains pump, kind != part) = 0',(await E("nvx.find([{p:'Name',o:'contains',v:'pump'},{p:'Kind',o:'!=',v:'part'}]).length"))===0);
 await E("nvx.select(['p:pump'])"); ok('select syncs selSet',(await E("(selSet||[]).indexOf('pump')>=0")));
 await E("nvx.open('props')"); await pg.waitForTimeout(300); const pt=await pg.locator('#nvProps .nvc').innerText(); ok('properties show Size X',/Size X/.test(pt)&&/pump/i.test(pt),pt.slice(0,80));
 /* sets */
 await E("DATA.nv=null; nvD().sets.A={keys:['p:pump','p:wwall']}; nvD().sets.S={q:[{p:'Name',o:'contains',v:'pump'}]}"); ok('selection set',(await E("nvx.sets('A').length"))===2); ok('search set re-run',(await E("nvx.sets('S').length"))>=1);
 /* appearance profiler */
 const shared=await E("(()=>{const m=nvMeshes(nvItem('p:wwall'))[0]; return '#'+m.material.color.getHexString();})()");
 await E("nvD().ap=[{p:'Name',o:'contains',v:'wall',col:'#ff00ff',op:.5}]"); const cnt=await E("nvx.applyProfiler()"); ok('profiler matched items',cnt>=1,cnt); await pg.waitForTimeout(400);
 const col=await E("(()=>{const m=nvMeshes(nvItem('p:wwall'))[0]; return '#'+m.material.color.getHexString()+'|'+m.material.opacity+'|'+m.material.transparent;})()"); ok('profiler colour on mesh',col.startsWith('#ff00ff')&&col.includes('|0.5'),col);
 const other=await E("(()=>{const m=nvMeshes(nvItem('p:pump'))[0]; return '#'+m.material.color.getHexString();})()"); await E("nvOvClear('ap')"); await pg.waitForTimeout(300);
 const back=await E("(()=>{const m=nvMeshes(nvItem('p:wwall'))[0]; return '#'+m.material.color.getHexString();})()"); ok('profiler clear restores original',back===shared,[back,shared]);
 /* TimeLiner */
 const nt=await E("nvtl.fromAct(true)"); ok('import from P.X',nt>=20,nt); const wt=await E("JSON.stringify(nvtl.tasks().filter(t=>t.keys.length).map(t=>[t.id,t.keys,t.ps,t.pe,t.type]))"); console.log(wt.slice(0,300));
 const task=JSON.parse(await E("JSON.stringify(nvtl.tasks().find(t=>t.keys.indexOf('p:wwall')>=0))")); ok('wwall task found',!!task);
 const ps=task.ps, pe=task.pe; const before=await E("nvtl.apply(nvMs('"+ps+"')-3*864e5); nvFrame(); nvItem('p:wwall')&&parts.wwall.every(g=>g.visible)"); ok('before start: wwall hidden (Construct before=hidden)',before===false);
 await E("nvtl.apply(nvMs('"+ps+"')+864e5)"); await pg.waitForTimeout(250); const dur=await E("(()=>{const m=nvMeshes(nvItem('p:wwall'))[0]; return parts.wwall.every(g=>g.visible)+'|'+'#'+m.material.color.getHexString()+'|'+m.material.opacity;})()"); ok('during: visible, type colour 43a047, opacity .75',dur==='true|#43a047|0.75',dur);
 await E("nvtl.apply(nvMs('"+pe+"')+5*864e5)"); await pg.waitForTimeout(250); const aft=await E("(()=>{const m=nvMeshes(nvItem('p:wwall'))[0]; return parts.wwall.every(g=>g.visible)+'|'+(m.material.opacity)+'|'+('#'+m.material.color.getHexString());})()"); ok('after: visible, model material back (no override)',aft.startsWith('true|')&&!aft.endsWith('#43a047')&&(await E("nvMeshes(nvItem('p:wwall'))[0].userData.nvO===undefined")),aft);
 /* demolish / temporary types */
 const FREE=await E("(()=>{const ks=Object.keys(parts).map(i=>'p:'+i).filter(k=>k!=='p:covers'); const k=ks.find(k=>!nvtl.tasks().some(t=>t.keys.indexOf(k)>=0))||ks[ks.length-1]; nvtl.tasks().forEach(t=>{t.keys=t.keys.filter(x=>x!==k);}); return k;})()"); const FID=FREE.slice(2); console.log('free part',FREE);
 await E("nvtl.tasks().push({id:'DX',name:'Demo cover',ps:'2027-03-01',pe:'2027-03-03',as:'',ae:'',type:'Demolish',keys:['p:covers'],sets:[],attach:[],cost:0,src:'manual'}); nvtl.tasks().push({id:'TX',name:'Temp crane',ps:'2027-03-01',pe:'2027-03-03',as:'',ae:'',type:'Temporary',keys:['"+FREE+"'],sets:[],attach:[],cost:0,src:'manual'});");
 await E("nvtl.apply(nvMs('2027-02-20'))"); ok('demolish before: visible',(await E("parts.covers.every(g=>g.visible)"))===true); ok('temporary before: hidden',(await E("parts['"+FID+"'].every(g=>g.visible)"))===false);
 await E("nvtl.apply(nvMs('2027-03-02'))"); await pg.waitForTimeout(200); ok('demolish during: red e53935',(await E("'#'+nvMeshes(nvItem('p:covers'))[0].material.color.getHexString()"))==='#e53935'); ok('temporary during: visible',(await E("parts['"+FID+"'].every(g=>g.visible)"))===true);
 await E("nvtl.apply(nvMs('2027-03-10'))"); ok('demolish after: hidden',(await E("parts.covers.every(g=>g.visible)"))===false); ok('temporary after: hidden',(await E("parts['"+FID+"'].every(g=>g.visible)"))===false);
 /* attach by level/kind and set */
 await E("nvtl.tasks().push({id:'LX',name:'Lvl',ps:'2027-04-01',pe:'2027-04-02',as:'',ae:'',type:'Construct',keys:[],sets:['A'],attach:['kind:part'],cost:0,src:'manual'})"); const lk=await E("nvtl.keys(nvtl.tasks().find(t=>t.id==='LX')).length"); ok('attach by set + kind spec',lk>=36,lk);
 /* CSV */
 const c0=await E("nvtl.tasks().length"); const nc=await E("nvtl.fromCsv('Name,PlannedStart,PlannedEnd,Type,Cost,Attach\\nFoot,2027-05-01,2027-05-05,Construct,1500,pump;lv:Level 1\\nBad,,,,,\\nCover,2027-05-06,2027-05-07,Demolish,200,covers')"); ok('csv import 2 rows (1 invalid skipped)',nc===2&&(await E("nvtl.tasks().length"))===c0+2,nc); ok('csv attach pump',(await E("nvtl.tasks().find(t=>t.name==='Foot').keys.join()"))==='p:pump'); const bad=await E("(()=>{try{nvtl.fromCsv('x,y\\n1,2');return 'no'}catch(e){return e.message}})()"); ok('csv bad header refused',bad!=='no',bad);
 ok('csv export roundtrip',(await E("nvtl.csv().split('\\n').length"))===(await E("nvtl.tasks().length"))+1);
 /* UI: pane, tabs, gantt, simulate */
 await E("XC.nv_timeliner.run()"); await pg.waitForTimeout(900); ok('timeliner pane open',await E("!!(WX.lay['pane:timeliner']&&WX.lay['pane:timeliner'].open)"));
 const tabs=await pg.locator('#nvTl .nvt button').allInnerTexts(); ok('four tabs',tabs.length===4,tabs); ok('task rows in table',(await pg.locator('#nvTl [data-tasks] tbody tr').count())>=20);
 await E("nvtl.tasks().filter(t=>t.src==='P.X').slice(0,3).forEach(t=>{t.as=t.ps; t.ae=nvIso(nvMs(t.pe)+3*864e5);}); TLS.tab='tasks'; nvTlRender();"); await pg.waitForTimeout(300);
 ok('gantt planned bars',(await pg.locator('#nvTl svg[data-gantt] rect[data-bar=planned]').count())>=10); ok('gantt actual bars (from % complete)',(await pg.locator('#nvTl svg[data-gantt] rect[data-bar=actual]').count())>=1,await pg.locator('#nvTl svg[data-gantt] rect[data-bar=actual]').count());
 await pg.click('#nvTl .nvt button[data-t=cfg]'); ok('configure has 3 types',(await pg.locator('#nvTl .nvc table tr').count())>=4);
 await pg.click('#nvTl .nvt button[data-t=src]'); ok('data sources: CSV box',(await pg.locator('#nvTl textarea[data-f=csv]').count())===1);
 await pg.click('#nvTl .nvt button[data-t=sim]'); await E("nvtl.cfg().speed=4; nvtl.cfg().step=3; nvtl.cfg().loop=false"); const d0=await E("nvIso(nvtl.range()[0])");
 await pg.click('#nvTl button[data-a=rewind]'); await pg.waitForTimeout(300); ok('rewind to start date',(await pg.locator('#nvTl [data-f=date]').innerText())===d0,await pg.locator('#nvTl [data-f=date]').innerText());
 ok('date overlay on 3D view',/\d{4}-\d\d-\d\d/.test(await pg.locator('#nvOver').innerText()));
 await pg.click('#nvTl button[data-a=play]'); await pg.waitForTimeout(2500); const d1=await pg.locator('#nvTl [data-f=date]').innerText(); ok('play advances date',d1>d0,[d0,d1]); await pg.click('#nvTl button[data-a=play]'); const d2=await pg.locator('#nvTl [data-f=date]').innerText(); await pg.waitForTimeout(800); ok('pause freezes date',d2===(await pg.locator('#nvTl [data-f=date]').innerText()));
 await pg.click('#nvTl button[data-a=fwd]'); ok('step forward = +interval(3d)',(await E("nvIso(nvtl.state().date)"))===(await E("nvIso(nvMs('"+d2+"')+3*864e5)")));
 await pg.click('#nvTl button[data-a=back]'); ok('step back',(await E("nvIso(nvtl.state().date)"))===d2);
 await E("nvtl.cfg().end='"+d0+"'"); await E("nvtl.cfg().start=''"); await E("nvtl.apply(nvMs('"+d0+"'))"); ok('end override shortens range',(await E("nvIso(nvtl.range()[1])"))===d0); await E("nvtl.cfg().end=''");
 /* loop */
 await E("nvtl.cfg().end=nvIso(nvtl.range()[0]+9*864e5); nvtl.cfg().loop=true; nvtl.cfg().speed=8; nvtl.cfg().step=3; nvtl.apply(nvtl.range()[1]-864e5); nvtl.play(true)"); await pg.waitForTimeout(2000); const lp=await E("nvIso(nvtl.state().date)+'|'+nvtl.state().playing"); ok('loop wraps and keeps playing',lp.endsWith('|true')&&lp.slice(0,10)<=(await E("nvIso(nvtl.range()[1])")),lp); await E("nvtl.play(false); nvtl.cfg().loop=false; nvtl.cfg().end=''");
 /* frames hook */
 const f1=await E("(()=>{const r=nvtl.frame('"+ps+"'); return JSON.stringify([r.png.slice(0,22),r.png.length,r.date]);})()"); const f2=await E("(()=>{const r=nvtl.frame('"+pe+"'); return JSON.stringify([r.png.slice(0,22),r.png.length,r.date]);})()"); ok('frame hook returns PNG',f1.includes('data:image/png;base64'),f1);
 const h=await E("(()=>{const a=TOXAPI.timelinerFrame('2026-12-01').png, b=TOXAPI.timelinerFrame('2027-06-01').png; return a!==b;})()"); ok('TOXAPI.timelinerFrame differs between early and late date',h===true);
 ok('TOXAPI.timelinerRange',(await E("JSON.stringify(TOXAPI.timelinerRange())")).includes('stepDays'));
 /* reset */
 await E("nvtl.stop(true)"); await pg.waitForTimeout(300); ok('reset restores visibility and removes overlay',(await E("Object.keys(parts).every(i=>parts[i].every(g=>g.visible))"))===true&&(await pg.locator('#nvOver').count())===0);
 await pg.screenshot({path:'/private/tmp/mod_nv/out/nv_a.png'});
});
