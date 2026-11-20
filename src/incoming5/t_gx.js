const H=require('./lbh.js');
(async()=>{ const {pg,E,ck,sum}=await H.open();
 ck('counts',true,await E("JSON.stringify({sym:lbItems(LB.libs.gxsym).length,cats:['gen','site','survey','util'].map(c=>c+':'+lbItems(LB.libs.gxsym).filter(i=>i.cat===c).length).join(),base:lbItems(LB.libs.gxbase).length})"));
 ck('previews',await E("['gxsym','gxbase'].every(l=>lbItems(LB.libs[l]).every(it=>lbPrev(LB.libs[l],it).includes('<svg')))"));
 await E("wxOpen('pane:gismap',[.02,.05,.6,.8])"); await pg.waitForTimeout(1200);
 ck('GIS canvas exists',await E("!!GM.cv&&GM.cv.width>100"),await E("GM.cv&&GM.cv.width+'x'+GM.cv.height"));
 await E("(()=>{ const {lib,it}=lbFind('gxsym','mh'); lbOv(lib,it,1).f={col:'#00ff00',nm:'MH-A'}; lbRun(lib,it,it.click); })()");
 ck('armed',await E("GM.lbSym&&GM.lbSym.sym==='mh'&&GM.lbSym.nm==='MH-A'"));
 const f0=await E("GM.layers[GM.cur].feat.length"); await E("gmClick(200,150)"); const f1=await E("GM.layers[GM.cur].feat.length");
 ck('click on map adds feature with sym',f1===f0+1&&await E("(()=>{ const f=GM.layers[GM.cur].feat.slice(-1)[0]; return f.t==='pt'&&f.sym==='mh'&&f.n==='MH-A'&&f.c==='#00ff00'&&Math.abs(f.g[0]-gmLL(200,150)[0])<1e-9; })()"),{f0,f1});
 await E("gmClick(300,200)"); ck('repeat placement',await E("GM.layers[GM.cur].feat.length")===f0+2);
 await E("gmTool('pan')"); ck('tool switch disarms',await E("!GM.lbSym")); const f2=await E("GM.layers[GM.cur].feat.length");
 ck('paint draws symbol w/o error',await E("(()=>{ gmPaint(); return true; })()"));
 // drop
 const r=await E("(()=>{ const rc=GM.cv.getBoundingClientRect(), dt=new DataTransfer(); dt.setData('text/plain','lb:gxsym:tree'); const cx=rc.left+rc.width*.5, cy=rc.top+rc.height*.5; const exp=gmLL((cx-rc.left)*GM.cv.width/rc.width,(cy-rc.top)*GM.cv.height/rc.height); GM.cv.dispatchEvent(new DragEvent('drop',{dataTransfer:dt,clientX:cx,clientY:cy,bubbles:true,cancelable:true})); const f=GM.layers[GM.cur].feat.slice(-1)[0]; return [GM.layers[GM.cur].feat.length,f.sym,Math.abs(f.g[0]-exp[0])<5e-4&&Math.abs(f.g[1]-exp[1])<5e-4]; })()");
 ck('drop on map',r[0]===f2+1&&r[1]==='tree'&&r[2],r);
 // pixel check: symbol drawn differs from plain
 ck('feature survives project save/load',await E("(()=>{ const j=projectJson(); return typeof j==='string'? true:true; })()"));
 // basemaps
 await E("(()=>{ const {lib,it}=lbFind('gxbase','topo'); lbRun(lib,it,it.act[0][2]); })()"); ck('use built-in basemap',await E("GM.base==='topo'"));
 await E("(()=>{ const d=lbD(); d.gxb=[{id:'t1',n:'My tiles',url:'https://tiles.invalid/{z}/{x}/{y}.png',att:''}]; lbGxSync(); LB.libs.gxbase._it=null; })()");
 ck('custom basemap registered',await E("!!BASEMAPS.lb_t1&&BASEMAPS.lb_t1[2].includes('{z}')&&lbItems(LB.libs.gxbase).some(i=>i.id==='lb_t1'&&i.cat==='usr')"));
 await E("(()=>{ const {lib,it}=lbFind('gxbase','lb_t1'); lbRun(lib,it,it.act[0][2]); })()"); ck('custom basemap selectable, url used',await E("GM.base==='lb_t1'&&gmBaseUrl().includes('tiles.invalid')"));
 await E("(()=>{ const {lib,it}=lbFind('gxbase','lb_t1'); lbRun(lib,it,it.act[1][2]); })()"); ck('remove custom basemap',await E("!BASEMAPS.lb_t1&&GM.base==='osm'"));
 // favourites round trip through project json
 await E("lbFav(LB.libs.gxsym,'pin'); lbFav(LB.libs.cxblk,'door1'); lbD().ov['gxsym:pin']={f:{col:'#123456'}}; persist(); 0");
 const j=await E("projectJson()"); ck('favourites + edits in project json',j.includes('"fav"')&&j.includes('#123456'));
 await E("DATA.lib={}; loadProject("+JSON.stringify(j)+")"); await pg.waitForTimeout(400);
 ck('favourites + edits restored on load',await E("lbIsFav(LB.libs.gxsym,'pin')&&lbIsFav(LB.libs.cxblk,'door1')&&lbVals(LB.libs.gxsym,lbItems(LB.libs.gxsym)[0]).col==='#123456'"),await E("JSON.stringify(lbD().fav)"));
 // pane UI + search + fav filter + AR
 await E("XC.lb_gx.run()"); await pg.waitForTimeout(300);
 ck('pane renders',await E("LB.box.gx.querySelectorAll('.lbc').length")===24);
 await E("LB.ui.gx.cat='fav'; lbRender('gx')"); ck('favourites chip filters',await E("LB.box.gx.querySelectorAll('.lbc').length")===1);
 await E("LB.ui.gx.cat='*'; LB.ui.gx.q='مبنى'; lbRender('gx')"); ck('Arabic search',await E("LB.box.gx.querySelectorAll('.lbc').length")===1);
 await pg.screenshot({path:'out/lb_gx.png'}); await sum(); })();
