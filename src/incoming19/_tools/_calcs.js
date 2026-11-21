const {chromium}=require('playwright-core'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860}});await ctx.addInitScript(()=>{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');sessionStorage.setItem('xto-intro-seen','1');});
const pg=await ctx.newPage();await pg.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:120000});await pg.waitForTimeout(8000);
const r=await pg.evaluate(()=>__lsv.ev(`JSON.stringify({calcs:CALCS.map(c=>[c.id,c.dis[0],c.t[0],(c.codes||[]).join('/'),c.in.map(i=>i[0]).join(',')]),
 vars:(()=>{const o={};['CODES','HVAC','HVLOAD','DUCT','LIBS','LIB','FAMS','MATS','SPECS','PRICES','UPRICE','RATES','BOQ','SOIL','TEMPLATES','EGY','EGYPT','LOADS','DEMO','DMX','WF','FLOWS','FLOW','MISSIONS','MISSION','RB','REBAR'].forEach(n=>{try{const v=eval(n);o[n]=Array.isArray(v)?'array '+v.length:typeof v==='object'&&v?'obj '+Object.keys(v).slice(0,25).join(','):typeof v;}catch(e){}});return o;})()})`));
fs.writeFileSync(process.argv[3],r);await b.close();})();
