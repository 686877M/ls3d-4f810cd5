const {chromium}=require('playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/Users/M7/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-x64/chrome-headless-shell',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const pg=await b.newPage({acceptDownloads:true,viewport:{width:1400,height:900}});
 const errs=[]; pg.on('pageerror',e=>errs.push('PE '+e.stack.split('\n').slice(0,4).join(' | '))); pg.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200));});
 await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3500);
 console.log('errors:',[...new Set(errs)].filter(x=>!/NaN/.test(x)).slice(0,6));
 const r=await pg.evaluate(()=>__lsv.ev("(()=>{const a=ACT[3]; return {TOTAL,T0,keys:Object.keys(a).filter(k=>typeof a[k]!=='object'||k==='preds').map(k=>k+'='+JSON.stringify(a[k])).join(' '),hi:HI.st.length}})()")); console.log(JSON.stringify(r).slice(0,900));
await b.close();
})();
