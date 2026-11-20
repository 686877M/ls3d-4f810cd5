const {chromium}=require('playwright-core'); const http=require('http');
let calls=[]; const srv=http.createServer((q,s)=>{ s.setHeader('access-control-allow-origin','*'); s.setHeader('access-control-allow-headers','*'); if(q.method==='OPTIONS'){ s.writeHead(204); return s.end(); } let b=[]; q.on('data',d=>b.push(d)); q.on('end',()=>{ const body=Buffer.concat(b);
 if(q.url.endsWith('/chat/completions')){ const j=JSON.parse(body.toString()); calls.push({sys:j.messages[0].content.slice(0,30),n:j.messages.length,tools:(j.tools||[]).length,auth:q.headers.authorization||''}); const hasTool=j.messages.some(m=>m.role==='tool'); s.setHeader('content-type','application/json'); if(!hasTool) s.end(JSON.stringify({choices:[{message:{role:'assistant',content:null,tool_calls:[{id:'c1',type:'function',function:{name:'find_commands',arguments:JSON.stringify({q:'wall'})}}]}}]})); else s.end(JSON.stringify({choices:[{message:{role:'assistant',content:'لقيت أمر الجدار يا باشا'}}]})); }
 else if(q.url.endsWith('/audio/transcriptions')){ calls.push({stt:true,ct:q.headers['content-type'].slice(0,20),hasAr:body.toString('latin1').includes('name="language"')&&body.toString('latin1').includes('ar')}); s.setHeader('content-type','application/json'); s.end(JSON.stringify({text:'جارفيس افتح الخريطة'})); } else { s.writeHead(404); s.end(); } }); }).listen(8799);
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1400,height:800}}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-ai'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
await E("XC.ai_open.run()"); await pg.waitForTimeout(500); console.log('pane selects:',await pg.evaluate(()=>document.querySelectorAll('.wx select, select').length));
await E("TOXAPI.aiConfig({provider:'custom',base:'http://localhost:8799/v1',model:'m',key:'k1',stt:'custom',sttBase:'http://localhost:8799/v1',sttModel:'w'})");
console.log('rules still win for known:',await E("xaHandle('افتح الخريطة').then(()=>XAS.chat.slice(-1)[0].t)"));
await E("xaHandle('عايز أعرف أبدأ منين النهاردة؟')"); await pg.waitForTimeout(1500); console.log('model reply:',await E("XAS.chat.slice(-1)[0].t")); console.log('calls',JSON.stringify(calls));
const stt=await E("aiTranscribe(new Blob(['abc'],{type:'audio/webm'}))"); console.log('stt text:',stt,JSON.stringify(calls.slice(-1)));
await E("AI.wake=true; XAS.chat.length=0; aiHeard('افتح الرسم')"); await pg.waitForTimeout(300); console.log('no wake word -> ignored:',await E("XAS.chat.length"));
await E("aiHeard('جارفيس افتح الخريطة')"); await pg.waitForTimeout(1500); console.log('wake word ->',await E("WTAB.tabs.map(t=>t.type).join(',')"));
await E("TOXAPI.aiConfig({base:'http://localhost:1/v1'})"); await E("xaHandle('اسأل النموذج عن حاجة تانية')"); await pg.waitForTimeout(800); console.log('unreachable msg:',(await E("XAS.chat.slice(-1)[0].t")).slice(0,60));
console.log('errors',er.slice(0,3)); await b.close(); srv.close(); })();
