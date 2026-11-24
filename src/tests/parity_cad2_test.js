// C.X parity (c_parity_cad2.js): every new command run once with its real inputs. node pw/parity_cad2_test.js file://$PWD/site/index.test.html
const {open}=require('./lib');
(async()=>{ const {b,p,E,errs}=await open(process.argv[2]); let ok=0,bad=0; const t=(c,n)=>{c?ok++:bad++;console.log((c?'  ok   ':'  FAIL ')+n);};
 const J=async s=>JSON.parse(await E(s));
 await E(`window.__ans=[]; window.prompt=(m,d)=>__ans.length?__ans.shift():d; window.R=(tab,panel,en)=>XC[PXX.id('draft',tab,panel,en)].run(); XC.cad.run(); const D=cadD(); D.ents=[]; D.cons=[]; 1`);
 // gradient + wipeout
 let r=await J(`(()=>{ const D=cadD(); cadAdd({t:'r',x1:0,y1:0,x2:20,y2:10}); CS.sel=new Set([0]); __ans=['#ff0000,#0000ff,45']; R('Home','Draw','Gradient'); const g=D.ents.find(e=>e.gr); cadRender();
  __ans=['0,0 5,0 5,5']; CS.sel.clear(); R('Annotate','Markup','Wipeout'); return JSON.stringify({g:!!g&&g.gr[2]===45, svg:/linearGradient/.test(CW.querySelector('#cg').innerHTML), wo:D.ents.some(e=>e.wo&&e.p.length===3), behind:D.ents.indexOf(g)<D.ents.findIndex(e=>e.t==='r')}); })()`);
 t(r.g&&r.svg&&r.behind,'Gradient: fill behind the boundary, drawn as linearGradient'); t(r.wo,'Wipeout from typed points');
 // attributes + block editor
 r=await J(`(()=>{ const D=cadD(); D.ents=[]; __ans=['TAG1|Pump tag|P-0','2,2']; R('Home','Block','Define Attributes'); cadAdd({t:'l',x1:0,y1:0,x2:10,y2:0}); D.blocks={PB:D.ents.map(e=>JSON.parse(JSON.stringify(e)))}; D.ents=[];
  __ans=['P-101']; PXC2.binsert('PB',[100,0],1,0); PXC2.binsert('PB',[200,0],2,0,{TAG1:'P-102'}); const v1=D.ents.filter(e=>e.attv).map(e=>e.s);
  __ans=['PB']; R('Insert','Block','Edit Block'); const inEd=!!D.bedit&&D.ents.length===2; cadAdd({t:'c',x:5,y:5,r:1}); R('Insert','Block','Edit Block');
  const cs=D.ents.filter(e=>e.t==='c'); return JSON.stringify({v1,inEd,cs:cs.length,r2:cs.map(c=>c.r),vals:D.ents.filter(e=>e.attv).map(e=>e.s).sort(),out:!D.bedit}); })()`);
 t(r.v1.join()==='P-101,P-102','Define Attributes + insert asks / keeps attribute values ('+r.v1+')'); t(r.inEd&&r.out&&r.cs===2&&r.r2.includes(2)&&r.vals.join()==='P-101,P-102','Edit Block: edit in place, save updates both references and keeps values');
 // xref attach + clip, PDF import + underlay
 r=await J(`(async()=>{ const D=cadD(); D.ents=[]; D.xrefs=[]; const dxf='0\\nSECTION\\n2\\nENTITIES\\n0\\nLINE\\n8\\nA\\n10\\n0\\n20\\n0\\n11\\n50\\n21\\n0\\n0\\nENDSEC\\n0\\nEOF\\n';
  __ans=['10,10','2']; await PXC2.attachFile(new File([dxf],'base.dxf')); const x=D.xrefs[0]; __ans=['0,0,30,30']; R('Insert','Reference','Clip'); cadRender();
  const {jsPDF}=window.jspdf, doc=new jsPDF({unit:'pt',format:[300,200]}); doc.line(10,10,110,10); doc.rect(20,20,30,30); doc.text('HELLO',20,150); const f=new File([doc.output('blob')],'t.pdf');
  __ans=['1','1','0,0']; await PXC2.pdfImport(f); const ln=D.ents.filter(e=>e.ly==='PDF_GEOMETRY'), tx=D.ents.filter(e=>e.ly==='PDF_TEXT').map(e=>e.s);
  __ans=['1','1','0,0']; await PXC2.underlayFile(f); const u=D.xrefs.find(q=>q.kind==='pdf');
  return JSON.stringify({x:!!x&&x.k===2&&x.ents.length===1&&x.x===10, clip:!!x.clip, drawn:/clip-path/.test(CW.querySelector('#cg').innerHTML), ln:ln.length, len:ln.filter(e=>e.t==='l').map(e=>+Math.hypot(e.x2-e.x1,e.y2-e.y1).toFixed(2)), tx, u:!!u&&/^data:image\\/png/.test(u.img)&&[200,300].some(w=>Math.abs(u.w-w*25.4/72)<0.01)}); })()`);
 t(r.x&&r.clip&&r.drawn,'Attach DXF xref (scale 2, at 10,10) and Clip it'); t(r.ln>=2&&r.len.includes(35.28)&&r.tx.includes('HELLO'),'PDF Import: vectors to scale (100pt line = '+r.len+' mm) and text '+r.tx); t(r.u,'PDF Underlay to scale');
 // data link + linked table, xlsx reader
 r=await J(`(async()=>{ const D=cadD(); D.ents=[]; __ans=['L1']; await PXC2.linkData(new File(['Tag,Flow\\nP-1,12\\nP-2,15'],'pumps.csv')); __ans=['L1','0,0']; R('Annotate','Tables','Link Table'); const n1=D.ents.filter(e=>e.dl==='L1'&&e.t==='tx').length;
  __ans=['L1']; await PXC2.linkData(new File(['Tag,Flow\\nP-1,12\\nP-2,15\\nP-3,9'],'pumps.csv')); const n2=D.ents.filter(e=>e.dl==='L1'&&e.t==='tx').length;
  let xr=null; try{ const bl=await xlsxBlob(); xr=await PXX.xlsxRows(await (bl instanceof Blob?bl:new Blob([bl])).arrayBuffer()); }catch(e){ xr=String(e.message); }
  return JSON.stringify({n1,n2,xr:Array.isArray(xr)?xr.length:xr}); })()`);
 t(r.n1===6&&r.n2===8,'Link Data + Link Table; re-linking refreshes the table ('+r.n1+' -> '+r.n2+' cells)'); t(typeof r.xr==='number'&&r.xr>0,'XLSX reader reads a workbook ('+r.xr+' rows)');
 // spelling
 await E(`(()=>{ const D=cadD(); D.ents=[{t:'tx',x:0,y:0,h:2.5,s:'Pumpp room',ly:'TEXT'}]; CS.sel.clear(); R('Annotate','Text','Check Spelling'); })()`); await p.waitForTimeout(200);
 await p.fill('#pxxDlg textarea','Pump room'); await p.click('#pxxDlg [data-ok]'); t(await E(`cadD().ents[0].s`)==='Pump room','Check Spelling writes the fix back');
 // arc length
 r=await J(`(()=>{ const D=cadD(); D.ents=[]; const q=[]; for(let i=0;i<=16;i++){ const a=i/16*Math.PI/2; q.push([10*Math.cos(a),10*Math.sin(a)]); } cadAdd({t:'pl',p:q,cl:false}); CS.sel=new Set([0]); __ans=['3']; R('Annotate','Dimensions','Arc Length'); return JSON.stringify(D.ents.filter(e=>e.t==='tx').map(e=>e.s)); })()`);
 t(r.length===1&&/^⌒15\.7/.test(r[0]),'Arc Length dimension '+r);
 // constraints
 r=await J(`(()=>{ const D=cadD(); D.ents=[]; D.cons=[]; cadAdd({t:'l',x1:0,y1:0,x2:100,y2:0}); cadAdd({t:'c',x:50,y:20,r:5}); CS.sel=new Set([0,1]); R('Parametric','Geometric','Tangent'); const tan=+D.ents[1].y.toFixed(6);
  cadAdd({t:'l',x1:0,y1:10,x2:10,y2:10}); cadAdd({t:'l',x1:70,y1:30,x2:75,y2:31}); cadAdd({t:'l',x1:50,y1:-50,x2:50,y2:50}); CS.sel=new Set([2,3,4]); R('Parametric','Geometric','Symmetric'); const s=D.ents[3], sym=[s.x1,s.x2].map(v=>+v.toFixed(6)).sort((a,b)=>a-b).join();
  cadAdd({t:'l',x1:0,y1:-100,x2:10,y2:-100}); cadAdd({t:'l',x1:0,y1:-100,x2:10,y2:-95}); CS.sel=new Set([5,6]); __ans=['60']; R('Parametric','Dimensional','Angular'); const A=D.ents[5], B=D.ents[6], ang=+(((Math.atan2(B.y2-B.y1,B.x2-B.x1)-Math.atan2(A.y2-A.y1,A.x2-A.x1))*180/Math.PI+360)%180).toFixed(4);
  cadAdd({t:'l',x1:200,y1:0,x2:210,y2:0}); cadAdd({t:'l',x1:211,y1:1,x2:220,y2:8}); CS.sel=new Set([7,8]); R('Parametric','Geometric','Smooth'); const S=D.ents[8], smo=Math.abs(S.y1)<1e-6&&Math.abs(S.y2)<1e-6&&Math.abs(S.x1-210)<1e-6;
  cadAdd({t:'l',x1:300,y1:0,x2:340,y2:0}); D.ents.push({t:'dim',x1:300,y1:0,x2:340,y2:0,off:5,ly:'DIM'}); CS.sel=new Set([D.ents.length-1]); R('Parametric','Dimensional','Convert'); const cv=D.cons.some(c=>c.k==='ali'&&c.v===40)&&!D.ents.some(e=>e.t==='dim');
  return JSON.stringify({tan,sym,ang,smo,cv,kinds:D.cons.map(c=>c.k).join()}); })()`);
 t(Math.abs(Math.abs(r.tan)-5)<1e-6,'Tangent moves the circle onto the line (y='+r.tan+')'); t(r.sym==='90,100','Symmetric mirrors the second line ('+r.sym+')'); t(Math.abs(r.ang-60)<1e-3,'Angular = 60 ('+r.ang+')'); t(r.smo,'Smooth joins and aligns'); t(r.cv,'Convert dimension to constraint ('+r.kinds+')');
 // visual styles, viewports, palettes
 r=await J(`(()=>{ R('View','Visual Styles','Hidden'); let n=0; scene.traverse(o=>{ if(o.userData.vs0)n++; }); const h=PXC2.vs.cur; R('View','Visual Styles','Shades of Gray'); const g=PXC2.vs.cur; navStyle('shaded'); let m=0; scene.traverse(o=>{ if(o.userData.vs0||o.userData.vsEdge)m++; });
  __ans=['4']; R('View','Model Viewports','Viewport Configuration'); const vp=CW.querySelectorAll('svg.pxvp').length; __ans=['1']; R('View','Model Viewports','Viewport Configuration'); const vp1=CW.querySelectorAll('svg.pxvp').length;
  R('View','Palettes','Tool Palettes'); return JSON.stringify({n,h,g,m,vp,vp1,pal:!!(WX.lay.lb_cx&&WX.lay.lb_cx.open)}); })()`);
 t(r.n>0&&r.h==='hidden'&&r.g==='gray'&&r.m===0,'Visual styles Hidden / Shades of Gray on '+r.n+' meshes, Shaded restores'); t(r.vp===3&&r.vp1===0,'Viewport Configuration 4 tiles and back to 1'); t(r.pal,'Tool Palettes opens the C.X library');
 // aliases, standards, layer translator
 await E(`R('Manage','Customization','Edit Aliases')`); await p.waitForTimeout(150); await p.fill('#pxxDlg textarea','zz=line\nqq=nosuch'); await p.click('#pxxDlg [data-ok]'); t(await E(`CALIAS.zz==='line'&&!CALIAS.qq`),'Edit Aliases adds zz=line, refuses an unknown command');
 r=await J(`(()=>{ const D=cadD(); D.ents=[{t:'l',x1:0,y1:0,x2:1,y2:0,ly:'junk'}]; __ans=['S']; R('Manage','CAD Standards','Configure'); D.layers.push({n:'junk',c:'#123456',on:1,lk:0}); D.layers.find(l=>l.n==='DIM').c='#000000'; __ans=['C']; R('Manage','CAD Standards','Configure'); const rows=PCX.last.rows.map(r=>r[0]+':'+r[1]); __ans=['F']; R('Manage','CAD Standards','Configure'); return JSON.stringify({rows,dim:D.layers.find(l=>l.n==='DIM').c}); })()`);
 t(r.rows.some(x=>/^junk:not in/.test(x))&&r.rows.some(x=>/^DIM:colour/.test(x))&&r.dim==='#ef5350','CAD Standards: save, check finds 2 problems, fix restores colour');
 await E(`R('Manage','CAD Standards','Layer Translator')`); await p.waitForTimeout(150); await p.fill('#pxxDlg textarea','junk=TEXT'); await p.click('#pxxDlg [data-ok]');
 t(await E(`cadD().ents[0].ly==='TEXT'&&!cadD().layers.some(l=>l.n==='junk')`),'Layer Translator moves objects and removes the old layer');
 // scripts, page setup, plotter, batch plot, DWF
 r=await J(`(async()=>{ const D=cadD(); D.ents=[]; const n=PXC2.runScript('LINE 0,0 25,0 \\nCIRCLE 5,5 3\\n'); __ans=['S1 A4 P fit mono']; R('Output','Plot','Page Setup Manager'); __ans=['PDF 96']; R('Output','Plot','Plotter Manager');
  await PXC2.batchPlot('1'); const pl=PXX.last; R('Output','Export to DWF/PDF','DWF'); return JSON.stringify({ents:D.ents.map(e=>e.t).join(),ps:D.pscur==='S1'&&D.psetups.S1.orient==='P',dev:D.plotter.dev,pl,dwf:XC[PXX.id('draft','Output','Export to DWF/PDF','DWF')].honest}); })()`);
 t(r.ents==='l,c','Run Script draws LINE and CIRCLE ('+r.ents+')'); t(r.ps&&r.dev==='PDF','Page Setup Manager + Plotter Manager'); t(r.pl&&r.pl.plot===1&&r.pl.bytes>1000,'Batch Plot writes a PDF ('+(r.pl&&r.pl.bytes)+' bytes)'); t(r.dwf,'DWF answers honestly');
 // agent finds and runs them; audit
 r=await J(`(()=>{ const ids=PXX.done.filter(id=>id.startsWith('draft_')); const miss=ids.filter(id=>!(XDESC[id]&&XDESC[id][0]&&XDESC[id][1])); const f=agxFind('batch plot','C.X').map(x=>x.id), g=agxFind('تدرج','C.X').map(x=>x.id);
  let tot=0,st=0; RIBP.draft.tabs.forEach(tb=>tb[2].forEach(gp=>gp[1].forEach(id=>{ tot++; if(XC[id]&&XC[id].stub)st++; }))); return JSON.stringify({n:ids.length,miss,f:f.includes(PXX.id('draft','Output','Plot','Batch Plot')),g:g.includes(PXX.id('draft','Home','Draw','Gradient')),tot,st}); })()`);
 t(r.n===35&&!r.miss.length,'35 new C.X commands, all with EN+AR help '+r.miss.join());
 t(r.f&&r.g,'find_tools finds Batch Plot (EN) and Gradient (AR)');
 t(r.st===0,'C.X ribbon '+(r.tot-r.st)+'/'+r.tot+' wired');
 const rr=await J(`(async()=>{ __ans=['2V']; const o=await agxRun(PXX.id('draft','View','Model Viewports','Viewport Configuration')); return JSON.stringify(o); })()`); t(rr.ok,'run_tool runs a new command: '+JSON.stringify(rr).slice(0,90));
 t(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
 console.log('\nparity_cad2: '+ok+' passed, '+bad+' failed'); await b.close(); })();
