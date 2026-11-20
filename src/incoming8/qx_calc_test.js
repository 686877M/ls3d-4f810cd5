/* Q.X engine test (Node only, no browser): node qx_calc_test.js [path/to/qx_calc.js]
   Loads the calc chunk in a bare VM (DATA stub), fills a small workbook and checks each formula against the value Excel gives. */
const fs=require('fs'), vm=require('vm'), path=require('path');
const file=process.argv[2]||path.join(__dirname,'qx_calc.js');
const ctx={DATA:{},console}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(file,'utf8')+'\n;globalThis.__qx={QX,qxWb,qxSet,qxGet,qxFlush,qxRecalcAll,qxSheet,qxFmt,qxParse,qxShiftF,qxMoveF,qxYmd,qxRt};',ctx);
const Q=ctx.__qx, w=Q.qxWb(), S=w.sheets[0];
const A=ref=>{ const m=/^([A-Z]+)(\d+)$/.exec(ref); let c=0; for(const ch of m[1])c=c*26+ch.charCodeAt(0)-64; return [+m[2]-1,c-1]; };
const set=(sh,ref,v)=>{ const p=A(ref); Q.qxSet(w,sh,p[0],p[1],v); }, get=(sh,ref)=>{ const p=A(ref); const v=Q.qxGet(sh,p[0],p[1]); return v&&v.e?v.e:v; };
let pass=0, fail=0; const rows=[];
const ok=(name,got,exp)=>{ const good=typeof exp==='number'&&typeof got==='number'?Math.abs(got-exp)<1e-9:got===exp; good?pass++:fail++; rows.push((good?'ok   ':'FAIL ')+name+'  ->  '+JSON.stringify(got)+(good?'':'   expected '+JSON.stringify(exp))); };
/* data: A=code B=item C=cat D=qty E=rate F=amount (rows 2..7), rates are test numbers only */
[['Code','Item','Cat','Qty','Rate','Amount'],['C-01','Blinding','Concrete',12.5,100],['C-02','Raft','Concrete',80,150],['S-01','Rebar','Steel',9.75,2000],['P-01','Pipe DN200','Pipes',36,45],['P-02','Pipe DN300','Pipes',18,80],['S-02','Mesh','Steel',4,1500]].forEach((r,i)=>r.forEach((v,j)=>Q.qxSet(w,S,i,j,v)));
for(let r=2;r<=7;r++)set(S,'F'+r,'=D'+r+'*E'+r);
const S2=Q.qxSheet('Rates 2'); w.sheets.push(S2); Q.qxRecalcAll(w); set(S2,'A1','Steel'); set(S2,'B1',1.14); set(S2,'A2','Pipes'); set(S2,'B2',1.05);
w.names.QTY='Sheet1!$D$2:$D$7'; w.names.VAT='0.14';
const T=[ /* [formula, expected] */
 ['=SUM(D2:D7)',160.25],['=SUM(F2:F7)',41810],['=SUM(D2:D7,10,"5")',175.25],['=SUMIF(C2:C7,"Steel",F2:F7)',25500],['=SUMIF(D2:D7,">=18")',134],['=SUMIF(B2:B7,"Pipe*",D2:D7)',54],
 ['=SUMIFS(F2:F7,C2:C7,"Pipes",D2:D7,">20")',1620],['=SUMPRODUCT(D2:D7,E2:E7)',41810],['=SUMPRODUCT((C2:C7="Concrete")*(D2:D7))',92.5],
 ['=COUNT(A1:F7)',18],['=COUNTA(A1:A7)',7],['=COUNTIF(C2:C7,"Steel")',2],['=COUNTIF(D2:D7,"<10")',2],['=COUNTIFS(C2:C7,"Pipes",E2:E7,">50")',1],['=COUNTBLANK(A1:A9)',2],
 ['=AVERAGE(D2:D7)',160.25/6],['=AVERAGEIF(C2:C7,"Concrete",D2:D7)',46.25],['=MIN(D2:D7)',4],['=MAX(D2:D7)',80],
 ['=ROUND(2.345,2)',2.35],['=ROUND(1.005,2)',1.01],['=ROUND(-2.5,0)',-3],['=ROUND(1234.5,-2)',1200],['=ROUNDUP(2.101,1)',2.2],['=ROUNDDOWN(2.199,1)',2.1],['=ROUNDUP(-2.101,1)',-2.2],['=INT(-2.5)',-3],['=ABS(-7)',7],['=MOD(-7,3)',2],['=10/4',2.5],['=2^3^2',64],['=-2^2',4],['=50%*200',100],['=1+2*3',7],['=(1+2)*3',9],['=0.1+0.2=0.3',true],
 ['=IF(D2>10,"big","small")','big'],['=IF(D7>10,"big")',false],['=IFS(D7>10,"a",D7>3,"b",TRUE,"c")','b'],['=AND(D2>1,D3>1)',true],['=OR(D2>100,D3>100)',false],['=NOT(D2>100)',true],['=IFERROR(1/0,"n/a")','n/a'],['=IFERROR(VLOOKUP("X",A2:F7,2,FALSE),0)',0],['=1/0','#DIV/0!'],['=NOSUCH(1)','#NAME?'],['=SUM(','#ERROR!'],['="a"+1','#VALUE!'],['=SQRT(-1)','#NUM!'],
 ['=VLOOKUP("S-01",A2:F7,2,FALSE)','Rebar'],['=VLOOKUP("s-02",A2:F7,6,FALSE)',6000],['=VLOOKUP("Z",A2:F7,2,FALSE)','#N/A'],['=VLOOKUP(20,D2:E7,2,TRUE)',80],['=HLOOKUP("Qty",A1:F7,3,FALSE)',80],
 ['=XLOOKUP("P-02",A2:A7,B2:B7)','Pipe DN300'],['=XLOOKUP("none",A2:A7,B2:B7,"missing")','missing'],['=XLOOKUP(50,D2:D7,B2:B7,,-1)','Pipe DN200'],['=XLOOKUP("Concrete",C2:C7,A2:A7,,0,-1)','C-02'],
 ['=INDEX(B2:B7,3)','Rebar'],['=INDEX(A2:F7,2,4)',80],['=MATCH("P-01",A2:A7,0)',4],['=INDEX(F2:F7,MATCH("S-02",A2:A7,0))',6000],['=MATCH(20,D2:D7,1)',5],['=INDEX(A2:F7,9,1)','#REF!'],
 ['=CONCAT(A2,"-",B2)','C-01-Blinding'],['=A2&" / "&D2','C-01 / 12.5'],['=TEXTJOIN(", ",TRUE,C2:C4)','Concrete, Concrete, Steel'],['=LEFT(B5,4)','Pipe'],['=RIGHT(B5,5)','DN200'],['=MID(B5,6,2)','DN'],['=LEN(B3)',4],['=TRIM("  a   b ")','a b'],['=UPPER(B3)','RAFT'],['=LOWER(C2)','concrete'],
 ['=TEXT(1234.567,"#,##0.00")','1,234.57'],['=TEXT(0.256,"0.0%")','25.6%'],['=TEXT(DATE(2026,11,20),"dd/mm/yyyy")','20/11/2026'],['=TEXT(DATE(2026,1,5),"d-mmm-yy")','5-Jan-26'],['=VALUE("1,250.5")',1250.5],['=VALUE("12%")',0.12],
 ['=DATE(2026,11,20)',46346],['=DATE(1900,3,1)',61],['=YEAR(46346)',2026],['=MONTH(46346)',11],['=DAY(46346)',20],['=EDATE(DATE(2026,1,31),1)',46081],['=EDATE(DATE(2024,3,31),-1)',45351],['=DAY(EDATE(DATE(2026,1,31),1))',28],
 ['=NETWORKDAYS(DATE(2026,11,1),DATE(2026,11,30))',21],['=NETWORKDAYS(DATE(2026,11,2),DATE(2026,11,6),DATE(2026,11,4))',4],['=NETWORKDAYS.INTL(DATE(2026,11,1),DATE(2026,11,30),7)',22],['=NETWORKDAYS(DATE(2026,11,30),DATE(2026,11,1))',-21],['=TODAY()>46000',true],
 ['=SUM($D$2:D$7)',160.25],['=SUM(D:D)',160.25],['=SUM(2:2)',112.5+1250],['=\'Rates 2\'!B1*2',2.28],['=VLOOKUP(C4,\'Rates 2\'!A1:B2,2,FALSE)',1.14],['=SUM(QTY)',160.25],['=SUM(F2:F7)*(1+VAT)',41810*1.14],['=Nope!A1','#REF!'],['=UNKNOWNNAME+1','#NAME?'] ];
T.forEach((t,i)=>{ Q.qxSet(w,S,20+i,9,t[0]); }); Q.qxFlush(w); T.forEach((t,i)=>ok(t[0],(v=>v&&v.e?v.e:v)(Q.qxGet(S,20+i,9)),t[1]));
/* recalculation through the dependency graph */
set(S,'H1','=SUM(F2:F7)'); set(S,'H2','=H1*2'); set(S2,'D1','=Sheet1!H2+1'); Q.qxFlush(w); ok('graph: H1',get(S,'H1'),41810);
set(S,'D2',22.5); const n1=Q.qxFlush(w); ok('graph: edit D2 -> F2',get(S,'F2'),2250); ok('graph: -> H1 (range dep)',get(S,'H1'),42810); ok('graph: -> H2 (chain)',get(S,'H2'),85620); ok('graph: -> other sheet',get(S2,'D1'),85621);
set(S,'D2',12.5); Q.qxFlush(w);
/* circular references */
set(S,'L1','=L2+1'); set(S,'L2','=L3+1'); set(S,'L3','=L1+1'); set(S,'L4','=L4'); set(S,'L5','=SUM(L5:L6)'); Q.qxFlush(w); ok('circular 3-cell loop',get(S,'L1'),'#CIRC!'); ok('circular self',get(S,'L4'),'#CIRC!'); ok('circular via range',get(S,'L5'),'#CIRC!');
set(S,'L3',5); Q.qxFlush(w); ok('loop broken -> recovers',get(S,'L1'),7);
/* reference rewriting */
ok('fill down relative','='+Q.qxShiftF('D2*E2+$D$2+D$2+$D2',1,0),'=D3*E3+$D$2+D$2+$D3'); ok('fill right','='+Q.qxShiftF('SUM(A1:A5)+B:B',0,2),'=SUM(C1:C5)+D:D'); ok('shift off sheet','='+Q.qxShiftF('A1',-1,0),'=#REF!'); ok('strings untouched','='+Q.qxShiftF('"A1"&A1',1,0),'="A1"&A2');
ok('insert row inside range','='+Q.qxMoveF('SUM(F2:F7)+F9',()=>true,'r',3,1),'=SUM(F2:F8)+F10'); ok('delete rows shrink range','='+Q.qxMoveF('SUM(F2:F7)',()=>true,'r',5,-2),'=SUM(F2:F5)'); ok('delete referenced cell','='+Q.qxMoveF('F4*2',()=>true,'r',3,-1),'=#REF!*2'); ok('insert column','='+Q.qxMoveF('D2*E2',()=>true,'c',4,1),'=D2*F2');
/* formats and input parsing */
ok('fmt #,##0.00',Q.qxFmt(1234567.891,'#,##0.00'),'1,234,567.89'); ok('fmt currency',Q.qxFmt(-1500,'#,##0.00 "EGP"'),'-1,500.00 EGP'); ok('fmt negative section',Q.qxFmt(-1500,'#,##0;(#,##0)'),'(1,500)'); ok('fmt percent',Q.qxFmt(0.125,'0.0%'),'12.5%'); ok('fmt date',Q.qxFmt(46346,'yyyy-mm-dd'),'2026-11-20'); ok('fmt general float',Q.qxFmt(0.1+0.2,''),'0.3'); ok('fmt 0.0#',Q.qxFmt(2.5,'0.0#'),'2.5');
ok('parse number',Q.qxParse('1,250.50').v,1250.5); ok('parse percent',Q.qxParse('15%').v,0.15); ok('parse date d/m/y',Q.qxParse('20/11/2026').v,46346); ok('parse ISO date',Q.qxParse('2026-11-20').v,46346); ok('parse text',Q.qxParse('DN200').v,'DN200');
/* 20,000 rows: load, full recalculation, one edit, a 20,000-long running-total chain */
const B=Q.qxSheet('Big'); w.sheets.push(B); Q.qxRecalcAll(w); const N=20000; let t0=Date.now();
for(let r=1;r<=N;r++){ Q.qxSet(w,B,r,0,'IT-'+r); Q.qxSet(w,B,r,1,['Concrete','Steel','Pipes','Valves','Finishes'][r%5]); Q.qxSet(w,B,r,2,r%97+0.5); Q.qxSet(w,B,r,3,(r%13)+1); Q.qxSet(w,B,r,4,'=C'+(r+1)+'*D'+(r+1)); Q.qxSet(w,B,r,5,r===1?'=E2':'=F'+r+'+E'+(r+1)); }
Q.qxSet(w,B,0,7,'=SUM(E2:E'+(N+1)+')'); Q.qxSet(w,B,1,7,'=SUMIF(B:B,"Steel",E:E)'); Q.qxSet(w,B,2,7,'=COUNTIF(B:B,"Pipes")'); const tFill=Date.now()-t0; t0=Date.now(); const nc=Q.qxFlush(w); const tCalc=Date.now()-t0;
let chk=0, steel=0; for(let r=1;r<=N;r++){ const v=(r%97+0.5)*((r%13)+1); chk+=v; if(r%5===1)steel+=v; }
ok('20k: SUM of 20,000 products',Q.qxGet(B,0,7),chk); ok('20k: SUMIF whole columns',Q.qxGet(B,1,7),steel); ok('20k: COUNTIF',Q.qxGet(B,2,7),4000); ok('20k: running total last row',Q.qxGet(B,N,5),chk);
t0=Date.now(); Q.qxSet(w,B,1,2,1000); const ne=Q.qxFlush(w), tEdit=Date.now()-t0; ok('20k: edit first qty updates total',Q.qxGet(B,0,7),chk-(1.5*2)+(1000*2));
t0=Date.now(); const nall=Q.qxRecalcAll(w), tAll=Date.now()-t0; t0=Date.now(); const js=JSON.stringify(w), tJson=Date.now()-t0;
console.log(rows.join('\n')); console.log('\n'+pass+' passed, '+fail+' failed');
console.log('timing (Node '+process.version+'): fill 20,000 rows x 6 cells '+tFill+' ms; first calculation of '+nc+' formulas '+tCalc+' ms; one edit at the top of the chain recalculated '+ne+' cells in '+tEdit+' ms; rebuild graph + full recalculation '+nall+' formulas '+tAll+' ms; JSON size '+(js.length/1048576).toFixed(2)+' MB in '+tJson+' ms');
process.exit(fail?1:0);
