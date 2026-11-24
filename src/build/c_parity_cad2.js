/* ====== c_parity_cad2.js: the last 35 AutoCAD (C.X) ribbon stubs made real on the CAD editor (cadD().ents). Same rules as c_parity_cad.js: input by prompt() / PXX.dlg, every change goes through cadCommit() -> persist() -> hiSnap() (Ctrl+Z works).
   New entity flags: gr:[c1,c2,deg] gradient fill, wo:1 wipeout, att:{tag,pr,df} attribute definition, attv:tag attribute value, bk/bi block reference name/instance (cadD().binst[bi] = {nm,p,k,rot}).
   New drawing data: blocks edited in place (cadD().bedit + beStash), xrefs (cadD().xrefs: DXF / image / PDF underlays with clip), dlinks (data links), apps (loaded .scr scripts), psetups/pscur (page setups), plotter, vpc (viewports), std (CAD standard, also in localStorage).
   Honest: DWF export (closed Autodesk format). Internals for tests: PXC2. ====== */
const PXC2={};
(function(){
const ov=(tab,panel,en,help,run)=>PXX.ov('draft',tab,panel,en,help,run), D=()=>cadD(), ask=PCX.ask, xy=PCX.xy, esc=PXX.esc;
function open(){ try{ if(!CS.open)XC.cad.run(); }catch(e){} }
function sel(){ open(); return [...CS.sel].filter(i=>D().ents[i]); }
function done(msg){ cadCommit(); xSt(msg); CS.msg=msg; try{ cadLayers(); cadPrompt(); cadRender(); }catch(e){} return msg; }
const mouse=()=>CS.mouse[0].toFixed(1)+','+CS.mouse[1].toFixed(1);
const eid=e=>e.id||(e.id='k'+(++PCX.n)+Date.now().toString(36));
const isHex=s=>/^#[0-9a-f]{6}$/i.test(s||'');
const fmtL=v=>Math.abs(v)>=100?v.toFixed(0):v.toFixed(2);

/* ---------- drawing of the new flags ---------- */
{ const _es=cadEntSvg; cadEntSvg=function(e,s,paper){ let r=_es(e,s,paper); if(!e||e.t!=='pl')return r;
  if(e.gr){ const id='xg'+String(eid(e)).replace(/\W/g,''); r='<defs><linearGradient id="'+id+'" gradientTransform="rotate('+(-(+e.gr[2]||0))+' .5 .5)"><stop offset="0" stop-color="'+e.gr[0]+'"/><stop offset="1" stop-color="'+e.gr[1]+'"/></linearGradient></defs>'+r.replace('fill="none"','fill="url(#'+id+')"'); }
  if(e.wo){ r=r.replace('fill="none"','fill="'+(paper?'#ffffff':'#1b1d21')+'"'); if(D().woF===0&&!s)r=r.replace(/stroke="[^"]*"/,'stroke="none"'); }
  return r; }; }

/* ---------- Gradient: two-colour linear fill of closed objects, placed BEHIND its boundary (draw order like HPDRAWORDER "behind boundary") ---------- */
ov('Home','Draw','Gradient',['Fill closed objects with a two-colour gradient (colour 1, colour 2, angle)','املأ العناصر المقفولة بتدرج لونين (لون 1، لون 2، الزاوية)'],()=>{ const ids=sel().filter(i=>c2Poly(D().ents[i])); if(!ids.length){ xSt(b2('Select closed objects (rectangle, closed polyline, circle) first.','اختار عناصر مقفولة (مستطيل، بوليلاين مقفول، دايرة) الأول.')); return; }
 const a=(ask('Gradient: colour1, colour2, angle (deg)','تدرج: لون1، لون2، الزاوية','#4fc3f7,#1565c0,0')||'').split(',').map(s=>s.trim()); if(!isHex(a[0])||!isHex(a[1])){ xSt(b2('Use two colours like #4fc3f7,#1565c0,45','استخدم لونين زي #4fc3f7,#1565c0,45')); return; }
 PCX.ensureLay('HATCH','#9e9e9e'); const ents=D().ents; ids.sort((x,y)=>y-x).forEach(i=>{ const g={t:'pl',p:c2Poly(ents[i]).map(q=>[q[0],q[1]]),cl:true,ly:'HATCH',gr:[a[0].toLowerCase(),a[1].toLowerCase(),+a[2]||0]}; eid(g); ents.splice(i,0,g); });
 CS.sel.clear(); return done(b2(ids.length+' gradient fill(s)','عدد '+ids.length+' تعبئة متدرجة')); });

/* ---------- Wipeout (Draw and Markup): a closed polygon filled with the background colour that masks what is under it. From a selected closed polyline, or typed points. Option F toggles the frames. ---------- */
function wipeout(){ open(); const ids=[...CS.sel].filter(i=>{ const e=D().ents[i]; return e&&e.t==='pl'&&e.cl; });
 if(ids.length){ ids.forEach(i=>{ const e=D().ents.splice(i,1)[0]; e.wo=1; D().ents.push(e); }); CS.sel.clear(); return done(b2(ids.length+' polyline(s) turned into wipeouts','عدد '+ids.length+' بوليلاين اتحولوا لماسك')); }
 const a=(ask('Wipeout points x,y x,y x,y ... (or F = frames on/off)','نقط الماسك x,y x,y x,y ... (أو F = الإطار)','0,0 20,0 20,10 0,10')||'').trim(); if(!a)return;
 if(/^f$/i.test(a)){ D().woF=D().woF===0?1:0; return done(b2('Wipeout frames '+(D().woF?'on':'off'),'إطار الماسك '+(D().woF?'ظاهر':'مخفي'))); }
 const P=a.split(/\s+/).map(xy); if(P.length<3||P.some(q=>!q)){ xSt(b2('Give at least 3 points like 0,0 20,0 20,10','اكتب 3 نقط على الأقل زي 0,0 20,0 20,10')); return; }
 cadAdd({t:'pl',p:P,cl:true,wo:1}); CS.sel=new Set([D().ents.length-1]); return done(b2('Wipeout created','اتعمل ماسك')); }
const woHelp=['Wipeout: mask what is under a closed area with the background colour (F turns frames on/off)','ماسك: يغطي اللي تحت مساحة مقفولة بلون الخلفية (F للإطار)'];
ov('Home','Draw','Wipeout',woHelp,wipeout); ov('Annotate','Markup','Wipeout',woHelp,wipeout);

/* ---------- Blocks: insert with attributes + references (bk/bi), block editor in place, attribute definitions ---------- */
function binsert(nm,p,k,rot,vals,bi){ const B=D().blocks[nm]; bi=bi||('bi'+(++PCX.n)+Date.now().toString(36)); const ca=Math.cos(rot), sa=Math.sin(rot), T=q=>[p[0]+(q[0]*ca-q[1]*sa)*k,p[1]+(q[0]*sa+q[1]*ca)*k];
 (D().binst=D().binst||{})[bi]={nm,p:p.slice(),k,rot}; let n=0;
 B.forEach(e=>{ let o; if(e.t==='r')o={t:'pl',p:[[e.x1,e.y1],[e.x2,e.y1],[e.x2,e.y2],[e.x1,e.y2]].map(T),cl:true,ly:e.ly}; else { o=mapE(e,T); if(o.t==='c')o.r*=k; if(o.t==='tx')o.h*=k; if(o.t==='dim'&&o.off)o.off*=k; }
  if(o.att){ const a=o.att; let v=vals?vals[a.tag]:undefined; if(v==null)v=vals?a.df:prompt(b2('Attribute ','الخاصية ')+a.tag+': '+(a.pr||''),a.df||''); o.s=v==null?(a.df||''):String(v); o.attv=a.tag; delete o.att; }
  delete o.id; o.bk=nm; o.bi=bi; o.ly=o.ly||D().cur; D().ents.push(o); n++; }); return n; }
{ const _cc=cadClick; cadClick=function(p){ if(CS.tool==='binsert'){ const names=Object.keys(D().blocks||{}); if(!names.length){ xSt(b2('No blocks yet: select objects and use Create Block.','مفيش بلوكات: اختار عناصر واستخدم إنشاء بلوك.')); return; }
   const nm=prompt(b2('Block to insert: ','البلوك المطلوب: ')+names.join(', '),names[names.length-1]); if(!nm||!D().blocks[nm])return; const k=+prompt(b2('Scale','المقياس'),'1')||1, rot=(+prompt(b2('Rotation (degrees)','الدوران (درجات)'),'0')||0)*Math.PI/180;
   binsert(nm,p,k,rot); cadCommit(); return; } return _cc.apply(this,arguments); }; }
PXC2.binsert=binsert;
function bedit(){ open(); const d=D(); d.blocks=d.blocks||{};
 if(d.bedit){ const nm=d.bedit.nm; d.blocks[nm]=d.ents.map(e=>{ const o=JSON.parse(JSON.stringify(e)); delete o.bk; delete o.bi; return o; }); d.ents=d.beStash||[]; delete d.beStash; delete d.bedit;
  const inst=d.binst||{}, by={}; d.ents.forEach(e=>{ if(e.bk===nm&&inst[e.bi]){ by[e.bi]=by[e.bi]||{}; if(e.attv)by[e.bi][e.attv]=e.s; } }); const bis=Object.keys(by);
  d.ents=d.ents.filter(e=>!(e.bk===nm&&by[e.bi])); bis.forEach(bi=>{ const I=inst[bi]; binsert(nm,I.p,I.k,I.rot,by[bi],bi); }); CS.sel.clear(); try{ cadZoomExt(); }catch(e){}
  return done(b2('Block '+nm+' saved ('+d.blocks[nm].length+' objects), '+bis.length+' reference(s) updated','البلوك '+nm+' اتحفظ ('+d.blocks[nm].length+' عنصر)، اتحدث '+bis.length+' مرجع')); }
 const names=Object.keys(d.blocks); const nm=(prompt(b2('Block to edit (or a new name): ','البلوك اللي هيتعدل (أو اسم جديد): ')+names.join(', '),names[names.length-1]||'B1')||'').trim(); if(!nm)return;
 d.blocks[nm]=d.blocks[nm]||[]; d.beStash=d.ents; d.ents=d.blocks[nm].map(e=>JSON.parse(JSON.stringify(e))); d.bedit={nm}; CS.sel.clear(); try{ cadZoomExt(); }catch(e){}
 return done(b2('Block editor: '+nm+'. The base point is 0,0. Draw / edit, then run Edit Block again to save and update every reference.','محرر البلوك: '+nm+'. نقطة الأساس 0,0. ارسم / عدّل وبعدين شغّل تحرير البلوك تاني للحفظ وتحديث كل المراجع.')); }
const beHelp=['Block editor: open a block definition, edit it at its base point, run again to save; every reference updates','محرر البلوك: افتح تعريف البلوك، عدّله عند نقطة الأساس، شغّله تاني للحفظ؛ كل المراجع تتحدث'];
ov('Home','Block','Edit',beHelp,bedit); ov('Insert','Block','Edit Block',beHelp,bedit);
ov('Home','Block','Define Attributes',['Define a block attribute (tag, prompt, default); inserting the block asks for its value','عرّف خاصية للبلوك (الوسم، السؤال، الافتراضي)؛ إدراج البلوك يسأل عن قيمتها'],()=>{ open(); const a=(ask('Attribute: TAG|Prompt|Default','الخاصية: الوسم|السؤال|الافتراضي','TAG|Enter value|')||'').split('|'), tag=(a[0]||'').trim().toUpperCase().replace(/\s+/g,'_'); if(!tag)return;
 const p=xy(ask('Insertion point x,y','نقطة الإدراج x,y',mouse())); if(!p)return; cadAdd({t:'tx',x:p[0],y:p[1],h:D().th||2.5,s:tag,ly:'TEXT',att:{tag,pr:(a[1]||tag).trim(),df:(a[2]||'').trim()}}); CS.sel=new Set([D().ents.length-1]);
 return done(b2('Attribute '+tag+' defined: include it when you Create Block','الخاصية '+tag+' اتعرفت: ضمّها لما تعمل إنشاء بلوك')); });

/* ---------- External references: DXF / image (Attach), PDF underlay (Underlay), rectangular clip (Clip). Drawn faded under the drawing, not editable, saved with the drawing. ---------- */
function xrSvg(paper){ return (D().xrefs||[]).filter(x=>x.on!==0).map(x=>{ const inner=x.img?'<image href="'+x.img+'" x="0" y="'+(-x.h)+'" width="'+x.w+'" height="'+x.h+'" preserveAspectRatio="none" opacity="'+(x.fade||.7)+'"/>':x.ents.map(e=>cadEntSvg(Object.assign({},e,{c:paper?'#777777':'#8a8f98'}),false,paper)).join('');
  const c=x.clip, cid='xc'+String(x.id).replace(/\W/g,''); return (c?'<clipPath id="'+cid+'"><rect x="'+Math.min(c[0],c[2])+'" y="'+(-Math.max(c[1],c[3]))+'" width="'+Math.abs(c[2]-c[0])+'" height="'+Math.abs(c[3]-c[1])+'"/></clipPath>':'')+'<g'+(c?' clip-path="url(#'+cid+')"':'')+'><g transform="translate('+x.x+' '+(-x.y)+') scale('+x.k+')">'+inner+'</g></g>'; }).join(''); }
{ const _r=cadRender; cadRender=function(){ _r.apply(this,arguments); try{ const g=CW.querySelector('#cg'); if(g&&D().xrefs&&D().xrefs.length)g.insertAdjacentHTML('afterbegin',xrSvg(false)); vpSync(); }catch(e){} }; }
{ const _x=cadExportSvg; cadExportSvg=function(){ const s=_x.apply(this,arguments); return D().xrefs&&D().xrefs.length?s.replace(/(<rect[^>]*fill="#fff"\/>)/,'$1'+xrSvg(true)):s; }; }
function addXref(x){ const d=D(); d.xrefs=d.xrefs||[]; let nm=x.nm, i=1; while(d.xrefs.some(r=>r.nm===nm))nm=x.nm+'_'+(++i); x.nm=nm; x.id='x'+(++PCX.n)+Date.now().toString(36); d.xrefs.push(x); try{ cadZoomExt(); }catch(e){} return x; }
const fileUrl=f=>new Promise(r=>{ const rd=new FileReader(); rd.onload=()=>r(rd.result); rd.readAsDataURL(f); });
const imgSize=u=>new Promise(r=>{ const i=new Image(); i.onload=()=>r([i.naturalWidth||100,i.naturalHeight||100]); i.onerror=()=>r([100,100]); i.src=u; });
async function attachFile(f){ open(); const p=xy(ask('Insertion point x,y','نقطة الإدراج x,y','0,0'))||[0,0], k=+ask('Scale','المقياس','1')||1;
 if(/\.dxf$/i.test(f.name)){ const r=cadDxfParse(await f.text()); if(!r.ents.length)throw new Error(b2('No drawable entities in the DXF.','مفيش عناصر قابلة للرسم في الـDXF.')); const x=addXref({nm:f.name.replace(/\.\w+$/,''),kind:'dxf',ents:r.ents,x:p[0],y:p[1],k,clip:null}); return done(b2('Xref '+x.nm+' attached ('+r.ents.length+' objects)','اتربط المرجع '+x.nm+' ('+r.ents.length+' عنصر)')); }
 if(/\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(f.name)){ const u=await fileUrl(f), sz=await imgSize(u), w=+ask('Image width in drawing units','عرض الصورة بوحدات الرسم',String(sz[0]))||sz[0]; const x=addXref({nm:f.name.replace(/\.\w+$/,''),kind:'img',img:u,w,h:w*sz[1]/sz[0],x:p[0],y:p[1],k,clip:null}); return done(b2('Image '+x.nm+' attached','اتربطت الصورة '+x.nm)); }
 if(/\.dwg$/i.test(f.name))throw new Error(b2('DWG cannot be read in a browser: save it as DXF in AutoCAD (or the free ODA File Converter) and attach the DXF.','الـDWG ما يتقريش في المتصفح: احفظه DXF في أوتوكاد (أو ODA File Converter) واربط الـDXF.'));
 throw new Error(b2('Use DXF, PNG, JPG, SVG (or Underlay for PDF).','استخدم DXF أو PNG أو JPG أو SVG (أو الطبقة السفلية للـPDF).')); }
PXC2.attachFile=attachFile;
ov('Insert','Reference','Attach',['Attach an external reference: a DXF drawing or an image, shown faded and kept separate from your drawing','اربط مرجع خارجي: لوحة DXF أو صورة، بتظهر باهتة ومنفصلة عن رسمتك'],()=>PXX.pick('.dxf,.dwg,.png,.jpg,.jpeg,.gif,.webp,.svg').then(attachFile));
async function pdfPage(f){ const lib=await pfLib(), doc=await lib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise; const pn=Math.min(doc.numPages,Math.max(1,+ask('Page (1-'+doc.numPages+')','الصفحة (1-'+doc.numPages+')','1')||1)); return {lib,page:await doc.getPage(pn),pn}; }
async function underlayFile(f){ open(); if(!/\.pdf$/i.test(f.name))throw new Error(b2('Underlay reads PDF files. DWF and DGN are closed formats: print them to PDF first.','الطبقة السفلية بتقرا PDF. الـDWF والـDGN صيغ مقفولة: اطبعهم PDF الأول.'));
 const {page,pn}=await pdfPage(f), vp=page.getViewport({scale:2}), c=document.createElement('canvas'); c.width=vp.width; c.height=vp.height; await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
 const k=+ask('Scale (1 = 1 drawing unit per mm of paper)','المقياس (1 = وحدة رسم لكل مم ورق)','1')||1, p=xy(ask('Insertion point x,y','نقطة الإدراج x,y','0,0'))||[0,0], w=vp.width/2*25.4/72;
 const x=addXref({nm:f.name.replace(/\.\w+$/,'')+'_p'+pn,kind:'pdf',img:c.toDataURL('image/png'),w,h:w*vp.height/vp.width,x:p[0],y:p[1],k,clip:null,fade:.55}); return done(b2('PDF underlay '+x.nm+' attached ('+fmtL(w*k)+' x '+fmtL(x.h*k)+')','اتربطت طبقة PDF '+x.nm)); }
PXC2.underlayFile=underlayFile;
ov('Insert','Reference','Underlay',['Attach a PDF page as an underlay (faded, to scale) to trace over','اربط صفحة PDF كطبقة سفلية (باهتة وبالمقياس) للرسم فوقها'],()=>PXX.pick('.pdf,.dwf,.dwfx,.dgn').then(underlayFile));
ov('Insert','Reference','Clip',['Clip an attached reference to a rectangle (x1,y1,x2,y2) or OFF to remove the clip','قص مرجع مربوط بمستطيل (x1,y1,x2,y2) أو OFF لإلغاء القص'],()=>{ open(); const X=D().xrefs||[]; if(!X.length){ xSt(b2('Attach a reference first.','اربط مرجع الأول.')); return; }
 const nm=X.length===1?X[0].nm:prompt(b2('Reference: ','المرجع: ')+X.map(x=>x.nm).join(', '),X[X.length-1].nm), x=X.find(r=>r.nm===nm); if(!x)return;
 const a=(ask('Clip rectangle x1,y1,x2,y2 (or OFF)','مستطيل القص x1,y1,x2,y2 (أو OFF)',x.clip?x.clip.join(','):'0,0,50,50')||'').trim(); if(/^off$/i.test(a)){ x.clip=null; return done(b2('Clip removed from '+x.nm,'اتشال القص من '+x.nm)); }
 const v=a.split(/[ ,]+/).map(Number); if(v.length!==4||v.some(n=>!isFinite(n))||v[0]===v[2]||v[1]===v[3]){ xSt(b2('Give x1,y1,x2,y2','اكتب x1,y1,x2,y2')); return; } x.clip=v; return done(b2(x.nm+' clipped','اتقص '+x.nm)); });

/* ---------- PDF Import: PDF vector paths -> lines / polylines, PDF text -> text, through pdf.js operator list (CTM tracked: save / restore / transform / form XObjects). Curves are sampled (8 points per Bezier). Units: 1 PDF point = 25.4/72 mm x scale. ---------- */
async function pdfImport(f){ open(); const {lib,page,pn}=await pdfPage(f), ol=await page.getOperatorList(), O=lib.OPS, k=25.4/72*(+ask('Scale factor','معامل المقياس','1')||1), at=xy(ask('Insertion point x,y','نقطة الإدراج x,y','0,0'))||[0,0];
 const mul=(m,n)=>[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
 let ctm=[1,0,0,1,0,0]; const st=[], paths=[]; const P=(x,y)=>[(ctm[0]*x+ctm[2]*y+ctm[4])*k+at[0],(ctm[1]*x+ctm[3]*y+ctm[5])*k+at[1]];
 const bez=(cur,a,b,c)=>{ const s=cur[cur.length-1]; for(let t=1;t<=8;t++){ const u=t/8, v=1-u; cur.push([v*v*v*s[0]+3*v*v*u*a[0]+3*v*u*u*b[0]+u*u*u*c[0],v*v*v*s[1]+3*v*v*u*a[1]+3*v*u*u*b[1]+u*u*u*c[1]]); } };
 for(let i=0;i<ol.fnArray.length&&paths.length<20000;i++){ const fn=ol.fnArray[i], a=ol.argsArray[i];
  if(fn===O.save)st.push(ctm.slice()); else if(fn===O.restore)ctm=st.pop()||ctm; else if(fn===O.transform)ctm=mul(ctm,a);
  else if(fn===O.paintFormXObjectBegin){ st.push(ctm.slice()); if(a&&a[0])ctm=mul(ctm,a[0]); } else if(fn===O.paintFormXObjectEnd)ctm=st.pop()||ctm;
  else if(fn===O.constructPath){ const ops=a[0], c=a[1]; let j=0, cur=null; const flush=cl=>{ if(cur&&cur.length>1)paths.push({p:cur,cl}); cur=null; };
   ops.forEach(op=>{ if(op===O.moveTo){ flush(false); cur=[P(c[j],c[j+1])]; j+=2; } else if(op===O.lineTo){ (cur=cur||[P(c[j],c[j+1])]).push(P(c[j],c[j+1])); j+=2; }
    else if(op===O.curveTo){ if(cur)bez(cur,P(c[j],c[j+1]),P(c[j+2],c[j+3]),P(c[j+4],c[j+5])); j+=6; } else if(op===O.curveTo2){ if(cur)bez(cur,cur[cur.length-1],P(c[j],c[j+1]),P(c[j+2],c[j+3])); j+=4; } else if(op===O.curveTo3){ if(cur)bez(cur,P(c[j],c[j+1]),P(c[j+2],c[j+3]),P(c[j+2],c[j+3])); j+=4; }
    else if(op===O.closePath)flush(true); else if(op===O.rectangle){ flush(false); const x=c[j], y=c[j+1], w=c[j+2], h=c[j+3]; j+=4; paths.push({p:[P(x,y),P(x+w,y),P(x+w,y+h),P(x,y+h)],cl:true}); } }); flush(false); } }
 PCX.ensureLay('PDF_GEOMETRY','#b0bec5'); PCX.ensureLay('PDF_TEXT','#ffd54f'); let nl=0, np=0, nt=0;
 paths.forEach(q=>{ if(q.p.length===2&&!q.cl){ cadAdd({t:'l',x1:q.p[0][0],y1:q.p[0][1],x2:q.p[1][0],y2:q.p[1][1],ly:'PDF_GEOMETRY'}); nl++; } else { cadAdd({t:'pl',p:q.p,cl:!!q.cl,ly:'PDF_GEOMETRY'}); np++; } });
 const tc=await page.getTextContent(); ctm=[1,0,0,1,0,0]; tc.items.forEach(it=>{ const s=String(it.str||'').trim(); if(!s)return; const t=it.transform, q=P(t[4],t[5]); cadAdd({t:'tx',x:q[0],y:q[1],h:Math.max(.1,Math.hypot(t[2],t[3])*k),s,ly:'PDF_TEXT'}); nt++; });
 try{ cadZoomExt(); }catch(e){} return done(b2('PDF page '+pn+' imported: '+nl+' lines, '+np+' polylines, '+nt+' texts','اتستوردت صفحة PDF '+pn+': '+nl+' خط، '+np+' بوليلاين، '+nt+' نص')); }
PXC2.pdfImport=pdfImport;
ov('Insert','Import','PDF Import',['Import the vector lines and text of a PDF page as real drawing objects','استورد خطوط ونصوص صفحة PDF كعناصر رسم حقيقية'],()=>PXX.pick('.pdf').then(pdfImport));

/* ---------- Data links (CSV / XLSX) and linked tables (lines + texts grouped, re-generated on update) ---------- */
async function linkData(f){ open(); const rows=await PXX.readRows(f); if(!rows.length)throw new Error(b2('The file has no rows.','الملف مفيهوش صفوف.')); const d=D(); d.dlinks=d.dlinks||{}; const nm=(ask('Data link name','اسم ربط البيانات',f.name.replace(/\.\w+$/,''))||'').trim(); if(!nm)return;
 const upd=!!d.dlinks[nm]; d.dlinks[nm]={src:f.name,rows:rows.slice(0,500).map(r=>r.slice(0,30).map(String)),at:new Date().toISOString().slice(0,16)}; let nT=0; if(upd)Object.keys(d.dtabs||{}).forEach(g=>{ if(d.dtabs[g].nm===nm){ drawTable(g); nT++; } });
 return done(b2('Data link '+nm+' '+(upd?'updated':'created')+': '+rows.length+' rows from '+f.name+(nT?', '+nT+' table(s) refreshed':''),'ربط البيانات '+nm+(upd?' اتحدث':' اتعمل')+': '+rows.length+' صف'+(nT?'، اتحدث '+nT+' جدول':''))); }
PXC2.linkData=linkData;
function drawTable(g){ const d=D(), T=d.dtabs[g], L=d.dlinks[T.nm]; if(!L)return 0; d.ents=d.ents.filter(e=>e.g!==g); const rows=L.rows, h=T.h, nc=Math.max(...rows.map(r=>r.length)), cw=[]; for(let c=0;c<nc;c++)cw[c]=Math.max(4*h,...rows.map(r=>String(r[c]||'').length*h*.62+h)); const rh=h*1.8, W=cw.reduce((a,b)=>a+b,0), H=rows.length*rh, [x0,y0]=T.p;
 const add=e=>{ e.g=g; e.dl=T.nm; e.ly=e.ly||'TEXT'; d.ents.push(e); }; add({t:'r',x1:x0,y1:y0,x2:x0+W,y2:y0-H,ly:'0'}); for(let r=1;r<rows.length;r++)add({t:'l',x1:x0,y1:y0-r*rh,x2:x0+W,y2:y0-r*rh,ly:'0'}); let x=x0; for(let c=0;c<nc-1;c++){ x+=cw[c]; add({t:'l',x1:x,y1:y0,x2:x,y2:y0-H,ly:'0'}); }
 rows.forEach((r,ri)=>{ let xx=x0; for(let c=0;c<nc;c++){ const s=String(r[c]==null?'':r[c]); if(s)add({t:'tx',x:xx+h*.4,y:y0-(ri+1)*rh+rh*.3,h,s}); xx+=cw[c]; } }); return rows.length; }
PXC2.drawTable=drawTable;
ov('Insert','Data','Link Data',['Link an Excel (XLSX) or CSV file as a named data link; linking the same name again refreshes every linked table','اربط ملف إكسل (XLSX) أو CSV كربط بيانات باسم؛ ربط نفس الاسم تاني يحدّث كل الجداول المربوطة'],()=>PXX.pick('.xlsx,.csv,.tsv,.txt').then(linkData));
ov('Annotate','Tables','Link Table',['Insert a table linked to a data link (lines + text); it refreshes when the link is updated','أدرج جدول مربوط بربط بيانات (خطوط + نص)؛ بيتحدث لما الربط يتحدث'],()=>{ open(); const d=D(), names=Object.keys(d.dlinks||{}); if(!names.length){ xSt(b2('Create a data link first (Insert > Link Data).','اعمل ربط بيانات الأول (إدراج > ربط بيانات).')); return; }
 const nm=prompt(b2('Data link: ','ربط البيانات: ')+names.join(', '),names[names.length-1]); if(!d.dlinks[nm])return; const p=xy(ask('Table top-left corner x,y','الركن العلوي الأيسر للجدول x,y',mouse())); if(!p)return;
 d.dtabs=d.dtabs||{}; const g='tb'+(++PCX.n)+Date.now().toString(36); d.dtabs[g]={nm,p,h:d.th||2.5}; const n=drawTable(g); return done(b2('Linked table from '+nm+': '+n+' rows','جدول مربوط من '+nm+': '+n+' صف')); });

/* ---------- Check Spelling (selected texts, or all texts) ---------- */
ov('Annotate','Text','Check Spelling',['Check the spelling of the selected texts (or all texts) with the browser spell checker and write fixes back','دقق إملاء النصوص المحددة (أو كل النصوص) بمدقق المتصفح واكتب التصحيح'],()=>{ open(); const all=D().ents.map((e,i)=>i).filter(i=>D().ents[i].t==='tx'), s=[...CS.sel].filter(i=>D().ents[i]&&D().ents[i].t==='tx'), ids=s.length?s:all;
 PXX.spell(ids.map(i=>({get:()=>D().ents[i].s,set:v=>{ D().ents[i].s=v; }})),n=>{ if(n)done(b2('Spelling: '+n+' text(s) corrected','الإملاء: اتصلح '+n+' نص')); }); });

/* ---------- Arc Length dimension: polyline arcs (arcs are stored as polylines) and circles; offset arc + extension lines + "⌒ L" text, grouped ---------- */
ov('Annotate','Dimensions','Arc Length',['Arc length dimension of a selected arc (polyline) or circle','بُعد طول القوس لقوس (بوليلاين) أو دايرة محددة'],()=>{ const ids=sel().filter(i=>{ const e=D().ents[i]; return (e.t==='pl'&&e.p.length>2)||e.t==='c'; }); if(!ids.length){ xSt(b2('Select an arc (polyline) or a circle first.','اختار قوس (بوليلاين) أو دايرة الأول.')); return; }
 const off=+ask('Dimension offset','إزاحة البُعد',String(2*(D().th||2.5)))||5, h=D().th||2.5; let last='';
 ids.forEach(i=>{ const e=D().ents[i], q=e.t==='c'?c2Poly(e).concat([c2Poly(e)[0]]):e.p.concat(e.cl?[e.p[0]]:[]), cx=q.reduce((a,p)=>a+p[0],0)/q.length, cy=q.reduce((a,p)=>a+p[1],0)/q.length;
  const L=e.t==='c'?2*Math.PI*e.r:q.slice(1).reduce((a,p,k)=>a+dst(q[k],p),0), o=q.map((p,k)=>{ const a=q[Math.max(0,k-1)], b=q[Math.min(q.length-1,k+1)], tx=b[0]-a[0], ty=b[1]-a[1], tl=Math.hypot(tx,ty)||1; let nx=-ty/tl, ny=tx/tl; if((p[0]-cx)*nx+(p[1]-cy)*ny<0){ nx=-nx; ny=-ny; } return [p[0]+nx*off,p[1]+ny*off]; });
  const g='al'+(++PCX.n)+Date.now().toString(36), v=L*(D().k||1); cadAdd({t:'pl',p:o,cl:false,ly:'DIM',g}); if(e.t!=='c'){ [0,q.length-1].forEach(k=>cadAdd({t:'l',x1:q[k][0],y1:q[k][1],x2:o[k][0],y2:o[k][1],ly:'DIM',g})); }
  const m=o[Math.floor(o.length/2)]; cadAdd({t:'tx',x:m[0]+h*.3,y:m[1]+h*.3,h,s:'⌒'+fmtL(v),ly:'DIM',g}); last=fmtL(v); });
 return done(b2('Arc length = '+last,'طول القوس = '+last)); });

/* ---------- Constraints added to the solver of c_mod_cxsx_cad_b.js: Tangent, Smooth (G1 at the joint), Symmetric, Angular, Convert (dimension -> aligned constraint) ---------- */
const A=PCX.capi; Object.assign(A.KN,{tan:['Tangent','مماس'],smo:['Smooth','انسيابي'],sym:['Symmetric','تماثل'],ang:['Angular','زاوي']});
PCX.cx={
 tan:(c,E,fa,fb)=>{ const [X,Y]=E; if(A.isL(X)){ const dx=X.x2-X.x1, dy=X.y2-X.y1, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, d=(Y.x-X.x1)*nx+(Y.y-X.y1)*ny, s=d<0?-1:1, m=s*Y.r-d, res=Math.abs(m); if(!fb){ Y.x+=nx*m; Y.y+=ny*m; } else if(!fa){ X.x1-=nx*m; X.y1-=ny*m; X.x2-=nx*m; X.y2-=ny*m; } return res; }
  let dx=Y.x-X.x, dy=Y.y-X.y, d=Math.hypot(dx,dy); if(d<1e-12){ dx=1; dy=0; d=1; } const want=c.in?Math.abs(X.r-Y.r):X.r+Y.r, res=Math.abs(Math.hypot(Y.x-X.x,Y.y-X.y)-want); if(!fb){ Y.x=X.x+dx/d*want; Y.y=X.y+dy/d*want; } else if(!fa){ X.x=Y.x-dx/d*want; X.y=Y.y-dy/d*want; } return res; },
 smo:(c,E,fa,fb)=>{ const [X,Y]=E, pa=A.pt(X,c.p[0]), pb=A.pt(Y,c.p[1]), o=A.pt(Y,1-c.p[1]), dir=c.p[0]===1?Math.atan2(X.y2-X.y1,X.x2-X.x1):Math.atan2(X.y1-X.y2,X.x1-X.x2), Lb=Math.hypot(o[0]-pb[0],o[1]-pb[1]), cur=Math.atan2(o[1]-pb[1],o[0]-pb[0]);
  const res=Math.max(Math.hypot(pa[0]-pb[0],pa[1]-pb[1]),Math.hypot(Math.cos(cur)-Math.cos(dir),Math.sin(cur)-Math.sin(dir))*Lb); if(!fb){ A.setPt(Y,c.p[1],pa); A.setPt(Y,1-c.p[1],[pa[0]+Lb*Math.cos(dir),pa[1]+Lb*Math.sin(dir)]); } return res; },
 sym:(c,E,fa,fb)=>{ const [X,Y,S]=E, dx=S.x2-S.x1, dy=S.y2-S.y1, L2=dx*dx+dy*dy||1, mir=p=>{ const t=((p[0]-S.x1)*dx+(p[1]-S.y1)*dy)/L2; return [2*(S.x1+t*dx)-p[0],2*(S.y1+t*dy)-p[1]]; };
  if(A.isC(X)){ const m=mir([X.x,X.y]), res=Math.hypot(Y.x-m[0],Y.y-m[1])+Math.abs(Y.r-X.r); if(!fb){ Y.x=m[0]; Y.y=m[1]; Y.r=X.r; } return res; }
  const m1=mir([X.x1,X.y1]), m2=mir([X.x2,X.y2]), dA=Math.hypot(Y.x1-m1[0],Y.y1-m1[1])+Math.hypot(Y.x2-m2[0],Y.y2-m2[1]), dB=Math.hypot(Y.x1-m2[0],Y.y1-m2[1])+Math.hypot(Y.x2-m1[0],Y.y2-m1[1]), [q1,q2]=dA<=dB?[m1,m2]:[m2,m1];
  if(!fb){ Y.x1=q1[0]; Y.y1=q1[1]; Y.x2=q2[0]; Y.y2=q2[1]; } return Math.min(dA,dB); },
 ang:(c,E,fa,fb)=>{ const [X,Y]=E, d=A.wrap(A.ang(X)+c.v*Math.PI/180-A.ang(Y)), res=Math.abs(Math.sin(d))*A.len(Y); if(!fb)A.rotMid(Y,d); else if(!fa)A.rotMid(X,-d); return res; } };
const cname=k=>A.KN[k][0]+(A.C().length+1);
function nextD(){ return 'd'+(Math.max(0,...A.C().map(c=>/^d(\d+)$/.test(c.n||'')?+RegExp.$1:0))+1); }
function consDone(n,k){ const r=PCX.cons.solve(); return A.done(b2(n+' '+A.KN[k][0]+' constraint(s) added'+(r>1e-6?' - NOT satisfied (conflict), residual '+r.toExponential(1):''),'اتضاف '+n+' قيد '+A.KN[k][1]+(r>1e-6?' - مش متحقق (تعارض)':''))); }
ov('Parametric','Geometric','Tangent',['Tangent constraint: a line and a circle, or two circles (first selected is the reference)','قيد مماس: خط ودايرة، أو دايرتين (أول عنصر محدد هو المرجع)'],()=>{ const ents=A.sel().map(i=>D().ents[i]); if(ents.length!==2||!ents.some(A.isC)){ xSt(b2('Select a line and a circle, or two circles.','اختار خط ودايرة، أو دايرتين.')); return; }
 let [X,Y]=ents; if(A.isC(X)&&A.isL(Y))[X,Y]=[Y,X]; const c={k:'tan',r:[A.eid(X),A.eid(Y)],n:cname('tan')}; if(A.isC(X))c.in=Math.hypot(X.x-Y.x,X.y-Y.y)<Math.max(X.r,Y.r); A.C().push(c); return consDone(1,'tan'); });
ov('Parametric','Geometric','Smooth',['Smooth (G1) constraint: joins the nearest ends of two lines and makes the second continue the direction of the first','قيد انسيابي (G1): يوصل أقرب طرفين لخطين ويخلي التاني يكمل اتجاه الأول'],()=>{ const ents=A.sel().map(i=>D().ents[i]).filter(A.isL); if(ents.length!==2){ xSt(b2('Select two lines.','اختار خطين.')); return; }
 const [X,Y]=ents; let best=null; [0,1].forEach(a=>[0,1].forEach(b=>{ const p=A.pt(X,a), q=A.pt(Y,b), d=Math.hypot(p[0]-q[0],p[1]-q[1]); if(!best||d<best.d)best={d,a,b}; })); A.C().push({k:'smo',r:[A.eid(X),A.eid(Y)],p:[best.a,best.b],n:cname('smo')}); return consDone(1,'smo'); });
ov('Parametric','Geometric','Symmetric',['Symmetric constraint: select two lines (or two circles), then the symmetry line last','قيد تماثل: اختار خطين (أو دايرتين) وبعدين خط التماثل آخر حاجة'],()=>{ const ents=A.sel().map(i=>D().ents[i]); if(ents.length!==3||!A.isL(ents[2])||A.isL(ents[0])!==A.isL(ents[1])){ xSt(b2('Select two lines or two circles, then the symmetry line last.','اختار خطين أو دايرتين وبعدين خط التماثل آخر حاجة.')); return; }
 A.C().push({k:'sym',r:ents.map(A.eid),n:cname('sym')}); return consDone(1,'sym'); });
ov('Parametric','Dimensional','Angular',['Angular dimensional constraint between two lines (degrees), kept as a named parameter','قيد زاوية بين خطين (بالدرجات) كمعامل باسم'],()=>{ const ents=A.sel().map(i=>D().ents[i]).filter(A.isL); if(ents.length!==2){ xSt(b2('Select two lines.','اختار خطين.')); return; }
 const cur=((A.ang(ents[1])-A.ang(ents[0]))*180/Math.PI+360)%180, v=parseFloat(ask('Angle in degrees (current '+cur.toFixed(2)+')','الزاوية بالدرجات (الحالية '+cur.toFixed(2)+')',cur.toFixed(2))); if(!(v>0&&v<180)){ xSt(b2('Angle must be between 0 and 180.','الزاوية لازم بين 0 و180.')); return; }
 A.C().push({k:'ang',r:[A.eid(ents[0]),A.eid(ents[1])],n:nextD(),v}); return consDone(1,'ang'); });
ov('Parametric','Dimensional','Convert',['Convert selected dimensions into dimensional constraints on the lines they measure','حوّل الأبعاد المحددة لقيود أبعاد على الخطوط اللي بتقيسها'],()=>{ open(); const d=D(), ids=[...CS.sel].filter(i=>d.ents[i]&&d.ents[i].t==='dim'); if(!ids.length){ xSt(b2('Select dimensions first.','اختار أبعاد الأول.')); return; }
 const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6; let n=0; const gone=new Set();
 ids.forEach(i=>{ const m=d.ents[i], P=[m.x1,m.y1], Q=[m.x2,m.y2], ln=d.ents.find(e=>e.t==='l'&&((near([e.x1,e.y1],P)&&near([e.x2,e.y2],Q))||(near([e.x1,e.y1],Q)&&near([e.x2,e.y2],P)))); if(!ln)return; A.C().push({k:'ali',r:[A.eid(ln)],n:nextD(),v:Math.hypot(Q[0]-P[0],Q[1]-P[1])}); gone.add(m); n++; });
 d.ents=d.ents.filter(e=>!gone.has(e)); CS.sel.clear(); PCX.cons.solve(); return A.done(b2(n+' of '+ids.length+' dimension(s) converted'+(n<ids.length?' (the others do not measure a line end to end)':''),'اتحول '+n+' من '+ids.length+' بُعد')); });

/* ---------- Visual styles on the 3D model: Hidden (white faces + black edges), Conceptual (toon shading + edges), Sketchy (hand-drawn double edges with overshoot), Shades of Gray. Any other style command restores the materials. ---------- */
const VS={cur:''};
function vsClear(){ const kill=[]; scene.traverse(o=>{ if(o.userData&&o.userData.vsEdge)kill.push(o); else if(o.userData&&o.userData.vs0){ o.material=o.userData.vs0; delete o.userData.vs0; } }); kill.forEach(o=>{ o.parent&&o.parent.remove(o); try{ o.geometry.dispose(); o.material.dispose(); }catch(e){} }); VS.cur=''; }
function vsEdges(o,col,sketch){ const eg=new T.EdgesGeometry(o.geometry,30), cp=o.material&&o.material.clippingPlanes; let g=eg;
 if(sketch){ const a=eg.attributes.position.array, out=[]; o.geometry.computeBoundingBox(); const bb=o.geometry.boundingBox, s=bb?bb.getSize(new T.Vector3()).length()*.006:.01, J=()=>(Math.random()-.5)*2*s;
  for(let r=0;r<2;r++)for(let i=0;i<a.length;i+=6){ const dx=a[i+3]-a[i], dy=a[i+4]-a[i+1], dz=a[i+5]-a[i+2], ov=.04+.03*r; out.push(a[i]-dx*ov+J(),a[i+1]-dy*ov+J(),a[i+2]-dz*ov+J(),a[i+3]+dx*ov+J(),a[i+4]+dy*ov+J(),a[i+5]+dz*ov+J()); } g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(out,3)); eg.dispose(); }
 const l=new T.LineSegments(g,new T.LineBasicMaterial({color:col,clippingPlanes:cp||null})); l.userData.vsEdge=1; l.raycast=()=>{}; o.add(l); }
function vsSet(mode){ vsClear(); const ms=[]; scene.traverse(o=>{ if(o.isMesh&&o.material&&!Array.isArray(o.material)&&o.geometry&&o.visible)ms.push(o); });
 ms.forEach(o=>{ const m0=o.material, cp=m0.clippingPlanes||null, c=(m0.color?m0.color.clone():new T.Color(0x9e9e9e)), op={clippingPlanes:cp,side:m0.side,transparent:m0.transparent,opacity:m0.opacity,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}; let m;
  if(mode==='hidden'||mode==='sketchy')m=new T.MeshBasicMaterial(Object.assign({color:0xffffff},op)); else if(mode==='conceptual')m=new T.MeshToonMaterial(Object.assign({color:c},op)); else { const y=.299*c.r+.587*c.g+.114*c.b; m=new T.MeshLambertMaterial(Object.assign({color:new T.Color(y,y,y)},op)); }
  o.userData.vs0=m0; o.material=m; if(mode!=='gray')vsEdges(o,mode==='conceptual'?0x333333:0x111111,mode==='sketchy'); });
 VS.cur=mode; PXC2.vs=VS; return ms.length; }
{ const _n=navStyle; navStyle=function(){ try{ vsClear(); }catch(e){} return _n.apply(this,arguments); }; }
const vs=(en,mode,help)=>ov('View','Visual Styles',en,help,()=>{ const n=vsSet(mode); xSt(b2('Visual style '+en+' ('+n+' objects)','نمط العرض '+en+' ('+n+' عنصر)')); });
vs('Hidden','hidden',['Hidden visual style: white faces, black edges, hidden lines removed','نمط مخفي: أسطح بيضا وحواف سودا من غير الخطوط المخفية']); vs('Conceptual','conceptual',['Conceptual visual style: smooth cartoon shading with edges','نمط تصوري: تظليل ناعم مع الحواف']);
vs('Sketchy','sketchy',['Sketchy visual style: hand-drawn looking edges with overshoot','نمط رسم يدوي: حواف شكلها مرسوم باليد']); vs('Shades of Gray','gray',['Shades of Gray visual style: every material in grey tones','نمط تدرج رمادي: كل الخامات بدرجات الرمادي']);

/* ---------- Viewport Configuration (model viewports): 1, 2V, 2H, 3 or 4 tiles; each tile keeps its own view, click a tile to make it the active one ---------- */
const VPL={'1':[1,'1fr','1fr'],'2V':[2,'1fr 1fr','1fr'],'2H':[2,'1fr','1fr 1fr'],'3':[3,'2fr 1fr','1fr 1fr'],'4':[4,'1fr 1fr','1fr 1fr']};
function vpSync(){ const svg=CW.querySelector('svg:not(.pxvp)'); if(!svg)return; const W=svg.parentNode, cfg=VPL[D().vpc||'1']||VPL['1'], n=cfg[0]; let ex=[...W.querySelectorAll('svg.pxvp')];
 if(ex.length!==n-1){ ex.forEach(x=>x.remove()); ex=[]; CS.vps=CS.vps||[]; W.style.display=n>1?'grid':''; W.style.gridTemplateColumns=cfg[1]; W.style.gridTemplateRows=cfg[2]; W.style.gap=n>1?'3px':''; svg.style.gridRow=(D().vpc==='3')?'1 / span 2':'';
  for(let i=0;i<n-1;i++){ const s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('class','pxvp'); s.style.cssText='width:100%;height:100%;display:block;background:#1b1d21;outline:1px solid #3a3d44;cursor:pointer'; const V=CS.vps[i]=CS.vps[i]||{x:CS.V.x-CS.V.w*(i+1)*.5,y:CS.V.y-CS.V.h*(i+1)*.5,w:CS.V.w*(i+2),h:CS.V.h*(i+2)};
   s.addEventListener('click',()=>{ const t=CS.V; CS.V=CS.vps[i]; CS.vps[i]=t; cadRender(); }); W.appendChild(s); ex.push(s); } }
 if(n>1){ svg.style.outline='2px solid #42a5f5'; const html=CW.querySelector('#cg').innerHTML; ex.forEach((s,i)=>{ const V=CS.vps[i]; s.setAttribute('viewBox',V.x+' '+(-(V.y+V.h))+' '+V.w+' '+V.h); s.innerHTML='<g>'+html+'</g>'; }); } else svg.style.outline=''; }
ov('View','Model Viewports','Viewport Configuration',['Split the drawing area into 1, 2 (vertical / horizontal), 3 or 4 viewports; click a viewport to make it active','قسّم مساحة الرسم لنافذة أو 2 (رأسي / أفقي) أو 3 أو 4؛ اضغط على نافذة عشان تبقى النشطة'],()=>{ open(); const a=(ask('Viewports: 1, 2V, 2H, 3 or 4','النوافذ: 1 أو 2V أو 2H أو 3 أو 4',D().vpc||'2V')||'').trim().toUpperCase(); if(!VPL[a]){ xSt(b2('Use 1, 2V, 2H, 3 or 4.','استخدم 1 أو 2V أو 2H أو 3 أو 4.')); return; }
 D().vpc=a; CS.vps=[]; [...CW.querySelectorAll('svg.pxvp')].forEach(x=>x.remove()); return done(b2('Viewports: '+a,'النوافذ: '+a)); });

/* ---------- Tool Palettes = the C.X library pane (blocks, hatches, linetypes, dimension styles) ---------- */
const tp=['Tool Palettes: drag blocks, hatches, linetypes and styles onto the drawing','لوحات الأدوات: اسحب بلوكات وتهشير وأنواع خطوط وأنماط على الرسمة'];
ov('View','Palettes','Tool Palettes',tp,()=>XC.lb_cx.run()); ov('Manage','Customization','Tool Palettes',tp,()=>XC.lb_cx.run());

/* ---------- Edit Aliases: command aliases (alias=command, one per line), kept in this browser ---------- */
const ALK='xto-cad-alias'; try{ Object.assign(CALIAS,JSON.parse(localStorage.getItem(ALK)||'{}')); }catch(e){}
ov('Manage','Customization','Edit Aliases',['Edit command aliases (alias=command), e.g. LL=line','عدّل اختصارات الأوامر (اختصار=أمر)، مثلا LL=line'],()=>{ const ok=new Set(Object.values(CALIAS).concat(Object.keys(cadTools))), txt=Object.keys(CALIAS).sort().map(k=>k+'='+CALIAS[k]).join('\n');
 PXX.dlg(b2('Edit Aliases','تعديل الاختصارات'),txt,v=>{ const own=JSON.parse(localStorage.getItem(ALK)||'{}'), bad=[]; let n=0; v.split('\n').forEach(l=>{ const m=l.trim().match(/^([a-z0-9]+)\s*=\s*([a-z0-9]*)$/i); if(!m)return; const a=m[1].toLowerCase(), c=m[2].toLowerCase();
   if(!c){ if(CALIAS[a]){ delete CALIAS[a]; own[a]=undefined; n++; } return; } if(!ok.has(c)){ bad.push(l.trim()); return; } if(CALIAS[a]!==c){ CALIAS[a]=c; own[a]=c; n++; } }); try{ localStorage.setItem(ALK,JSON.stringify(own)); }catch(e){}
  PXX.last={alias:n}; xSt(b2(n+' alias(es) changed'+(bad.length?'; unknown command: '+bad.join(', '):''),'اتغير '+n+' اختصار'+(bad.length?'؛ أمر غير معروف: '+bad.join(', '):''))); },{note:b2('One alias=command per line. Commands: ','اختصار=أمر في كل سطر. الأوامر: ')+[...ok].sort().join(', ')}); });

/* ---------- CAD Standards: Configure (save / check / fix the layer standard) and Layer Translator ---------- */
const STK='xto-cad-std', stdGet=()=>{ try{ return D().std||JSON.parse(localStorage.getItem(STK)||'null'); }catch(e){ return null; } };
function stdCheck(){ const S=stdGet(); if(!S)return null; const rows=[]; D().layers.forEach(l=>{ const s=S.find(x=>x.n===l.n); if(!s){ const ci=S.find(x=>x.n.toUpperCase()===l.n.toUpperCase()); rows.push([l.n,ci?'name case differs':'not in the standard',ci?ci.n:'']); } else if(s.c.toLowerCase()!==String(l.c).toLowerCase())rows.push([l.n,'colour '+l.c,s.c]); }); S.forEach(s=>{ if(!D().layers.some(l=>l.n===s.n))rows.push([s.n,'standard layer missing','add']); }); return rows; }
PXC2.stdCheck=stdCheck;
ov('Manage','CAD Standards','Configure',['CAD standards: S saves the current layers as the standard, C checks the drawing against it, F fixes colours and adds missing layers','معايير CAD: S يحفظ الطبقات الحالية كمعيار، C يفحص الرسمة عليه، F يصلّح الألوان ويضيف الطبقات الناقصة'],()=>{ open(); const o=(ask('Standards: S save current layers as standard, C check, F fix','المعايير: S حفظ الطبقات كمعيار، C فحص، F إصلاح','C')||'').trim().toUpperCase();
 if(o==='S'){ const S=D().layers.map(l=>({n:l.n,c:l.c})); D().std=S; try{ localStorage.setItem(STK,JSON.stringify(S)); }catch(e){} return done(b2('Standard saved: '+S.length+' layers','اتحفظ المعيار: '+S.length+' طبقة')); }
 const S=stdGet(); if(!S){ xSt(b2('No standard yet: run Configure with S on a drawing that has the right layers.','مفيش معيار: شغّل الضبط بـ S على رسمة طبقاتها صح.')); return; }
 if(o==='F'){ let n=0; D().layers.forEach(l=>{ const s=S.find(x=>x.n===l.n); if(s&&s.c!==l.c){ l.c=s.c; n++; } }); S.forEach(s=>{ if(!D().layers.some(l=>l.n===s.n)){ D().layers.push({n:s.n,c:s.c,on:1,lk:0}); n++; } }); return done(b2('Standards fixed: '+n+' change(s); use Layer Translator to rename non-standard layers','اتصلح '+n+' حاجة؛ استخدم مترجم الطبقات لإعادة تسمية الطبقات المخالفة')); }
 const rows=stdCheck(); PCX.rep(b2('CAD standards check','فحص معايير CAD'),['Layer','Problem','Standard'],rows,rows.length?rows.length+' problem(s)':'no problems'); });
ov('Manage','CAD Standards','Layer Translator',['Translate layers: OLD=NEW per line; objects move to the new layer and the old layer is removed','ترجمة الطبقات: قديم=جديد في كل سطر؛ العناصر تتنقل للطبقة الجديدة والقديمة تتشال'],()=>{ open(); const S=stdGet()||[], txt=D().layers.map(l=>{ const s=S.find(x=>x.n.toUpperCase()===l.n.toUpperCase()); return l.n+'='+(s?s.n:l.n); }).join('\n');
 PXX.dlg(b2('Layer Translator','مترجم الطبقات'),txt,v=>{ const d=D(); let n=0, m=0; v.split('\n').forEach(l=>{ const p=l.split('='); if(p.length!==2)return; const a=p[0].trim(), b=p[1].trim().toUpperCase().replace(/\s+/g,'_'); if(!a||!b||a===b||!d.layers.some(x=>x.n===a))return; const old=d.layers.find(x=>x.n===a), s=S.find(x=>x.n===b);
   if(!d.layers.some(x=>x.n===b))d.layers.push({n:b,c:s?s.c:old.c,on:1,lk:0}); d.ents.forEach(e=>{ if(e.ly===a){ e.ly=b; m++; } }); if(d.cur===a)d.cur=b; if(a!=='0')d.layers=d.layers.filter(x=>x.n!==a); n++; }); done(b2(n+' layer(s) translated, '+m+' object(s) moved','اترجم '+n+' طبقة واتنقل '+m+' عنصر')); },{note:b2('Edit the right side. Names from the saved standard are proposed.','عدّل الجانب اليمين. الأسماء المقترحة من المعيار المحفوظ.')}); });

/* ---------- Applications: Load Application (.scr scripts; LISP/ARX/.NET/VBA cannot run in a browser) and Run Script (space or new line = Enter, like AutoCAD) ---------- */
function runScript(txt){ open(); let n=0; String(txt).split(/\r?\n/).forEach(line=>{ if(/^\s*;/.test(line))return; line.split(' ').forEach(tok=>{ cadTyped(tok.replace(/^[_.\-]+(?=[a-z])/i,'')); n++; }); }); cadCommit(); return n; }
PXC2.runScript=runScript;
ov('Manage','Applications','Load Application',['Load script files (.scr) as named applications for Run Script; LISP, ARX, .NET and VBA cannot run in a browser','حمّل ملفات سكريبت (.scr) كتطبيقات لتشغيل السكريبت؛ LISP وARX و.NET وVBA ما يشتغلوش في المتصفح'],()=>PXX.pick('.scr,.txt,.lsp,.fas,.vlx,.arx,.dll,.dvb').then(async f=>{ if(!/\.(scr|txt)$/i.test(f.name))throw new Error(b2(f.name+': LISP, ARX, .NET and VBA programs cannot run in a browser. Script files (.scr) work.',f.name+': برامج LISP وARX و.NET وVBA ما تشتغلش في المتصفح. ملفات السكريبت (.scr) شغالة.'));
 D().apps=D().apps||{}; D().apps[f.name]=await f.text(); persist(); xSt(b2('Loaded '+f.name+' ('+Object.keys(D().apps).length+' loaded). Run it with Run Script.','اتحمل '+f.name+'. شغّله من تشغيل السكريبت.')); }));
ov('Manage','Applications','Run Script',['Run an AutoCAD-style script (.scr): each word is typed on the command line, space or new line = Enter','شغّل سكريبت بأسلوب أوتوكاد (.scr): كل كلمة بتتكتب في سطر الأوامر، المسافة أو السطر الجديد = Enter'],()=>{ const L=D().apps||{}, names=Object.keys(L);
 const go=(nm,t)=>{ const n=runScript(t); xSt(b2('Script '+nm+': '+n+' input(s) run','السكريبت '+nm+': اتنفذ '+n+' إدخال')); };
 if(names.length){ const nm=prompt(b2('Script to run (or * to pick a file): ','السكريبت (أو * لاختيار ملف): ')+names.join(', '),names[names.length-1]); if(nm&&L[nm])return go(nm,L[nm]); if(nm!=='*')return; }
 return PXX.pick('.scr,.txt').then(async f=>go(f.name,await f.text())); });

/* ---------- Plot: Page Setup Manager, Plotter Manager, Batch Plot (C.X drawing + every sheet of the sheet composer in one file) ---------- */
const PAP={A0:[1189,841],A1:[841,594],A2:[594,420],A3:[420,297],A4:[297,210]};
const psCur=()=>{ const d=D(); d.psetups=d.psetups||{Default:{paper:'A3',orient:'L',scale:'fit',style:'color'}}; return d.psetups[d.pscur]||d.psetups.Default; };
ov('Output','Plot','Page Setup Manager',['Named page setups: NAME paper(A0-A4) L/P fit-or-1:n color/mono; the current one is used by Batch Plot','إعدادات صفحة باسم: الاسم الورق(A0-A4) L/P ملء-أو-1:ن ألوان/أبيض وأسود؛ الحالي بيستخدمه طباعة الدفعة'],()=>{ psCur(); const d=D(), a=(ask('Page setup: NAME paper L/P scale(fit or 1:100) color/mono (empty = list)','إعداد الصفحة: الاسم الورق L/P المقياس ألوان/mono (فاضي = عرض)',(d.pscur||'Setup1')+' A3 L fit color')||'').trim();
 if(!a){ PCX.rep(b2('Page setups','إعدادات الصفحة'),['Name','Paper','Orientation','Scale','Style'],Object.keys(d.psetups).map(k=>{ const s=d.psetups[k]; return [k+(k===(d.pscur||'Default')?' *':''),s.paper,s.orient,s.scale,s.style]; })); return; }
 const t=a.split(/\s+/), nm=t[0], paper=(t[1]||'A3').toUpperCase(), orient=(t[2]||'L').toUpperCase(), scale=(t[3]||'fit').toLowerCase(), style=(t[4]||'color').toLowerCase();
 if(!PAP[paper]||!/^[LP]$/.test(orient)||!/^(fit|1:\d+(\.\d+)?)$/.test(scale)||!/^(color|mono)$/.test(style)){ xSt(b2('Example: Setup1 A1 L 1:100 mono','مثال: Setup1 A1 L 1:100 mono')); return; }
 d.psetups[nm]={paper,orient,scale,style}; d.pscur=nm; persist(); xSt(b2('Page setup '+nm+' is current: '+paper+' '+orient+' '+scale+' '+style,'إعداد الصفحة '+nm+' هو الحالي')); });
const DEV={PDF:'DWG To PDF',PNG:'PublishToWeb PNG',SVG:'PublishToWeb SVG',DXF:'DXF file'};
ov('Output','Plot','Plotter Manager',['Choose the output device (PDF, PNG, SVG or DXF) and its resolution, used by Batch Plot','اختار جهاز الإخراج (PDF أو PNG أو SVG أو DXF) ودقته، بيستخدمه طباعة الدفعة'],()=>{ const d=D(), cur=d.plotter||{dev:'PDF',dpi:150}, a=(ask('Plotter: PDF / PNG / SVG / DXF and dpi. Devices: '+Object.keys(DEV).map(k=>k+' = '+DEV[k]).join(', '),'الطابعة: PDF / PNG / SVG / DXF والدقة',cur.dev+' '+cur.dpi)||'').trim().toUpperCase().split(/\s+/);
 if(!DEV[a[0]]){ xSt(b2('Use PDF, PNG, SVG or DXF.','استخدم PDF أو PNG أو SVG أو DXF.')); return; } d.plotter={dev:a[0],dpi:Math.max(72,Math.min(600,+a[1]||150))}; persist(); xSt(b2('Plotter: '+DEV[a[0]]+', '+d.plotter.dpi+' dpi','الطابعة: '+DEV[a[0]]+'، '+d.plotter.dpi+' dpi')); });
async function batchPlot(pick){ const d=D(), ps=psCur(), dev=(d.plotter||{dev:'PDF',dpi:150}), items=[]; if(d.ents.length)items.push({t:'C.X drawing',svg:()=>cadExportSvg()});
 try{ const sh=buildSheet(); sh.pages.forEach((x,i)=>items.push({t:'Sheet page '+(i+1),svg:()=>sheetSvg(sh,i)})); }catch(e){}
 if(!items.length)throw new Error(b2('Nothing to plot.','مفيش حاجة للطباعة.')); const s=pick!=null?pick:(prompt(b2('Plot which? ','تطبع إيه؟ ')+items.map((x,i)=>(i+1)+'='+x.t).join(', ')+b2(' (e.g. 1,3 or all)',' (مثلا 1,3 أو all)'),'all')||''); if(!s)return;
 const want=/all/i.test(s)?items:s.split(/[ ,]+/).map(n=>items[+n-1]).filter(Boolean); if(!want.length)return;
 if(dev.dev==='DXF'){ out('XTO_Plot.dxf',cadExportDxf()); return xSt(b2('DXF written (drawing only)','اتكتب DXF (الرسمة بس)')); }
 if(dev.dev==='SVG'){ want.forEach((x,i)=>out('XTO_Plot_'+(i+1)+'.svg',x.svg())); return xSt(b2(want.length+' SVG file(s)','عدد '+want.length+' ملف SVG')); }
 const P=PAP[ps.paper], W=ps.orient==='L'?P[0]:P[1], H=ps.orient==='L'?P[1]:P[0], mono=ps.style==='mono', px=Math.round(Math.max(W,H)/25.4*dev.dpi);
 if(dev.dev==='PNG'){ for(let i=0;i<want.length;i++){ const r=await PXX.svgPng(want[i].svg(),px,mono); out('XTO_Plot_'+(i+1)+'.png',await (await fetch(r.url)).blob()); } return xSt(b2(want.length+' PNG file(s)','عدد '+want.length+' صورة PNG')); }
 const {jsPDF}=window.jspdf, doc=new jsPDF({orientation:ps.orient==='L'?'landscape':'portrait',unit:'mm',format:[W,H]}), m=10;
 for(let i=0;i<want.length;i++){ if(i)doc.addPage([W,H],ps.orient==='L'?'landscape':'portrait'); const r=await PXX.svgPng(want[i].svg(),px,mono); let k=Math.min((W-2*m)/r.w,(H-2*m)/r.h); const sc=/^1:/.test(ps.scale)?1/parseFloat(ps.scale.slice(2)):0; if(sc&&i===0&&want[i].t==='C.X drawing')k=Math.min(k,sc*1000); doc.addImage(r.url,'PNG',(W-r.w*k)/2,(H-r.h*k)/2,r.w*k,r.h*k); doc.setFontSize(7); doc.text(want[i].t+' - '+ps.paper+' '+ps.scale,m,H-4); }
 const bl=doc.output('blob'); PXX.last={plot:want.length,bytes:bl.size}; out('XTO_BatchPlot.pdf',bl); xSt(b2('Batch plot: '+want.length+' page(s) in one PDF ('+ps.paper+')','طباعة دفعة: '+want.length+' صفحة في PDF واحد')); }
PXC2.batchPlot=batchPlot;
ov('Output','Plot','Batch Plot',['Batch plot (publish) the C.X drawing and every sheet page into one PDF with the current page setup and plotter','اطبع دفعة واحدة الرسمة وكل صفحات اللوحات في PDF واحد بإعداد الصفحة والطابعة الحاليين'],()=>batchPlot());
PXX.honest('draft','Output','Export to DWF/PDF','DWF',['DWF is a closed Autodesk format that a browser cannot write. Use PDF (same panel) or Batch Plot.','الـDWF صيغة أوتوديسك مقفولة والمتصفح ما يقدرش يكتبها. استخدم PDF (نفس اللوحة) أو طباعة الدفعة.']);
try{ xRibbon(); }catch(e){}
})();
