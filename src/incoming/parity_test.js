/* Playwright test for parity_cad.js / parity_rvt.js / parity_p6.js (126 checks). Usage: NODE_PATH=<dir with playwright-core> node parity_test.js [file:///path/index.html] [cad|rvt|p6 ...]  (default page: ../../index.html next to src/, built with the chunks in). CHROME=<path> overrides Chrome.
   Every command is run from its ribbon id (found by program/tab/panel/name) and a concrete number or structure is asserted. prompt() answers come from the queue Q. */
const {chromium}=require('playwright-core');
const URL=process.argv[2]&&!/^(cad|rvt|p6)$/.test(process.argv[2])?process.argv[2]:'file://'+require('path').resolve(__dirname,'../../index.html'); const SECT={};
const ONLY=process.argv.slice(2).filter(a=>/^(cad|rvt|p6)$/.test(a));
const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0, fail=0; const Q=[];
const ok=(c,m)=>{ if(c){ pass++; console.log('  ok   '+m); } else { fail++; console.log('  FAIL '+m); } };
const near=(a,b,t)=>Math.abs(a-b)<=(t||1e-6);
SECT.cad=async function({E,run,ok,near,stubs,count,Q}){
 console.log('== AutoCAD (C.X)');
 const IDS=[['Home','Draw','Boundary'],['Home','Modify','Edit Polyline'],['Home','Annotation','Mtext'],['Home','Layers','Make Current'],['Home','Layers','Match'],['Home','Properties','Color'],['Home','Groups','Group'],['Home','Groups','Ungroup'],['Home','Clipboard','Copy Clip'],['Home','Clipboard','Cut'],['Home','Clipboard','Paste'],['Annotate','Dimensions','Baseline'],['Annotate','Dimensions','Continue'],['Annotate','Dimensions','Diameter']];
 const st=await stubs('draft',IDS); ok(st.every(x=>x===false),'all 14 CAD ids are no longer stubs'); const c=await count('draft'); console.log('  draft stubs/total/built:',c.join('/'));
 await E("XC.cad.run(); const D=cadD(); D.ents=[]; D.cur='0'; D.th=2.5; D.k=1; CS.sel.clear(); 1");
 const set=(ents,sel)=>E("(()=>{const D=cadD(); D.ents="+JSON.stringify(ents)+".map(e=>Object.assign({ly:'0'},e)); CS.sel=new Set("+JSON.stringify(sel||[])+"); persist(); return D.ents.length;})()");
 const ents=()=>E("JSON.stringify(cadD().ents)").then(JSON.parse);
 const undo=async()=>{ await E("hiGo(-1)"); };
 // Boundary
 const L4=(x0,y0,x1,y1)=>[{t:'l',x1:x0,y1:y0,x2:x1,y2:y0},{t:'l',x1:x1,y1:y0,x2:x1,y2:y1},{t:'l',x1:x1,y1:y1,x2:x0,y2:y1},{t:'l',x1:x0,y1:y1,x2:x0,y2:y0}];
 await set([{t:'r',x1:0,y1:0,x2:100,y2:100},...L4(20,20,60,60)]); const n0=(await ents()).length;
 await run('draft','Home','Draw','Boundary','30,30'); let e=await ents(); let bd=e[e.length-1];
 ok(e.length===n0+1&&bd.t==='pl'&&bd.cl===true&&bd.p.length===4,'Boundary inside 4 lines makes a closed 4-vertex polyline');
 const area=p=>{let s=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s)/2;};
 ok(near(area(bd.p),1600,1e-6),'Boundary area of the inner loop = 1600 (40 x 40)');
 await run('draft','Home','Draw','Boundary','10,10'); e=await ents(); bd=e[e.length-1]; ok(near(area(bd.p),10000,1e-6),'Boundary at a point in the outer rectangle only = 10000');
 const nb=(await ents()).length; await run('draft','Home','Draw','Boundary','500,500'); ok((await ents()).length===nb,'Boundary outside every loop adds nothing');
 await undo(); ok((await ents()).length===nb-1,'undo (hiGo -1) removes the last boundary');
 // Edit Polyline
 await set([{t:'pl',p:[[0,0],[5,0],[10,0],[10,10]],cl:false}],[0]);
 await run('draft','Home','Modify','Edit Polyline','S'); e=await ents(); ok(e[0].p.length===3&&e[0].p[1][0]===10&&e[0].p[1][1]===0,'Edit Polyline Simplify drops the collinear vertex (4 -> 3)');
 await run('draft','Home','Modify','Edit Polyline','C'); e=await ents(); ok(e[0].cl===true,'Edit Polyline Close sets cl');
 await run('draft','Home','Modify','Edit Polyline','R'); e=await ents(); ok(e[0].p[0][0]===10&&e[0].p[0][1]===10&&e[0].p[2][0]===0,'Edit Polyline Reverse flips vertex order');
 await run('draft','Home','Modify','Edit Polyline','O'); e=await ents(); ok(e[0].cl===false,'Edit Polyline Open clears cl');
 await undo(); e=await ents(); ok(e[0].cl===true,'undo restores the closed state');
 // Mtext
 await set([]); await run('draft','Home','Annotation','Mtext','10,20','AB|CD|EF'); e=await ents();
 ok(e.length===3&&e.every(x=>x.t==='tx'),'Mtext makes 3 text objects'); ok(near(e[0].y,20)&&near(e[1].y,20-3.75)&&near(e[2].y,20-7.5)&&e[0].s==='AB'&&e[2].s==='EF','Mtext lines stack down at 1.5 x text height');
 ok(e[0].g&&e[0].g===e[1].g&&e[1].g===e[2].g,'Mtext lines share one group id');
 // Make Current / Match / Color
 await set([{t:'l',x1:0,y1:0,x2:5,y2:0,ly:'DIM'},{t:'l',x1:0,y1:1,x2:5,y2:1},{t:'l',x1:0,y1:2,x2:5,y2:2,ly:'HIDDEN'}],[0]);
 await run('draft','Home','Layers','Make Current'); ok(await E("cadD().cur")==='DIM','Make Current takes the layer of the selected object');
 await E("CS.sel=new Set([0,1,2])"); await run('draft','Home','Layers','Match'); e=await ents(); ok(e[0].ly==='HIDDEN'&&e[1].ly==='HIDDEN'&&e[2].ly==='HIDDEN','Match moves the first objects to the layer of the LAST selected one');
 await E("CS.sel=new Set([1])"); await run('draft','Home','Properties','Color','#00ff00'); ok(await E("cadCol(cadD().ents[1])")==='#00ff00','Color sets an object colour (cadCol)');
 await run('draft','Home','Properties','Color','bylayer'); ok(await E("cadCol(cadD().ents[1])")===await E("cadLay('HIDDEN').c"),'BYLAYER returns to the layer colour');
 await E("CS.sel=new Set([1])"); const before=await E("cadCol(cadD().ents[1])"); await run('draft','Home','Properties','Color','red'); ok(await E("cadCol(cadD().ents[1])")===before,'Color rejects a bad value');
 // Group / Ungroup + group-aware pick
 await set([{t:'l',x1:0,y1:0,x2:50,y2:0},{t:'l',x1:0,y1:20,x2:50,y2:20},{t:'l',x1:0,y1:40,x2:50,y2:40},{t:'l',x1:0,y1:80,x2:50,y2:80}],[0,1,2]);
 await run('draft','Home','Groups','Group','GA'); e=await ents(); ok(e[0].g==='GA'&&e[1].g==='GA'&&e[2].g==='GA'&&!e[3].g,'Group tags exactly the 3 selected objects');
 await E("CS.sel.clear(); cadPick([25,0.1],false)"); ok(await E("CS.sel.size")===3,'picking one member selects the whole group');
 await E("cadPick([25,0.1],true)"); ok(await E("CS.sel.size")===0,'shift-pick on a member removes the whole group');
 await E("CS.sel=new Set([0])"); await run('draft','Home','Groups','Ungroup'); e=await ents(); ok(e.every(x=>!x.g),'Ungroup clears the group from every member');
 // Clipboard
 await set([{t:'r',x1:10,y1:10,x2:20,y2:30},{t:'c',x:50,y:50,r:5,ly:'CENTER'}],[0,1]);
 await run('draft','Home','Clipboard','Copy Clip'); ok(await E("cadD().ents.length")===2,'Copy Clip leaves the drawing unchanged');
 await run('draft','Home','Clipboard','Paste','100,100'); e=await ents(); ok(e.length===4,'Paste adds the 2 clipped objects');
 ok(near(e[2].x1,100)&&near(e[2].y1,100)&&near(e[2].x2,110)&&near(e[2].y2,120),'pasted rectangle lands at (100,100)-(110,120)'); ok(near(e[3].x,140)&&near(e[3].y,140)&&e[3].r===5&&e[3].ly==='CENTER','pasted circle keeps relative position, radius and layer');
 await undo(); ok(await E("cadD().ents.length")===2,'undo removes the pasted objects');
 await E("CS.sel=new Set([0])"); await run('draft','Home','Clipboard','Cut'); ok(await E("cadD().ents.length")===1,'Cut removes the selection');
 await run('draft','Home','Clipboard','Paste','0,0'); e=await ents(); ok(e.length===2&&near(e[1].x1,0)&&near(e[1].y2,20),'Paste after Cut restores the rectangle at the new point');
 await E("CS.sel.clear()"); const Q0=Q.length; await run('draft','Home','Clipboard','Cut'); ok(await E("cadD().ents.length")===2,'Cut with nothing selected does nothing');
 // Dimensions
 await set([{t:'dim',x1:0,y1:0,x2:50,y2:0,off:5,ly:'DIM'}],[0]); await E("cadD().k=2");
 await run('draft','Annotate','Dimensions','Baseline','80,0'); e=await ents(); let d1=e[1];
 ok(d1&&d1.x1===0&&d1.x2===80&&near(d1.off,5+3*2.5),'Baseline keeps the first point and steps the offset by 3 x text height'); ok(near(await E("dimGeo(cadD().ents[1]).v"),160),'Baseline value = 80 x unit factor 2 = 160');
 await run('draft','Annotate','Dimensions','Continue','120,0'); e=await ents(); let d2=e[2];
 ok(d2.x1===80&&d2.x2===120&&near(d2.off,d1.off),'Continue starts at the previous second point on the same offset'); ok(near(await E("dimGeo(cadD().ents[2]).v"),80),'Continue value = 40 x 2 = 80');
 await set([{t:'c',x:5,y:5,r:7}],[0]); await E("cadD().k=1"); await run('draft','Annotate','Dimensions','Diameter'); e=await ents(); ok(e.length===2&&e[1].t==='dim'&&e[1].pre==='Ø','Diameter adds a dimension with the diameter sign');
 ok(near(await E("dimGeo(cadD().ents[1]).v"),14,1e-9),'Diameter value = 2 x radius = 14'); ok((await E("cadEntSvg(cadD().ents[1],false,false)")).includes('Ø14'),'Diameter text renders as "Ø14"');
 await undo(); ok(await E("cadD().ents.length")===1,'undo removes the diameter dimension');
};

SECT.rvt=async function({E,run,ok,near,stubs,count,Q}){
 console.log('== Revit (R.X)');
 const IDS=[['Modify','Modify','Move'],['Modify','Modify','Copy'],['Modify','Modify','Rotate'],['Modify','Modify','Mirror'],['Modify','Modify','Array'],['Modify','Modify','Scale'],['Modify','Modify','Offset'],['Modify','Modify','Trim/Extend'],['Modify','Modify','Split'],['Modify','Modify','Pin'],['Architecture','Model','Model Group'],['Annotate','Tag','Tag All'],['Structure','Structure','Beam System'],['Manage','Settings','Purge Unused']];
 ok((await stubs('model',IDS)).every(x=>x===false),'all 14 Revit ids are no longer stubs'); console.log('  model stubs/total/built:',(await count('model')).join('/'));
 const seed=(els,sel)=>E("(()=>{ RV.els="+JSON.stringify(els)+".map(e=>Object.assign({lv:0},e)); RV.hist=[]; PXR.ids="+JSON.stringify(sel||[])+".slice(); RV.sel=PXR.ids[0]||null; rvChanged(); return RV.els.length; })()");
 const els=()=>E("JSON.stringify(RV.els)").then(JSON.parse), by=(a,id)=>a.find(e=>e.id===id);
 const W=(id,a,b)=>({id,k:'wall',a,b,h:3,t:.2}), C=(id,p)=>({id,k:'col',p,w:.4,d:.4,h:3});
 const undo=()=>E("XC.rv_undo.run()");
 // Move
 await seed([W('w1',[0,0],[4,0]),{id:'d1',k:'door',w:'w1',p:1,W:.9,H:2.1},C('c1',[9,9])],['w1']);
 await run('model','Modify','Modify','Move','2,3'); let a=await els(); ok(near(by(a,'w1').a[0],2)&&near(by(a,'w1').a[1],3)&&near(by(a,'w1').b[0],6)&&near(by(a,'w1').b[1],3),'Move shifts a wall by (2,3)'); ok(by(a,'d1').p===1&&by(a,'d1').w==='w1','the hosted door stays at p=1 on its wall (so it moves with it)');
 await undo(); a=await els(); ok(near(by(a,'w1').a[0],0)&&near(by(a,'w1').b[1],0),'rv_undo reverts the move');
 // Copy
 await run('model','Modify','Modify','Copy','10,0'); a=await els(); ok(a.length===5,'Copy adds the wall and its door (3 -> 5)'); const nw=a.find(e=>e.k==='wall'&&e.id!=='w1'), nd=a.find(e=>e.k==='door'&&e.id!=='d1');
 ok(nw&&near(nw.a[0],10)&&near(nw.b[0],14)&&nd&&nd.w===nw.id&&nd.p===1,'the copy is 10 m away and its door is hosted by the copied wall'); ok(near(by(a,'w1').a[0],0),'the original is untouched');
 // Rotate (+ rectangle skipped at 45)
 await seed([W('w1',[0,0],[4,0])],['w1']);
 await run('model','Modify','Modify','Rotate','90'); a=await els(); let w=by(a,'w1'); ok(near(w.a[0],2)&&near(w.a[1],-2)&&near(w.b[0],2)&&near(w.b[1],2),'Rotate 90 deg turns the wall about the selection centre'); 
 await seed([{id:'f1',k:'floor',a:[0,0],b:[4,2],t:.2}],['f1']); await run('model','Modify','Modify','Rotate','90'); a=await els(); ok(near(by(a,'f1').a[0],3)&&near(by(a,'f1').a[1],-1)&&near(by(a,'f1').b[0],1)&&near(by(a,'f1').b[1],3),'a floor rectangle rotates by 90 deg about its own centre (corners swap to a diagonal pair)');
 await seed([W('w1',[0,0],[4,0]),{id:'f1',k:'floor',a:[0,0],b:[5,5],t:.2}],['w1','f1']); await run('model','Modify','Modify','Rotate','45'); a=await els(); ok(near(by(a,'f1').a[0],0)&&near(by(a,'f1').b[1],5)&&!near(by(a,'w1').b[1],0),'45 deg rotates the wall but leaves the rectangle floor alone');
 // Mirror
 await seed([W('w1',[1,0],[3,0]),C('c1',[2,5])],['w1','c1']); await run('model','Modify','Modify','Mirror','x=0'); a=await els(); ok(a.length===4,'Mirror (copy) adds 2 elements');
 const mw=a.find(e=>e.k==='wall'&&e.id!=='w1'), mc=a.find(e=>e.k==='col'&&e.id!=='c1'); ok(mw&&near(mw.a[0],-1)&&near(mw.b[0],-3)&&mc&&near(mc.p[0],-2)&&near(mc.p[1],5),'mirrored wall and column are reflected about x=0'); ok(near(by(a,'w1').a[0],1),'the original stays');
 await seed([C('c1',[2,5])],['c1']); await run('model','Modify','Modify','Mirror','z=1 move'); a=await els(); ok(a.length===1&&near(a[0].p[1],-3),'Mirror with "move" reflects in place (z 5 -> -3)'); await seed([C('c1',[2,5])],['c1']); await run('model','Modify','Modify','Mirror','q=1'); ok((await els()).length===1&&near((await els())[0].p[1],5),'Mirror rejects a bad axis');
 // Array
 await seed([C('c1',[0,0])],['c1']); await run('model','Modify','Modify','Array','4,2,0'); a=await els(); ok(a.length===4&&[...a.map(e=>e.p[0])].sort((x,y)=>x-y).join()==='0,2,4,6','Array 4 x 2 m gives columns at x = 0, 2, 4, 6');
 // Scale
 await seed([C('c1',[0,0]),C('c2',[2,0])],['c1','c2']); await run('model','Modify','Modify','Scale','3'); a=await els(); ok(near(by(a,'c1').p[0],-2)&&near(by(a,'c2').p[0],4),'Scale x3 about the centre (1,0): x -> -2 and 4');
 // Offset
 await seed([W('w1',[0,0],[4,0])],['w1']); await run('model','Modify','Modify','Offset','0.5'); a=await els(); let ow=a.find(e=>e.id!=='w1'); ok(a.length===2&&near(ow.a[1],.5)&&near(ow.b[1],.5)&&near(ow.b[0],4),'Offset 0.5 puts a parallel wall at z = 0.5 with the same length');
 await seed([W('w1',[0,0],[4,0])],['w1']); await run('model','Modify','Modify','Offset','-0.5'); a=await els(); ok(near(a.find(e=>e.id!=='w1').a[1],-.5),'a negative distance offsets to the other side');
 // Trim/Extend
 await seed([W('w1',[0,0],[3,0]),W('w2',[5,3],[5,1])],['w1','w2']); await run('model','Modify','Modify','Trim/Extend'); a=await els(); ok(near(by(a,'w1').b[0],5)&&near(by(a,'w1').b[1],0)&&near(by(a,'w2').b[1],0)&&near(by(a,'w2').a[1],3),'Trim/Extend joins two walls at their crossing (5,0): one extends 2 m, the other 1 m');
 await seed([W('w1',[0,0],[7,0]),W('w2',[5,1],[5,3])],['w1','w2']); await run('model','Modify','Modify','Trim/Extend'); a=await els(); ok(near(by(a,'w1').b[0],5)&&near(by(a,'w2').a[1],0),'a wall running past the crossing is trimmed back (7 m -> 5 m)');
 await seed([W('w1',[0,0],[3,0]),W('w2',[0,2],[3,2])],['w1','w2']); await run('model','Modify','Modify','Trim/Extend'); a=await els(); ok(near(by(a,'w1').b[0],3)&&near(by(a,'w2').b[0],3),'parallel walls are refused and unchanged');
 // Split
 await seed([W('w1',[0,0],[6,0]),{id:'d1',k:'door',w:'w1',p:4.5,W:.9,H:2.1},{id:'n1',k:'window',w:'w1',p:1,W:1,H:1,sill:.9}],['w1']); await run('model','Modify','Modify','Split','3'); a=await els(); const sw=a.find(e=>e.k==='wall'&&e.id!=='w1');
 ok(sw&&near(by(a,'w1').b[0],3)&&near(sw.a[0],3)&&near(sw.b[0],6),'Split cuts a 6 m wall into 3 m + 3 m'); ok(by(a,'d1').w===sw.id&&near(by(a,'d1').p,1.5)&&by(a,'n1').w==='w1'&&near(by(a,'n1').p,1),'the door moves to the new wall at p=1.5, the window stays at p=1');
 await seed([W('w1',[0,0],[6,0])],['w1']); await run('model','Modify','Modify','Split','9'); ok((await els()).length===1,'a split point outside the wall is refused');
 // Pin
 await seed([W('w1',[0,0],[4,0]),{id:'d1',k:'door',w:'w1',p:1,W:.9,H:2.1}],['w1']); await run('model','Modify','Modify','Pin'); a=await els(); ok(by(a,'w1').pin===true,'Pin marks the element');
 await run('model','Modify','Modify','Move','5,5'); a=await els(); ok(near(by(a,'w1').a[0],0),'Move skips a pinned wall'); await E("XC.rv_del.run()"); ok((await els()).length===2,'Delete refuses a pinned wall');
 await run('model','Modify','Modify','Pin'); a=await els(); ok(!by(a,'w1').pin,'a second Pin unpins'); await E("XC.rv_del.run()"); ok((await els()).length===0,'once unpinned Delete removes the wall and its door');
 // Model Group
 await seed([W('w1',[0,0],[4,0]),C('c1',[9,9])],['w1','c1']); await run('model','Architecture','Model','Model Group','G1'); a=await els(); ok(by(a,'w1').grp==='G1'&&by(a,'c1').grp==='G1','Model Group tags both elements');
 await E("PXR.ids=[]; RV.sel='w1'"); await run('model','Modify','Modify','Move','1,1'); a=await els(); ok(near(by(a,'w1').a[0],1)&&near(by(a,'c1').p[0],10)&&near(by(a,'c1').p[1],10),'moving one member moves the whole group');
 await E("PXR.ids=['w1','c1']; RV.sel='w1'"); await run('model','Architecture','Model','Model Group',''); a=await els(); ok(!by(a,'w1').grp&&!by(a,'c1').grp,'an empty name ungroups');
 // Tag All
 await seed([W('w1',[0,0],[4,0]),W('w2',[0,5],[4,5]),C('c1',[2,2]),{id:'d1',k:'door',w:'w1',p:1,W:.9,H:2.1},{id:'r1',k:'room',a:[0,0],b:[4,5],n:'Kitchen'}],[]);
 await run('model','Annotate','Tag','Tag All'); a=await els(); let tg=a.filter(e=>e.k==='tag'); ok(tg.length===5,'Tag All makes 5 tags'); ok(['W1','W2','C1','D1','Kitchen'].every(s=>tg.some(t=>t.s===s)),'labels are W1, W2, C1, D1 and the room name');
 const tw=tg.find(t=>t.host==='w1'), td=tg.find(t=>t.host==='d1'); ok(near(tw.p[0],2)&&near(tw.p[1],0),'a wall tag sits at the wall mid-point'); ok(near(td.p[0],1)&&near(td.p[1],0),'a door tag sits on its wall at p = 1');
 await E("RV.els.find(e=>e.id==='w1').a=[0,1]; RV.els.find(e=>e.id==='w1').b=[4,1]"); await run('model','Annotate','Tag','Tag All'); a=await els(); ok(a.filter(e=>e.k==='tag').length===5&&near(a.find(e=>e.k==='tag'&&e.host==='w1').p[1],1),'a second Tag All refreshes tags (still 5) and follows the moved wall');
 ok(await E("RV.g.children.some(c=>c.userData.rv===RV.els.find(e=>e.k==='tag').id)"),'the tag is drawn in the 3D scene');
 // Beam System
 await seed([{id:'f1',k:'floor',a:[0,0],b:[6,4],t:.2}],['f1']); await run('model','Structure','Structure','Beam System','1.5,z'); a=await els(); let bm=a.filter(e=>e.k==='beam'); ok(bm.length===3&&bm.map(b=>b.a[0]).sort((x,y)=>x-y).join()==='1.5,3,4.5','Beam System: 6 m wide at 1.5 m gives beams at x = 1.5, 3, 4.5'); ok(bm.every(b=>near(Math.hypot(b.b[0]-b.a[0],b.b[1]-b.a[1]),4)),'each beam spans the 4 m depth');
 await undo(); ok((await els()).filter(e=>e.k==='beam').length===0,'rv_undo removes the beam system');
 await run('model','Structure','Structure','Beam System','1.5,x'); a=await els(); bm=a.filter(e=>e.k==='beam'); ok(bm.length===2&&near(bm[0].a[1],4/3)&&near(bm[1].a[1],8/3)&&near(bm[0].b[0],6),'direction x: 4 m deep at 1.5 m gives 2 beams 1.333 m apart running 6 m');
 // Purge Unused
 await seed([W('w1',[0,0],[4,0]),{id:'d1',k:'door',w:'w1',p:1,W:.9,H:2.1},{id:'d2',k:'door',w:'ghost',p:1,W:.9,H:2.1},{id:'t1',k:'tag',host:'ghost',s:'X',p:[0,0]},W('z1',[3,3],[3,3]),{id:'n9',k:'window',w:'z1',p:0,W:.5,H:.5,sill:1}],[]);
 await run('model','Manage','Settings','Purge Unused'); a=await els(); ok(a.length===2&&!!by(a,'w1')&&!!by(a,'d1'),'Purge removes the orphan door, orphan tag, zero-length wall and its window (6 -> 2)'); await run('model','Manage','Settings','Purge Unused'); ok((await els()).length===2,'a second Purge removes nothing');
};

SECT.p6=async function({E,run,ok,near,stubs,count,Q}){
 console.log('== Primavera (P.X)');
 const IDS=[['Edit','Edit','Add'],['Edit','Edit','Delete'],['Edit','Edit','Dissolve'],['Edit','Assign','Resources'],['Edit','Assign','Predecessors'],['Edit','Assign','Successors'],['Edit','Find','Replace'],['Tools','Schedule','Level Resources'],['Tools','Schedule','Apply Actuals'],['Tools','Schedule','Recalculate Assignment Costs'],['Tools','Schedule','Summarize'],['Tools','Analysis','Global Change']];
 ok((await stubs('sched',IDS)).every(x=>x===false),'all 12 P6 ids are no longer stubs'); console.log('  sched stubs/total/built:',(await count('sched')).join('/'));
 const A=id=>E("JSON.stringify((()=>{const a=ACT.find(x=>x.id==='"+id+"'); return a&&{id:a.id,d:a.d,es:a.es,ef:a.ef,pct:a.pct||0,crew:a.crew,as:a.as,af:a.af,cs:a.cs,res:a.res,cost:a.cost,rcost:a.rcost,n:a.n,preds:a.preds,after:a.after,custom:a.custom,sDate:a.sDate,fDate:a.fDate,rd:a.rd};})())").then(JSON.parse);
 const N=()=>E("ACT.length"); const sel=id=>E("PS.sel="+JSON.stringify(id)); const calc=()=>E("computeSched(); persist(); PS.pf");
 const iso=ms=>new Date(ms).toISOString().slice(0,10);
 await E("computeSched(); persist(); 1");
 // Add / Delete / Dissolve
 const n0=await N(); await sel('A1'); await run('sched','Edit','Edit','Add'); let a=await A(await E("PS.sel"));
 ok(await N()===n0+1&&a.custom&&a.after.join()==='A1','Add creates a custom activity after the selected one ('+n0+' -> '+(n0+1)+', after A1)'); await E('hiGo(-1)'); ok(await N()===n0,'undo removes the added activity'); await sel('A1'); await run('sched','Edit','Edit','Add'); const x1=await E('PS.sel'); a=await A(x1); await run('sched','Edit','Edit','Add'); const x2=await E("PS.sel"); await run('sched','Edit','Edit','Add'); const x3=await E("PS.sel");
 await E("computeSched(); 1"); const x3es0=(await A(x3)).es, x1a=await A(x1), x2a=await A(x2); ok(x3es0===x1a.ef+x2a.d,'the chain X1 -> X2 -> X3 starts X3 after both durations');
 await sel(x2); await run('sched','Edit','Edit','Dissolve'); await E("computeSched(); 1"); a=await A(x3); const x1b=await A(x1);
 ok(await E("!ACT.some(x=>x.id==='"+x2+"')")&&a.preds.some(p=>p.id===x1&&p.type==='FS')&&!a.preds.some(p=>p.id===x2),'Dissolve removes X2 and links X3 straight to X1'); ok(a.es===x1b.ef,'X3 now starts when X1 finishes (it moved earlier by the dissolved duration '+x2a.d+')'); ok(await E("!ACT.some(x=>(x.preds||[]).some(p=>p.id==='"+x2+"'))"),'no activity still points at the dissolved one');
 await sel(x3); await run('sched','Edit','Edit','Delete'); ok(!(await E("ACT.some(x=>x.id==='"+x3+"')")),'Delete removes the selected custom activity'); await sel('M0'); const nn=await N(); await run('sched','Edit','Edit','Delete'); ok(await N()===nn,'a milestone is not deleted');
 // Predecessors / Successors
 await sel(x1); await run('sched','Edit','Assign','Predecessors','A3,SS,2'); await E("computeSched(); 1"); a=await A(x1); const a3=await A('A3');
 ok(a.preds.some(p=>p.id==='A3'&&p.type==='SS'&&p.lag===2)&&a.preds.length===2,'Predecessors adds A3 SS+2 beside A1'); ok(a.es===a3.es+2,'X1 now starts 2 working days after A3 starts (es = '+a.es+')');
 const before=JSON.stringify((await A(x1)).preds); await sel('A1'); await run('sched','Edit','Assign','Predecessors',x1); ok(JSON.stringify((await A('A1')).preds)===JSON.stringify([{id:'M0',type:'FS',lag:0}]),'a predecessor that would close a loop is refused'); await sel(x1); await run('sched','Edit','Assign','Predecessors','NOPE'); ok(JSON.stringify((await A(x1)).preds)===before,'an unknown activity id is refused');
 await run('sched','Edit','Assign','Successors','B1,FS,1'); await E("computeSched(); 1"); const b1=await A('B1'), x1c=await A(x1); ok(b1.preds.some(p=>p.id===x1&&p.type==='FS'&&p.lag===1)&&b1.es>=x1c.ef+1,'Successors makes B1 follow X1 with lag 1');
 // Resources and costs
 await sel('A2'); await run('sched','Edit','Assign','Resources','LAB,4,150'); await run('sched','Edit','Assign','Resources','EXC,1,900'); a=await A('A2');
 ok(a.res.length===2&&await E("DATA.p6x.res.LAB.rate")===150&&await E("DATA.p6x.res.EXC.rate")===900,'Resources: two assignments on A2 and the resource dictionary holds the rates'); await run('sched','Edit','Assign','Resources','ZZZ,2'); ok((await A('A2')).res.length===2&&!(await E("DATA.p6x.res.ZZZ")),'a new resource without a rate is refused');
 await sel('A3'); await run('sched','Edit','Assign','Resources','LAB,2'); await run('sched','Tools','Schedule','Recalculate Assignment Costs'); a=await A('A2'); const a3c=await A('A3');
 ok(near(a.cost,4*a.d*150+1*a.d*900,1e-9),'cost of A2 = (4 x 150 + 1 x 900) x '+a.d+' d = '+a.cost); ok(near(a3c.cost,2*a3c.d*150,1e-9),'A3 re-uses LAB at 150 (no rate typed): cost = '+a3c.cost); ok(await E("PS.costTot")===a.cost+a3c.cost,'the project total is the sum ('+(a.cost+a3c.cost)+')');
 await E("ACT.find(x=>x.id==='A3').pct=50; 1"); await run('sched','Tools','Schedule','Recalculate Assignment Costs'); ok(near((await A('A3')).rcost,2*1*150,1e-9),'at 50 % the remaining cost of A3 uses the remaining 1 day (300)'); await E("ACT.find(x=>x.id==='A3').pct=0; 1");
 // Global Change
 const snap=()=>E("JSON.stringify(ACT.map(a=>[a.id,a.wbs,a.t,a.crew,a.pct||0]))").then(JSON.parse); const s0=await snap();
 await run('sched','Tools','Analysis','Global Change','crew=3 where wbs=2'); const s1=await snap(); ok(s1.every((r,i)=>r[1]==='2'&&r[2]!=='ms'?r[3]===3:r[3]===s0[i][3]),'Global Change crew=3 hits only the non-milestone activities of WBS 2 ('+s1.filter(r=>r[1]==='2').length+')');
 await run('sched','Tools','Analysis','Global Change','crew=11 where name~excavation'); ok((await A('A2')).crew===11&&(await snap()).filter(r=>r[3]===11).length===1,'a "name~" filter changes only A2'); const s2=await snap(); await run('sched','Tools','Analysis','Global Change','pct=150'); await run('sched','Tools','Analysis','Global Change','foo=1'); ok(JSON.stringify(await snap())===JSON.stringify(s2),'pct above 100 and an unknown field are refused');
 await run('sched','Tools','Analysis','Global Change','crew=4 where id=ZZ9'); ok(JSON.stringify(await snap())===JSON.stringify(s2),'no match changes nothing');
 // Replace
 await run('sched','Edit','Find','Replace','Base slab|Foundation slab'); ok((await A('B1')).n[0].startsWith('Foundation slab')&&(await A('B3')).n[0].startsWith('Foundation slab')&&(await A('B4')).n[0].startsWith('Well wall'),'Replace renames the 3 "Base slab" activities and no others'); ok(await E("DATA.sched.act.B1.n[0].startsWith('Foundation slab')"),'the new name is in the saved schedule data');
 await E("hiGo(-1)"); ok((await A('B1')).n[0].startsWith('Base slab'),'undo (hiGo -1) restores the old name'); await run('sched','Edit','Find','Replace','qqqq|x');
 // Apply Actuals
 const dd=(await A('B4')).es+3; await E("PS.dd=ISO(wdDate("+dd+")); computeSched(); persist(); 1"); const pre={b4:await A('B4'),b7:await A('B7'),a3:await A('A3'),b5:await A('B5')};
 await run('sched','Tools','Schedule','Apply Actuals'); const post={b4:await A('B4'),b7:await A('B7'),a3:await A('A3'),b5:await A('B5')};
 ok(post.a3.pct===100&&post.a3.af===iso(pre.a3.fDate)&&post.a3.as===iso(pre.a3.sDate),'a finished activity (A3) becomes 100 % with actual dates = planned'); ok(post.b4.pct===Math.round((dd-pre.b4.es)/pre.b4.d*100)&&post.b4.pct===38,'B4 crossing the data date by 3 of its 8 days gets 38 %'); ok(post.b7.pct===43&&post.b5.pct===0,'B7 (3 of 7 days) gets 43 %; B5 starts after the data date and stays 0');
 ok(post.b4.es===pre.b4.es,'actual start keeps B4 at its planned start'); await E("hiGo(-1)"); ok((await A('B4')).pct===0&&(await A('A3')).as===undefined,'undo clears the actuals again');
 // Summarize (after the data-date reset)
 await E("PS.dd='2026-12-05'; computeSched(); persist(); 1"); await run('sched','Tools','Schedule','Summarize'); const sum=await E("JSON.stringify(DATA.p6x.sum)").then(JSON.parse), rows=await E("JSON.stringify(ACT.map(a=>({w:a.wbs,s:a.sDate,f:a.fDate,es:a.es,ef:a.ef,d:a.d,pct:a.pct||0,cost:a.cost||0})))").then(JSON.parse);
 let allOk=true; for(const w of Object.keys(sum)){ const l=rows.filter(r=>r.w===w), s=Math.min(...l.map(r=>r.s)), f=Math.max(...l.map(r=>r.f)), dsum=l.reduce((t,r)=>t+r.d,0), pw=l.reduce((t,r)=>t+r.d*r.pct/100,0); if(sum[w].start!==iso(s)||sum[w].finish!==iso(f)||sum[w].n!==l.length||sum[w].dur!==Math.max(...l.map(r=>r.ef))-Math.min(...l.map(r=>r.es))||!near(sum[w].pct,dsum?pw/dsum*100:0,1e-9)||!near(sum[w].cost,l.reduce((t,r)=>t+r.cost,0),1e-9))allOk=false; }
 ok(Object.keys(sum).length===4&&allOk,'Summarize: 4 WBS rows match start, finish, count, duration, % and cost computed independently'); ok(near(Object.values(sum).reduce((t,r)=>t+r.cost,0),(await E("PS.costTot")),1e-9),'summary cost adds up to the project assignment cost');
 // Level Resources
 const lim=await E("Math.max(...ACT.map(a=>+a.crew||0))"); const peak=()=>E("(()=>{computeSched(); const u={}; ACT.forEach(a=>{ if(a.t!=='ms')for(let k=a.es;k<a.es+a.d;k++)u[k]=(u[k]||0)+(+a.crew||0); }); return Math.max(...Object.values(u));})()");
 const pf0=await calc(), pk0=await peak(); ok(pk0>lim,'before: the daily peak '+pk0+' exceeds the limit '+lim); await run('sched','Tools','Schedule','Level Resources',String(lim));
 const pk1=await peak(), pf1=await E("PS.pf"); ok(pk1<=lim,'after levelling the daily peak is '+pk1+' <= '+lim); ok(pf1>=pf0,'the finish moved from '+pf0+' to '+pf1+' working days (never earlier)');
 ok(await E("ACT.every(a=>(a.preds||[]).every(p=>{const q=ACT.find(x=>x.id===p.id); const t=p.type||'FS', L=+p.lag||0; return t==='FS'?a.es>=q.ef+L:t==='SS'?a.es>=q.es+L:true;}))"),'every Finish-to-Start / Start-to-Start link still holds'); const lv=await E("ACT.filter(a=>a.cs&&a.cs.lv).length"); ok(lv>0,lv+' activities carry a levelling constraint');
 await run('sched','Tools','Schedule','Level Resources',String(lim)); ok(await E("PS.pf")===pf1&&await E("ACT.filter(a=>a.cs&&a.cs.lv).length")===lv,'running it twice gives the same result');
 await E("hiGo(-1)"); await E("hiGo(-1)"); ok(await E("ACT.filter(a=>a.cs&&a.cs.lv).length")===0&&await calc()===pf0,'undo removes the levelling constraints and the finish returns to '+pf0);
};

(async()=>{
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:860}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-cdeaud','xto-rv'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept(Q.length?Q.shift():'1'));
 await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await E("window.__run=(ty,tab,panel,en)=>{ const id=Object.keys(RIBM).find(k=>{const m=RIBM[k];return m.type===ty&&m.tab===tab&&m.panel===panel&&m.en===en;}); if(!id)throw new Error('no ribbon entry '+en); XC[id].run(); return id; }; window.__stub=(ty,tab,panel,en)=>{ const id=Object.keys(RIBM).find(k=>{const m=RIBM[k];return m.type===ty&&m.tab===tab&&m.panel===panel&&m.en===en;}); return !!(XC[id]&&XC[id].stub); }; 1");
 const run=async(ty,tab,panel,en,...answers)=>{ Q.push(...answers); return E("__run("+JSON.stringify([ty,tab,panel,en]).slice(1,-1)+")"); };
 const stubs=async(ty,list)=>{ const r=[]; for(const l of list){ r.push(await E("__stub('"+ty+"',"+JSON.stringify(l).slice(1,-1)+")")); } return r; };
 const count=async ty=>E("(()=>{let s=0,t=0;for(const k in RIBM){if(RIBM[k].type==='"+ty+"'){t++;if(XC[k]&&XC[k].stub)s++;}}return [s,t,RIBP['"+ty+"'].built];})()");
 const want=s=>!ONLY.length||ONLY.includes(s);
 if(want('cad')) await SECT.cad({E,run,ok,near,stubs,count,Q});
 if(want('rvt')) await SECT.rvt({E,run,ok,near,stubs,count,Q});
 if(want('p6')) await SECT.p6({E,run,ok,near,stubs,count,Q});
 console.log('page errors:',er.length?er.slice(0,3):'none'); ok(er.length===0,'no page errors');
 console.log('\n'+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0);
})();
