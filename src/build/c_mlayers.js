/* ====== Master plan: on/off switch per drawing layer, with the layer names as drawn. Needs MSITE.lay[cat] = [[layer, first segment, segment count], ...] (written by the drawing import); without it nothing is added. Each category is one LineSegments object, so a layer is hidden through a geometry group with an invisible material. Load after c_site3d.js. ====== */
const MLY={off:{},col:false};
/* colours as drawn: one vertex colour per segment from its layer (rows carry [layer, first, count, colour, frozen]). Entities with their own colour override are shown in the layer colour. */
function mlyColors(on){ try{ MLY.col=!!on; if(typeof MSITE==='undefined'||!MSITE.lay)return; scene.traverse(o=>{ const k=o.userData&&o.userData.mk, L=k&&MSITE.lay[k]; if(!o.isLineSegments||!L)return; const base=o.userData.mly0||(Array.isArray(o.material)?o.material[0]:o.material); o.userData.mly0=base;
  if(on){ if(!o.geometry.attributes.color){ const n=o.geometry.attributes.position.count, a=new Float32Array(n*3).fill(1); L.forEach(r=>{ const c=r[3]===undefined?0xffffff:r[3], R=(c>>16&255)/255, Gc=(c>>8&255)/255, B=(c&255)/255; for(let v=r[1]*2;v<(r[1]+r[2])*2&&v<n;v++){ a[v*3]=R; a[v*3+1]=Gc; a[v*3+2]=B; } }); o.geometry.setAttribute('color',new T.Float32BufferAttribute(a,3)); }
   if(base.userData.c0===undefined)base.userData.c0=base.color.getHex(); base.color.setHex(0xffffff); base.vertexColors=true; base.needsUpdate=true; }
  else if(base.userData.c0!==undefined){ base.color.setHex(base.userData.c0); base.vertexColors=false; base.needsUpdate=true; } }); }catch(e){ console.warn('mly col',e); } }
function mlyApply(){ try{ if(typeof MSITE==='undefined'||!MSITE.lay)return; scene.traverse(o=>{ const k=o.userData&&o.userData.mk, L=k&&MSITE.lay[k]; if(!o.isLineSegments||!L)return;
  if(!o.userData.mly0)o.userData.mly0=Array.isArray(o.material)?o.material[0]:o.material; const base=o.userData.mly0, any=L.some(r=>MLY.off[k+'|'+r[0]]);
  if(!any){ o.geometry.clearGroups(); o.material=base; return; }
  if(!o.userData.mlyH){ const h=base.clone(); h.visible=false; o.userData.mlyH=h; }
  o.geometry.clearGroups(); L.forEach(r=>o.geometry.addGroup(r[1]*2,r[2]*2,MLY.off[k+'|'+r[0]]?1:0)); o.material=[base,o.userData.mlyH]; }); }catch(e){ console.warn('mly',e); } }
(function(){ if(typeof MSITE==='undefined'||!MSITE.lay||typeof pSite==='undefined'||!pSite)return;
 const CN={road:['Roads','الطرق'],redge:['Road edges','حواف الطرق'],curb:['Curbs','البردورات'],fence:['Fences','الأسوار'],bldg:['Buildings','المباني'],struc:['Structure','الإنشائي'],mark:['Markings','العلامات'],sew:['Sewer','الصرف'],storm:['Storm','المطر'],mech:['Mechanical','الميكانيكا'],plumb:['Plumbing','السباكة'],topo:['Topography','الطبوغرافيا'],misc:['Other','أخرى']};
 const box=el('details',{style:'margin:10px 0'},el('summary',{style:'cursor:pointer;font-weight:600',text:b2('Drawing layers (names as drawn)','طبقات اللوحة (بأسمائها زي اللوحة)')+'  '+Object.keys(MSITE.lay).reduce((a,k)=>a+MSITE.lay[k].length,0)}));
 Object.keys(MSITE.lay).forEach(k=>{ const L=MSITE.lay[k], cks=[]; const d=el('details',{style:'margin:3px 0 3px 10px'}); const all=el('input',{type:'checkbox',checked:'',title:b2('All layers of this group','كل طبقات المجموعة'),onclick:e=>e.stopPropagation(),onchange:e=>{ L.forEach(r=>{ if(e.target.checked)delete MLY.off[k+'|'+r[0]]; else MLY.off[k+'|'+r[0]]=1; }); cks.forEach(c=>{c.checked=e.target.checked;}); mlyApply(); }});
  d.appendChild(el('summary',{style:'cursor:pointer'},all,el('span',{text:' '+(CN[k]||[k,k])[lang==='ar'?1:0]+'  '}),el('span',{class:'small',text:L.length+' '+b2('layers','طبقة')})));
  L.forEach(r=>{ const c=el('input',{type:'checkbox',checked:r[4]?null:'',onchange:e=>{ if(e.target.checked)delete MLY.off[k+'|'+r[0]]; else MLY.off[k+'|'+r[0]]=1; all.checked=!L.some(q=>MLY.off[k+'|'+q[0]]); mlyApply(); }}); cks.push(c); d.appendChild(el('label',{style:'display:flex;gap:6px;align-items:center;padding:1px 0 1px 18px;direction:ltr'},c,el('span',{style:'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap',title:r[0],text:r[0]}),el('span',{class:'small',text:String(r[2])}))); });
  box.appendChild(d); });
 const hasCol=Object.keys(MSITE.lay).some(k=>MSITE.lay[k].some(r=>r[3]!==undefined));
 if(hasCol){ box.insertBefore(el('label',{style:'display:block;margin:6px 0 6px 10px'},el('input',{type:'checkbox',checked:'',onchange:e=>mlyColors(e.target.checked)}),' '+b2('Layer colours as drawn','ألوان الطبقات زي اللوحة')),box.children[1]||null);
  // layers frozen or off in the drawing start hidden, as drawn; the colours and this state apply once the site is built
  Object.keys(MSITE.lay).forEach(k=>MSITE.lay[k].forEach(r=>{ if(r[4])MLY.off[k+'|'+r[0]]=1; }));
  let n=0; const t=setInterval(()=>{ n++; if(n>60){clearInterval(t);return;} try{ if(!SP.built)return; clearInterval(t); mlyColors(true); mlyApply(); }catch(e){} },500); }
 pSite.appendChild(box);
 try{ TOXAPI.siteLayer=(name,on)=>{ let n=0; Object.keys(MSITE.lay).forEach(k=>MSITE.lay[k].forEach(r=>{ if(r[0].toLowerCase()===String(name).toLowerCase()){ n++; if(on)delete MLY.off[k+'|'+r[0]]; else MLY.off[k+'|'+r[0]]=1; } })); mlyApply(); return n; }; }catch(e){}
})();
