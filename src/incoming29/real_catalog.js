// REAL network: run the in-app "Test now" (gmcTest, Image + CORS like the map itself) for every non-link layer, print a table
const {chromium}=require('playwright-core'); const PAGE=process.argv[2]; const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{ const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-gis','xto-gm','xto-rc'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(); await pg.goto(PAGE,{waitUntil:'domcontentloaded',timeout:240000}); await pg.waitForTimeout(8000); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await E("lang='en'; wxOpen('pane:gismap',[0,0,1,1]); 1"); await pg.waitForTimeout(6000); await E("gmGo(30.0045,31.4885,9); 1");
 const ids=JSON.parse(await E("JSON.stringify(GMC.filter(e=>e.k!=='l'&&!e.key).map(e=>e.id))"));
 for(const id of ids){ const r=JSON.parse(await E("(async()=>JSON.stringify(await gmcTest(GMC.find(e=>e.id==='"+id+"'))))()")); console.log((r.ok===true?'OK   ':r.ok===false?'FAIL ':'n/a  ')+id.padEnd(16)+r.why); }
 await b.close(); })().catch(e=>{console.log('ERR',e.message);process.exit(1)});
