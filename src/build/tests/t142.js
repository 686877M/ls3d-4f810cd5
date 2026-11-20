const {chromium}=require('playwright-core'); const fs=require('fs'); const {execSync}=require('child_process');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true}); await ctx.addInitScript(()=>{try{['xto-tabs','xto-ai'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');localStorage.setItem('xto-msspeed','0');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
await E("xaHandle('اطلع المخرجات 1 3 5')"); for(let i=0;i<60;i++){ await pg.waitForTimeout(1000); if(await E("OUTC.versions.length")>0)break; }
console.log('v1:',JSON.stringify(await E("OUTC.versions[0]")),'| question:',await E("XAS.q?XAS.q.opts.map(o=>o[0]).join('|'):'none'"));
const dl=pg.waitForEvent('download'); await E("outDownload(1)"); const d=await dl; await d.saveAs('/tmp/out_v1.zip'); console.log('zip:',d.suggestedFilename(),fs.statSync('/tmp/out_v1.zip').size,'bytes'); console.log(execSync('unzip -l /tmp/out_v1.zip | tail -25').toString().split('\n').slice(3,26).map(l=>l.trim().split(/\s+/).slice(-1)[0]).join(' '));
console.log('unzip -t:',execSync('unzip -tq /tmp/out_v1.zip').toString().trim());
await E("XAS.q=null; xaHandle('غيّر الورقة A1 والمراجعة B')"); for(let i=0;i<60;i++){ await pg.waitForTimeout(1000); if(await E("OUTC.versions.length")>1)break; }
console.log('v2:',JSON.stringify(await E("OUTC.versions[0]")),'| DR.rev',await E("DR.rev"),'paper',await E("SH.paper"));
const dl2=pg.waitForEvent('download'); await E("XAS.q=null; xaHandle('نزل النهائي')"); const d2=await dl2; console.log('final download:',d2.suggestedFilename()); console.log('errors',er.slice(0,3)); await b.close();})();
