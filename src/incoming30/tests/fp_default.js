// usage: node fp_default.js <index.test.html> <out.json> : fingerprint + screenshots of the default boot (R.X and Start) for before/after identity
const L=require('./lib.js'), fs=require('fs'), crypto=require('crypto');
(async()=>{ const {b,p,E,errs}=await L.open('file://'+process.argv[2],{wait:8000}); const out={};
 await E("lang='en';1");
 out.state=JSON.parse(await E("JSON.stringify({tpl:DATA.tpl||null,title:DR.title,root:root.children.length,parts:Object.keys(parts).length,items:getItems().length,act:ACT.length,cap:cap.textContent,geo:geoD(),outs:OUTL.map(x=>x[0]),notes:notesReg().length,paneOff:TABS.filter(k=>{const e=document.getElementById('p-'+k);return e&&e.classList.contains('tpOff')}),siteVis:siteG.children.filter(c=>c.visible).length,sps:SPS.length,boq:boq().length||Object.keys(boq()).length})"));
 const tx=async()=>p.evaluate(()=>document.body.innerText.replace(/\d{1,2}:\d{2}(:\d{2})?/g,'T').replace(/\d{4}-\d{2}-\d{2}/g,'D'));
 out.textHash={}; const cdp=await p.context().newCDPSession(p);
 for(const t of ['start','model','survey','sched']){ await E("wtNew('"+t+"');1"); await p.waitForTimeout(3000); out.textHash[t]=crypto.createHash('sha1').update(await tx()).digest('hex').slice(0,12);
   const r=await cdp.send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(process.argv[3].replace('.json','_'+t+'.png'),Buffer.from(r.data,'base64')); }
 for(const k of ['views','edit','parts','anim','safety','sec','sheet','site','rebar']){ await E("tab('"+k+"');1"); await p.waitForTimeout(300); out.textHash['pane_'+k]=crypto.createHash('sha1').update(await p.evaluate(k=>document.getElementById('p-'+k).innerText,k)).digest('hex').slice(0,12); }
 out.errs=errs; fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1)); console.log('done',errs.length); await b.close();})();
