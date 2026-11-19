const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:900}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message));
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(5000);
await E("ytLoad('hwWpWoOtsBY','Test'); "); await pg.waitForTimeout(1500);
for(let i=0;i<4;i++){ await E("ytSize(-1)"); } console.log('tiny width',await E("document.getElementById('xMini').getBoundingClientRect().width+' tiny='+document.getElementById('xMini').classList.contains('tiny')+' state='+YTP.state"));
await pg.screenshot({path:'/tmp/mini_tiny.png',clip:{x:1100,y:560,width:400,height:340}});
for(let i=0;i<6;i++){ await E("ytSize(1)"); } console.log('big width',await E("document.getElementById('xMini').getBoundingClientRect().width"));
await E("ytSize(-3)"); console.log('ERR',er.slice(0,3)); await b.close();})();
