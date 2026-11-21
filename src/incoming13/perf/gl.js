/* lazy GL: nothing at start, real render after the model tab opens, canvas not blank. node gl.js <test.html> */
const path=require('path'), SP=process.env.SP;
const {chromium}=require(path.join(SP,'pw/node_modules/playwright-core'));
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1440,height:900}}); await ctx.addInitScript(()=>{ try{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');}catch(e){} });
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',e=>er.push(e.message));
 await pg.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000}); await pg.waitForTimeout(4000);
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 console.log('start: gl created =',await E("(()=>{ try{ return !!renderer.info&&renderer.info.render.frame>=0 }catch(e){return String(e)} })()"));
 console.log('start: canvas ctx? (dev check)',await pg.evaluate(()=>{ const c=document.querySelector('canvas[style*="display: block"]'); return c?c.width+'x'+c.height:'none'; }));
 await E("wtNew('model');0"); const t0=Date.now();
 await pg.waitForFunction(()=>{ try{ return __lsv.ev('renderer.info.render.frame')>2; }catch(e){return false;} },null,{timeout:300000,polling:300});
 console.log('model tab: frames rendered after',Date.now()-t0,'ms; calls',await E('renderer.info.render.calls'),'progs',await E('renderer.info.programs.length'));
 const px=await pg.evaluate(()=>{ const c=document.querySelector('canvas[style*="display: block"]'); const t=document.createElement('canvas'); t.width=c.width;t.height=c.height; return null; });
 const shot=await pg.screenshot({clip:{x:400,y:200,width:600,height:400}}); const buf=shot; const set=new Set(); for(let i=0;i<buf.length;i+=997)set.add(buf[i]); console.log('screenshot distinct bytes sample',set.size,'(blank would be few)');
 console.log('size applied',await E('renderer.domElement.width+"x"+renderer.domElement.height+" pr="+renderer.getPixelRatio()'),'errors',er.length,er.slice(0,2));
 await b.close();
})();
