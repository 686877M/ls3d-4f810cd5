// usage: node shots2.js <index.test.html> <outdir> <tpl1,tpl2,...>   one R.X + one S.X + one N.X shot after each template switch ('default' = no switch)
const L=require('./lib.js'), fs=require('fs');
(async()=>{ const out=process.argv[3]; fs.mkdirSync(out,{recursive:true});
 const {b,p,E,errs}=await L.open('file://'+process.argv[2],{wait:8000}); const cdp=await p.context().newCDPSession(p); let n=0;
 for(const id of process.argv[4].split(',')){ n++;
  if(id!=='default'){ await E("tpNew('"+id+"',{download:false});1"); await p.waitForTimeout(3500); }
  for(const t of ['model','survey','coord']){ await E("wtNew('"+t+"');1"); await p.waitForTimeout(3000);
   const r=await cdp.send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(out+'/'+n+'_'+id+'_'+t+'.png',Buffer.from(r.data,'base64')); }
  console.log('shot',n,id); }
 console.log('errs',errs.length); await b.close();})();
