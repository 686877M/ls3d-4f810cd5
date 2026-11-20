const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]});
const ctx=await b.newContext(); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-splash','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(4000);
console.log(JSON.stringify(await E("[[30.0444,31.2357],[24.7136,46.6753],[21.4225,39.8262],[-33.8688,151.2093],[55.75,37.62]].map(p=>{ const u=toUTM(p[0],p[1]), o=utm2ll(u.E,u.N,u.zone,u.north); return [p,u.zone,+(Math.abs(o[0]-p[0])*111320).toFixed(3),+(Math.abs(o[1]-p[1])*111320*Math.cos(p[0]*Math.PI/180)).toFixed(3)]; })")));
await b.close();})();
