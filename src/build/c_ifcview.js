/* ====== MOD-IFV: IFC viewer pane (pane:ifcview, command ifc_open). Opens an IFC file (picker, drag-drop, or "Project IFC" = this app's own IFC2X3 export ifc()), parses it with web-ifc (lazy: vendor/web-ifc/web-ifc-api-iife.js + vendor/web-ifc/web-ifc.wasm.b64.js, loaded by script tag only on first open, no fetch, works from file://), builds one three.js mesh per element (express ID), spatial tree, pick -> properties/quantities, isolate/hide/show, Z section, 2-point measure, visible-list CSV, counts per IFC class. No WebGL -> message, but tree/properties/counts/CSV still work (no meshes are built). Load after c_ifc.js. Globals: ifV (state), ifv* (functions). Needs THREE + OrbitControls (already in the page). ====== */
const ifV={api:null,m:-1,tok:0,gl:null,box:null,cls:new Map(),kids:new Map(),par:new Map(),elems:[],mesh:new Map(),hid:new Set(),sel:[],nm:new Map(),mats:new Map(),cnt:{},info:{},pts:[],meas:false,tab:'tree',sceneObjs:[]};
const IFV_SP=new Set(['IfcProject','IfcSite','IfcBuilding','IfcBuildingStorey']);
const ifvT=(e,a)=>b2(e,a);
const ifvScript=src=>new Promise((ok,no)=>{ const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=()=>no(new Error(ifvT('Missing file ','ملف ناقص ')+src)); document.head.appendChild(s); });
async function ifvEngine(){ if(ifV.api)return ifV.api;
 if(!window.WebIFC)await ifvScript('vendor/web-ifc/web-ifc-api-iife.js');
 if(!window.__IFV_WASM_B64)await ifvScript('vendor/web-ifc/web-ifc.wasm.b64.js');
 const bs=atob(window.__IFV_WASM_B64), bin=new Uint8Array(bs.length); for(let i=0;i<bs.length;i++)bin[i]=bs.charCodeAt(i); delete window.__IFV_WASM_B64;
 ifV.wurl=URL.createObjectURL(new Blob([bin],{type:'application/wasm'}));
 const api=new WebIFC.IfcAPI(); await api.Init(p=>p.endsWith('.wasm')?ifV.wurl:p,true); ifV.api=api; return api; }
const ifvV=x=>x==null?'':(typeof x==='object'&&'value' in x?x.value:x);
const ifvTick=()=>new Promise(r=>setTimeout(r,0));
const ifvSay=t=>{ if(ifV.st)ifV.st.textContent=t; };
const ifvDraw=()=>{ if(ifV.raf||!ifV.rd)return; ifV.raf=requestAnimationFrame(()=>{ ifV.raf=0; if(ifV.rd&&ifV.box&&ifV.box.offsetParent)ifV.rd.render(ifV.scene,ifV.cam); }); };
function ifvGL(){ if(ifV.gl!==null)return ifV.gl;
 try{ const c=document.createElement('canvas'); const rd=new THREE.WebGLRenderer({canvas:c,antialias:true}); rd.setClearColor(0x1b2330); rd.localClippingEnabled=true; ifV.rd=rd; ifV.cv=c;
  ifV.scene=new THREE.Scene(); ifV.cam=new THREE.PerspectiveCamera(45,1,.01,1000); ifV.cam.up.set(0,0,1);
  ifV.scene.add(new THREE.AmbientLight(0xffffff,.55)); const d1=new THREE.DirectionalLight(0xffffff,.8); d1.position.set(1,-2,3); ifV.scene.add(d1); const d2=new THREE.DirectionalLight(0xffffff,.35); d2.position.set(-2,1,-1); ifV.scene.add(d2);
  ifV.plane=new THREE.Plane(new THREE.Vector3(0,0,-1),1e9); ifV.ctl=new THREE.OrbitControls(ifV.cam,c); ifV.ctl.addEventListener('change',ifvDraw);
  let dn=null; c.addEventListener('pointerdown',e=>{ dn=[e.clientX,e.clientY]; }); c.addEventListener('pointerup',e=>{ if(dn&&Math.hypot(e.clientX-dn[0],e.clientY-dn[1])<4)ifvPickAt(e.clientX,e.clientY,e.shiftKey); dn=null; });
  ifV.gl=true; }catch(e){ ifV.gl=false; ifV.rd=null; }
 return ifV.gl; }
function ifvSize(){ if(!ifV.rd||!ifV.wrap)return; const w=ifV.wrap.clientWidth, h=ifV.wrap.clientHeight; if(w<10||h<10)return; ifV.rd.setSize(w,h,false); ifV.cv.style.cssText='width:100%;height:100%;display:block'; ifV.cam.aspect=w/h; ifV.cam.updateProjectionMatrix(); ifvDraw(); }
/* ---- colours: IFC colour when it has one, else a stable tint per class (the app's own export has none) ---- */
function ifvMat(c,cls){ let r=c.x,g=c.y,b=c.z,a=c.w; if(r>.98&&g>.98&&b>.98&&a>.98){ let h=0; for(const ch of cls)h=(h*31+ch.charCodeAt(0))>>>0; const col=new THREE.Color().setHSL((h%360)/360,.45,.62); r=col.r; g=col.g; b=col.b; }
 const k=[r,g,b,a].map(x=>x.toFixed(2)).join(); let m=ifV.mats.get(k); if(!m){ m=new THREE.MeshPhongMaterial({color:new THREE.Color(r,g,b),flatShading:true,side:THREE.DoubleSide,shininess:20,transparent:a<1,opacity:a,clippingPlanes:[ifV.plane]}); ifV.mats.set(k,m); } return m; }
/* ---- load ---- */
async function ifvLoad(file){ ifvClose(false); const tok=++ifV.tok; ifvBox(); ifvShowGL(); ifvSay(ifvT('Loading IFC engine...','بحمّل محرك IFC...'));
 try{ const api=await ifvEngine(); if(tok!==ifV.tok)return; let buf=new Uint8Array(await file.arrayBuffer()); const W=WebIFC;
  ifvSay(ifvT('Parsing ','بحلل ')+file.name+' ('+(buf.length/1048576).toFixed(1)+' MB)...'); await ifvTick();
  const m=api.OpenModel(buf,{COORDINATE_TO_ORIGIN:false}); buf=null; if(m<0)throw new Error(ifvT('Not a readable IFC file','مش ملف IFC مقروء')); ifV.m=m; ifV.file=file.name; ifV.info={schema:api.GetModelSchema(m),file:file.name,mb:+(file.size/1048576).toFixed(2)};
  const ids=[]; const pv=api.GetLineIDsWithType(m,W.IFCPRODUCT,true); for(let i=0;i<pv.size();i++)ids.push(pv.get(i)); pv.delete&&pv.delete();
  const cnt={}; ids.forEach(id=>{ const c=api.GetNameFromTypeCode(api.GetLineType(m,id)); ifV.cls.set(id,c); cnt[c]=(cnt[c]||0)+1; if(!IFV_SP.has(c))ifV.elems.push(id); }); ifV.cnt=cnt;
  const rel=(ty,a,b)=>{ const v=api.GetLineIDsWithType(m,ty); for(let i=0;i<v.size();i++){ const L=api.GetLine(m,v.get(i)), p=L[a]&&L[a].value; if(p==null)continue; (L[b]||[]).forEach(r=>{ const c=r.value; if(!ifV.kids.has(p))ifV.kids.set(p,[]); ifV.kids.get(p).push(c); ifV.par.set(c,p); }); } };
  rel(W.IFCRELAGGREGATES,'RelatingObject','RelatedObjects'); rel(W.IFCRELCONTAINEDINSPATIALSTRUCTURE,'RelatingStructure','RelatedElements');
  const pj=api.GetLineIDsWithType(m,W.IFCPROJECT); ifV.proj=pj.size()?pj.get(0):null; if(ifV.proj!=null){ ifV.cls.set(ifV.proj,'IfcProject'); cnt.IfcProject=1; }
  ifV.info.products=ids.length; ifV.info.elements=ifV.elems.length;
  if(ifvGL()){ ifvSize(); await ifvMeshes(ids,tok); } else ifV.info.tris=0;
  if(tok!==ifV.tok)return; ifvTree(); ifvCountsTab(); ifvTab('tree'); ifvFit(); ifvSay(ifV.info.schema+' · '+ifV.elems.length+ifvT(' elements, ',' عنصر، ')+(ifV.info.tris||0)+ifvT(' triangles',' مثلث'));
 }catch(e){ ifvSay(ifvT('Could not open: ','مقدرش يفتح: ')+(e.message||e)); } }
async function ifvMeshes(ids,tok){ const api=ifV.api,m=ifV.m; let t0=performance.now(), tris=0, n=0; const bb=new THREE.Box3(), M=new THREE.Matrix4(), v=new THREE.Vector3();
 for(const id of ids){ if(tok!==ifV.tok)return; if(ifV.cls.get(id)==='IfcOpeningElement')continue; const fm=api.GetFlatMesh(m,id), gs=fm.geometries, G=gs.size(); if(!G){ fm.delete&&fm.delete(); continue; }
  const parts=[]; let nv=0, ni=0; for(let i=0;i<G;i++){ const pg=gs.get(i), ge=api.GetGeometry(m,pg.geometryExpressID); const va=api.GetVertexArray(ge.GetVertexData(),ge.GetVertexDataSize()), ia=api.GetIndexArray(ge.GetIndexData(),ge.GetIndexDataSize());
   M.fromArray(pg.flatTransformation); const c=pg.color, cc={x:c.x,y:c.y,z:c.z,w:c.w}; ge.delete(); parts.push({va,ia,M:M.clone(),c:cc}); nv+=va.length/6; ni+=ia.length; }
  fm.delete&&fm.delete(); const pos=new Float32Array(nv*3), idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni), mats=[], grp=[]; let vo=0, io=0;
  parts.forEach(p=>{ const e=p.M.elements, k=p.va.length/6; for(let i=0;i<k;i++){ const x=p.va[i*6], y=p.va[i*6+1], z=p.va[i*6+2], o=(vo+i)*3; pos[o]=e[0]*x+e[4]*y+e[8]*z+e[12]; pos[o+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; pos[o+2]=e[2]*x+e[6]*y+e[10]*z+e[14]; }
   for(let i=0;i<p.ia.length;i++)idx[io+i]=p.ia[i]+vo; const mt=ifvMat(p.c,ifV.cls.get(id)||''); let mi=mats.indexOf(mt); if(mi<0){ mats.push(mt); mi=mats.length-1; } grp.push([io,p.ia.length,mi]); vo+=k; io+=p.ia.length; });
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setIndex(new THREE.BufferAttribute(idx,1)); grp.forEach(g=>geo.addGroup(g[0],g[1],g[2])); geo.computeBoundingBox(); geo.computeBoundingSphere();
  const me=new THREE.Mesh(geo,mats.length===1?mats[0]:mats); me.userData.id=id; me.visible=!ifV.hid.has(id); ifV.scene.add(me); ifV.mesh.set(id,me); bb.union(geo.boundingBox); tris+=ni/3; n++;
  if(performance.now()-t0>40){ ifvSay(ifvT('Building meshes ','ببني المجسمات ')+n+' / '+ids.length); await ifvTick(); t0=performance.now(); } }
 ifV.info.tris=tris; ifV.info.meshes=n; ifV.bb=bb; }
/* ---- fit, section, measure, pick ---- */
function ifvFit(){ if(!ifV.rd||!ifV.bb||ifV.bb.isEmpty())return; const c=ifV.bb.getCenter(new THREE.Vector3()), s=ifV.bb.getSize(new THREE.Vector3()), r=Math.max(s.length()/2,.01), d=r/Math.sin(ifV.cam.fov*Math.PI/360);
 ifV.cam.position.copy(c).add(new THREE.Vector3(1,-1.2,.8).normalize().multiplyScalar(d*1.05)); ifV.cam.near=d/500; ifV.cam.far=d*20; ifV.cam.updateProjectionMatrix(); ifV.ctl.target.copy(c); ifV.ctl.update();
 if(ifV.zr){ ifV.zr.min=ifV.bb.min.z; ifV.zr.max=ifV.bb.max.z; ifV.zr.step=Math.max((ifV.bb.max.z-ifV.bb.min.z)/200,1e-4); ifV.zr.value=ifV.bb.max.z; ifvSection(); } ifvDraw(); }
function ifvSection(){ if(!ifV.plane)return; ifV.plane.constant=ifV.zc&&ifV.zc.checked?+ifV.zr.value:1e9; if(ifV.zl)ifV.zl.textContent=ifV.zc&&ifV.zc.checked?'Z ≤ '+(+ifV.zr.value).toFixed(2)+' m':''; ifvDraw(); }
function ifvVisMeshes(){ const o=[]; ifV.mesh.forEach(me=>{ if(me.visible)o.push(me); }); return o; }
function ifvPickAt(cx,cy,add){ if(!ifV.rd)return null; const r=ifV.cv.getBoundingClientRect(), rc=new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1),ifV.cam);
 const hit=rc.intersectObjects(ifvVisMeshes(),false).find(h=>ifV.plane.constant>1e8||ifV.plane.distanceToPoint(h.point)>=0); if(!hit){ if(!ifV.meas)ifvSelect([]); return null; }
 if(ifV.meas){ ifvMeasure(hit.point); return hit; } ifvSelect(add?ifV.sel.concat(hit.object.userData.id):[hit.object.userData.id]); return hit; }
function ifvMeasure(p){ if(ifV.pts.length>=2)ifvMeasClear(); ifV.pts.push(p.clone()); const s=ifV.bb?ifV.bb.getSize(new THREE.Vector3()).length()*.006:.05, mk=new THREE.Mesh(new THREE.SphereGeometry(s,8,6),new THREE.MeshBasicMaterial({color:0xffd400,depthTest:false})); mk.position.copy(p); mk.renderOrder=9; ifV.scene.add(mk); ifV.sceneObjs.push(mk);
 if(ifV.pts.length===2){ const [a,b]=ifV.pts, ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:0xffd400,depthTest:false})); ln.renderOrder=9; ifV.scene.add(ln); ifV.sceneObjs.push(ln); ifV.dist=a.distanceTo(b);
  ifvSay(ifvT('Distance ','المسافة ')+ifV.dist.toFixed(3)+' m  (dx '+(b.x-a.x).toFixed(3)+', dy '+(b.y-a.y).toFixed(3)+', dz '+(b.z-a.z).toFixed(3)+')'); } else ifvSay(ifvT('Pick the second point','اختار النقطة التانية')); ifvDraw(); }
function ifvMeasClear(){ ifV.sceneObjs.forEach(o=>{ ifV.scene.remove(o); o.geometry.dispose(); o.material.dispose(); }); ifV.sceneObjs=[]; ifV.pts=[]; ifV.dist=null; ifvDraw(); }
/* ---- selection, visibility ---- */
function ifvDesc(id,out){ out=out||[]; if(!IFV_SP.has(ifV.cls.get(id))&&ifV.cls.has(id))out.push(id); (ifV.kids.get(id)||[]).forEach(k=>ifvDesc(k,out)); return out; }
function ifvSelect(ids){ ifV.sel=ids; if(ifV.hl){ ifV.scene.remove(ifV.hl); ifV.hl=null; } const bb=new THREE.Box3(); ids.forEach(i=>{ const me=ifV.mesh.get(i); if(me)bb.union(me.geometry.boundingBox); });
 if(ifV.rd&&!bb.isEmpty()){ ifV.hl=new THREE.Box3Helper(bb,0xffd400); ifV.scene.add(ifV.hl); } ifvDraw(); if(ids.length===1)ifvProps(ids[0]); else if(ifV.pp)ifV.pp.textContent=ids.length?ids.length+ifvT(' elements selected',' عنصر مختار'):ifvT('Nothing selected','مفيش اختيار')+'.'; if(ids.length)ifvTab('props'); }
function ifvVis(ids,show){ ids.forEach(i=>{ if(show)ifV.hid.delete(i); else ifV.hid.add(i); const me=ifV.mesh.get(i); if(me)me.visible=show; }); if(ifV.tr)ifV.tr.querySelectorAll('[data-id]').forEach(r=>{ r.style.opacity=ifV.hid.has(+r.dataset.id)?.4:1; }); ifvDraw(); }
const ifvIsolate=()=>{ if(!ifV.sel.length)return; const s=new Set(ifV.sel); ifvVis(ifV.elems.filter(i=>!s.has(i)),false); ifvVis(ifV.sel,true); };
const ifvHide=()=>ifvVis(ifV.sel,false), ifvShowAll=()=>ifvVis([...ifV.hid],true);
function ifvLine(id){ try{ return ifV.api.GetLine(ifV.m,id,false); }catch(e){ return {}; } }
function ifvName(id){ let n=ifV.nm.get(id); if(n==null){ n=ifvV(ifvLine(id).Name)||ifV.cls.get(id)||'#'+id; ifV.nm.set(id,n); } return n; }
function ifvStorey(id){ for(let p=ifV.par.get(id),g=0;p!=null&&g<50;p=ifV.par.get(p),g++)if(ifV.cls.get(p)==='IfcBuildingStorey')return ifvName(p); return ''; }
/* ---- tree ---- */
function ifvRow(label,ids,id,kids){ const row=kids?el('details',{},el('summary',{text:label})):el('div',{text:label,style:'padding:1px 0 1px 14px;cursor:pointer'}); const h=kids?row.firstChild:row; if(id!=null)h.dataset.id=id; h.addEventListener('click',()=>ifvSelect(ids())); h.style.cursor='pointer';
 if(kids){ row.addEventListener('toggle',()=>{ if(row.open&&!row._f){ row._f=1; const k=kids(); row.append(...k); } }); } return row; }
function ifvNode(id){ const c=ifV.cls.get(id)||'?', ks=ifV.kids.get(id)||[], sp=IFV_SP.has(c), subs=ks.filter(k=>IFV_SP.has(ifV.cls.get(k))), els=ks.filter(k=>!IFV_SP.has(ifV.cls.get(k))); const lab=(sp?c.replace('Ifc','')+': ':'')+ifvName(id)+(sp?'':'  ['+c+']');
 if(!sp&&!ks.length)return ifvRow(lab,()=>[id],id); if(!sp)return ifvRow(lab,()=>ifvDesc(id),id,()=>ks.map(ifvNode));
 return ifvRow(lab+'  ('+ifvDesc(id).length+')',()=>ifvDesc(id),id,()=>[...subs.map(ifvNode),...ifvGroups(els)]); }
function ifvGroups(els){ const g={}; els.forEach(e=>(g[ifV.cls.get(e)]=g[ifV.cls.get(e)]||[]).push(e)); return Object.keys(g).sort().map(c=>ifvRow(c+'  ('+g[c].length+')',()=>g[c].flatMap(e=>ifvDesc(e)),null,()=>g[c].map(ifvNode))); }
function ifvTree(){ ifV.tr.textContent=''; if(ifV.proj==null){ ifV.tr.append(...ifvGroups(ifV.elems)); return; } const r=ifvNode(ifV.proj); ifV.tr.append(r); r.open=true; r.dispatchEvent(new Event('toggle'));
 const un=ifV.elems.filter(e=>!ifV.par.has(e)); if(un.length)ifV.tr.append(ifvRow(ifvT('Unassigned','غير مربوط')+'  ('+un.length+')',()=>un.flatMap(e=>ifvDesc(e)),null,()=>ifvGroups(un))); }
function ifvCountsTab(){ const t=ifV.cn; t.textContent=''; const rows=Object.keys(ifV.cnt).sort((a,b)=>ifV.cnt[b]-ifV.cnt[a]||(a<b?-1:1)); const tb=el('table',{style:'border-collapse:collapse;width:100%'}); rows.forEach(k=>tb.append(el('tr',{},el('td',{text:k,style:'padding:1px 6px'}),el('td',{text:ifV.cnt[k],style:'text-align:right;padding:1px 6px'}))));
 t.append(el('div',{class:'small',text:ifV.info.schema+' · '+ifV.info.file+' · '+ifV.info.mb+' MB · '+ifV.info.products+ifvT(' products, ',' منتج، ')+(ifV.info.meshes||0)+ifvT(' with geometry',' بهندسة')}),tb); }
const ifvCounts=()=>({...ifV.cnt});
/* ---- properties ---- */
async function ifvProps(id){ const api=ifV.api,m=ifV.m, L=ifvLine(id), rows=[[ifvT('Class','الفئة'),ifV.cls.get(id)],['ExpressID',id],[ifvT('Name','الاسم'),ifvV(L.Name)],['GlobalId',ifvV(L.GlobalId)],['ObjectType',ifvV(L.ObjectType)],['Tag',ifvV(L.Tag)],[ifvT('Storey','الدور'),ifvStorey(id)]], P=ifV.pp; P.textContent='';
 const tb=(h,rs)=>{ P.append(el('b',{text:h,style:'display:block;margin-top:6px'})); const t=el('table',{style:'width:100%;border-collapse:collapse;font-size:12px'}); rs.forEach(r=>{ if(r[1]===''||r[1]==null)return; t.append(el('tr',{},el('td',{text:r[0],style:'opacity:.7;padding:1px 4px;vertical-align:top'}),el('td',{text:r[1],style:'padding:1px 4px;word-break:break-all'}))); }); P.append(t); };
 tb(ifvT('Identity','الهوية'),rows); try{ const ps=await api.properties.getPropertySets(m,id,false); if(ifV.sel.length!==1||ifV.sel[0]!==id)return;
  ps.forEach(p=>{ const q=p.Quantities&&!p.HasProperties, items=(p.HasProperties||p.Quantities||[]).map(r=>ifvLine(r.value)); tb((q?ifvT('Quantities: ','كميات: '):ifvT('Pset: ','خصائص: '))+ifvV(p.Name),items.map(i=>{ const k=['NominalValue','LengthValue','AreaValue','VolumeValue','CountValue','WeightValue','TimeValue'].find(k=>i[k]!==undefined); return [ifvV(i.Name),k?ifvV(i[k]):'']; })); }); if(!ps.length)P.append(el('div',{class:'small',text:ifvT('No property sets.','مفيش مجموعات خصائص.')})); }catch(e){ P.append(el('div',{class:'small',text:String(e.message||e)})); } }
/* ---- CSV of the visible list ---- */
function ifvCsv(){ const q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"', ids=ifV.elems.filter(i=>!ifV.hid.has(i)); return 'ExpressID,GlobalId,Class,Name,Storey,ObjectType\n'+ids.map(i=>{ const L=ifvLine(i); return [i,q(ifvV(L.GlobalId)),ifV.cls.get(i),q(ifvName(i)),q(ifvStorey(i)),q(ifvV(L.ObjectType))].join(','); }).join('\n')+'\n'; }
const ifvExport=()=>{ if(ifV.m<0)return; out('XTO_ifc_visible.csv',ifvCsv()); };
/* ---- close / dispose ---- */
function ifvClose(full){ ifV.tok++; ifvMeasClear&&ifV.scene&&ifvMeasClear(); if(ifV.hl&&ifV.scene){ ifV.scene.remove(ifV.hl); ifV.hl=null; }
 ifV.mesh.forEach(me=>{ ifV.scene.remove(me); me.geometry.dispose(); }); ifV.mesh.clear(); ifV.mats.forEach(m=>m.dispose()); ifV.mats.clear();
 if(ifV.m>=0){ try{ ifV.api.CloseModel(ifV.m); }catch(e){} ifV.m=-1; }
 ifV.cls.clear(); ifV.kids.clear(); ifV.par.clear(); ifV.nm.clear(); ifV.hid.clear(); ifV.elems=[]; ifV.sel=[]; ifV.cnt={}; ifV.info={}; ifV.bb=null;
 if(ifV.tr){ ifV.tr.textContent=''; ifV.cn.textContent=''; ifV.pp.textContent=''; }
 if(full&&ifV.rd){ ifV.ctl.dispose(); ifV.rd.dispose(); try{ ifV.rd.forceContextLoss(); }catch(e){} ifV.rd=null; ifV.gl=null; ifV.cv.remove(); } ifvDraw(); }
/* ---- pane ---- */
function ifvBox(){ if(ifV.box)return; const B=(t,f,ti)=>el('button',{text:t,onclick:f,title:ti||t,style:'margin:0 2px'}), fi=el('input',{type:'file',accept:'.ifc',style:'display:none'}); fi.onchange=()=>{ if(fi.files[0])ifvLoad(fi.files[0]); fi.value=''; };
 ifV.zc=el('input',{type:'checkbox',onchange:ifvSection}); ifV.zr=el('input',{type:'range',min:0,max:1,step:.01,style:'width:90px',oninput:ifvSection}); ifV.zl=el('span',{class:'small'}); ifV.st=el('span',{class:'small',style:'flex:1;padding:0 6px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis'});
 const me=el('button',{text:ifvT('Measure','قياس'),style:'margin:0 2px',onclick:()=>{ ifV.meas=!ifV.meas; me.style.outline=ifV.meas?'2px solid #ffd400':''; ifvMeasClear(); ifvSay(ifV.meas?ifvT('Pick two points on the model','اختار نقطتين على المجسم'):''); }});
 const bar=el('div',{style:'display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:3px;border-bottom:1px solid var(--line)'},B(ifvT('Open IFC','افتح IFC'),()=>fi.click()),B(ifvT('Project IFC','IFC المشروع'),()=>{ try{ ifvLoad(new File([ifc()],'LiftStation.ifc')); }catch(e){ ifvSay(String(e.message||e)); } },ifvT('Load this app\'s own IFC2X3 export','حمّل تصدير IFC بتاع المشروع')),B(ifvT('Fit','ملاءمة'),ifvFit),
  B(ifvT('Isolate','عزل'),ifvIsolate),B(ifvT('Hide','إخفاء'),ifvHide),B(ifvT('Show all','إظهار الكل'),ifvShowAll),me,el('label',{class:'small'},ifV.zc,ifvT(' Section Z ',' قطاع Z ')),ifV.zr,ifV.zl,B('CSV',ifvExport,ifvT('Export visible elements','صدّر العناصر الظاهرة')),B(ifvT('Close model','اقفل الموديل'),()=>{ ifvClose(false); ifvSay(''); }),fi,ifV.st);
 ifV.wrap=el('div',{style:'flex:1;min-width:0;position:relative;background:#1b2330'}); ifV.msg=el('div',{style:'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;color:#cbd5e1;pointer-events:none;line-height:1.7',text:ifvT('Drop an IFC file here, or use Open IFC','سيب ملف IFC هنا، أو استخدم افتح IFC')});
 ifV.tr=el('div',{style:'font-size:12px;flex:1;overflow:auto;padding:4px'}); ifV.pp=el('div',{style:'font-size:12px;flex:1;overflow:auto;padding:4px',text:ifvT('Click an element in the view or tree.','اضغط على عنصر في المجسم أو الشجرة.')}); ifV.cn=el('div',{style:'font-size:12px;flex:1;overflow:auto;padding:4px'});
 ifV.tabs={tree:ifV.tr,props:ifV.pp,counts:ifV.cn}; const tb=el('div',{style:'display:flex;border-bottom:1px solid var(--line)'},...['tree','props','counts'].map(k=>el('button',{text:{tree:ifvT('Tree','الشجرة'),props:ifvT('Properties','الخصائص'),counts:ifvT('Counts','الأعداد')}[k],onclick:()=>ifvTab(k),style:'flex:1'})));
 ifV.side=el('div',{style:'width:270px;flex:none;display:flex;flex-direction:column;border-inline-start:1px solid var(--line);min-height:0'},tb,ifV.tr,ifV.pp,ifV.cn);
 ifV.box=el('div',{id:'ifvbox',style:'display:flex;flex-direction:column;height:100%;min-height:0;direction:ltr;color:var(--fg);background:var(--bg)'},bar,el('div',{style:'display:flex;flex:1;min-height:0'},ifV.wrap,ifV.side)); ifvTab('tree');
 ifV.box.addEventListener('dragover',e=>e.preventDefault()); ifV.box.addEventListener('drop',e=>{ e.preventDefault(); const f=e.dataTransfer.files[0]; if(f)ifvLoad(f); });
 ifV.wrap.append(ifV.msg); try{ new ResizeObserver(ifvSize).observe(ifV.wrap); }catch(e){} }
function ifvTab(k){ ifV.tab=k; Object.keys(ifV.tabs).forEach(t=>{ ifV.tabs[t].style.display=t===k?'block':'none'; }); }
function ifvShowGL(){ if(!ifvGL()){ ifV.msg.textContent=ifvT('The 3D view needs WebGL and this browser does not provide it. Tree, properties, counts and CSV still work.','العرض ثلاثي الأبعاد محتاج WebGL والمتصفح ده مش موفره. الشجرة والخصائص والأعداد وCSV لسه شغالين.'); ifV.msg.style.pointerEvents='none'; return; }
 if(!ifV.cv.parentNode)ifV.wrap.prepend(ifV.cv); ifV.msg.style.display='none'; ifvSize(); }
const IFVDEF={t:['IFC viewer','عارض IFC'],ic:'bim',el:()=>{ ifvBox(); return ifV.box; }};
{ const _wd=wxDefs; wxDefs=function(){ _wd(); WX.defs['pane:ifcview']=IFVDEF; }; } try{ WX.defs['pane:ifcview']=IFVDEF; }catch(e){}
const ifvOpen=()=>{ wxOpen('pane:ifcview',[.08,.06,.84,.86]); setTimeout(()=>{ ifvShowGL(); ifvSize(); },60); };
const ifvIsOpen=()=>{ const l=WX.lay['pane:ifcview']; return !!(l&&l.open); };
XCMD('ifc_open','bim','IFC viewer (open and inspect an IFC file)','عارض IFC (افتح وافحص ملف IFC)',ifvOpen,ifvIsOpen);
{ const _wc=wxClose; wxClose=function(id){ const r=_wc.apply(this,arguments); if(id==='pane:ifcview')setTimeout(()=>{ if(!ifvIsOpen())ifvClose(true); },50); return r; }; }
