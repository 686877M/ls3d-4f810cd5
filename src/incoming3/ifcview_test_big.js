const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///private/tmp/mod_ifc/site/index_ifv.html',{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(5000);
await E("XC.ifc_open.run()"); await pg.waitForTimeout(500);
const heap=()=>pg.evaluate(()=>Math.round(performance.memory.usedJSHeapSize/1048576));
console.log('heap before MB',await heap()); const t=Date.now();
await pg.setInputFiles('#ifvbox input[type=file]','/private/tmp/mod_ifc/big_lift.ifc');
let maxs=0; for(let i=0;i<300;i++){ await pg.waitForTimeout(1000); const s=await E("ifV.st.textContent"); if(/Could not|·/.test(s)){console.log('done:',s); break;} if(i%10==0)console.log('...',s); }
console.log('secs',(Date.now()-t)/1000,'info',JSON.stringify(await E("ifV.info")),'heap MB',await heap(),'wasm MB',await E("Math.round(ifV.api.wasmModule.HEAPU8.length/1048576)"));
await E("ifvSelect([ifV.elems[0]])"); await pg.waitForTimeout(500);
await E("ifvClose(false)"); await pg.waitForTimeout(500); console.log('after close heap MB',await heap(),'meshes',await E("ifV.mesh.size"),'GPU',JSON.stringify(await E("ifV.rd.info.memory")));
console.log('errors',JSON.stringify(er.slice(0,3))); await b.close();})();
