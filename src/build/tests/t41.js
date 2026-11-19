const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{if(m.type()==='error')er.push('C:'+m.text().slice(0,160));});
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(5000);
console.log('ERR0',er.slice(0,5));
const ok=await pg.evaluate(()=>typeof __lsv!=='undefined'); console.log('lsv',ok); if(!ok){await b.close(); return;}
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
console.log('init',JSON.stringify(await E("({tabs:WTAB.tabs.map(t=>t.type),cur:WTAB.cur,bar:document.querySelectorAll('#xDocTabs .dt').length})")));
await pg.screenshot({path:'/tmp/s0.png'});
await E("wtNew('survey')"); await pg.waitForTimeout(700); await pg.screenshot({path:'/tmp/s1.png'});
console.log('dc',JSON.stringify(await E("(()=>{ const d=dcAdd({type:'RFI',dir:'out',subject:'Test RFI',from:'Contractor',to:'Consultant',body:'Q?',act:'A2',status:'rej'}); const c=dcTndCalc(); const R=dcFeasCalc({rev:100000,opex:20000,life:20,rate:8},500000); const B=dcBearing({c:0,phi:30,gam:18,B:2,Df:1.5,fs:3,shape:'square'}); return {ref:d.ref,rows:c.rows.length,total:c.total,npv:Math.round(R.npv),irr:R.irr,qu:Math.round(B.qu),nq:B.Nq}; })()")));
for(const t of ['reg','new','tnd','fs','ipc','soil','rep','file','crm','gl']){ await E("dcOpen('"+t+"')"); await pg.waitForTimeout(120);} 
await E("dcOpen('reg')"); await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/s2.png'});
await E("wxOpen('soc',[.5,.05,.48,.9]); socPanel();"); await pg.waitForTimeout(400); await pg.screenshot({path:'/tmp/s3.png'});
console.log('card',JSON.stringify(await E("(()=>{const c=socCard(); return [c.width,c.height];})()")));
console.log('sun',JSON.stringify(await E("(()=>{const a=sunPos(24.7136,46.6753,3,'2026-06-21',12), w=sunPos(24.7136,46.6753,3,'2026-12-21',12), q=sunPos(51.5,0,0,'2026-03-20',12); return {jun:a.el.toFixed(1),dec:w.el.toFixed(1),lon:q.el.toFixed(1),rise:eHM(a.rise),len:a.len.toFixed(1)};})()")));
console.log('wind',JSON.stringify(await E("(()=>{const sp=[],dr=[]; for(let i=0;i<1000;i++){sp.push(5);dr.push(270);} const r=windRose(sp,dr); return {prev:r.prev,mean:r.mean,n:r.n,Kz:envKz(10,'C').toFixed(3),qz:(.613*envKz(10,'C')*.85*40*40).toFixed(0)};})()")));
console.log('eq',JSON.stringify(await E("(()=>{ENV.sds=.6;ENV.sd1=.3;ENV.R=5;ENV.Ie=1;ENV.Wt=10000;ENV.h=10;ENV.sys='conc';const c=envCs(); return {Ta:c.Ta.toFixed(3),Cs:c.Cs.toFixed(4),V:c.V.toFixed(0)};})()")));
console.log('dewater',JSON.stringify(await E("(()=>{const d=envDewater(); return {R:d.R.toFixed(1),Q:(d.Q*1000).toFixed(2)};})()")),'uscs',await E("envUSCS()"));
for(const t of ['sun','wind','eq','en','gr','sat','qc']){ await E("ENV.tab='"+t+"'; wxOpen('env',[.08,.05,.62,.9]); envPanel();"); await pg.waitForTimeout(150); if(t==='sun')await pg.screenshot({path:'/tmp/s4.png'}); }
for(const t of ['pulse','cal','tg','col','rep','ast','life']){ await E("CT.tab='"+t+"'; wxOpen('ctrl',[.06,.05,.66,.9]); ctPanel();"); await pg.waitForTimeout(150); if(t==='pulse')await pg.screenshot({path:'/tmp/s5.png'}); }
console.log('pulse',JSON.stringify(await E("(()=>{const P=ctPulse(); return {n:P.items.length,top:P.items.slice(0,3).map(i=>i.t),ready:P.ready,bl:P.blockers};})()")));
console.log('ics',(await E("ctIcs(ctEvents()).split('BEGIN:VEVENT').length-1")));
/* telegram mock */
await pg.route('https://api.telegram.org/**',async route=>{ const u=route.request().url(); const body=route.request().postDataJSON()||{}; if(u.includes('getUpdates'))return route.fulfill({json:{ok:true,result:[{update_id:5,message:{chat:{id:777},from:{first_name:'Ali'},text:'/rfi Clarify pump base level'}},{update_id:6,message:{chat:{id:777},from:{first_name:'Ali'},text:'/handover'}}]}}); if(u.includes('sendMessage')){ global.sent=(global.sent||[]).concat(body.text); return route.fulfill({json:{ok:true,result:{}}}); } return route.fulfill({json:{ok:true,result:{}}}); });
await E("CT.tg.token='T';CT.tg.chat='777';CT.tg.on=true;tgPoll();"); await pg.waitForTimeout(800);
console.log('tg sent',JSON.stringify(global.sent),'docs',await E("DC.docs.filter(d=>d.from==='Ali').map(d=>d.ref+' '+d.type+' '+d.subject).join(' | ')"));
console.log('ERRORS',er.slice(0,8)); await b.close();})();
