const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1400,height:850}}); const er=[]; pg.on('pageerror',x=>er.push(x.stack.split('\n').slice(0,3).join('|')));
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(3000);
await pg.evaluate(()=>__lsv.ev("tab('meas')")); await pg.waitForTimeout(500);
// find screen points over meshes by projecting group centers
const pts=await pg.evaluate(()=>__lsv.ev(`(()=>{const o={}; const r=renderer.domElement.getBoundingClientRect(); const ids=['pump','wwall','cwalls','pheader','bends']; ids.forEach(id=>{const g=(parts[id]||[])[0]; if(!g)return; const bb=new T.Box3().setFromObject(g), c=bb.getCenter(new T.Vector3()).project(camera); o[id]=[(c.x+1)/2*r.width+r.left,(1-c.y)/2*r.height+r.top];}); return o;})()`));
console.log(JSON.stringify(pts));
const click=async(p)=>{await pg.mouse.move(p[0],p[1]); await pg.mouse.down(); await pg.mouse.up(); await pg.waitForTimeout(150);};
await click(pts.pump); 
const r1=await pg.evaluate(()=>__lsv.ev('JSON.stringify(MSR.list[0]&&MSR.list[0].rows)')); console.log('obj',r1);
await pg.evaluate(()=>__lsv.ev("MSR.mode='dist'")); await click(pts.pump); await click([pts.pump[0]+60,pts.pump[1]-30]); console.log('npts',await pg.evaluate(()=>__lsv.ev('MSR.pts.length+"/"+MSR.list.length')));
console.log('dist',await pg.evaluate(()=>__lsv.ev('JSON.stringify(MSR.list[0].rows.slice(0,3))')));
await pg.evaluate(()=>__lsv.ev("MSR.mode='between';MSR.objs=[]")); await click(pts.pump); await click([pts.pump[0]+60,pts.pump[1]-30]);
console.log('between',await pg.evaluate(()=>__lsv.ev('JSON.stringify(MSR.list[0].rows.slice(2,4))')));
await pg.evaluate(()=>__lsv.ev("MSR.mode='circle';MSR.pts=[]")); 
const circ=await pg.evaluate(()=>__lsv.ev(`(()=>{const A=new T.Vector3(1,0,0),B=new T.Vector3(0,0,1),C=new T.Vector3(-1,0,0); MSR.pts=[A,B,C]; measPts(); return JSON.stringify(MSR.list[0].rows.slice(0,3))})()`)); console.log('circle(R=1 expected)',circ);
await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/meas.png'}); console.log(er.slice(0,3)); await b.close();})();
