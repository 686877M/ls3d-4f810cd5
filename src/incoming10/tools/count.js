// deterministic counters: canvas width assignments (renderer.setSize) and WebGL draw calls (render cost) per phase
const {chromium}=require('playwright-core');
(async()=>{ const page=process.argv[2];
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1500,height:860}});
 await ctx.addInitScript(()=>{ try{sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-hub','1');localStorage.setItem('xto-test','1');}catch(e){}
  window.__c={w:0,d:0}; const pd=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'width'); Object.defineProperty(HTMLCanvasElement.prototype,'width',{get(){return pd.get.call(this)},set(v){ if(this.className!=='x'&&this.width>500)window.__c.w++; pd.set.call(this,v);},configurable:true});
  [WebGLRenderingContext,self.WebGL2RenderingContext].forEach(C=>{ if(!C)return; ['drawElements','drawArrays'].forEach(n=>{ const f=C.prototype[n]; C.prototype[n]=function(){ window.__c.d++; return f.apply(this,arguments); }; }); }); });
 const pg=await ctx.newPage(); await pg.goto('file://'+page,{waitUntil:'domcontentloaded',timeout:120000});
 await pg.waitForFunction(()=>window.__lsv&&document.querySelectorAll('#xTabs button').length>3,{timeout:120000}); await pg.waitForTimeout(3000);
 const g=()=>pg.evaluate(()=>({...window.__c,hid:document.hidden})); const a=await g();
 await pg.waitForTimeout(4000); const a2=await g();
 await pg.waitForTimeout(10000); const c1=await g(); await pg.waitForTimeout(5000); const c2=await g();
 console.log(JSON.stringify({startup:a,idle0_4s_draws:a2.d-a.d,deepIdle5s_draws:c2.d-c1.d,hidden:a.hid})); await b.close(); })();
