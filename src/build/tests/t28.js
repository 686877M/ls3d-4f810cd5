const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1400,height:800}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|')));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3200); await pg.screenshot({path:'/tmp/l1.png'});
console.log('login present',await pg.evaluate(()=>!!document.getElementById('xLogin')));
await pg.fill('#xlP','123'); await pg.waitForTimeout(400); console.log('after wrong',await pg.evaluate(()=>!!document.getElementById('xLogin')));
await pg.fill('#xlP','6868'); await pg.waitForTimeout(2200); console.log('after 6868 present',await pg.evaluate(()=>!!document.getElementById('xLogin')),'auth',await pg.evaluate(()=>sessionStorage.getItem('xto-auth')));
await pg.waitForTimeout(3800); console.log('shell',await pg.evaluate(()=>!!document.getElementById('xto')),'splash',await pg.evaluate(()=>!!document.getElementById('xSplash')));
console.log(er.slice(0,3)); await b.close();})();
