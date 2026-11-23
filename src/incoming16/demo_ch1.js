/* ====== demo_ch1.js - chapters 0-2 (welcome, project + template, R.X building). Evaluated together with demo_core.js. ====== */
(function(){
 const S=DEMO, B=S.B;
 /* the sample template: registered ONLY while the demo runs (start) and removed when it ends or stops, so no chooser, tab or saved project ever shows it otherwise */
 S.onStart=function(){ try{ if(!TEMPLATES.sample6868){ const rvf=(TEMPLATES.house2&&TEMPLATES.house2.rv)||(typeof tpHouse2==='function'?tpHouse2:null); if(rvf)TEMPLATES.sample6868={id:'sample6868',base:'blank',n:['Project 6868 (sample, full)','مشروع 6868 (نموذجي كامل)'],title:['Project 6868','Project 6868'],rv:rvf,d:['The sample used by the guided demo; it exists only while the demo runs.','النموذج اللي بيستخدمه الديمو؛ وبيوجد وقت تشغيل الديمو بس.']}; } }catch(e){} };
 S.onEnd=function(){ try{ delete TEMPLATES.sample6868; }catch(e){} }; /* a real command that opens a pane (feature-detected: skipped when the command does not exist yet); the pane is closed again after the check */
 const openKeys=()=>Object.keys(WX.lay).filter(k=>WX.lay[k].open);
 const pane=(cmd,en,ar,keep)=>[{op:'do',when:()=>!!XC[cmd],fn:()=>{ ctx['k_'+cmd]=openKeys(); ctx['b_'+cmd]=new Set(document.body.children); }},{op:'run',cmd:cmd,after:1400,when:()=>!!XC[cmd]},{op:'assert',en:en,ar:ar,when:()=>!!XC[cmd],ok:()=>openKeys().length>=ctx['k_'+cmd].length},{op:'shot',name:'pane_'+cmd,when:()=>!!XC[cmd]},{op:'do',when:()=>!!XC[cmd]&&!keep,fn:()=>{ openKeys().filter(k=>!ctx['k_'+cmd].includes(k)).forEach(k=>{ try{ wxClose(k); }catch(e){} }); [...document.body.children].filter(n=>!ctx['b_'+cmd].has(n)&&!/^xDemo/.test(n.id||'')&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE'&&getComputedStyle(n).position==='fixed').forEach(n=>n.remove()); }}];
 const cnt=k=>RV.els.filter(e=>e.k===k).length;
 const ctx={};
 /* make sure "Project 6868" exists (used when someone starts at a later chapter): the same real function the chooser calls, no animation */
 /* pluggable building source: the first of these templates that exists (RC generator / apartment building from other sessions) else the sample starter */
 S.srcIds=['apartment_rc','apt_rc','building_rc','house_rc','villa_rc'];
 S.src=()=>S.srcIds.find(id=>TEMPLATES[id])||'sample6868';
 S.ensureProject=async function(){ if(typeof tpId==='function'&&tpId()===S.src()&&dcProjName()==='Project 6868')return false; tpNew(S.src()); const P2=DATA.proj||(DATA.proj={}); P2.name='Project 6868'; P2.no='6868-DEMO'; P2.client='Sample client'; P2.loc='Sample site'; DR.title='Project 6868'; try{ persist(); xBar(); }catch(e){} return true; };

 /* ---------------- 0: welcome / how to use ---------------- */
 S.add({id:'welcome',phase:'0',n:['Welcome: how the platform works','أهلاً: إزاي بتشتغل المنصة'],mode:'mixed',
  sum:['Welcome. Everything here is a tab; commands live in the ribbon; Ctrl+K finds anything.','أهلاً. كل حاجة هنا تاب، والأوامر في الشريط، وCtrl+K بيدور على أي حاجة.'],
  steps:[
   {op:'tab',type:'start'},
   {op:'say',en:'Welcome to T.O X. This is the Start page. Every tool you see is a tab: R.X is the Revit-like model, C.X is CAD, S.X is survey and civil, P.X is the schedule, N.X is coordination.',ar:'أهلاً بيك في T.O X. دي صفحة البداية. كل أداة قدامك هي تاب: R.X الموديل زي ريفيت، C.X الأوتوكاد، S.X المساحة والمدني، P.X الجدول الزمني، N.X التنسيق.'},
   {op:'move',to:'.xdh h1',tip:['The project name is always here','اسم المشروع بيظهر هنا دايمًا']},
   {op:'ui',tour:[{to:'.xtl .xt:nth-child(1)',hold:700},{to:'.xtl .xt:nth-child(3)',hold:700},{to:'.xtl .xt:nth-child(4)',hold:700}]},
   {op:'say',en:'Search everything with Ctrl+K: commands, tools and files. I will press it and look for "wall".',ar:'ابحث في كل حاجة بـ Ctrl+K: أوامر وأدوات وملفات. هضغطها وأدوّر على "wall".'},
   {op:'key',k:'k',ctrl:true,after:500},
   {op:'assert',en:'The search box opened',ar:'صندوق البحث اتفتح',ok:()=>!!document.querySelector('.xdlg input[type=text]')},
   {op:'type',to:'.xdlg input[type=text]',text:'wall',tip:false},
   {op:'wait',ms:1200},
   {op:'assert',en:'Search found commands',ar:'البحث لقى أوامر',soft:1,ok:()=>document.querySelectorAll('.xdlg .xm').length>=1},
   {op:'key',k:'Escape',on:()=>document.querySelector('.xdlg input[type=text]'),after:300},
   {op:'do',fn:()=>{ if(document.querySelector('.xdlg input[type=text]'))document.querySelectorAll('.xdlg').forEach(n=>n.remove()); }},
   {op:'assert',en:'Search closed',ar:'البحث اتقفل',soft:1,ok:()=>!document.querySelector('.xdlg input[type=text]')},
   {op:'say',en:'New tabs: the + button next to the tabs opens the menu of all tools. I will open it just to show it.',ar:'التابات الجديدة: زرار + جنب التابات بيفتح قائمة كل الأدوات. هفتحه بس عشان أوريهالك.'},
   {op:'click',to:'plus',tip:['Add a tab','أضف تاب'],hold:400},
   {op:'assert',en:'The tools menu is open',ar:'قايمة الأدوات اتفتحت',ok:()=>!!document.querySelector('.xmenu .xm')},
   {op:'ui',tour:[{to:'.xmenu .xm:nth-child(1)',hold:600},{to:'.xmenu .xm:nth-child(3)',hold:600},{to:'.xmenu .xm:nth-child(4)',hold:600}]},
   {op:'click',to:'tab:start',tip:false,after:300},
   {op:'say',en:'Files and data: "Open a file" loads a saved project, IFC, DXF or CSV from your computer. The operating system file dialog is outside the browser, so I only point at it. Saved projects are listed under "Projects".',ar:'الملفات والبيانات: "فتح ملف" بيحمّل مشروع محفوظ أو IFC أو DXF أو CSV من جهازك. نافذة اختيار الملف تبع نظام التشغيل برّه المتصفح فهشاور عليها بس. المشاريع المحفوظة تلاقيها في "المشاريع".'},
   {op:'move',to:'cmd:open',hold:900},
   {op:'move',to:'cmd:save',hold:700},
   {op:'move',to:'cmd:projects',hold:700},
   {op:'say',en:'Data is filled in forms and tables inside each tool. Next chapter: we create the project and fill its information.',ar:'البيانات بتتملي في نماذج وجداول جوه كل أداة. الفصل الجاي: هننشئ المشروع ونملي بياناته.'}
  ]});

 /* ---------------- 1: create the project from a template ---------------- */
 S.add({id:'project',phase:'0',n:['Create the project from a template','إنشاء المشروع من قالب'],mode:'real',
  sum:['New project from the template, then the project information.','مشروع جديد من القالب، وبعدين بيانات المشروع.'],
  steps:[
   {op:'tab',type:'start'},
   {op:'say',en:'Press "New". The chooser lists the templates. Your current project is kept in the undo history first.',ar:'اضغط "جديد". القائمة بتعرض القوالب. مشروعك الحالي بيتحفظ في سجل التراجع الأول.'},
   {op:'run',cmd:'new',after:500},
   {op:'assert',en:'The template chooser opened',ar:'قايمة القوالب اتفتحت',ok:()=>!!document.getElementById('tpDlg')},
   {op:'ui',tour:[{to:'#tpDlg [data-tpl]:nth-child(1)',hold:500},{to:'#tpDlg [data-tpl]:nth-child(2)',hold:500}]},
   {op:'say',en:'The "Download the current project first" box would save a file to your computer. The demo keeps your project itself, so I untick it.',ar:'خانة "نزّل المشروع الحالي الأول" هتحفظ ملف على جهازك. الديمو بيحتفظ بمشروعك بنفسه، فهشيل العلامة.'},
   {op:'click',to:'#tpDl',tip:false,when:()=>{ const c=document.getElementById('tpDl'); return !!c&&c.checked; }},
   {op:'assert',en:'Download box is off',ar:'خانة التنزيل مقفولة',ok:()=>{ const c=document.getElementById('tpDl'); return !c||!c.checked; }},
   {op:'click',to:()=>document.querySelector('#tpDlg [data-tpl="'+S.src()+'"]'),hold:1200},
   {op:'assert',en:'Project created from the template (elements in R.X)',ar:'المشروع اتعمل من القالب (عناصر في R.X)',ok:()=>tpId()===S.src()&&RV.els.length>=10,wait:4000},
   {op:'say',en:'Now the project information: name, number, client, location. "Project set-up" opens the form.',ar:'دلوقتي بيانات المشروع: الاسم والرقم والعميل والموقع. "إعداد المشروع" بيفتح النموذج.'},
   {op:'run',cmd:'setup',after:400},
   {op:'assert',en:'The set-up form opened',ar:'نموذج الإعداد اتفتح',ok:()=>!!document.querySelector('.xdlg input[data-k="name"]')},
   {op:'type',to:'.xdlg input[data-k="name"]',text:'Project 6868',tip:false},
   {op:'type',to:'.xdlg input[data-k="no"]',text:'6868-DEMO',tip:false},
   {op:'type',to:'.xdlg input[data-k="client"]',text:'Sample client',tip:false},
   {op:'type',to:'.xdlg input[data-k="loc"]',text:'Sample site',tip:false},
   {op:'click',to:()=>[...document.querySelectorAll('.xdlg button')].find(b=>b.textContent.trim()===B('Apply','تطبيق')),hold:500},
   {op:'assert',en:'Project information saved (name, number, client, location)',ar:'بيانات المشروع اتحفظت',ok:()=>dcProjName()==='Project 6868'&&DATA.proj.no==='6868-DEMO'&&DATA.proj.client==='Sample client'&&DATA.proj.loc==='Sample site'},
   {op:'say',en:'Project 6868 exists. Its name is in the top bar and on the Start page.',ar:'مشروع 6868 اتعمل. اسمه في الشريط العلوي وفي صفحة البداية.'},
   {op:'card',en:'Brief, room programme and budget: use the O.X report editor and a spreadsheet by hand. There is no brief or budget-per-m² tool yet.',ar:'الفكرة وبرنامج الغرف والميزانية: بتتكتب في محرر تقارير O.X وجدول بإيدك. مفيش أداة للفكرة أو لتكلفة المتر لسه.',need:['A brief / room-programme sheet and a cost-per-m² benchmark','شيت فكرة وبرنامج غرف ومرجع تكلفة المتر']},
   {op:'card',kind:'field',en:'Plot rules (setbacks, coverage, floors, height) come from the district office; the demo does not guess them.',ar:'اشتراطات القطعة (ارتدادات ونسبة بناء وأدوار وارتفاع) بتيجي من إدارة الحي؛ والديمو مبيخمنهاش.'},
   {op:'say',en:'The permit and plot-rules panel lists what to ask the district office; the numbers themselves come from them.',ar:'لوحة التصاريح واشتراطات القطعة بتسرد اللي لازم تسأل عليه إدارة الحي؛ والأرقام نفسها بتيجي منهم.',when:()=>!!XC.qa_perm},
   ...pane('qa_perm','Permit and plot-rules panel opened','لوحة التصاريح واشتراطات القطعة اتفتحت'),
   {op:'move',to:'#xBar .pj',opt:1,hold:900}
  ]});


 /* ---------------- phase 2: R.X architecture, with numeric geometry checks ---------------- */
 const E=k=>RV.els.filter(e=>e.k===k), lastN=(k,n)=>E(k).slice(-n);
 const pt=(a,b)=>S.near(a,b,.06);
 /* annex footprint derived from the building that is open now (works for any source: generator, import, sample): 6 x 6 m on the east side of the ground-floor walls */
 S.gl=()=>{ const i=RV.levels.findIndex(l=>l.z===0); return i<0?0:i; };
 S.annex={x0:12,z0:0,x1:18,z1:6,minX:0,maxZ:10,shared:true};
 S.findAnnex=function(){ const w=RV.els.filter(e=>e.k==='wall'&&e.lv===S.gl()&&e.src!=='demo'); if(!w.length)return S.annex; let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9; w.forEach(e=>[e.a,e.b].forEach(p=>{ minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minZ=Math.min(minZ,p[1]); maxZ=Math.max(maxZ,p[1]); })); const r=v=>Math.round(v*10)/10, A={x0:r(maxX),z0:r(minZ),x1:r(maxX+6),z1:r(minZ+6),minX:r(minX),maxZ:r(maxZ)}; A.shared=w.some(e=>Math.abs(e.a[0]-A.x0)<.05&&Math.abs(e.b[0]-A.x0)<.05&&Math.min(e.a[1],e.b[1])<=A.z0+.05&&Math.max(e.a[1],e.b[1])>=A.z1-.05); S.annex=A; return A; };
 S.archCheck=function(){ const bad=[]; const nl=RV.levels.length; RV.els.forEach(e=>{ if(e.lv==null||e.lv<0||e.lv>=nl)bad.push('level of '+e.k); if(e.k==='wall'){ const h=(RV.levels[e.lv+1]?RV.levels[e.lv+1].z:RV.levels[e.lv].z+e.h)-RV.levels[e.lv].z; if(e.h>h+1e-6)bad.push('wall higher than its storey'); [e.a,e.b].forEach(p=>{ if(!p.every(isFinite))bad.push('wall NaN'); }); if(Math.hypot(e.b[0]-e.a[0],e.b[1]-e.a[1])<.1)bad.push('zero-length wall'); } if((e.k==='door'||e.k==='window')){ const w=RV.els.find(x=>x.id===e.w); if(!w)bad.push(e.k+' without wall'); else { const L=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]); if(e.p-e.W/2<-1e-6||e.p+e.W/2>L+1e-6)bad.push(e.k+' outside its wall'); if(w.lv!==e.lv)bad.push(e.k+' on another level than its wall'); } } }); return bad; };
 S.elInfo=function(k){ const e=RV.els.filter(x=>x.k===k).slice(-1)[0]; const T=(en,ar,v)=>[[en,ar],String(v)]; if(!e)return [T('Element','العنصر','not found')]; const lv=RV.levels[e.lv]||{n:'?',z:0}, f=v=>(+v).toFixed(2), L=[]; L.push(T('Type','النوع',k+(e.ty?' · '+e.ty:''))); L.push(T('Level','الدور',lv.n+' (z '+f(lv.z)+' m)'));
  if(k==='wall'){ const len=Math.hypot(e.b[0]-e.a[0],e.b[1]-e.a[1]); L.push(T('Size','المقاس',f(len)+' m long, '+f(e.t)+' thick, '+f(e.h)+' high')); L.push(T('Quantity','الكمية',f(len*e.t*e.h)+' m³ (gross)')); }
  else if(k==='floor'){ const w=Math.abs(e.b[0]-e.a[0]), d=Math.abs(e.b[1]-e.a[1]); L.push(T('Size','المقاس',f(w)+' × '+f(d)+' m, '+f(e.t)+' thick')); L.push(T('Quantity','الكمية',f(w*d)+' m² · '+f(w*d*e.t)+' m³')); }
  else if(k==='door'||k==='window'){ L.push(T('Size','المقاس',f(e.W)+' × '+f(e.H)+' m'+(k==='window'?', sill '+f(e.sill):''))); L.push(T('Position','المكان','p = '+f(e.p)+' m along its wall')); L.push(T('Quantity','الكمية','1 no.')); }
  else if(k==='col'){ L.push(T('Size','المقاس',f(e.w)+' × '+f(e.d)+' × '+f(e.h)+' m')); L.push(T('Quantity','الكمية',f(e.w*e.d*e.h)+' m³')); }
  else if(k==='beam'){ const len=Math.hypot(e.b[0]-e.a[0],e.b[1]-e.a[1]); L.push(T('Size','المقاس',f(len)+' m long, '+f(e.w)+' × '+f(e.h)+' m section')); L.push(T('Quantity','الكمية',f(len*e.w*e.h)+' m³')); }
  else if(k==='found'){ L.push(T('Size','المقاس',f(e.w)+' × '+f(e.d)+' × '+f(e.t)+' m')); L.push(T('Quantity','الكمية',f(e.w*e.d*e.t)+' m³')); }
  L.push(T('Material','الخامة',e.mat||e.asm||'not assigned (R.X default)')); L.push(T('Reinforcement','التسليح',e.rebar?JSON.stringify(e.rebar).slice(0,60):'not available yet (design + rebar tools)')); return L; };
 const AX=()=>S.annex, mid=(a,b)=>(a+b)/2;
 const wallPts=()=>{ const A=AX(); return A.shared?[[A.x0,A.z0],[A.x1,A.z0],[A.x1,A.z1],[A.x0,A.z1]]:[[A.x0,A.z0],[A.x1,A.z0],[A.x1,A.z1],[A.x0,A.z1],[A.x0,A.z0]]; };
 const nNew=()=>AX().shared?3:4;
 S.add({id:'arch',phase:'2',n:['Phase 2 · R.X architecture: grids, walls, openings, floor','المرحلة 2 · R.X المعماري: شبكات وحيطان وفتحات وبلاطة'],mode:'real',
  pre:async()=>{ await S.ensureProject(); S.findAnnex(); },
  sum:['Add a 6 x 6 m garage annex beside the building in the right order: grid lines, walls on the grid crossings, floor, door, window. Every element is checked by its numbers.','نضيف جراج ٦ × ٦ م جنب المبنى بالترتيب الصح: خطوط شبكة، حيطان على تقاطعات الشبكة، بلاطة، باب، شباك. وكل عنصر بنراجعه بأرقامه.'],
  steps:[
   {op:'tab',type:'model'},
   {op:'do',fn:async a=>{ S.findAnnex(); const A=AX(); ctx.w0=E('wall').length; ctx.d0=E('door').length; ctx.n0=E('window').length; ctx.f0=E('floor').length; ctx.g0=RV.grids.length; RV.lv=S.gl(); try{ rvBrowser(); }catch(e){} RV.def.wall.t=.25; await a.fly([mid(A.minX,A.x1),Math.max(30,(A.x1-A.minX)*1.9),mid(A.z0,A.maxZ)+.6],[mid(A.minX,A.x1),0,mid(A.z0,A.maxZ)],2200); }},
   {op:'say',en:'R.X is the model. Order of work: levels, grids, walls, openings, floors, stair, roof. The building is already there from the template. We add a garage on its east side.',ar:'R.X هو الموديل. ترتيب الشغل: مناسيب، شبكات، حيطان، فتحات، بلاطات، سلم، سقف. المبنى موجود من القالب. هنضيف جراج على جانبه الشرقي.'},
   {op:'assert',en:'Levels are in order, rising, with a zero level',ar:'المناسيب مترتبة وطالعة وفيه منسوب صفر',ok:()=>RV.levels.length>=2&&RV.levels.every((l,i)=>isFinite(l.z)&&(i===0||l.z>RV.levels[i-1].z))&&RV.levels.some(l=>l.z===0),info:()=>JSON.stringify(RV.levels)},
   {op:'shot',name:'01_plan_before'},
   {op:'say',en:()=>'Step 1: grid lines. A vertical grid at x = '+AX().x1+' m and a horizontal grid at z = '+AX().z1+' m. The garage corners sit on their crossings.',ar:()=>'خطوة ١: خطوط الشبكة. شبكة رأسية عند x = '+AX().x1+' م وأفقية عند z = '+AX().z1+' م. أركان الجراج على تقاطعاتهم.'},
   {op:'run',cmd:'rv_grid'},
   {op:'assert',en:'Grid tool is active',ar:'أداة الشبكة شغالة',ok:()=>RV.tool==='grid'},
   {op:'draw',pts:()=>[[AX().x1,AX().z0-1],[AX().x1,AX().maxZ+1]],names:[['Vertical grid: start','الشبكة الرأسية: البداية'],['Vertical grid: end','الشبكة الرأسية: النهاية']]},
   {op:'draw',pts:()=>[[AX().minX-1,AX().z1],[AX().x1+1,AX().z1]],names:[['Horizontal grid: start','الشبكة الأفقية: البداية'],['Horizontal grid: end','الشبكة الأفقية: النهاية']]},
   {op:'key',k:'Escape',n:2},
   {op:'assert',en:'Two grids created exactly where intended',ar:'اتعملت شبكتين في مكانهم بالظبط',ok:()=>{ const A=AX(), g=RV.grids.slice(ctx.g0); return g.length===2&&g[0].hz===false&&Math.abs(g[0].a[0]-A.x1)<.06&&Math.abs(g[0].b[0]-A.x1)<.06&&g[1].hz===true&&Math.abs(g[1].a[1]-A.z1)<.06&&Math.abs(g[1].b[1]-A.z1)<.06; },info:()=>JSON.stringify(RV.grids.slice(ctx.g0).map(g=>[g.n,g.hz,g.a,g.b]))},
   {op:'shot',name:'02_grids'},
   {op:'say',en:'Step 2: external walls, 25 cm thick, 3 m high. The clicks snap to the grid crossings, so the corners are exact.',ar:'خطوة ٢: الحيطان الخارجية سُمك ٢٥ سم وارتفاع ٣ م. الضغطات بتتثبت على تقاطعات الشبكة فالأركان بالظبط.'},
   {op:'run',cmd:'rv_wall'},
   {op:'assert',en:'Wall tool is active',ar:'أداة الحائط شغالة',ok:()=>RV.tool==='wall'},
   {op:'draw',pts:wallPts,names:[['Garage corner 1','ركن الجراج ١'],['Garage corner 2','ركن الجراج ٢'],['Garage corner 3','ركن الجراج ٣'],['Garage corner 4','ركن الجراج ٤'],['Back to corner 1','رجوع للركن ١']]},
   {op:'key',k:'Escape',n:2},
   {op:'assert',en:'New walls: end points equal the grid crossings; 0.25 m thick, standard wall height, ground level',ar:'الحيطان الجديدة: النهايات = تقاطعات الشبكة؛ سُمك ٠٫٢٥ وارتفاع ٣ م على الدور الأرضي',ok:()=>{ const n=nNew(), w=lastN('wall',n), P=wallPts(); return E('wall').length-ctx.w0===n&&w.every((x,i)=>pt(x.a,P[i])&&pt(x.b,P[i+1]||P[0])&&x.t===.25&&x.h===RV.def.wall.h&&x.lv===S.gl()); },info:()=>JSON.stringify(lastN('wall',4).map(w=>[w.a,w.b,w.t,w.h,w.lv]))+' want '+JSON.stringify(wallPts())},
   {op:'info',title:['Data of the new wall','بيانات الحيطة الجديدة'],lines:()=>S.elInfo('wall')},
   {op:'shot',name:'03_walls_plan'},
   {op:'say',en:'Step 3: the floor slab fills the same rectangle, corner to corner.',ar:'خطوة ٣: بلاطة الأرضية بتملا نفس المستطيل، ركن لركن.'},
   {op:'run',cmd:'rv_floor'},
   {op:'draw',pts:()=>[[AX().x0,AX().z0],[AX().x1,AX().z1]],names:[['Slab corner 1','ركن البلاطة ١'],['Slab corner 2 (opposite)','ركن البلاطة ٢ (المقابل)']],until:()=>E('floor').length>ctx.f0},
   {op:'key',k:'Escape'},
   {op:'assert',en:'Floor slab covers exactly the garage walls',ar:'البلاطة بتغطي حيطان الجراج بالظبط',ok:()=>{ const A=AX(), f=E('floor').slice(-1)[0]; return E('floor').length-ctx.f0===1&&f.lv===S.gl()&&(pt(f.a,[A.x0,A.z0])&&pt(f.b,[A.x1,A.z1])||pt(f.a,[A.x1,A.z1])&&pt(f.b,[A.x0,A.z0])); }},
   {op:'info',title:['Data of the new floor slab','بيانات البلاطة الجديدة'],lines:()=>S.elInfo('floor')},
   {op:'say',en:'Step 4: openings. A door in the south wall and a window in the east wall, each placed by clicking on the wall.',ar:'خطوة ٤: الفتحات. باب في الحيطة الجنوبية وشباك في الشرقية، وكل واحد بالضغط على الحيطة.'},
   {op:'run',cmd:'rv_door'},
   {op:'draw',pts:()=>[[mid(AX().x0,AX().x1),AX().z0]],y:'top',loop:false,names:[['South wall, middle','الحيطة الجنوبية في النص']],until:()=>E('door').length>ctx.d0},
   {op:'key',k:'Escape'},
   {op:'assert',en:'Door sits inside the south garage wall near its middle, same level',ar:'الباب جوه حيطة الجراج الجنوبية جنب النص ونفس الدور',ok:()=>{ const A=AX(), d=E('door').slice(-1)[0], w=d&&RV.els.find(x=>x.id===d.w); return E('door').length-ctx.d0===1&&w&&pt(w.a,[A.x0,A.z0])&&pt(w.b,[A.x1,A.z0])&&Math.abs(d.p-3)<.5&&d.lv===w.lv; }},
   {op:'info',title:['Data of the new door','بيانات الباب الجديد'],lines:()=>S.elInfo('door')},
   {op:'run',cmd:'rv_window'},
   {op:'draw',pts:()=>[[AX().x1,mid(AX().z0,AX().z1)]],y:'top',loop:false,names:[['East wall, middle','الحيطة الشرقية في النص']],until:()=>E('window').length>ctx.n0},
   {op:'key',k:'Escape'},
   {op:'assert',en:'Window sits inside the east garage wall near its middle, same level',ar:'الشباك جوه حيطة الجراج الشرقية جنب النص ونفس الدور',ok:()=>{ const A=AX(), d=E('window').slice(-1)[0], w=d&&RV.els.find(x=>x.id===d.w); return E('window').length-ctx.n0===1&&w&&pt(w.a,[A.x1,A.z0])&&pt(w.b,[A.x1,A.z1])&&Math.abs(d.p-3)<.5&&d.lv===w.lv; }},
   {op:'info',title:['Data of the new window','بيانات الشباك الجديد'],lines:()=>S.elInfo('window')},
   {op:'shot',name:'04_openings_plan'},
   {op:'say',en:'Check the whole model: every element on a real level, walls not higher than their storey, openings inside their walls.',ar:'نراجع الموديل كله: كل عنصر على دور حقيقي، والحيطان مش أعلى من دورها، والفتحات جوه حيطانها.'},
   {op:'assert',en:'Geometry check: no element floating, outside its level or outside its wall',ar:'فحص الهندسة: مفيش عنصر طاير أو خارج دوره أو خارج حيطته',ok:()=>S.archCheck().length===0,info:()=>S.archCheck().join('; ')},
   {op:'do',fn:async a=>{ const A=AX(), cx=mid(A.minX,A.x1), cz=mid(A.z0,A.maxZ), R=Math.max(26,(A.x1-A.minX)*1.4); await a.fly([cx+R,R*.6,cz+R*.9],[cx,1.2,cz],2600); }},
   {op:'shot',name:'05_persp_front'},
   {op:'do',fn:async a=>{ const A=AX(), cx=mid(A.minX,A.x1), cz=mid(A.z0,A.maxZ), R=Math.max(26,(A.x1-A.minX)*1.4); await a.fly([cx-R,R*.55,cz-R],[cx,1.2,cz],2600); }},
   {op:'shot',name:'06_persp_back'},
   {op:'do',fn:async a=>{ const A=AX(), cx=mid(A.minX,A.x1), cz=mid(A.z0,A.maxZ); await a.fly([A.x1+22,2.5,cz],[cx,1.8,cz],2200); }},
   {op:'shot',name:'07_side_east'},
   {op:'do',fn:async a=>{ const A=AX(), cx=mid(A.minX,A.x1), cz=mid(A.z0,A.maxZ), R=Math.max(26,(A.x1-A.minX)*1.4); await a.fly([cx+R,R*.6,cz+R*.9],[cx,1.2,cz],2000); }},
   {op:'say',en:'Not shown in this version: stair, roof and rooms of the annex, elevations and sections, materials and interior finishes. The R.X tools exist; the building from the template already has them.',ar:'مش معروض في النسخة دي: سلم وسقف وغرف الملحق، والواجهات والقطاعات، والخامات والتشطيبات. أدوات R.X موجودة؛ والمبنى اللي من القالب فيه اللي ينفع.'}
  ]});
})();
