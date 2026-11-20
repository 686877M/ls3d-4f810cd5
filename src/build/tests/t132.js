const {chromium}=require('playwright-core'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1200,height:700}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(4500);
for(const day of [0,1,2,3]){ await E("OCC.day="+(19000+day)); for(let k=0;k<5;k++){ const u=await E("(()=>{ const c=document.createElement('canvas'); c.width=480; c.height=270; const x=c.getContext('2d'); x.fillStyle='#050506'; x.fillRect(0,0,480,270); [egScene0,egScene1,egScene2,egScene3,egScene4]["+k+"](x,480,270,"+(30+day*7)+"); return c.toDataURL('image/jpeg',.8); })()"); fs.writeFileSync('out/eg_'+day+'_'+k+'.jpg',Buffer.from(u.split(',')[1],'base64')); } }
console.log('scenes in IDS:',await E("IDS.length"),'errors',er.slice(0,3)); await b.close();})();
