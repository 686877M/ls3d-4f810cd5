const {chromium}=require('playwright-core');
exports.run=async function(name,fn,opt){ opt=opt||{}; const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}); let pass=0,fail=0; const fails=[];
 try{ const ctx=await b.newContext({viewport:{width:opt.w||1500,height:opt.h||860}}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-rv','xto-ai'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
  const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept(opt.promptText));
  const E=s=>pg.evaluate(s=>__lsv.ev(s),s); const ok=(n,c,extra)=>{ if(c)pass++; else{ fail++; fails.push(n+(extra!==undefined?' -> '+extra:'')); } console.log((c?'PASS ':'FAIL ')+n+(extra!==undefined&&!c?' -> '+JSON.stringify(extra):'')); };
  await pg.goto('file://'+(opt.page||'/private/tmp/mod_nv/site/index.html'),{waitUntil:'domcontentloaded',timeout:120000}); await pg.waitForTimeout(6000);
  if(!opt.noTab){ await E("wtNew('coord')"); await pg.waitForTimeout(2000); }
  await fn({pg,E,ok,er}); console.log('page errors:',er.slice(0,4)); }
 catch(e){ console.log('TEST CRASH',e.message); fail++; fails.push('crash '+e.message); }
 finally{ await b.close(); } console.log(name+': '+pass+' pass, '+fail+' fail'); if(fail)console.log('FAILS:',fails); process.exitCode=fail?1:0; };
