/* Playwright test for hxt_*.js (H.X direct manipulation). Usage: NODE_PATH=<dir with playwright-core> node hxt_test.js file:///.../index.test.html. CHROME=<path> overrides Chrome; OUT=<dir> for screenshots (default /tmp). Needs WebGL (swiftshader flags set). */
const {chromium}=require('playwright-core'); const fs=require('fs');
const URL=process.argv[2]; const OUT=process.env.OUT||'/tmp'; const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0,fail=0; const ok=(c,m,x)=>{ if(c){pass++;console.log('  ok   '+m);}else{fail++;console.log('  FAIL '+m+(x!==undefined?'  -> '+JSON.stringify(x):''));} };
(async()=>{ const b=await chromium.launch({executablePath:CHROME,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1500,height:860}});
 await ctx.addInitScript(()=>{ try{ if(!sessionStorage.getItem('hxt-first')){ ['xto-tabs','xto-hm','xto-hxt','xto-rv'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('hxt-first','1'); } sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s); const W=ms=>pg.waitForTimeout(ms);
 const scr=async(x,y,z)=>E(`(()=>{ const v=new T.Vector3(${x},${y},${z}).project(camera), r=renderer.domElement.getBoundingClientRect(); return [r.left+(v.x+1)/2*r.width, r.top+(1-v.y)/2*r.height]; })()`);
 const cam=async(p,t)=>{ for(let i=0;i<6;i++){ await E(`tw=null; camera.position.set(${p}); controls.target.set(${t}); controls.update();`); await W(400); if(await E(`camera.position.distanceTo(new T.Vector3(${p}))<1e-3&&controls.target.distanceTo(new T.Vector3(${t}))<1e-3`))return true; } return false; };
 const click=async(p,o)=>{ await pg.mouse.move(p[0],p[1],{steps:3}); await W(120); await pg.mouse.down(); await W(40); await pg.mouse.up(); await W(250); if(o&&o.after)await W(o.after); };
 await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:240000}); await W(8000);
 ok(await E("typeof HXT==='object'&&HXT.init===false&&!document.getElementById('hxtHint')&&HXT.mg===null"),'lazy: nothing built before the H.X tab opens');
 await E("wtNew('hx')"); await W(2500); for(let i=0;i<30&&await E("!!tw");i++)await W(300); await E("tw=null");
 ok(await E("HXT.init===true&&!!document.getElementById('hxtHint')&&!!HXT.mg"),'H.X tab opened: tools initialised');
 ok(await E("['hxt_sel','hxt_push','hxt_offset','hxt_follow','hxt_out','hxt_cf'].every(k=>XC[k]&&XDESC[k]&&XDESC[k][0]&&XDESC[k][1])&&RIB.find(t=>t[0]==='hm')[2].some(g=>g[1].includes('hxt_push'))"),'commands registered with bilingual help and on the H.X ribbon');
 await E("HM.rooms=[{id:'r1',n:'Living',x:0,z:0,w:5,d:4,fl:0xa98467,wl:0xcfc6b4}]; HM.items=[]; HXT.M=[]; hxtSaveM(); HM.sel=null; hxtSelSet([]); hmChanged(); camera.position.set(2.5,8,8.5); controls.target.set(2.5,0,2); controls.update(); tw=null;"); await W(900);
 /* PLACE */
 await E("HXA.place(HXA.gl[0][0])"); await W(300);
 ok(await E("HXT.tool==='place'&&HM.items.length===0&&!!HXT.gh"),'catalogue click starts PLACE mode (nothing dropped yet)');
 await E("hxtTool('sel')"); await W(100);
 await E("hxtPlace('chair')"); await W(200);
 let p1=await scr(1.5,0,1.5); await pg.mouse.move(p1[0],p1[1],{steps:4}); await W(400);
 const g1=await E("[HXT.pg.x,HXT.pg.z,HXT.gh.visible,HXT.ev&&HXT.ev.clientX,HXT.ev&&HXT.ev.clientY,HXT.ev&&HXT.ev.target.tagName]");
 let p2=await scr(2.5,0,2.0); await pg.mouse.move(p2[0],p2[1],{steps:6}); await W(400);
 const g2=await E("[HXT.pg.x,HXT.pg.z,HXT.gh.visible,HM.items.length]");
 ok(g1[2]&&g2[2]&&Math.abs(g1[0]-1.5)<.06&&Math.abs(g2[0]-2.5)<.06&&g2[3]===0,'ghost follows the mouse, nothing placed before the click',[g1,g2]);
 await pg.screenshot({path:OUT+'/hxt_place.png'});
 await pg.mouse.down(); await W(40); await pg.mouse.up(); await W(700);
 const it=await E("HM.items.length===1?[HM.items[0].x,HM.items[0].z,HM.items[0].t]:null");
 ok(it&&Math.abs(it[0]-2.5)<.06&&Math.abs(it[1]-2.0)<.06&&it[2]==='chair','click places it at the clicked floor point (±5 cm grid)',it);
 ok(await E("HXT.tool==='sel'&&HXT.sel[0]&&HXT.sel[0].o===HM.items[0]"),'placed item becomes the selection');
 await E("hxtPlace('wardrobe')"); await W(100); let pw=await scr(4.6,0,2.0); await pg.mouse.move(pw[0],pw[1],{steps:4}); await W(400);
 ok(await E("Math.abs(HXT.pg.x-(5-HM.wt/2-HM.items[0].d/2))>0&&Math.abs(HXT.pg.x-(5-HM.wt/2-HMC.wardrobe[3]/2))<.02&&HXT.pg.r===90"),'near a wall the ghost snaps its back to the wall and turns',await E("[HXT.pg.x,HXT.pg.r]"));
 await E("HXT.T.place.wheel({deltaY:1})"); ok(await E("HXT.pg.r===105"),'wheel rotates the ghost 15°');
 await pg.keyboard.press('Escape'); await W(200); ok(await E("HXT.tool==='sel'&&HM.items.length===1&&!HXT.gh"),'Esc cancels PLACE');
 /* SELECT + CARD */
 await E("hxtSelSet([])"); await W(150); let pc=await scr(2.5,.45,2.0); await click(pc); await W(300);
 ok(await E("HXT.sel.length===1&&HXT.sel[0].o===HM.items[0]&&HXT.hl[0].visible"),'click selects the item and shows the selection box');
 const card=await pg.evaluate(()=>{ const c=document.getElementById('hxtCard'); return c&&c.style.display!=='none'?c.innerText:''; });
 ok([/Name|الاسم/,/Type|النوع/,/W × D × H|عرض×عمق×ارتفاع/,/Material|الخامة/,/X \/ Z|س \/ ع/,/Elevation|المنسوب/,/Rotation|الدوران/,/Price|السعر/,/Spec|المواصفة/].every(k=>k.test(card)),'properties card: name, type, dimensions, material, position, rotation, price, spec',card.slice(0,160));
 await pg.evaluate(()=>{ const r=[...document.querySelectorAll('#hxtCard .r')].find(x=>/W × D × H|عرض×عمق×ارتفاع/.test(x.textContent)), i=r.querySelectorAll('input')[0]; i.value='0.6'; i.dispatchEvent(new Event('change')); }); await W(400);
 ok(await E("Math.abs(HM.items[0].w-.6)<1e-6"),'editing W in the card changes the item');
 await pg.mouse.move(p1[0],p1[1],{steps:3}); await W(300); await pg.mouse.move(pc[0],pc[1],{steps:3}); await W(300);
 /* numeric move / rotate / scale */
 await E("hxtTool('move'); HXT.lop={op:'move',ax:'x'}"); await pg.fill('#hxtVcb','0.5'); await pg.press('#hxtVcb','Enter'); await W(400);
 ok(await E("Math.abs(HM.items[0].x-3.0)<1e-6"),'Move: typed 0.5 moves 0.5 m along X',await E("HM.items[0].x"));
 await E("hxtTool('rot')"); await pg.fill('#hxtVcb','90'); await pg.press('#hxtVcb','Enter'); await W(400);
 ok(await E("HM.items[0].r===90"),'Rotate: typed 90 turns it 90°');
 await E("hxtTool('scale')"); const w0=await E("[HM.items[0].w,HM.items[0].d,HM.items[0].h]"); await pg.fill('#hxtVcb','1.5'); await pg.press('#hxtVcb','Enter'); await W(400);
 const w1=await E("[HM.items[0].w,HM.items[0].d,HM.items[0].h]"); ok(w1.every((v,i)=>Math.abs(v-w0[i]*1.5)<2e-3),'Scale: typed 1.5 scales W, D and H',[w0,w1]);
 /* gizmo drag along X */
 await E("hxtTool('move')"); await W(300); const gz=await E("(()=>{ const g=HXT.gz; g.updateMatrixWorld(true); const a=g.userData.mv.children[0].children[1]; const p=new T.Vector3(); a.getWorldPosition(p); const q=p.clone().add(new T.Vector3(1,0,0)); const f=v=>{ const s=v.clone().project(camera), r=renderer.domElement.getBoundingClientRect(); return [r.left+(s.x+1)/2*r.width, r.top+(1-s.y)/2*r.height]; }; return [f(p),f(q),HM.items[0].x]; })()");
 await pg.mouse.move(gz[0][0],gz[0][1],{steps:2}); await W(150); await pg.mouse.down(); await W(80); const dx=gz[1][0]-gz[0][0], dy=gz[1][1]-gz[0][1]; await pg.mouse.move(gz[0][0]+dx*.8,gz[0][1]+dy*.8,{steps:8}); await W(300); await pg.mouse.up(); await W(600);
 const xg=await E("HM.items[0].x"); ok(xg>gz[2]+.3&&xg<gz[2]+1.3,'gizmo: dragging the red arrow moves along X',[gz[2],xg]);
 /* floor drag */
 await E("hxtTool('sel')"); const fz=await E("[HM.items[0].x,HM.items[0].z]"); const pd=await scr(fz[0],.45,fz[1]), pt=await scr(fz[0]-1,.45,fz[1]+.5); await pg.mouse.move(pd[0],pd[1],{steps:2}); await W(100); await pg.mouse.down(); await pg.mouse.move(pt[0],pt[1],{steps:10}); await W(300); await pg.mouse.up(); await W(600);
 const fz2=await E("[HM.items[0].x,HM.items[0].z]"); ok(fz2[0]<fz[0]-.4&&Math.abs(fz2[1]-fz[1])>.1,'drag on the floor moves the selected item',[fz,fz2]);
 /* zoom to selection */
 const d0=await E("camera.position.distanceTo(controls.target)"); await pg.keyboard.press('f'); await W(300);
 ok(await E("(()=>{ const it=HM.items[0]; return Math.hypot(controls.target.x-it.x,controls.target.z-it.z)<.2&&camera.position.distanceTo(controls.target)<"+d0+"; })()"),'F zooms to the selection');
 /* delete disposes + undo / redo */
 await W(600); const g0=await E("renderer.info.memory.geometries"); await pg.keyboard.press('Delete'); await W(900);
 const g1b=await E("renderer.info.memory.geometries"); ok(await E("HM.items.length===0"),'Delete removes the item'); ok(g1b<g0,'Delete frees its GPU geometry',[g0,g1b]);
 await pg.keyboard.press('Control+z'); await W(900); ok(await E("HM.items.length===1&&HM.items[0].t==='chair'"),'Ctrl+Z brings it back (existing undo)');
 await pg.keyboard.press('Control+y'); await W(900); ok(await E("HM.items.length===0"),'Ctrl+Y removes it again');
 await pg.keyboard.press('Control+z'); await W(900);
 /* copy / paste */
 await E("hxtSelSet([{k:'i',o:HM.items[0]}])"); await W(100); await pg.keyboard.press('Control+c'); await pg.keyboard.press('Control+v'); await W(700);
 ok(await E("HM.items.length===2&&HM.items[1].id!==HM.items[0].id&&Math.abs(HM.items[1].x-HM.items[0].x-.5)<1e-6"),'Ctrl+C / Ctrl+V pastes a copy 0.5 m away');
 /* room wall push/pull */
 await E("hxtTool('push'); hxtSelSet([{k:'r',o:HM.rooms[0],p:'we'}],true); HXT.lpp=null;"); await pg.fill('#hxtVcb','0.5'); await pg.press('#hxtVcb','Enter'); await W(500);
 ok(await E("Math.abs(HM.rooms[0].w-5.5)<1e-6"),'Push/Pull on a room wall: typed 0.5 moves the east wall out');
 /* MASSES */
 await E("hxtTool('box')"); await E("controls.target.set(8,0,1)"); await pg.fill('#hxtVcb','2,2,2'); await pg.press('#hxtVcb','Enter'); await W(500);
 const m0=await E("(()=>{ const m=HXT.M[HXT.M.length-1]; return m?[hxtVol(m),m.f.length,hxtClosed(m)]:null; })()"); ok(m0&&Math.abs(m0[0]-8)<1e-6&&m0[1]===6&&m0[2],'Box tool: typed 2,2,2 makes a closed 2×2×2 mass (6 faces, 8 m³)',m0);
 const top=await E("(()=>{ const m=HXT.M[HXT.M.length-1]; return m.f.findIndex(f=>hxtNrm(m,f.o)[1]>.99); })()");
 await E("hxtTool('push'); HXT.lpp=null; hxtSelSet([{k:'m',o:HXT.M[HXT.M.length-1],f:"+top+"}],true)"); await pg.fill('#hxtVcb','1'); await pg.press('#hxtVcb','Enter'); await W(400);
 ok(await E("(()=>{ const m=HXT.M[HXT.M.length-1]; return Math.abs(hxtVol(m)-12)<1e-6&&m.f.length===6; })()"),'Push/Pull top face +1 m: 12 m³, still 6 faces (box stretched)',await E("hxtVol(HXT.M[HXT.M.length-1])"));
 /* mouse push/pull on the top face */
 await E("hxtTool('push')"); await cam('12,7,8','8,1.5,1'); let vm=12, tries=0; for(;tries<3&&vm<=12.1;tries++){ await cam('12,7,8','8,1.5,1'); await W(300); const tp=await scr(8,3,1); await pg.mouse.move(tp[0],tp[1],{steps:3}); await W(400); await pg.mouse.down(); await W(250); await pg.mouse.move(tp[0],tp[1]-30,{steps:4}); await W(250); await pg.mouse.move(tp[0],tp[1]-60,{steps:4}); await W(400); const st=await E("JSON.stringify([HXT.pp&&HXT.pp.d,HXT.cap,HXT.tool,camera.position])"); await pg.mouse.up(); await W(700); vm=await E("hxtVol(HXT.M[HXT.M.length-1])"); if(vm<=12.1)console.log('    (mouse push attempt '+(tries+1)+' missed: '+st+')'); }
 if(tries>1)console.log('    note: mouse push needed '+tries+' attempts (machine load)');
 ok(vm>12.1,'Push/Pull by dragging the face with the mouse grows the mass',vm);
 if(vm>12.1){ await pg.keyboard.press('Control+z'); await W(900); } ok(await E("Math.abs(hxtVol(HXT.M[HXT.M.length-1])-12)<1e-6"),'Ctrl+Z undoes the push/pull on the mass',await E("hxtVol(HXT.M[HXT.M.length-1])"));
 /* offset + push inner face */
 const r1=await E("(()=>{ const m=HXT.M[HXT.M.length-1], V0=hxtVol(m), t=m.f.findIndex(f=>hxtNrm(m,f.o)[1]>.99); const ok1=hxtDo(m,()=>hxtOffset(m,t,.3)); const inner=HXT.lf.fi; const ok2=hxtDo(m,()=>hxtPushPull(m,inner,.5)); return [ok1,ok2,m.f.length,hxtVol(m)-V0,hxtClosed(m)]; })()");
 ok(r1[0]&&r1[1]&&Math.abs(r1[3]-(1.4*1.4*.5))<1e-6&&r1[4],'Offset 0.3 then Push/Pull the inner face +0.5: volume +0.98 m³, still closed',r1);
 const r2=await E("(()=>{ const m=HXT.M[HXT.M.length-1], s=m.f.findIndex(f=>hxtNrm(m,f.o)[2]>.99); const B=hxtBasis(m,m.f[s]), c=m.f[s].o.map(i=>m.v[i]); const cx=c.reduce((a,p)=>a+p[0],0)/c.length, cy=c.reduce((a,p)=>a+p[1],0)/c.length, z=c[0][2]; const v0=hxtVol(m); const a=hxtDo(m,()=>hxtRectOn(m,s,[cx-.4,cy-.4,z],[cx+.4,cy+.4,z])); const b=hxtDo(m,()=>hxtPushPull(m,HXT.lf.fi,-.2)); return [a,b,v0-hxtVol(m),hxtClosed(m)]; })()");
 ok(r2[0]&&r2[1]&&Math.abs(r2[2]-.8*.8*.2)<1e-6&&r2[3],'Rectangle on a side face then push in 0.2: recess removes 0.128 m³',r2);
 const r3=await E("(()=>{ const m=HXT.M[HXT.M.length-1], s=m.f.findIndex(f=>hxtNrm(m,f.o)[0]>.99&&!f.h.length); const L=m.f[s].o.map(i=>m.v[i]); let ys=L.map(p=>p[1]), zs=L.map(p=>p[2]); const x=L[0][0], y0=Math.min(...ys), y1=Math.max(...ys), z0=Math.min(...zs), z1=Math.max(...zs); const n0=m.f.length, v0=hxtVol(m); const a=hxtDo(m,()=>hxtSplit(m,s,[[x,y0,(z0+z1)/2],[x,y1,(z0+z1)/2]])); return [a,m.f.length-n0,Math.abs(hxtVol(m)-v0)<1e-9,hxtClosed(m)]; })()");
 ok(r3[0]&&r3[1]===1&&r3[2]&&r3[3],'Line edge-to-edge splits a face in two (volume unchanged, still closed)',r3);
 const r4=await E("(()=>{ const m=hxtBoxMass(12,1,2,2,1); hxtMs().push(m); hxtMBuild(m); const s=m.f.findIndex(f=>hxtNrm(m,f.o)[1]>.99); const B=hxtBasis(m,m.f[s]); const P=hxtArcPts(B,[11,1,1],[12,1,0],[11.29289,1,.29289],12); const a=hxtDo(m,()=>hxtSplit(m,s,P)); return [a,m.f.length,hxtClosed(m),P.length]; })()");
 ok(r4[0]&&r4[1]===7&&r4[2],'Arc edge-to-edge splits the top face along a 12-segment curve',r4);
 const r5=await E("(()=>{ const pr={id:'pf',n:'',c:0xcccccc,v:[[0,0,6],[0,.4,6],[0,.4,6.3],[0,0,6.3]],f:[{o:[0,1,2,3],h:[]}]}; hxtMs().push(pr); hxtMBuild(pr); const nm=hxtFollow(pr,0,[new T.Vector3(0,0,6),new T.Vector3(4,0,6),new T.Vector3(4,0,9)],false); if(!nm)return null; hxtMs().push(nm); hxtMBuild(nm); return [hxtVol(nm),hxtClosed(nm),nm.f.length]; })()");
 ok(r5&&r5[1]&&Math.abs(Math.abs(r5[0])-.4*.3*(4+3))<.05,'Follow-me sweeps a 0.4×0.3 profile along an L path (≈0.84 m³, closed, mitred)',r5);
 const r6=await E("(()=>{ const m=hxtBoxMass(12,5,1,1,1); hxtMs().push(m); const e=hxtEdges(m).find(q=>Math.abs(m.v[q[0]][0]-m.v[q[1]][0])<1e-9&&Math.abs(m.v[q[0]][2]-m.v[q[1]][2])<1e-9); const v0=hxtVol(m); const a=hxtDo(m,()=>hxtExtend(m,e[0],e[1],[0,1.5,0],[0,1,0])); return [a,hxtVol(m)>v0,hxtClosed(m),Math.max(...m.v.map(p=>p[1]))]; })()");
 ok(r6[0]&&r6[1]&&r6[2]&&Math.abs(r6[3]-1.5)<1e-9,'Extend: a vertical edge reaches the plane y=1.5 (faces fold, stays closed)',r6);
 const r7=await E("(()=>{ const m=hxtBoxMass(15,1,1,1,1); hxtMs().push(m); const ids=m.v.map((p,i)=>i).filter(i=>m.v[i][1]>.5); const a=hxtDo(m,()=>hxtVMove(m,ids,[0,.5,0])); return [a,hxtVol(m)]; })()");
 ok(r7[0]&&Math.abs(r7[1]-1.5)<1e-9,'Move points: lifting the 4 top corners 0.5 m gives 1.5 m³',r7);
 ok(await E("(()=>{ const m=hxtBoxMass(18,1,1,1,1); const t=m.f.findIndex(f=>hxtNrm(m,f.o)[1]>.99); const v=JSON.stringify(m.v); const r=hxtDo(m,()=>hxtPushPull(m,t,-1.5)); return r===false&&JSON.stringify(m.v)===v; })()"),'an impossible push (inside out) is refused and the mass is left as it was');
 ok(await E("(()=>{ const m=HXT.M.find(x=>x.n&&/Box|صندوق/.test(x.n)); const o=hxtMObj(m); return !!o&&o.children[0].isLineSegments&&o.userData.tf.length>0; })()"),'masses are drawn as one mesh + edge lines each, with face lookup for picking');
 /* select a mass face by clicking, card shows face */
 await E("hxtTool('sel')"); await cam('12,7,8','8,1.5,1'); const mf=await scr(8,3.01,1.95); await click(mf); await W(300);
 ok(await E("HXT.sel[0]&&HXT.sel[0].k==='m'&&HXT.sel[0].f>=0&&document.getElementById('hxtCard').innerText.match(/Volume|الحجم/)"),'clicking a mass selects it with the face under the mouse; card shows volume and face');
 /* tape */
 await E("hxtTool('tape')"); const ta=await scr(7,0,2), tb=await scr(9,0,2); await click(ta); await click(tb);
 ok(await E("HXT.tape&&Math.abs(HXT.tape.d-2)<.02"),'Tape measure snaps to the box corners: 2.00 m',await E("HXT.tape&&HXT.tape.d"));
 /* exterior */
 await E("hxtTool('sel'); hxtSelSet([])"); await E("hxtExt(true)"); await W(1500);
 ok(await E("HXE.on&&HXE.g.visible&&scene.background&&scene.background.isTexture&&HXE.rg.children.length===HM.rooms.length*2"),'Exterior view: sky, garden, roof slab + plinth per room');
 await E("hxtCam('corner')"); await W(1200); await pg.screenshot({path:OUT+'/hxt_exterior.png'});
 await E("hxtCam('aerial')"); await W(300); ok(await E("camera.position.y>8"),'Aerial camera preset');
 await E("hxtExt(false)"); await W(800); ok(await E("!HXE.on&&!HXE.g.visible&&!(scene.background&&scene.background===HXE.sky)"),'Exterior view off restores the scene');
 /* screenshot of selection + card */
 await E("hxtTool('sel'); camera.position.set(2.5,6,7.5); controls.target.set(2.5,0,2); controls.update(); hxtSelSet([{k:'i',o:HM.items[0]}]); hxtTool('move')"); await W(800); await pg.screenshot({path:OUT+'/hxt_select.png'});
 /* switching away hides everything */
 await E("(()=>{ const t=WTAB.tabs.find(t=>t.type!=='hx'); if(t)wtSwitch(t.id); else wtNew('gis'); })()"); await W(800); ok(await E("!HXT.mg.visible&&document.getElementById('hxtHint').style.display==='none'"),'leaving H.X hides the tools');
 ok(er.length===0,'no page errors',er.slice(0,5));
 console.log(`\nhxt: ${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0); })().catch(e=>{ console.error(e); process.exit(2); });
