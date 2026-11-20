module.exports=(ok0,near0)=>async function({E,run,ok,near,stubs,count,Q}){
 console.log('== AutoCAD (C.X)');
 const IDS=[['Home','Draw','Region'],['Home','Draw','Ray'],['Home','Modify','Blend'],['Annotate','Text','Single Line'],['Annotate','Text','Find'],['Annotate','Dimensions','Dim Style'],['Annotate','Dimensions','Update'],['Annotate','Leaders','Add Leader'],['Annotate','Leaders','Align'],['Insert','Linking','Hyperlink'],
  ...['Horizontal','Vertical','Fix','Parallel','Perpendicular','Collinear','Equal','Coincident','Concentric'].map(n=>['Parametric','Geometric',n]),...['Linear','Aligned','Radius','Diameter'].map(n=>['Parametric','Dimensional',n]),['Parametric','Manage','Delete Constraints'],['Parametric','Manage','Parameters Manager'],['Parametric','Manage','Show/Hide']];
 const c0=await count('draft'); console.log('  draft stubs/total/built before check:',c0.join('/'));
 // map the 3-tuple (tab,panel,name) to the draft program
 const st=await stubs('draft',IDS); ok(st.every(x=>x===false),'all '+IDS.length+' C.X ids are no longer stubs');
 await E("XC.cad.run(); const D=cadD(); D.ents=[]; D.cons=[]; D.cur='0'; D.th=2.5; D.k=1; CS.sel.clear(); 1");
 const set=(ents,sel)=>E("(()=>{const D=cadD(); D.cons=[]; D.ents="+JSON.stringify(ents)+".map(e=>Object.assign({ly:'0'},e)); CS.sel=new Set("+JSON.stringify(sel||[])+"); persist(); return D.ents.length;})()");
 const ents=()=>E("JSON.stringify(cadD().ents)").then(JSON.parse);
 const undo=()=>E("hiGo(-1)");
 const R=(tab,panel,en,...a)=>run('draft',tab,panel,en,...a);
 const ang=e=>Math.atan2(e.y2-e.y1,e.x2-e.x1), len=e=>Math.hypot(e.x2-e.x1,e.y2-e.y1);
 // Region
 await set([{t:'r',x1:0,y1:0,x2:10,y2:20},{t:'c',x:50,y:0,r:5},{t:'l',x1:0,y1:0,x2:1,y2:1}],[0,1]);
 await R('Home','Draw','Region'); let e=await ents();
 ok(e.length===3&&e.filter(x=>x.rg).length===2,'Region replaces rectangle+circle with 2 region polylines (line untouched)');
 ok(near(e.find(x=>x.p&&x.p.length===4).ar,200,1e-9)&&near(e.find(x=>x.p&&x.p.length===72).ar,Math.PI*25,1e-9),'Region areas 200 (rect 10x20) and pi*r^2 (circle r=5)');
 const svg=await E("cadEntSvg(cadD().ents.find(e=>e.rg),false,false)"); ok(/fill-opacity/.test(svg),'region is drawn filled');
 await undo(); e=await ents(); ok(e.length===3&&e.every(x=>!x.rg),'undo restores the original rectangle/circle');
 // Ray
 await set([]); await R('Home','Draw','Ray','10,10','90'); e=await ents(); ok(e.length===1&&e[0].ray===1&&near(e[0].x2,10,1e-6)&&near(e[0].y2,5010,1e-6),'Ray from 10,10 at 90 deg ends at 10,5010');
 // Blend
 await set([{t:'l',x1:0,y1:0,x2:10,y2:0},{t:'l',x1:30,y1:20,x2:40,y2:20}],[0,1]); await R('Home','Modify','Blend'); e=await ents(); const bl=e[2];
 ok(bl&&bl.t==='pl'&&bl.p.length===25,'Blend adds a 25-vertex polyline'); ok(near(bl.p[0][0],10)&&near(bl.p[0][1],0)&&near(bl.p[24][0],30,1e-6)&&near(bl.p[24][1],20,1e-6),'Blend runs from the nearest ends (10,0) to (30,20)');
 ok(near(Math.atan2(bl.p[1][1]-bl.p[0][1],bl.p[1][0]-bl.p[0][0]),0,0.12)&&near(Math.atan2(bl.p[24][1]-bl.p[23][1],bl.p[24][0]-bl.p[23][0]),0,0.12),'Blend is tangent to both lines at the ends (direction 0 deg)');
 // Single Line
 await set([]); await R('Annotate','Text','Single Line','5,6','C:HELLO','4'); e=await ents(); ok(e.length===1&&e[0].s==='HELLO'&&e[0].h===4&&near(e[0].x,5-5*4*.3,1e-9)&&e[0].y===6,'Single Line adds centred text at height 4');
 // Find
 await set([{t:'tx',x:0,y:0,h:2,s:'Pump Room'},{t:'tx',x:0,y:5,h:2,s:'Valve pump'},{t:'tx',x:0,y:9,h:2,s:'Tank'}]); await R('Annotate','Text','Find','pump'); ok(await E("CS.sel.size")===2,'Find selects the 2 texts containing "pump"');
 await R('Annotate','Text','Find','pump|PUMP-1'); e=await ents(); ok(e[0].s==='PUMP-1 Room'&&e[1].s==='Valve PUMP-1'&&e[2].s==='Tank','Find with replacement rewrites both texts');
 // Dim Style / Update
 await set([{t:'dim',x1:0,y1:0,x2:10,y2:0,off:3,ly:'DIM'},{t:'dim',x1:0,y1:0,x2:25,y2:0,off:3,ly:'DIM'}],[0]);
 await R('Annotate','Dimensions','Dim Style','S1 th=4 k=2 pr=2 suf=mm'); e=await ents(); ok(e[0].ds==='S1'&&e[0].pr===2&&e[0].dh===4&&!e[1].ds,'Dim Style applies to the selected dimension only');
 let s1=await E("cadEntSvg(cadD().ents[0],false,false)"); ok(/>20\.00mm<\/text>/.test(s1)&&/font-size="4"/.test(s1),'dimension 10 x k=2 draws "20.00mm" at height 4');
 await E("CS.sel.clear(); 1"); await R('Annotate','Dimensions','Dim Style','S1 pr=0 suf=m'); e=await ents(); ok(e[0].pr===2,'redefining a style with no selection does not touch dimensions yet');
 await R('Annotate','Dimensions','Update'); e=await ents(); s1=await E("cadEntSvg(cadD().ents[0],false,false)"); ok(e[0].pr===0&&/>20m<\/text>/.test(s1),'Update refreshes the dimension from its style (20m)');
 await undo(); e=await ents(); ok(e[0].pr===2,'undo of Update returns to pr 2');
 // Leaders
 await set([]); await R('Annotate','Leaders','Add Leader','0,0','10,10','A1'); await R('Annotate','Leaders','Add Leader','50,0','60,20','B2'); e=await ents();
 ok(e.length===10&&new Set(e.map(x=>x.g)).size===2&&e.filter(x=>x.lr==='t').length===2,'Add Leader x2: 5 objects each in its own group');
 const ty=()=>ents().then(es=>es.filter(x=>x.lr==='t').map(x=>x.y)); const y0=await ty(); ok(near(y0[1]-y0[0],10),'texts differ by 10 before Align');
 await E("CS.sel=new Set([0,1,2,3,4,5,6,7,8,9]); 1"); await R('Annotate','Leaders','Align'); const y1=await ty(); ok(near(y1[0],y1[1],1e-9),'Align puts both leader texts at the same y'); e=await ents(); ok(near(e[5].y1,0,1e-9)&&near(e[5].y2,10,1e-9),'Align keeps the arrow tip (50,0) and moves the anchor to y=10');
 // Hyperlink
 await set([{t:'l',x1:0,y1:0,x2:5,y2:0}],[0]); await R('Insert','Linking','Hyperlink','https://example.org/spec'); e=await ents(); ok(e[0].hl==='https://example.org/spec','Hyperlink stores the URL');
 await R('Insert','Linking','Hyperlink','javascript:alert(1)'); e=await ents(); ok(e[0].hl==='https://example.org/spec','javascript: links are refused (URL unchanged)');
 await R('Insert','Linking','Hyperlink',''); e=await ents(); ok(!('hl' in e[0]),'empty URL removes the link');
 // ---- constraints
 const cons=()=>E("JSON.stringify(cadD().cons)").then(JSON.parse);
 await set([{t:'l',x1:0,y1:0,x2:10,y2:3}],[0]); await R('Parametric','Geometric','Horizontal'); e=await ents(); ok(near(e[0].y1,e[0].y2,1e-9)&&near(len(e[0]),Math.hypot(10,3),1e-9),'Horizontal makes the line horizontal, same length');
 await set([{t:'l',x1:0,y1:0,x2:4,y2:10}],[0]); await R('Parametric','Geometric','Vertical'); e=await ents(); ok(near(e[0].x1,e[0].x2,1e-9),'Vertical makes the line vertical');
 await set([{t:'l',x1:0,y1:0,x2:10,y2:0},{t:'l',x1:0,y1:5,x2:10,y2:9}],[0,1]); await R('Parametric','Geometric','Parallel'); e=await ents(); ok(near(ang(e[1]),0,1e-9),'Parallel rotates the 2nd line to angle 0');
 await set([{t:'l',x1:0,y1:0,x2:10,y2:0},{t:'l',x1:3,y1:2,x2:9,y2:8}],[0,1]); await R('Parametric','Geometric','Perpendicular'); e=await ents(); ok(near(Math.abs(Math.sin(ang(e[1]))),1,1e-9),'Perpendicular makes the 2nd line vertical (|sin|=1)');
 await set([{t:'l',x1:0,y1:0,x2:10,y2:0},{t:'l',x1:0,y1:5,x2:6,y2:5}],[0,1]); await R('Parametric','Geometric','Equal'); e=await ents(); ok(near(len(e[0]),8,1e-9)&&near(len(e[1]),8,1e-9),'Equal averages the two lengths to 8');
 await set([{t:'l',x1:0,y1:0,x2:10,y2:0},{t:'l',x1:0,y1:5,x2:6,y2:5}],[0,1]); await R('Parametric','Geometric','Fix'); await E("CS.sel=new Set([0,1]); 1"); await R('Parametric','Geometric','Equal'); e=await ents(); ok(near(len(e[0]),10)&&near(len(e[1]),6),'Equal does not move two fixed lines (residual reported)');
 await set([{t:'l',x1:0,y1:0,x2:10,y2:0},{t:'l',x1:20,y1:5,x2:30,y2:9}],[0,1]); await E("CS.sel=new Set([0]); 1"); await R('Parametric','Geometric','Fix'); await E("CS.sel=new Set([0,1]); 1"); await R('Parametric','Geometric','Coincident'); e=await ents(); ok(near(e[1].x1,10,1e-9)&&near(e[1].y1,0,1e-9)&&near(e[1].x2,30)&&near(e[1].y2,9),'Coincident with a fixed line moves only the other line\'s nearest end'); 
 await set([{t:'l',x1:0,y1:0,x2:10,y2:0},{t:'l',x1:2,y1:3,x2:7,y2:4}],[0,1]); await R('Parametric','Geometric','Collinear'); e=await ents(); ok(near(e[1].y1,0,1e-9)&&near(e[1].y2,0,1e-9)&&near(e[1].x1,2)&&near(e[1].x2,7),'Collinear projects the 2nd line onto the 1st (y=0, x kept)');
 await set([{t:'c',x:0,y:0,r:3},{t:'c',x:8,y:9,r:2}],[0,1]); await R('Parametric','Geometric','Concentric'); e=await ents(); ok(near(e[1].x,0)&&near(e[1].y,0)&&e[1].r===2,'Concentric moves the 2nd circle centre to (0,0)');
 // dimensional + live re-solve
 await set([{t:'l',x1:0,y1:0,x2:6,y2:8}],[0]); await R('Parametric','Dimensional','Aligned','20'); e=await ents(); ok(near(len(e[0]),20,1e-9)&&near(e[0].x2,12,1e-9)&&near(e[0].y2,16,1e-9),'Aligned dimension scales the line to length 20 about its start');
 await set([{t:'c',x:0,y:0,r:3}],[0]); await R('Parametric','Dimensional','Diameter','14'); e=await ents(); ok(near(e[0].r,7),'Diameter 14 -> r = 7');
 await R('Parametric','Dimensional','Radius','4'); e=await ents(); ok(near(e[0].r,4),'Radius 4 -> r = 4 (the later constraint wins; d1 is superseded in the list)');
 await set([{t:'l',x1:0,y1:0,x2:12,y2:0}],[0]); await R('Parametric','Dimensional','Linear','9'); e=await ents(); ok(near(e[0].x2,9),'Linear 9 -> horizontal extent 9');
 await R('Parametric','Manage','Parameters Manager','d1=15'); e=await ents(); ok(near(e[0].x2,15,1e-9),'Parameters Manager "d1=15" re-solves: extent 15'); ok((await E("JSON.stringify(PCX.last.head)"))===JSON.stringify(['name','type','objects','value','residual'])&&(await E("PCX.last.rows.length"))===1,'Parameters Manager lists 1 constraint in a table');
 // live: a command that commits after editing a constrained line re-applies the solver
 await E("cadD().ents[0].x2=40; cadCommit(); 1"); e=await ents(); ok(near(e[0].x2,15,1e-9),'solver runs on every cadCommit: editing x2 to 40 snaps back to the constrained 15');
 await set([{t:'l',x1:0,y1:0,x2:10,y2:0},{t:'l',x1:0,y1:5,x2:10,y2:5}],[0,1]); await R('Parametric','Geometric','Parallel'); await E("(()=>{const D=cadD(); D.ents[1].y2=9; cadCommit();})()"); e=await ents(); ok(near(ang(e[1]),0,1e-9),'moving an end of a parallel line is corrected live (stays parallel)');
 // Delete / Show-Hide
 await E("CS.sel=new Set([0]); 1"); await R('Parametric','Manage','Show/Hide'); const g1=await E("cadEntSvg(cadD().ents[0],false,false)"); ok(/data-cons/.test(g1)&&/\/\//.test(g1),'Show/Hide: constraint glyph "//" drawn on the constrained line');
 await R('Parametric','Manage','Show/Hide'); ok(!/data-cons/.test(await E("cadEntSvg(cadD().ents[0],false,false)")),'second Show/Hide hides the glyphs');
 await E("CS.sel=new Set([0,1]); 1"); await R('Parametric','Manage','Delete Constraints'); ok((await cons()).length===0,'Delete Constraints removes them (0 left)');
 await E("(()=>{const D=cadD(); D.ents[1].y2=9; cadCommit();})()"); e=await ents(); ok(near(e[1].y2,9),'after deletion the line stays where it is put');
 const c1=await count('draft'); console.log('  draft stubs/total/built after:',c1.join('/')); ok(c1[0]===35,'C.X stubs 61 -> 35 (26 made real)');
};
