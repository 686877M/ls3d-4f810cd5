const {chromium}=require('playwright-core'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext({viewport:{width:1000,height:700}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(4000);
const S={any:await E("xtoBadge(false)"),full:await E("xtoBadge(true,.78)")};
const out=process.argv[3]+'/site/icons/';
for(const [name,svg,size,transparent] of [['icon-512.png',S.any,512,true],['icon-192.png',S.any,192,true],['maskable-512.png',S.full,512,false],['apple-touch-icon-180.png',S.full,180,false],['favicon-32.png',S.any,32,true]]){ const p=await ctx.newPage(); await p.setViewportSize({width:size,height:size}); await p.setContent('<html><body style="margin:0;background:transparent"><div style="width:'+size+'px;height:'+size+'px">'+svg.replace('<svg ','<svg width="'+size+'" height="'+size+'" ')+'</div></body></html>'); await p.screenshot({path:out+name,omitBackground:transparent,clip:{x:0,y:0,width:size,height:size}}); await p.close(); }
fs.writeFileSync(out+'icon.svg',S.any); console.log('icons written'); 
console.log('link icon now:',(await pg.evaluate(()=>document.querySelector('link[rel~="icon"]').href)).slice(0,40),'| apple:',(await pg.evaluate(()=>document.querySelector('link[rel="apple-touch-icon"]')&&1)),'| manifest link (file:// expected none):',await pg.evaluate(()=>!!document.querySelector('link[rel="manifest"]')));
await b.close();})();
