const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{if(m.type()==='error')er.push('C:'+m.text().slice(0,150));});
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(5000);
await E("TM.me.name='Ali'; tmVersion('v1'); P.t=(+P.t||.4)+.05; persist(); tmVersion('v2'); tmSave()");
console.log('vers',await E("tmT().vers.length"),'t',await E("P.t.toFixed(2)"));
await E("tmRoll(tmT().vers[0])"); console.log('after rollback t',await E("P.t.toFixed(2)"),'vers',await E("tmT().vers.length"));
console.log('search',JSON.stringify(await E("tmSearch('rfi').concat(tmSearch('flot')).slice(0,4).map(r=>r.g+':'+r.t)")));
await E("TM.teams.push({id:'tB',name:'Team B',members:[],vers:[],log:[]}); tmSwitch('tB')"); await pg.waitForTimeout(800);
console.log('team',await E("TM.cur"),'log',await E("tmT().log.length"));
for(const t of ['teams','vers','log','live','find']){ await E("TM.tab='"+t+"'; wxOpen('team',[.1,.06,.56,.88]); tmPanel();"); await pg.waitForTimeout(100);} await pg.screenshot({path:'/tmp/tm.png'});
/* live via BroadcastChannel with 2nd page */
const pg2=await ctx.newPage(); pg2.on('pageerror',x=>er.push('p2:'+x.message)); await pg2.goto('file:///tmp/ls_index.html'); await pg2.waitForTimeout(5000);
await E("TM.live.on=false; tmLiveOn()"); await pg2.evaluate(()=>__lsv.ev("TM.me.role='owner'; TM.live.follow=true; tmLiveOn()"));
await E("P.t=.77; tmLiveSend(true)"); await pg2.waitForTimeout(800); console.log('peer got t',await pg2.evaluate(()=>__lsv.ev("P.t.toFixed(2)")));
const rtc=await E("(async()=>{ await tmOffer(); return (TM.live.code||'').length; })()"); console.log('rtc offer len',rtc);
console.log('ERR',er.slice(0,6)); await b.close();})();
