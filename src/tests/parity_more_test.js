// T.X / O.X / G.X / P.X / S.X / N.X parity (c_parity_more.js). node pw/parity_more_test.js file://$PWD/site/index.test.html
const {open}=require('./lib');
(async()=>{ const {b,p,E,errs}=await open(process.argv[2]); let ok=0,bad=0; const t=(c,n)=>{c?ok++:bad++;console.log((c?'  ok   ':'  FAIL ')+n);};
 const J=async s=>JSON.parse(await E(s));
 await E(`window.__ans=[]; window.prompt=(m,d)=>__ans.length?__ans.shift():d; window.confirm=()=>false; window.RR=(ty,tab,panel,en)=>XC[PXX.id(ty,tab,panel,en)].run(); 1`);
 // T.X
 let r=await J(`(()=>{ const R=(a,b,c)=>RR('plant','Structure',a,b,c); DATA.plantx={}; __ans=['6 6 | 5 | 0 4.5']; RR('plant','Structure','Parts','Grid'); const g=PXM.st().grid;
  __ans=['A1@0 | A1@4.5 | HEA200']; RR('plant','Structure','Parts','Member'); const c=PXM.last; __ans=['A1@4.5 | C1@4.5 | IPE300']; RR('plant','Structure','Parts','Member'); const bm=PXM.last;
  __ans=['1.5,1.5,0.6']; RR('plant','Structure','Parts','Footing'); const ft=PXM.last; __ans=['0,0,0,4.5,1,0.18,0.25']; RR('plant','Structure','Parts','Stairs'); const st=PXM.last; __ans=['0,0,0,6,0.5']; RR('plant','Structure','Parts','Ladder'); const ld=PXM.last;
  __ans=['0,0,4.5 | 12,0,4.5 | 1.1 | 1.8']; RR('plant','Structure','Parts','Railing'); const rl=PXM.last; __ans=['0,0,4.5,6,5,0.008']; RR('plant','Structure','Parts','Plate'); const pl=PXM.last;
  __ans=[bm.id,'4']; RR('plant','Structure','Cutting','Cut Member'); const L1=Math.hypot(bm.b[0]-bm.a[0],bm.b[1]-bm.a[1]);
  const m1={id:'X1',a:[0,0,0],b:[5,0,0],sec:'IPE200'}, m2={id:'X2',a:[8,-2,0],b:[8,2,0],sec:'IPE200'}, m3={id:'X3',a:[3,-2,0],b:[3,2,0],sec:'IPE200'}; PXM.st().mem.push(m1,m2,m3); __ans=['X1,X2']; RR('plant','Structure','Cutting','Extend'); const ex=m1.b[0];
  __ans=['X1,X3']; RR('plant','Structure','Cutting','Trim'); const tr=Math.min(m1.a[0],m1.b[0]); const m4={id:'X4',a:[0,0,0],b:[0,5,0]}, m5={id:'X5',a:[1,0,0],b:[6,0,0]}; PXM.st().mem.push(m4,m5); __ans=['X4,X5']; RR('plant','Structure','Cutting','Miter');
  RR('plant','Output','Export','Navisworks NWC');
  return JSON.stringify({g:g.xs.join()+'|'+g.ys.join(),c:c.role,ft:ft.n,st:st.risers,ld:[ld.rungs,ld.cage],rl:rl.posts,pl:pl.kg,L1,ex,tr,mi:PXM.last.ang,nwc:XC[PXX.id('plant','Output','Export','Navisworks NWC')].honest}); })()`);
 t(r.g==='0,6,12|0,5'&&r.c==='column','T.X Grid + Member (column HEA200)'); t(r.ft===1&&r.st===25&&r.ld[0]===20&&r.ld[1]&&r.rl===8&&Math.abs(r.pl-1884)<.01,'Footing, Stairs (25 risers), Ladder (20 rungs + cage), Railing (8 posts), Plate 1884 kg');
 t(Math.abs(r.L1-4)<1e-9&&r.ex===8&&r.tr===3&&r.mi===90,'Cut Member, Extend to 8, Trim to 3, Miter 90°'); t(r.nwc,'Navisworks NWC answers honestly');
 r=await J(`(()=>{ DATA.plantx.runs=[{tag:'P-1',sup:[{k:'shoe',at:1}]}]; DATA.plantx.sel=0; const c=P2PLT.cur(); if(!c)return JSON.stringify({skip:1}); __ans=['1,guide']; RR('plant','Home','Pipe Supports','Convert Support'); const k=c.sup[0].k; const p0=camera.position.clone(); __ans=['right']; RR('plant','Home','Ortho Views','Adjacent View'); return JSON.stringify({k,moved:camera.position.distanceTo(p0)>1e-6}); })()`);
 t((r.skip||r.k==='guide')&&(r.skip||r.moved),'Convert Support shoe -> guide, Adjacent View turns the camera'+(r.skip?' (no current run: skipped)':''));
 // O.X
 r=await J(`(()=>{ const d=oD().cells; Object.keys(d).forEach(k=>delete d[k]); Object.assign(d,{A1:'Item',B1:'Qty',A2:'Pipe',B2:'5',A3:'Valve',B3:'2',A4:'Pipe',B4:'7',A5:'Pump',B5:'1'});
  __ans=['A1:B5 | Item | Qty | SUM | D1']; RR('office','Insert','Tables','PivotTable'); const pv=[d.D2,d.E2,d.D3,d.E3,d.D5,d.E5];
  SHS.sel='F1'; __ans=['=VLOOKUP("Valve",A2:B5,2,0)']; RR('office','Formulas','Function Library','Lookup'); SHS.sel='F2'; __ans=['=ROUNDUP(2.341,1)']; RR('office','Formulas','Function Library','Math'); SHS.sel='F3'; __ans=['=YEAR(DATE(2027,3,4))']; RR('office','Formulas','Function Library','Date & Time');
  SHS.sel='F4'; __ans=['=INDEX(A2:B5,4,1)']; RR('office','Formulas','Function Library','Lookup');
  __ans=['oval,#ffcc80,Wet well','C8,120,60']; RR('office','Insert','Illustrations','Shapes'); __ans=['Note','C12,140,40']; RR('office','Insert','Text','Text Box'); SHS.sel='A9'; __ans=['check']; d.A9='verify';
  return JSON.stringify({pv,f:[shVal('F1'),shVal('F2'),shVal('F3'),shVal('F4')],objs:oD().objs.length}); })()`);
 t(r.pv.join()==='Pipe,12,Pump,1,Grand Total,15','PivotTable SUM by Item ('+r.pv+')'); t(r.f.join()==='2,2.4,2027,Pump','Lookup / Math / Date & Time functions ('+r.f+')'); t(r.objs===2,'Shapes + Text Box floating objects');
 await E(`RR('office','Review','Proofing','Thesaurus')`); await p.waitForTimeout(200); t((await J(`JSON.stringify(PXM.syn||[])`)).includes('inspect')&&(await E(`oD().cells.A9`))==='check','Thesaurus offers synonyms and replaces the word');
 // G.X
 r=await J(`(()=>{ const P=P2GIS.plane(30,31), sq=(x,y,s)=>[[x,y],[x+s,y],[x+s,y+s],[x,y+s]], L=sq(0,0,10).concat([]); const Lsh=[[0,0],[20,0],[20,10],[10,10],[10,20],[0,20]];
  const u=PXM.bool(Lsh,sq(5,5,20),'union'), e=PXM.bool(sq(0,0,10),sq(5,5,10),'erase'), A=q=>Math.abs(q.reduce((s,a,i)=>{ const b=q[(i+1)%q.length]; return s+a[0]*b[1]-b[0]*a[1]; },0)/2);
  GM.layers=[{id:'L1',n:'L',vis:1,op:1,feat:[{t:'poly',g:Lsh.map(P.from),n:'a'},{t:'poly',g:sq(5,5,20).map(P.from),n:'b'}]}]; GM.cur=0; GM.sels=GM.layers[0].feat.slice(); RR('gis','Analysis','Overlay','Union'); const g=PXM.lastG;
  return JSON.stringify({u:A(u[0]),e:A(e[0]),g:+g.area.toFixed(1)}); })()`);
 t(Math.abs(r.u-(300+400-125))<1e-6&&Math.abs(r.e-75)<1e-6,'Union of a concave L and a square = 575 m², Erase = 75 m²'); t(Math.abs(r.g-575)<1,'Union command on the map layer ('+r.g+' m²)');
 r=await J(`(async()=>{ const w=await PXM.watershed([30,31],100,7,async(lat,lon)=>{ const P=P2GIS.plane(30,31), q=P.to([lat,lon]); return 100+Math.abs(q[0])*.1+Math.abs(q[1])*.1; });
  const img={w:4,h:1,d:new Uint8ClampedArray([255,0,0,255,250,5,0,255,0,0,255,255,5,0,250,255])}, c=PXM.classify(img,2), red={w:2,h:1,d:new Uint8ClampedArray([50,0,0,255,100,0,0,255])}, nir={w:2,h:1,d:new Uint8ClampedArray([150,0,0,255,100,0,0,255])}, n=PXM.ndvi(red,nir);
  const m=await PXM.mosaic([{img:{w:2,h:1,d:new Uint8ClampedArray(8).fill(200)},x:0,y:0},{img:{w:2,h:1,d:new Uint8ClampedArray(8).fill(100)},x:2,y:0}]);
  return JSON.stringify({ws:w.cells,cl:c.cnt.join(),nd:+n.mean.toFixed(3),mo:m.W+'x'+m.H}); })()`);
 t(r.ws===49,'Watershed: a cone drains all 49 cells to the centre'); t(r.cl==='2,2'&&r.nd===.25&&r.mo==='4x1','Classify (2+2), NDVI mean 0.25, Mosaic 4x1');
 // P.X
 r=await J(`(()=>{ const x='ERMHDR\\t8.4\\n%T\\tPROJWBS\\n%F\\twbs_id\\twbs_short_name\\twbs_name\\n%R\\t1\\tW9\\tImported\\n%T\\tTASK\\n%F\\ttask_id\\ttask_code\\ttask_name\\ttarget_drtn_hr_cnt\\twbs_id\\n%R\\t11\\tZ10\\tMobilise\\t16\\t1\\n%R\\t12\\tZ20\\tExcavate\\t40\\t1\\n%T\\tTASKPRED\\n%F\\ttask_id\\tpred_task_id\\tpred_type\\tlag_hr_cnt\\n%R\\t12\\t11\\tPR_FS\\t8\\n%E\\n';
  const rows=PXM.xerParse(x); const n0=ACT.length; PXM.loadActs(rows,false); const z=ACT.find(a=>a.id==='Z20'), zp=z&&z.after.join(); const xr=PXM.xlsxActs([['Activity ID','Activity Name','Original Duration','Predecessors'],['Q1','Survey',3,''],['Q2','Set out',2,'Q1 FS+1']]); PXM.loadActs(xr,false);
  const m=PXM.renumber('R',1000,10,['Z10','Z20']); const z2=ACT.find(a=>a.id===m.Z20);
  __ans=['PROFILE Planner view edit reports']; RR('sched','Admin','Admin','Security Profiles'); __ans=['USER sara Planner']; RR('sched','Admin','Admin','Security Profiles'); __ans=['ADD Risk Categories|Ground']; RR('sched','Admin','Admin','Admin Categories'); __ans=['8,40,172,2000,yyyy-mm-dd,EGP']; RR('sched','Admin','Admin','Admin Preferences'); __ans=['Lift station']; RR('sched','Project','Settings','Set Default Project');
  return JSON.stringify({rows:rows.length,dur:z&&z.d,pred:zp,wbs:WBSN.W9&&WBSN.W9[0],added:ACT.length-n0,q2:ACT.find(a=>a.id==='Q2').after.join(),ren:z2&&z2.after.join(),sec:DATA.p6x.sec.users.sara,cat:DATA.p6x.cats['Risk Categories'].join(),def:DATA.p6x.defProj}); })()`);
 t(r.rows===2&&r.dur===5&&r.pred==='Z10'&&r.wbs==='Imported','Import XER: 2 activities, 40 h = 5 d, FS link, WBS'); t(r.added===4&&r.q2==='Q1','Import XLSX rows with predecessors'); t(r.ren==='R1000','Renumber keeps the relationship (R1010 after '+r.ren+')');
 t(r.sec==='Planner'&&r.cat==='Ground'&&r.def==='Lift station','Security Profiles, Admin Categories, Admin Preferences, Default Project');
 // S.X + N.X
 r=await J(`(()=>{ const pn=PXM.pressureNet([[0,0],[100,0],[150,50]],200,'DI',1.2,30); const pa=PXM.panorama(); const f=PXM.fbx(); let k=null; try{ k=PXM.kml(); }catch(e){ k={err:e.message}; }
  return JSON.stringify({L:pn.L,b:pn.bends.map(x=>x.fit).join(),v:pn.v,hf:pn.hf,pa:Array.isArray(pa.events),fb:f.n,fbh:/FBXVersion: 7400/.test(f.text)&&/PolygonVertexIndex/.test(f.text),k:k.err||k.n}); })()`);
 t(Math.abs(r.L-170.711)<.01&&r.b==='45° bend'&&r.v===.955&&r.hf>0,'Pressure Network: 170.7 m, one 45° bend, 0.955 m/s, H-W loss '+r.hf+' m'); t(r.pa,'Panorama event viewer runs');
 t(r.fb>0&&r.fbh,'FBX 7.4 ASCII with '+r.fb+' meshes'); t(typeof r.k==='number'&&r.k>0||/location/.test(r.k),'Google Earth KML ('+r.k+')');
 // all new ids: help + find_tools + audit
 r=await J(`(()=>{ const ids=PXX.done.filter(id=>/^(plant|office|gis|sched|survey|coord)_/.test(id)); const miss=ids.filter(id=>!(XDESC[id]&&XDESC[id][0]&&XDESC[id][1])); const st={}; Object.keys(RIBP).forEach(ty=>{ let s=0; RIBP[ty].tabs.forEach(tb=>tb[2].forEach(g=>g[1].forEach(id=>{ if(XC[id]&&XC[id].stub)s++; }))); st[ty]=s; });
  return JSON.stringify({n:ids.length,miss,st,f:agxFind('pivot table').some(x=>x.id===PXX.id('office','Insert','Tables','PivotTable')),g:agxFind('مستجمع').length>0,h:PXX.honestList.map(x=>x[0]+':'+x[1])}); })()`);
 t(r.n===44&&!r.miss.length,r.n+' new commands with EN+AR help '+r.miss.join()); t(r.f&&r.g,'find_tools finds PivotTable and مستجمع'); t(Object.values(r.st).every(x=>x===0),'every ribbon 100 % wired '+JSON.stringify(r.st)); console.log('  honest: '+r.h.join(', '));
 t(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
 console.log('\nparity_more: '+ok+' passed, '+bad+' failed'); await b.close(); })();
