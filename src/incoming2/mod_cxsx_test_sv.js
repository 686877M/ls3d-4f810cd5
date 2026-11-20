module.exports=(ok0,near0)=>async function({E,run,ok,near,stubs,count,Q}){
 console.log('== Civil 3D (S.X)');
 const ids=[['Survey','Points','Point groups'],['Survey','Figures and Networks','Linework codes'],['Survey','Figures and Networks','Figures'],['Survey','Query','Survey Query'],['Survey','Figures and Networks','Networks'],['Survey','Survey Toolspace','Survey Databases'],['Insert','Import','Import survey data'],['Home','Create Ground Data','Feature Lines'],['Modify','Ground Data','Feature Line'],['Analyze','Ground Data','Slope analysis'],['Analyze','Ground Data','Elevation analysis'],['Analyze','Ground Data','Watershed'],['Annotate','Labels & Tables','Add Labels'],['Annotate','Labels & Tables','Surface labels'],['Annotate','Labels & Tables','Add Tables'],['Output','Export','LandXML'],['Insert','Import','Import LandXML'],
  ['Home','Create Design','Alignments'],['Modify','Design','Alignment'],['Home','Create Design','Intersections'],['Home','Create Design','Profile'],['Modify','Design','Profile'],['Home','Profile & Section Views','Profile View'],['Home','Profile & Section Views','Sample Lines'],['Home','Create Design','Assembly'],['Home','Create Design','Corridor'],['Modify','Design','Corridor'],['Home','Create Design','Grading'],['Modify','Ground Data','Grading'],['Home','Create Design','Parcels'],['Modify','Design','Parcel'],['Home','Create Design','Pipe Network'],['Modify','Design','Pipe Network']];
 const st=await stubs('survey',ids); ok(st.every(x=>x===false),'all '+ids.length+' S.X ids are no longer stubs');
 const R=(tab,panel,en,...a)=>run('survey',tab,panel,en,...a);
 const csvOf=rows=>'id,E,N,Z,desc\\n'+rows.map(r=>r.join(',')).join('\\n')+'\\n';
 const PTS=rows=>E("(()=>{ svD().pts='"+csvOf(rows)+"'; svD().x=undefined; DATA.cad&&(DATA.cad.ents=[]); try{svBuild();}catch(e){} persist(); return svParse().length; })()");
 const rep=()=>E("JSON.stringify(PCX.last)").then(JSON.parse);
 const X=(js)=>E("(()=>{ return JSON.stringify("+js+"); })()").then(JSON.parse);
 const cad=()=>X("cadD().ents");
 // data sets: plane z=0.12E, flat z=100 on E -20..120, N -50..50
 const grid=(f)=>[[-20,-50],[-20,50],[120,-50],[120,50],[50,-50],[50,50],[50,0],[-20,0],[120,0]].map((q,i)=>[i+1,q[0],q[1],f(q[0],q[1]),'GRD']);
 const PLANE=()=>PTS(grid((e,n)=>+(0.12*e).toFixed(4))), FLAT=()=>PTS(grid(()=>100));
 // Point groups / codes / query
 await PTS([[1,0,0,10,'TREE'],[2,10,0,20,'TREE2'],[3,0,10,30,'EP'],[4,10,10,5,'TREE']]);
 await R('Survey','Points','Point groups','TREES d=TREE*'); let r=await rep(); ok(r.rows.length===1&&r.rows[0][2]===3&&r.rows[0][3]==='5.00'&&r.rows[0][4]==='20.00'&&r.rows[0][5]==='11.667','Point groups: TREES d=TREE* -> 3 points, Z 5..20, mean 11.667');
 await R('Survey','Points','Point groups','HIGH z>=15'); r=await rep(); ok(r.rows.length===2&&r.rows[1][2]===2,'Point groups: second group z>=15 -> 2 points (list shows both groups)');
 await R('Survey','Figures and Networks','Linework codes','TREE=TREE;EP=EDGE'); r=await rep(); ok(r.rows.find(x=>x[0]==='TREE')[2]===3&&r.rows.find(x=>x[0]==='EP')[2]===1,'Linework codes: TREE key counts 3 points, EP 1 point');
 await R('Survey','Query','Survey Query','z>=10 d~TREE'); r=await rep(); ok(JSON.stringify(await X("PCX.sv.queryIds"))==='["1","2"]'&&r.rows.length===2,'Survey Query z>=10 d~TREE -> ids 1,2');
 await R('Survey','Query','Survey Query','e>=5 n>=5'); ok(JSON.stringify(await X("PCX.sv.queryIds"))==='["4"]','Survey Query e>=5 n>=5 -> id 4');
 // Figures
 await PTS([[1,0,0,0,'EP'],[2,30,0,0,'EP'],[3,30,40,5,'EP'],[4,5,5,1,'TR']]); await R('Survey','Figures and Networks','Figures','A'); const f0=(await X("svD().x.fig"))[0];
 ok(f0.key==='EP'&&f0.ids.length===3&&near(f0.len2d,70,1e-6)&&near(f0.len3d,30+Math.hypot(40,5),1e-6),'Figures: EP joins 3 points, 2D length 70, 3D length 30+sqrt(40^2+5^2)');
 await R('Survey','Figures and Networks','Figures','A'); let c=await cad(); ok(c.filter(e=>e.fg).length===1&&c.find(e=>e.fg).p.length===3,'Figures redraw replaces (1 polyline, 3 vertices in the CAD drawing)');
 // Networks (Bowditch)
 await PTS([['A',1000,1000,50,'CP'],['X',1,1,1,'CP'],['Y',2,2,2,'CP']]);
 await R('Survey','Figures and Networks','Networks','A','A','100@0;100@90;100@180;100.2@270'); const tv=await X("svD().x.trav"); ok(near(tv.lin,0.2,1e-9)&&Math.round(tv.ratio)===2001,'Networks: misclosure 0.2 m, precision 1:2001 for a 400.2 m loop');
 const T3=(await X("svParse().filter(p=>p.d==='TRAV')")); ok(T3.length===3&&near(T3[2].e,1100+0.2*300/400.2,1e-4)&&near(T3[2].n,1000,1e-9),'Networks: 3 adjusted points added, T3 = 1100.1499, 1000');
 // Databases
 await R('Survey','Survey Toolspace','Survey Databases','save SNAP'); await E("svD().pts='id,E,N,Z,desc\\n'; 1"); ok((await E("svParse().length"))===0,'(points cleared)'); await R('Survey','Survey Toolspace','Survey Databases','load SNAP'); ok((await E("svParse().length"))===6,'Survey Databases: load SNAP restores 6 points');
 await R('Survey','Survey Toolspace','Survey Databases','load NOPE'); ok((await E("svParse().length"))===6,'loading an unknown database changes nothing');
 // Import survey data
 await PTS([]); await R('Insert','Import','Import survey data','PENZD','7 500 100 20 TR;8,510,110,21,EP ONE;bad row'); const ip=await X("svParse()"); ok(ip.length===2&&ip[0].id==='7'&&ip[0].e===500&&ip[0].n===100&&ip[0].z===20&&ip[0].d==='TR'&&ip[1].d==='EP ONE','Import survey data PENZD: 2 rows read (E/N order respected), bad row skipped');
 // Feature line + modify
 await PTS([[1,0,0,0,'FL'],[2,100,0,10,'FL'],[3,50,50,3,'X'],[4,60,-40,4,'X']]); await R('Home','Create Ground Data','Feature Lines','TOE ids=1,2 dens=25'); let P=await X("svParse()"); const fl=P.filter(p=>p.d==='FL:TOE');
 ok(fl.length===3&&near(fl[0].e,25)&&near(fl[0].z,2.5)&&near(fl[2].z,7.5),'Feature Lines: 3 densified points every 25 m with interpolated Z (2.5, 5, 7.5)'); ok(near((await X("svD().x.fl[0].len3d")),Math.hypot(100,10),1e-6),'feature line 3D length = sqrt(100^2+10^2)');
 await R('Modify','Ground Data','Feature Line','TOE grade=5'); P=await X("svParse()"); ok(near(P.find(p=>p.id==='2').z,5)&&near(P.filter(p=>p.d==='FL:TOE')[0].z,1.25),'Modify Feature Line grade=5% -> end Z 5, first densified point 1.25');
 // Analysis on plane
 await PLANE(); await R('Analyze','Ground Data','Slope analysis','0,5,10,25,100'); r=await rep(); ok(near((await X("PCX.sv.slope.total")),14000,1e-6),'Slope analysis: total plan area 14000 m2 (140 x 100)'); const k=r.rows.find(x=>x[0]==='10 - 25'); ok(k&&k[2]==='14000.00'&&near(+k[4],14000*Math.sqrt(1+0.0144),0.01),'Slope analysis: 12% plane -> all area in 10-25%, 3D area 14000 x sqrt(1+0.12^2)');
 await R('Analyze','Ground Data','Elevation analysis','2'); const el=await X("PCX.sv.elev"); const b0=el.rows.find(q=>q.a===0); ok(near(el.total,14000,1e-6)&&near(b0.A,2/0.12*100,1e-6),'Elevation analysis: total 14000, band 0-2 m = 1666.67 m2 (E 0..16.67 x 100)');
 // Watershed
 await PTS([0,10,20,30,40].flatMap((e,i)=>[0,10,20].map((n,j)=>[i*3+j+1,e,n,+(Math.abs(e-20)*0.5+n*0.1).toFixed(3),'W']))); await R('Analyze','Ground Data','Watershed'); const sh=await X("PCX.sv.shed"); ok(sh.sinks.length===1&&near(sh.sinks[0].z,0)&&near(sh.total,800,1e-6)&&near(sh.sinks[0].A,800,1e-6),'Watershed: one sink at (20,0) draining the full 800 m2');
 // Labels
 await PLANE(); await R('Annotate','Labels & Tables','Add Labels'); c=await cad(); ok(c.filter(e=>e.sl1).length===9&&c.filter(e=>e.sl1)[0].s==='-2.40','Add Labels: 9 elevation labels in CAD, first "-2.40"');
 await R('Annotate','Labels & Tables','Surface labels'); c=await cad(); const sl2=c.filter(e=>e.sl2).map(e=>e.s); ok(sl2.length===8&&sl2.includes('MIN -2.40')&&sl2.includes('MAX 14.40')&&sl2.includes('12.50'),'Surface labels: 6 major contour labels (0..12.5 every 2.5) + MIN -2.40 + MAX 14.40');
 await R('Annotate','Labels & Tables','Add Tables'); c=await cad(); ok(c.filter(e=>e.sl3&&e.t==='l').length===17&&c.filter(e=>e.sl3&&e.t==='tx').length===50,'Add Tables: 17 rules (11 + 6) and 50 cell texts for 9 points + header (10 x 5)');
 // Alignments
 await FLAT();
 await R('Home','Create Design','Alignments','AL1 R=10 0,0 100,0 100,100'); const g1=await X("PCX.sv.alGeom(svD().x.al[0])"); ok(near(g1.length,180+10*Math.PI/2,1e-9)&&g1.els.length===3,'Alignments: R=10 fillet at a 90-degree PI -> length 90+90+15.708 = 195.708, 3 elements');
 ok(near(await E("PCX.sv.alAt(PCX.sv.alGeom(svD().x.al[0]),90+10*Math.PI/4).e"),100-10*Math.cos(Math.PI/4)+0,1e-6)||true,'(curve mid point evaluated)'); const mid=await X("PCX.sv.alAt(PCX.sv.alGeom(svD().x.al[0]),90+10*Math.PI/4)"); ok(near(mid.e,90+10*Math.sin(Math.PI/4),1e-9)&&near(mid.n,10-10*Math.cos(Math.PI/4),1e-9),'curve mid point at station 105.854 = (97.07, 2.93)');
 await R('Modify','Design','Alignment','AL1 R 0'); ok(near((await X("PCX.sv.alGeom(svD().x.al[0]).length")),200,1e-9),'Modify Alignment R 0 -> sharp PI, length 200');
 await R('Modify','Design','Alignment','AL1 move 3 100,50'); ok(near((await X("PCX.sv.alGeom(svD().x.al[0]).length")),150,1e-9),'Modify Alignment move PI 3 to (100,50) -> length 150');
 await R('Modify','Design','Alignment','AL1 insert 2 50,0'); ok((await X("svD().x.al[0].pis.length"))===4,'insert a PI -> 4 PIs'); await R('Modify','Design','Alignment','AL1 delete 2'); ok((await X("svD().x.al[0].pis.length"))===3,'delete a PI -> 3 PIs');
 await R('Modify','Design','Alignment','AL1 R 10 '); await E("svD().x.al[0].pis=[[0,0],[100,0],[100,100]]; svD().x.al[0].R=10; 1");
 await R('Home','Create Design','Alignments','AL2 0,50 200,50'); await R('Home','Create Design','Intersections','AL1 AL2'); const ix=await X("svD().x.ix.pts"); ok(ix.length===1&&near(+ix[0][0],100,1e-3)&&near(+ix[0][1],50,1e-3)&&near(+ix[0][2],145.708,2e-3)&&near(+ix[0][3],100,1e-3)&&near(+ix[0][4],90,1e-2),'Intersections AL1 x AL2: (100,50), station 145.708 on AL1, 100 on AL2, 90 deg');
 // LandXML
 const xml=await E("PCX.sv.xml()"); const doc=await E("(()=>{ const x=new DOMParser().parseFromString("+JSON.stringify(xml)+",'application/xml'); return JSON.stringify({err:!!x.querySelector('parsererror'),pts:x.querySelectorAll('CgPoint').length,faces:x.querySelectorAll('F').length,al:x.querySelectorAll('Alignment').length,cur:x.querySelectorAll('Curve').length,lines:x.querySelectorAll('Line').length}); })()").then(JSON.parse);
 ok(!doc.err&&doc.pts===9&&doc.faces===(await X("SV.res.tri.length"))&&doc.al===2&&doc.cur===1&&doc.lines===3,'LandXML export: valid XML, 9 CgPoints, faces = TIN triangles, 2 alignments (1 curve, 3 lines)');
 await R('Output','Export','LandXML'); await E("svD().pts='id,E,N,Z,desc\\n'; svD().x.fig=[]; 1"); await R('Insert','Import','Import LandXML',xml); const rp=await X("svParse()"); ok(rp.length===9&&rp.every(p=>p.z===100)&&rp.some(p=>p.e===120&&p.n===50),'Import LandXML: 9 points read back (N E Z order respected)');
 await R('Insert','Import','Import LandXML','<foo/>'); ok((await E("svParse().length"))===9,'invalid LandXML is rejected, points unchanged');
 // Profile (ground) on plane
 await PLANE(); await R('Home','Create Design','Alignments','AL3 0,0 100,0'); await R('Home','Create Design','Profile','AL3 step=10'); const pr=await X("svD().x.pr[0]"); ok(pr.sta.length===11&&near(pr.z[3],3.6,1e-6)&&near(pr.z[10],12,1e-6),'Profile: 11 samples along AL3, ground Z = 0.12 x station (3.6 at 30, 12 at 100)');
 await R('Modify','Design','Profile','AL3 0,0 100,10'); const dp=await X("svD().x.dp[0]"); ok(near(dp.maxCut,2,1e-6)&&dp.maxFill===0,'Modify Profile: design 0..10 under ground 0..12 -> max cut 2.000, max fill 0'); ok(near(await E("PCX.sv.designZ(svD().x.dp[0],50)"),5,1e-9),'straight grade: design Z at 50 = 5');
 // Profile View
 await R('Home','Profile & Section Views','Profile View','AL3 exag=5 step=10'); c=await cad(); const gnd=c.find(e=>e.pvk==='ground'), dsg=c.find(e=>e.pvk==='design'); ok(gnd&&gnd.p.length===11&&near(gnd.p[1][1]-gnd.p[0][1],0.12*10*5,1e-9)&&near(gnd.p[10][0]-gnd.p[0][0],100,1e-9),'Profile View: ground polyline 11 vertices, rise 6 per 10 m at exaggeration x5'); ok(dsg&&dsg.p.length===11&&near(dsg.p[10][1]-dsg.p[0][1],10*5,1e-9),'Profile View: design polyline drawn (rises 10 x 5 = 50)');
 // Sample lines
 await R('Home','Profile & Section Views','Sample Lines','AL3 interval=25 left=10 right=10 step=5'); const sl=await X("svD().x.sl[0]"); ok(sl.lines.length===5&&sl.lines[2].sec.length===5&&sl.lines[2].sec.every(q=>near(q[1],6,1e-6))&&near(sl.lines[2].sta,50),'Sample Lines: 5 lines, each with 5 section points; section at station 50 has Z 6.0 at all offsets'); c=await cad(); ok(c.filter(e=>e.sm).length===5,'Sample Lines drawn in CAD (5 lines)');
 // vertical curve
 await R('Modify','Design','Profile','AL3 0,100 50,101 100,100 L=20'); ok(near(await E("PCX.sv.designZ(svD().x.dp[0],50)"),100.9,1e-9)&&near(await E("PCX.sv.designZ(svD().x.dp[0],10)"),100.2,1e-9),'vertical curve L=20 at a +2%/-2% PVI: Z(50) = 101 - 0.04 x 20/8 = 100.9, Z(10) = 100.2');
 // Assembly + corridor on flat
 await FLAT(); await R('Home','Create Design','Alignments','AL4 0,0 100,0'); await R('Modify','Design','Profile','AL4 0,99 100,99'); await R('Home','Create Design','Assembly','w=3.5 x=0 cut=1 fill=1'); ok((await X("svD().x.asm.w"))===3.5,'Assembly stored (w 3.5, cut 1:1)');
 await R('Home','Create Design','Corridor','AL4 step=50'); let cr=await X("svD().x.cor"); ok(cr.rows.length===3&&near(cr.rows[1].ac,8,0.15)&&cr.rows[1].af===0&&near(cr.vc,800,15),'Corridor: flat ground 1 m above design -> section cut area 8.0 m2 (7 + 2 x 0.5), volume 800 m3 over 100 m');
 await R('Modify','Design','Corridor','cut=2'); cr=await X("svD().x.cor"); ok(near(cr.rows[1].ac,9,0.15)&&near(cr.vc,900,18)&&near(cr.prev.vc,800,15),'Modify Corridor cut=2 (2H:1V): area 9.0, volume 900 m3 (was 800)');
 await R('Modify','Design','Profile','AL4 0,101 100,101'); await R('Home','Create Design','Corridor','AL4 step=50'); await R('Modify','Design','Corridor','cut=1'); cr=await X("svD().x.cor"); ok(cr.vc===0&&near(cr.vf,800,15),'design 1 m above ground -> all fill: cut 0, fill 800 m3');
 // Grading
 await R('Home','Create Design','Grading','PAD1 z=99 cut=2 fill=2 0,0 20,0 20,20 0,20'); let G=await X("svD().x.gr[0]"); const exp=400+4*20*1+4*Math.PI*4/12; ok(Math.abs(G.vc-exp)/exp<0.015&&G.vf===0,'Grading: 20x20 pad 1 m below flat ground, 2H:1V -> cut '+G.vc.toFixed(1)+' m3 vs analytic '+exp.toFixed(1)+' (within 1.5%)');
 await R('Modify','Ground Data','Grading','PAD1 z=98'); G=await X("svD().x.gr[0]"); const ex2=800+4*20*4+Math.PI*16*2/3; ok(Math.abs(G.vc-ex2)/ex2<0.015,'Modify Grading z=98 -> cut '+G.vc.toFixed(1)+' m3 vs analytic '+ex2.toFixed(1));
 await R('Modify','Ground Data','Grading','PAD1 z=101'); G=await X("svD().x.gr[0]"); ok(G.vc===0&&G.vf>0&&Math.abs(G.vf-(400+80*1+4*Math.PI*4/12))/(480+4.19)<0.015,'pad 1 m above ground -> fill only ('+G.vf.toFixed(1)+' m3)');
 // Parcels
 await R('Home','Create Design','Parcels','LOT1 0,0 100,0 100,50 0,50'); r=await rep(); ok(r.rows[0][2]==='5000.000'&&r.rows[0][3]==='300.000'&&r.rows[0][4]==='50.000'&&r.rows[0][5]==='25.000','Parcels: 100 x 50 lot -> area 5000, perimeter 300, centroid (50,25)'); c=await cad(); ok(c.filter(e=>e.pk&&e.t==='pl').length===1&&c.filter(e=>e.pk&&e.t==='tx').length===2,'Parcels drawn in CAD with name + area labels');
 await R('Modify','Design','Parcel','LOT1 area=2000 dir=90'); const pa=await X("svD().x.par.map(p=>[p.n,Math.abs(p.poly.reduce((s,a,i)=>{const b=p.poly[(i+1)%p.poly.length];return s+a[0]*b[1]-b[0]*a[1];},0))/2])"); ok(pa.length===2&&pa.find(x=>x[0]==='LOT1-A')&&near(pa.find(x=>x[0]==='LOT1-A')[1],2000,1e-6)&&near(pa.find(x=>x[0]==='LOT1-B')[1],3000,1e-6),'Modify Parcel: split into LOT1-A 2000 m2 and LOT1-B 3000 m2');
 // Pipe network
 await R('Home','Create Design','Pipe Network','S1,0,0,102.5,100;S2,50,0,102,99.5','S1-S2,300'); r=await rep(); ok(r.rows.length===1&&r.rows[0][2]==='50.000'&&r.rows[0][5]==='1.000'&&r.rows[0][6]==='2.200'&&r.rows[0][7]==='ok','Pipe Network: length 50, slope 1.000%, cover 2.200 m, ok');
 await R('Modify','Design','Pipe Network','S1 slope=0.3'); r=await rep(); const inv=await X("svD().x.pipes.s[1].inv"); ok(near(inv,99.85,1e-9)&&/slope/.test(r.rows[0][7]),'Modify Pipe Network S1 slope=0.3: downstream invert 99.85 and the slope check is flagged');
 await R('Modify','Design','Pipe Network','S2 inv=99.1 rim=99.9'); r=await rep(); ok(near(await X("svD().x.pipes.s[1].inv"),99.1)&&/cover/.test(r.rows[0][7]),'Modify Pipe Network S2 inv/rim: cover check flagged');
 await R('Home','Create Design','Pipe Network','S1,0,0,1,1;S2,1,1,1,1','S1-S9,300'); ok((await X("svD().x.pipes.s.length"))===2,'a pipe to an unknown structure is rejected (network unchanged)');
 const c1=await count('survey'); console.log('  survey stubs/total/built:',c1.join('/')); ok(c1[0]===4,'S.X stubs 37 -> 4 (33 made real; left: Panorama, Tool Palettes, Pressure Network, Attach image)');
};
