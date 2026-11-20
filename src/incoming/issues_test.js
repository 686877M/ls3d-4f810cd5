// usage: NODE_PATH=<dir with playwright-core> node issues_test.js "<chrome path>" [page.html]
const {chromium}=require('playwright-core'); const fs=require('fs'); const cp=require('child_process');
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++; };
(async()=>{ const b=await chromium.launch({executablePath:process.argv[2]}); const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-cdeaud','xto-iss','xto-rv'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept()); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await pg.goto('file://'+(process.argv[3]||'/private/tmp/mod_issmom/site/index.html'),{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
 // R.X wall + camera
 await E("(()=>{ RV.els.push({id:'wall1',k:'wall',a:[0,0],b:[5,0],h:3,t:.2,lv:0},{id:'col1',k:'col',p:[2,2],w:.4,d:.4,h:3,lv:0}); rvChanged(); RV.sel='wall1'; rvBuild(); camera.position.set(12,8,-9); controls.target.set(2.5,1,0); controls.update(); })()");
 await E("XC.is_new.run()"); await pg.waitForTimeout(500);
 ok(await E("IS.list.length")===1,'command is_new creates an issue');
 ok(await E("IS.list[0].title")==='Wall wall1'||/wall1/.test(await E("IS.list[0].title")),'title taken from the selected R.X element: '+await E("IS.list[0].title"));
 ok(await E("JSON.stringify(IS.list[0].vp.sel)")==='["wall1"]'&&await E("IS.list[0].els[0]")==='wall1','viewpoint records the selected element id');
 const p0=await E("IS.list[0].vp.pos"); ok(Math.abs(p0[0]-12)<1e-3&&Math.abs(p0[1]-8)<1e-3&&Math.abs(p0[2]+9)<1e-3,'viewpoint position = R.X camera '+JSON.stringify(p0));
 ok(await pg.evaluate(()=>!!document.querySelector('.dctab')&&[...document.querySelectorAll('.dctab tr')].length>=2),'pane:issues renders a list row (opened by the command)');
 ok(await E("typeof IS.list[0].vp.snap")==='string','snapshot field present ("'+(await E("IS.list[0].vp.snap.length"))+'" chars; empty if WebGL readback unavailable)');
 // restore on click
 await E("(()=>{ camera.position.set(-30,40,50); controls.target.set(0,0,0); controls.update(); RV.sel=null; rvBuild(); })()");
 await pg.evaluate(()=>{ const r=[...document.querySelectorAll('.dctab tr')][1]; r.click(); }); await pg.waitForTimeout(200);
 const p1=await E("camera.position.toArray()"); ok(Math.abs(p1[0]-12)<1e-3&&Math.abs(p1[2]+9)<1e-3,'click on the issue row restores camera position');
 const t1=await E("controls.target.toArray()"); ok(Math.abs(t1[0]-2.5)<1e-3&&Math.abs(t1[1]-1)<1e-3,'click restores orbit target');
 ok(await E("RV.sel")==='wall1','click restores element selection');
 // fields, workflow, comments
 await E("(()=>{ const i=IS.list[0]; i.desc='Opening missing for duct'; i.prio='High'; i.role='consultant'; i.due='2020-02-01'; isSetStatus(i,'Assigned'); isSetStatus(i,'InProgress'); isComment(i,'Checked on site'); })()");
 ok(await E("IS.list[0].status")==='InProgress'&&await E("IS.list[0].comments.length")===3,'status changes logged as system comments + one user comment');
 await E("TOXAPI.is.render()");
 ok(await pg.evaluate(()=>/Checked on site/.test(document.body.innerText)),'comment thread shown in the pane');
 // second issue, filters
 await E("(()=>{ RV.sel='col1'; const i=isNew({title:'Column clash'}); i.role='contractor'; i.prio='Critical'; isSave(); TOXAPI.is.render(); })()");
 ok(await E("IS.list.length")===2,'second issue from another element');
 await E("IS.f.st='InProgress'; TOXAPI.is.render()"); ok(await pg.evaluate(()=>[...document.querySelectorAll('.dctab tr')].length)===2,'status filter shows only matching issue');
 await E("IS.f.st=''; IS.f.q='clash'; TOXAPI.is.render()"); ok(await pg.evaluate(()=>[...document.querySelectorAll('.dctab tr')].length)===2,'text filter works');
 await E("IS.f.q=''; IS.f.role='contractor'; TOXAPI.is.render()"); ok(await pg.evaluate(()=>[...document.querySelectorAll('.dctab tr')].length)===2,'role filter works');
 await E("IS.f.role=''; TOXAPI.is.render()");
 // link to register doc
 await E("(()=>{ const d=dcAdd({type:'RFI',dir:'out',subject:'Duct opening',status:'sent'}); IS.list[1].doc=d.id; isSave(); })()");
 ok(await E("isDocOf(IS.list[1]).type")==='RFI','issue linked to a register document');
 // JSON round trip
 const js=await E("isJson()"); ok(JSON.parse(js).format==='xto-issues'&&JSON.parse(js).issues.length===2,'JSON export');
 await pg.evaluate(t=>{ window.__js=t; },js); const r1=await E("isImportJson(window.__js)"); ok(r1.add===0&&r1.dup===2,'JSON import skips duplicates by guid '+JSON.stringify(r1));
 await E("IS.list.length=0; 0"); const r2=await E("isImportJson(window.__js)"); ok(r2.add===2&&await E("IS.list.length")===2,'JSON import restores 2 issues');
 ok(await E("IS.list.find(i=>i.title==='Column clash').guid.length")===36,'guid kept');
 // BCF export, validate with an independent unzip + XML parse
 const dl=pg.waitForEvent('download'); await pg.evaluate(()=>[...document.querySelectorAll('button')].find(x=>/bcfzip/.test(x.textContent)).click()); const d=await dl; await d.saveAs('/tmp/issues_test.bcfzip'); ok(fs.statSync('/tmp/issues_test.bcfzip').size>200,'.bcfzip downloads');
 let tz=''; try{ tz=cp.execSync('unzip -t /tmp/issues_test.bcfzip 2>&1 || python3 -m zipfile -t /tmp/issues_test.bcfzip 2>&1').toString(); }catch(e){ tz=String(e.stdout||e); } ok(/No errors|Done testing/.test(tz),'independent unzip / python zipfile test passes (CRC ok)');
 const names=await E("isUnzip(window.__ab).then(m=>[...m.keys()])").catch(()=>null);
 await pg.evaluate(async()=>{ window.__ab=await (await __lsv.ev('isBcf()')).arrayBuffer(); });
 const files=await E("isUnzip(window.__ab).then(m=>[...m.keys()])"); ok(files.includes('bcf.version')&&files.filter(n=>/\/markup\.bcf$/.test(n)).length===2&&files.filter(n=>/\/viewpoint\.bcfv$/.test(n)).length===2,'BCF 2.1 layout: bcf.version + markup.bcf + viewpoint.bcfv per topic ('+files.length+' entries)');
 const bad=await E("isUnzip(window.__ab).then(m=>{ let bad=[]; for(const [n,v] of m){ if(/\\.(bcf|bcfv|version)$/.test(n)){ const x=new DOMParser().parseFromString(new TextDecoder().decode(v),'application/xml'); if(x.getElementsByTagName('parsererror').length)bad.push(n); } } return bad; })"); ok(bad.length===0,'all XML parts are well-formed '+JSON.stringify(bad));
 const mk=await E("isUnzip(window.__ab).then(m=>{ const k=[...m.keys()].find(n=>/markup/.test(n)); return new TextDecoder().decode(m.get(k)); })"); ok(/<Topic Guid="[0-9a-f-]{36}"/.test(mk)&&/<Title>/.test(mk)&&/TopicStatus=/.test(mk),'markup.bcf has Topic/Guid/Title/TopicStatus');
 // BCF round trip
 await E("IS.list.length=0; 0"); const r3=await E("isImportBcf(window.__ab)"); ok(r3.add===2&&r3.version==='2.1','BCF import brings back 2 topics, version '+r3.version);
 const w=await E("(()=>{ const i=IS.list.find(x=>/wall1/.test(x.title)); return {st:i.status,pr:i.prio,role:i.role,due:i.due,desc:i.desc,nc:i.comments.length,pos:i.vp.pos,tgt:i.vp.tgt,sel:i.vp.sel,up:i.vp.up,fov:i.vp.fov}; })()");
 ok(w.st==='InProgress'&&w.pr==='High'&&w.role==='consultant'&&w.due==='2020-02-01'&&w.desc==='Opening missing for duct','status, priority, role, due, description survive BCF round trip');
 ok(w.nc===3,'comments survive ('+w.nc+')');
 ok(Math.abs(w.pos[0]-12)<1e-3&&Math.abs(w.pos[1]-8)<1e-3&&Math.abs(w.pos[2]+9)<1e-3,'camera position survives (Y-up <-> Z-up conversion) '+JSON.stringify(w.pos));
 const dirA=[2.5-12,1-8,0+9], L=Math.hypot(...dirA), dirB=w.tgt.map((x,k)=>x-w.pos[k]), L2=Math.hypot(...dirB); ok(dirA.every((x,k)=>Math.abs(x/L-dirB[k]/L2)<1e-3),'view direction survives');
 ok(JSON.stringify(w.sel)==='["wall1"]','selected element id survives (AuthoringToolId)');
 ok(await E("(()=>{ const i=IS.list.find(x=>/wall1/.test(x.title)); return i.docRef===undefined&&!!isDocOf(i)&&isDocOf(i).ref==='PRJ-RFI-OUT-001'; })()"),'linked register document survives BCF round trip (DocumentReference re-linked by register ref)');
 ok(await E("isUnzip(window.__ab).then(m=>[...m.entries()].filter(([n])=>/markup/.test(n)).some(([n,v])=>/<DocumentReference isExternal=\"false\"><ReferencedDocument>PRJ-RFI-OUT-001/.test(new TextDecoder().decode(v))))"),'markup.bcf carries DocumentReference to the register ref');
 // click restores an imported viewpoint
 await E("(()=>{ camera.position.set(0,50,0); controls.update(); const i=IS.list.find(x=>/wall1/.test(x.title)); isGo(i); })()"); const p2=await E("camera.position.toArray()"); ok(Math.abs(p2[0]-12)<1e-3,'imported viewpoint restores');
 // stored-only zip also readable when entries are deflated: build one with CompressionStream if available
 const defl=await E("(async()=>{ if(typeof CompressionStream==='undefined')return 'n/a'; try{ const f=[{name:'bcf.version',data:new TextEncoder().encode('<?xml version=\"1.0\"?><Version VersionId=\"2.1\"><DetailedVersion>2.1</DetailedVersion></Version>'.repeat(3))}]; const z=await xZip(f); const m=await isUnzip(await z.arrayBuffer()); return new TextDecoder().decode(m.get('bcf.version')).length>100; }catch(e){ return 'err '+e.message; } })()"); ok(defl===true||defl==='n/a','importer reads deflated zip entries: '+defl);
 // snapshot round trip with a stand-in image (headless WebGL readback gave an empty snapshot above)
 const snap=await E("(()=>{ IS.list.forEach(i=>{ i.vp.snap='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ=='; }); return isBcf().arrayBuffer().then(ab=>{ window.__ab2=ab; return isUnzip(ab).then(m=>[...m.keys()].filter(n=>/snapshot\\.jpg$/.test(n)).length); }); })()"); ok(snap===2,'snapshot.jpg written per topic when a snapshot exists');
 await E("IS.list.length=0; 0"); await E("isImportBcf(window.__ab2)"); ok(await E("IS.list.every(i=>i.vp.snap==='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==')"),'snapshot bytes identical after BCF round trip');
 // garbage input
 const g=await E("isImportBcf(new Uint8Array([1,2,3,4]).buffer).then(()=>'no error',()=>'rejected')"); ok(g==='rejected','non-zip input rejected with an error, no crash');
 await pg.screenshot({path:'/tmp/issues.png'}); ok(er.length===0,'no page errors '+JSON.stringify(er.slice(0,3)));
 await b.close(); console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
