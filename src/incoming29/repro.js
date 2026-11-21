// repro: open G.X on the CURRENT build, log tile requests/failures, screenshot
const {chromium}=require('playwright-core'); const URL=process.argv[2], OUT=process.argv[3], MODE=process.argv[4]||'real';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-gis'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const log=[]; pg.on('pageerror',x=>log.push('PAGEERR '+x.message)); pg.on('console',m=>{ if(m.type()==='error')log.push('CONSOLE '+m.text().slice(0,200)); });
 pg.on('request',r=>{ if(/tile|arcgis|openstreetmap|carto|opentopo/.test(r.url()))log.push('REQ '+r.url().slice(0,110)); });
 pg.on('requestfailed',r=>{ if(/tile|arcgis|openstreetmap|carto/.test(r.url()))log.push('FAIL '+r.failure().errorText+' '+r.url().slice(0,100)); });
 pg.on('response',r=>{ if(/tile|arcgis|openstreetmap/.test(r.url()))log.push('RES '+r.status()+' '+r.url().slice(0,100)); });
 if(MODE==='block'){ await ctx.route(/tile\.openstreetmap|arcgisonline/,r=>r.abort('blockedbyclient')); }
 await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:180000}); await pg.waitForTimeout(8000);
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 log.push('typeof wxOpen '+await E("typeof wxOpen")+' GM '+await E("typeof GM"));
 await E("wxOpen('pane:gismap',[0,0,1,1])"); await pg.waitForTimeout(12000);
 log.push('GM '+await E("JSON.stringify({lat:GM.lat,lon:GM.lon,z:GM.z,base:GM.base,cv:!!GM.cv,w:GM.cv&&GM.cv.width,h:GM.cv&&GM.cv.height,cache:GM.cache.size,ok:[...GM.cache.values()].filter(t=>t.__ok).length,bad:[...GM.cache.values()].filter(t=>t.__bad).length})"));
 await pg.screenshot({path:OUT}); console.log(log.slice(0,60).join('\n')); await b.close();
})().catch(e=>{console.log('ERR',e.message); process.exit(1)});
