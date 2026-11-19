const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1400,height:800}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{if(m.type()==='error')er.push('C:'+m.text().slice(0,150));});
await pg.goto('file:///tmp/ls_index.html',{timeout:90000}); await pg.waitForTimeout(3500);
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
console.log('l3',await E("!!document.getElementById('xL3')+' intro='+L3.intro"));
for(const [i,w] of [[0,1200],[1,3500],[2,4500],[3,4500],[4,4500]]){ await pg.waitForTimeout(w); await pg.screenshot({path:'/tmp/l3_'+i+'.png'}); }
console.log('done',await E("L3.done+' doors='+L3.doors.length"));
console.log('ERR',er.slice(0,4)); await b.close();})();
