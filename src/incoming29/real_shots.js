// REAL network check of the new build: OSM street + Esri aerial at plot NC-A, F.X flight lines over aerial
const {chromium}=require('playwright-core'); const PAGE=process.argv[2], OUT=process.argv[3]; const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{ const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-gis','xto-gm','xto-rc'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); const st={}; pg.on('response',r=>{ const h=new URL(r.url()).host; if(/tile|arcgis|eox|gibs/.test(h)){ const k=h+' '+r.status(); st[k]=(st[k]||0)+1; } });
 await pg.goto(PAGE,{waitUntil:'domcontentloaded',timeout:240000}); await pg.waitForTimeout(8000); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await E("lang='en'; 1"); await E("wxOpen('pane:gismap',[0,0,1,1])"); await pg.waitForTimeout(9000);
 await E("gmxGoPlot('nc2',18)"); await pg.waitForTimeout(12000); await pg.screenshot({path:OUT+'_osm.png',timeout:240000,animations:'disabled'});
 await E("GM.base='img'; gmDraw(); 1"); await pg.waitForTimeout(12000); await pg.screenshot({path:OUT+'_esri.png',timeout:240000,animations:'disabled'});
 await E("gmxFly('nc2')"); await pg.waitForTimeout(9000); await E("GM.z=19; RC.show.foot=true; gmDraw(); 1"); await pg.waitForTimeout(8000); await pg.screenshot({path:OUT+'_fx.png',timeout:240000,animations:'disabled'});
 console.log(JSON.stringify(st), await E("JSON.stringify({ok:GMX.ok,fail:GMX.fail,down:GMX.down,status:gmxStatus()})")); await b.close(); })().catch(e=>{console.log('ERR',e.message);process.exit(1)});
