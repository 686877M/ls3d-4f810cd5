// usage: node shots.js <index.test.html> <outdir> [setupJS]  -- screenshot default view of every tab type
const L=require('./lib.js'), fs=require('fs');
(async()=>{const out=process.argv[3]; fs.mkdirSync(out,{recursive:true});
 const {b,p,E,errs}=await L.open('file://'+process.argv[2]);
 if(process.argv[4]){ await E(process.argv[4]); await p.waitForTimeout(4000); }
 const info={}; const cdp=await p.context().newCDPSession(p);
 const types=await E("JSON.stringify(Object.keys(WTYPES))").then(JSON.parse);
 for(const t of types){
  console.log('tab',t,Date.now()); try{ await E(`wtNew('${t}');1`); await p.waitForTimeout(3500);
   info[t]=await E(`JSON.stringify({root:root.children.length,parts:Object.keys(parts).length,tpl:DATA.tpl||null,act:ACT.length,rvEls:RV.els.length})`).then(JSON.parse);
   const r=await cdp.send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(out+'/'+t+'.png',Buffer.from(r.data,'base64')); }catch(e){ info[t]='ERR '+String(e.message).slice(0,120); }
 }
 fs.writeFileSync(out+'/info.json',JSON.stringify({info,errs},null,1)); console.log(JSON.stringify(info),errs.length); await b.close();})();
