const {chromium}=require(process.env.SP+'/pw/node_modules/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1440,height:900}}); await ctx.addInitScript(()=>{ try{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');}catch(e){} window.__g=0; const o=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(t,...a){ if(/webgl/.test(t))window.__g++; return o.call(this,t,...a); }; });
 const pg=await ctx.newPage(); await pg.goto('file://'+process.argv[2],{waitUntil:'load',timeout:300000}); await pg.waitForTimeout(4000);
 console.log('webgl contexts after start:',await pg.evaluate(()=>window.__g));
 await pg.evaluate(()=>__lsv.ev("wtNew('model');0")); await pg.waitForFunction(()=>window.__g>0,null,{timeout:200000}); console.log('after model tab:',await pg.evaluate(()=>window.__g)); await b.close(); })();
