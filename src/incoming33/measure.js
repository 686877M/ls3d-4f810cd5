// start-up cost: node measure.js <file://url> [runs] [--prof chunkmap.json]
const pw=require('playwright-core');const fs=require('fs');const CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const url=process.argv[2],runs=+(process.argv[3]||3);const pi=process.argv.indexOf('--prof');
 const b=await pw.chromium.launch({executablePath:CH});const out=[];
 for(let r=0;r<runs;r++){const c=await b.newContext({viewport:{width:1400,height:850}});
  await c.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}
   window.__m={scripts:[],long:0,longN:0};
   const ap=Node.prototype.appendChild;Node.prototype.appendChild=function(n){if(n&&n.tagName==='SCRIPT'&&n.text&&n.text.length>50000){const t=performance.now();const x=ap.call(this,n);window.__m.scripts.push([n.text.length,+(performance.now()-t).toFixed(1)]);return x;}return ap.call(this,n);};
   try{new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__m.long+=e.duration;window.__m.longN++;}}).observe({entryTypes:['longtask']});}catch(e){}});
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  let cdp=null;if(pi>0&&r===runs-1){cdp=await c.newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');}
  await p.goto(url);await p.waitForTimeout(5000);
  const m=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return Object.assign({dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):0,xg:window.__xgRan||null},window.__m);});
  m.long=Math.round(m.long);m.errs=errs.slice(0,3);out.push(m);console.log(JSON.stringify(m));
  if(cdp){const pr=(await cdp.send('Profiler.stop')).profile;const map=JSON.parse(fs.readFileSync(process.argv[pi+1],'utf8'));// [[startLine,name],...] of the big script, 0-based
   const dt=pr.timeDeltas,self={};const byId={};pr.nodes.forEach(n=>byId[n.id]=n);pr.samples.forEach((id,i)=>{self[id]=(self[id]||0)+(dt[i]||0);});
   const agg={};let mainId=null,mx=0;pr.nodes.forEach(n=>{if(n.callFrame.lineNumber>mx){mx=n.callFrame.lineNumber;mainId=n.callFrame.scriptId;}});for(const id in self){const f=byId[id].callFrame;let k=f.functionName&&/^\(/.test(f.functionName)?f.functionName:'(other)';if(f.url===''||/index/.test(f.url)){const big=f.url===""&&f.lineNumber>60;if(big){k="(base page)";for(const [ln,nm] of map){if(f.lineNumber>=ln)k=nm;else break;}}}agg[k]=(agg[k]||0)+self[id]/1000;}
   console.log('PROFILE self ms by chunk (top 40):');Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,40).forEach(([k,v])=>console.log(v.toFixed(0).padStart(6)+' '+k));}
  await c.close();}
 const med=k=>out.map(o=>o[k]).sort((a,b)=>a-b)[Math.floor(out.length/2)];const big=out.map(o=>Math.max(...o.scripts.map(s=>s[1]))).sort((a,b)=>a-b)[Math.floor(out.length/2)];
 console.log('MEDIAN mainScript(ms)='+big+' dcl='+med('dcl')+' load='+med('load')+' longtask(ms)='+med('long')+' heapMB='+med('heap'));await b.close();})();
