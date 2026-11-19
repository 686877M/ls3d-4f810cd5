const {chromium}=require('playwright-core'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({acceptDownloads:true,viewport:{width:1500,height:950}}); const er=[]; pg.on('pageerror',x=>er.push(x.message));
const OUT='/tmp/ls_out2'; fs.mkdirSync(OUT,{recursive:true}); pg.on('download',async d=>{await d.saveAs(OUT+'/'+d.suggestedFilename());});
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
for(const t of ['اللوح PDF','اللوح PNG','اللوح SVG','اللوح DXF']){await pg.evaluate(t=>{const b=[...document.querySelectorAll('#p-export button')].find(x=>x.textContent.trim()===t); b&&b.click();},t); await pg.waitForTimeout(1800);}
await pg.evaluate(()=>__lsv.ev("document.querySelector('#p-export button')&&0")); console.log(er.slice(0,3), fs.readdirSync(OUT)); await b.close();})();
