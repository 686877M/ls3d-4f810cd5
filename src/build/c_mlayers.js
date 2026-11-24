/* ====== Master plan: on/off switch per drawing layer, with the layer names as drawn. Needs MSITE.lay[cat] = [[layer, first segment, segment count], ...] (written by the drawing import); without it nothing is added. Each category is one LineSegments object, so a layer is hidden through a geometry group with an invisible material. Load after c_site3d.js. ====== */
const MLY={off:{}};
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
  L.forEach(r=>{ const c=el('input',{type:'checkbox',checked:'',onchange:e=>{ if(e.target.checked)delete MLY.off[k+'|'+r[0]]; else MLY.off[k+'|'+r[0]]=1; all.checked=!L.some(q=>MLY.off[k+'|'+q[0]]); mlyApply(); }}); cks.push(c); d.appendChild(el('label',{style:'display:flex;gap:6px;align-items:center;padding:1px 0 1px 18px;direction:ltr'},c,el('span',{style:'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap',title:r[0],text:r[0]}),el('span',{class:'small',text:String(r[2])}))); });
  box.appendChild(d); });
 pSite.appendChild(box);
 try{ TOXAPI.siteLayer=(name,on)=>{ let n=0; Object.keys(MSITE.lay).forEach(k=>MSITE.lay[k].forEach(r=>{ if(r[0].toLowerCase()===String(name).toLowerCase()){ n++; if(on)delete MLY.off[k+'|'+r[0]]; else MLY.off[k+'|'+r[0]]=1; } })); mlyApply(); return n; }; }catch(e){}
})();
