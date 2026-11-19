const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:860}}); await ctx.addInitScript(()=>{try{localStorage.removeItem('xto-rv');localStorage.removeItem('xto-tabs');sessionStorage.setItem('xto-auth','1');sessionStorage.setItem('xto-intro-seen','1');sessionStorage.setItem('xto-splash','1');localStorage.setItem('xto-test','1');}catch(e){}});
const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept('Hall')); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
await E("wtNew('model')"); await pg.waitForTimeout(1500);
// place a 8x6 house 20 m away from the station using the same code paths as clicks
console.log(await E(`(()=>{ const ox=20, oz=0, P=(x,z)=>[ox+x,oz+z]; const add=(t,a,b)=>{ const o=RVX.two[t](a,b); o.id=rvId(); o.k=t; o.lv=0; RV.els.push(o); return o; };
 [[P(0,0),P(8,0)],[P(8,0),P(8,6)],[P(8,6),P(0,6)],[P(0,6),P(0,0)]].forEach(w=>RV.els.push({id:rvId(),k:'wall',a:w[0],b:w[1],h:3,t:.2,lv:0}));
 RV.els.push({id:rvId(),k:'floor',a:P(0,0),b:P(8,6),t:.2,lv:0});
 add('roof',P(0,0),P(8,6)); add('room',P(0,0),P(8,6)); add('beam',P(0,3),P(8,3)); add('stair',P(10,0),P(13,0)); add('ramp',P(10,3),P(16,3)); add('rail',P(10,5),P(14,5)); add('dim',P(0,-1),P(8,-1)); add('ceil',P(0,0),P(8,6)); add('fslab',P(0,0),P(8,6));
 const f=RVX.one.found(P(-2,-2)); f.id=rvId(); f.k='found'; f.lv=0; RV.els.push(f);
 rvChanged();
 const st=RV.els.find(e=>e.k==='stair'), rp=RV.els.find(e=>e.k==='ramp'), rf=RV.els.find(e=>e.k==='roof');
 return JSON.stringify({n:RV.els.length,meshes:RV.g.children.length,stair:RVX.info.stair(st),ramp:RVX.info.ramp(rp),roof:RVX.info.roof(rf),rows:RVX.rows()}); })()`));
await E("camera.position.set(34,14,22); controls.target.set(26,1,3); controls.update()"); await pg.waitForTimeout(1500); await pg.screenshot({path:'/tmp/rv3.png'});
console.log(JSON.stringify(await E("({built:RIBP.model.built,tot:RIBP.model.tot})")),er.slice(0,4)); await b.close();})();
