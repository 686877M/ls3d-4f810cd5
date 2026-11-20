const {chromium}=require('playwright-core');
exports.open=async(url)=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1500,height:(process.env.VH?+process.env.VH:900)},acceptDownloads:true}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-dc'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept(d.defaultValue()||'')); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await pg.goto(url||'file:///private/tmp/mod_lib/site/index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(4500);
 let pass=0,fail=0; const ck=(n,c,x)=>{ if(c){pass++;console.log('PASS',n,x===undefined?'':JSON.stringify(x));} else {fail++;console.log('FAIL',n,x===undefined?'':JSON.stringify(x));} };
 return {b,pg,E,er,ck,sum:()=>{ console.log('RESULT pass',pass,'fail',fail,'pageerrors',er.length,er.slice(0,3)); return b.close(); }}; };
