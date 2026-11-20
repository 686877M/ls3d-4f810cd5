const {chromium}=require('playwright-core');const fs=require('fs');
const NOGL=process.argv[2]==='nogl';
(async()=>{const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:NOGL?['--disable-gpu','--disable-webgl','--disable-3d-apis']:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[],net=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('request',r=>{ if(!r.url().startsWith('file:')&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))net.push(r.url()); });
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///private/tmp/mod_ifc/site/index_ifv.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(6000);
console.log('scripts before open:',await E("!!window.WebIFC"), 'cmd registered:',await E("!!XC.ifc_open"));
await E("XC.ifc_open.run()"); await pg.waitForTimeout(800);
console.log('after open: WebIFC',await E("!!window.WebIFC"),'gl',await E("ifV.gl"));
const f=process.argv[3]||'/private/tmp/mod_ifc/test_lift.ifc';
await pg.setInputFiles('#ifvbox input[type=file]',f); 
for(let i=0;i<120;i++){ await pg.waitForTimeout(500); if(await E("ifV.info.tris!==undefined&&ifV.tr.childNodes.length>0||/Could not/.test(ifV.st.textContent)")) break; }
console.log('status:',await E("ifV.st.textContent")); console.log('info:',JSON.stringify(await E("ifV.info")));
const cnt=await E("ifvCounts()"); console.log('counts:',JSON.stringify(cnt));
// compare against file text
const txt=fs.readFileSync(f,'utf8'); const fc={}; for(const m of txt.matchAll(/=(IFC[A-Z0-9]+)\(/g)){fc[m[1]]=(fc[m[1]]||0)+1;}
const prods=['IFCWALL','IFCSLAB','IFCBUILDINGELEMENTPROXY','IFCPLATE','IFCFLOWMOVINGDEVICE','IFCFLOWFITTING','IFCFLOWCONTROLLER','IFCDISCRETEACCESSORY','IFCFLOWSEGMENT','IFCFLOWTREATMENTDEVICE','IFCSITE','IFCBUILDING','IFCBUILDINGSTOREY','IFCPROJECT'];
const bad=[]; prods.forEach(p=>{ const v=cnt['Ifc'+p.slice(3)]; const key=Object.keys(cnt).find(k=>k.toUpperCase()===p); if((fc[p]||0)!==(cnt[key]||0))bad.push([p,fc[p],cnt[key]]); }); console.log('file-vs-viewer class mismatches:',JSON.stringify(bad));
console.log('bbox:',JSON.stringify(await E("ifV.bb&&[ifV.bb.min.toArray().map(x=>+x.toFixed(2)),ifV.bb.max.toArray().map(x=>+x.toFixed(2))]")));
console.log('tree first rows:',await pg.evaluate(()=>[...document.querySelectorAll('#ifvbox summary')].slice(0,6).map(x=>x.textContent).join(' | ')));
await pg.screenshot({path:'/private/tmp/mod_ifc/out/ifv_a.png'});
if(!NOGL){
 // pick at canvas center
 const r=await E('(()=>{const c=ifV.cv.getBoundingClientRect();return [c.left+c.width/2,c.top+c.height/2,c.width,c.height];})()');
 let picked=null; for(const [dx,dy] of [[0,0],[.1,0],[-.1,0],[0,.1],[0,-.1],[.2,.1],[-.2,-.1]]){ await pg.mouse.click(r[0]+dx*r[2],r[1]+dy*r[3]); await pg.waitForTimeout(250); const s=await E("ifV.sel.slice()"); if(s.length){picked=s[0];break;} }
 console.log('real-click picked id:',picked, picked&&await E("ifV.cls.get("+picked+")+' | '+ifvName("+picked+")"));
 await pg.waitForTimeout(500); console.log('props text:',(await E('ifV.pp.innerText')).replace(/\n/g,' / ').slice(0,700));
 // isolate by class group via tree
 const cls=await E("(()=>{const g={};ifV.elems.forEach(i=>{const c=ifV.cls.get(i);g[c]=(g[c]||0)+1;});return g;})()");
 const top=Object.keys(cls).sort((a,b)=>cls[b]-cls[a])[0]; console.log('top class',top,cls[top]);
 await E("ifvSelect(ifV.elems.filter(i=>ifV.cls.get(i)==='"+top+"')); ifvIsolate()"); console.log('visible meshes after isolate:',await E("ifvVisMeshes().length"));
 await E("ifvShowAll()"); console.log('visible after show all:',await E("ifvVisMeshes().length"),'/',await E("ifV.mesh.size"));
 await E("ifvSelect(ifV.elems.slice(0,3)); ifvHide()"); console.log('after hide 3:',await E("ifvVisMeshes().length")); 
 const dl=pg.waitForEvent('download'); await E("ifvExport()"); const d=await dl; await d.saveAs('/private/tmp/mod_ifc/out/ifv_vis.csv'); const csv=fs.readFileSync('/private/tmp/mod_ifc/out/ifv_vis.csv','utf8').trim().split('\n'); console.log('csv rows (header+visible):',csv.length,'visible expected',await E("ifV.elems.length-3"),'row1:',csv[1]); await E("ifvShowAll()");
 // section
 const z=await E("[ifV.bb.min.z,ifV.bb.max.z]"); await E('ifV.zc.checked=true; ifV.zr.value=(ifV.bb.min.z+ifV.bb.max.z)/2; ifvSection()'); console.log('section constant',await E("ifV.plane.constant"),'zrange',z, await E("ifV.zl.textContent"));
 await pg.waitForTimeout(500); await pg.screenshot({path:'/private/tmp/mod_ifc/out/ifv_sec.png'});
 // measure: two known points via pick at two screen positions + via API
 await E("ifV.zc.checked=false; ifvSection(); ifV.meas=true"); 
 const pts=await E('(()=>{const c=ifV.cv.getBoundingClientRect(); return [[c.left+c.width*.45,c.top+c.height*.5],[c.left+c.width*.55,c.top+c.height*.55]];})()');
 for(const p of pts){ await pg.mouse.click(p[0],p[1]); await pg.waitForTimeout(250); }
 console.log('measure pts',await E("ifV.pts.length"),'dist',await E("ifV.dist"),'|',await E("ifV.st.textContent"));
 // verify distance vs direct
 console.log('dist check',await E("ifV.pts.length===2&&Math.abs(ifV.pts[0].distanceTo(ifV.pts[1])-ifV.dist)<1e-9"));
 await E("ifV.meas=false"); await pg.screenshot({path:'/private/tmp/mod_ifc/out/ifv_meas.png'});
 // Fit button + orbit
 await E("ifvFit()");
 // memory: close and check disposal
 const before=await E("ifV.rd.info.memory"); console.log('GPU mem before close',JSON.stringify(before));
 await E("ifvClose(false)"); console.log('after close: GPU mem',JSON.stringify(await E("ifV.rd.info.memory")),'meshes',await E("ifV.mesh.size"),'model',await E("ifV.m"));
 await E("ifvClose(true)"); console.log('after full close gl/rd:',await E("ifV.gl"),await E("ifV.rd"));
}
console.log('external requests:',JSON.stringify(net)); console.log('page errors:',JSON.stringify(er.slice(0,5)));
await b.close();})();
