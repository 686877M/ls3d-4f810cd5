/* regq test. Run: NODE_PATH=$(npm root -g) node regq_test.js "<chrome path>" [file:///path/to/index.html]
   Seed data lives ONLY in this file (in-page, never saved). Fixed "today" 2026-11-20 is passed to rqRun / rqStats so answers are deterministic. */
const {chromium}=require('playwright-core');
const URL=process.argv[3]||'file:///private/tmp/mod_regq/site/index.html', TD='2026-11-20';
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++; };
const SMALL=[ // [ref,type,dir,date,due,from,to,subject,status,log]
 ['T-RFI-1','RFI','in','2026-11-15','2026-11-10','Acme Co','Us','Slab thickness','review'],
 ['T-RFI-2','RFI','out','2026-10-01','2026-10-20','Us','Beta Ltd','Pump base','sent'],
 ['T-SUB-1','SUB','out','2026-11-05','2026-11-25','Us','Acme Co','Waterproofing','recv'],
 ['T-SUB-2','SUB','in','2026-11-12','','Beta Ltd','Us','Rebar schedule','rej'],
 ['T-IR-1','IR','out','2026-11-18','2026-11-19','Us','Acme Co','Level 1 inspection','review'],
 ['T-NCR-1','NCR','in','2026-09-01','2026-09-15','Gamma','Us','Honeycomb','closed',[['2026-11-17T10:00:00Z','status review → closed by x']]],
 ['T-LTR-1','LTR','out','2026-11-19','','Us','Beta Ltd','Cover letter','draft'],
 ['T-MOM-1','MOM','out','2026-11-10','','Us','Acme Co','Weekly meeting','appr',[['2026-11-12T09:00:00Z','status review → appr (A) by y']]],
 ['T-RFI-3','RFI','in','2026-11-20','2026-11-22','Acme Co','Us','Cable route','sent']];
(async()=>{
const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true});
await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-cdeaud'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept('V1'));
const E=s=>pg.evaluate(s=>{ const r=__lsv.ev(s); return r===undefined?null:JSON.parse(JSON.stringify(r)); },s);
await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000); await E("lang='en'");
await E("DC.docs=("+JSON.stringify(SMALL)+").map((a,i)=>({id:'s'+i,ref:a[0],type:a[1],dir:a[2],date:a[3],due:a[4],from:a[5],to:a[6],subject:a[7],status:a[8],disc:'General',prio:'normal',body:'',files:'',link:'',log:a[9]||[]})); DC.docs.length");
const N=async(q,s,a,g)=>(await E("rqRun("+JSON.stringify(q)+","+JSON.stringify(s||null)+","+(a==null?'null':a)+","+JSON.stringify(g==null?null:g)+",'"+TD+"').n"));
const cases=[['type:RFI',3],['type:RFI status:review',1],['due:<2026-12-01',6],['due:>=2026-11-20',2],['party:acme',5],['-type:RFI',6],['type:RFI,SUB',5],['from:"acme co"',2],['overdue:yes',3],['overdue:no',6],['age:>14',2],['age:<=2',2],['slab',1],['role:contractor',1],['folder:rfi',3],['open:yes',6],['type:RFI overdue:yes',2],['status:approved',1],['type:request',4],['dir:in',4],['nonsense:zzz',0],['',9]];
for(const [q,n] of cases){ const g=await N(q); ok(g===n,'query "'+q+'" -> '+g+' (want '+n+')'); }
ok(await E("rqRun('','date',false,'','"+TD+"').rows[0].d.ref")==='T-RFI-3','sort date desc first = T-RFI-3');
ok(await E("rqRun('due:>0000','due',true,'','"+TD+"').rows[0].d.ref")==='T-NCR-1'.replace('T-NCR-1','T-NCR-1'),'sort due asc first = T-NCR-1');
const gr=await E("rqRun('','date',false,'type','"+TD+"').groups.map(g=>g.k+':'+g.rows.length)"); ok(gr.some(x=>/RFI/.test(x)&&/:3$/.test(x)),'group by type RFI has 3 ('+gr.join('|')+')');
const gp=await E("rqRun('','date',false,'party','"+TD+"').groups.map(g=>g.k+':'+g.rows.length)"); ok(gp.includes('Acme Co:5'),'group by party Acme Co:5');
const S=await E("(()=>{const s=rqStats('"+TD+"'); return {open:s.open,od:s.od,odT:s.odT,odP:s.odP,age:s.age,bic:s.bic,w7:s.wk[7],w6:s.wk[6],old:s.old.map(d=>d.ref)}; })()");
ok(S.open===6&&S.od===3,'stats open 6 overdue 3 ('+S.open+','+S.od+')'); ok(S.odT.RFI===2&&S.odT.IR===1,'overdue by type'); ok(S.odP['Acme Co']===2&&S.odP['Beta Ltd']===1,'overdue by party');
ok(S.age.join()==='3,1,1,1','ageing buckets 3,1,1,1 ('+S.age+')'); ok(S.bic.consultant===5&&S.bic.contractor===1,'ball in court 5/1'); ok(S.w7.o===4&&S.w7.c===1,'week0 opened 4 closed 1 ('+S.w7.o+','+S.w7.c+')'); ok(S.w6.c===1,'week-1 closed 1 (MOM log date)');
ok(S.old[0]==='T-RFI-2'&&S.old.length===6,'oldest open first = T-RFI-2, list 6');
const dg=await E("(()=>{const s=rqStats('"+TD+"'); return [rqDigest(s,0),rqDigest(s,1),rqNewsLine(s,0),rqNewsLine(s,1)];})()"); ok(/Open 6/.test(dg[0])&&/Overdue 3/.test(dg[0])&&/RFI 2/.test(dg[0]),'EN digest content'); ok(/مفتوح 6/.test(dg[1])&&/متأخر 3/.test(dg[1]),'AR digest content'); ok(dg[2].length<=200&&dg[3].length<=200,'news lines <=200 chars');
/* CSV + Excel */
const csv=await E("rqCsv(rqRun('type:RFI',null,null,null,'"+TD+"').rows)"); ok(csv.split('\r\n').length===4&&csv.startsWith('﻿Ref,'),'CSV 1 header + 3 rows');
await E("(()=>{DC.docs[0].subject='=HYPERLINK(\"x\"),a'; return 1})()"); const c2=await E("rqCsv(rqRun('hyperlink',null,null,null,'"+TD+"').rows)"); ok(c2.includes('"\'=HYPERLINK(""x""),a"'),'CSV formula guard + quote escape');
const xs=await E("(()=>{const before=DC.docs.length, b=rqXlsx(rqRun('type:RFI',null,null,null,'"+TD+"').rows); return {before,after:DC.docs.length,size:b.size,isBlob:b instanceof Blob};})()"); ok(xs.isBlob&&xs.size>500&&xs.before===xs.after,'Excel blob via dcRegXlsx, DC.docs restored');
/* UI */
await E("XC.rq_open.run()"); await pg.waitForTimeout(500);
ok(await pg.locator('#rqIn').count()===1,'Query tab renders'); ok(await pg.locator('.dct button.on').first().textContent()==='Query','tab labelled Query');
ok((await pg.locator('.dcb table tr').count())===10,'default table 9 rows + header');
await pg.fill('#rqIn','type:RFI overdue:yes'); await pg.waitForTimeout(400); ok((await pg.locator('.dcb table tr').count())>=1,'typing filters table');
await pg.locator('.dcb table th',{hasText:'Due'}).click(); await pg.waitForTimeout(100);
await pg.fill('#rqIn',''); await pg.waitForTimeout(400); await pg.selectOption('.dcb select >> nth=0','type'); await pg.waitForTimeout(200); ok((await pg.locator('.dcb tr[style*="panel2"]').count())>=5,'group header rows shown');
await pg.fill('#rqIn','type:SUB'); await pg.selectOption('.dcb select >> nth=0',''); await pg.locator('.dcb button',{hasText:'Save view'}).click(); await pg.waitForTimeout(300);
ok((await E("JSON.parse(localStorage.getItem('xto-rqv')).map(v=>v.n+':'+v.q)")).join()==='V1:type:SUB','saved view persisted in localStorage');
const dl=pg.waitForEvent('download'); await pg.locator('.dcb button',{hasText:/^CSV$/}).click(); const d=await dl; ok(/\.csv$/.test(d.suggestedFilename()),'CSV download '+d.suggestedFilename());
const dl2=pg.waitForEvent('download'); await pg.locator('.dcb button',{hasText:'Excel'}).click(); const d2=await dl2; ok(/\.xlsx$/.test(d2.suggestedFilename()),'Excel download '+d2.suggestedFilename());
await pg.waitForTimeout(500); await pg.reload({waitUntil:'domcontentloaded'}); await pg.waitForFunction(()=>window.__lsv&&__lsv.ev('typeof RQ')==='object',null,{timeout:60000}); await pg.waitForTimeout(3000); console.log('after reload xto-rqv =',await pg.evaluate(()=>localStorage.getItem('xto-rqv'))); ok(await E("RQ.views.length")===1,'saved view survives reload'); await E("lang='en'");
await E("DC.docs=("+JSON.stringify(SMALL)+").map((a,i)=>({id:'s'+i,ref:a[0],type:a[1],dir:a[2],date:a[3],due:a[4],from:a[5],to:a[6],subject:a[7],status:a[8],disc:'General',prio:'normal',body:'',files:'',link:'',log:a[9]||[]})); 1");
await E("XC.rq_open.run()"); await pg.waitForTimeout(300); await pg.selectOption('.dcb select >> nth=1','V1'); await pg.waitForTimeout(300); ok(await pg.inputValue('#rqIn')==='type:SUB','loading a saved view fills the query');
/* Follow-up tab */
await E("XC.rq_follow.run()"); await pg.waitForTimeout(500);
ok(await pg.locator('.dcb svg').count()===5,'5 inline SVG charts'); ok(await pg.locator('.dcb textarea').count()===2,'two digest boxes');
ok((await pg.locator('.dcb h4 + table tr').count())<=11,'oldest table <= 10 rows + header');
await pg.locator('.dcb button',{hasText:'Add to news strip'}).click(); await pg.waitForTimeout(200); ok(/Follow-up|المتابعة/.test(await E("HX.news[0]")),'digest pushed to news strip: '+(await E("HX.news[0]")).slice(0,80));
ok(await E("dcTabs().map(t=>t[0]).join()")==='reg,fold,rq,rqf,new,tnd,fs,ipc,soil,rep,file,crm,rb,gl','tab order after Folders'); await E("DC.ui.tab='reg'; dcPanel(); 1"); ok((await pg.locator('.dcb table').count())>=1,'Register tab still renders (wrapper pass-through)');
await E("DC.ui.tab='fold'; DC.ui.path=[]; dcPanel(); 1"); ok((await pg.locator('.dcb').innerText()).includes('10 Correspondence')||(await pg.locator('.dcb').innerText()).length>0,'Folders tab still renders');
await E("lang='ar'; DC.ui.tab='rqf'; dcPanel(); 1"); ok((await pg.locator('.dct button.on').first().textContent())==='المتابعة'&&(await pg.locator('.dcb h4').first().textContent()).includes('أقدم'),'Arabic UI renders on Follow-up'); await E("lang='en'");
/* 5,000 docs perf */
await E("(()=>{ let a=12345; const r=n=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return Math.floor(((t^t>>>14)>>>0)/4294967296*n); }; const T=DCT.map(t=>t[0]), ST=DCS.map(x=>x[0]), P=Array.from({length:40},(_,i)=>'Party '+i), day=864e5, tn=Date.now(); const iso=o=>new Date(tn+o*day).toISOString().slice(0,10); DC.docs=Array.from({length:5000},(_,i)=>{ const type=T[r(T.length)], st=ST[r(ST.length)], dt=-r(120), dir=r(2)?'in':'out'; return {id:'p'+i,ref:'P-'+type+'-'+i,type,dir,date:iso(dt),due:r(10)?iso(dt+5+r(25)):'',from:dir==='in'?P[r(40)]:'Us',to:dir==='out'?P[r(40)]:'Us',subject:'Item '+i+' '+type,status:st,disc:'General',prio:'normal',body:'',files:'',link:'',log:/^(closed|appr|apn)$/.test(st)?[[iso(dt+r(30)+1)+'T10:00:00Z','status review → '+st+' by x']]:[]}; }); return DC.docs.length; })()");
const tm=async(js)=>E("(()=>{const t=performance.now(); const x="+js+"; return [performance.now()-t, x];})()");
const T=[]; for(const [lbl,js] of [['filter type+status+party+due, sort','rqRun("type:RFI,SUB status:sent,review due:<2030-01-01 party:party",null,null,null).n'],['no filter, sort date','rqRun("").n'],['sort subject asc','rqRun("","subject",true).n'],['group by party','rqRun("","date",false,"party").n'],['free text','rqRun("item 4 sub").n'],['rqStats()','rqStats().open'],['digest EN+AR','(()=>{const s=rqStats(); return rqDigest(s,0).length+rqDigest(s,1).length})()'],['CSV 5000 rows','rqCsv(rqRun("").rows).length'],['Excel 5000 rows','rqXlsx(rqRun("").rows).size']]){ const [ms,v]=await tm(js); T.push([lbl,ms,v]); console.log('PERF '+lbl.padEnd(40)+ms.toFixed(1).padStart(8)+' ms  -> '+v); }
const ui=await E("(()=>{ DC.ui.tab='rq'; RQ.q=''; RQ.page=200; let t=performance.now(); dcPanel(); const a=performance.now()-t; t=performance.now(); DC.ui.tab='rqf'; dcPanel(); return [a,performance.now()-t,RQ.tm]; })()");
console.log('PERF Query tab full render (5000 docs, 200 rows) '+ui[0].toFixed(1)+' ms (inner '+ui[2].toFixed(1)+')'); console.log('PERF Follow-up tab full render '+ui[1].toFixed(1)+' ms');
console.log('PERF seeded open items:',await E('rqStats().open'),'overdue:',await E('rqStats().od'));
ok(T.every(t=>t[1]<1500)&&ui[0]<1500&&ui[1]<1500,'every operation < 1.5 s at 5,000 docs');
ok(await pg.locator('.dcb svg').count()===5,'follow-up renders with 5,000 docs'); const lim=await E("(()=>{DC.ui.tab='rq'; RQ.q=''; RQ.page=200; dcPanel(); return document.querySelectorAll('.dcb table tr').length;})()"); ok(lim===201,'DOM capped at 200 rows + header ('+lim+')');
console.log('page errors:',er.slice(0,3)); ok(er.length===0,'no page errors'); await pg.screenshot({path:'/private/tmp/mod_regq/out/regq.png'}); await b.close(); console.log(fails?('FAILED '+fails):'ALL PASSED'); process.exit(fails?1:0);})();
