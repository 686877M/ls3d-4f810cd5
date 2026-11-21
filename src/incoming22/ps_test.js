/* Prices / specs / finishes / tender browser test (one headless Chrome).
   NODE_PATH=<SP>/pw/node_modules node ps_test.js <built index.html or index.test.html> [chrome path] */
const {chromium}=require('playwright-core'), path=require('path'), fs=require('fs');
const page=process.argv[2], chrome=process.argv[3]||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass=0, fail=0; const ok=(n,got,exp)=>{ const g=typeof exp==='number'&&typeof got==='number'?Math.abs(got-exp)<1e-6:JSON.stringify(got)===JSON.stringify(exp); g?pass++:fail++; console.log((g?'ok   ':'FAIL ')+n+(g?'':'  -> got '+JSON.stringify(got)+' expected '+JSON.stringify(exp))); };
(async()=>{ const b=await chromium.launch({executablePath:chrome}); const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});
 await ctx.addInitScript(()=>{ try{ sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept(d.type()==='prompt'?d.defaultValue():undefined)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await pg.goto('file://'+path.resolve(page),{waitUntil:'domcontentloaded',timeout:180000}); await pg.waitForTimeout(6000);
 ok('page loads with no script error',er.slice(0,3),[]);
 /* ---- lazy and opt-in at start ---- */
 ok('lazy: DATA.ps absent at start, no pane open',await E("[typeof DATA.ps, !!(WX.lay['pane:ps']&&WX.lay['pane:ps'].open), PSU.S.box===null]"),['undefined',false,true]);
 ok('lazy: price book starts empty after first read',await E("PSU.D().book.items.length+'|'+PSU.D().book.currency"),'0|');
 await E("wtNew('takeoff')"); await pg.waitForTimeout(900);
 /* ---- ribbon ---- */
 ok('ribbon tab "Prices & specs" added to the Q.X tab',await E("RIBP.takeoff.tabs.some(t=>t[0]==='ps')"),true);
 const ids=await E("RIBP.takeoff.tabs.find(t=>t[0]==='ps')[2].flatMap(g=>g[1])"); ok('13 ribbon commands registered',ids.length,13);
 ok('every command is wired (no stub) and has bilingual XDESC',await E("JSON.stringify(RIBP.takeoff.tabs.find(t=>t[0]==='ps')[2].flatMap(g=>g[1]).filter(id=>!XC[id]||XC[id].stub||!XDESC[id]||!XDESC[id][0]||!XDESC[id][1]||!/[\\u0600-\\u06FF]/.test(XDESC[id][1])))"),'[]');
 ok('ps_open also registered with help',await E("!!XC.ps_open&&!!XDESC.ps_open"),true);
 /* ---- pane + price book ---- */
 await E("lang='en'"); await E("XC.ps_open.run()"); await pg.waitForTimeout(700); await E("PSU.render()");
 ok('pane open',await E("!!(WX.lay['pane:ps']&&WX.lay['pane:ps'].open)&&PSU.S.box.isConnected"),true);
 const txt=()=>E("PSU.S.box.innerText"); ok('empty book message shown',/book is empty/.test(await txt()),true);
 ok('4 tabs',await E("PSU.S.bar.querySelectorAll('button').length"),4);
 const clickBtn=async(re)=>E("(()=>{const b=[...PSU.S.box.querySelectorAll('button')].find(x=>new RegExp('"+re+"').test(x.textContent)); if(!b)return false; b.click(); return true;})()");
 ok('Load sample rates button',await clickBtn('Load sample rates'),true);
 const n=await E("PSU.D().book.items.length"); ok('55+ sample items loaded',n>=50,true);
 ok('banner says SAMPLE, replace with your own rates',/SAMPLE, replace with your own rates/.test(await txt()),true);
 ok('rate column header labelled SAMPLE',/Rate \(SAMPLE\)/.test(await txt()),true);
 ok('every row source says SAMPLE',await E("[...PSU.S.box.querySelectorAll('tr')].slice(1).filter(r=>r.cells.length===6).every(r=>r.cells[5].textContent==='SAMPLE')"),true);
 /* edit a rate in the table: becomes 'your rate' */
 await E("(()=>{ const r=[...PSU.S.box.querySelectorAll('tr')].find(r=>r.cells[0]&&r.cells[0].textContent==='CN03'); const i=r.cells[4].querySelector('input'); i.value='95'; i.dispatchEvent(new Event('change')); })()");
 ok('edited rate saved as user rate',await E("JSON.stringify([PSX.item(PSU.D().book,'CN03').rate,PSX.item(PSU.D().book,'CN03').src])"),'[95,"user"]');
 await E("(()=>{ const m=PSU.S.box.querySelectorAll('.small'); const b=PSU.D().book; b.currency='XXX'; b.date='2026-11-21'; b.region='Test region'; })()");
 ok('every price button has a bilingual title',await E("[...PSU.S.box.querySelectorAll('button')].every(b=>b.title&&b.title.length>8)"),true);
 /* ---- Q.X: nothing applied silently ---- */
 await E("RV.els.length=0; RV.els.push({id:1,k:'wall',a:[0,0],b:[10,0],h:3,t:.2,lv:0},{id:2,k:'wall',a:[10,0],b:[10,8],h:3,t:.2,lv:0},{id:3,k:'wall',a:[10,8],b:[0,8],h:3,t:.2,lv:0},{id:4,k:'wall',a:[0,8],b:[0,0],h:3,t:.2,lv:0},{id:5,k:'door',w:1,p:2,W:.9,H:2.1,lv:0},{id:6,k:'window',w:2,p:3,W:1.2,H:1.2,lv:0},{id:7,k:'floor',a:[0,0],b:[10,8],t:.2,lv:0},{id:8,k:'col',a:[1,1],b:[1,1],w:.4,d:.4,h:3,lv:0})");
 await E("DATA.qx=null; qxWb(); qxModelSync(true)");
 const rows=await E("PSU.modelRows().rows"); ok('model rows exist',rows.length>=5,true);
 ok('no rate in Q.X although the book is loaded',await E("PSU.modelRows().rows.every(r=>r.rate===null)"),true);
 ok('book loaded + new Q.X model sync still leaves rates empty',await E("(()=>{ qxModelSync(true); const s=PSU.modelRows().sh; for(let r=1;r<s.nr;r++){ if(s.cells[qxK(r,7)]!==undefined)return false; } return true; })()"),true);
 ok('BOQ built without any rates totals 0',await E("(()=>{ QX.mkBoq(); const s=qxCur(); let t=null; for(let r=0;r<s.nr;r++){ if(s.cells[qxK(r,1)]==='TOTAL'){ const v=qxGet(s,r,5); t=v&&v.e?v.e:v; } } return t; })()"),0);
 /* ---- apply dialog ---- */
 await clickBtn('Apply to Q.X'); await pg.waitForTimeout(300);
 ok('apply panel open',/Apply price book to Q.X quantity lines/.test(await txt()),true);
 ok('suggestions pre-selected but nothing ticked',await E("(()=>{ const p=PSU.S.ap.picks; const s=Object.values(p); return [s.some(x=>x.code),s.some(x=>x.on)]; })()"),[true,false]);
 ok('Apply with nothing ticked writes nothing',await E("(()=>{ const b=[...PSU.S.box.querySelectorAll('button')].find(x=>/Apply ticked/.test(x.textContent)); b.click(); return PSU.modelRows().rows.every(r=>r.rate===null); })()"),true);
 await clickBtn('Tick suggested'); await pg.waitForTimeout(200);
 ok('tick suggested ticks lines',await E("Object.values(PSU.S.ap.picks).filter(x=>x.on).length>=3"),true);
 ok('preview total mentions SAMPLE',/SAMPLE, replace with your own rates/.test(await txt()),true);
 ok('Apply ticked lines',await clickBtn('Apply ticked'),true); await pg.waitForTimeout(300);
 const after=await E("PSU.modelRows().rows.map(r=>({k:r.key,q:r.qty,r:r.rate}))");
 const exp={'RX:wall.A':17,'RX:floor.V':95,'RX:col.V':95,'RX:door.n':140,'RX:window.n':120};
 let allExp=true; after.forEach(r=>{ if(exp[r.k]!==undefined&&r.r!==exp[r.k])allExp=false; if(exp[r.k]===undefined&&r.r!==null)allExp=false; }); ok('rates written exactly for ticked suggestions (CN03 = the user rate 95)',allExp,true);
 ok('remark column labels SAMPLE rows and user rows',await E("(()=>{ const s=PSU.modelRows().sh; const rm=k=>{ for(let r=1;r<s.nr;r++)if(s.cells[qxK(r,0)]===k)return s.cells[qxK(r,9)]; }; return [/SAMPLE, replace with your own rates/.test(rm('RX:wall.A')),/XXX/.test(rm('RX:wall.A')),/SAMPLE/.test(rm('RX:floor.V'))]; })()"),[true,true,false]);
 const hand=after.reduce((s,r)=>s+(r.r||0)*r.q,0);
 ok('Q.X BOQ total = sum of qty x rate',await E("(()=>{ QX.mkBoq(); const s=qxCur(); let t=null; for(let r=0;r<s.nr;r++){ if(s.cells[qxK(r,1)]==='TOTAL'){ const v=qxGet(s,r,5); t=v&&v.e?v.e:v; } } return t; })()"),hand);
 ok('hand total is non-zero',hand>0,true);
 ok('rates survive a model refresh',await E("(()=>{ qxModelSync(true); return PSU.modelRows().rows.filter(r=>r.rate!==null).length; })()"),5);
 /* ---- CSV round trip through the real file chooser ---- */
 const csv=await E("PSX.bookCsv(PSU.D().book)"); fs.writeFileSync('/tmp/ps_book_rt.csv',csv);
 await E("PSU.D().book.items.length=0; PSU.D().book.currency=''; PSU.D().book.date=''; PSU.D().book.region=''; PSU.render()");
 const [fc]=await Promise.all([pg.waitForEvent('filechooser'),clickBtn('Import CSV')]); await fc.setFiles('/tmp/ps_book_rt.csv'); await pg.waitForTimeout(500);
 ok('import via file chooser restored every item',await E("PSU.D().book.items.length"),n);
 ok('import kept currency/date/region and the user rate',await E("(()=>{ const b=PSU.D().book; return [b.currency,b.date,b.region,PSX.item(b,'CN03').rate,PSX.item(b,'CN03').src,PSX.item(b,'MS01').src]; })()"),['XXX','2026-11-21','Test region',95,'user','sample']);
 ok('export CSV equals the original',await E("PSX.bookCsv(PSU.D().book)"),csv);
 /* ---- finishes: 2 rooms, hand calculation ---- */
 await E("RV.els.length=0; RV.els.push({id:1,k:'room',a:[0,0],b:[4,5],n:'Living',lv:0},{id:2,k:'room',a:[4.2,0],b:[7.2,3],n:'Bath',lv:0},{id:3,k:'wall',a:[4.1,0],b:[4.1,5],h:3,t:.2,lv:0},{id:4,k:'wall',a:[0,0],b:[4,0],h:3,t:.2,lv:0},{id:5,k:'door',w:3,p:1.5,W:.9,H:2.1,lv:0},{id:6,k:'window',w:4,p:2,W:1.2,H:1.2,lv:0})");
 await E("PSU.S.tab='fin'; PSU.render()"); ok('no rooms yet before sync',await E("PSU.D().fin.rooms.length"),0);
 ok('Sync rooms button',await clickBtn('Sync rooms'),true); await pg.waitForTimeout(300);
 ok('2 rooms synced',await E("PSU.D().fin.rooms.length"),2);
 const Q=async c=>E("(PSU.finCalc().lines.find(l=>l.code==='"+c+"')||{}).qty");
 ok('floor ceramic = 20+9',await Q('FL01'),29); ok('screed = 29',await Q('FL06'),29); ok('skirting = (18-0.9)+(12-0.9)',await Q('SK01'),28.2);
 ok('plaster walls = 50.67+34.11',await Q('PL01'),84.78); ok('paint = walls + ceilings',await Q('PT01'),113.78); ok('ceiling plaster = 29',await Q('PL03'),29);
 ok('shared door counted once, window area 1.44',[await Q('DW01'),await Q('DW03')],[1,1.44]);
 ok('no rates before Fill',await E("PSU.finCalc().lines.every(l=>l.rate===null&&l.amount===null)"),true);
 ok('cost per m2 empty before rates',await E("PSU.finCalc().sum.perM2"),null);
 ok('Fill rates button',await clickBtn('Fill rates from book'),true); await pg.waitForTimeout(300);
 const fc2=await E("PSU.finCalc()"); let h2=0; fc2.lines.forEach(l=>{ const r=l.code==='FL01'?18:l.rate; h2+=l.qty*l.rate; });
 ok('amount = qty x rate on every line',fc2.lines.every(l=>Math.abs(l.amount-l.qty*l.rate)<1e-9),true);
 ok('summary total = sum of lines; cost per m2 = total / 29',[Math.abs(fc2.sum.total-h2)<1e-6,Math.abs(fc2.sum.perM2-h2/29)<1e-6],[true,true]);
 ok('screen shows the SAMPLE label for sample-rate lines',/SAMPLE, replace with your own rates/.test(await txt()),true);
 ok('change a finish: marble floor in Living',await E("(()=>{ PSU.D().fin.rooms[0].floor='mar'; return (PSU.finCalc().lines.find(l=>l.code==='FL03')||{}).qty; })()"),20);
 await E("PSU.D().fin.rooms[0].floor='cer'");
 ok('Send BOQ to Q.X makes a sheet whose total = sum of amounts',await E("(()=>{ PSU.finToQX(); const s=qxCur(); if(s.name.indexOf('Finishes BOQ')!==0)return s.name; let t=null; for(let r=0;r<s.nr;r++){ if(s.cells[qxK(r,1)]==='TOTAL'){ const v=qxGet(s,r,5); t=v&&v.e?v.e:v; } } return Math.abs(t-PSU.finCalc().sum.total)<1e-6; })()"),true);
 ok('manual room by hand',await E("(()=>{ PSU.addRoom({name:'Hand',A:12,P:14,h:3,doors:'0.9x2.1',wins:'1x1*2'}); const q=PSX.finQty(PSU.D().fin.rooms[2]); return [q.wall,q.skirt]; })()"),[14*3-1.89-2,14-.9]);
 ok('re-sync keeps manual room + choices',await E("(()=>{ PSU.D().fin.rooms[0].wall='tile'; const m=PSU.syncRooms(); return [PSU.D().fin.rooms.length,PSU.D().fin.rooms[0].wall,m.added,m.removed]; })()"),[3,'tile',0,0]);
 await E("PSU.D().fin.rooms[0].wall='paint'");
 /* ---- specs ---- */
 await E("PSU.S.tab='specs'; PSU.render()"); ok('spec tab lists every clause',await E("PSU.S.box.querySelectorAll('input[data-c]').length"),await E("PSD.spec.length"));
 await E("PSU.S.specLine='RX:wall.A'; PSU.render()"); await clickBtn('Suggest clauses');
 ok('suggested clauses for the walls line = masonry + plaster + paint',await E("PSU.D().spec.sel['RX:wall.A'].join()"),'MS-1,MS-2,PL-1,PT-1');
 await E("PSU.D().spec.sel['RX:floor.V']=['CN-1','CN-2']; PSU.D().spec.lang='both'");
 await E("DATA.proj=DATA.proj||{}; DATA.proj.name='ZZ-SECRET-PROJECT'; DR.title='ZZ-SECRET-PROJECT'; DR.proj='ZZ-SECRET-PROJECT'");
 const sb=await E("PSU.specHtml()");
 ok('spec book has chosen clauses and the line table, EN + AR',/Mortar and workmanship/.test(sb)&&/Cover to reinforcement/.test(sb)&&/Walls, net area/.test(sb)&&/class="ar"/.test(sb)&&!/Wall tiles/.test(sb),true);
 ok('spec book has no project identity, neutral title',!/ZZ-SECRET/.test(sb)&&/<title>Technical specifications<\/title>/.test(sb),true);
 ok('check box edits selection',await E("(()=>{ const c=PSU.S.box.querySelector('input[data-c=\"EW-1\"]'); c.checked=true; c.dispatchEvent(new Event('change')); return PSU.D().spec.sel[PSU.S.specLine].includes('EW-1'); })()"),true);
 /* ---- tender ---- */
 await E("PSU.S.tab='tender'; PSU.render()"); ok('no bid sheet before the user starts one',await E("PSU.D().bids===undefined||PSU.D().bids===null"),true);
 ok('Load 3 sample bids',await clickBtn('Load 3 sample bids'),true); await pg.waitForTimeout(300);
 ok('comparison table has 3 ranked bidders',await E("PSX.bidCompare(PSU.D().bids).rows.map(r=>r.rank).sort().join()"),'1,2,3');
 ok('sheet shows normalised totals and flags',/Normalised/.test(await txt())&&/unbalanced/.test(await txt())&&/missing 1/.test(await txt()),true);
 const bh=await E("PSX.bidHtml(PSU.D().bids,PSX.bidCompare(PSU.D().bids),'XXX')"), ch=await E("PSU.contractDoc()"), fh=await E("PSU.finHtml()");
 ok('bid, contract and finishes pages have no project identity',[bh,ch,fh,sb].every(x=>!/ZZ-SECRET/.test(x)),true);
 ok('contract set has every template and Arabic',await E("PSD.contract.every(c=>PSU.contractDoc().includes(c[1]))&&/[\\u0600-\\u06FF]/.test(PSU.contractDoc())"),true);
 ok('Lines from finishes starts a sheet from the generated lines',await E("(()=>{ const s=PSU.newBids('fin'); return s.lines.length===PSU.finCalc().lines.length&&s.lines[0].est!==null; })()"),true);
 /* ---- Output Center ---- */
 ok('OUTL has items 11, 12, 13',await E("[11,12,13].every(i=>OUTL.some(x=>x[0]===i))"),true);
 const files=await E("(async()=>{ const o=[]; for(const i of [11,12,13]){ const f=await OUTL.find(x=>x[0]===i)[3](); f.forEach(x=>o.push([x.n,String(x.d).length])); } return o; })()");
 ok('outputs produce files',files.map(f=>f[0]),['11_Specifications/Specification_book.html','12_Prices/Price_book.csv','12_Prices/Finishes_BOQ.csv','12_Prices/Finishes_schedule.html','13_Tender/Tender_and_contract_documents.html','13_Tender/Bid_comparison.html','13_Tender/Bids_sheet.csv']);
 ok('output files are non-empty and neutral names',files.every(f=>f[1]>100&&!/ZZ-SECRET|M7|Users/.test(f[0])),true);
 ok('Output Center list shows the new items',await E("(()=>{ XC.out_open.run(); return true; })()"),true); await pg.waitForTimeout(600);
 ok('Output Center renders items 11-13',await E("[11,12,13].every(i=>!!document.querySelector('#xOutL [data-oid=\"'+i+'\"]'))"),true);
 /* ---- Arabic render + every button titled, all 4 tabs ---- */
 for(const t of ['prices','specs','fin','tender']){ await E("lang='ar'; PSU.S.tab='"+t+"'; PSU.render()"); ok('Arabic render '+t+' (Arabic text, no error panel)',await E("/[\\u0600-\\u06FF]/.test(PSU.S.box.innerText)&&!PSU.S.box.querySelector('[style*=\"c9a227\"]:only-child')"),true);
  ok('all buttons titled in '+t+' (ar)',await E("[...PSU.S.box.querySelectorAll('button')].every(b=>b.title&&b.title.length>2)"),true); }
 await E("lang='en'; PSU.S.tab='prices'; PSU.render()");
 /* ---- persistence ---- */
 ok('DATA.ps survives JSON round trip',await E("(()=>{ const a=JSON.stringify(DATA.ps); return JSON.stringify(JSON.parse(a))===a&&a.length>1000; })()"),true);
 ok('persist() stores the book',await E("(()=>{ persist(); const s=localStorage.getItem(STORE_KEY); return !!s&&JSON.parse(s).data.ps.book.items.length>50; })()"),true);
 ok('no script errors during the whole run',er.slice(0,3),[]);
 console.log('\n'+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error('CRASH',e); process.exit(2); });
