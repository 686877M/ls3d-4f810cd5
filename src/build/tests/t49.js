const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:900}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{if(m.type()==='error')er.push('C:'+m.text().slice(0,150));});
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(5000);
console.log('asce',JSON.stringify(await E("(()=>{const E=SIM.eq; const s=simSpecASCE(E,0.5); const b=simBaseShear(E,'asce'); return {Fa:s.Fa,Fv:s.Fv,SDS:+s.SDS.toFixed(3),SD1:+s.SD1.toFixed(3),Sa05:+s.Sa.toFixed(3),T:+b.T.toFixed(3),Cs:+b.Cs.toFixed(4),V:+b.V.toFixed(0)};})()")));
console.log('ec',JSON.stringify(await E("(()=>{const E=Object.assign({},SIM.eq,{ag:.15,gt:'C',ec:'t1',q:3.9}); const e=simSpecEC(E,0.5,false), d=simSpecEC(E,0.5,true), b=simBaseShear(E,'ec'); return {Se:+e.Sa.toFixed(4),Sd:+d.Sa.toFixed(4),T:+b.T.toFixed(3),V:+b.V.toFixed(0),lam:b.lam};})()")));
console.log('class',await E("simClassASCE(300,25,80)+' '+simClassEC8(300,25,80)+' '+simClassASCE(900,60,300)+' '+simClassEC8(150,10,50)"));
console.log('liq',JSON.stringify(await E("(()=>{const L=simLiq(SIM.lq); return {csr:+L.csr.toFixed(3),crr:+L.crr.toFixed(3),fs:+L.fs.toFixed(2)};})()")));
console.log('wind',JSON.stringify(await E("(()=>{const P=simWindP(SIM.wd); return {qh:Math.round(P.qh),Kh:+P.Kzh.toFixed(3),cl:P.cl,ww:Math.round(P.rows[P.rows.length-1].w),lee:Math.round(P.lee),side:Math.round(P.side)};})()")));
const t0=Date.now(); const w=await E("(()=>{const r=simWeather(SIM.wx); return {m:r.mo.map(o=>+o.T.toFixed(1)).join(','),g:r.mo.map(o=>+o.G.toFixed(2)).join(','),hdd:Math.round(r.hdd),cdd:Math.round(r.cdd),gy:Math.round(r.gy)};})()"); console.log('weather',JSON.stringify(w),(Date.now()-t0)+'ms');
await E("SIM.rose=simRose(SIM.rw)"); console.log('rose',await E("SIM.rose.prev+' '+SIM.rose.mean.toFixed(2)"));
for(const t of ['wind','eq','en','gr']){ await E("ENV.tab='"+t+"'; wxOpen('env',[.05,.03,.6,.92]); SIM.wx.res=simWeather(SIM.wx); envPanel();"); await pg.waitForTimeout(250); await pg.screenshot({path:'/tmp/sim_'+t+'.png'}); }
console.log('ERR',er.slice(0,6)); await b.close();})();
