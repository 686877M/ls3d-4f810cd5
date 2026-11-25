// Run ribbon commands in ONE page, in order, and print the first error stack of each.
// node pw/seq_run.js <url> <ids...>   (an id starting with = is a JS expression: its value is printed)
const pw=require('playwright-core');const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const b=await pw.chromium.launch({executablePath:CH,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:1400,height:850}});
 await c.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){} window.prompt=(m,d)=>d==null?'1':d; window.alert=()=>{}; window.confirm=()=>true;});
 const p=await c.newPage();await p.goto(process.argv[2]);await p.waitForTimeout(10000);
 for(const id of process.argv.slice(3)){
  const code=id.charAt(0)==='='?`(()=>{ try{ return 'val '+JSON.stringify(eval(${JSON.stringify(id.slice(1))})); }catch(e){ return 'ERR '+e.message+' @ '+String(e.stack).split('\\n').slice(1,4).join(' | '); } })()`
   :`(()=>{ const s0=(document.getElementById('xSt')||{}).textContent; try{ XC[${JSON.stringify(id)}].run(); document.querySelectorAll('#tpDlg,#pjDlg,#pjStart').forEach(e=>e.remove()); const s=(document.getElementById('xSt')||{}).textContent; return 'ok '+(s!==s0?s.slice(-120):''); }catch(e){ return 'ERR '+e.message+' @ '+String(e.stack).split('\\n').slice(1,4).join(' | '); } })()`;
  const r=await Promise.race([p.evaluate(code=>window.__lsv.ev(code),code),new Promise(r=>setTimeout(()=>r('TIMEOUT'),15000))]);
  console.log(id.slice(0,60),'=>',String(r).slice(0,400)); }
 await b.close();})();
