// xsplit_test.js: lazy program groups. node xsplit_test.js file://.../index.test.html
// Checks: no group is evaluated at start; the text blocks are in the page; a command stays registered (stub) before load;
// opening a program evaluates ITS group only, once, and removes the text block; the other groups stay unloaded.
const pw=require('playwright-core');const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const b=await pw.chromium.launch({executablePath:CH});const c=await b.newContext({viewport:{width:1400,height:850}});
 await c.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.goto(process.argv[2]);await p.waitForTimeout(5000);
 let ok=0,bad=0;const t=(c,n)=>{c?ok++:bad++;console.log((c?'  ok   ':'  FAIL ')+n);};
 const st=()=>p.evaluate(()=>({ran:(window.__xgRan||[]).map(x=>x[0]),blocks:[...document.querySelectorAll('script[data-xg]')].map(n=>n.getAttribute('data-xg'))}));
 const ev=s=>p.evaluate(s=>window.__lsv.ev(s),s);
 const s0=await st();console.log(JSON.stringify(s0));
 t(s0.blocks.length>=3,'page carries lazy text blocks: '+s0.blocks.join(','));
 t(s0.ran.length===0,'no group is evaluated at start');
 t(await ev(`typeof XG==='function'&&Object.keys(XG.m).length===0`),'loader present, nothing loaded');
 const G=[['se','se_open','seOpen'],['qa','qa_open',null],['rc','rc_open','rcOpen']].filter(g=>s0.blocks.includes(g[0]));
 for(let [g,cmd,fn] of G){
  if(!await ev(`!!XC.${cmd}`))cmd=await ev(`Object.keys(XC).find(k=>k.indexOf('${g}_')===0)||''`);
  t(await ev(`!!(XC.${cmd}&&typeof XC.${cmd}.run==='function'&&XDESC.${cmd})`),g+': command '+cmd+' and its help are registered before load');
  if(fn)t(await ev(`typeof ${fn}==='function'&&/XG\\(/.test(String(${fn}))`),g+': '+fn+' is a stub before load');
  const before=await st();
  await ev(`XC.${cmd}.run()`);await p.waitForTimeout(700);
  const after=await st();const added=after.ran.filter(x=>!before.ran.includes(x));
  t(after.ran.includes(g),g+': evaluated after '+cmd+' ran');
  t(!after.blocks.includes(g),g+': text block removed after load');
  t(after.ran.filter(x=>x===g).length===1,g+': evaluated once');
  console.log('   loaded by '+cmd+': '+added.join(','));
 }
 const s1=await st();const rest=s0.blocks.filter(x=>!s1.ran.includes(x));
 t(rest.length>0&&rest.every(x=>s1.blocks.includes(x)),'groups not used stay unloaded: '+rest.join(','));
 await ev(`XC.se_open.run()`);const s2=await st();t(s2.ran.length===s1.ran.length,'second run does not evaluate again');
 t(errs.length===0,'no page errors '+errs.slice(0,2).join(' | '));
 console.log('\nxsplit: '+ok+' passed, '+bad+' failed');await b.close();process.exit(bad?1:0);})();
