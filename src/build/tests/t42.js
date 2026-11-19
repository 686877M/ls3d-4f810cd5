const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-splash','1');}catch(e){}}); let pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{if(m.type()==='error')er.push('C:'+m.text().slice(0,160));});
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(5000);
await E("wtSwitch(WTAB.tabs[1].id)"); await pg.waitForTimeout(900); await pg.screenshot({path:'/tmp/u0.png'});
/* tooltip */
await pg.hover('.xb >> nth=2'); await pg.waitForTimeout(900); await pg.screenshot({path:'/tmp/u1.png'});
/* change project then autosave */
await E("P.D=(+P.D||3)+.2; persist(); autoSave('flush')"); await pg.waitForTimeout(1500);
const n1=await E("HI.st.length+'/'+HI.i"); console.log('hist before',n1);
await E("UI2.z=.8; UI2.d=2; ui2Apply(); wtBar()"); await pg.waitForTimeout(500); await pg.screenshot({path:'/tmp/u2.png'});
await pg.close(); pg=await ctx.newPage(); pg.on('pageerror',x=>er.push(x.message)); await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(5500);
console.log('hist after reload',await pg.evaluate(()=>__lsv.ev("HI.st.length+'/'+HI.i")),'zoom',await pg.evaluate(()=>__lsv.ev("UI2.z+' '+UI2.d")),'tabs',await pg.evaluate(()=>__lsv.ev("WTAB.tabs.length+' '+WTAB.cur")));
await pg.evaluate(()=>__lsv.ev("UI2.col=1; ui2Apply()")); await pg.waitForTimeout(400); await pg.screenshot({path:'/tmp/u3.png'});
await pg.evaluate(()=>__lsv.ev("UI2.col=0; UI2.z=1; UI2.d=1; ui2Apply(); XC.guide.run()")); await pg.waitForTimeout(700); await pg.screenshot({path:'/tmp/u4.png'});
const z=await pg.evaluate(()=>__lsv.ev("(async()=>{const r=await xPack(); return r.files+' files';})()")); console.log('pack',z);
console.log('ERR',er.slice(0,6)); await b.close();})();
