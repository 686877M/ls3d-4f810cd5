/* ====================== gantt.js: Gantt chart view for the P.X schedule (prefix gt) ======================
   Reads ACT / WBSN / PS / CAL and the CPM results (sDate, fDate, lfDate, tf, crit, preds) that computeSched() writes.
   Writes back only through the same fields the P.X window uses (a.cs, a.fix, a.d, a.base) and then p6Save().
   Rendering: one sticky inline SVG that draws only the visible rows / dates, so 500 activities stay smooth. */
const GT={box:null,vp:null,svg:null,inner:null,lrows:null,lhead:null,left:null,st:null,g:null,rows:[],idx:{},succ:{},drag:null,cols:1,bars:3,pline:false,page:'landscape',raf:0,dirty:true,lw:300};
const GTPX={day:24,week:7,month:2.2}, GTRH=22, GTHH=40, GTCW={dur:40,start:76,finish:76,tf:34,pct:38}, GTCOLS=[['dur'],['dur','start','finish'],['dur','start','finish','tf','pct']];
const GTCD={fg:'currentColor',mut:'#8a96a3',grid:'rgba(128,128,128,.22)',bar:'#1976d2',crit:'#e53935',prog:'#0d47a1',flt:'#9e9e9e',base:'#43a047',dd:'#43a047',td:'#ff9800',ms:'#9c4fc2',arr:'#78909c',sel:'rgba(25,118,210,.16)',stripe:'rgba(128,128,128,.07)',off:'rgba(128,128,128,.10)',pl:'#ff5722',tag:'#6a1b9a',hbg:null};
const GTCP=Object.assign({},GTCD,{fg:'#000',mut:'#555',grid:'#ddd',crit:'#d32f2f',stripe:'#f6f6f6',off:'#f0f0f0',hbg:'#eee'});
const gtL=()=>lang==='ar'?1:0;
const gtEsc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const gtN=n=>Math.round(n*10)/10;
const gtMON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function gtRows(){ const rows=[], by={}; ACT.forEach(a=>{ (by[a.wbs]=by[a.wbs]||[]).push(a); });
 Object.keys(WBSN).concat(Object.keys(by).filter(k=>!(k in WBSN))).forEach(w=>{ const acts=(by[w]||[]).filter(a=>!PS.crit||a.crit); if(!acts.length)return; if(PS.group)rows.push({k:'w',w,acts}); if(!PS.group||!PS.collapsed[w])acts.forEach(a=>rows.push({k:'a',a})); });
 return rows; }
/* prepare rows, time geometry and successor map; call after any data change */
function gtPrep(){ if(!GT.box)return; GT.rows=gtRows(); GT.idx={}; GT.rows.forEach((r,i)=>{ if(r.k==='a')GT.idx[r.a.id]=i; });
 GT.succ={}; ACT.forEach(a=>(a.preds||[]).forEach(p=>{ (GT.succ[p.id]=GT.succ[p.id]||[]).push([a,p]); }));
 const px=GTPX[PS.zoom]||7; let lo=Infinity, hi=-Infinity; ACT.forEach(a=>{ if(a.sDate==null)return; lo=Math.min(lo,a.sDate); hi=Math.max(hi,a.fDate,a.lfDate||0); if(a.base){ lo=Math.min(lo,D0(a.base.s)); hi=Math.max(hi,D0(a.base.f)); } });
 if(!isFinite(lo)){ lo=D0(PS.start); hi=lo+30*MS; } lo-=3*MS; hi+=12*MS;
 GT.g={px,lo,hi,W:Math.round((hi-lo)/MS*px)+40,H:GTHH+GT.rows.length*GTRH+10,X:ms=>(ms-lo)/MS*px};
 GT.inner.style.width=GT.g.W+'px'; GT.inner.style.height=GT.g.H+'px';
 const cw=GTCOLS[GT.cols].reduce((s,k)=>s+GTCW[k],0); GT.lw=52+190+cw; GT.left.style.width=GT.lw+'px'; gtLeftHead(); GT.dirty=false; }
/* bar x extent of an activity, including a live drag offset */
function gtXY(a){ const G=GT.g, d=GT.drag; let s=G.X(a.sDate), e=G.X(a.fDate+MS); if(d&&d.id===a.id){ if(d.mode==='m'){ s+=d.dx; e+=d.dx; } else e+=d.dx; if(e<s+G.px)e=s+G.px; } return [s,e]; }
const gtAnc=(a,w)=>{ const [s,e]=gtXY(a); return a.d===0?(a.ms==='fin'?e:s):(w==='s'?s:e); };
function gtHead(G,o,c){ const {px,lo,X}=G, y0=o.hy, zm=PS.zoom==='month', v0=lo+Math.floor(o.x0/px)*MS-MS, v1=lo+Math.ceil(o.x1/px)*MS+MS; let s='';
 s+='<rect x="'+o.x0+'" y="'+y0+'" width="'+(o.x1-o.x0)+'" height="'+GTHH+'" '+(c.hbg?'fill="'+c.hbg+'"':'style="fill:var(--panel,#222)"')+'/>';
 const d0=new Date(v0); let d=zm?Date.UTC(d0.getUTCFullYear(),0,1):Date.UTC(d0.getUTCFullYear(),d0.getUTCMonth(),1);
 while(d<v1){ const q=new Date(d), n=zm?Date.UTC(q.getUTCFullYear()+1,0,1):Date.UTC(q.getUTCFullYear(),q.getUTCMonth()+1,1); s+='<rect x="'+gtN(X(d))+'" y="'+y0+'" width="'+gtN(X(n)-X(d))+'" height="20" fill="none" stroke="'+c.grid+'"/><text x="'+gtN(X(d)+3)+'" y="'+(y0+14)+'" fill="'+c.fg+'" font-weight="700">'+(zm?q.getUTCFullYear():gtMON[q.getUTCMonth()]+' '+q.getUTCFullYear())+'</text>'; d=n; }
 if(zm){ let m=Date.UTC(d0.getUTCFullYear(),d0.getUTCMonth(),1); while(m<v1){ const q=new Date(m); s+='<line x1="'+gtN(X(m))+'" y1="'+(y0+20)+'" x2="'+gtN(X(m))+'" y2="'+(y0+GTHH)+'" stroke="'+c.grid+'"/><text x="'+gtN(X(m)+3)+'" y="'+(y0+34)+'" fill="'+c.mut+'" font-size="9">'+gtMON[q.getUTCMonth()]+'</text>'; m=Date.UTC(q.getUTCFullYear(),q.getUTCMonth()+1,1); } }
 else { const step=PS.zoom==='day'?1:7; let t=step===1?v0:v0-((new Date(v0).getUTCDay()+1)%7)*MS; for(;t<v1;t+=step*MS)s+='<line x1="'+gtN(X(t))+'" y1="'+(y0+20)+'" x2="'+gtN(X(t))+'" y2="'+(y0+GTHH)+'" stroke="'+c.grid+'"/><text x="'+gtN(X(t)+2)+'" y="'+(y0+34)+'" fill="'+c.mut+'" font-size="9">'+new Date(t).getUTCDate()+'</text>'; }
 return s; }
function gtArrow(G,p,pr,a,c,Y){ const ty=p.type||'FS', y1=Y(GT.idx[pr.id])+9, y2=Y(GT.idx[a.id])+9, fromE=ty==='FS'||ty==='FF', toS=ty==='FS'||ty==='SS', x1=gtAnc(pr,fromE?'e':'s'), x2=gtAnc(a,toS?'s':'e'), dir=y2>=y1?1:-1, ym=y1+dir*11, col=(pr.crit&&a.crit)?c.crit:c.arr; let d;
 if(ty==='FS'){ const xs=x1+6, xe=x2-6; d=xs<=xe?'M'+x1+' '+y1+'H'+xs+'V'+y2+'H'+x2:'M'+x1+' '+y1+'H'+xs+'V'+ym+'H'+xe+'V'+y2+'H'+x2; }
 else if(ty==='SS'){ const vx=Math.min(x1,x2)-6; d='M'+x1+' '+y1+'H'+vx+'V'+y2+'H'+x2; }
 else if(ty==='FF'){ const vx=Math.max(x1,x2)+6; d='M'+x1+' '+y1+'H'+vx+'V'+y2+'H'+x2; }
 else { const xs=x1-6, xe=x2+6; d=xs>=xe?'M'+x1+' '+y1+'H'+xs+'V'+y2+'H'+x2:'M'+x1+' '+y1+'H'+xs+'V'+ym+'H'+xe+'V'+y2+'H'+x2; }
 const hd=toS?[x2,y2,x2-5,y2-3,x2-5,y2+3]:[x2,y2,x2+5,y2-3,x2+5,y2+3], lag=+p.lag||0, lab=ty!=='FS'||lag?ty+(lag?(lag>0?'+':'')+lag:''):'';
 return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="1"/><polygon points="'+hd.join(' ')+'" fill="'+col+'"/>'+(lab?'<text x="'+(x1+(fromE?8:-8))+'" y="'+(y1-2)+'" font-size="8" fill="'+c.mut+'"'+(fromE?'':' text-anchor="end"')+'>'+lab+'</text>':''); }
/* the SVG body for a window o={x0,x1,y0,y1,hy,paper}; the same function draws the screen view and the full export */
function gtBody(rows,o){ const G=GT.g, c=o.paper?GTCP:GTCD, X=G.X, px=G.px, Y=i=>GTHH+i*GTRH, L=gtL();
 const r0=Math.max(0,Math.floor((o.y0-GTHH)/GTRH)-1), r1=Math.min(rows.length-1,Math.ceil((o.y1-GTHH)/GTRH)+1), ddx=X(D0(PS.dd)), tdx=X(D0(ISO(Date.now()))); let s='';
 if(PS.zoom==='day'){ const v0=G.lo+Math.floor(o.x0/px)*MS, v1=G.lo+Math.ceil(o.x1/px)*MS; for(let t=v0;t<v1;t+=MS)if(!isWork(t))s+='<rect x="'+gtN(X(t))+'" y="'+Math.max(o.y0,GTHH)+'" width="'+px+'" height="'+(o.y1-Math.max(o.y0,GTHH))+'" fill="'+c.off+'"/>'; }
 const step=PS.zoom==='day'?1:PS.zoom==='week'?7:0, v0=G.lo+Math.floor(o.x0/px)*MS-MS, v1=G.lo+Math.ceil(o.x1/px)*MS+MS;
 if(step){ let t=step===1?v0:v0-((new Date(v0).getUTCDay()+1)%7)*MS; for(;t<v1;t+=step*MS)s+='<line x1="'+gtN(X(t))+'" y1="'+GTHH+'" x2="'+gtN(X(t))+'" y2="'+o.y1+'" stroke="'+c.grid+'"/>'; }
 else { let m=new Date(v0); m=Date.UTC(m.getUTCFullYear(),m.getUTCMonth(),1); while(m<v1){ s+='<line x1="'+gtN(X(m))+'" y1="'+GTHH+'" x2="'+gtN(X(m))+'" y2="'+o.y1+'" stroke="'+c.grid+'"/>'; const q=new Date(m); m=Date.UTC(q.getUTCFullYear(),q.getUTCMonth()+1,1); } }
 for(let i=r0;i<=r1;i++){ const r=rows[i], yy=Y(i); if(PS.sel&&r.k==='a'&&r.a.id===PS.sel)s+='<rect x="'+o.x0+'" y="'+yy+'" width="'+(o.x1-o.x0)+'" height="'+GTRH+'" fill="'+c.sel+'"/>'; else if(i%2)s+='<rect x="'+o.x0+'" y="'+yy+'" width="'+(o.x1-o.x0)+'" height="'+GTRH+'" fill="'+c.stripe+'"/>';
  if(r.k==='w'){ const a=Math.min(...r.acts.map(x=>x.sDate)), b=Math.max(...r.acts.map(x=>x.fDate))+MS, xa=X(a), xb=X(b); s+='<rect x="'+gtN(xa)+'" y="'+(yy+6)+'" width="'+gtN(xb-xa)+'" height="5" fill="'+c.fg+'"/><path d="M'+gtN(xa)+' '+(yy+11)+'l0 5 l5 -5z M'+gtN(xb)+' '+(yy+11)+'l0 5 l-5 -5z" fill="'+c.fg+'"/>'; continue; }
  const a=r.a, [x1,x2]=gtXY(a), col=a.crit?c.crit:c.bar, tip='<title>'+gtEsc(a.id+' '+a.n[L]+' · '+ISO(a.sDate)+' → '+ISO(a.fDate)+' · TF '+a.tf)+'</title>'; let lx;
  if(a.d===0){ const xm=a.ms==='fin'?x2:x1; s+='<path data-a="'+a.id+'" data-h="m" d="M'+gtN(xm)+' '+(yy+3)+'l7 7 l-7 7 l-7 -7z" fill="'+(a.crit?c.crit:c.ms)+'" style="cursor:grab">'+tip+'</path>'; lx=xm+10; }
  else { lx=x2;
   if(GT.bars>=2&&a.tf>0){ const fe=X(a.lfDate+MS); if(fe>x2){ s+='<line x1="'+gtN(x2)+'" y1="'+(yy+9)+'" x2="'+gtN(fe)+'" y2="'+(yy+9)+'" stroke="'+c.flt+'" stroke-width="2"/>'; lx=fe; } }
   s+='<rect data-a="'+a.id+'" data-h="m" x="'+gtN(x1)+'" y="'+(yy+4)+'" width="'+gtN(Math.max(2,x2-x1))+'" height="10" rx="1.5" fill="'+col+'" style="cursor:grab">'+tip+'</rect>';
   if(GT.bars>=1&&a.pct>0)s+='<rect x="'+gtN(x1)+'" y="'+(yy+7)+'" width="'+gtN(Math.max(1,(x2-x1)*Math.min(100,a.pct)/100))+'" height="4" fill="'+c.prog+'" pointer-events="none"/>';
   if(GT.bars>=3&&a.base)s+='<rect x="'+gtN(X(D0(a.base.s)))+'" y="'+(yy+15)+'" width="'+gtN(Math.max(2,X(D0(a.base.f)+MS)-X(D0(a.base.s))))+'" height="4" fill="'+c.base+'"><title>'+gtEsc('Baseline '+a.base.s+' → '+a.base.f)+'</title></rect>';
   if(!o.paper)s+='<rect data-a="'+a.id+'" data-h="r" x="'+gtN(x2-4)+'" y="'+(yy+4)+'" width="6" height="10" fill="transparent" style="cursor:ew-resize"/>'; }
  s+='<text x="'+gtN(lx+5)+'" y="'+(yy+13)+'" font-size="9" fill="'+c.mut+'">'+gtEsc(a.d===0?a.n[L]:a.id)+'</text>';
  if(a.src==='rx'){ const tx=lx+5+(a.d===0?String(a.n[L]).length:String(a.id).length)*5.4+4; s+='<rect x="'+gtN(tx)+'" y="'+(yy+5)+'" width="16" height="10" rx="3" fill="'+c.tag+'"/><text x="'+gtN(tx+8)+'" y="'+(yy+13)+'" font-size="7.5" font-weight="700" fill="#fff" text-anchor="middle">RX</text>'; } }
 if(PS.showRel){ const seen={}; for(let i=r0;i<=r1;i++){ const r=rows[i]; if(r.k!=='a')continue; const a=r.a; (a.preds||[]).forEach(p=>{ const pr=GT.idx[p.id]!==undefined&&rows[GT.idx[p.id]].a; const k=p.id+'>'+a.id; if(pr&&!seen[k]){ seen[k]=1; s+=gtArrow(G,p,pr,a,c,Y); } }); (GT.succ[a.id]||[]).forEach(([b,p])=>{ const k=a.id+'>'+b.id; if(GT.idx[b.id]!==undefined&&!seen[k]){ seen[k]=1; s+=gtArrow(G,p,a,b,c,Y); } }); } }
 if(GT.pline){ let pts=[]; for(let i=Math.max(0,r0-1);i<=Math.min(rows.length-1,r1+1);i++){ const r=rows[i], a=r.k==='a'&&r.a; const x=a&&a.d>0&&a.pct>0&&a.pct<100?X(a.sDate)+(X(a.fDate+MS)-X(a.sDate))*a.pct/100:ddx; pts.push(gtN(x)+','+(Y(i)+GTRH/2)); } if(pts.length>1)s+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+c.pl+'" stroke-width="1.5" stroke-dasharray="3 2" pointer-events="none"/>'; }
 s+='<line x1="'+gtN(ddx)+'" y1="'+GTHH+'" x2="'+gtN(ddx)+'" y2="'+o.y1+'" stroke="'+c.dd+'" stroke-width="1.5" stroke-dasharray="4 3"><title>'+gtEsc(b2('Data date ','تاريخ البيانات ')+PS.dd)+'</title></line>';
 s+='<line x1="'+gtN(tdx)+'" y1="'+GTHH+'" x2="'+gtN(tdx)+'" y2="'+o.y1+'" stroke="'+c.td+'" stroke-width="1.5"><title>'+gtEsc(b2('Today ','النهارده ')+ISO(Date.now()))+'</title></line><text x="'+gtN(tdx+3)+'" y="'+(o.hy+GTHH+10)+'" font-size="8" fill="'+c.td+'">'+b2('today','النهارده')+'</text>';
 return s+gtHead(G,o,c); }
function gtLeftHead(){ const L=gtL(), cs=GTCOLS[GT.cols], nm={dur:b2('Dur','مدة'),start:b2('Start','البداية'),finish:b2('Finish','النهاية'),tf:'TF',pct:'%'}; GT.lhead.innerHTML='<span style="width:52px">ID</span><span style="width:190px">'+b2('Activity','النشاط')+'</span>'+cs.map(k=>'<span style="width:'+GTCW[k]+'px">'+nm[k]+'</span>').join(''); }
function gtLeft(){ const vp=GT.vp, L=gtL(), st=vp.scrollTop, rows=GT.rows, cs=GTCOLS[GT.cols], a0=Math.max(0,Math.floor(st/GTRH)), a1=Math.min(rows.length-1,Math.ceil((st+vp.clientHeight-GTHH)/GTRH)); let h='';
 for(let i=a0;i<=a1;i++){ const r=rows[i], top=i*GTRH-st, base='position:absolute;left:0;right:0;top:'+top+'px;height:'+GTRH+'px;display:flex;align-items:center;white-space:nowrap;overflow:hidden;box-sizing:border-box;';
  if(r.k==='w'){ h+='<div data-w="'+gtEsc(r.w)+'" style="'+base+'font-weight:700;padding:0 4px;cursor:pointer;background:rgba(128,128,128,.12)">'+(PS.collapsed[r.w]?'▶ ':'▼ ')+gtEsc(r.w+'  '+(WBSN[r.w]?WBSN[r.w][L]:r.w))+' ('+r.acts.length+')</div>'; continue; }
  const a=r.a, sel=PS.sel===a.id, cell={dur:a.d===0?'◆':a.d+b2('d','ي'),start:ISO(a.sDate),finish:ISO(a.fDate),tf:a.tf,pct:(a.pct||0)+'%'};
  h+='<div data-id="'+gtEsc(a.id)+'" style="'+base+'padding:0 4px;cursor:pointer;'+(sel?'background:rgba(25,118,210,.25);':i%2?'background:rgba(128,128,128,.07);':'')+'"><span style="width:52px;flex:none;padding-inline-start:10px;box-sizing:border-box;'+(a.crit?'color:#e57373;font-weight:700':'')+'">'+gtEsc(a.id)+'</span><span style="width:190px;flex:none;overflow:hidden;text-overflow:ellipsis" title="'+gtEsc(a.n[L])+'">'+gtEsc(a.n[L])+(a.src==='rx'?' <b style="background:#6a1b9a;color:#fff;border-radius:3px;padding:0 3px;font-size:9px">RX</b>':'')+'</span>'+cs.map(k=>'<span style="width:'+GTCW[k]+'px;flex:none">'+gtEsc(cell[k])+'</span>').join('')+'</div>'; }
 GT.lrows.innerHTML=h; }
function gtDraw(){ const vp=GT.vp; if(!vp||!GT.box||!GT.box.isConnected)return; if(GT.dirty||!GT.g)gtPrep(); const vw=vp.clientWidth, vh=vp.clientHeight; if(!vw||!vh)return; const x0=vp.scrollLeft, y0=vp.scrollTop;
 GT.svg.setAttribute('width',vw); GT.svg.setAttribute('height',vh); GT.svg.setAttribute('viewBox',x0+' '+y0+' '+vw+' '+vh); GT.svg.innerHTML=gtBody(GT.rows,{x0,x1:x0+vw,y0,y1:y0+vh,hy:y0,paper:false}); gtLeft(); }
function gtRefresh(full){ if(full!==false)GT.dirty=true; if(GT.raf)return; GT.raf=requestAnimationFrame(()=>{ GT.raf=0; try{ gtDraw(); }catch(e){ console.error('gantt',e); } }); }
const gtSay=m=>{ if(GT.st)GT.st.textContent=m; try{ xSt(m); }catch(e){} };
/* ---- write-back: drag a bar (move = Start-No-Earlier-Than constraint) or its right edge (duration) ---- */
function gtApply(a,mode,days){ if(a.pct>=100){ gtSay(b2('Finished activity: its dates come from actuals.','نشاط منتهي: تواريخه من الفعلي.')); return; } if(!days)return;
 if(mode==='m'){ const want=a.sDate+days*MS; a.cs={t:'SNET',d:ISO(want)}; p6Save(); if(a.sDate>D0(a.cs.d)){ delete a.cs; p6Save(); } gtSay(a.id+': '+b2('start ','البداية ')+ISO(a.sDate)+(a.sDate<want?b2(' (logic or calendar holds it back)',' (العلاقات أو التقويم مانعين)'):'')); }
 else { const idx=dateWd(a.fDate+days*MS), nd=Math.max(1,idx-a.es+1), x=a.drv?(a.q||0)/Math.max(.01,+a.rate||1):0; a.fix=nd-x-.5; a.d=nd; a.manual=true; p6Save(); gtSay(a.id+': '+nd+b2(' working days, finish ',' يوم عمل، النهاية ')+ISO(a.fDate)); }
 gtRefresh(); }
function gtPointer(e){ const t=e.target.closest&&e.target.closest('[data-a]'); if(!t)return; const a=ACT.find(x=>x.id===t.dataset.a); if(!a)return; PS.sel=a.id; const mode=t.dataset.h, ox=e.clientX; GT.drag={id:a.id,mode,dx:0}; if(mode==='r'&&a.d===0)GT.drag=null;
 const mv=ev=>{ if(!GT.drag)return; GT.drag.dx=Math.round((ev.clientX-ox)/GT.g.px)*GT.g.px; GT.dirty=false; gtRefresh(false); const dd=Math.round(GT.drag.dx/GT.g.px); if(GT.st)GT.st.textContent=a.id+' '+(dd>0?'+':'')+dd+b2(' d',' ي'); },
  up=ev=>{ document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); const d=GT.drag; GT.drag=null; if(d){ const days=Math.round(d.dx/GT.g.px); if(days)gtApply(a,d.mode,days); else gtRefresh(); } };
 if(GT.drag){ document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up); e.preventDefault(); } gtRefresh(false); }
/* ---- export / print: the full chart with a paper-coloured table, via the same renderer ---- */
function gtFull(){ if(GT.dirty||!GT.g)gtPrep(); const G=GT.g, rows=GT.rows, L=0, tw=540, xs=[4,50,290,338,418,498], H=G.H, W=G.W; const sv=GT.drag; GT.drag=null;
 let t='<rect x="0" y="0" width="'+tw+'" height="'+GTHH+'" fill="#eee"/>'; ['ID','Activity','Dur','Start','Finish','TF'].forEach((h,i)=>t+='<text x="'+xs[i]+'" y="26" font-weight="700" fill="#000">'+h+'</text>');
 rows.forEach((r,i)=>{ const yy=GTHH+i*GTRH+15; if(r.k==='w'){ t+='<text x="4" y="'+yy+'" font-weight="700" fill="#000">'+gtEsc(r.w+'  '+(WBSN[r.w]?WBSN[r.w][0]:r.w))+'</text>'; return; } const a=r.a; t+='<text x="'+xs[0]+'" y="'+yy+'" fill="'+(a.crit?GTCP.crit:'#000')+'">'+gtEsc(a.id)+'</text><text x="'+xs[1]+'" y="'+yy+'" fill="#000">'+gtEsc(String(a.n[0]).slice(0,42)+(a.src==='rx'?'  [RX]':''))+'</text><text x="'+xs[2]+'" y="'+yy+'" fill="#000">'+(a.d===0?'◆':a.d+'d')+'</text><text x="'+xs[3]+'" y="'+yy+'" fill="#000">'+ISO(a.sDate)+'</text><text x="'+xs[4]+'" y="'+yy+'" fill="#000">'+ISO(a.fDate)+'</text><text x="'+xs[5]+'" y="'+yy+'" fill="#000">'+a.tf+'</text>'; });
 const body=gtBody(rows,{x0:0,x1:W,y0:0,y1:H,hy:0,paper:true}); GT.drag=sv;
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(tw+W)+' '+H+'" width="'+(tw+W)+'" height="'+H+'" font-family="Arial,sans-serif" font-size="11"><rect width="100%" height="100%" fill="#fff"/>'+t+'<g transform="translate('+tw+',0)">'+body+'</g></svg>'; }
function gtExport(kind){ try{ const svg=gtFull(); if(kind==='svg')out('LiftStation_gantt_view.svg',new Blob([svg],{type:'image/svg+xml'})); else svgToPng(svg,b=>{ if(b)out('LiftStation_gantt_view.png',b); else gtSay(b2('PNG export failed.','فشل تصدير PNG.')); }); }catch(e){ gtSay(e.message||String(e)); } }
function gtPrint(){ const svg=gtFull(), w=window.open('','_blank'); if(!w){ gtSay(b2('Pop-up blocked: allow pop-ups to print.','النافذة اتمنعت: اسمح بالنوافذ المنبثقة للطباعة.')); return; } w.document.write('<!doctype html><title>Gantt</title><style>@page{size:A3 '+GT.page+';margin:10mm}body{margin:0}svg{width:100%;height:auto}</style>'+svg); w.document.close(); w.focus(); setTimeout(()=>{ try{ w.print(); }catch(e){} },300); }
function gtBaseline(){ ACT.forEach(a=>{ a.base={s:ISO(a.sDate),f:ISO(a.fDate)}; }); p6Save(); gtSay(b2('Baseline saved from the current dates.','اتحفظ خط مرجعي من التواريخ الحالية.')); }
function gtFit(){ const sp=GT.g?(GT.g.hi-GT.g.lo)/MS:60, w=GT.vp.clientWidth; PS.zoom=['day','week','month'].find(z=>sp*GTPX[z]<=w)||'month'; gtRefresh(); }
function gtToday(){ const t=D0(ISO(Date.now())), dd=D0(PS.dd), ms=(t>=GT.g.lo&&t<=GT.g.hi)?t:dd; GT.vp.scrollLeft=Math.max(0,GT.g.X(ms)-GT.vp.clientWidth/3); gtRefresh(false); }
function gtBuild(){ if(GT.box)return; const B=(t,fn,tt)=>el('button',{text:t,title:tt||'',onclick:fn,style:'padding:2px 8px'}), L=gtL();
 const chk=(k,t)=>el('label',{class:'small',style:'white-space:nowrap'},el('input',{type:'checkbox',checked:PS[k]?'':null,onchange:e=>{ PS[k]=e.target.checked; gtRefresh(); }}),' '+t);
 GT.st=el('span',{class:'small',style:'flex:1;min-width:120px;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'});
 const bar=el('div',{style:'display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:5px 8px;border-bottom:1px solid var(--line);background:var(--panel);font-size:12px'});
 ['day','week','month'].forEach(z=>bar.append(B(z==='day'?b2('Day','يوم'):z==='week'?b2('Week','أسبوع'):b2('Month','شهر'),()=>{ PS.zoom=z; gtRefresh(); })));
 bar.append(B(b2('Fit','ملاءمة'),gtFit),B(b2('Today','النهارده'),gtToday),chk('crit',b2('Critical only','الحرجة فقط')),chk('showRel',b2('Links','العلاقات')),chk('group',b2('WBS','WBS')),
  B(b2('Set baseline','حفظ خط مرجعي'),gtBaseline),B('SVG',()=>gtExport('svg')),B('PNG',()=>gtExport('png')),B(b2('Print','طباعة'),gtPrint),GT.st);
 GT.left=el('div',{style:'flex:none;border-inline-end:1px solid var(--line);background:var(--panel);display:flex;flex-direction:column;overflow:hidden;font-size:12px'});
 GT.lhead=el('div',{style:'height:'+GTHH+'px;flex:none;display:flex;align-items:flex-end;font-weight:700;background:rgba(128,128,128,.15);padding:0 4px 4px;box-sizing:border-box'}); GT.lrows=el('div',{style:'position:relative;flex:1;overflow:hidden'}); GT.left.append(GT.lhead,GT.lrows);
 GT.svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); GT.svg.setAttribute('font-family','Arial,sans-serif'); GT.svg.setAttribute('font-size','11'); GT.svg.style.cssText='position:sticky;top:0;left:0;display:block;user-select:none;touch-action:none';
 GT.inner=el('div',{style:'position:relative'}); GT.inner.append(GT.svg); GT.vp=el('div',{style:'flex:1;min-width:0;overflow:auto;position:relative'},GT.inner);
 GT.box=el('div',{id:'gtbox',style:'display:flex;flex-direction:column;height:100%;min-height:0;direction:ltr;color:var(--fg);background:var(--bg)'},bar,el('div',{style:'display:flex;flex:1;min-height:0'},GT.left,GT.vp));
 GT.vp.addEventListener('scroll',()=>gtRefresh(false)); GT.left.addEventListener('wheel',e=>{ GT.vp.scrollTop+=e.deltaY; },{passive:true}); GT.svg.addEventListener('pointerdown',gtPointer);
 GT.lrows.addEventListener('click',e=>{ const w=e.target.closest('[data-w]'); if(w){ PS.collapsed[w.dataset.w]=!PS.collapsed[w.dataset.w]; gtRefresh(); return; } const r=e.target.closest('[data-id]'); if(r){ PS.sel=r.dataset.id; gtRefresh(false); } });
 try{ new ResizeObserver(()=>gtRefresh(false)).observe(GT.box); }catch(e){} }
/* ---- wiring: pane, layout, command, ribbon entry, hook into P.X refresh ---- */
const GTDEF={t:['Gantt chart','مخطط جانت'],ic:'sched',el:()=>{ gtBuild(); return GT.box; }};
{ const _wd=wxDefs; wxDefs=function(){ _wd(); WX.defs['pane:gantt']=GTDEF; }; } try{ WX.defs['pane:gantt']=GTDEF; }catch(e){}
WL.gantt={'pane:gantt':[0,0,.7,1],view3d:[.7,0,.3,.5],tl:[.7,.5,.3,.5]};
const gtOpen=()=>{ try{ computeSched(); }catch(e){} gtBuild(); wxPreset('gantt'); gtRefresh(); };
const gtIsOpen=()=>{ const l=WX.lay['pane:gantt']; return !!(l&&l.open); };
XCMD('gantt_open','sched','Gantt chart','مخطط جانت',gtOpen,gtIsOpen);
{ const _pr=p6Refresh; p6Refresh=function(){ _pr.apply(this,arguments); if(GT.box)gtRefresh(); }; }
try{ const v=RIBP.sched.tabs.find(t=>t[0]==='view'), g=v&&v[2].find(g=>g[0][0]==='Layout'); if(g&&g[1].indexOf('gantt_open')<0)g[1].push('gantt_open'); }catch(e){}
/* stub ribbon commands of the sched type that this view implements (ids from RIBM) */
const gtEns=()=>{ if(!gtIsOpen())gtOpen(); };
const GTCMD={ sched_37:()=>{ gtEns(); GT.cols=(GT.cols+1)%3; GT.dirty=true; gtSay(b2('Columns: ','الأعمدة: ')+['Dur','Dur, Start, Finish','Dur, Start, Finish, TF, %'][GT.cols]); gtRefresh(); },
 sched_38:()=>{ gtEns(); GT.bars=(GT.bars+1)%4; gtSay(b2('Bars: ','الأشرطة: ')+['plan only','+ progress','+ progress, float','+ progress, float, baseline'][GT.bars]); gtRefresh(false); },
 sched_39:()=>{ PS.zoom=PS.zoom==='day'?'week':PS.zoom==='week'?'month':'day'; gtSay(b2('Timescale: ','مقياس الزمن: ')+PS.zoom); gtRefresh(); try{ p6Refresh(); }catch(e){} },
 sched_40:()=>{ PS.crit=!PS.crit; gtSay(b2('Filter, critical only: ','فلتر الحرجة فقط: ')+(PS.crit?'on':'off')); gtRefresh(); try{ p6Refresh(); }catch(e){} },
 sched_41:()=>{ PS.group=!PS.group; gtSay(b2('Group by WBS: ','تجميع بالـ WBS: ')+(PS.group?'on':'off')); gtRefresh(); try{ p6Refresh(); }catch(e){} },
 sched_43:()=>{ gtEns(); GT.pline=!GT.pline; gtSay(b2('Progress line: ','خط التقدم: ')+(GT.pline?'on':'off')); gtRefresh(false); },
 sched_56:()=>{ gtBaseline(); },
 sched_5:()=>{ GT.page=GT.page==='landscape'?'portrait':'landscape'; gtSay(b2('Print page: A3 ','صفحة الطباعة: A3 ')+GT.page); } };
Object.keys(GTCMD).forEach(id=>{ const c=XC[id]; if(c&&c.stub){ c.run=GTCMD[id]; delete c.stub; } });
