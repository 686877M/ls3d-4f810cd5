/* ====== Parts pane as a project tree: Site -> facilities (tanks, buildings, pits...) -> the pump station with its parts under it. Facilities come from the site masses (SPS); clicking one frames it in 3D and shows its note. Load after c_ui.js, c_site3d.js and c_msite_mass.js. ====== */
(function(){ if(typeof renderParts!=='function'||typeof SPS==='undefined')return;
 const _rp=renderParts, open={site:1,st:1}, K=k=>'xto-ptree-'+k;
 const frame=s=>{ try{ if(!SP.on)spShow(true); tw=null; const cx=(s[2]+s[4])/2, cz=(s[3]+s[5])/2, d=Math.max(s[4]-s[2],s[5]-s[3],s[7],8)*1.6, gy=(G?G.GY:0); controls.target.set(cx,gy+s[6]+s[7]/2,cz); camera.position.set(cx+d,gy+d*.8,cz-d); controls.update(); }catch(e){} };
 const node=(key,title,count,kids)=>{ const d=el('details',{style:'margin:2px 0'}); if(open[key])d.setAttribute('open',''); d.addEventListener('toggle',()=>{open[key]=d.open?1:0;}); d.appendChild(el('summary',{style:'cursor:pointer;padding:4px 2px;font-weight:600'},el('span',{text:title}),el('span',{class:'small',text:'  '+count}))); const b=el('div',{style:'padding-inline-start:14px;border-inline-start:1px solid rgba(128,128,128,.3);margin-inline-start:6px'}); kids.forEach(k=>b.appendChild(k)); d.appendChild(b); return d; };
 renderParts=function(){ _rp.apply(this,arguments); try{
  const L=lang==='ar'?1:0, parts0=[...ptList.children]; if(!parts0.length)return;
  const station=node('st',b2('Sewage lift station (pump station)','محطة رفع الصرف (محطة الطلمبات)'),parts0.length+' '+b2('parts','جزء'),parts0);
  const G2={}; SPS.forEach((s,i)=>{ (G2[s[11]||'bldg']=G2[s[11]||'bldg']||[]).push([s,i]); });
  const fac=Object.keys(G2).map(g=>node('g_'+g,(typeof spGrpName!=='undefined'&&spGrpName[g]?spGrpName[g][L]:g),G2[g].length,G2[g].map(([s,i])=>el('button',{class:'pitem',title:s[9+L]||'',onclick:()=>{ frame(s); try{ ptCard.innerHTML=''; ptCard.appendChild(el('h2',{text:s[L]})); ptCard.appendChild(el('div',{class:'small',text:(s[4]-s[2]).toFixed(1)+' × '+(s[5]-s[3]).toFixed(1)+' × '+s[7]+' m'})); if(s[9+L])ptCard.appendChild(el('p',{text:s[9+L]})); }catch(e){} }},el('span',{text:s[L]}),el('span',{class:'small',text:s[7]+' m'})))));
  const root=node('site',b2('Site (whole project)','الموقع (المشروع كله)'),(SPS.length+1)+' '+b2('facilities','منشأة'),[station,...fac]);
  ptList.appendChild(root);
 }catch(e){ console.warn('ptree',e); } };
 try{ renderParts(); }catch(e){}
})();
