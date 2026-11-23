/* ====== C.X: import an ASCII DXF drawing into the 2D editor (DATA.cad). Reads LINE, CIRCLE, ARC, ELLIPSE, LWPOLYLINE, POLYLINE, SPLINE, TEXT, MTEXT, DIMENSION and INSERT (blocks expanded), plus layer colours. Curves become polylines. DWG is a closed binary format: the user saves it as DXF first. Load after c_cad*.js and c_shell.js. Globals: cadDxfParse, cadImportDxf. ====== */
const CADIMP_ACI={1:'#ef5350',2:'#ffd54f',3:'#66bb6a',4:'#4fc3f7',5:'#5c6bc0',6:'#ec407a',7:'#e8e8e8',8:'#9e9e9e',9:'#bdbdbd'};
function cadDxfParse(t){
 if(t.indexOf('AutoCAD Binary DXF')===0)throw new Error(b2('Binary DXF is not supported: save it as ASCII DXF.','DXF الثنائي مش مدعوم: احفظه ASCII DXF.'));
 const R=t.split(/\r?\n/), pr=[]; for(let i=0;i+1<R.length;i+=2)pr.push([parseInt(R[i],10),R[i+1].trim()]);
 if(!pr.some(p=>p[0]===0&&p[1]==='SECTION'))throw new Error(b2('This file is not a DXF drawing.','الملف ده مش لوحة DXF.'));
 // group the pairs into records: one record per code-0 line
 const rec=[]; let c=null; pr.forEach(p=>{ if(p[0]===0){ c={t:p[1],g:[]}; rec.push(c); } else if(c)c.g.push(p); });
 const one=(r,k,d)=>{ const p=r.g.find(x=>x[0]===k); return p?p[1]:d; }, num=(r,k,d)=>{ const v=parseFloat(one(r,k,'')); return isFinite(v)?v:(d||0); }, all=(r,k)=>r.g.filter(x=>x[0]===k).map(x=>parseFloat(x[1])||0);
 const layers={}, blocks={}, top=[], skip={}; let sec='', blk=null, pl=null, tgt=top;
 const ent=(r)=>{ const ly=one(r,8,'0'), T=r.t;
  if(T==='LINE')return {t:'l',ly,x1:num(r,10),y1:num(r,20),x2:num(r,11),y2:num(r,21)};
  if(T==='CIRCLE')return {t:'c',ly,x:num(r,10),y:num(r,20),r:num(r,40)};
  if(T==='ARC'){ const cx=num(r,10),cy=num(r,20),rad=num(r,40); let a=num(r,50)*Math.PI/180,b=num(r,51)*Math.PI/180; if(b<=a)b+=2*Math.PI; const n=Math.max(6,Math.ceil((b-a)/(Math.PI/18))), p=[]; for(let i=0;i<=n;i++){ const u=a+(b-a)*i/n; p.push([cx+rad*Math.cos(u),cy+rad*Math.sin(u)]); } return {t:'pl',ly,p}; }
  if(T==='ELLIPSE'){ const cx=num(r,10),cy=num(r,20),mx=num(r,11),my=num(r,21),k=num(r,40,1),a=num(r,41,0); let b=num(r,42,2*Math.PI); if(b<=a)b+=2*Math.PI; const n=48,p=[]; for(let i=0;i<=n;i++){ const u=a+(b-a)*i/n; p.push([cx+mx*Math.cos(u)-my*k*Math.sin(u),cy+my*Math.cos(u)+mx*k*Math.sin(u)]); } return {t:'pl',ly,p}; }
  if(T==='LWPOLYLINE'){ const xs=all(r,10),ys=all(r,20); if(xs.length<2)return null; return {t:'pl',ly,p:xs.map((x,i)=>[x,ys[i]||0]),cl:(num(r,70)&1)?1:0}; }
  if(T==='SPLINE'){ let xs=all(r,11),ys=all(r,21); if(xs.length<2){ xs=all(r,10); ys=all(r,20); } if(xs.length<2)return null; return {t:'pl',ly,p:xs.map((x,i)=>[x,ys[i]||0]),cl:(num(r,70)&1)?1:0}; }
  if(T==='TEXT'||T==='MTEXT'||T==='ATTRIB'){ let s=r.g.filter(x=>x[0]===3).map(x=>x[1]).join('')+one(r,1,''); s=s.replace(/\\P/g,' ').replace(/\\[A-Za-z][^;\\]*;/g,'').replace(/\\[LlOoKk]/g,'').replace(/[{}]/g,'').replace(/%%[cdpCDP]/g,'').trim(); if(!s)return null; return {t:'tx',ly,x:num(r,10),y:num(r,20),h:num(r,40,2.5)||2.5,s}; }
  if(T==='INSERT'||T==='DIMENSION')return {t:'ins',ly,b:one(r,2,''),x:T==='INSERT'?num(r,10):0,y:T==='INSERT'?num(r,20):0,sx:T==='INSERT'?num(r,41,1)||1:1,sy:T==='INSERT'?num(r,42,1)||1:1,a:T==='INSERT'?num(r,50)*Math.PI/180:0};
  if(!/^(POINT|ATTDEF|VIEWPORT|SEQEND)$/.test(T))skip[T]=(skip[T]||0)+1; return null; };
 rec.forEach(r=>{
  if(r.t==='SECTION'){ sec=one(r,2,''); return; } if(r.t==='ENDSEC'){ sec=''; return; }
  if(sec==='TABLES'){ if(r.t==='LAYER'){ const n=one(r,2,''); if(n)layers[n]={c:Math.abs(parseInt(one(r,62,'7'),10))||7}; } return; }
  if(sec!=='BLOCKS'&&sec!=='ENTITIES')return;
  if(r.t==='BLOCK'){ blk={x:num(r,10),y:num(r,20),e:[]}; blocks[one(r,2,'')]=blk; tgt=blk.e; return; } if(r.t==='ENDBLK'){ blk=null; tgt=top; return; }
  if(r.t==='POLYLINE'){ pl={t:'pl',ly:one(r,8,'0'),p:[],cl:(num(r,70)&1)?1:0}; return; } if(r.t==='VERTEX'){ if(pl)pl.p.push([num(r,10),num(r,20)]); return; } if(r.t==='SEQEND'){ if(pl&&pl.p.length>1)(sec==='BLOCKS'&&blk?blk.e:top).push(pl); pl=null; return; }
  const e=ent(r); if(e)(sec==='BLOCKS'&&blk?blk.e:top).push(e); });
 // expand block references into plain entities (nested up to 6 deep)
 const out=[]; const xf=(e,f,k)=>{ const o=Object.assign({},e); if(o.t==='l'){ [o.x1,o.y1]=f([o.x1,o.y1]); [o.x2,o.y2]=f([o.x2,o.y2]); } else if(o.t==='pl')o.p=o.p.map(f); else { [o.x,o.y]=f([o.x,o.y]); if(o.t==='c')o.r*=k; if(o.t==='tx')o.h*=k; } return o; };
 const put=(list,f,k,d,ly0)=>list.forEach(e=>{ if(e.t!=='ins'){ const o=f?xf(e,f,k):e; if(ly0&&o.ly==='0')o.ly=ly0; out.push(o); return; } const B=blocks[e.b]; if(!B||d>6)return; const ca=Math.cos(e.a),sa=Math.sin(e.a); const g=p=>{ const x=(p[0]-B.x)*e.sx,y=(p[1]-B.y)*e.sy, q=[e.x+x*ca-y*sa,e.y+x*sa+y*ca]; return f?f(q):q; }; put(B.e,g,(k||1)*Math.abs(e.sx),d+1,e.ly); });
 put(top,null,1,0,''); return {ents:out,layers,skip};
}
function cadImportDxf(text,name){ const r=cadDxfParse(text); if(!r.ents.length)throw new Error(b2('No drawable entities found in this DXF.','مفيش عناصر تترسم في ملف الـDXF ده.'));
 try{ hiSnap(); }catch(e){} const D=cadD(); r.ents.forEach(e=>{ const n=String(e.ly||'0'); if(!D.layers.some(l=>l.n===n))D.layers.push({n,c:CADIMP_ACI[(r.layers[n]||{}).c]||'#e8e8e8',on:1,lk:0}); e.ly=n; D.ents.push(e); });
 persist(); try{ XC.cad.run(); }catch(e){} try{ cadLayers(); cadZoomExt(); cadRender(); }catch(e){}
 const sk=Object.keys(r.skip).map(k=>k+' x'+r.skip[k]).join(', '); const msg=b2('Imported '+r.ents.length+' entities'+(name?' from '+name:'')+(sk?'. Not imported: '+sk:'')+'. Curves are drawn as polylines.','اتستورد '+r.ents.length+' عنصر'+(name?' من '+name:'')+(sk?'. ما اتستوردش: '+sk:'')+'. المنحنيات اترسمت بوليلاين.'); try{ say2(msg,'a'); }catch(e){} return {n:r.ents.length,skip:r.skip,msg}; }
function cadImportPick(){ xfile('.dxf,.dwg',f=>{ if(/\.dwg$/i.test(f.name)){ alert(b2('DWG is a closed binary format and cannot be read in the browser. In AutoCAD use SAVEAS and choose DXF (or the free ODA File Converter), then import the DXF here.','DWG صيغة ثنائية مقفولة وما تتقريش في المتصفح. في أوتوكاد استخدم SAVEAS واختار DXF (أو برنامج ODA File Converter المجاني)، وبعدين استورد الـDXF هنا.')); return; } const rd=new FileReader(); rd.onload=()=>{ try{ const r=cadImportDxf(String(rd.result),f.name); alert(r.msg); }catch(e){ alert(b2('Import failed: ','الاستيراد فشل: ')+e.message); } }; rd.readAsText(f); }); }
XCMD('c_dxfin','impt','Import DXF','استيراد DXF',cadImportPick);
try{ XDESC.c_dxfin=['Import a DXF drawing (lines, arcs, polylines, text, blocks, layers) into C.X. DWG must be saved as DXF first.','استورد لوحة DXF (خطوط، أقواس، بوليلاين، نصوص، بلوكات، طبقات) جوه C.X. الـDWG لازم يتحفظ DXF الأول.']; }catch(e){}
// self-check: a tiny DXF with a line, a closed polyline, an arc and a block inserted twice
(function(){ const d='0\nSECTION\n2\nBLOCKS\n0\nBLOCK\n2\nB1\n10\n0\n20\n0\n0\nLINE\n8\n0\n10\n0\n20\n0\n11\n1\n21\n0\n0\nENDBLK\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nA\n10\n0\n20\n0\n11\n5\n21\n5\n0\nLWPOLYLINE\n8\nA\n70\n1\n10\n0\n20\n0\n10\n2\n20\n0\n10\n2\n20\n2\n0\nARC\n8\nA\n10\n0\n20\n0\n40\n1\n50\n0\n51\n90\n0\nINSERT\n8\nW\n2\nB1\n10\n10\n20\n0\n41\n2\n50\n90\n0\nINSERT\n8\nW\n2\nB1\n10\n0\n20\n0\n0\nENDSEC\n0\nEOF\n'; const r=cadDxfParse(d), i=r.ents[3]; console.assert(r.ents.length===5&&r.ents[1].cl===1&&i.ly==='W'&&Math.abs(i.x2-10)<1e-9&&Math.abs(i.y2-2)<1e-9,'cadDxfParse self-check failed'); })();
