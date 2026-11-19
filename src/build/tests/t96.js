const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{localStorage.removeItem('xto-tabs');sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-splash','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const dl=[]; pg.on('dialog',d=>{ dl.push(d.message()+'='+d.defaultValue()); d.accept(d.defaultValue()); }); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
console.log(JSON.stringify(await E("(()=>{const D=cadD(); D.ents=[{t:'l',x1:0,y1:0,x2:1,y2:0,ly:'0'}]; CS.sel=new Set([0]); CS.tool='array'; c2Run('array'); return [D.ents.length,D.ents.map(e=>[e.x1,e.y1])];})()")),dl);
await b.close();})();
