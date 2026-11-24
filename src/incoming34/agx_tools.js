/* ====== agx_tools.js: tool index + live context for the agent (incoming34) ======
   1. Tool index: one searchable index of every runnable command (XC + XDESC + RIBM), built once and rebuilt only when
      the number of commands changes. Agent tools find_tools(query, program?) and run_tool(id). The model never gets
      the catalogue, only the top matches. Ranking: token overlap weighted by rarity (label 3, id 1.5, help/panel 1),
      prefix matches count 0.6, commands of the active program x1.3. Arabic is normalised (alef/ya/ta-marbuta/hamza
      forms, diacritics, tatweel, the article) so spoken Arabic matches the labels.
   2. Live context: get_context() and one short line added to the system prompt each turn (agxLine, called from aiSys
      in c_ai.js and xaModel in c_agent3.js). Privacy: every model request already passes the fetch gate of privacy.js
      (block / redact / preview). On top of that this file never puts the project name in the line when Sensitive or
      Minimal mode is on, and never puts free text of an element (names, labels, notes) in it at all.
   Safety: run_tool (and the older run_command, which now goes through the same guard) will not run a command that
   deletes, wipes, exports, uploads, shares or touches privacy/keys until the user presses Yes in the agent pane.
   Both paths: the tools are appended to XAM.tools, so native tool calling (aiTools, xaModel) and the text protocol
   (faProto / faParse) see them. The text protocol is one shot, so faPrompt (freeai.js) also adds the top matches for the request (agxHints). */
const AGX={idx:null,n:-1,st:'',wait:45000,top:6};
const agxNorm=s=>String(s==null?'':s).toLowerCase().replace(/[ً-ٰٟـ]/g,'').replace(/[آأإٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-0x660)).replace(/[^a-z0-9ء-ي]+/g,' ').trim();
/* tokens: Arabic loses the article (ال، وال، بال، لل), English loses a plural s */
function agxTok(s){ const out=[]; agxNorm(s).split(' ').forEach(w=>{ if(!w)return; if(/[ء-ي]/.test(w)){ const m=/^(?:و|ب)?ال(.{3,})$/.exec(w)||/^لل(.{3,})$/.exec(w); if(m)w=m[1]; } else if(w.length>3&&/[^s]s$/.test(w))w=w.slice(0,-1); if(w.length>1||/\d/.test(w))out.push(w); }); return out; }
function agxProgName(type){ try{ return (WTYPES[type]&&WTYPES[type].n[0])||type||''; }catch(e){ return type||''; } }
function agxHelp(id){ let d=XDESC[id]; if(!d&&RIBM[id]){ try{ const c=crDesc(Object.assign({id},RIBM[id])); if(c)d=[c.en||'',c.ar||'']; }catch(e){} } return d||['','']; }
function agxBuild(){ const docs=[], inv=new Map(), add=(tok,i,w)=>{ let m=inv.get(tok); if(!m)inv.set(tok,m=new Map()); if((m.get(i)||0)<w)m.set(i,w); };
 Object.keys(XC).forEach(id=>{ const c=XC[id]; if(!c||c.stub||typeof c.run!=='function')return; const m=RIBM[id]||{}, h=agxHelp(id), i=docs.length;
  docs.push({id,en:c.t[0]||'',ar:c.t[1]||'',h,prog:m.type||'',tab:m.tab||'',panel:m.panel||''});
  agxTok(c.t[0]+' '+c.t[1]).forEach(t=>add(t,i,3)); agxTok(id.replace(/_/g,' ')).forEach(t=>add(t,i,1.5));
  agxTok(h[0]+' '+h[1]+' '+(m.tab||'')+' '+(m.tabAr||'')+' '+(m.panel||'')+' '+(m.panelAr||'')).forEach(t=>add(t,i,1)); });
 const N=docs.length||1, idf=new Map(); inv.forEach((m,t)=>idf.set(t,Math.log(1+N/m.size)));
 AGX.idx={docs,inv,idf,vocab:[...inv.keys()]}; AGX.n=Object.keys(XC).length; return AGX.idx; }
function agxIndex(){ return (AGX.idx&&AGX.n===Object.keys(XC).length)?AGX.idx:agxBuild(); }
/* program filter: a tab type (draft) or its letters (C.X, cx) */
function agxProg(p){ const s=agxNorm(p).replace(/ /g,''); if(!s)return ''; if(WTYPES[s])return s; return Object.keys(WTYPES).find(k=>{ const n=agxNorm(WTYPES[k].n[0]); return n.split(' ').slice(0,2).join('')===s||n.replace(/ /g,'')===s||n.split(' ').slice(2).join('')===s; })||'?'; }
function agxFind(q,prog,lim){ const X=agxIndex(), qt=[...new Set(agxTok(q))], sc=new Map(), act=ribType(), pf=agxProg(prog);
 qt.forEach(t=>{ const best=new Map(), hit=(tok,f)=>{ const w=f*X.idf.get(tok); X.inv.get(tok).forEach((lw,i)=>{ const v=lw*w; if((best.get(i)||0)<v)best.set(i,v); }); };
  if(X.inv.has(t))hit(t,1); if(t.length>=3)X.vocab.forEach(v=>{ if(v!==t&&v.length>=3&&(v.startsWith(t)||t.startsWith(v)))hit(v,.6); });
  best.forEach((v,i)=>sc.set(i,(sc.get(i)||0)+v)); });
 const L=lang==='ar'?1:0, seen=new Set(), out=[];
 [...sc.entries()].map(([i,v])=>{ const d=X.docs[i]; return [d,v*(d.prog&&d.prog===act?1.3:1)]; }).filter(x=>!pf||x[0].prog===pf)
  .sort((a,b)=>b[1]-a[1]||a[0].en.length-b[0].en.length).some(([d,v])=>{ const k=d.prog+'|'+agxNorm(d.en); if(seen.has(k))return false; seen.add(k);
   out.push({id:d.id,label:d.en,ar:d.ar,help:String(d.h[L]||d.h[0]||(d.tab?d.tab+' > '+d.panel:'')).slice(0,110),program:d.prog?agxProgName(d.prog):'any tab',score:Math.round(v*10)/10}); return out.length>=(lim||AGX.top); });
 return out; }
const agxSleep=ms=>new Promise(r=>setTimeout(r,ms));
/* ---------- safety: what needs the user to press Yes ---------- */
const AGX_ASK=new Set(['new','new_from_template','wipe_project','export_package','p_share','p_social','o_media','privacy_panel','ag5_forget']);
function agxRisk(id,deep){ const c=XC[id]; if(!c)return ''; const en=String(c.t[0]||''), ar=String(c.t[1]||''), s=en+' '+id.replace(/_/g,' ');
 if(/privacy|sensitive|api key|\bkeys?\b/i.test(s)||/خصوصي/.test(ar)||/^priv/.test(id))return 'changes privacy or keys';
 if(/\b(wipe|close out)\b/i.test(s)||id==='new'||id==='new_from_template')return 'replaces or wipes the project';
 if((/\b(delete|erase|remove|clear|purge|forget)\b/i.test(s)&&!/clear selection/i.test(en))||/^rm_|(^|_)(del|erase|clear)$/.test(id)||/حذف/.test(ar))return 'deletes data';
 if(/\b(export|upload|share|publish|e-?mail|whatsapp|telegram|social)\b/i.test(s)||(/\bsend\b/i.test(en)&&!/^xf_/.test(id))||/_(csv|kml|geojson|xlsx|pdf|dxf|ifc)$/.test(id)||/تصدير|مشارك/.test(ar))return 'exports or shares data';
 if(AGX_ASK.has(id))return 'needs your confirmation';
 if(!deep&&RIBM[id]&&RIBM[id].impl&&XC[RIBM[id].impl])return agxRisk(RIBM[id].impl,1);
 return ''; }
/* the question needs the agent pane on screen: open it, give it a moment to mount; no pane or another question pending = no */
async function agxConfirm(id,risk){ const c=XC[id]; try{ if(!(XAS.box&&XAS.box.isConnected&&XAS.box.querySelector('.aglog'))){ wxOpen('pane:agents',[.62,.08,.36,.8]); await agxSleep(400); } }catch(e){ return false; }
 if(XAS.q||!XAS.box||!XAS.box.querySelector('.aglog'))return false;
 return new Promise(res=>{
 let done=0; const fn=v=>{ if(done)return; done=1; clearTimeout(tm); if(XAS.q&&XAS.q.fn===fn){ XAS.q=null; try{ xaRender(); }catch(e){} } res(v==='yes'); }, tm=setTimeout(()=>fn('no'),AGX.wait);
 xaAsk(b2('The model wants to run "'+c.t[0]+'" ('+risk+'). Allow it?','الموديل عايز يشغّل "'+c.t[1]+'" ('+risk+'). أسمح؟'),[[b2('Yes, run it','أيوه نفّذ'),'yes'],[b2('No','لا'),'no']],fn); }); }
/* ---------- run a command and say what happened ---------- */
const agxOpen=()=>{ try{ return Object.keys(WX.lay).filter(k=>WX.lay[k]&&WX.lay[k].open&&!WX.lay[k].min); }catch(e){ return []; } };
const agxWinName=k=>{ try{ const d=WX.defs[k]; return (d&&d.t&&d.t[0])||k; }catch(e){ return k; } };
{ const _s=xSt; xSt=function(m){ if(m)AGX.st=String(m).replace(/<[^>]*>/g,'').slice(0,160); return _s.apply(this,arguments); }; }
async function agxRun(id){ id=String(id==null?'':id); const c=XC[id]; if(!c)return {ok:false,error:'unknown id "'+id.slice(0,40)+'": call find_tools first'}; if(c.stub||typeof c.run!=='function')return {ok:false,error:'"'+c.t[0]+'" is not built yet'};
 const risk=agxRisk(id); if(risk){ const yes=await agxConfirm(id,risk); xaLog('tool','run_tool '+id+' ('+risk+'): '+(yes?'user allowed':'refused'),'agx');
  if(!yes)return {ok:false,refused:true,error:'Refused: "'+c.t[0]+'" '+risk+', so it needs the user to press Yes in the T.O X agent pane, and they did not. Do not retry: tell the user they can run it themselves.'}; }
 const m=RIBM[id], tab0=ribType(), win0=agxOpen(), kids0=document.body.children.length; let err='', moved='';
 try{ if(m&&m.type&&WTYPES[m.type]&&m.type!==tab0){ const t=WTAB.tabs.find(x=>x.type===m.type); if(t)wtSwitch(t.id); else wtNew(m.type); await agxSleep(500); moved=m.type; } }catch(e){ return {ok:false,error:'could not open the '+agxProgName(m.type)+' tab: '+e.message}; }
 AGX.st=''; const onErr=e=>{ err=err||String((e&&(e.message||(e.reason&&e.reason.message)||e.reason))||'error'); }; window.addEventListener('error',onErr); window.addEventListener('unhandledrejection',onErr);
 try{ const r=c.run(); if(r&&typeof r.then==='function')await r; }catch(e){ err=e.message||String(e); }
 await agxSleep(250); window.removeEventListener('error',onErr); window.removeEventListener('unhandledrejection',onErr);
 const win1=agxOpen(), out={ok:!err,ran:c.t[0],tab:agxProgName(ribType())}; if(moved)out.switched_tab=agxProgName(moved);
 const op=win1.filter(k=>win0.indexOf(k)<0).map(agxWinName), cl=win0.filter(k=>win1.indexOf(k)<0).map(agxWinName); if(op.length)out.opened=op; if(cl.length)out.closed=cl;
 if(document.body.children.length>kids0){ try{ out.dialog=String(document.body.lastElementChild.innerText||'').replace(/\s+/g,' ').slice(0,80)||true; }catch(e){ out.dialog=true; } }
 if(typeof c.on==='function'){ try{ out.active=!!c.on(); }catch(e){} } if(AGX.st)out.status=AGX.st; if(err)out.error=String(err).slice(0,200); return out; }
/* ---------- live context ---------- */
const AGX_DIM=['w','h','l','d','t','r','len','L','W','H','D','thk','dia','width','height','length','depth','elev','level','x','y','z','x1','y1','x2','y2'];
const agxNum=v=>Math.round(v*1000)/1000;
/* numbers only: free text of an element (name, label, note) is never copied */
function agxDims(e){ const o={}; let n=0; if(!e||typeof e!=='object')return o; for(const k of AGX_DIM){ if(n>=6)break; if(typeof e[k]==='number'&&isFinite(e[k])){ o[k]=agxNum(e[k]); n++; } } if(!n&&Array.isArray(e.p)){ const f=e.p.flat?e.p.flat(2):e.p; f.slice(0,6).forEach((v,i)=>{ if(typeof v==='number')o['p'+i]=agxNum(v); }); } return o; }
const agxKind=e=>String((e&&(e.k||e.t||e.type||e.kind))||'element').replace(/[^\w.-]/g,'').slice(0,24);
function agxSel(){
 try{ if(typeof CS!=='undefined'&&CS.open&&CS.sel&&CS.sel.size){ const a=[...CS.sel], e=cadD().ents[a[0]]; return {where:'C.X drawing',count:a.length,id:a[0],type:agxKind(e),dims:agxDims(e)}; } }catch(x){}
 try{ if(typeof HXT!=='undefined'&&HXT.sel){ const a=HXT.sel instanceof Set?[...HXT.sel]:Array.isArray(HXT.sel)?HXT.sel:[HXT.sel]; if(a.length&&a[0]!=null){ const e=typeof a[0]==='object'?a[0]:null; return {where:'H.X',count:a.length,id:String(e?(e.id||''):a[0]).slice(0,24),type:agxKind(e),dims:agxDims(e)}; } } }catch(x){}
 try{ if(RV.sel){ const e=RV.els.find(x=>x.id===RV.sel); if(e)return {where:'R.X model',count:1,id:String(e.id).slice(0,24),type:agxKind(e),dims:agxDims(e)}; } }catch(x){}
 try{ if(typeof selId!=='undefined'&&selId){ const o={where:'3D view',count:(selSet&&selSet.length)||1,id:String(selId).slice(0,24),type:'part',dims:{}}; try{ const B=new T.Box3().setFromObject(parts[selId]), z=B.getSize(new T.Vector3()); if(isFinite(z.x))o.dims={x:agxNum(z.x),y:agxNum(z.y),z:agxNum(z.z)}; }catch(x){} return o; } }catch(x){}
 return null; }
const agxHide=()=>{ try{ return !!(window.PRIV&&PRIV.cfg&&(PRIV.cfg.sensitive||PRIV.cfg.minimal)); }catch(e){ return true; } };
function agxCtx(){ const ty=ribType(), o={tab:ty,program:agxProgName(ty),tabs:[],windows:[],selection:agxSel(),language:lang==='ar'?'ar':'en',units:'m'};
 try{ o.tabs=WTAB.tabs.map(t=>t.type); }catch(e){} try{ o.windows=agxOpen().map(agxWinName).slice(0,8); }catch(e){}
 try{ if(typeof RV!=='undefined'&&RV.units)o.units=String(RV.units).slice(0,8); else if(typeof DR!=='undefined'&&DR.units)o.units=String(DR.units).slice(0,8); }catch(e){}
 if(agxHide())o.project='(withheld by privacy mode)'; else{ try{ o.project=String((DATA.proj&&DATA.proj.name)||DR.title||'').slice(0,60); }catch(e){ o.project=''; } }
 return o; }
/* one line for the system prompt, under 600 characters */
function agxLine(){ try{ const c=agxCtx(), s=c.selection; let t='\n[T.O X now] tab: '+c.program+' ('+c.tab+'); open tabs: '+c.tabs.join(',')+'; windows: '+(c.windows.join(', ')||'none')+'; selection: '+(s?s.count+' in '+s.where+', id '+s.id+', type '+s.type+(Object.keys(s.dims).length?', '+Object.keys(s.dims).map(k=>k+'='+s.dims[k]).join(' '):''):'none')+'; project: '+c.project+'; language: '+c.language+'; units: '+c.units+'.';
  if(t.length>470)t=t.slice(0,467)+'...'; return t+' Any command in any tab: find_tools(query) then run_tool(id); get_context() for this state.'; }catch(e){ return ''; } }
/* ---------- register: native tool calling and the text protocol both read XAM.tools ---------- */
XAM.tools.push({name:'find_tools',description:'Search every T.O X command in every tab by words (English or Arabic). Returns the best matches: id, label, one-line help, program. Use before run_tool.',input_schema:{type:'object',properties:{query:{type:'string'},program:{type:'string',description:'optional tab filter: model draft survey sched coord plant hx hv gis office takeoff capture, or R.X C.X ...'}},required:['query']}},
 {name:'run_tool',description:'Run one command by the id from find_tools. Opens its tab first if needed. Reports what happened (tab, opened windows, status, error). Deleting, wiping, exporting, sharing, privacy and keys need the user to confirm on screen.',input_schema:{type:'object',properties:{id:{type:'string'}},required:['id']}},
 {name:'get_context',description:'What the user sees now: active tab, open windows, current selection (id, type, dimensions), project, language, units.',input_schema:{type:'object',properties:{}}});
{ const _t=xaTool; xaTool=async function(n,i){ i=i||{}; try{
   if(n==='find_tools'){ const r=agxFind(String(i.query||i.q||''),i.program); return r.length?r:'no command matches: try other words, or fewer'; }
   if(n==='run_tool'||n==='run_command')return await agxRun(i.id);
   if(n==='get_context')return agxCtx();
  }catch(e){ return 'error: '+e.message; } return _t.apply(this,arguments); }; }
/* text protocol is one shot (no second round to read find_tools), so the prompt carries the best matches for the request */
function agxHints(text){ try{ const r=agxFind(String(text||''),'',8); return r.length?'\n\nCommands that may match this request (run one with {"tool":"run_tool","args":{"id":"..."}}):\n'+r.map(x=>'- '+x.id+': '+x.label+' / '+x.ar+' ['+x.program+']').join('\n'):''; }catch(e){ return ''; } }
try{ Object.assign(TOXAPI,{findTools:(q,p)=>agxFind(String(q),p),context:()=>agxCtx()}); }catch(e){}
