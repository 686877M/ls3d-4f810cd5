/* usage: NODE_PATH=<SP>/pw/node_modules nice -n 15 node vx_test.js <built site/index.test.html> [outdir]
   Copies the built page to a temp file, inserts vx.js (this folder) right before the Render Studio part 1 chunk (same place as the build chain), runs ONE headless Chrome (swiftshader).
   Checks: loads and wires lazily, SVG is valid XML with paths and no images, groups/ids, camera change changes output, hidden/wire styles, PDF opens (pypdf) with no raster,
   DXF structure, triangle cap message, saved view, Render Studio Stills block, ribbon command, state restored. Prints file sizes on the sample model; saves outputs. */
const {chromium}=require('playwright-core'), fs=require('fs'), path=require('path'), os=require('os'), cp=require('child_process');
const base=path.resolve(process.argv[2]), outd=path.resolve(process.argv[3]||fs.mkdtempSync(path.join(os.tmpdir(),'vx-out-'))); fs.mkdirSync(outd,{recursive:true});
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let html=fs.readFileSync(base,'utf8'); const mark='/* ====== Render Studio, part 1 of 3', at=html.indexOf(mark); if(at<0)throw new Error('no Render Studio marker');
if(!html.includes('function vxBuild')) html=html.slice(0,at)+fs.readFileSync(path.join(__dirname,'vx.js'),'utf8')+'\n'+html.slice(at);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'vx-')), page=path.join(tmp,'index_vx.html'); fs.writeFileSync(page,html);
let pass=0,fail=0; const ok=(c,m,x)=>{ if(c){pass++;console.log('  ok   '+m);} else {fail++;console.log('  FAIL '+m+(x!==undefined?'  -> '+JSON.stringify(x):''));} };
(async()=>{
 const b=await chromium.launch({executablePath:CHROME,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true}); await ctx.addInitScript(()=>{ sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); });
 const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{ if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text()))er.push('console: '+m.text()); });
 await pg.goto('file://'+page,{waitUntil:'domcontentloaded',timeout:120000}); await pg.waitForTimeout(6000);
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s); await E("lang='en'");
 console.log('== load, lazy wiring');
 ok(await E("typeof vxExport==='function'&&typeof vxBuild==='function'&&!!XC.vx_export"),'vx functions and ribbon command exist');
 ok(await E("VXS===null"),'nothing initialised at startup (settings are read lazily)');
 ok(await E("!!XDESC.vx_export&&XDESC.vx_export[0].length>20&&XDESC.vx_export[1].length>20"),'bilingual XDESC text');
 ok(await E("RIB.some(t=>t[2].some(g=>g[1].includes('vx_export')))"),'command is on the ribbon (Media group)');
 const snap="(()=>JSON.stringify({c:camera.position.toArray().map(x=>+x.toFixed(5)),t:controls.target.toArray().map(x=>+x.toFixed(5)),f:camera.fov,a:camera.aspect,r:renderer.render===undefined}))()";
 const s0=await E(snap);
 console.log('== SVG of the current view');
 const sv=await pg.evaluate(async()=>{ const r=await __lsv.ev("vxExport({fmt:'svg',paper:'A3'})"); const t=await r.blob.text(); return {text:t,stats:r.stats,name:r.name,w:r.w,h:r.h}; });
 fs.writeFileSync(path.join(outd,'view_shaded_A3.svg'),sv.text); console.log('       stats',JSON.stringify(sv.stats),'bytes',sv.text.length);
 const xml=await pg.evaluate(t=>{ const d=new DOMParser().parseFromString(t,'image/svg+xml'); return {err:!!d.querySelector('parsererror'),paths:d.querySelectorAll('path').length,img:d.querySelectorAll('image,foreignObject,canvas').length,ids:[...d.querySelectorAll('[id]')].map(x=>x.id),root:d.documentElement.nodeName,w:d.documentElement.getAttribute('width'),h:d.documentElement.getAttribute('height'),vb:d.documentElement.getAttribute('viewBox'),grp:d.querySelectorAll('g[data-layer]').length}; },sv.text);
 ok(!xml.err&&xml.root==='svg','SVG is valid XML');
 ok(!/NaN|Infinity/.test(sv.text),'no NaN or Infinity in any coordinate');
 ok(xml.paths>10&&xml.img===0&&!/<image|data:image|base64/i.test(sv.text),'contains '+xml.paths+' paths, no image/canvas/base64 raster');
 ok(xml.w==='420mm'&&xml.h==='297mm'&&xml.vb==='0 0 420 297','A3 landscape page in mm ('+xml.w+' x '+xml.h+')');
 ok(new Set(xml.ids).size===xml.ids.length,'all ids unique ('+xml.ids.length+')');
 ok(xml.grp>=1&&xml.ids.includes('vx-model')&&xml.ids.includes('vx-frame'),'groups per layer run ('+xml.grp+'), vx-model and vx-frame present');
 ok(sv.stats.faces>50&&sv.stats.edges>10&&sv.stats.src>sv.stats.faces,'faces '+sv.stats.faces+', edges '+sv.stats.edges+', shadow '+sv.stats.shadow+', source tris '+sv.stats.src+' (culling works)');
 ok(await E(snap)===s0,'camera, fov, aspect and render function unchanged after export');
 console.log('== camera change changes output');
 await E("camera.position.set(-14,9,12); controls.target.set(0,1,0); camera.lookAt(controls.target); camera.updateMatrixWorld(true); 1");
 const sv2=await pg.evaluate(async()=>{ const r=await __lsv.ev("vxExport({fmt:'svg'})"); return {t:await r.blob.text(),s:r.stats}; }); fs.writeFileSync(path.join(outd,'view_shaded_other.svg'),sv2.t);
 ok(sv2.t!==sv.text&&sv2.t.length!==sv.text.length,'other camera -> different SVG ('+sv.text.length+' vs '+sv2.t.length+' bytes)');
 console.log('== styles and grouping');
 const sty=await pg.evaluate(async()=>{ const g=async o=>{ const r=await __lsv.ev("vxExport("+JSON.stringify(o)+")"); return {t:await r.blob.text(),s:r.stats}; }; return {h:await g({style:'hidden'}),w:await g({style:'wire'}),l:await g({group:'layer'}),ns:await g({shadow:false}),ne:await g({edges:false})}; });
 const fills=t=>[...t.matchAll(/<path fill="(#[0-9a-f]{6}|none)"/g)].map(x=>x[1]);
 ok(fills(sty.h.t).filter(f=>f!=='none').every(f=>f==='#ffffff')&&sty.h.s.edges>0,'hidden-line: all faces white, edges present ('+sty.h.s.edges+')');
 ok(sty.w.s.faces===0&&fills(sty.w.t).every(f=>f==='none')&&sty.w.s.edges>0,'wireframe: no faces, only strokes ('+sty.w.s.edges+' edges)');
 ok(/inkscape:groupmode="layer"/.test(sty.l.t)&&(()=>{ const ids=[...sty.l.t.matchAll(/ id="([^"]+)"/g)].map(x=>x[1]); return new Set(ids).size===ids.length; })(),'group=layer: Inkscape layer groups, ids unique');
 ok(sty.ns.s.shadow===0&&sv2.s.shadow>0,'shadow option: on makes '+sv2.s.shadow+' shadow polygons, off makes 0');
 ok(sty.ne.s.edges===0&&sv2.s.edges>0,'edges option off -> 0 edges');
 await E("camera.position.set("+JSON.parse(s0).c.join(',')+"); controls.target.set("+JSON.parse(s0).t.join(',')+"); camera.lookAt(controls.target); camera.updateMatrixWorld(true); 1");
 console.log('== PDF');
 const pd=await pg.evaluate(async()=>{ const r=await __lsv.ev("vxExport({fmt:'pdf',paper:'A4'})"); const u=new Uint8Array(await r.blob.arrayBuffer()); let s=''; for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192)); return {b:btoa(s),n:u.length,st:r.stats,w:r.w,h:r.h}; });
 const pf=path.join(outd,'view_shaded_A4.pdf'); fs.writeFileSync(pf,Buffer.from(pd.b,'base64'));
 ok(Buffer.from(pd.b,'base64').slice(0,5).toString()==='%PDF-','PDF header ('+Math.round(pd.n/1024)+' KB, '+pd.st.polys+' polygons)');
 let info=''; try{ info=cp.execFileSync('python3',['-I','-c',"import sys,pypdf\nr=pypdf.PdfReader(sys.argv[1])\np=r.pages[0]\nxo=p['/Resources'].get('/XObject')\nimg=0\nif xo:\n  for k in xo:\n    if xo[k].get_object().get('/Subtype')=='/Image': img+=1\nc=p.get_contents().get_data().decode('latin1')\nprint(len(r.pages),float(p.mediabox.width),float(p.mediabox.height),img,c.count(' re\\n')+c.count(' m\\n'),c.count('\\nf')+c.count('\\nB'),len(c))",pf]).toString().trim(); }catch(e){ info='ERR '+e.message.slice(0,200); }
 const q=info.split(' '); console.log('       pypdf:',info);
 ok(q.length===7&&+q[0]===1&&Math.abs(+q[1]-841.9)<2&&Math.abs(+q[2]-595.3)<2,'pypdf opens it: 1 page, A4 landscape '+q[1]+' x '+q[2]+' pt');
 ok(q[3]==='0'&&!/\/Subtype\s*\/Image/.test(Buffer.from(pd.b,'base64').toString('latin1')),'no raster image object in the PDF');
 ok(+q[6]>2000,'content stream has vector drawing operators ('+q[6]+' bytes)');
 console.log('== DXF');
 const dx=await pg.evaluate(async()=>{ const r=await __lsv.ev("vxExport({fmt:'dxf',paper:'A3'})"); return {t:await r.blob.text(),st:r.stats}; }); fs.writeFileSync(path.join(outd,'view_shaded_A3.dxf'),dx.t);
 ok(/^0\nSECTION\n2\nHEADER/.test(dx.t)&&/0\nEOF\n$/.test(dx.t),'DXF header and EOF');
 ok((dx.t.match(/\n0\nSOLID\n/g)||[]).length>10&&(dx.t.match(/\n0\nLINE\n/g)||[]).length>5,'DXF has '+(dx.t.match(/\n0\nSOLID\n/g)||[]).length+' SOLID and '+(dx.t.match(/\n0\nLINE\n/g)||[]).length+' LINE entities, layers VX_*'+(/\nVX_/.test(dx.t)?'':' MISSING'));
 console.log('== cap message, saved view, Render Studio UI, ribbon command');
 const cap=await pg.evaluate(async()=>{ try{ await __lsv.ev("vxExport({max:10})"); return ''; }catch(e){ return e.message; } });
 ok(/limit is 10/.test(cap)&&/triangles/.test(cap),'cap refuses with a clear message',cap.slice(0,160));
 await E("lang='ar'"); const cap2=await pg.evaluate(async()=>{ try{ await __lsv.ev("vxExport({max:10})"); return ''; }catch(e){ return e.message; } }); await E("lang='en'"); ok(/مثلث/.test(cap2),'Arabic cap message');
 await E("RS.views=[{n:'Corner',id:'v1',p:[-14,9,12],t:[0,1,0]}]; rsSave(); 1");
 const vw=await pg.evaluate(async()=>{ const r=await __lsv.ev("vxExport({view:'Corner',rs:true,asp:1.5})"); return {t:await r.blob.text(),n:r.name}; });
 ok(vw.t!==sv.text&&/Corner/.test(vw.n)&&/Corner/.test(vw.t),'saved view "Corner" exported with its own camera ('+vw.n+')');
 ok(await E("(async()=>{ const r=await vxBatch({fmt:'svg',views:['Corner']}); return r.count===1&&r.blob.size>100; })()"),'all saved views -> ZIP (vector) works');
 await E("rsOpen(); RS.tab='stills'; rsPanel(); 1"); await pg.waitForTimeout(500);
 ok(await E("rsBox.textContent.includes('Vector output')&&rsBox.textContent.includes('Export vector')"),'Render Studio Stills tab shows the Vector block');
 const clickBtn=await pg.evaluate(()=>{ const b=[...document.querySelectorAll('#rsBox button')].find(x=>x.textContent==='Export vector'); return !!b; }); ok(clickBtn,'"Export vector" button exists');
 const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:60000}),pg.evaluate(()=>{ [...document.querySelectorAll('#rsBox button')].find(x=>x.textContent==='Export vector').click(); })]);
 ok(/^XTO_vector_.*\.svg$/.test(dl.suggestedFilename()),'button downloads '+dl.suggestedFilename());
 await E("localStorage.removeItem('xto-vx'); VXS=null; 1");
 const [dl2]=await Promise.all([pg.waitForEvent('download',{timeout:60000}),E("XC.vx_export.run(); 1")]); ok(/\.svg$/.test(dl2.suggestedFilename()),'ribbon command vx_export downloads '+dl2.suggestedFilename());
 ok(await E(snap)===s0,'state still restored at the end');
 ok(er.length===0,'no page errors',er.slice(0,3));
 // visual check: open the SVG itself and screenshot it
 const sp=await ctx.newPage(); await sp.setViewportSize({width:1400,height:990}); await sp.goto('file://'+path.join(outd,'view_shaded_A3.svg')); await sp.screenshot({path:path.join(outd,'view_shaded_A3.png')});
 await sp.goto('file://'+path.join(outd,'view_shaded_other.svg')); await sp.screenshot({path:path.join(outd,'view_shaded_other.png')});
 console.log('       sizes: SVG '+Math.round(sv.text.length/1024)+' KB, PDF(A4) '+Math.round(pd.n/1024)+' KB, DXF '+Math.round(dx.t.length/1024)+' KB; build '+sv.stats.ms+' ms for '+sv.stats.src+' source triangles');
 }catch(e){ fail++; console.log('  FAIL exception',e.message); }
 finally{ await b.close(); }
 console.log('\n'+pass+' passed, '+fail+' failed. Output in '+outd); process.exit(fail?1:0);
})();
