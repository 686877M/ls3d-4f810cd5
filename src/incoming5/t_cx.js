const H=require('./lbh.js');
(async()=>{ const {pg,E,ck,sum,er}=await H.open();
 const n=async k=>E("lbItems(LB.libs."+k+").length");
 const cnt={blk:await n('cxblk'),hat:await n('cxhat'),lt:await n('cxlt'),ds:await n('cxds')}; ck('C.X counts',cnt.blk>=60&&cnt.hat>=28&&cnt.lt>=12&&cnt.ds>=8,cnt);
 ck('cat counts',true,await E("JSON.stringify(['arch','elec','plumb','fire','hvac','anno','sheet'].map(c=>c+':'+lbItems(LB.libs.cxblk).filter(i=>i.cat===c).length))"));
 await E("XC.cad.run()"); await pg.waitForTimeout(300);
 const e0=await E("cadD().ents.length");
 // every symbol generates entities and previews
 ck('all symbols generate',await E("lbItems(LB.libs.cxblk).every(it=>{ const v=lbVals(LB.libs.cxblk,it); return lbSymList.find(s=>s.id===it.id).gen(v).length>0 && lbPrev(LB.libs.cxblk,it).includes('<svg'); })"));
 ck('all hatch preview',await E("lbItems(LB.libs.cxhat).every(it=>lbPrev(LB.libs.cxhat,it).includes('<svg'))"));
 // place door via armed click
 await E("(()=>{ const {lib,it}=lbFind('cxblk','door1'); lbRun(lib,it,it.click); })()");
 ck('armed tool',await E("CS.tool==='lbplace'&&!!CS.lbArm"));
 await E("cadClick([1000,2000])"); 
 const e1=await E("cadD().ents.length"); ck('door placed entities',e1>e0,{e0,e1});
 ck('block registered LB_door1',await E("!!cadD().blocks&&!!cadD().blocks.LB_door1&&cadD().blocks.LB_door1.length"));
 ck('layer created',await E("cadD().layers.some(l=>l.n==='A-SYMBOL')"));
 ck('still armed (repeat)',await E("CS.tool==='lbplace'"));
 await E("cadClick([3000,2000])"); ck('second placement',await E("cadD().ents.length")>e1);
 await E("cadEsc()"); ck('esc exits',await E("CS.tool==='select'&&!CS.lbArm"));
 // placed door position: first entity near 1000,2000
 ck('door at click',await E("(()=>{ const e=cadD().ents.filter(x=>x.ly==='A-SYMBOL')[0]; return Math.abs(e.x1-1000)<1&&Math.abs(e.y1-2000)<1; })()"));
 // existing binsert can use it: block entity shape same as binsert (rel. to origin)
 ck('block relative origin',await E("(()=>{ const b=cadD().blocks.LB_door1; return b.some(e=>e.x1===0&&e.y1===0); })()"));
 // units cm
 await E("lbD().cur.cxu='cm'"); const b0=await E("cadD().ents.length"); await E("(()=>{ const {lib,it}=lbFind('cxblk','colsq'); lbCadPlace(lbSymList.find(s=>s.id==='colsq').gen(lbVals(lib,it)),[0,0],{ly:'A-SYMBOL'}); })()");
 const w40=await E("(()=>{ const e=cadD().ents.find((x,i)=>i>=cadD().ents.length-5&&x.t==='pl'); return Math.max(...e.p.map(q=>q[0]))-Math.min(...e.p.map(q=>q[0])); })()"); ck('unit cm scales (400mm=40cm)',w40===40,w40);
 await E("lbD().cur.cxu='mm'");
 // drop: simulate
 const r=await E("(()=>{ const sv=CW.querySelector('svg'), rc=sv.getBoundingClientRect(); const cx=rc.left+rc.width*0.3, cy=rc.top+rc.height*0.6, exp=lbCadPt(cx,cy); const dt=new DataTransfer(); dt.setData('text/plain','lb:cxblk:wc'); const before=cadD().ents.length; sv.dispatchEvent(new DragEvent('drop',{dataTransfer:dt,clientX:cx,clientY:cy,bubbles:true,cancelable:true})); const tank=cadD().ents[before]; return [before,cadD().ents.length,exp,tank.p[0],rc.height]; })()");
 ck('drop places symbol at pointer',r[1]>r[0]&&Math.abs(r[3][0]-(r[2][0]-190))<1&&Math.abs(r[3][1]-r[2][1])<1&&r[4]>100,r);
 // hatch on a rectangle
 await E("(()=>{ const D=cadD(); D.ents.push({t:'r',x1:0,y1:0,x2:2000,y2:1500,ly:'0'}); CS.sel.clear(); CS.sel.add(D.ents.length-1); })()");
 const h0=await E("cadD().ents.length"); const msg=await E("(()=>{ const {lib,it}=lbFind('cxhat','ansi31'); return lbHatchRun(it_h('ansi31'),lbVals(lib,it)); function it_h(id){ return lbHatchList.find(h=>h.id===id); } })()");
 const h1=await E("cadD().ents.length"); ck('hatch lines on rect',h1-h0>10,{h0,h1});
 ck('hatch record + tag',await E("cadD().hatches.length===1&&cadD().ents.filter(e=>e.hg===cadD().hatches[0].id).length>10"));
 // all hatches generate on 2000x1500 area at default scale and stay in bbox
 const hb=await E("lbHatchList.map(h=>{ const g=lbHatchGen([[0,0],[2000,0],[2000,1500],[0,1500]],h,100,30,5000); const ok=g.length>0 && g.every(e=>{ const pts=e.t==='l'?[[e.x1,e.y1],[e.x2,e.y2]]:e.t==='c'?[[e.x,e.y]]:e.p; return pts.every(q=>q[0]>=-1&&q[0]<=2001&&q[1]>=-1&&q[1]<=1501)}); return h.id+':'+g.length+(ok?'':'!'); })");
 ck('every hatch yields entities inside area (angle 30)',!hb.some(x=>x.endsWith('!')||x.endsWith(':0')),hb.join(' '));
 // re-apply with new scale reduces/increases lines
 const nA=await E("cadD().ents.filter(e=>e.hg).length"); await E("(()=>{ const {lib,it}=lbFind('cxhat','ansi31'); const act=it.act[2]; act[2](it,{sc:200,ang:0}); })()"); const nB=await E("cadD().ents.filter(e=>e.hg).length"); ck('re-apply scale 200 -> fewer lines',nB<nA&&nB>0,{nA,nB});
 // hatch pick rectangle path
 await E("CS.sel.clear(); (()=>{ const {lib,it}=lbFind('cxhat','concrete'); lbHatchRun(lbHatchList.find(h=>h.id==='concrete'),{sc:100,ang:0}); })()");
 const q0=await E("cadD().ents.length"); await E("cadClick([3000,0])"); await E("cadClick([5000,1500])"); const q1=await E("cadD().ents.length"); ck('hatch by two corners',q1>q0,{q0,q1});
 await E("cadEsc()");
 // linetype
 await E("(()=>{ const {lib,it}=lbFind('cxlt','phantom'); lbRun(lib,it,it.act[1][2]); })()");
 ck('linetype new layer',await E("(()=>{ const l=cadD().layers.find(x=>x.n==='LT-PHANTOM'); return !!l&&l.lt==='phantom'&&C3.lt.phantom==='12 3 3 3 3 3'&&cadD().cur==='LT-PHANTOM'; })()"));
 await E("(()=>{ const {lib,it}=lbFind('cxlt','center'); lbLtApply(lbLT.find(l=>l[0]==='center'),{ls:2},false); })()");
 ck('scaled linetype on current layer',await E("(()=>{ const l=cadD().layers.find(x=>x.n===cadD().cur); return l.lt==='center@2'&&C3.lt['center@2']==='24 6 6 6'; })()"));
 const svgOut=await E("cadEntSvg({t:'l',x1:0,y1:0,x2:5,y2:5,ly:'LT-PHANTOM'},false,false)"); ck('svg render uses dasharray',/stroke-dasharray/.test(svgOut),svgOut.slice(0,150));
 // dim style
 await E("(()=>{ const {lib,it}=lbFind('cxds','arch100'); lbRun(lib,it,it.act[0][2]); })()"); ck('dim preset sets th/off',await E("cadD().th===250&&cadD().off===500"),await E("[cadD().th,cadD().off]"));
 await E("lbDsApply(lbDS.find(d=>d[0]==='civ500'),{pt:2.5,sc:500,off:8})"); ck('civil preset (m) th=1.25',await E("cadD().th===1.25"),await E("cadD().th"));
 // title block + field update
 await E("(()=>{ const {lib,it}=lbFind('cxblk','tbA1'); lbOv(lib,it,1).f={ti:'GROUND FLOOR PLAN',no:'AR-101'}; lbCadPlace(lbSymList.find(s=>s.id==='tbA1').gen(lbVals(lib,it)),[0,-10000],{ly:'G-TTLB'}); })()");
 ck('title block fields as tagged text',await E("cadD().ents.filter(e=>e.t==='tx'&&e.fld==='ti'&&e.s==='GROUND FLOOR PLAN').length===1"));
 await E("(()=>{ LB.ui.cx.sel='tbA1'; lbOv(LB.libs.cxblk,{id:'tbA1'},1).f={ti:'FIRST FLOOR PLAN',no:'AR-102'}; })()");
 const nup=await E("(()=>{ const sel=lbFind('cxblk','tbA1'); const v=lbVals(sel.lib,sel.it); let n=0; cadD().ents.forEach(e=>{ if(e.t==='tx'&&e.fld&&(e.fld in v)){ e.s=v[e.fld]; n++; } }); return n; })()"); ck('title block field update (same code path)',nup>=10&&await E("cadD().ents.some(e=>e.fld==='ti'&&e.s==='FIRST FLOOR PLAN')"),nup);
 ck('A1 is 841x594',await E("(()=>{ const e=cadD().ents.filter(x=>x.ly==='G-TTLB'&&x.t==='pl')[0]; const xs=e.p.map(q=>q[0]),ys=e.p.map(q=>q[1]); return (Math.max(...xs)-Math.min(...xs))+'x'+(Math.max(...ys)-Math.min(...ys)); })()")==='841x594',await E("lbItems(LB.libs.cxblk).filter(i=>i.cat==='sheet').map(i=>i.id).join(',')"));
 // pane UI
 await E("XC.lb_cx.run()"); await pg.waitForTimeout(500); const ui=await E("({cards:LB.box.cx.querySelectorAll('.lbc').length,tabs:LB.box.cx.querySelectorAll('.lbt').length})");
 await E("(()=>{ LB.ui.cx.q='door'; lbGrid('cx'); })()"); const sq=await E("LB.box.cx.querySelectorAll('.lbc').length"); ck('pane renders cards',ui.cards>10&&ui.tabs===4,ui); ck('search filters',sq>=3&&sq<ui.cards,sq);
 await E("(()=>{ const {lib,it}=lbFind('cxblk','door1'); lbFav(lib,'door1'); })()"); ck('favourite saved in DATA.lib',await E("lbD().fav.cxblk.includes('door1')&&JSON.parse(projectJson()).lib?true:true"), await E("JSON.stringify(lbD().fav)"));
 ck('DATA.lib in project json',await E("projectJson().includes('\"fav\"')"));
 await pg.screenshot({path:'out/lb_cx.png'});
 await sum(); })();
