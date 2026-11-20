const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{localStorage.removeItem('xto-tabs');sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-splash','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
const cover={};
for(const t of ['draft','model','survey','plant','sched','coord','office','gis']){ await E("wtNew('"+t+"')"); await pg.waitForTimeout(900); cover[t]=await E("(()=>{ const ids=Object.keys(RIBM).filter(i=>RIBM[i].type==='"+t+"'); const d=ids.filter(i=>crDesc(Object.assign({id:i},RIBM[i]))).length; return [ids.length,d]; })()"); }
console.log('described / total per program:',JSON.stringify(cover));
await E("wtNew('draft')"); await pg.waitForTimeout(1200); await E("cmdRefOpen()"); await pg.waitForTimeout(800);
console.log('rows:',await pg.evaluate(()=>document.querySelectorAll('.xw[data-id="pane:cmdref"] tbody tr').length));
await pg.screenshot({path:'/tmp/cr1.png'});
console.log('tooltip sample:',await pg.evaluate(()=>{ const b=document.querySelector('#xRib .xb'); return b?b.title:''; }));
console.log(er.slice(0,4)); await b.close();})();
