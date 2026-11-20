/* ====== Q.X calc (chunk 1 of 4): the spreadsheet engine behind the Quantities and Cost tab. Workbook lives in DATA.qx (so project save and localStorage carry it): {sheets:[{name,cells:{key:raw},fmt,cfmt,cw,merges,frz,cf,dv,notes,tbl,filt,nr,nc}],cur,names,pivots,dash}. key = row*16384+col (0-based). raw = number | boolean | text | '=FORMULA' | "'text". Runtime caches (values, dependency graph) sit on a non-enumerable sh.$ and are rebuilt after load. No eval: formulas are tokenised, parsed to a small tree and interpreted. Top-level names: QX, QXT, QXD0, qx*. ====== */
const QX={fn:{},lazy:{},help:{},ast:new Map(),E:{},ui:null,c:{},ver:0};
['#DIV/0!','#N/A','#NAME?','#REF!','#VALUE!','#NUM!','#CIRC!','#ERROR!'].forEach(s=>{ QX.E[s.replace(/[^A-Z]/g,'')]=Object.freeze({e:s}); });
const qxK=(r,c)=>r*16384+c, qxIsE=v=>v!==null&&typeof v==='object'&&v.e!==undefined, qxIsA=v=>v!==null&&typeof v==='object'&&v.e===undefined, qxIsF=x=>typeof x==='string'&&x.length>1&&x.charCodeAt(0)===61;
const qxCN=c=>{ let s=''; c++; while(c>0){ const m=(c-1)%26; s=String.fromCharCode(65+m)+s; c=(c-m-1)/26; } return s; }, qxCI=s=>{ let n=0; for(let i=0;i<s.length;i++)n=n*26+s.charCodeAt(i)-64; return n-1; }, qxA1=(r,c)=>qxCN(c)+(r+1);
function qxSheet(name){ return {name,cells:{},fmt:{},cfmt:{},cw:{},merges:[],frz:{r:0,c:0},cf:[],dv:[],notes:{},tbl:[],filt:null,nr:0,nc:0}; }
function qxWb(){ let w=DATA.qx; if(!w||!Array.isArray(w.sheets)||!w.sheets.length)w=DATA.qx={sheets:[qxSheet('Sheet1')],cur:0,names:{},pivots:[],dash:null}; if(!w.$ok){ Object.defineProperty(w,'$ok',{value:true,writable:true,enumerable:false}); qxRecalcAll(w); } return w; }
const qxSh=(w,name)=>{ const n=String(name).toLowerCase(); return w.sheets.find(s=>s.name.toLowerCase()===n)||null; };
function qxRt(sh){ if(!('$' in sh))Object.defineProperty(sh,'$',{value:null,writable:true,enumerable:false}); if(!sh.$)sh.$={val:new Map(),st:new Map(),dep:new Map(),rev:new Map(),rdc:{},rdw:[],dc:{},fc:{},vis:null}; return sh.$; }
/* ---------- dates, rounding, input parsing, number formats ---------- */
const QXD0=Date.UTC(1899,11,30), qxYmd=(y,m,d)=>Math.round((Date.UTC(y,m-1,d)-QXD0)/864e5), qxDt=s=>new Date(QXD0+Math.floor(s)*864e5);
function qxRound(x,d,m){ const s=x<0?-1:1, a=Math.abs(x); let t=+(a+'e'+d); if(isNaN(t))t=a*Math.pow(10,d); t=m>0?Math.ceil(t-1e-9):m<0?Math.floor(t+1e-9):Math.round(t); const r=+(t+'e'+(-d)); return s*(isNaN(r)?t/Math.pow(10,d):r); }
function qxParse(t){ if(typeof t!=='string')return {v:t}; const s=t.trim(); let m; if(s==='')return {v:t===''?null:t};
 if(/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s))return {v:+s};
 if(/^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s))return {v:+s.replace(/,/g,''),nf:'#,##0'+(s.includes('.')?'.00':'')};
 if((m=/^([-+]?\d+\.?\d*)\s*%$/.exec(s)))return {v:+m[1]/100,nf:m[1].includes('.')?'0.00%':'0%'};
 if((m=/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(s))&&+m[2]>=1&&+m[2]<=12&&+m[3]>=1&&+m[3]<=31)return {v:qxYmd(+m[1],+m[2],+m[3]),nf:'yyyy-mm-dd'};
 if((m=/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(s))&&+m[2]>=1&&+m[2]<=12&&+m[1]>=1&&+m[1]<=31)return {v:qxYmd(+m[3],+m[2],+m[1]),nf:'dd/mm/yyyy'}; /* day first, as used in Egypt */
 const u=s.toUpperCase(); return u==='TRUE'?{v:true}:u==='FALSE'?{v:false}:{v:t}; }
function qxFmt(v,nf){ if(v===null||v===undefined)return ''; if(typeof v==='boolean')return v?'TRUE':'FALSE'; if(typeof v==='string')return v; if(v.e)return v.e; if(typeof v!=='number')return String(v);
 if(!nf||nf==='General'){ const a=Math.abs(v); return (a>=1e15||(a>0&&a<1e-9))?v.toExponential(5).replace(/\.?0+e/,'e').toUpperCase():String(+v.toPrecision(11)); }
 const bare=nf.replace(/"[^"]*"|\[[^\]]*\]/g,'');
 if(/[ymdhs]/i.test(bare)&&!/[0#]/.test(bare)){ const d=qxDt(v), fr=v-Math.floor(v), mins=Math.round(fr*1440), p2=n=>(n<10?'0':'')+n, MN=['January','February','March','April','May','June','July','August','September','October','November','December'], DN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return nf.replace(/(h+):(m+)/gi,(t,h)=>(h.length>1?p2(Math.floor(mins/60)%24):Math.floor(mins/60)%24)+':'+p2(mins%60)).replace(/"([^"]*)"|\[[^\]]*\]|yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d/gi,(t,q)=>{ if(q!==undefined)return q; switch(t.toLowerCase()){ case 'yyyy':return d.getUTCFullYear(); case 'yy':return p2(d.getUTCFullYear()%100); case 'mmmm':return MN[d.getUTCMonth()]; case 'mmm':return MN[d.getUTCMonth()].slice(0,3); case 'mm':return p2(d.getUTCMonth()+1); case 'm':return d.getUTCMonth()+1; case 'dddd':return DN[d.getUTCDay()]; case 'ddd':return DN[d.getUTCDay()].slice(0,3); case 'dd':return p2(d.getUTCDate()); case 'd':return d.getUTCDate(); } return ''; }); }
 const secs=nf.split(';'); let s=secs[0], neg=v<0; if(neg&&secs[1]){ s=secs[1]; neg=false; } if(v===0&&secs[2])s=secs[2];
 const lit=[]; s=s.replace(/"([^"]*)"|\\(.)|\[[^\]]*\]|_.|\*./g,(t,a,b)=>{ if(a===undefined&&b===undefined)return ''; lit.push(a!==undefined?a:b); return '\u0001'; });
 const back=o=>{ let i=0; return o.replace(/\u0001/g,()=>lit[i++]); }, m=/[#0?,]*[#0?](?:\.[#0?]+)?/.exec(s); if(!m)return back(s);
 const core=m[0], ipat=core.split('.')[0], dp=core.split('.')[1]||'', nd=dp.length, minI=(ipat.match(/0/g)||[]).length, a=Math.abs(v)*Math.pow(100,(s.match(/%/g)||[]).length);
 let ps=qxRound(a,nd,0).toFixed(nd).split('.'), ip=ps[0], fp=ps[1]||''; const keep=dp.lastIndexOf('0')+1; while(fp.length>keep&&fp[fp.length-1]==='0')fp=fp.slice(0,-1);
 while(ip.length<minI)ip='0'+ip; if(minI===0&&ip==='0'&&fp)ip=''; if(ipat.includes(','))ip=ip.replace(/\B(?=(\d{3})+(?!\d))/g,',');
 return back(s.replace(core,()=>(neg?'-':'')+ip+(fp?'.'+fp:''))); }
/* ---------- tokeniser + parser (cached per formula text) ---------- */
const QXT=/\s+|"(?:[^"]|"")*"|#(?:DIV\/0!|N\/A|NAME\?|REF!|VALUE!|NUM!|CIRC!|ERROR!)|(?:'(?:[^']|'')+'|[A-Za-z_؀-ۿ][\w.؀-ۿ]*)!|\$?[A-Za-z]{1,3}\$?\d{1,7}(?![\w.])|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}(?![\w(.!])|\$?\d+:\$?\d+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+|[A-Za-z_؀-ۿ][\w.؀-ۿ]*|<=|>=|<>|[^\s]/g;
const qxUq=t=>{ let s=t.slice(0,-1); if(s[0]==="'")s=s.slice(1,-1).replace(/''/g,"'"); return s; }, qxQs=n=>/^[A-Za-z_][\w.]*$/.test(n)?n+'!':"'"+n.replace(/'/g,"''")+"'!";
function qxParseF(src){ let p=QX.ast.get(src); if(p)return p; if(QX.ast.size>80000)QX.ast.clear();
 const tk=(src.match(QXT)||[]).filter(t=>!/^\s+$/.test(t)), refs=[], names=[]; let i=0;
 const cell=t=>{ const m=/^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(t||''); return m?[+m[2]-1,qxCI(m[1].toUpperCase())]:null; };
 function prim(){ const t=tk[i++]; let m, a, b; if(t===undefined)throw 0;
  if(t==='('){ const v=cmp(); if(tk[i++]!==')')throw 0; return v; }
  if(t[0]==='"')return ['s',t.slice(1,-1).replace(/""/g,'"')];
  if(t[0]==='#'){ const e=QX.E[t.replace(/[^A-Z]/g,'')]; if(!e)throw 0; return ['e',e]; }
  let sh=null, u=t; if(t.length>1&&t[t.length-1]==='!'){ sh=qxUq(t); u=tk[i++]; if(u===undefined)throw 0; }
  if((m=/^\$?(\d+):\$?(\d+)$/.exec(u))){ a=Math.min(+m[1],+m[2])-1; b=Math.max(+m[1],+m[2])-1; refs.push({s:sh,r1:a,c1:0,r2:b,c2:16383}); return ['R',sh,a,0,b,16383]; }
  if(!sh&&/^[\d.]/.test(u))return ['n',+u];
  if((m=/^\$?([A-Za-z]{1,3}):\$?([A-Za-z]{1,3})$/.exec(u))){ a=qxCI(m[1].toUpperCase()); b=qxCI(m[2].toUpperCase()); if(a>b){ const x=a; a=b; b=x; } refs.push({s:sh,r1:0,c1:a,r2:1048575,c2:b}); return ['R',sh,0,a,1048575,b]; }
  if(tk[i]!=='('&&(a=cell(u))){ if(tk[i]===':'&&(b=cell(tk[i+1]))){ i+=2; const r1=Math.min(a[0],b[0]), c1=Math.min(a[1],b[1]), r2=Math.max(a[0],b[0]), c2=Math.max(a[1],b[1]); refs.push({s:sh,r1,c1,r2,c2}); return ['R',sh,r1,c1,r2,c2]; } refs.push({s:sh,r1:a[0],c1:a[1],r2:a[0],c2:a[1]}); return ['c',sh,a[0],a[1]]; }
  if(sh||!/^[A-Za-z_؀-ۿ]/.test(u))throw 0; const U=u.toUpperCase();
  if(tk[i]==='('){ i++; const args=[]; if(tk[i]!==')')for(;;){ if(tk[i]===','||tk[i]===';'||tk[i]===')')args.push(['z']); else args.push(cmp()); if(tk[i]===','||tk[i]===';'){ i++; continue; } break; } if(tk[i++]!==')')throw 0; if(!QX.fn[U]&&!QX.lazy[U])throw 1; return ['f',U,args]; }
  if(U==='TRUE')return ['b',true]; if(U==='FALSE')return ['b',false]; names.push(U); return ['N',U]; }
 function un(){ const t=tk[i]; if(t==='-'){ i++; return ['u',un()]; } if(t==='+'){ i++; return un(); } let v=prim(); while(tk[i]==='%'){ i++; v=['p',v]; } return v; }
 const lv=(next,ops)=>function(){ let v=next(); while(ops.indexOf(tk[i])>=0&&tk[i]!==undefined){ const o=tk[i++]; v=['o',o,v,next()]; } return v; };
 const pw=lv(un,['^']), mul=lv(pw,['*','/']), add=lv(mul,['+','-']), cat=lv(add,['&']), cmp=lv(cat,['=','<','>','<=','>=','<>']);
 try{ const ast=cmp(); if(i<tk.length)throw 0; p={ast,refs,names}; }catch(e){ if(e!==0&&e!==1)throw e; p={err:e===1?QX.E.NAME:QX.E.ERROR,refs:[],names:[]}; }
 QX.ast.set(src,p); return p; }
/* ---------- evaluation ---------- */
function qxGet(sh,r,c){ const k=r*16384+c, raw=sh.cells[k]; if(raw===undefined)return null; if(typeof raw==='string'){ const c0=raw.charCodeAt(0); if(c0===61&&raw.length>1){ const rt=sh.$; if(rt.st.get(k)===2)return QX.E.CIRC; const v=rt.val.get(k); return v===undefined?null:v; } if(c0===39)return raw.slice(1); } return raw; }
const qxDim=a=>Array.isArray(a)?[a.length,a[0].length]:[a.r2-a.r1+1,a.c2-a.c1+1], qxAt=(a,i,j)=>Array.isArray(a)?(i<a.length&&j<a[i].length?a[i][j]:QX.E.NA):qxGet(a.sh,a.r1+i,a.c1+j), qxS=v=>qxIsA(v)?qxAt(v,0,0):v;
const qxT=v=>v===null||v===undefined?'':typeof v==='boolean'?(v?'TRUE':'FALSE'):typeof v==='number'?String(+v.toPrecision(15)):String(v);
function qxN(v){ if(typeof v==='number')return v; if(v===null||v===undefined)return 0; if(typeof v==='boolean')return v?1:0; if(typeof v==='string'){ const p=qxParse(v).v; return typeof p==='number'?p:QX.E.VALUE; } return qxIsE(v)?v:QX.E.VALUE; }
function qxCmp(a,b){ if(a===null)a=typeof b==='string'?'':typeof b==='boolean'?false:0; if(b===null)b=typeof a==='string'?'':typeof a==='boolean'?false:0; const ta=typeof a, tb=typeof b, rk={number:0,string:1,boolean:2}; if(ta!==tb)return rk[ta]-rk[tb]; if(ta==='string'){ a=a.toLowerCase(); b=b.toLowerCase(); } else if(ta==='number'&&a!==b&&Math.abs(a-b)<=4e-15*Math.max(Math.abs(a),Math.abs(b)))return 0; /* Excel compares at 15 significant digits */ return a<b?-1:a>b?1:0; }
function qxOp(op,a,b){ if(qxIsE(a))return a; if(qxIsE(b))return b; if(op==='&')return qxT(a)+qxT(b);
 if(op==='='||op==='<'||op==='>'||op==='<='||op==='>='||op==='<>'){ const k=qxCmp(a,b); return op==='='?k===0:op==='<'?k<0:op==='>'?k>0:op==='<='?k<=0:op==='>='?k>=0:k!==0; }
 const x=qxN(a), y=qxN(b); if(qxIsE(x))return x; if(qxIsE(y))return y;
 switch(op){ case '+':return x+y; case '-':return x-y; case '*':return x*y; case '/':return y===0?QX.E.DIV:x/y; default:{ const v=Math.pow(x,y); return isFinite(v)?v:QX.E.NUM; } } }
function qxBin(op,a,b){ const A=qxIsA(a), B=qxIsA(b); if(!A&&!B)return qxOp(op,a,b); const da=A?qxDim(a):[1,1], db=B?qxDim(b):[1,1], R=Math.max(da[0],db[0]), C=Math.max(da[1],db[1]), g=(x,is,d,i,j)=>!is?x:((d[0]===1||i<d[0])&&(d[1]===1||j<d[1]))?qxAt(x,d[0]===1?0:i,d[1]===1?0:j):QX.E.NA, out=[];
 for(let i=0;i<R;i++){ const row=[]; for(let j=0;j<C;j++)row.push(qxOp(op,g(a,A,da,i,j),g(b,B,db,i,j))); out.push(row); } return out; }
function qxMap1(v,f){ if(!qxIsA(v))return f(v); const d=qxDim(v), o=[]; for(let i=0;i<d[0];i++){ const r=[]; for(let j=0;j<d[1];j++)r.push(f(qxAt(v,i,j))); o.push(r); } return o; }
function qxEv(n,x){ switch(n[0]){
 case 'n': case 's': case 'b': case 'e': return n[1];
 case 'z': return null;
 case 'c': { const sh=n[1]?qxSh(x.wb,n[1]):x.sh; return sh?qxGet(sh,n[2],n[3]):QX.E.REF; }
 case 'R': { const sh=n[1]?qxSh(x.wb,n[1]):x.sh; return sh?{sh,r1:n[2],c1:n[3],r2:Math.min(n[4],Math.max(sh.nr-1,n[2])),c2:Math.min(n[5],Math.max(sh.nc-1,n[3]))}:QX.E.REF; }
 case 'N': { const d=x.wb.names&&x.wb.names[n[1]]; if(!d)return QX.E.NAME; const p=qxParseF(String(d).replace(/^=/,'')); return p.err||qxEv(p.ast,x); }
 case 'u': return qxMap1(qxEv(n[1],x),v=>{ v=qxN(v); return qxIsE(v)?v:-v; });
 case 'p': return qxMap1(qxEv(n[1],x),v=>{ v=qxN(v); return qxIsE(v)?v:v/100; });
 case 'o': return qxBin(n[1],qxEv(n[2],x),qxEv(n[3],x));
 case 'f': try{ const L=QX.lazy[n[1]]; if(L)return L(n[2],x); return QX.fn[n[1]](n[2].map(q=>qxEv(q,x)),x); }catch(e){ if(qxIsE(e))return e; throw e; } } return QX.E.ERROR; }
/* ---------- function library ---------- */
function qxEach(a,fn){ for(const v of a){ if(!qxIsA(v))fn(v,false); else if(Array.isArray(v)){ for(const r of v)for(const q of r)fn(q,true); } else { const sh=v.sh; for(let r=v.r1;r<=v.r2;r++)for(let c=v.c1;c<=v.c2;c++)fn(qxGet(sh,r,c),true); } } }
function qxNums(a){ const o=[]; qxEach(a,(v,rg)=>{ if(typeof v==='number')o.push(v); else if(qxIsE(v))throw v; else if(!rg&&v!==null){ const n=qxN(v); if(qxIsE(n))throw n; o.push(n); } }); return o; }
const qxWild=t=>new RegExp('^'+t.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$','i');
function qxCrit(c){ if(qxIsE(c))throw c; if(typeof c!=='string'){ if(c===null)c=0; return typeof c==='number'?v=>v===c||(typeof v==='string'&&v.trim()!==''&&+v===c):v=>v===c; }
 const m=/^(<=|>=|<>|<|>|=)([\s\S]*)$/.exec(c), op=m?m[1]:'=', t=m?m[2]:c, pv=t.trim()===''?null:qxParse(t).v;
 if(typeof pv==='number'){ const f={'=':v=>v===pv,'<>':v=>v!==pv,'<':v=>v<pv,'>':v=>v>pv,'<=':v=>v<=pv,'>=':v=>v>=pv}[op]; return op==='<>'?v=>!(typeof v==='number'&&v===pv):v=>(typeof v==='number'&&f(v))||(op==='='&&typeof v==='string'&&v.trim()!==''&&+v===pv); }
 if(typeof pv==='boolean')return op==='<>'?v=>v!==pv:v=>v===pv;
 if(op==='='||op==='<>'){ const re=qxWild(t), hit=t===''?v=>v===null||v==='':v=>typeof v==='string'&&re.test(v); return op==='='?hit:v=>!hit(v); }
 const tl=t.toLowerCase(); return v=>{ if(typeof v!=='string')return false; const k=v.toLowerCase()<tl?-1:v.toLowerCase()>tl?1:0; return op==='<'?k<0:op==='>'?k>0:op==='<='?k<=0:k>=0; }; }
function qxSel(rng,a,st,fn){ if(!qxIsA(rng))throw QX.E.VALUE; const ps=[]; for(let i=st;i+1<a.length;i+=2){ if(!qxIsA(a[i]))throw QX.E.VALUE; ps.push([a[i],qxCrit(qxS(a[i+1]))]); } const d=qxDim(ps.length?ps[0][0]:rng); for(let i=0;i<d[0];i++)for(let j=0;j<d[1];j++){ let ok=true; for(const p of ps)if(!p[1](qxAt(p[0],i,j))){ ok=false; break; } if(ok)fn(qxAt(rng,i,j)); } }
function qxFind(key,n,get,mode,rev){ if(qxIsE(key))throw key; let best=-1, bv; const wild=typeof key==='string'&&/[*?]/.test(key)&&(mode===0||mode===2), re=wild?qxWild(key):null;
 for(let q=0;q<n;q++){ const i=rev?n-1-q:q, v=get(i); if(v===null||qxIsE(v)||typeof v!==typeof key)continue; if(wild){ if(re.test(v))return i; continue; } const k=qxCmp(v,key); if(k===0)return i; if((mode===1&&k<0)||(mode===-1&&k>0)){ if(best<0||(mode===1?qxCmp(v,bv)>0:qxCmp(v,bv)<0)){ best=i; bv=v; } } } return best; }
function qxNwd(s,e,wk,hol){ s=Math.floor(s); e=Math.floor(e); const sg=e<s?-1:1, a=Math.min(s,e), b=Math.max(s,e), H=new Set(hol===undefined||hol===null?[]:qxNums([hol]).map(Math.floor)); let n=0; if(b-a>4e6)throw QX.E.NUM; for(let d=a;d<=b;d++){ if(wk.indexOf(qxDt(d).getUTCDay())<0&&!H.has(d))n++; } return sg*n; }
(function(){ const E=QX.E, num=v=>{ v=qxN(qxS(v)); if(qxIsE(v))throw v; return v; }, txt=v=>{ v=qxS(v); if(qxIsE(v))throw v; return qxT(v); }, opt=(a,i,d)=>a[i]===undefined||a[i]===null?d:num(a[i]);
 const bool=v=>{ v=qxS(v); if(qxIsE(v))throw v; if(typeof v==='string'){ const u=v.toUpperCase(); if(u==='TRUE')return true; if(u==='FALSE')return false; throw E.VALUE; } return !!v; };
 const sum=n=>{ let s=0; for(let i=0;i<n.length;i++)s+=n[i]; return s; }, avg=n=>{ if(!n.length)throw E.DIV; return sum(n)/n.length; }, vec=a=>{ if(!qxIsA(a))return [1,()=>a,true]; const d=qxDim(a), col=d[1]===1; return [col?d[0]:d[1],i=>col?qxAt(a,i,0):qxAt(a,0,i),col]; };
 const wkd=c=>{ if(c===undefined||c===null)return [6,0]; c=qxS(c); if(typeof c==='string'&&/^[01]{7}$/.test(c))return c.split('').map((x,i)=>x==='1'?(i+1)%7:-1).filter(x=>x>=0); c=num(c); if(c>=1&&c<=7)return [(c+5)%7,(c+6)%7]; if(c>=11&&c<=17)return [c-11]; throw E.NUM; };
 const logic=(a,all)=>{ let r=all, n=0; qxEach(a,(v,rg)=>{ if(qxIsE(v))throw v; if(v===null||(rg&&typeof v==='string'))return; n++; const b=bool(v); if(all?!b:b)r=!all; }); if(!n)throw E.VALUE; return r; };
 Object.assign(QX.fn,{ SUM:a=>sum(qxNums(a)), AVERAGE:a=>avg(qxNums(a)), MIN:a=>qxNums(a).reduce((m,v)=>v<m?v:m,Infinity)%Infinity||0, MAX:a=>qxNums(a).reduce((m,v)=>v>m?v:m,-Infinity)%Infinity||0,
  COUNT:a=>{ let n=0; qxEach(a,(v,rg)=>{ if(typeof v==='number'||(!rg&&v!==null&&typeof qxN(v)==='number'))n++; }); return n; }, COUNTA:a=>{ let n=0; qxEach(a,v=>{ if(v!==null)n++; }); return n; }, COUNTBLANK:a=>{ let n=0; qxEach(a,v=>{ if(v===null||v==='')n++; }); return n; },
  SUMIF:a=>{ const o=[]; qxSel(a[2]===undefined||a[2]===null?a[0]:a[2],a,0,v=>{ if(typeof v==='number')o.push(v); }); return sum(o); }, SUMIFS:a=>{ const o=[]; qxSel(a[0],a,1,v=>{ if(typeof v==='number')o.push(v); else if(qxIsE(v))throw v; }); return sum(o); },
  COUNTIF:a=>{ let n=0; qxSel(a[0],a,0,()=>n++); return n; }, COUNTIFS:a=>{ let n=0; qxSel(a[0],a,0,()=>n++); return n; },
  AVERAGEIF:a=>{ const o=[]; qxSel(a[2]===undefined||a[2]===null?a[0]:a[2],a,0,v=>{ if(typeof v==='number')o.push(v); }); return avg(o); }, AVERAGEIFS:a=>{ const o=[]; qxSel(a[0],a,1,v=>{ if(typeof v==='number')o.push(v); }); return avg(o); },
  SUMPRODUCT:a=>{ const d=a.map(v=>qxIsA(v)?qxDim(v):[1,1]); let s=0; for(const q of d)if(q[0]!==d[0][0]||q[1]!==d[0][1])throw E.VALUE; for(let i=0;i<d[0][0];i++)for(let j=0;j<d[0][1];j++){ let p=1; for(const v of a){ const q=qxIsA(v)?qxAt(v,i,j):v; if(qxIsE(q))throw q; p*=typeof q==='number'?q:0; } s+=p; } return s; },
  ROUND:a=>qxRound(num(a[0]),opt(a,1,0),0), ROUNDUP:a=>qxRound(num(a[0]),opt(a,1,0),1), ROUNDDOWN:a=>qxRound(num(a[0]),opt(a,1,0),-1), INT:a=>Math.floor(num(a[0])), ABS:a=>Math.abs(num(a[0])), SQRT:a=>{ const v=num(a[0]); if(v<0)throw E.NUM; return Math.sqrt(v); }, POWER:a=>qxOp('^',num(a[0]),num(a[1])), MOD:a=>{ const x=num(a[0]), y=num(a[1]); if(!y)throw E.DIV; return x-y*Math.floor(x/y); }, PI:()=>Math.PI,
  AND:a=>logic(a,true), OR:a=>logic(a,false), NOT:a=>!bool(a[0]), ISBLANK:a=>qxS(a[0])===null, ISNUMBER:a=>typeof qxS(a[0])==='number', ISTEXT:a=>typeof qxS(a[0])==='string', ISERROR:a=>qxIsE(qxS(a[0])), NA:()=>{ throw E.NA; },
  VLOOKUP:a=>{ const t=a[1]; if(!qxIsA(t))throw E.VALUE; const d=qxDim(t), col=num(a[2]); if(col<1||col>d[1])throw E.REF; const i=qxFind(qxS(a[0]),d[0],q=>qxAt(t,q,0),a[3]===undefined||a[3]===null||bool(a[3])?1:0); if(i<0)throw E.NA; return qxAt(t,i,col-1); },
  HLOOKUP:a=>{ const t=a[1]; if(!qxIsA(t))throw E.VALUE; const d=qxDim(t), row=num(a[2]); if(row<1||row>d[0])throw E.REF; const j=qxFind(qxS(a[0]),d[1],q=>qxAt(t,0,q),a[3]===undefined||a[3]===null||bool(a[3])?1:0); if(j<0)throw E.NA; return qxAt(t,row-1,j); },
  XLOOKUP:a=>{ const L=vec(a[1]), mm=opt(a,4,0), i=qxFind(qxS(a[0]),L[0],L[1],mm===-1?1:mm===1?-1:mm,opt(a,5,1)<0); if(i<0){ if(a[3]===undefined||a[3]===null)throw E.NA; return qxS(a[3]); } if(!qxIsA(a[2]))return a[2]; return L[2]?qxAt(a[2],i,0):qxAt(a[2],0,i); },
  MATCH:a=>{ const L=vec(a[1]), i=qxFind(qxS(a[0]),L[0],L[1],opt(a,2,1)); if(i<0)throw E.NA; return i+1; },
  INDEX:a=>{ const t=a[0]; if(!qxIsA(t))return t; const d=qxDim(t); let r=opt(a,1,1), c=opt(a,2,0); if(!c){ if(d[0]===1&&d[1]>1){ c=r; r=1; } else c=1; } r=r||1; if(r<1||r>d[0]||c<1||c>d[1])throw E.REF; return qxAt(t,r-1,c-1); },
  CONCAT:a=>{ let s=''; qxEach(a,v=>{ if(qxIsE(v))throw v; s+=qxT(v); }); return s; }, TEXTJOIN:a=>{ const d=txt(a[0]), ig=bool(a[1]), o=[]; qxEach(a.slice(2),v=>{ if(qxIsE(v))throw v; const t=qxT(v); if(t!==''||!ig)o.push(t); }); return o.join(d); },
  LEFT:a=>txt(a[0]).slice(0,Math.max(0,opt(a,1,1))), RIGHT:a=>{ const s=txt(a[0]), n=Math.max(0,opt(a,1,1)); return n?s.slice(-n):''; }, MID:a=>{ const st=num(a[1]); if(st<1)throw E.VALUE; return txt(a[0]).substr(st-1,Math.max(0,num(a[2]))); }, LEN:a=>txt(a[0]).length, TRIM:a=>txt(a[0]).replace(/ +/g,' ').trim(), UPPER:a=>txt(a[0]).toUpperCase(), LOWER:a=>txt(a[0]).toLowerCase(),
  TEXT:a=>{ let v=qxS(a[0]); if(qxIsE(v))throw v; if(typeof v==='string'){ const p=qxParse(v).v; if(typeof p==='number')v=p; } return qxFmt(v===null?0:v,txt(a[1])); }, VALUE:a=>num(a[0]),
  DATE:a=>qxYmd(num(a[0]),num(a[1]),num(a[2])), TODAY:()=>{ const d=new Date(); return qxYmd(d.getFullYear(),d.getMonth()+1,d.getDate()); }, NOW:()=>{ const d=new Date(); return qxYmd(d.getFullYear(),d.getMonth()+1,d.getDate())+(d.getHours()*3600+d.getMinutes()*60+d.getSeconds())/86400; },
  YEAR:a=>qxDt(num(a[0])).getUTCFullYear(), MONTH:a=>qxDt(num(a[0])).getUTCMonth()+1, DAY:a=>qxDt(num(a[0])).getUTCDate(), WEEKDAY:a=>qxDt(num(a[0])).getUTCDay()+1,
  EDATE:a=>{ const d=qxDt(num(a[0])), m=d.getUTCMonth()+Math.trunc(num(a[1])), y=d.getUTCFullYear()+Math.floor(m/12), mm=((m%12)+12)%12; return qxYmd(y,mm+1,Math.min(d.getUTCDate(),new Date(Date.UTC(y,mm+1,0)).getUTCDate())); },
  EOMONTH:a=>{ const d=qxDt(num(a[0])); return qxYmd(d.getUTCFullYear(),d.getUTCMonth()+2+Math.trunc(num(a[1])),0); }, NETWORKDAYS:a=>qxNwd(num(a[0]),num(a[1]),[6,0],a[2]), 'NETWORKDAYS.INTL':a=>qxNwd(num(a[0]),num(a[1]),wkd(a[2]),a[3]) });
 QX.fn.CONCATENATE=QX.fn.CONCAT;
 const pick=(n,x,i,d)=>i<n.length&&n[i][0]!=='z'?qxEv(n[i],x):d;
 Object.assign(QX.lazy,{ IF:(n,x)=>{ const c=qxS(qxEv(n[0],x)); if(qxIsE(c))return c; return bool(c)?pick(n,x,1,true):pick(n,x,2,false); }, IFS:(n,x)=>{ for(let i=0;i+1<n.length;i+=2){ const c=qxS(qxEv(n[i],x)); if(qxIsE(c))return c; if(bool(c))return qxEv(n[i+1],x); } return E.NA; },
  IFERROR:(n,x)=>{ const v=qxS(qxEv(n[0],x)); return qxIsE(v)?pick(n,x,1,''):v; }, IFNA:(n,x)=>{ const v=qxS(qxEv(n[0],x)); return v===E.NA?pick(n,x,1,''):v; } });
 'SUM(number1, [number2], …)|SUMIF(range, criteria, [sum_range])|SUMIFS(sum_range, criteria_range1, criteria1, …)|SUMPRODUCT(array1, [array2], …)|COUNT(value1, …)|COUNTA(value1, …)|COUNTBLANK(range)|COUNTIF(range, criteria)|COUNTIFS(criteria_range1, criteria1, …)|AVERAGE(number1, …)|AVERAGEIF(range, criteria, [average_range])|AVERAGEIFS(average_range, criteria_range1, criteria1, …)|MIN(number1, …)|MAX(number1, …)|ROUND(number, digits)|ROUNDUP(number, digits)|ROUNDDOWN(number, digits)|INT(number)|ABS(number)|SQRT(number)|POWER(number, power)|MOD(number, divisor)|PI()|IF(test, value_if_true, [value_if_false])|IFS(test1, value1, [test2, value2], …)|AND(logical1, …)|OR(logical1, …)|NOT(logical)|IFERROR(value, value_if_error)|IFNA(value, value_if_na)|ISBLANK(value)|ISNUMBER(value)|ISTEXT(value)|ISERROR(value)|NA()|VLOOKUP(lookup_value, table, col_index, [approximate=TRUE])|HLOOKUP(lookup_value, table, row_index, [approximate=TRUE])|XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])|INDEX(array, row, [column])|MATCH(lookup_value, lookup_array, [match_type=1])|CONCAT(text1, …)|CONCATENATE(text1, …)|TEXTJOIN(delimiter, ignore_empty, text1, …)|LEFT(text, [chars])|RIGHT(text, [chars])|MID(text, start, chars)|LEN(text)|TRIM(text)|UPPER(text)|LOWER(text)|TEXT(value, format)|VALUE(text)|DATE(year, month, day)|TODAY()|NOW()|YEAR(date)|MONTH(date)|DAY(date)|WEEKDAY(date)|EDATE(start_date, months)|EOMONTH(start_date, months)|NETWORKDAYS(start, end, [holidays])|NETWORKDAYS.INTL(start, end, [weekend], [holidays])'.split('|').forEach(s=>{ QX.help[s.split('(')[0]]=s; }); })();
/* ---------- dependency graph + recalculation ---------- */
function qxDeps(w,sh,p){ const o=[], add=rf=>{ const t=rf.s?qxSh(w,rf.s):sh; if(t)o.push({t,r1:rf.r1,c1:rf.c1,r2:rf.r2,c2:rf.c2}); }; p.refs.forEach(add); p.names.forEach(nm=>{ const d=w.names&&w.names[nm]; if(d){ const q=qxParseF(String(d).replace(/^=/,'')); if(!q.err)q.refs.forEach(add); } }); return o; }
function qxReg(w,sh,k){ const rt=qxRt(sh), p=qxParseF(sh.cells[k].slice(1)), c=k%16384, ds=p.err?[]:qxDeps(w,sh,p); rt.fc[c]=(rt.fc[c]||0)+1; rt.dep.set(k,ds);
 for(const d of ds){ const tr=qxRt(d.t), e={s:sh,k,d}; if(d.r1===d.r2&&d.c1===d.c2){ const tk=d.r1*16384+d.c1; let a=tr.rev.get(tk); if(!a)tr.rev.set(tk,a=[]); a.push(e); } else if(d.c2-d.c1<8){ for(let cc=d.c1;cc<=d.c2;cc++)(tr.rdc[cc]||(tr.rdc[cc]=[])).push(e); } else tr.rdw.push(e); } }
function qxUnreg(sh,k){ const rt=qxRt(sh), ds=rt.dep.get(k), c=k%16384; if(!ds)return; rt.dep.delete(k); rt.fc[c]--; rt.val.delete(k); if(rt.st.has(k)){ rt.st.delete(k); rt.dc[c]--; }
 const rm=a=>{ if(a)for(let i=a.length-1;i>=0;i--)if(a[i].s===sh&&a[i].k===k)a.splice(i,1); };
 for(const d of ds){ const tr=qxRt(d.t); if(d.r1===d.r2&&d.c1===d.c2)rm(tr.rev.get(d.r1*16384+d.c1)); else if(d.c2-d.c1<8){ for(let cc=d.c1;cc<=d.c2;cc++)rm(tr.rdc[cc]); } else rm(tr.rdw); } }
function qxMark(sh,k){ const rt=qxRt(sh); if(rt.st.has(k))return false; rt.st.set(k,1); const c=k%16384; rt.dc[c]=(rt.dc[c]||0)+1; return true; }
function qxTouch(sh,k){ const stack=[sh,k]; while(stack.length){ const key=stack.pop(), s=stack.pop(), rt=qxRt(s), r=Math.floor(key/16384), c=key%16384, hit=e=>{ if(qxMark(e.s,e.k))stack.push(e.s,e.k); };
  const a=rt.rev.get(key), b=rt.rdc[c]; if(a)for(const e of a)hit(e); if(b)for(const e of b)if(r>=e.d.r1&&r<=e.d.r2)hit(e); for(const e of rt.rdw){ const d=e.d; if(r>=d.r1&&r<=d.r2&&c>=d.c1&&c<=d.c2)hit(e); } } }
function qxSet(w,sh,r,c,raw){ const k=r*16384+c, old=sh.cells[k]; if(raw===null||raw==='')raw=undefined; if(old===raw)return false; if(qxIsF(old))qxUnreg(sh,k);
 if(raw===undefined)delete sh.cells[k]; else { sh.cells[k]=raw; if(r>=sh.nr)sh.nr=r+1; if(c>=sh.nc)sh.nc=c+1; } if(qxIsF(raw)){ qxReg(w,sh,k); qxMark(sh,k); } qxTouch(sh,k); return true; }
function qxCalc(w,sh,k){ const p=qxParseF(sh.cells[k].slice(1)), r=Math.floor(k/16384), c=k%16384; if(p.err)return p.err; let v; try{ v=qxEv(p.ast,{wb:w,sh,r,c}); if(qxIsA(v))v=Array.isArray(v)?v[0][0]:qxAt(v,v.c1===v.c2&&v.sh===sh&&r>=v.r1&&r<=v.r2?r-v.r1:0,v.r1===v.r2&&v.sh===sh&&c>=v.c1&&c<=v.c2?c-v.c1:0); }catch(e){ v=qxIsE(e)?e:QX.E.VALUE; }
 return v===null||v===undefined?0:(typeof v==='number'&&!isFinite(v))?QX.E.NUM:v; }
/* evaluates every dirty formula once, precedents first (iterative depth-first, so a 20,000-long chain cannot overflow the stack); a cell met again while it is still being worked on is a circular reference */
function qxFlush(w){ let n=0; for(const sh of w.sheets){ const rt0=qxRt(sh); if(!rt0.st.size)continue; for(const k0 of Array.from(rt0.st.keys())){ if(rt0.st.get(k0)!==1)continue; const stack=[sh,k0];
   while(stack.length){ const k=stack[stack.length-1], s=stack[stack.length-2], r=s.$, st=r.st.get(k); if(st===undefined){ stack.length-=2; continue; }
    if(st===2){ stack.length-=2; r.val.set(k,qxCalc(w,s,k)); r.st.delete(k); r.dc[k%16384]--; n++; continue; }
    r.st.set(k,2); for(const d of r.dep.get(k)||[]){ const tr=d.t.$; if(!tr||!tr.st.size)continue; if(d.r1===d.r2&&d.c1===d.c2){ const tk=d.r1*16384+d.c1; if(tr.st.get(tk)===1)stack.push(d.t,tk); continue; }
     const c2=Math.min(d.c2,d.t.nc-1), r2=Math.min(d.r2,d.t.nr-1); let any=false; for(let cc=d.c1;cc<=c2;cc++)if(tr.dc[cc]>0){ any=true; break; } if(!any)continue;
     if((r2-d.r1+1)*(c2-d.c1+1)>tr.st.size){ for(const q of tr.st){ if(q[1]===1){ const rr=Math.floor(q[0]/16384), cc=q[0]%16384; if(rr>=d.r1&&rr<=r2&&cc>=d.c1&&cc<=c2)stack.push(d.t,q[0]); } } }
     else for(let rr=d.r1;rr<=r2;rr++)for(let cc=d.c1;cc<=c2;cc++){ const dk=rr*16384+cc; if(tr.st.get(dk)===1)stack.push(d.t,dk); } } } } }
 QX.ver++; return n; }
function qxRecalcAll(w){ const def=qxSheet(''), fs=[]; w.names=w.names||{}; w.pivots=w.pivots||[]; if(!(w.cur>=0&&w.cur<w.sheets.length))w.cur=0;
 for(const sh of w.sheets){ for(const f in def)if(sh[f]===undefined)sh[f]=JSON.parse(JSON.stringify(def[f])); if('$' in sh)sh.$=null; qxRt(sh); sh.nr=0; sh.nc=0; for(const ks in sh.cells){ const k=+ks, r=Math.floor(k/16384), c=k%16384; if(r>=sh.nr)sh.nr=r+1; if(c>=sh.nc)sh.nc=c+1; if(qxIsF(sh.cells[ks]))fs.push(sh,k); } }
 for(let i=0;i<fs.length;i+=2){ qxReg(w,fs[i],fs[i+1]); qxMark(fs[i],fs[i+1]); } return qxFlush(w); }
/* ---------- formula text rewriting: relative copy/fill, insert/delete rows and columns ---------- */
function qxRw(f,cb){ const tk=f.match(QXT)||[]; let out='', sh=null; const cell=t=>{ const m=/^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(t||''); return m?{ac:m[1],c:qxCI(m[2].toUpperCase()),ar:m[3],r:+m[4]-1}:null; }, tx=p=>(p.c<0?'':p.ac+qxCN(p.c))+(p.r<0?'':p.ar+(p.r+1));
 for(let i=0;i<tk.length;i++){ const t=tk[i]; let a=null, b=null, m;
  if(t.length>1&&t[t.length-1]==='!'&&t[0]!=='"'&&t[0]!=='#'){ sh=qxUq(t); out+=t; continue; }
  if(tk[i+1]!=='('&&(a=cell(t))){ if(tk[i+1]===':'&&(b=cell(tk[i+2])))i+=2; }
  else if((m=/^(\$?)([A-Za-z]{1,3}):(\$?)([A-Za-z]{1,3})$/.exec(t))&&tk[i+1]!=='('){ a={ac:m[1],c:qxCI(m[2].toUpperCase()),ar:'',r:-1}; b={ac:m[3],c:qxCI(m[4].toUpperCase()),ar:'',r:-1}; }
  else if((m=/^(\$?)(\d+):(\$?)(\d+)$/.exec(t))){ a={ac:'',c:-1,ar:m[1],r:+m[2]-1}; b={ac:'',c:-1,ar:m[3],r:+m[4]-1}; }
  if(a){ const q=cb(sh,a,b); out+=q?tx(q[0])+(q[1]?':'+tx(q[1]):''):'#REF!'; } else out+=t; if(!/^\s+$/.test(t))sh=null; }
 return out; }
function qxShiftF(f,dr,dc){ const mv=p=>{ if(p.c>=0&&!p.ac){ p.c+=dc; if(p.c<0||p.c>16383)return false; } if(p.r>=0&&!p.ar){ p.r+=dr; if(p.r<0||p.r>1048575)return false; } return true; }; return qxRw(f,(s,a,b)=>mv(a)&&(!b||mv(b))?[a,b]:null); }
function qxMoveF(f,own,ax,at,n){ const del=n<0?-n:0; return qxRw(f,(s,a,b)=>{ if(!own(s))return [a,b]; const one=(p,end)=>{ let v=p[ax]; if(v<0)return true; if(del&&v>=at&&v<at+del){ if(!b)return false; v=end?at-1:at; } else if(v>=at)v+=n; p[ax]=v; return true; }; if(!one(a,false))return null; if(b){ one(b,true); if(b[ax]>=0&&b[ax]<a[ax])return null; } return [a,b]; }); }
