const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1700,height:980}});
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(4500);
console.log(await pg.evaluate(()=>__lsv.ev(`(()=>{const t=(f,n)=>{const a=performance.now(); for(let i=0;i<n;i++)f(); return +((performance.now()-a)/n).toFixed(1);}; return JSON.stringify({render:t(()=>renderer.render(scene,camera),5),meshes:(()=>{let m=0,v=0; scene.traverse(o=>{if(o.isMesh)m++; if(o.visible)v++;}); return [m,v];})(),calls:renderer.info.render.calls,tris:renderer.info.render.triangles,tlRender:t(()=>tlRender(),3),spFrame:t(()=>spFrame(),20),followFrame:t(()=>followFrame(.016),20),nav:t(()=>navView(1,.8,1),20)})})()`)));
await b.close();})();
