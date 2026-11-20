/* Playwright test for hxassets*.js. Usage: NODE_PATH=<dir with playwright-core> node hxassets_test.js [file:///path/index.html]. CHROME=<path> overrides Chrome. Needs WebGL (swiftshader flags are set). Screenshots go to $OUT or /tmp. */
const {chromium}=require('playwright-core'); const fs=require('fs');
const URL=process.argv[2]||'file://'+require('path').resolve(__dirname,'../../index.html'); const OUT=process.env.OUT||'/tmp';
const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0,fail=0; const ok=(c,m)=>{ if(c){pass++;console.log('  ok   '+m);}else{fail++;console.log('  FAIL '+m);} };
(async()=>{ const b=await chromium.launch({executablePath:CHROME,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true});
 await ctx.addInitScript(()=>{ try{ if(!sessionStorage.getItem('hxa-first')){ ['xto-tabs','xto-hm','xto-rv'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('hxa-first','1'); } sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[], miss=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('requestfailed',r=>miss.push(r.url().slice(-60))); const E=s=>pg.evaluate(s=>__lsv.ev(s),s); const W=ms=>pg.waitForTimeout(ms);
 await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:90000}); await W(5000);
 ok(await E("typeof HXA==='object'&&Object.keys(HXA.cat).length===40&&HXA.gl.length===25"),'catalogue: 40 materials, 25 models');
 ok(await E("!!renderer&&!renderer.isSoft"),'real WebGL renderer (not the software fallback)');
 await E("wtNew('hx')"); await W(1500); await E("hmSample()"); await W(800);
 /* materials pane */
 await E("XC.hx_mat.run()"); await W(1500);
 ok(await pg.evaluate(()=>document.querySelectorAll('#hxmBox .hxs').length)===19,'Materials pane: 19 floor swatches on the first tab');
 await W(2500); ok(await E("Object.keys(HXA.tx).length>=19&&Object.values(HXA.tx).every(t=>t.map&&t.nm)"),'floor pack lazy-loaded: colour + normal textures decoded');
 ok(await pg.evaluate(()=>[...document.querySelectorAll('#hxmBox .hxs i')].filter(i=>i.style.backgroundImage).length)===19,'swatches show their texture');
 await E("HXA.ms.sel='plank_flooring'; hxmPanel()"); await W(1200);
 ok(await pg.evaluate(()=>{ const c=document.querySelector('#hxmBox canvas'), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for(let i=3;i<d.length;i+=4)if(d[i]>0)n++; return n>2000; }),'preview sphere drawn');
 await E("HM.sel={k:'r',o:HM.rooms[0]}"); await pg.evaluate(()=>[...document.querySelectorAll('#hxmBox button')].find(b=>/Room floor|أرضية الغرفة/.test(b.textContent)).click()); await W(800);
 ok(await E("HM.rooms[0].fm==='plank_flooring'"),'room floor material stored on the room (saved with H.X)');
 ok(await E("(()=>{ const f=HM.g.children[0]; return !!(f.material.map&&f.material.normalMap&&f.material.map.repeat.x>1); })()"),'3D floor mesh has map + normal map, tiled by real size');
 await E("HXA.ms.sel='brick_wall_001'; HXA.ms.g='wall'"); await E("hxaApply('wl')"); await W(2500);
 ok(await E("HM.g.children.slice(1,5).every(m=>m.material.map)&&HM.g.children[1].material.transparent"),'wall meshes textured, keep their transparency');
 await E("HXA.ms.sel='glass_blue'; hxaApply('fl')"); await W(500); ok(await E("HM.g.children[0].material.transparent&&!HM.g.children[0].material.map"),'colour/glass entry applies as plain material');
 await E("HXA.ms.sel='plank_flooring'; hxaApply('fl')"); await W(500);
 /* R.X */
 await E("RV.els.push({id:'tw1',k:'wall',lv:0,a:[0,8],b:[5,8],h:3,t:.2},{id:'tf1',k:'floor',lv:0,a:[0,8],b:[5,12],t:.2}); RV.sel='tw1'; rvBuild()"); await E("HXA.ms.sel='white_plaster_02'"); await E("hxaApply('rx')"); await W(1500);
 ok(await E("RV.els.find(e=>e.id==='tw1').mat==='white_plaster_02'"),'R.X wall stores its material id (new field `mat`)');
 ok(await E("(()=>{ let n=0; RV.g.traverse(o=>{ if(o.isMesh&&o.userData.rv==='tw1'&&o.material.map)n++; }); return n>0; })()"),'R.X wall mesh textured');
 await E("RV.sel='tf1'; HXA.ms.sel='marble_01'; hxaApply('rx')"); await W(1500);
 ok(await E("(()=>{ let n=0; RV.g.traverse(o=>{ if(o.isMesh&&o.userData.rv==='tf1'&&o.material.map)n++; }); return n>0; })()"),'R.X floor mesh textured');
 await E("RV.els=RV.els.filter(e=>e.id!=='tw1'&&e.id!=='tf1'); RV.sel=null; rvBuild()");
 await pg.screenshot({path:OUT+'/hxa_materials.png'});
 /* furniture */
 await E("XC.hx_fur.run()"); await W(500); const t0=Date.now(); await pg.waitForFunction(()=>Object.keys(HXA.thumbs).length>=25,null,{timeout:120000}).catch(()=>{}); const nt=await E("Object.keys(HXA.thumbs).length"); ok(nt===25,'25 GLB models loaded lazily and thumbnails rendered ('+nt+', '+(Date.now()-t0)+' ms)');
 ok(Object.keys(await E("HXA.obj")).length===25,'all 25 GLBs parsed by GLTFLoader'); const bad=await E("Object.keys(HXA.obj).filter(k=>{ const z=HXA.obj[k].userData.sz; return !(z[0]>.02&&z[1]>.02&&z[2]>.02); })"); ok(bad.length===0,'every model has a sane bounding box '+JSON.stringify(bad));
 ok(await pg.evaluate(()=>[...document.querySelectorAll('#hxfBox img')].filter(i=>i.src.startsWith('data:image/png')).length)===25,'catalogue shows 25 thumbnails');
 const n0=await E("HM.items.length"); await pg.evaluate(()=>document.querySelector('#hxfBox .hxs[data-gl=sofa]').click()); await W(1500);
 ok(await E("HM.items.length")===n0+1&&await E("HM.items[HM.items.length-1].t==='g_sofa'"),'click places a sofa into the room');
 ok(await E("(()=>{ const g=HM.g.children.find(c=>c.userData.hm===HM.items[HM.items.length-1].id); let m=0,p=0; g.traverse(o=>{ if(o.isMesh)m++; }); HXA.obj.sofa.traverse(o=>{ if(o.isMesh)p++; }); return !!HXA.obj.sofa&&p>0&&m===p&&g.children.length===1; })()"),'sofa renders as the glTF model (same mesh count as the loaded GLB, not the box)');
 ok(await E("(()=>{ const it=HM.items[HM.items.length-1], g=HM.g.children.find(c=>c.userData.hm===it.id), bb=new THREE.Box3().setFromObject(g), s=bb.getSize(new THREE.Vector3()); return Math.abs(s.x-it.w)<.05&&Math.abs(s.z-it.d)<.05&&Math.abs(s.y-it.h)<.05; })()"),'model is scaled to the item W/D/H');
 /* drag and drop */
 const box=await pg.evaluate(()=>{ const r=__lsv.ev('HM.cv').getBoundingClientRect(); return [r.left,r.top]; });
 await pg.evaluate(([l,t])=>{ const dt=new DataTransfer(); dt.setData('text/plain','hxa:ctable'); const e=new DragEvent('drop',{dataTransfer:dt,clientX:l+30+3*42,clientY:t+30+2*42,bubbles:true,cancelable:true}); __lsv.ev('HM.cv').dispatchEvent(e); },box); await W(800);
 const ct=await E("HM.items[HM.items.length-1]"); ok(ct.t==='g_ctable'&&Math.abs(ct.x-3)<.1&&Math.abs(ct.z-2)<.1,'drop on the plan places the item at the drop point ('+ct.x+', '+ct.z+')');
 await pg.evaluate(()=>{ [...document.querySelectorAll('#hxfBox button')].find(b=>b.textContent==='90°').click(); }); await W(300); ok(await E("HM.items[HM.items.length-1].r")===90,'rotate button');
 await pg.evaluate(()=>{ [...document.querySelectorAll('#hxfBox button')].find(b=>b.textContent==='+10%').click(); }); await W(300); ok(Math.abs(await E("HM.items[HM.items.length-1].w")-1.1)<.01,'scale +10% button');
 await pg.evaluate(()=>{ [...document.querySelectorAll('#hxfBox button')].find(b=>/Delete|حذف/.test(b.textContent)).click(); }); await W(300); ok(await E("HM.items.every(i=>i.t!=='g_ctable')"),'delete button');
 await E("HXA.place('bed2',6.9,1.6); HXA.place('toilet',7,3.4); HXA.place('lampceil',2.5,2); HXA.place('plant',.5,.5); HXA.place('dtable',3.8,1.4)"); await W(1500);
 await E("hmFrame()"); await W(600); await pg.screenshot({path:OUT+'/hxa_furniture.png'});
 /* persistence */
 await W(300); const saved=await pg.evaluate(()=>localStorage.getItem('xto-hm')); ok(/g_sofa/.test(saved)&&/plank_flooring/.test(saved),'H.X state in localStorage keeps models and room materials');
 await pg.reload({waitUntil:'domcontentloaded'}); await W(5000); await E("wtNew('hx')"); await W(2500);
 console.log('   after reload:',await E("HM.rooms.length+' rooms, '+HM.items.length+' items, fm='+HM.rooms[0].fm+', types '+WTAB.tabs.map(t=>t.type)")); ok(await E("HM.items.some(i=>i.t==='g_sofa')&&HM.rooms[0].fm==='plank_flooring'"),'after reload the items and materials are back');
 ok(await E("(()=>{ const g=HM.g.children.find(c=>c.userData.hm===HM.items.find(i=>i.t==='g_sofa').id); let m=0; g.traverse(o=>{ if(o.isMesh)m++; }); return m>0; })()")&&await E("!!HM.g.children[0].material.map"),'after reload the model and the floor texture reload lazily');
 /* render lighting */
 await E("hmFrame()"); await W(500);
 const cost=()=>E("(()=>{ const gl=renderer.getContext(), px=new Uint8Array(4); const f=()=>{ renderer.render(scene,camera); gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px); }; f(); const t=performance.now(); for(let i=0;i<8;i++)f(); return +((performance.now()-t)/8).toFixed(1); })()");
 await pg.screenshot({path:OUT+'/hxa_view_before.png'}); const c0=await cost();
 await E("XC.hx_light.run()"); await W(800); ok(await E("HXR.live&&renderer.shadowMap.enabled&&renderer.toneMapping===THREE.ACESFilmicToneMapping&&!!scene.environment"),'live better-lighting: shadows + ACES + sky environment on');
 const c1=await cost(); await pg.screenshot({path:OUT+'/hxa_view_after.png'});
 console.log('  frame cost (swiftshader, software GL, '+(await E("renderer.domElement.width+'x'+renderer.domElement.height"))+'): plain '+c0+' ms, better lighting '+c1+' ms');
 await E("XC.hx_light.run()"); await W(300); ok(await E("!HXR.live&&!renderer.shadowMap.enabled&&renderer.toneMapping===THREE.NoToneMapping&&!scene.environment&&sun.position.x===7&&sun.target.position.length()===0"),'toggle off restores renderer, sun, environment');
 await E("RN.size='hd'; RN.spp=1; RN.tile=1024; 0"); const dl=pg.waitForEvent('download',{timeout:240000}); const r0=Date.now(); await E("rnRun()"); await dl; const rt=Date.now()-r0;
 ok(await E("!RN.busy&&!renderer.shadowMap.enabled&&scene.environment==null&&renderer.toneMapping===THREE.NoToneMapping"),'render command with better lighting finished and restored the view ('+rt+' ms for 1920x1080, 1 sample, swiftshader)');
 await E("HXR.hq=false; RN.msg=''"); const dl2=pg.waitForEvent('download',{timeout:240000}); const r1=Date.now(); await E("rnRun()"); const d2=await dl2; console.log('  render 1920x1080 1spp: with better lighting '+rt+' ms, without '+(Date.now()-r1)+' ms'); await E("HXR.hq=undefined");
 console.log('errors',er.slice(0,5),'failed requests',miss.slice(0,5)); console.log(pass+' pass, '+fail+' fail'); await b.close(); process.exit(fail?1:0); })();
