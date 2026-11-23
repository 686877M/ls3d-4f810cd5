const pw=require('playwright-core');const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const b=await pw.chromium.launch({executablePath:CH});const c=await b.newContext();const p=await c.newPage();
 await p.goto('http://127.0.0.1:8932/index.html');await p.waitForTimeout(5000);
 const sw=await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!(r&&(r.active||r.installing||r.waiting));});
 await p.reload();await p.waitForTimeout(4000);
 const ctl=await p.evaluate(()=>!!navigator.serviceWorker.controller);
 await c.setOffline(true);let off=false;try{await p.reload({timeout:60000});await p.waitForTimeout(3000);off=await p.evaluate(()=>!!document.getElementById('xLogin'));}catch(e){off='ERR '+e.message.slice(0,80);}
 console.log(JSON.stringify({sw,ctl,offlineLogin:off}));console.log('pwa: '+((sw&&ctl&&off===true)?'3 passed, 0 failed':'FAILED'));await b.close();})();
