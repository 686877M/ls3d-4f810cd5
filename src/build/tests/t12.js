const {chromium}=require('playwright-core'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1400,height:850}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|')));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
const r=await pg.evaluate(()=>__lsv.ev(`(()=>{const q=boq(); const it=getItems(); return JSON.stringify({P:{t:P.t,tB:P.tB,tT:P.tT,tCW:P.tCW,tCF:P.tCF,tCT:P.tCT},rows:q.rows.map(r=>[r[0],+r[1].toFixed(2)]),conc:+q.conc.toFixed(1),exc:+q.exc.toFixed(1),total:TOTAL,codes:it.slice(0,6).map(x=>x.code+':'+x.typ+':'+x.qty)})})()`));
console.log(r,er); await pg.screenshot({path:'/tmp/model.png'}); await b.close();})();
