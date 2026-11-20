/* ====== PARITY chunk, AutoCAD (C.X): 14 ribbon stubs made real on the existing CAD editor (cadD().ents, CS.sel). Every command works on the current selection (CS.sel) or asks with prompt(); every change goes through cadCommit() -> persist() -> hiSnap(), so Ctrl+Z / Redo (hiGo) undo it. Load after c_prog_more.js (the ribbon stubs must exist). Names inside are private to this IIFE. ====== */
(function(){
const PXC={clip:null,gn:0,mn:0};
const pxcId=(tab,panel,en)=>Object.keys(RIBM).find(k=>{ const m=RIBM[k]; return m.type==='draft'&&m.tab===tab&&m.panel===panel&&m.en===en; });
function ov(tab,panel,en,run){ const id=pxcId(tab,panel,en); if(!id){ console.warn('parity_cad: no ribbon entry '+tab+'/'+panel+'/'+en); return; } const o=XC[id]; if(o&&o.stub)RIBP.draft.built++; XCMD(id,o?o.ic:'gear',RIBM[id].en,RIBM[id].ar,()=>{ try{ run(); }catch(e){ xSt(e.message); } }); }
const D=()=>cadD();
const ask=(en,ar,def)=>prompt(b2(en,ar),def);
const xy=s=>{ const m=String(s||'').match(/^\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*$/); return m?[+m[1],+m[2]]:null; };
function sel(){ try{ if(!CS.open)XC.cad.run(); }catch(e){} return [...CS.sel].filter(i=>D().ents[i]); }
function done(msg){ cadCommit(); xSt(msg); CS.msg=msg; try{ cadLayers(); cadPrompt(); cadRender(); }catch(e){} }
const none=()=>xSt(b2('Select objects in the CAD editor first.','اختار عناصر في محرر الرسم الأول.'));
const mouse=()=>CS.mouse[0].toFixed(1)+','+CS.mouse[1].toFixed(1);
const polyArea=q=>{ let s=0; for(let k=0;k<q.length;k++){ const a=q[k], b=q[(k+1)%q.length]; s+=a[0]*b[1]-b[0]*a[1]; } return Math.abs(s)/2; };
const inPoly=(p,q)=>{ let c=false; for(let i=0,j=q.length-1;i<q.length;j=i++){ if((q[i][1]>p[1])!==(q[j][1]>p[1])&&p[0]<(q[j][0]-q[i][0])*(p[1]-q[i][1])/(q[j][1]-q[i][1])+q[i][0])c=!c; } return c; };
function bbox(es){ let b=[1e9,1e9,-1e9,-1e9]; es.forEach(e=>{ const q=ebox(e); b=[Math.min(b[0],q[0]),Math.min(b[1],q[1]),Math.max(b[2],q[2]),Math.max(b[3],q[3])]; }); return b; }

/* ---- Boundary: smallest closed loop around a point. Closed objects (rectangle, closed polyline, circle) and loops of lines / open polylines that meet at shared end points. Not handled: T-junctions where a line ends on the middle of another. ---- */
function loops(){ const d=D(), out=[]; d.ents.forEach(e=>{ if(!cadLay(e.ly).on)return; const q=c2Poly(e); if(q)out.push(q); });
 const key=p=>Math.round(p[0]*1e4)+','+Math.round(p[1]*1e4), nodes={}, adj={};
 d.ents.forEach(e=>{ if(!cadLay(e.ly).on||(e.t!=='l'&&!(e.t==='pl'&&!e.cl)))return; segOf(e).forEach(s=>{ const a=key(s[0]), b=key(s[1]); if(a===b)return; nodes[a]=s[0]; nodes[b]=s[1]; (adj[a]=adj[a]||new Set()).add(b); (adj[b]=adj[b]||new Set()).add(a); }); });
 const ks=Object.keys(nodes); if(ks.length>200)return out; const ix={}; ks.forEach((k,i)=>{ ix[k]=i; }); let cnt=0; const path=[];
 const dfs=(s,u)=>{ if(cnt>20000)return; for(const v of adj[u]){ if(v===s&&path.length>=3&&ix[path[1]]<ix[path[path.length-1]]){ out.push(path.map(k=>nodes[k])); cnt++; } else if(ix[v]>ix[s]&&!path.includes(v)&&path.length<12){ path.push(v); dfs(s,v); path.pop(); } } };
 ks.forEach(s=>{ path.length=0; path.push(s); dfs(s,s); }); return out; }
ov('Home','Draw','Boundary',()=>{ const s=ask('Internal point x,y','نقطة داخلية x,y',mouse()), p=xy(s); if(!p)return; let best=null, ba=1e18; loops().forEach(q=>{ if(!inPoly(p,q))return; const a=polyArea(q); if(a<ba){ ba=a; best=q; } }); if(!best){ xSt(b2('No closed boundary around that point.','مفيش حد مقفول حوالين النقطة دي.')); return; } cadAdd({t:'pl',p:best.map(q=>q.slice()),cl:true,ly:D().cur}); CS.sel=new Set([D().ents.length-1]); done(b2('Boundary created, area = '+ba.toFixed(3),'اتعمل حد، المساحة = '+ba.toFixed(3))); });

/* ---- Edit Polyline: Close / Open / Reverse / Simplify (remove collinear vertices) ---- */
ov('Home','Modify','Edit Polyline',()=>{ const ids=sel().filter(i=>D().ents[i].t==='pl'); if(!ids.length){ xSt(b2('Select a polyline first.','اختار بوليلاين الأول.')); return; } const o=(ask('Option: C close, O open, R reverse, S simplify','اختيار: C قفل، O فتح، R عكس، S تبسيط','C')||'').trim().toUpperCase(); let n=0; if(!['C','O','R','S'].includes(o)){ xSt(b2('Unknown option.','اختيار غير معروف.')); return; }
 ids.forEach(i=>{ const e=D().ents[i]; if(o==='C'){ e.cl=true; n++; } else if(o==='O'){ e.cl=false; n++; } else if(o==='R'){ e.p.reverse(); n++; } else if(o==='S'){ const q=e.p, keep=[q[0]]; for(let k=1;k<q.length-1;k++){ const a=keep[keep.length-1], b=q[k], c=q[k+1], cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]); if(Math.abs(cr)>1e-9*(1+dst(a,b)*dst(b,c)))keep.push(b); else n++; } keep.push(q[q.length-1]); e.p=keep; } });
 done(b2('Polyline edit '+o+': '+n+' change(s)','تحرير بوليلاين '+o+': '+n+' تغيير')); });

/* ---- Mtext: several lines as stacked single-line texts that share one group id (so they select and move together) ---- */
ov('Home','Annotation','Mtext',()=>{ const p=xy(ask('Insert point x,y','نقطة الإدراج x,y',mouse())); if(!p)return; const t=ask('Text (use | for a new line)','النص (استخدم | لسطر جديد)',''); if(!t)return; const h=D().th||2.5, g='mt'+(++PXC.mn)+'_'+Date.now().toString(36); t.split('|').forEach((s,i)=>{ if(s!=='')cadAdd({t:'tx',x:p[0],y:p[1]-i*1.5*h,h,s,ly:'TEXT',g}); }); done(b2('Multiline text added','اتضاف نص متعدد الأسطر')); });

/* ---- Layers: Make Current (layer of the first selected object) and Match (the LAST selected object is the destination) ---- */
ov('Home','Layers','Make Current',()=>{ const ids=sel(); if(!ids.length){ none(); return; } D().cur=D().ents[ids[0]].ly; done(b2('Current layer: '+D().cur,'الطبقة الحالية: '+D().cur)); });
ov('Home','Layers','Match',()=>{ const ids=sel(); if(ids.length<2){ xSt(b2('Select the objects to change, then the destination object last.','اختار العناصر اللي هتتغير وبعدين العنصر الهدف آخر حاجة.')); return; } const dest=D().ents[ids[ids.length-1]].ly; ids.slice(0,-1).forEach(i=>{ D().ents[i].ly=dest; }); done(b2((ids.length-1)+' object(s) moved to layer '+dest,(ids.length-1)+' عنصر اتنقل لطبقة '+dest)); });

/* ---- Properties > Color: hex like #ff0000, or BYLAYER to clear ---- */
ov('Home','Properties','Color',()=>{ const ids=sel(); if(!ids.length){ none(); return; } const c=(ask('Colour (#rrggbb) or BYLAYER','اللون (#rrggbb) أو BYLAYER','#ff0000')||'').trim(); if(/^bylayer$/i.test(c))ids.forEach(i=>{ delete D().ents[i].c; }); else if(/^#[0-9a-f]{6}$/i.test(c))ids.forEach(i=>{ D().ents[i].c=c.toLowerCase(); }); else { xSt(b2('Use #rrggbb or BYLAYER.','استخدم #rrggbb أو BYLAYER.')); return; } done(b2(ids.length+' object(s) colour '+c,ids.length+' عنصر لونه '+c)); });

/* ---- Groups: e.g = group name; picking one member selects the whole group ---- */
{ const _cp=cadPick; cadPick=function(raw,add){ const before=new Set(CS.sel); _cp(raw,add); const ents=D().ents, gs=i=>ents[i]&&ents[i].g; const removed=[...before].filter(i=>!CS.sel.has(i)).map(gs).filter(Boolean); if(removed.length){ ents.forEach((e,i)=>{ if(e.g&&removed.includes(e.g))CS.sel.delete(i); }); } else { const gset=new Set([...CS.sel].map(gs).filter(Boolean)); ents.forEach((e,i)=>{ if(e.g&&gset.has(e.g))CS.sel.add(i); }); } }; }
ov('Home','Groups','Group',()=>{ const ids=sel(); if(ids.length<2){ xSt(b2('Select two or more objects to group.','اختار عنصرين أو أكتر للتجميع.')); return; } let nm=(ask('Group name','اسم المجموعة','GROUP'+(PXC.gn+1))||'').trim(); if(!nm)return; PXC.gn++; if(D().ents.some((e,i)=>e.g===nm&&!ids.includes(i)))nm+='_'+PXC.gn; ids.forEach(i=>{ D().ents[i].g=nm; }); done(b2('Group '+nm+': '+ids.length+' objects','المجموعة '+nm+': '+ids.length+' عنصر')); });
ov('Home','Groups','Ungroup',()=>{ const ids=sel(), gs=new Set(ids.map(i=>D().ents[i].g).filter(Boolean)); if(!gs.size){ xSt(b2('The selection has no group.','التحديد مفيهوش مجموعة.')); return; } let n=0; D().ents.forEach(e=>{ if(e.g&&gs.has(e.g)){ delete e.g; n++; } }); done(b2(gs.size+' group(s) dissolved, '+n+' objects','فك '+gs.size+' مجموعة، '+n+' عنصر')); });

/* ---- Clipboard: in-memory (kept until the page reloads); paste keeps relative geometry and re-creates missing layers ---- */
function copyClip(ids){ const es=ids.map(i=>JSON.parse(JSON.stringify(D().ents[i]))), b=bbox(es), lay={}; es.forEach(e=>{ lay[e.ly]=cadLay(e.ly).c; }); PXC.clip={es,base:[b[0],b[1]],lay}; }
ov('Home','Clipboard','Copy Clip',()=>{ const ids=sel(); if(!ids.length){ none(); return; } copyClip(ids); xSt(b2(ids.length+' object(s) copied to the clipboard','اتنسخ '+ids.length+' عنصر للحافظة')); });
ov('Home','Clipboard','Cut',()=>{ const ids=sel(); if(!ids.length){ none(); return; } copyClip(ids); const s=new Set(ids); D().ents=D().ents.filter((e,i)=>!s.has(i)); CS.sel.clear(); done(b2(ids.length+' object(s) cut','اتقص '+ids.length+' عنصر')); });
ov('Home','Clipboard','Paste',()=>{ const c=PXC.clip; if(!c||!c.es.length){ xSt(b2('The clipboard is empty.','الحافظة فاضية.')); return; } try{ if(!CS.open)XC.cad.run(); }catch(e){} const p=xy(ask('Paste base point x,y','نقطة اللصق x,y',mouse())); if(!p)return; const f=q=>[q[0]-c.base[0]+p[0],q[1]-c.base[1]+p[1]], gm={}, first=D().ents.length; c.es.forEach(e=>{ const n=mapE(e,f); if(n.g){ gm[n.g]=gm[n.g]||(n.g+'_p'+(++PXC.gn)); n.g=gm[n.g]; } if(!D().layers.some(l=>l.n===n.ly))D().layers.push({n:n.ly,c:c.lay[n.ly]||'#ffffff',on:1,lk:0}); D().ents.push(n); }); CS.sel=new Set(c.es.map((e,k)=>first+k)); done(b2(c.es.length+' object(s) pasted','اتلصق '+c.es.length+' عنصر')); });

/* ---- Dimensions: Baseline and Continue chain from the selected (or the last) dimension; Diameter dimensions circles ---- */
function baseDim(){ const ents=D().ents, ids=[...CS.sel].filter(i=>ents[i]&&ents[i].t==='dim'); if(ids.length)return ents[ids[ids.length-1]]; for(let i=ents.length-1;i>=0;i--)if(ents[i].t==='dim')return ents[i]; return null; }
function chain(kind){ try{ if(!CS.open)XC.cad.run(); }catch(e){} const b=baseDim(); if(!b){ xSt(b2('Make a linear dimension first.','اعمل بُعد خطي الأول.')); return; } const p=xy(ask('Next point x,y','النقطة التالية x,y',mouse())); if(!p)return; const sp=3*(D().th||2.5), n=kind==='base'?{t:'dim',x1:b.x1,y1:b.y1,x2:p[0],y2:p[1],off:(b.off||0)+sp,ly:'DIM'}:{t:'dim',x1:b.x2,y1:b.y2,x2:p[0],y2:p[1],off:b.off||0,ly:'DIM'}; D().ents.push(n); CS.sel=new Set([D().ents.length-1]); done(b2((kind==='base'?'Baseline':'Continued')+' dimension = '+dimGeo(n).v.toFixed(3),(kind==='base'?'بُعد خط أساس':'بُعد متابع')+' = '+dimGeo(n).v.toFixed(3))); }
ov('Annotate','Dimensions','Baseline',()=>chain('base'));
ov('Annotate','Dimensions','Continue',()=>chain('cont'));
{ const _es=cadEntSvg; cadEntSvg=function(e,s,paper){ const r=_es(e,s,paper); return (e&&e.t==='dim'&&e.pre)?r.replace(/(<text[^>]*>)/,'$1'+e.pre):r; }; }
ov('Annotate','Dimensions','Diameter',()=>{ const ids=sel().filter(i=>D().ents[i].t==='c'); if(!ids.length){ xSt(b2('Select a circle first.','اختار دايرة الأول.')); return; } const k=Math.SQRT1_2, first=D().ents.length; ids.forEach(i=>{ const c=D().ents[i]; D().ents.push({t:'dim',x1:c.x-c.r*k,y1:c.y-c.r*k,x2:c.x+c.r*k,y2:c.y+c.r*k,off:0,pre:'Ø',ly:'DIM'}); }); CS.sel=new Set(ids.map((x,j)=>first+j)); done(b2(ids.length+' diameter dimension(s)','عدد '+ids.length+' بُعد قطر')); });
try{ xRibbon(); }catch(e){}
})();
