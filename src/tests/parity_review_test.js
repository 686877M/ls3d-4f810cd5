// Fixes from the 2026-11-25 parity review (c_parity_rev.js) + the long-run undo crash. node pw/parity_review_test.js file://$PWD/site/index.test.html
const {open}=require('./lib');
(async()=>{ const {b,p,E,errs}=await open(process.argv[2]); let ok=0,bad=0; const t=(c,n)=>{c?ok++:bad++;console.log((c?'  ok   ':'  FAIL ')+n);};
 const J=async s=>JSON.parse(await E(s));
 await E(`window.__ans=[]; window.prompt=(m,d)=>__ans.length?__ans.shift():d; window.R=(ty,tab,panel,en)=>XC[PXX.id(ty,tab,panel,en)].run(); 1`);
 // P.X Renumber -> 4D site update -> Undo / Redo (was: Cannot read properties of undefined (reading 's'))
 let r=await J(`(()=>{ __ans=['A,1000,10,ALL']; R('sched','Edit','Edit','Renumber Activity IDs'); const ren=actK('A2').id; let e1=''; try{ buildSite(); schedOn=true; DAY=5; updateSite(); applyOverlays(); }catch(e){ e1=e.message; }
  hiGo(-1); const back=actK('A2').id, pit=typeof actOfItem==='function'?actOfItem('C11'):'A2'; hiGo(1); const again=actK('A2').id; let e2=''; try{ updateSite(); }catch(e){ e2=e.message; } return JSON.stringify({ren,e1,back,pit,again,e2,n:ACT.length,uniq:new Set(ACT.map(a=>a.id)).size}); })()`);
 t(r.ren!=='A2'&&!r.e1,'Renumber, then the 4D site updates without error ('+r.ren+(r.e1?' '+r.e1:'')+')');
 t(r.back==='A2'&&r.pit==='A2','Undo restores the original IDs; quantities still map to the pit activity');
 t(r.again===r.ren&&!r.e2&&r.n===r.uniq,'Redo renames again, no duplicate activities');
 await E(`XC.cad.run(); const D=cadD(); D.ents=[]; cadAdd({t:'l',x1:0,y1:0,x2:100,y2:0,ly:'0'}); cadAdd({t:'l',x1:0,y1:0,x2:0,y2:60,ly:'0'}); cadAdd({t:'c',x:150,y:30,r:20,ly:'0'}); cadCommit(); 1`);
 // C.X navigation on the drawing canvas
 r=await J(`(()=>{ const cam=camera.position.toArray().join(); R('draft','View','Navigate','Zoom Extents'); const v0={...CS.V}; R('draft','View','Navigate','Zoom In'); const w1=CS.V.w; R('draft','View','Navigate','Zoom Out'); const w2=CS.V.w;
  R('draft','View','Navigate','Zoom Window'); cadClick([0,0]); cadClick([20,10]); const zw={...CS.V}; return JSON.stringify({ext:v0.x<0&&v0.x+v0.w>170,inn:Math.abs(w1-v0.w/2)<1e-6,out:Math.abs(w2-v0.w)<1e-6,zw:zw.w>=20&&zw.w<30&&zw.x<=0,cam:camera.position.toArray().join()===cam,tool:CS.tool}); })()`);
 t(r.ext,'Zoom Extents fits every drawing object'); t(r.inn&&r.out,'Zoom In 2x / Zoom Out 0.5x about the view centre'); t(r.zw&&r.tool==='select','Zoom Window from two picked corners'); t(r.cam,'The 3D camera does not move');
 await E(`R('draft','View','Navigate','Pan'); 1`); const v1=await J(`JSON.stringify(CS.V)`); const bx=await J(`(()=>{ CW.style.cssText+=';position:fixed;left:0;top:0;width:900px;height:600px;z-index:9999;display:flex;flex-direction:column'; const sv=CW.querySelector('svg'); sv.parentNode.style.height='420px'; sv.parentNode.style.flex='none'; sv.style.height='420px'; const r=CW.querySelector('svg').getBoundingClientRect(); return JSON.stringify([r.x+r.width/2,r.y+r.height/2]); })()`);
 await p.mouse.move(bx[0],bx[1]); await p.mouse.down(); await p.mouse.move(bx[0]+120,bx[1]+40,{steps:5}); await p.mouse.up(); const v2=await J(`JSON.stringify(CS.V)`);
 t(v2.x<v1.x&&v2.y>v1.y&&Math.abs(v2.w-v1.w)<1e-9,'Pan: left drag moves the drawing (dx '+(v2.x-v1.x).toFixed(1)+')');
 await E(`cadEsc(); 1`);
 // DIST, dimensions
 r=await J(`(()=>{ R('draft','Home','Utilities','Measure Distance'); cadClick([0,0]); cadClick([30,40]); const d=PXRV.last; const D=cadD(); CS.sel=new Set([0,1]); R('draft','Annotate','Dimensions','Angular'); const ang=D.ents.filter(e=>e.dim==='ang'); CS.sel=new Set([2]); R('draft','Annotate','Dimensions','Radius'); const rad=D.ents[D.ents.length-1];
  CS.sel.clear(); R('draft','Annotate','Dimensions','Angular'); cadClick([0,0]); cadClick([10,0]); cadClick([10,10]); cadClick([5,2]); const ang2=D.ents[D.ents.length-1]; R('draft','Annotate','Dimensions','Aligned'); cadRender(); return JSON.stringify({d:[d.d,d.dx,d.dy,+d.ang.toFixed(2)],ang:ang.length===2&&ang[1].s,ang2:ang2.s,rad:rad.t==='dim'&&rad.pre==='R'&&+dimGeo(rad).v.toFixed(3),tool:CS.tool,svg:CW.querySelector('svg').innerHTML.includes('90.00°')}); })()`);
 t(r.d.join()==='50,30,40,53.13','DIST: distance 50, delta X 30, delta Y 40, angle 53.13°'); t(r.ang==='90.00°'&&r.svg,'Angular dimension from two selected lines, drawn in the drawing'); t(r.ang2==='45.00°','Angular dimension from vertex + two arms + arc position');
 t(r.rad===20,'Radius dimension object R20 on the selected circle'); t(r.tool==='dim','Aligned starts the aligned dimension tool');
 await E(`cadEsc(); 1`);
 // Properties palette
 r=await J(`(()=>{ CS.sel=new Set([0,1]); R('draft','View','Palettes','Properties'); const ta=document.querySelector('#pxxDlg textarea'); const txt=ta.value; ta.value=txt.replace(/^ly = .*$/m,'ly = WALLS').replace(/^c = .*$/m,'c = #ff0000'); document.querySelector('#pxxDlg [data-ok]').click(); const D=cadD();
  CS.sel=new Set([2]); const one=PXRV.props([2]).map(r=>r.join('=')).join('|'); return JSON.stringify({varies:/y2 = \\*VARIES\\*/.test(txt)&&/Type = Line/.test(txt),ly:D.ents[0].ly==='WALLS'&&D.ents[1].ly==='WALLS'&&!!D.layers.find(l=>l.n==='WALLS'),c:D.ents[1].c,geo:D.ents[0].y2===0,one}); })()`);
 t(r.varies,'Properties: common values, *VARIES* for mixed ones'); t(r.ly&&r.c==='#ff0000'&&r.geo,'Properties edit: layer + colour applied to both, geometry kept'); t(/\|r=20\|/.test(r.one)&&/\(Area\)=1256.637/.test(r.one),'Properties of a circle: radius, area ('+r.one.slice(0,60)+')');
 // Export DXF / PDF of the drawing
 const dl=[]; p.on('download',d=>dl.push(d.suggestedFilename()));
 await E(`R('draft','Output','Export to DWF/PDF','Export DXF'); 1`); r=await J(`(async()=>{ PXX.last=null; await R('draft','Output','Export to DWF/PDF','Export PDF'); for(let i=0;i<60&&!(PXX.last&&PXX.last.plot);i++)await new Promise(r=>setTimeout(r,250)); return JSON.stringify({pdf:PXX.last,dxf:PXRV.lastDxf}); })()`);
 await p.waitForTimeout(800);
 t(r.dxf>200&&dl.includes('XTO_Drawing.dxf'),'Export DXF writes the drawing'); t(r.pdf&&r.pdf.plot===1&&r.pdf.bytes>1000,'Export PDF writes the drawing ('+(r.pdf&&r.pdf.bytes)+' bytes)');
 // R.X dimensions and spot elevation through the same path as a click (rvClick -> RVX.one)
 r=await J(`(()=>{ const put=(t,pts)=>{ rvTool(t); pts.forEach(p=>{ rvPush(); const o=RVX.one[t](p); if(o){ o.id=rvId(); o.k=o.k||t; o.lv=RV.lv; RV.els.push(o); } rvChanged(); }); rvTool(null); return RV.els[RV.els.length-1]; };
  const n0=RV.els.length; R('model','Annotate','Dimension','Linear'); const tool=RV.tool; const lin=put('dlin',[[0,0],[4,1.2]]); const ang=put('dang',[[2,0],[0,0],[0,2]]); const rad=put('drad',[[3,0],[0,3],[-3,0]]); const sp=put('spel',[[1,1]]); let e=''; try{ rvBuild(); }catch(x){ e=x.message; }
  const F=v=>v; const svg=P2R.plan.dang(ang,F)+P2R.plan.drad(rad,F)+P2R.plan.spel(sp,F); return JSON.stringify({tool,added:RV.els.length-n0,lin:[lin.k,lin.a.join(),lin.b.join(),lin.lin],ang:ang.s,rad:rad.s,sp:sp.s,lv:rvLy(RV.lv),e,svg:svg.includes('90.00°')&&svg.includes('R 3.000')&&svg.includes(sp.s)}); })()`);
 t(r.tool==='dlin'&&r.lin.join('|')==='dim|0,0|4,0|H','R.X Linear: horizontal dimension element from two picks'); t(r.ang==='90.00°'&&r.rad==='R 3.000','R.X Angular 90° and Radial R 3.000 from picks');
 t(r.sp==='EL '+(r.lv>=0?'+':'')+r.lv.toFixed(3),'R.X Spot Elevation reads the active level ('+r.sp+')'); t(r.added===4&&!r.e&&r.svg,'R.X: 4 annotation elements saved, built in 3D and drawn in the Floor Plan');
 t(!errs.length,'no page errors '+errs.slice(0,2).join(' | '));
 console.log('\nparity_review: '+ok+' passed, '+bad+' failed'); await b.close(); process.exit(bad?1:0); })();
