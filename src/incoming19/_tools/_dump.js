const {chromium}=require('playwright-core'),fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1500,height:860}});
 await ctx.addInitScript(()=>{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');sessionStorage.setItem('xto-intro-seen','1');});
 const pg=await ctx.newPage(),er=[];pg.on('pageerror',x=>er.push(x.message));
 await pg.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:120000});await pg.waitForTimeout(8000);
 const has=await pg.evaluate(()=>({lsv:typeof __lsv, ev:typeof (window.__lsv&&__lsv.ev), tox:typeof window.TOX, api:window.TOX?Object.keys(window.TOX).slice(0,40):null}));
 
 const D=await pg.evaluate(()=>__lsv.ev(`(()=>{const o={};
  o.XC=Object.keys(XC).map(k=>[k,XC[k].stub?1:0,(XC[k].en||XC[k].n||'')]);
  o.XDESC=Object.fromEntries(Object.keys(XDESC).map(k=>[k,XDESC[k][0]]));
  o.RIBM=RIBM; o.RIBP=Object.fromEntries(Object.keys(RIBP).map(t=>[t,{dflt:RIBP[t].dflt,built:RIBP[t].built,tot:RIBP[t].tot,tabs:RIBP[t].tabs.map(x=>[x[0],x[1][0],x[2].map(g=>[g[0][0],g[1]])])}]));
  o.RIB=RIB.map(t=>[t[0],t[1][0],t[2].map(g=>[g[0][0],g[1]])]);
  o.WTYPES=Object.fromEntries(Object.keys(WTYPES).map(k=>[k,WTYPES[k].n[0]]));
  try{o.TEMPLATES=Object.keys(TEMPLATES);}catch(e){o.TEMPLATES=String(e)}
  try{o.FLOWS=Object.keys(FLOWS||{})}catch(e){}
  try{o.XALIAS=Object.keys(XALIAS).length}catch(e){}
  return JSON.stringify(o);})()`));
 fs.writeFileSync(process.argv[3],D); console.log(D.length,er.slice(0,3));
 await b.close();
})();
