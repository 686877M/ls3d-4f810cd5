// start-up profile for xsplit: node hot.js <file://url> [out.json]  -> names of lazy functions called before the page is idle
const pw=require('playwright-core');const fs=require('fs');const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const b=await pw.chromium.launch({executablePath:CH});const hot={};let ran=[];
 for(const v of [['xto-auth','xto-intro-seen','xto-hub'],['xto-auth','xto-intro-seen'],[]]){const c=await b.newContext({viewport:{width:1400,height:850}});
  await c.addInitScript(v=>{try{v.forEach(k=>sessionStorage.setItem(k,'1'));localStorage.setItem('xto-test','1');}catch(e){} window.__xgHot={n:{}};},v);
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(process.argv[2]);await p.waitForTimeout(7000);
  const r=await p.evaluate(()=>({n:Object.keys(window.__xgHot.n),ran:window.__xgRan||[]}));r.n.forEach(k=>hot[k]=1);ran=ran.concat(r.ran.map(x=>x.join(' ')));if(errs.length)console.log('ERR',errs.slice(0,3));await c.close();}
 const L=Object.keys(hot).sort();console.log('hot',L.length,L.join(' '));console.log('groups loaded at start:',ran.join(' | ')||'none');
 if(process.argv[3]){let old=[];try{old=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));}catch(e){}fs.writeFileSync(process.argv[3],JSON.stringify([...new Set(old.concat(L))].sort()));}
 await b.close();})();
