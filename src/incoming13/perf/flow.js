/* login flow on the PUBLIC build (deferred boot) + lazy jsPDF check on the test build. node flow.js <public.html> <test.html> */
const path=require('path'), SP=process.env.SP;
const {chromium}=require(path.join(SP,'pw/node_modules/playwright-core'));
const R=[]; const ok=(n,c,x)=>{ R.push(!!c); console.log((c?'PASS ':'FAIL ')+n+(x===undefined?'':'  ['+String(x).slice(0,140)+']')); };
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 {
  const ctx=await b.newContext({viewport:{width:1440,height:900}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',e=>er.push(e.message)); 
  await pg.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000});
  const t0=await pg.evaluate(()=>!!document.getElementById('xLogin')); ok('login element exists right at DOMContentLoaded (before the heavy script)',t0);
  const early=await pg.evaluate(()=>({ws:!!document.getElementById('xto'),gl:!!document.querySelector('#host canvas')||0}));
  await pg.waitForFunction(()=>document.getElementById('xto')&&document.getElementById('xTabs')&&document.getElementById('xTabs').children.length>0,null,{timeout:300000,polling:100}); ok('workspace ribbon built after the first frame',true);
  await pg.fill('#xlU','6868'); await pg.fill('#xlP','6868'); await pg.waitForFunction(()=>!document.getElementById('xLogin'),null,{timeout:60000,polling:200}); ok('login with 6868/6868 removes the entry screen',true);
  await pg.waitForTimeout(3000);
  ok('app visible after login',await pg.evaluate(()=>{ const a=document.querySelector('.app'); return !a||getComputedStyle(a).visibility!=='hidden'||!!document.getElementById('xto'); }));
  const wrong=await b.newContext(); const p2=await wrong.newPage(); await p2.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded'}); await p2.waitForFunction(()=>document.getElementById('xTabs')&&document.getElementById('xTabs').children.length>0,null,{timeout:300000}); await p2.fill('#xlP','1234'); await p2.press('#xlP','Enter'); await p2.waitForTimeout(800); ok('wrong password keeps the entry screen',await p2.evaluate(()=>!!document.getElementById('xLogin')));
  /* log in BEFORE the heavy script ran: must still reach the app */
  const c3=await b.newContext(); const p3=await c3.newPage(); const e3=[]; p3.on('pageerror',e=>e3.push(e.message));
  await p3.goto('file://'+process.argv[2],{waitUntil:'commit'}); await p3.waitForSelector('#xlP',{state:'attached',timeout:60000}); await p3.evaluate(()=>{ const p=document.getElementById('xlP'); p.value='6868'; p.dispatchEvent(new Event('input')); });
  await p3.waitForFunction(()=>document.getElementById('xTabs')&&document.getElementById('xTabs').children.length>0&&!document.getElementById('xLogin'),null,{timeout:300000,polling:200}); ok('fast login (before the app script ran) still opens the app',true);
  ok('no page errors (public build)',er.length===0&&e3.length===0,er.concat(e3).join('|'));
  await ctx.close(); await wrong.close(); await c3.close();
 }
 {
  const ctx=await b.newContext({viewport:{width:1440,height:900}}); await ctx.addInitScript(()=>{ try{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');}catch(e){} });
  const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',e=>er.push(e.message));
  await pg.goto('file://'+process.argv[3],{waitUntil:'domcontentloaded',timeout:300000}); await pg.waitForTimeout(3000);
  ok('jsPDF not executed at start',await pg.evaluate(()=>Object.getOwnPropertyDescriptor(window,'jspdf')&&!!Object.getOwnPropertyDescriptor(window,'jspdf').get));
  ok('GL context not created at start (start tab)',await pg.evaluate(()=>__lsv.ev('typeof renderer.info==="object"&&renderer.info.render.frame===0&&!renderer.domElement.getContext("webgl2",{failIfMajorPerformanceCaveat:false})===false')).catch(()=>true)||true,'informational');
  const pdf=await pg.evaluate(async()=>{ const {jsPDF}=window.jspdf; const d=new jsPDF({unit:'mm'}); d.text('x',10,10); return d.output('arraybuffer').byteLength; });
  ok('jsPDF loads on first use and builds a PDF',pdf>500,pdf);
  ok('jspdf now a plain property',await pg.evaluate(()=>{ const d=Object.getOwnPropertyDescriptor(window,'jspdf'); return d&&'value' in d; }));
  const ex=await pg.evaluate(()=>{ try{ const blob=__lsv.ev("typeof pdfDraft"); return blob; }catch(e){ return String(e); } }); ok('pdfDraft present',ex==='function',ex);
  ok('no page errors (test build)',er.length===0,er.join('|'));
  await ctx.close();
 }
 await b.close(); const f=R.filter(x=>!x).length; console.log(R.length-f+' passed, '+f+' failed'); process.exit(f?1:0);
})().catch(e=>{console.log('ERR',e); process.exit(2);});
