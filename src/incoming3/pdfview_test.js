// Usage: NODE_PATH=<dir with playwright-core> node pdfview_test.js <site dir> [http://host:port/]   (site dir holds index.html + vendor/pdfjs; the chunk next to this file is injected into a temp copy)
const {chromium}=require('playwright-core'), fs=require('fs'), path=require('path');
const site=process.argv[2], base=process.argv[3]||('file://'+site+'/'), chunk=fs.readFileSync(path.join(__dirname,'pdfview.js'),'utf8');
const html=fs.readFileSync(path.join(site,'index.html'),'utf8'); if(!html.includes('window.__lsv={ev:'))throw new Error('no __lsv hook'); fs.writeFileSync(path.join(site,'_pdftest.html'),html.replace('window.__lsv={ev:',()=>chunk+'\nwindow.__lsv={ev:'));
function mkPdf(N){ const o=[]; const add=s=>{ o.push(s); return o.length; }; add('<< /Type /Catalog /Pages 2 0 R >>'); add('PAGES'); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); const kids=[];
 for(let i=1;i<=N;i++){ let c='BT /F1 24 Tf 72 720 Td (Sheet '+i+' of '+N+') Tj ET\nBT /F1 12 Tf 72 690 Td (General notes. '+(i===7||i===33||i===1?'GATE VALVE DN100 here.':'Nothing special.')+') Tj ET\n'; if(i===1)c+='2 w 100 600 m 200 600 l S\n1 w 300 500 120 80 re S\n'; const cn=add('<< /Length '+c.length+' >>\nstream\n'+c+'endstream'); const pn=add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents '+cn+' 0 R >>'); kids.push(pn+' 0 R'); }
 o[1]='<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+N+' >>'; let s='%PDF-1.4\n', off=[]; o.forEach((b,k)=>{ off.push(s.length); s+=(k+1)+' 0 obj\n'+b+'\nendobj\n'; }); const x=s.length; s+='xref\n0 '+(o.length+1)+'\n0000000000 65535 f \n'+off.map(v=>String(v).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(o.length+1)+' /Root 1 0 R >>\nstartxref\n'+x+'\n%%EOF\n'; return Buffer.from(s,'latin1'); }
let ok=0,bad=0; const T=(n,c,x)=>{ c?ok++:bad++; console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?'  ['+x+']':'')); };
(async()=>{ const pdf=mkPdf(50), b64=pdf.toString('base64'); fs.writeFileSync(path.join(__dirname,'pdfview_test50.pdf'),pdf);
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}); const ctx=await b.newContext({viewport:{width:1500,height:860},acceptDownloads:true});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-dc','xto-pdfmk'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(), er=[]; pg.on('pageerror',x=>er.push(x.message)); let ans='note A'; pg.on('dialog',d=>d.accept(ans)); const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await pg.goto(base+'_pdftest.html',{waitUntil:'domcontentloaded',timeout:90000}); await pg.waitForTimeout(5000);
 T('pdf.js not loaded before first open',await pg.evaluate(()=>typeof window.pdfjsLib==='undefined'&&!document.querySelector('script[src*="pdfjs"]')));
 await E("XC.pdf_open.run()"); await pg.waitForTimeout(600); T('pane open',await E("!!WX.win['pane:pdfview']&&WX.lay['pane:pdfview'].open"));
 await pg.evaluate(b=>{ window.__b=Uint8Array.from(atob(b),c=>c.charCodeAt(0)).buffer; },b64); await E("pfLoad(window.__b,'test50.pdf').then(()=>1)"); await pg.waitForTimeout(1500);
 T('pdf.js loaded lazily, worker from Blob',await pg.evaluate(()=>typeof window.pdfjsLib==='object'&&/^blob:/.test(pdfjsLib.GlobalWorkerOptions.workerSrc)));
 T('50 pages',await E('PF.n')===50&&await E('PF.P.length')===50);
 const rend=()=>E("PF.P.filter(p=>p.on).length"); let r=await rend(); T('lazy: only visible pages rendered',r>=1&&r<=6,r+' of 50');
 T('page 1 canvas has ink',await pg.evaluate(()=>{ const c=document.querySelector('.pfpg canvas'), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for(let i=0;i<d.length;i+=4)if(d[i]<100)n++; return n>200; }));
 T('thumbnails drawn lazily',await E("PF.P.filter(p=>p.thd).length")>0&&await E("PF.P.filter(p=>p.thd).length")<50,await E("PF.P.filter(p=>p.thd).length"));
 await E("pfGo(30)"); await pg.waitForTimeout(800); r=await rend(); T('go to p.30: p.30 rendered, p.1 released',await E("PF.P[29].on&&!PF.P[0].on")&&r<=7,'rendered '+r+' cur '+await E('PF.cur'));
 await E("pfFitW()"); await pg.waitForTimeout(400); const s1=await E('PF.s'); await E("pfZoom(PF.s*1.5)"); await pg.waitForTimeout(800); T('zoom +50% and page kept',Math.abs(await E('PF.s')/s1-1.5)<.01&&await E('PF.cur')===30,s1.toFixed(2)+'->'+(await E('PF.s')).toFixed(2));
 await E("pfFitW()"); const fw=await pg.evaluate(()=>{ const p=document.querySelector('.pfpg'); return [p.offsetWidth,document.querySelector('.pfsc').clientWidth]; }); T('fit width',fw[1]-fw[0]>=20&&fw[1]-fw[0]<=40,fw.join('/'));
 await E("pfGo(1)"); await pg.waitForTimeout(600);
 // search
 await pg.fill('.pfw input[placeholder]','valve'); await pg.press('.pfw input[placeholder]','Enter'); await pg.waitForTimeout(2500);
 const hp=await E("PF.hits.map(h=>h.pg).join(',')"); T('search finds VALVE on pages 1,7,33',hp==='1,7,33',hp+' counter '+await pg.evaluate(()=>document.querySelector('.pfr .small').textContent));
 T('first hit selected and highlight drawn',await E("PF.cur===1&&document.querySelectorAll('.pfh').length>=1")); await pg.press('.pfw input[placeholder]','Enter'); await pg.waitForTimeout(700); T('next hit jumps to p.7',await E("PF.cur")===7&&await E("PF.hi")===1);
 const hl=await E("(()=>{ const h=PF.hits[0], p=document.querySelector('.pfpg[data-p=\"1\"] .pfh'); return [h.x,h.y,h.w,h.h].map(v=>v.toFixed(0)).join(',')+' w'+(+p.getAttribute('width')).toFixed(0); })()"); T('hit rect near "GATE VALVE" text (x~72+, y~85, narrow)',/^1[0-9]{2},/.test(hl)&&+hl.split(',')[1]>60&&+hl.split(',')[1]<100,hl);
 await pg.fill('.pfw input[placeholder]','zzzz'); await pg.press('.pfw input[placeholder]','Enter'); await pg.waitForTimeout(2500); T('no-match message',await E("PF.hits.length")===0);
 // markups
 await E("pfGo(1)"); await pg.waitForTimeout(500); await E("PF.s=1; pfZoom(1)"); await pg.waitForTimeout(500); await E("pfGo(1)"); await pg.waitForTimeout(500);
 const P1=async()=>pg.evaluate(()=>{ const PF=__lsv.ev('PF'); const r=document.querySelector('.pfpg[data-p="1"] svg').getBoundingClientRect(); return [r.left,r.top,r.width/PF.w]; }); const xy=async(x,y)=>{ const [l,t,k]=await P1(); return [l+x*k,t+y*k]; };
 const drag=async(a,b,steps)=>{ const [x0,y0]=await xy(...a), [x1,y1]=await xy(...b); await pg.mouse.move(x0,y0); await pg.mouse.down(); await pg.mouse.move((x0+x1)/2,(y0+y1)/2+8,4); await pg.mouse.move(x1,y1,steps||6); await pg.mouse.up(); };
 const tool=async t=>E("pfTool('"+t+"')"); const nm=()=>E('PF.marks.length');
 await tool('pen'); await drag([300,60],[380,110]); await tool('rect'); await drag([300,140],[420,220]); await tool('cloud'); await drag([60,300],[200,380]); await tool('arrow'); await drag([450,300],[520,260]); await tool('hl'); await drag([72,76],[200,92]);
 await tool('text'); ans='check this duct'; const [tx,ty]=await xy(250,250); await pg.mouse.click(tx,ty); await pg.waitForTimeout(200);
 T('6 markups drawn (pen, rect, cloud, arrow, highlight, text)',await nm()===6,(await E("PF.marks.map(m=>m.t).join(',')")));
 await tool('meas'); await drag([100,192],[200,192]); T('uncalibrated measure says so',/not calibrated|غير معايَر/.test(await E("pfLen(PF.marks[PF.marks.length-1])"))&&await nm()===7);
 await tool('cal'); ans='5 m'; await drag([100,192],[200,192]); T('calibration stores scale, adds no mark',await nm()===7&&Math.abs(await E("PF.cal[1].k")-.05)<.002,JSON.stringify(await E("PF.cal")));
 T('uncalibrated measure now shows metres',/^5\.0\d m$/.test(await E("pfLen(PF.marks[6])"))||/^5\.00 m/.test(await E("pfLen(PF.marks[6])")),await E("pfLen(PF.marks[6])"));
 await tool('meas'); await drag([300,300],[350,300]); const m2=await E("pfLen(PF.marks[7])"); T('new 50 pt measure = 2.50 m (+/-0.05)',Math.abs(parseFloat(m2)-2.5)<.05,m2);
 T('svg overlay contains all shapes',await E("document.querySelectorAll('.pfpg[data-p=\"1\"] svg g[data-id]').length")===8);
 T('persisted in localStorage by name|size',await E("JSON.parse(localStorage.getItem('xto-pdfmk'))[PF.key].marks.length")===8,await E('PF.key'));
 await E("PF.col='#2563eb'"); await tool('sel'); const [sx,sy]=await xy(330,140); await pg.mouse.click(sx,sy); T('select by clicking a rectangle edge',await E("PF.sel")===await E("PF.marks[1].id"));
 await pg.click('.pfsw[data-c="#16a34a"]'); T('colour change applies to selected markup',await E("PF.marks[1].c")==='#16a34a');
 await pg.click('.pfr button:has-text("Delete"), .pfr button:has-text("حذف")'); T('delete selected',await nm()===7); await E("pfUndo()"); T('undo restores deleted',await nm()===8&&await E("PF.marks[1].t")==='rect');
 await E("pfUndo()"); T('undo removes last add',await nm()===7);
 // RFI
 await tool('sel'); await E("PF.sel=PF.marks.find(m=>m.t==='text').id"); await E("pfRfi()"); const d=await E("DC.docs.find(d=>d.type==='RFI'&&/check this duct/.test(d.body))||null");
 T('Create RFI: dcAdd type RFI, page + note in body',!!d&&/Page: 1/.test(d.body)&&/Note: check this duct/.test(d.body)&&/test50\.pdf/.test(d.subject),d&&d.ref); T('markup stamped with RFI ref',await E("PF.marks.find(m=>m.t==='text').rfi")===(d&&d.ref)&&await E("document.body.innerText.length>0&&[...document.querySelectorAll('.pfpg svg text')].some(t=>t.textContent==='"+(d&&d.ref)+"')"));
 // export / import / persistence
 const j=await E("pfJson()"); const j7=JSON.parse(j); T('export JSON',j7.marks.length===7&&j7.key==='test50.pdf|'+pdf.length&&j7.cal['1'].k>0);
 await E("pfClear()"); T('clear page',await nm()===0); await E("pfUndo()"); T('undo clear',await nm()===7);
 await pg.evaluate(()=>{ const PF=__lsv.ev('PF'); window.__j=__lsv.ev('pfJson')(); PF.marks=[]; __lsv.ev('pfSave')(); __lsv.ev('pfRedraw')(); }); await E("pfImport(window.__j)"); T('import JSON restores 7',await nm()===7);
 await E("pfLoad(window.__b,'test50.pdf').then(()=>1)"); await pg.waitForTimeout(800); T('re-open same file: markups + scale restored from localStorage',await nm()===7&&await E("PF.cal[1].k>0"));
 await pg.evaluate(()=>{ window.__j=JSON.stringify({marks:[{id:'x"onload="1',pg:1,t:'text',c:'red" onload="alert(1)',p:[[50,50]],tx:'<img src=x onerror=window.__pwn=1>'},{pg:99,t:'pen',p:[[1,1]]},{pg:1,t:'evil',p:[[1,1]]}],cal:{}}); }); await E("pfImport(window.__j)"); await pg.waitForTimeout(300);
 T('hostile import: bad marks dropped, text escaped, colour coerced, no script',await E("PF.marks.length")===8&&await pg.evaluate(()=>{ const PF=__lsv.ev('PF'); return !window.__pwn&&!document.querySelector('.pfpg svg img')&&!document.querySelector('.pfpg svg [onload]')&&PF.marks[7].c==='#e11d48'&&/^[\w-]+$/.test(PF.marks[7].id); }));
 // PNG
 const png=await pg.evaluate(async()=>{ const PF=__lsv.ev('PF'); PF.cur=1; const b=await __lsv.ev('pfPngBlob')(), bm=await createImageBitmap(b), c=document.createElement('canvas'); c.width=bm.width; c.height=bm.height; const x=c.getContext('2d'); x.drawImage(bm,0,0); const d=x.getImageData(0,0,c.width,c.height).data; let red=0,blue=0; for(let i=0;i<d.length;i+=4){ if(d[i]>200&&d[i+1]<80&&d[i+2]<120)red++; if(d[i]<60&&d[i+1]>80&&d[i+1]<140&&d[i+2]>200)blue++; } return {type:b.type,size:b.size,w:bm.width,h:bm.height,red}; });
 T('PNG export: image/png, 1224x1584, markup ink present',png.type==='image/png'&&png.w===1224&&png.h===1584&&png.red>200,JSON.stringify(png));
 const dl=pg.waitForEvent('download'); await pg.click('.pfr button:has-text("PNG")'); const dd=await dl; T('PNG download name',/test50_p1_markup\.png$/.test(dd.suggestedFilename()),dd.suggestedFilename());
 await E("pfGo(1)"); await pg.waitForTimeout(500); await pg.screenshot({path:path.join(__dirname,'pdfview_shot.png')});
 T('no page errors, no worker errors (real Worker, not main-thread fallback)',er.length===0&&!(await pg.evaluate(()=>window.PFWERR))&&await pg.evaluate(()=>!!pdfjsLib.GlobalWorkerOptions.workerPort),er.slice(0,3).join(' | ')+' '+await pg.evaluate(()=>window.PFWERR||'')); console.log(ok+' pass, '+bad+' fail'); fs.unlinkSync(path.join(site,'_pdftest.html')); await b.close(); process.exit(bad?1:0); })();
