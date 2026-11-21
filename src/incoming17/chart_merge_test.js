/* Post-merge checks (use with the merged build; on the pre-merge build the first checks fail by design).
   NODE_PATH=<SP>/pw/node_modules node chart_merge_test.js <index.test.html> */
const {chromium}=require('playwright-core'), path=require('path');
let pass=0, fail=0; const ok=(n,g,e)=>{ const x=JSON.stringify(g)===JSON.stringify(e); x?pass++:fail++; console.log((x?'ok   ':'FAIL ')+n+(x?'':'  -> got '+JSON.stringify(g)+' expected '+JSON.stringify(e))); };
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}); const ctx=await b.newContext({viewport:{width:1400,height:860}});
 await ctx.addInitScript(()=>{ try{ sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await pg.goto('file://'+path.resolve(process.argv[2]),{waitUntil:'domcontentloaded',timeout:240000}); await pg.waitForTimeout(6000);
 ok('no script error',er.slice(0,3),[]);
 ok('toxChartSvg exposed on window (Render Studio / vector export can call it)',await pg.evaluate(()=>typeof window.toxChartSvg),'function');
 ok('Q.X qxChartSvg is the shared function',await E("qxChartSvg===toxChartSvg&&QX.api.chart===toxChartSvg"),true);
 ok('O.X chartSvg goes through the shared function',await E("P2OFF.chartSvg.toString().includes('toxChartSvg')"),true);
 const ar=await E("toxChartSvg('bar',['مواسير','Steel'],[{name:'تكلفة',vals:[3,4]},{name:'Qty',vals:[1,2]}],{title:'عنوان'})");
 ok('Arabic labels carry direction=ltr, Latin ones do not',[(ar.match(/direction="ltr"/g)||[]).length>=3,/<text[^>]*direction="ltr"[^>]*>Steel/.test(ar)],[true,false]);
 /* anchor check in an RTL page: the Arabic legend text must start at its x (8+14=22), not end there */
 const bb=await pg.evaluate(async()=>{ const d=document.createElement('div'); d.setAttribute('dir','rtl'); d.style.cssText='position:fixed;left:0;top:0;width:700px;background:#fff'; d.innerHTML=toxChartSvg('bar',['a','b'],[{name:'تكلفة طويلة جدا',vals:[3,4]},{name:'Qty',vals:[1,2]}],{title:'عنوان'}); document.body.appendChild(d); const t=[...d.querySelectorAll('text')].find(x=>x.textContent==='تكلفة طويلة جدا'); const r=[+t.getAttribute('x'),t.getBBox().x]; d.remove(); return r; });
 ok('RTL page: Arabic legend text starts at its x (bbox.x == x)',Math.abs(bb[1]-bb[0])<1,true);
 const html=await E("QX.dashFile({title:'T',head:['C','V'],rows:[['a',1]],cat:'C',val:'V',slicers:[],charts:['bar'],note:''},{sel:{}},false)");
 ok('exported dashboard embeds the shared renderer once, not a second copy',[(html.match(/function toxChartSvg/g)||[]).length,html.includes('function qxChartSvg')],[1,false]);
 /* the O.X data can also be drawn with the full Q.X look (path to retire the flat look later) */
 const rich=await E("toxChartSvg('bar',['a','b','c'],[{name:'',vals:[1,2,3]}],{palette:['#4e79a7']})");
 ok('palette option replaces the CSS variables',[/var\(--qs1\)/.test(rich),/#4e79a7/.test(rich)],[false,true]);
 console.log('\n'+pass+' passed, '+fail+' failed'); await b.close(); process.exit(fail?1:0); })();
