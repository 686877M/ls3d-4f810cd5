
const {chromium}=require('playwright-core'); const fs=require('fs');
const OUT=process.argv[2]; fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const b=await chromium.launch({executablePath:'/Users/M7/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-x64/chrome-headless-shell',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({acceptDownloads:true,viewport:{width:1500,height:950}}); const pg=await ctx.newPage();
 const got=[]; pg.on('download',async d=>{const n=d.suggestedFilename(); try{await d.saveAs(OUT+'/'+n); got.push(n);}catch(e){}});
 await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3500);

 const clickTxt=async(sel,txts)=>{for(const t of txts){await pg.evaluate(([sel,t])=>{const b=[...document.querySelectorAll(sel+' button')].find(x=>x.textContent.trim()===t||x.textContent.trim().startsWith(t)); if(b)b.click();},[sel,t]); await pg.waitForTimeout(900);}};
 await clickTxt('#p-sec',['A–A (Z = 0)']);
 await clickTxt('#p-export',['PDF','SVG','DXF 2D','DXF 3D','IFC','OBJ','Excel','الكميات (CSV)','اللوح PDF','اللوح PNG','اللوح SVG','اللوح DXF']);
 await clickTxt('#p-bom',['حفظ المشروع']);
 await clickTxt('#p-fam',['تصدير العائلات']);
 await pg.evaluate(()=>__lsv.ev('p6Show(true)')); await pg.waitForTimeout(800);
 await clickTxt('#p6win',['XER','MS Project XML','XLSX','CSV','SVG','PNG','PDF']);
 await pg.waitForTimeout(2500);
 await pg.screenshot({path:OUT+'/_p6.png'});
 console.log(JSON.stringify(got));
 await b.close();
})();
