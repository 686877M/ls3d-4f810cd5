/* ====== undo / redo (120 steps), save, upload keeps the previous project ====== */
const HI={st:[],i:-1,max:120,lock:false}, HB=[];
function hiSync(){HB.forEach(f=>f());}
function hiSnap(){ if(HI.lock)return; let j; try{j=projectJson();}catch(e){return;} if(HI.st[HI.i]===j)return; HI.st=HI.st.slice(0,HI.i+1); HI.st.push(j); if(HI.st.length>HI.max)HI.st.shift(); HI.i=HI.st.length-1; hiSync();}
function hiApply(txt){HI.lock=true; try{loadProject(txt); if(typeof restoreSched==='function')restoreSched(); rebuild(); renderFams(); refreshSec(); renderBom(); if(typeof computeSched==='function')computeSched(); if(typeof renderSched==='function')renderSched(); if(typeof cadRender==='function')cadRender(); if(typeof wsRender==='function')wsRender(); if(typeof tlRender==='function')tlRender();}finally{HI.lock=false;}}
function hiGo(d){const k=HI.i+d; if(k<0||k>=HI.st.length)return; hiApply(HI.st[k]); HI.i=k; hiSync();}
const _persistH=persist; persist=function(){_persistH(); hiSnap();};
setTimeout(hiSnap,0);
(function(){ const tbH=$('tbtn'); const bU=el('button',{text:'↶ '+b2('Undo','تراجع'),onclick:()=>hiGo(-1)}), bR=el('button',{text:'↷ '+b2('Redo','إعادة'),onclick:()=>hiGo(1)}), bS=el('button',{text:'💾 '+b2('Save','حفظ'),onclick:()=>{try{out('LiftStation_project.json',projectJson());}catch(e){}}});
 const up=el('input',{type:'file',accept:'.json,application/json',style:'display:none',onchange:e=>{const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{try{ hiSnap(); const old=projectJson(); try{localStorage.setItem('lsv3-prev',old);}catch(_){} out('LiftStation_previous_project.json',old); hiApply(String(r.result)); persist(); say('st_ok',f.name);}catch(err){say('st_err',err.message||String(err));}}; r.readAsText(f); e.target.value='';}});
 const bO=el('button',{text:'⬆ '+b2('Open file','فتح ملف'),onclick:()=>up.click()}); const sync=()=>{bU.disabled=HI.i<=0; bR.disabled=HI.i>=HI.st.length-1; bU.title=HI.i+' / '+(HI.st.length-1);}; HB.push(sync); sync();
 if(tbH)tbH.append(bU,bR,bS,bO,up);
 document.addEventListener('keydown',e=>{ if(!(e.ctrlKey||e.metaKey)||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return; const k=e.key.toLowerCase(); if(k==='z'&&!e.shiftKey){e.preventDefault(); hiGo(-1);} else if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault(); hiGo(1);} else if(k==='s'){e.preventDefault(); bS.click();}});
})();
