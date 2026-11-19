const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2]}); const pg=await b.newPage({viewport:{width:1100,height:1000}}); await pg.goto('file://'+process.argv[3]); await pg.screenshot({path:process.argv[4]}); await b.close();})();
