const {chromium}=require('playwright-core'); const {spawn,execSync}=require('child_process'); const fs=require('fs');
(async()=>{ const inbox='/tmp/tox_test_inbox.jsonl'; try{ fs.unlinkSync(inbox); }catch(e){}
const srv=spawn('python3',[process.argv[3]+'/site/tools/tox_bridge.py','--http-only'],{env:Object.assign({},process.env,{TOX_TOKEN:'tt9',TOX_PORT:'8766',TOX_INBOX:inbox}),stdio:'ignore'}); await new Promise(r=>setTimeout(r,800));
const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1400,height:800}}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-ai'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
const curl=(path,body,tok)=>execSync("curl -s -m 30 -H 'x-tox-token: "+(tok||'tt9')+"' "+(body?"-d '"+JSON.stringify(body)+"' ":'')+"http://127.0.0.1:8766"+path).toString();
await E("TOXAPI.aiConfig({provider:'claudecode'})");
console.log('no bridge token ->',await E("xaHandle('سؤال لكلود').then(()=>XAS.chat.slice(-1)[0].t)"));
await E("TOXAPI.bridgeConnect('http://127.0.0.1:8766','tt9')"); await pg.waitForTimeout(1000);
await E("xaHandle('إيه أحسن طريقة أبدأ بيها المشروع؟')"); await pg.waitForTimeout(800);
console.log('page says:',await E("XAS.chat.slice(-1)[0].t"));
console.log('inbox file:',fs.readFileSync(inbox,'utf8').trim());
console.log('tab_messages tool:',curl('/call',{tool:'tab_messages',args:{}}));
console.log('again (should be empty):',curl('/call',{tool:'tab_messages',args:{}}));
console.log('reply:',curl('/reply',{text:'ابدأ بتحديد الموقع وبعدين الدور الأرضي.'}));
await pg.waitForTimeout(1500); console.log('page shows:',await E("XAS.chat.slice(-1)[0].t"));
console.log('bad token reply:',curl('/reply',{text:'x'},'bad')); console.log('errors',er.slice(0,3)); await b.close(); srv.kill(); })();
