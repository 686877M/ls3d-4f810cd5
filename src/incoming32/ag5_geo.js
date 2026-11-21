/* ====== ag5_geo: "open Egypt, Maadi, street 9" -> G.X flies there with a marker. Order: local demo places (gm_ui.js GMPLOTS, no network),
   typed coordinates, then OpenStreetMap Nominatim under its usage policy: one request at a time and at least 1.1 s apart, results cached
   (memory + this browser tab's sessionStorage), no search-as-you-type, no bulk, attribution shown, at most 3 tries per request (drops the most
   specific part when nothing is found, and says so). Arabic and English names work (accept-language ar,en). Sensitive project mode
   (privacy.js): blocked unless the user allows map search (PRIV.cfg.geo, the same switch as the privacy panel). Requests go through
   window.fetch, i.e. the privacy.js gate still applies. ====== */
const AG5G={cache:null,last:0,chain:Promise.resolve(),host:'nominatim.openstreetmap.org',n:0,base:'https://nominatim.openstreetmap.org/search'};
function ag5GeoCache(){ if(AG5G.cache)return AG5G.cache; AG5G.cache=new Map(); try{ const o=JSON.parse(sessionStorage.getItem('xto-ag5geo')||'null'); if(o&&typeof o==='object')Object.keys(o).slice(-100).forEach(k=>AG5G.cache.set(k,o[k])); }catch(e){} return AG5G.cache; }
function ag5GeoKeep(k,v){ const c=ag5GeoCache(); c.set(k,v); if(c.size>100)c.delete(c.keys().next().value); try{ const o={}; c.forEach((x,y)=>o[y]=x); sessionStorage.setItem('xto-ag5geo',JSON.stringify(o)); }catch(e){} }
const ag5GeoSens=()=>{ try{ return !!(PRIV&&PRIV.cfg&&PRIV.cfg.sensitive&&!PRIV.cfg.geo); }catch(e){ return false; } };
function ag5GeoAllow(){ try{ PRIV.cfg.geo=true; PRIV.save(); xaLog('ag5','user allowed map search ('+AG5G.host+') in Sensitive mode'); }catch(e){} }
/* local demo places: id, English or Arabic name, or a well-known district word in it */
function ag5Preset(q){ if(!q||typeof GMPLOTS==='undefined')return null; const n=norm(q).replace(/[,،]/g,' ').replace(/\s+/g,' ').trim(); if(!n)return null;
 const m=n.match(/(?:^|\s)(?:plot|قطعه)?\s*(nc1|nc2|nc3|sz|alx)(?=\s|$)/); if(m)return GMPLOTS.find(p=>p.id===m[1])||null;
 const keys=[['nc2',/(new cairo a|التجمع الخامس|fifth settlement|التجمع)/],['nc1',/(new cairo c|التسعين)/],['sz',/(sheikh zayed|الشيخ زايد|زايد)/],['alx',/(smouha|سموحه)/]];
 for(const [id,re] of keys)if(re.test(n))return GMPLOTS.find(p=>p.id===id)||null; return null; }
/* parts ordered from the most specific to the most general; duplicates ("Maadi, Maadi district") merged */
function ag5GeoParts(q){ let p=String(q).split(/[,،]/).map(x=>x.trim()).filter(Boolean); const g=/^(مصر|egypt|جمهوريه مصر العربيه|القاهره|cairo|الجيزه|giza)$/; if(p.length>1&&g.test(norm(p[0]))&&!g.test(norm(p[p.length-1])))p.reverse();
 const out=[]; p.forEach(x=>{ const nx=norm(x).replace(/^(حي|منطقه|district of)\s+/,''); const j=out.findIndex(y=>{ const ny=norm(y).replace(/^(حي|منطقه|district of)\s+/,''); return ny===nx||ny.indexOf(nx)>=0||nx.indexOf(ny)>=0; }); if(j<0)out.push(x); else if(x.length>out[j].length)out[j]=x; }); return out; }
function ag5GeoWait(R){ const run=async()=>{ const w=AG5G.last+1100-Date.now(); if(w>0)await ag5Sleep(w); if(R&&R.cancel)throw ag5Err('stopped','اتوقف'); }; const p=AG5G.chain.then(run,run); AG5G.chain=p.catch(()=>{}); return p; }
async function ag5GeoAsk(parts,R){ const eg=parts.some(x=>/^(مصر|egypt)$/.test(norm(x))), q=parts.filter(x=>!(eg&&/^(مصر|egypt)$/.test(norm(x)))).join(', ')||parts.join(', '); const key=(eg?'eg|':'')+norm(q); const c=ag5GeoCache();
 if(c.has(key))return {q,list:c.get(key),cached:1};
 await ag5GeoWait(R); AG5G.last=Date.now(); AG5G.n++;
 const url=AG5G.base+'?format=jsonv2&limit=3&addressdetails=0&accept-language=ar,en'+(eg?'&countrycodes=eg':'')+'&q='+encodeURIComponent(q); let r;
 try{ r=await fetch(url,{signal:R&&R.ac?R.ac.signal:undefined,headers:{accept:'application/json'}}); }catch(e){ if(/Sensitive/i.test(String(e&&e.message)))throw ag5Err('blocked by Sensitive project mode','ممنوع بسبب وضع المشروع الحساس'); if(R&&R.cancel)throw ag5Err('stopped','اتوقف'); throw ag5Err('map search not reachable (needs internet)','البحث في الخريطة مش متاح (محتاج إنترنت)'); }
 AG5G.last=Date.now(); if(r.status===429)throw ag5Err('the map search service asked to slow down: try again in a minute','خدمة البحث طلبت نهدّى: جرّب بعد دقيقة'); if(!r.ok)throw ag5Err('map search error '+r.status,'خطأ في البحث '+r.status);
 let j; try{ j=await r.json(); }catch(e){ throw ag5Err('map search answer unreadable','رد البحث مش مفهوم'); } const list=(Array.isArray(j)?j:[]).slice(0,3).map(x=>({lat:+x.lat,lon:+x.lon,name:String(x.display_name||x.name||q).slice(0,160),bb:Array.isArray(x.boundingbox)?x.boundingbox.map(Number):null,type:x.type||'',cls:x.category||x.class||''})).filter(x=>isFinite(x.lat)&&isFinite(x.lon));
 ag5GeoKeep(key,list); return {q,list}; }
async function ag5Geocode(q,R){ const pre=ag5Preset(q); if(pre)return {lat:pre.c[0],lon:pre.c[1],name:ag5B(pre.en,pre.ar),src:'preset',plot:pre.id,z:19};
 try{ const c=typeof parseCoord==='function'?parseCoord(q):null; if(c&&/\d/.test(q)&&Math.abs(c[0])<=90&&Math.abs(c[1])<=180&&!/[a-zA-Z؀-ۿ]{3,}/.test(q.replace(/[NSEWnsew°dms]/g,'')))return {lat:c[0],lon:c[1],name:c[0].toFixed(6)+', '+c[1].toFixed(6),src:'coord',z:17}; }catch(e){}
 if(ag5GeoSens()){ const e=ag5Err('map search is blocked by Sensitive project mode','البحث في الخريطة ممنوع في وضع المشروع الحساس'); e.sens=1; throw e; }
 let parts=ag5GeoParts(q); const want=parts.slice(); let dropped=[]; for(let i=0;i<3&&parts.length;i++){ const a=await ag5GeoAsk(parts,R); if(a.list.length){ const t=a.list[0]; let z=16; if(t.bb){ const sp=Math.max(t.bb[1]-t.bb[0],t.bb[3]-t.bb[2]); z=Math.max(4,Math.min(18,Math.round(Math.log2(360/Math.max(sp,1e-4))-1))); }
   return Object.assign(t,{src:'osm',z,dropped,asked:want.join(', '),cached:a.cached}); }
  if(parts.length<2)break; dropped.push(parts[0]); parts=parts.slice(1); }
 throw ag5Err('no place found for "'+want.join(', ')+'"','مالقيتش مكان اسمه "'+want.join('، ')+'"'); }
function ag5GisLayer(){ let L=GM.layers.find(l=>l.id==='LAG5'); if(!L){ L={id:'LAG5',n:ag5B('Agent places','أماكن الوكيل'),vis:1,op:1,feat:[]}; GM.layers.push(L); } return L; }
function ag5GisHas(f){ try{ return GM.layers.some(l=>l.feat.includes(f)); }catch(e){ return false; } }
function ag5MapReady(){ try{ return !!(GM.cv&&GM.cv.isConnected&&GM.cv.width>0&&GM.cv.getBoundingClientRect().width>0); }catch(e){ return false; } }
async function ag5EnsureMap(R){ if(ag5MapReady())return; try{ wxOpen('pane:gismap',[0,0,.68,1]); }catch(e){} await ag5Until(ag5MapReady,AG5.tmo.tab,'the map did not open','الخريطة ماتفتحتش',R); }
function ag5ShowAttr(r){ if(r.src==='osm')ag5Attr(ag5B('Place search: ','البحث عن الأماكن: ')+'<a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener">Nominatim</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> '+ag5B('contributors (ODbL)','contributors (ODbL)')); else if(r.src==='preset')ag5Attr(ag5B('Demo place: approximate, not a surveyed plot.','مكان ديمو: تقريبي، مش قطعة مرفوعة.')); }
AG5OPS.geo=async(st,R)=>{ await ag5EnsureMap(R); let r; try{ r=await ag5Geocode(st.q,R); }catch(e){
  if(e.sens&&AG5.w){ const box=AG5.w.querySelector('.ask'); box.innerHTML=''; box.appendChild(ag5E('span',{text:ag5B('Allow place search on '+AG5G.host+' for this project?','تسمح بالبحث عن الأماكن على '+AG5G.host+' للمشروع ده؟')})); box.appendChild(ag5E('button',{id:'ag5allowgeo',text:ag5B('Allow and retry','اسمح وحاول تاني'),onclick:()=>{ box.innerHTML=''; ag5GeoAllow(); xaHandle(st.src||st.q); }})); box.appendChild(ag5E('button',{text:ag5B('No','لا'),onclick:()=>{ box.innerHTML=''; }})); }
  throw e; }
 if(R.cancel)throw ag5Err('stopped','اتوقف'); const cv=GM.cv; await ag5Point(cv,R);
 if(r.plot&&typeof gmxGoPlot==='function'){ gmxGoPlot(r.plot,r.z); await ag5Until(()=>Math.abs(GM.lat-r.lat)<1e-4&&Math.abs(GM.lon-r.lon)<1e-4,4000,'the map did not move','الخريطة ماتحركتش',R); }
 else { gmGo(r.lat,r.lon,r.z); GM.msg=r.name; }
 const f={t:'pt',g:[r.lat,r.lon],n:String(r.name).split(',')[0].slice(0,60)||st.q,c:'#4fc3f7',ag5:1}; ag5GisLayer().feat.push(f); try{ gmDraw(); }catch(e){}
 await ag5Until(()=>Math.abs(GM.lat-r.lat)<1e-4&&Math.abs(GM.lon-r.lon)<1e-4,3000,'the map did not move','الخريطة ماتحركتش',R);
 AG5.ctx.place=r; AG5.ctx.obj={kind:'gis',f}; AG5.ctx.tab='gis'; ag5ShowAttr(r);
 const note=r.dropped&&r.dropped.length?ag5B(' (not found: '+r.dropped.join(', ')+'; showing the nearest bigger area)',' (مالقيتش: '+r.dropped.join('، ')+'؛ بعرض أقرب منطقة أكبر)'):'';
 return r.name.slice(0,90)+note; };
