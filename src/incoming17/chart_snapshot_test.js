/* Chart renderer snapshot test (Q.X qxChartSvg + O.X chartSvg + exported dashboard HTML).
   NODE_PATH=<SP>/pw/node_modules node chart_snapshot_test.js <index.test.html> --record   -> writes chart_snapshot.golden.json (run on the PRE-merge build)
   NODE_PATH=... node chart_snapshot_test.js <index.test.html>                              -> compares against the golden
   Per case: full SVG string hash (raw) + structure (tag counts, text labels, fill/stroke colours, viewBox). Cases marked rtl compare structure only
   (the merge may add direction attributes to Arabic text; Latin text must stay byte-identical). */
const {chromium}=require('playwright-core'), fs=require('fs'), path=require('path'), crypto=require('crypto');
const page=process.argv[2], rec=process.argv.includes('--record'), chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', G=path.join(__dirname,'chart_snapshot.golden.json');
let pass=0, fail=0; const ok=(n,g,e)=>{ const x=JSON.stringify(g)===JSON.stringify(e); x?pass++:fail++; console.log((x?'ok   ':'FAIL ')+n+(x?'':'  -> got '+JSON.stringify(g)+' expected '+JSON.stringify(e))); };
const AR=['مواسير','خرسانة','حديد','تشطيبات'];
const QC=[]; const lat=['Pipes','Concrete','Steel','Finish','Cable','Pump'], v1=[120,80,45.5,10,0,33], v2=[30,60,15,5,12,8], v3=[1e6,2.5e6,3e5,4e4,9e3,500];
const S1=[{name:'S1',vals:v1}], S3=[{name:'Cost',vals:v1},{name:'Qty',vals:v2},{name:'Big',vals:v3}];
['bar','stacked','line','scurve','pie'].forEach(t=>{ QC.push({id:'q-'+t+'-1s',t,c:lat,s:S1,o:{}}); QC.push({id:'q-'+t+'-3s-title',t,c:lat,s:S3,o:{title:'Cost by <Cat> & "x"'}}); QC.push({id:'q-'+t+'-size',t,c:lat.slice(0,3),s:S1,o:{w:520,h:280,title:'t'}}); });
QC.push({id:'q-bar-neg',t:'bar',c:lat.slice(0,4),s:[{name:'N',vals:[-5,10,-20,3]}],o:{}},{id:'q-line-30',t:'line',c:Array.from({length:30},(_,i)=>'C'+i),s:[{name:'A',vals:Array.from({length:30},(_,i)=>i*i%17)}],o:{}},{id:'q-pie-12',t:'pie',c:Array.from({length:12},(_,i)=>'P'+i),s:[{name:'A',vals:Array.from({length:12},(_,i)=>i+1)}],o:{}},{id:'q-pie-zero',t:'pie',c:['a','b'],s:[{name:'A',vals:[0,0]}],o:{}},{id:'q-pie-one',t:'pie',c:['a'],s:[{name:'A',vals:[5]}],o:{}},{id:'q-empty',t:'bar',c:[],s:[],o:{}},{id:'q-9series',t:'bar',c:['a','b'],s:Array.from({length:9},(_,i)=>({name:'s'+i,vals:[i+1,2]})),o:{}});
['bar','stacked','line','pie'].forEach(t=>QC.push({id:'q-'+t+'-ar',t,c:AR,s:[{name:'تكلفة',vals:[4,3,2,1]},{name:'كمية',vals:[1,2,3,4]}],o:{title:'التكلفة حسب الفئة'},rtl:true}));
const OC=[]; ['column','line','pie'].forEach(t=>{ OC.push({id:'o-'+t,spec:{type:t,rng:'A1:B4',title:t+' A1:B4'},cells:{A1:'a',B1:'10',A2:'b',B2:'20',A3:'c',B3:'30',A4:'d',B4:'40'}}); OC.push({id:'o-'+t+'-neg',spec:{type:t,rng:'A1:B3',title:'x & <y>'},cells:{A1:'long label here',B1:'-5',A2:'b',B2:'7.5',A3:'c',B3:'1234.5678'}}); OC.push({id:'o-'+t+'-one',spec:{type:t,rng:'A1:B1'},cells:{A1:'a',B1:'9'}}); OC.push({id:'o-'+t+'-ar',spec:{type:t,rng:'A1:B3',title:'مخطط'},cells:{A1:'مواسير',B1:'3',A2:'خرسانة',B2:'4',A3:'حديد',B3:'5'},rtl:true}); });
OC.push({id:'o-many',spec:{type:'column',rng:'A1:B15'},cells:Object.fromEntries(Array.from({length:15},(_,i)=>[['A'+(i+1),'k'+i],['B'+(i+1),String((i*7)%11+1)]]).flat())},{id:'o-multi-col',spec:{type:'column',rng:'A1:C3'},cells:{A1:'a',B1:'1',C1:'5',A2:'b',B2:'2',C2:'6',A3:'c',B3:'3',C3:'7'}},{id:'o-nonum',spec:{type:'column',rng:'A1:A2'},cells:{A1:'a',A2:'b'}});
const sig=s=>{ const tags={}; (s.match(/<(\w+)[\s>\/]/g)||[]).forEach(t=>{ t=t.slice(1,-1).replace(/[\s>\/]/g,''); tags[t]=(tags[t]||0)+1; }); const texts=[...s.matchAll(/<(?:text|title)[^>]*>(.*?)<\/(?:text|title)>/g)].map(m=>m[1].replace(/<[^>]*>/g,'')); const cols=[...new Set([...s.matchAll(/(?:fill|stroke)="([^"]+)"/g)].map(m=>m[1]))].sort(); const vb=(s.match(/viewBox="([^"]+)"/)||[])[1]||null; return {tags,texts,cols,vb}; };
const h=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,16);
(async()=>{ const b=await chromium.launch({executablePath:chrome}); const ctx=await b.newContext({viewport:{width:1400,height:860}});
 await ctx.addInitScript(()=>{ try{ sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept(d.type()==='prompt'?d.defaultValue():undefined)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await pg.goto('file://'+path.resolve(page),{waitUntil:'domcontentloaded',timeout:240000}); await pg.waitForTimeout(6000);
 ok('page loads without script error',er.slice(0,3),[]);
 const out={}; const add=(id,s,rtl)=>{ out[id]={raw:h(s),sig:sig(s),rtl:!!rtl,len:s.length}; };
 for(const c of QC){ const s=await E("QX.api.chart("+JSON.stringify(c.t)+","+JSON.stringify(c.c)+","+JSON.stringify(c.s)+","+JSON.stringify(c.o)+")"); add(c.id,s,c.rtl); }
 await E("XC.o_sheet.run()"); await pg.waitForTimeout(1500);
 for(const c of OC){ const s=await E("(()=>{ const o=oD(); o.cells="+JSON.stringify(c.cells)+"; return P2OFF.chartSvg("+JSON.stringify(c.spec)+"); })()"); add(c.id,s,c.rtl); }
 /* in-app O.X chart through the ribbon (shCh box) */
 await E("(()=>{ const o=oD(); o.cells={A1:'a',B1:'10',A2:'b',B2:'20'}; P2OFF.O().charts=[{type:'column',rng:'A1:B2',title:'t'},{type:'pie',rng:'A1:B2',title:'p'}]; shGrid(); return 1; })()"); await pg.waitForTimeout(500);
 const inapp=await pg.evaluate(()=>[...document.querySelectorAll('#shCh svg')].map(s=>[s.getAttribute('class'),s.dataset.type,s.querySelectorAll('rect,path.sl').length])); out['o-inapp']={inapp};
 /* exported dashboard HTML runs the same renderer */
 const D={title:'T',head:['Cat','Val','Src'],rows:[['A',5,'x'],['B',7,'y'],['C',2,'x'],['A',1,'y']],cat:'Cat',val:'Val',slicers:['Src'],charts:['bar','pie','line','stacked','scurve','count'],note:'n'};
 const html=await E("QX.dashFile("+JSON.stringify(D)+",{sel:{}},false)"), inapp2=await E("QX.api.dash("+JSON.stringify(D)+",{sel:{}})");
 out['dash-app']={raw:h(inapp2),svgs:(inapp2.match(/<svg /g)||[]).length,sig:sig(inapp2)};
 const p2=await ctx.newPage(), er2=[]; p2.on('pageerror',x=>er2.push(x.message)); await p2.setContent(html); await p2.waitForTimeout(300);
 const dashSvg=await p2.evaluate(()=>[...document.querySelectorAll('svg.qxch')].map(s=>s.outerHTML.length)), dashHtml=await p2.evaluate(()=>document.getElementById('d').innerHTML);
 out['dash-file']={svgs:dashSvg.length,errs:er2,htmlSig:sig(dashHtml)}; ok('exported dashboard HTML renders with no script error',er2,[]);
 await b.close();
 if(rec){ fs.writeFileSync(G,JSON.stringify(out,null,1)); console.log('recorded',Object.keys(out).length,'cases ->',G); return; }
 const g=JSON.parse(fs.readFileSync(G,'utf8'));
 for(const k of Object.keys(g)){ const a=out[k], e=g[k]; if(!a){ ok(k+' present',false,true); continue; }
  if(e.sig){ ok(k+' structure (tags, labels, colours, viewBox)',a.sig,e.sig); if(!e.rtl&&e.raw!==undefined&&k!=='dash-file')ok(k+' byte-identical',a.raw,e.raw); }
  else ok(k,a,e); if(k==='dash-file'){ ok('dash-file svg count',a.svgs,e.svgs); } if(k==='dash-app')ok('dash app svg count',a.svgs,e.svgs); }
 ok('dashboard file chart count equals in-app',out['dash-file'].svgs,out['dash-app'].svgs);
 console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
