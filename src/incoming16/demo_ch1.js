/* ====== demo_ch1.js - chapters 0-2 (welcome, project + template, R.X building). Evaluated together with demo_core.js. ====== */
(function(){
 const S=DEMO, B=S.B;
 /* the sample template: registered here (not in c_templates.js) so the chooser shows it once the demo has been opened. Same R.X starter as the villa; the demo then adds the rest with the real tools. */
 try{ if(!TEMPLATES.sample6868){ const rvf=(TEMPLATES.house2&&TEMPLATES.house2.rv)||(typeof tpHouse2==='function'?tpHouse2:null); if(rvf)TEMPLATES.sample6868={id:'sample6868',base:'blank',n:['Project 6868 (sample, full)','مشروع 6868 (نموذجي كامل)'],title:['Project 6868','Project 6868'],rv:rvf,d:['The sample used by the guided demo: two-floor building starter; the demo adds site, schedule, quantities, structure, MEP, clash and outputs.','النموذج اللي بيستخدمه الديمو: مبنى دورين؛ والديمو بيضيف الموقع والجدول والكميات والإنشائي وMEP والتعارضات والمخرجات.']}; } }catch(e){}
 const cnt=k=>RV.els.filter(e=>e.k===k).length;
 const ctx={};
 /* make sure "Project 6868" exists (used when someone starts at a later chapter): the same real function the chooser calls, no animation */
 S.ensureProject=async function(){ if(typeof tpId==='function'&&tpId()==='sample6868'&&dcProjName()==='Project 6868')return false; tpNew('sample6868'); const P2=DATA.proj||(DATA.proj={}); P2.name='Project 6868'; P2.no='6868-DEMO'; P2.client='Sample client'; P2.loc='Sample site'; DR.title='Project 6868'; try{ persist(); xBar(); }catch(e){} return true; };

 /* ---------------- 0: welcome / how to use ---------------- */
 S.add({id:'welcome',n:['Welcome: how the platform works','أهلاً: إزاي بتشتغل المنصة'],mode:'mixed',
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
 S.add({id:'project',n:['Create the project from a template','إنشاء المشروع من قالب'],mode:'real',
  sum:['New project from the template, then the project information.','مشروع جديد من القالب، وبعدين بيانات المشروع.'],
  steps:[
   {op:'tab',type:'start'},
   {op:'say',en:'Press "New". The chooser lists the templates. Your current project is kept in the undo history first.',ar:'اضغط "جديد". القائمة بتعرض القوالب. مشروعك الحالي بيتحفظ في سجل التراجع الأول.'},
   {op:'run',cmd:'new',after:500},
   {op:'assert',en:'The template chooser opened',ar:'قايمة القوالب اتفتحت',ok:()=>!!document.getElementById('tpDlg')},
   {op:'ui',tour:[{to:'#tpDlg [data-tpl]:nth-child(1)',hold:500},{to:'#tpDlg [data-tpl]:nth-child(2)',hold:500}]},
   {op:'say',en:'The "Download the current project first" box would save a file to your computer. The demo keeps your project itself, so I untick it.',ar:'خانة "نزّل المشروع الحالي الأول" هتحفظ ملف على جهازك. الديمو بيحتفظ بمشروعك بنفسه، فهشيل العلامة.'},
   {op:'click',to:'#tpDl',tip:false},
   {op:'assert',en:'Download box is off',ar:'خانة التنزيل مقفولة',ok:()=>{ const c=document.getElementById('tpDl'); return !!c&&!c.checked; }},
   {op:'click',to:'#tpDlg [data-tpl="sample6868"]',hold:700},
   {op:'assert',en:'Project created from the template (elements in R.X)',ar:'المشروع اتعمل من القالب (عناصر في R.X)',ok:()=>tpId()==='sample6868'&&RV.els.length>=40,wait:4000},
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
   {op:'move',to:'#xBar .pj',opt:1,hold:900}
  ]});

 /* ---------------- 2: R.X building model ---------------- */
 S.add({id:'rx',n:['R.X: the building model','R.X: موديل المبنى'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Draw a garage annex by hand in R.X: walls, floor, door, window and a column, then look at it in 3D.','هنرسم ملحق جراج بإيدينا في R.X: حيطان وبلاطة وباب وشباك وعمود، وبعدين نشوفه 3D.'],
  steps:[
   {op:'say',en:'R.X is the model. The template already has levels, grids, walls, rooms, stairs and a roof for the main house. Open the R.X tab.',ar:'R.X هو الموديل. القالب فيه مناسيب وشبكات وحيطان وغرف وسلم وسقف للبيت الأساسي. افتح تاب R.X.'},
   {op:'tab',type:'model'},
   {op:'assert',en:'R.X tab is active and the 3D view is visible',ar:'تاب R.X شغال والـ 3D ظاهر',ok:()=>{ try{ return ribType()==='model'&&renderer.domElement.getBoundingClientRect().width>100; }catch(e){ return false; } },wait:5000},
   {op:'do',fn:async a=>{ ctx.w0=cnt('wall'); ctx.d0=cnt('door'); ctx.n0=cnt('window'); ctx.c0=cnt('col'); ctx.f0=cnt('floor'); RV.lv=0; try{ rvBrowser(); }catch(e){} await a.fly([9,34,5.4],[9,0,5],1400); }},
   {op:'say',en:'Plan view of the ground floor. We add a 6 x 6 m garage on the east side. Pick the Wall tool, then click the corners: the cursor clicks on the 3D canvas like a mouse.',ar:'مسقط الدور الأرضي. هنضيف جراج ٦ × ٦ م على الجانب الشرقي. اختار أداة الحائط، وبعدين اضغط الأركان: المؤشر بيضغط على الـ 3D زي الماوس.'},
   {op:'run',cmd:'rv_wall'},
   {op:'assert',en:'Wall tool is active',ar:'أداة الحائط شغالة',ok:()=>RV.tool==='wall'},
   {op:'draw',pts:[[12,0],[18,0],[18,6],[12,6]],gap:250},
   {op:'key',k:'Escape',n:2},
   {op:'assert',en:'3 walls added by clicking, tool ended with Esc',ar:'٣ حيطان اتضافت بالضغط، والأداة انتهت بـ Esc',ok:()=>cnt('wall')-ctx.w0===3&&!RV.tool},
   {op:'say',en:'Floor slab: pick Floor and click two opposite corners.',ar:'بلاطة الأرضية: اختار بلاطة وبعدين اضغط ركنين متقابلين.'},
   {op:'run',cmd:'rv_floor'},
   {op:'draw',pts:[[12,0],[18,6]]},
   {op:'key',k:'Escape'},
   {op:'assert',en:'Floor slab added',ar:'البلاطة اتضافت',ok:()=>cnt('floor')-ctx.f0===1},
   {op:'say',en:'Door and window: pick the tool and click on a wall.',ar:'الباب والشباك: اختار الأداة واضغط على جدار.'},
   {op:'run',cmd:'rv_door'},
   {op:'draw',pts:[[15,0]],y:'top',until:()=>cnt('door')>ctx.d0},
   {op:'key',k:'Escape'},
   {op:'assert',en:'Door added to the garage wall',ar:'الباب اتضاف لحيطة الجراج',ok:()=>cnt('door')-ctx.d0===1},
   {op:'run',cmd:'rv_window'},
   {op:'draw',pts:[[18,3]],y:'top',until:()=>cnt('window')>ctx.n0},
   {op:'key',k:'Escape'},
   {op:'assert',en:'Window added',ar:'الشباك اتضاف',ok:()=>cnt('window')-ctx.n0===1},
   {op:'run',cmd:'rv_col'},
   {op:'draw',pts:[[15,3]]},
   {op:'key',k:'Escape'},
   {op:'assert',en:'Column added',ar:'العمود اتضاف',ok:()=>cnt('col')-ctx.c0===1},
   {op:'say',en:'Now the 3D view: orbit around the new annex. Everything you drew is real model data used later for quantities, schedule links and sheets.',ar:'دلوقتي منظور 3D: بندور حوالين الملحق. كل اللي رسمناه بيانات موديل حقيقية بتتستخدم بعدين في الكميات وربط الجدول واللوحات.'},
   {op:'do',fn:async a=>{ await a.fly([24,15,22],[9,1.5,5],1800); }},
   {op:'assert',en:'Model totals: walls, doors, windows, columns',ar:'إجمالي الموديل: حيطان وأبواب وشبابيك وأعمدة',ok:()=>cnt('wall')>=ctx.w0+3&&cnt('door')>ctx.d0&&cnt('window')>ctx.n0&&cnt('col')>ctx.c0}
  ]});
})();
