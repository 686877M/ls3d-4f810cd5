const {chromium}=require('playwright-core'); const fs=require('fs');
(async()=>{const e=process.argv[2]; const b=await chromium.launch({executablePath:e,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
const r=await pg.evaluate(()=>__lsv.ev(`(()=>{const k=Object.keys(P).find(x=>typeof P[x]==='number'); const v0=P[k]; P[k]=v0+0.2; persist(); rebuild(); const t1=TOTAL; hiGo(-1); const back=P[k]; hiGo(1); const fwd=P[k]; return {k,v0,back,fwd,steps:HI.st.length,total:t1,exc:ACT.find(a=>a.id==='A2').q}})()`));
console.log(JSON.stringify(r),er.slice(0,3)); await b.close();})();
