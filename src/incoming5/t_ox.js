const H=require('./lbh.js');
(async()=>{ const {pg,E,ck,sum}=await H.open();
 ck('counts',true,await E("JSON.stringify({docs:lbItems(LB.libs.oxdoc).length,xls:lbItems(LB.libs.oxxls).length})"));
 ck('previews',await E("['oxdoc','oxxls'].every(l=>lbItems(LB.libs[l]).every(it=>lbPrev(LB.libs[l],it).includes('<svg')))"));
 await E("DC.proj.client='Ministry of Water'; DC.proj.contractor='Nile Contractors'; DC.proj.consultant='Delta Consult'; DC.proj.code='SLS'; 0");
 // all docs in all langs build non-empty html w/ project data
 const res=await E("JSON.stringify(lbDocD.map(d=>['en','ar','both'].map(lg=>{ const h=lbDocHtml(d,lg,{kind:'conc'},lbProj(),false); return h.includes('Sewage Lift Station')&&h.includes('SLS-'+d[3]+'-001')&&(lg!=='ar'||h.includes('dir')&&h.includes('rtl'))&&h.length>800; }).every(Boolean)))");
 ck('11 docs x 3 languages build with project data',JSON.parse(res).length===11&&JSON.parse(res).every(Boolean),res);
 ck('RFI fills consultant/contractor',await E("(()=>{ const h=lbDocHtml(lbDocD.find(d=>d[0]==='rfi'),'en',{},lbProj(),false); return h.includes('Delta Consult')&&h.includes('Nile Contractors'); })()"));
 ck('Arabic labels',await E("lbDocHtml(lbDocD.find(d=>d[0]==='mom'),'ar',{},lbProj(),false).includes('محضر اجتماع')&&lbDocHtml(lbDocD.find(d=>d[0]==='ncr'),'ar',{},lbProj(),false).includes('السبب الجذري')"));
 ck('checklist variants differ',await E("(()=>{ const d=lbDocD.find(x=>x[0]==='chk'); const a=lbDocHtml(d,'en',{kind:'conc'},lbProj()), b=lbDocHtml(d,'en',{kind:'hand'},lbProj()); return a.includes('Slump test')&&!b.includes('Slump test')&&b.includes('O&amp;M'); })()"));
 // daily report picks schedule activities in progress
 await E("ACT.find(a=>a.t!=='ms').pct=40; 0"); ck('daily report lists in-progress activity',await E("lbDocHtml(lbDocD.find(d=>d[0]==='dr'),'en',{},lbProj(),false).includes('40%')"));
 // open in report: numbering and editor content
 await E("(()=>{ const {lib,it}=lbFind('oxdoc','rfi'); lbOv(lib,it,1).f={lg:'both'}; lbRun(lib,it,it.act[0][2]); })()");
 ck('open writes O.X report + numbering',await E("oD().report.includes('SLS-RFI-001')&&oD().report.includes('Delta Consult')&&oD().report.includes(' / ')&&lbD().cur.cnt.rfi===1"));
 await E("(()=>{ const {lib,it}=lbFind('oxdoc','rfi'); lbRun(lib,it,it.act[0][2]); })()"); ck('second open numbers 002',await E("oD().report.includes('SLS-RFI-002')"));
 ck('report visible in editor pane',await E("(()=>{ const ed=document.querySelector('#p-oreport [contenteditable]')||document.querySelector('[contenteditable=true]'); return !!ed&&ed.innerHTML.includes('SLS-RFI-002'); })()"));
 // download
 const dl=pg.waitForEvent('download'); await E("(()=>{ const {lib,it}=lbFind('oxdoc','ncr'); lbRun(lib,it,it.act[1][2]); })()"); const d=await dl; ck('download html name',d.suggestedFilename()==='SLS-NCR.html',d.suggestedFilename());
 // Excel
 for(const id of ['boq','cash','scurve','risk','proc']){ await E("(()=>{ const {lib,it}=lbFind('oxxls','"+id+"'); lbRun(lib,it,it.act[0][2]); })()"); }
 await E("(()=>{ const {lib,it}=lbFind('oxxls','boq'); lbRun(lib,it,it.act[0][2]); })()");
 await E("oD().cells.D5='10'; oD().cells.E5='25'; oD().cells.D6='4'; oD().cells.E6='100'; oD().cells.D27='10'; oD().cells.D28='14'; 0");
 ck('BOQ formulas: amount, subtotal, contingency, VAT, grand',await E("[shVal('F5'),shVal('F6'),shVal('F26'),shVal('F27'),shVal('F28'),shVal('F29')].join()")==='250,400,650,65,100.1,815.1',await E("[shVal('F5'),shVal('F6'),shVal('F26'),shVal('F27'),shVal('F28'),shVal('F29')].join()"));
 await E("(()=>{ const {lib,it}=lbFind('oxxls','scurve'); lbRun(lib,it,it.act[0][2]); })()"); ck('S-curve cumulative = 100 at end',await E("shVal('C24')===100&&shVal('C26')===100"),await E("[shVal('C5'),shVal('C24'),shVal('C26')].join()"));
 await E("oD().cells.D5='4'; oD().cells.D6='6'; 0"); ck('S-curve variance formula',await E("shVal('F5')===-1&&shVal('F6')===0"),await E("[shVal('E5'),shVal('F5'),shVal('F6')].join()"));
 await E("(()=>{ const {lib,it}=lbFind('oxxls','risk'); lbRun(lib,it,it.act[0][2]); })()"); await E("oD().cells.D5='4'; oD().cells.E5='5'; oD().cells.D6='2'; oD().cells.E6='3'; oD().cells.D7='5'; oD().cells.E7='3'; 0"); ck('risk score + rating (IF)',await E("[shVal('F5'),shVal('G5'),shVal('G6'),shVal('G7')].join()")==='20,High,Low,High',await E("[shVal('F5'),shVal('G5'),shVal('G6'),shVal('G7')].join()"));
 await E("(()=>{ const {lib,it}=lbFind('oxxls','cash'); lbRun(lib,it,it.act[0][2]); })()"); await E("oD().cells.B5='100'; oD().cells.C5='200'; oD().cells.B6='60'; oD().cells.C6='250'; 0"); ck('cash flow net + cumulative',await E("[shVal('B7'),shVal('C7'),shVal('C8'),shVal('N5')].join()")==='40,-50,-10,300',await E("[shVal('B7'),shVal('C7'),shVal('C8'),shVal('N5')].join()"));
 await E("(()=>{ const {lib,it}=lbFind('oxxls','proc'); lbOv(lib,it,1).f={lg:'ar'}; lbRun(lib,it,it.act[0][2]); })()"); await E("oD().cells.E5='3'; oD().cells.F5='50'; oD().cells.H5='30'; oD().cells.I5='45'; 0"); ck('procurement total + order-by, Arabic header',await E("[shVal('G5'),shVal('J5'),oD().cells.A4].join()")==='150,15,البند',await E("[shVal('G5'),shVal('J5'),oD().cells.A4].join()"));
 await E("XC.o_sheet.run()"); await pg.waitForTimeout(300); ck('sheet grid shows cells',await E("(document.getElementById('shGrid')||{innerHTML:''}).innerHTML.includes('البند')"));
 await E("XC.lb_ox.run()"); await pg.waitForTimeout(300); ck('O.X pane',await E("LB.box.ox.querySelectorAll('.lbc').length")===11&&await E("LB.box.ox.querySelectorAll('.lbt').length")===2);
 await pg.screenshot({path:'out/lb_ox.png'}); await sum(); })();
