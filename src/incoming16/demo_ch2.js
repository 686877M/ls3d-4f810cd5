/* ====== demo_ch2.js - phases 1, 3, 4, 5, 6 of PROJECT_PHASES.md: site, structural system, structural checks, MEP, coordination + BOQ. Evaluated with the other demo files; chapters are sorted by phase.
   Rules: "run" = real ribbon button; "do" = the same function/API the button or form uses; "card" = a step that has no tool yet (or is human/field work): shown plainly, never faked. A command id that appears later (from other sessions) is picked up by feature detection (`when`). ====== */
(function(){
 const S=DEMO, B=S.B, ctx={};
 const vis=e=>{ if(!e||!e.isConnected)return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
 const qxVal=(name,r,c)=>{ const sh=QX.api.wb().sheets.find(s=>s.name===name); return sh?qxGet(sh,r,c):null; };
 const E=k=>RV.els.filter(e=>e.k===k), lastN=(k,n)=>E(k).slice(-n), pt=(a,b)=>S.near(a,b,.06);
 const num=i=>()=>calBox.querySelectorAll('input[type=number]')[i];
 const calcBtn=()=>[...calBox.querySelectorAll('button')].find(b=>b.textContent.trim()===B('Calculate','احسب'));
 const calcSet=id=>{ CC.id=id; CC.code=CALCS.find(x=>x.id===id).codes[0]; CC.vals={}; CC.sheet=null; calPanel(); };
 const nrx=()=>ACT.filter(a=>a.src==='rx').length;
 const card=(en,ar,need,kind)=>({op:'card',kind:kind,en:en,ar:ar,need:need});
 const A=()=>S.annex||S.findAnnex();
 const cols=()=>{ const a=A(); return [[a.x0,a.z0],[a.x1,a.z0],[a.x1,a.z1],[a.x0,a.z1]]; };

 /* ---------------- phase 1: site ---------------- */
 S.add({id:'site',phase:'1',n:['Phase 1 · Site: survey, surface, earthworks and cost','المرحلة 1 · الموقع: المساحة والسطح والأعمال الترابية والتكلفة'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Import survey points, build the ground surface and contours, compute cut and fill against a platform level, then price it in a Q.X sheet.','استيراد نقط المساحة، عمل سطح الأرض والكنتور، حساب القطع والردم على منسوب المنصة، وبعدين تسعيره في شيت Q.X.'],
  steps:[
   {op:'say',en:'Phase 1 is the site. A topographic survey is ordered from a surveyor; its points come back as a file. F.X is the terrain tab.',ar:'المرحلة 1 هي الموقع. الرفع المساحي بيتطلب من مساح وبترجع نقطه في ملف. F.X هو تاب التضاريس.'},
   card('The survey itself (total station / GNSS) and the soil boreholes are field work done by people. The software starts from their files.','الرفع المساحي نفسه والحفر الاستكشافي شغل ميداني بيعمله ناس. البرنامج بيبدأ من ملفاتهم.',null,'field'),
   {op:'tab',type:'capture'},
   {op:'do',fn:async()=>{ let csv='P,E,N,Z\n',n=1; for(let i=0;i<6;i++)for(let j=0;j<6;j++)csv+=(n++)+','+(i*5)+','+(j*5)+','+(100+.4*i-.3*j+Math.sin(i+j)*.2).toFixed(2)+'\n'; ctx.imp=await TOX.importSurveyFile({name:'sample_points.csv',text:csv,order:'P,E,N,Z'}); }},
   {op:'assert',en:'36 survey points imported (sample points: the OS file dialog cannot be driven)',ar:'اتستوردت ٣٦ نقطة مساحة (نقط تجريبية: نافذة الملف تبع النظام مينفعش تتشغّل)',ok:()=>TOX.captureState().points===36},
   {op:'shot',name:'01_points'},
   {op:'say',en:'Build the TIN surface from the points with the ribbon button.',ar:'نعمل سطح TIN من النقط بزرار الشريط.'},
   {op:'run',cmd:'rc_tin',after:900},
   {op:'assert',en:'Ground surface (TIN) exists',ar:'سطح الأرض (TIN) اتعمل',ok:()=>TOX.captureState().surfaces.length>=1},
   {op:'do',fn:async()=>{ ctx.cont=await TOX.makeContours({interval:.5}); }},
   {op:'assert',en:'Contours drawn every 0.5 m',ar:'الكنتور اتعمل كل ٠٫٥ م',ok:()=>ctx.cont&&ctx.cont.segments>0},
   {op:'shot',name:'02_contours'},
   {op:'say',en:'Earthworks: cut and fill of the ground against a platform level of 100.00 m (excavation and backfill volumes).',ar:'الأعمال الترابية: القطع والردم للأرض مقابل منسوب منصة ١٠٠٫٠٠ م (حجم الحفر والردم).'},
   {op:'run',cmd:'rc_qty',after:700},
   {op:'do',fn:async()=>{ ctx.cf=await TOX.computeCutFill({level:100}); }},
   {op:'assert',en:'Cut and fill volumes computed (m³)',ar:'اتحسبت أحجام القطع والردم (م³)',ok:()=>ctx.cf&&ctx.cf.tin.cut>0&&ctx.cf.tin.fill>0},
   {op:'say',en:'Cost: a Q.X sheet multiplies the volumes by unit rates. The app ships no price list, so these rates are SAMPLE placeholders; type your own.',ar:'التكلفة: شيت Q.X بيضرب الأحجام في أسعار الوحدة. التطبيق مفيهوش قايمة أسعار، فالأسعار هنا تجريبية؛ اكتب أسعارك.'},
   {op:'do',fn:()=>{ const c=ctx.cf.tin.cut, f=ctx.cf.tin.fill; QX.addSheet('Earthworks',sh=>{ const P=(r,k,v)=>{ sh.cells[qxK(r,k)]=v; }; ['Item','Quantity m3','Sample rate (placeholder)','Cost'].forEach((t,k)=>P(0,k,t)); P(1,0,'Excavation (cut)'); P(1,1,+c.toFixed(2)); P(1,2,40); P(1,3,'=B2*C2'); P(2,0,'Backfill (fill)'); P(2,1,+f.toFixed(2)); P(2,2,25); P(2,3,'=B3*C3'); P(3,0,'Total'); P(3,3,'=D2+D3'); }); }},
   {op:'assert',en:'Earthworks sheet total = cut × rate + fill × rate',ar:'إجمالي شيت الأعمال الترابية = قطع × سعر + ردم × سعر',ok:()=>{ const t=qxVal('Earthworks',3,3); return typeof t==='number'&&Math.abs(t-(ctx.cf.tin.cut*40+ctx.cf.tin.fill*25))<1; }},
   {op:'shot',name:'03_earthworks_sheet'},
   {op:'say',en:'GIS: send the building to the map layers.',ar:'GIS: نبعت المبنى لطبقات الخريطة.'},
   {op:'run',cmd:'xf_gis',after:900},
   {op:'assert',en:'Map layers hold features',ar:'طبقات الخريطة فيها عناصر',soft:1,ok:()=>GM.layers.some(l=>l.feat&&l.feat.length>0)},
   card('Plot presets for New Cairo, boundary check against setbacks, landscape / garden, and access for trucks and crane: no tool in this build yet. The GIS maps session is adding plot presets; they will be used here when they exist.','قطع التجمع الخامس الجاهزة، فحص الحدود مع الارتدادات، الحديقة والمناظر الطبيعية، ووصول العربيات والونش: مفيش أداة ليها في النسخة دي لسه. جلسة الخرائط بتضيف القطع الجاهزة وهتتستخدم هنا لما تظهر.',['Plot presets, setback check, landscape and logistics tools','قطع جاهزة وفحص ارتدادات وأدوات حدائق ولوجستيات']),
   {op:'say',en:'Phase 1 outputs here: a ground surface, contours, earthworks volumes and a first cost. Soil bearing is entered later from the borehole report.',ar:'مخرجات المرحلة 1 هنا: سطح الأرض والكنتور وأحجام الأعمال الترابية وتكلفة أولية. تحمل التربة بيتدخل بعدين من تقرير الحفر.'}
  ]});

 /* ---------------- phase 3: structural system (RC skeleton on the grid) ---------------- */
 S.add({id:'sys',phase:'3',n:['Phase 3 · Structural system: columns, beams and footings on the grid','المرحلة 3 · النظام الإنشائي: أعمدة وكمرات وقواعد على الشبكة'],mode:'real',
  pre:async()=>{ await S.ensureProject(); S.findAnnex(); },
  sum:['Place the reinforced-concrete skeleton of the garage on the grid: four columns, the beams between them and a footing under each column. Positions are checked by numbers.','نحط هيكل الخرسانة المسلحة للجراج على الشبكة: ٤ أعمدة والكمرات بينهم وقاعدة تحت كل عمود. والمواقع بتتراجع بالأرقام.'],
  steps:[
   {op:'say',en:'Phase 3 chooses the system. For a house or small building the default is a reinforced-concrete skeleton: columns, beams, solid slabs, isolated footings. The system and the footing type come from the soil report and the engineer.',ar:'المرحلة 3 بتختار النظام. للبيت أو المبنى الصغير الافتراضي هيكل خرسانة مسلحة: أعمدة وكمرات وبلاطات مصمتة وقواعد منفصلة. النظام ونوع القاعدة بيجوا من تقرير التربة والمهندس.'},
   {op:'run',cmd:'p_codes',after:900},
   {op:'say',en:'The codes panel lists the codes for reference (titles and scope only: the app does not quote clauses).',ar:'لوحة الأكواد بتسرد الأكواد للرجوع (العناوين والنطاق بس: التطبيق مبيقتبسش بنود).'},
   {op:'do',fn:()=>{ try{ wxClose('pane:codes'); }catch(e){} }},
   {op:'tab',type:'model'},
   {op:'do',fn:async a=>{ const x=A(); ctx.c0=E('col').length; ctx.b0=E('beam').length; ctx.f0=E('found').length; RV.lv=S.gl(); try{ rvBrowser(); }catch(e){} await a.fly([(x.minX+x.x1)/2,Math.max(30,(x.x1-x.minX)*1.9),(x.z0+x.maxZ)/2+.6],[(x.minX+x.x1)/2,0,(x.z0+x.maxZ)/2],2000); }},
   {op:'say',en:'Columns first, at the four corners of the garage, on the grid crossings.',ar:'الأعمدة الأول، في الأركان الأربعة للجراج، على تقاطعات الشبكة.'},
   {op:'run',cmd:'rv_col'},
   {op:'assert',en:'Column tool is active',ar:'أداة العمود شغالة',ok:()=>RV.tool==='col'},
   {op:'draw',pts:cols,names:[['Column 1','عمود ١'],['Column 2','عمود ٢'],['Column 3','عمود ٣'],['Column 4','عمود ٤']],until:()=>E('col').length-ctx.c0>=4},
   {op:'key',k:'Escape'},
   {op:'assert',en:'4 columns, each centred on a garage corner, standard column size',ar:'٤ أعمدة، كل واحد في ركن الجراج، ٠٫٤ × ٠٫٤ م وارتفاع ٣ م',ok:()=>{ const c=lastN('col',4), P=cols(); return E('col').length-ctx.c0===4&&c.every((x,i)=>pt(x.p,P[i])&&x.w===RV.def.col.w&&x.d===RV.def.col.d&&x.h===RV.def.col.h&&x.lv===S.gl()); },info:()=>JSON.stringify(lastN('col',5).map(c=>[c.p,c.w,c.h,c.lv]))},
   {op:'say',en:'Beams: click the four column tops in turn and close the loop.',ar:'الكمرات: اضغط على أعلى الأعمدة الأربعة بالترتيب وأقفل الدايرة.'},
   {op:'run',cmd:'rv_beam'},
   {op:'draw',pts:()=>{ const P=cols(); return [P[0],P[1],P[2],P[3],P[0]]; },names:[['Beam start: column 1','بداية الكمرة: عمود ١'],['Column 2','عمود ٢'],['Column 3','عمود ٣'],['Column 4','عمود ٤'],['Close at column 1','القفل عند عمود ١']]},
   {op:'key',k:'Escape',n:2},
   {op:'assert',en:'4 beams, each from one column centre to the next (ends equal the columns)',ar:'٤ كمرات، كل واحدة من مركز عمود للتالي (النهايات = الأعمدة)',ok:()=>{ const b=lastN('beam',4), P=cols(); return E('beam').length-ctx.b0===4&&b.every((x,i)=>pt(x.a,P[i])&&pt(x.b,P[(i+1)%4])); },info:()=>JSON.stringify(lastN('beam',5).map(b=>[b.a,b.b]))},
   {op:'say',en:'Footings: one isolated footing under each column.',ar:'القواعد: قاعدة منفصلة تحت كل عمود.'},
   {op:'run',cmd:'rv_found'},
   {op:'draw',pts:cols,names:[['Footing under column 1','قاعدة تحت عمود ١'],['Footing under column 2','قاعدة تحت عمود ٢'],['Footing under column 3','قاعدة تحت عمود ٣'],['Footing under column 4','قاعدة تحت عمود ٤']],until:()=>E('found').length-ctx.f0>=4},
   {op:'key',k:'Escape'},
   {op:'assert',en:'4 footings, each centred under its column',ar:'٤ قواعد، كل واحدة متمركزة تحت عمودها',ok:()=>{ const f=lastN('found',4), P=cols(); return E('found').length-ctx.f0===4&&f.every((x,i)=>pt(x.p,P[i])); },info:()=>JSON.stringify(lastN('found',5).map(f=>[f.p,f.w,f.d,f.t]))},
   {op:'shot',name:'01_skeleton_plan'},
   {op:'do',fn:async a=>{ const x=A(), cx=(x.minX+x.x1)/2, cz=(x.z0+x.maxZ)/2, R=Math.max(26,(x.x1-x.minX)*1.4); await a.fly([cx+R,R*.6,cz+R*.9],[cx,1.2,cz],2400); }},
   {op:'shot',name:'02_skeleton_persp'},
   {op:'assert',en:'Geometry check of the whole model after the skeleton',ar:'فحص هندسة الموديل كله بعد الهيكل',ok:()=>S.archCheck().length===0,info:()=>S.archCheck().join('; ')},
   card('Choice of system and foundation type, preliminary sizing by span/depth, and the column load take-down: no tool yet (a rule-of-thumb sizing sheet is missing). The sizes above are the template defaults, not a design.','اختيار النظام ونوع القواعد والأبعاد المبدئية بالبحر/العمق وتجميع أحمال الأعمدة: مفيش أداة لسه. الأبعاد فوق هي الافتراضية من القالب مش تصميم.',['Preliminary sizing sheet and column take-down','شيت أبعاد مبدئية وتجميع أحمال أعمدة']),
   card('Whole-building skeleton generator (footings, tie beams, columns on a grid, beams, slabs for every floor): being built in a separate session. When its command exists the demo will use it.','مولّد هيكل المبنى كله (قواعد وسملات وأعمدة على شبكة وكمرات وبلاطات لكل دور): بيتبني في جلسة تانية. لما أمره يظهر الديمو هيستخدمه.',['RC skeleton generator command','أمر مولّد الهيكل الخرساني'])
  ]});

 /* ---------------- phase 4: structural design checks ---------------- */
 S.add({id:'design',phase:'4',n:['Phase 4 · Structural checks: bending and bearing','المرحلة 4 · الفحوصات الإنشائية: العزم وتحمل التربة'],mode:'mixed',
  pre:async()=>{ await S.ensureProject(); S.findAnnex(); },
  sum:['A bending and shear check of a concrete section and a bearing check under a footing, with calculators that exist today. Reinforcement design, columns and BBS are shown as not available yet.','فحص انحناء وقص لقطاع خرساني وفحص تحمل تحت قاعدة، بحاسبات موجودة النهارده. تصميم التسليح والأعمدة وجدول الحديد بتظهر كـ"مش متاح لسه".'],
  steps:[
   {op:'say',en:'Phase 4 is the detailed design: slabs, beams, columns, footings, stairs, each with its checks. Today the app has two screening calculators: a concrete section (bending and shear) and a bearing check.',ar:'المرحلة 4 هي التصميم التفصيلي: بلاطات وكمرات وأعمدة وقواعد وسلالم، وكل واحد بفحوصاته. النهارده التطبيق فيه حاسبتين للفحص المبدئي: قطاع خرساني (انحناء وقص) وفحص تحمل التربة.'},
   {op:'do',fn:()=>{ ctx.q=rvQty(); const s=QX.api.sync(true); ctx.mq=s&&s.name; }},
   {op:'assert',en:'Concrete quantities come from the model (slab volume > 0 m³) and fill the Q.X "Model quantities" sheet',ar:'كميات الخرسانة جاية من الموديل (حجم البلاطات أكبر من صفر) وبتملا شيت "كميات الموديل" في Q.X',ok:()=>ctx.mq==='Model quantities'&&ctx.q.floor.V>0&&ctx.q.wall.V>0},
   {op:'run',cmd:'p_calc',after:800},
   {op:'assert',en:'Engineering analysis pane is open',ar:'لوحة التحليل الهندسي مفتوحة',ok:()=>!!(typeof calBox!=='undefined'&&calBox&&vis(calBox)),wait:4000},
   {op:'do',fn:()=>calcSet('flex')},
   {op:'say',en:'Beam check: factored moment 120 kN·m, shear 80 kN, concrete f′c 30 MPa. Demonstration numbers: the designer enters the real loads.',ar:'فحص كمرة: العزم المضروب في المعاملات ١٢٠ كيلو نيوتن·م والقص ٨٠ كيلو نيوتن وخرسانة ٣٠ ميجا باسكال. أرقام للتوضيح: المصمم بيدخل الأحمال الحقيقية.'},
   {op:'type',to:num(0),text:'120',name:['Moment Mu (kN·m)','العزم Mu (كيلو نيوتن·م)']},
   {op:'type',to:num(1),text:'80',name:['Shear Vu (kN)','القص Vu (كيلو نيوتن)']},
   {op:'type',to:num(7),text:'30',name:['Concrete f′c (MPa)','الخرسانة f′c (ميجا باسكال)']},
   {op:'click',to:calcBtn,name:['Calculate','احسب']},
   {op:'assert',en:'The check ran: result rows, no FAIL',ar:'الفحص اتنفذ: نتايج من غير FAIL',ok:()=>CC.sheet&&CC.sheet.rows&&CC.sheet.rows.length>2&&!CC.sheet.rows.some(r=>r[3]==='FAIL')},
   {op:'shot',name:'01_flex_result'},
   {op:'do',fn:()=>calcSet('bear')},
   {op:'say',en:'Footing check: load on one column about 126 kN (tributary area 9 m² × 14 kN/m², a RULE OF THUMB), footing 1.5 × 1.5 m = 2.25 m², allowable bearing 200 kN/m² (from the soil report).',ar:'فحص القاعدة: حمل العمود حوالي ١٢٦ كيلو نيوتن (المساحة المحملة ٩ م² × ١٤ كيلو نيوتن/م²، قاعدة تقريبية)، قاعدة ١٫٥ × ١٫٥ م = ٢٫٢٥ م²، تحمل مسموح ٢٠٠ كيلو نيوتن/م² (من تقرير التربة).'},
   {op:'type',to:num(0),text:'126',name:['Load W (kN)','الحمل W (كيلو نيوتن)']},
   {op:'type',to:num(1),text:'2.25',name:['Base area A (m²)','مساحة القاعدة A (م²)']},
   {op:'click',to:calcBtn,name:['Calculate','احسب']},
   {op:'assert',en:'Applied pressure 56 kN/m² is below the allowable 200: OK',ar:'الضغط الواقع ٥٦ كيلو نيوتن/م² أقل من المسموح ٢٠٠: تمام',ok:()=>CC.sheet&&CC.sheet.rows&&CC.sheet.rows[0][3]==='OK'&&Math.abs(+CC.sheet.rows[0][1]-56)<1},
   {op:'shot',name:'02_bearing_result'},
   {op:'do',fn:()=>{ try{ wxClose('pane:calc'); }catch(e){} }},
   card('Slab panels and moment coefficients, beam shear and deflection, column axial + moment interaction, footing punching shear, stairs, retaining walls: no calculation sheets yet (a structural design session is writing them).','بلاطات ومعاملات العزم، قص وترخيم الكمرات، تفاعل عزم ومحوري الأعمدة، قص الخرق للقواعد، السلالم، حوائط الساند: مفيش شيتات حساب لسه (جلسة التصميم الإنشائي بتكتبها).',['Structural design sheets (slab, beam, column, footing, stair)','شيتات تصميم إنشائي (بلاطة، كمرة، عمود، قاعدة، سلم)']),
   card('Reinforcement detailing (cover, spacing, development and lap lengths), bar bending schedule (BBS) and structural drawings: the ribbon commands are placeholders today; a rebar session is adding bar placement and BBS.','تفاصيل التسليح (الغطاء والمسافات وأطوال الربط) وجدول تفريد الحديد (BBS) والرسومات الإنشائية: أوامر الشريط مكان محجوز النهارده؛ وجلسة الحديد بتضيف وضع الأسياخ والـBBS.',['Rebar placement and BBS','وضع حديد وجدول تفريد']),
   card('The Egyptian code method (ECP 203 with cube strength) is not programmed: it needs a verified formula set from the licensed code. The check above uses the ACI form for screening only.','طريقة الكود المصري (ECP 203 بمقاومة المكعب) مش مبرمجة: محتاجة معادلات متحقق منها من الكود المرخص. الفحص فوق بصيغة ACI للفحص المبدئي بس.',['Verified ECP 203 formula set','معادلات ECP 203 متحقق منها'])
  ]});

 /* ---------------- phase 5: MEP ---------------- */
 S.add({id:'elec',phase:'5',n:['Phase 5 · Electrical: rooms and AC circuits','المرحلة 5 · الكهرباء: الغرف ودوائر التكييف'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Add the rooms in V.X, then create one AC unit per room and read its current, breaker and cable size.','ضيف الغرف في V.X، وبعدين اعمل وحدة تكييف لكل غرفة واقرأ تيارها وقاطعها ومقاس كابلها.'],
  steps:[
   {op:'say',en:'Phase 5 designs the electrical, HVAC, plumbing and low-current systems. The AC electrical data follows the rooms. Open V.X and add three rooms.',ar:'المرحلة 5 بتصمم الكهرباء والتكييف والسباكة والتيار الخفيف. كهرباء التكييف تابعة للغرف. افتح V.X وضيف ٣ غرف.'},
   {op:'tab',type:'hv'},
   {op:'do',fn:()=>{ ctx.r0=HVD.rooms.length; }},
   {op:'run',cmd:'hv_room'},{op:'run',cmd:'hv_room'},{op:'run',cmd:'hv_room'},
   {op:'assert',en:'3 rooms added',ar:'اتضافت ٣ غرف',ok:()=>HVD.rooms.length-ctx.r0===3},
   {op:'do',fn:()=>{ const v=HVD.rooms.slice(-3); [['Living',40,6],['Master bedroom',24,3],['Kitchen',16,3]].forEach((x,i)=>{ Object.assign(v[i],{n:x[0],A:x[1],pp:x[2],gS:4,wS:8}); }); hvSave(); hvRender(); }},
   {op:'say',en:'"Units from cooling load" creates one AC unit per room and sizes the current, the breaker and the cable.',ar:'"وحدات من حمل التبريد" بتعمل وحدة تكييف لكل غرفة وبتحسب التيار والقاطع والكابل.'},
   {op:'run',cmd:'ace_load',after:900},
   {op:'assert',en:'AC units created, each with current > 0 A and a breaker size',ar:'اتعملت وحدات التكييف وليها تيار أكبر من صفر وقاطع',ok:()=>ACE.units.length>=3&&ACE.units.every(u=>{ const r=aceCalc(u); return r.I>0&&r.br>0; })},
   {op:'run',cmd:'ace_open',after:900},
   {op:'assert',en:'AC electrical pane open',ar:'لوحة كهرباء التكييف مفتوحة',ok:()=>{ const l=WX.lay['pane:acel']; return !!(l&&l.open); }},
   {op:'shot',name:'01_ac_electrical'},
   {op:'do',fn:()=>{ try{ wxClose('pane:acel'); }catch(e){} }},
   card('Room-by-room load schedule (lighting, sockets), distribution boards and circuits, earthing and protection, lighting design: only the AC circuits are calculated; the rest has no tool yet (an MEP session is adding electrical design commands).','جدول أحمال كل غرفة (إنارة وبرايز) ولوحات التوزيع والدوائر والتأريض والحماية وتصميم الإنارة: دوائر التكييف بس هي المحسوبة؛ الباقي مفيش أداة لسه (جلسة MEP بتضيف أوامر تصميم الكهرباء).',['Electrical load schedule, boards, earthing, lighting','جدول أحمال وألواح وتأريض وإنارة'])
  ]});
 S.add({id:'hvac',phase:'5.1',n:['Phase 5 · HVAC: cooling load and ducts','المرحلة 5 · التكييف: حمل التبريد والمجاري'],mode:'real',
  pre:async()=>{ await S.ensureProject(); if(HVD.rooms.length<1){ HVD.rooms.push(Object.assign({},HVR,{n:'Room 1',A:30})); hvSave(); } },
  sum:['Hourly cooling load per room, then duct sizes from the loads.','حمل التبريد بالساعة لكل غرفة، وبعدين مقاسات المجاري من الأحمال.'],
  steps:[
   {op:'tab',type:'hv'},
   {op:'say',en:'V.X computes the cooling load of each room on a design day: walls, glass, people, lights, equipment and ventilation. The design temperatures are editable placeholders.',ar:'V.X بيحسب حمل التبريد لكل غرفة في يوم التصميم: حيطان وزجاج وناس وإضاءة وأجهزة وتهوية. درجات الحرارة قيم مبدئية تتعدل.'},
   {op:'do',fn:()=>{ ctx.hv=hvCalc(); hvRender(); }},
   {op:'assert',en:'Cooling load computed for every room',ar:'اتحسب حمل التبريد لكل غرفة',ok:()=>ctx.hv&&ctx.hv.rooms&&ctx.hv.rooms.length===HVD.rooms.length&&JSON.stringify(ctx.hv.rooms[0]).length>200},
   {op:'shot',name:'01_cooling_load'},
   {op:'say',en:'Duct flows come straight from the room loads.',ar:'تدفقات المجاري جاية مباشرة من أحمال الغرف.'},
   {op:'do',fn:()=>{ ctx.du0=DUC.secs.length; }},
   {op:'run',cmd:'du_load',after:900},
   {op:'assert',en:'Duct sections created from the loads (airflow > 0)',ar:'اتعملت قطاعات مجاري من الأحمال (تدفق أكبر من صفر)',ok:()=>DUC.secs.length>ctx.du0&&DUC.secs.slice(-1)[0].Q>0},
   {op:'run',cmd:'dp_open',after:800,soft:1},
   card('Equipment selection (split / VRF), fresh air and extract, and the HVAC 3D layout: libraries exist as shells with placeholder data; no sizing from the load yet.','اختيار المعدات (سبليت / VRF) والهواء النقي والشفط والرسم ثلاثي الأبعاد للتكييف: المكتبات موجودة كهياكل ببيانات مبدئية؛ ومفيش اختيار من الحمل لسه.',['Equipment selection from the load','اختيار معدات من الحمل']),
   {op:'say',en:'The result is a sizing aid for review by the HVAC engineer, not an approved design.',ar:'النتيجة أداة مساعدة للتحجيم يراجعها مهندس التكييف، مش تصميم معتمد.'}
  ]});
 S.add({id:'plumb',phase:'5.2',n:['Phase 5 · Plumbing and drainage checks','المرحلة 5 · السباكة والصرف: الفحوصات'],mode:'mixed',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Gravity drain capacity (Manning) and water pipe head loss (Hazen-Williams) with the calculators.','سعة ماسورة الصرف (Manning) وفقد ضغط ماسورة المياه (Hazen-Williams) بالحاسبات.'],
  steps:[
   {op:'say',en:'Drainage: the capacity of a gravity pipe from its diameter, roughness and slope (Manning). Open Engineering analysis.',ar:'الصرف: سعة ماسورة جاذبية من قطرها وخشونتها وميلها (Manning). افتح التحليل الهندسي.'},
   {op:'run',cmd:'p_calc',after:800},
   {op:'assert',en:'Engineering analysis pane is open',ar:'لوحة التحليل الهندسي مفتوحة',ok:()=>!!(typeof calBox!=='undefined'&&calBox&&vis(calBox)),wait:4000},
   {op:'do',fn:()=>calcSet('man')},
   {op:'type',to:num(0),text:'300',name:['Diameter (mm)','القطر (مم)']},{op:'type',to:num(1),text:'0.013',name:['Manning n','معامل Manning n']},{op:'type',to:num(2),text:'0.005',name:['Slope (m/m)','الميل (م/م)']},
   {op:'click',to:calcBtn,name:['Calculate','احسب']},
   {op:'assert',en:'Full-flow capacity 68 L/s and velocity returned (300 mm at 0.5%)',ar:'رجعت السعة ٦٨ لتر/ث والسرعة للتصرف الكامل (٣٠٠ مم بميل ٠٫٥٪)',ok:()=>CC.sheet&&CC.sheet.rows&&Math.abs(+CC.sheet.rows[0][1]-68.4)<1},
   {op:'say',en:'Water supply: friction loss (Hazen-Williams) for 10 L/s in 100 mm over 200 m.',ar:'المياه: فقد الاحتكاك (Hazen-Williams) لتصرف ١٠ لتر/ث في ١٠٠ مم لمسافة ٢٠٠ م.'},
   {op:'do',fn:()=>calcSet('hw')},
   {op:'type',to:num(0),text:'10',name:['Flow (L/s)','التصرف (لتر/ث)']},{op:'type',to:num(1),text:'100',name:['Diameter (mm)','القطر (مم)']},{op:'type',to:num(2),text:'200',name:['Length (m)','الطول (م)']},{op:'type',to:num(3),text:'140',name:['C factor','معامل C']},{op:'type',to:num(4),text:'0',name:['Minor losses K','فواقد ثانوية K']},
   {op:'click',to:calcBtn,name:['Calculate','احسب']},
   {op:'assert',en:'Velocity 1.27 m/s and total head loss 3.3 m returned',ar:'رجعت السرعة ١٫٢٧ م/ث وفقد الضغط الكلي ٣٫٣ م',ok:()=>CC.sheet&&CC.sheet.rows&&Math.abs(+CC.sheet.rows[0][1]-1.27)<.05},
   {op:'shot',name:'01_hazen_result'},
   {op:'do',fn:()=>{ try{ wxClose('pane:calc'); }catch(e){} }},
   card('Fixture units and pipe sizing for the whole building, hot water, vents, septic or sewer connection, rainwater roof drains, fire fighting: no tool yet beyond the two calculators.','وحدات الأجهزة وتحجيم المواسير للمبنى كله والمياه الساخنة والتهوية وتوصيل الصرف أو الخزان والصرف المطري وإطفاء الحريق: مفيش أداة لسه غير الحاسبتين.',['Plumbing design sheets and layouts','شيتات وتصميم سباكة']),
   {op:'say',en:'Results are checks for review by the engineer, not an approved design.',ar:'النتايج فحوصات يراجعها المهندس، مش تصميم معتمد.'}
  ]});
 S.add({id:'lowc',phase:'5.3',n:['Phase 5 · Low-current: data, TV and fire-alarm symbols','المرحلة 5 · التيار الخفيف: رموز البيانات والتلفزيون وإنذار الحريق'],mode:'mixed',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Place data outlet, TV outlet, smoke detector and alarm bell symbols from the C.X block library onto the drawing.','ضع رموز مخرج بيانات وتلفزيون وكاشف دخان وجرس إنذار من مكتبة بلوكات C.X على الرسم.'],
  steps:[
   {op:'say',en:'Low-current systems (data, TV, fire alarm) are drawn in C.X with the block library. The app has symbols for them; there is no cabling or alarm calculation module yet.',ar:'التيار الخفيف (بيانات وتلفزيون وإنذار حريق) بيترسم في C.X بمكتبة البلوكات. التطبيق فيه رموزها؛ ومفيش وحدة حساب كابلات أو إنذار ليها لسه.'},
   {op:'tab',type:'draft'},
   {op:'do',fn:()=>{ ctx.e0=cadD().ents.length; lbOpen('cx','cxblk','data'); }},
   {op:'assert',en:'Block library pane is open with cards',ar:'لوحة مكتبة البلوكات مفتوحة وفيها كروت',ok:()=>document.querySelectorAll('#lbg_cx .lbc').length>10,wait:4000},
   {op:'do',fn:()=>{ ctx.pts=[[2000,1500],[3500,1500],[5000,1500],[6500,1500]]; }},
   ...[['data',0,.3],['tv',1,.45],['smoke',2,.6],['bell',3,.75]].flatMap(([id,k,fx])=>[
     {op:'click',to:()=>{ const it=lbItems(LB.libs.cxblk).find(x=>x.id===id); const t=it&&lbNm(it); return [...document.querySelectorAll('#lbg_cx .lbc')].find(c=>c.title===t); },hold:1000},
     {op:'assert',en:'Place mode is armed (click on the drawing)',ar:'وضع الوضع شغال (اضغط على الرسم)',ok:()=>CS.tool==='lbplace'&&!!CS.lbArm},
     {op:'move',to:()=>{ const s=CW.querySelector('svg'); return vis(s)?s:CW; },at:[fx,.4],tip:false,hold:900},
     {op:'do',fn:()=>{ cadClick(ctx.pts[k]); if(k===3)cadEsc(); }}]),
   {op:'assert',en:'Four symbols placed as real CAD entities and saved as blocks',ar:'٤ رموز اتحطت ككيانات CAD حقيقية واتحفظت كبلوكات',ok:()=>{ const D=cadD(); return D.ents.length-ctx.e0>=4&&Object.keys(D.blocks||{}).some(b=>/^LB_/i.test(b)); }},
   {op:'do',fn:()=>{ try{ wxClose('lb_cx'); }catch(e){} }},
   {op:'do',fn:()=>{ try{ cadZoomExt(); }catch(e){} }},
   {op:'shot',name:'01_symbols'},
   card('Cabling routes, rack and panel locations, fire-alarm zoning and device counts: no tool yet (symbols only).','مسارات الكابلات ومكان الراك واللوحات ومناطق الإنذار وعدد الأجهزة: مفيش أداة لسه (رموز بس).',['Low-current layout and schedules','تخطيط وجداول تيار خفيف'])
  ]});

 /* ---------------- phase 6: coordination, quantities, BOQ ---------------- */
 S.add({id:'clash',phase:'6',n:['Phase 6 · N.X coordination and clash detection','المرحلة 6 · N.X التنسيق وكشف التعارضات'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Add a clash test of everything against everything and run it on the model.','ضيف اختبار تعارض لكل حاجة ضد كل حاجة وشغّله على الموديل.'],
  steps:[
   {op:'say',en:'Phase 6 starts with coordination: all disciplines in one model, then a clash test. A hard test finds elements whose volumes overlap.',ar:'المرحلة 6 بتبدأ بالتنسيق: كل التخصصات في موديل واحد وبعدين اختبار تعارض. اختبار hard بيلاقي عناصر أحجامها متداخلة.'},
   {op:'tab',type:'coord'},
   {op:'run',cmd:'nv_clash',after:900},
   {op:'assert',en:'Clash Detective pane is open',ar:'كاشف التعارض مفتوح',ok:()=>{ const l=WX.lay['pane:nvclash']; return !!(l&&l.open); },wait:4000},
   {op:'do',fn:()=>{ ctx.t0=nvCl().tests.length; CLS.tab='tests'; nvClRender(); }},
   {op:'click',to:'[data-a="addtest"]',name:['Add a test','أضف اختبار']},
   {op:'assert',en:'A test was added',ar:'اتضاف اختبار',ok:()=>nvCl().tests.length===ctx.t0+1},
   {op:'click',to:'[data-a="runall"]',name:['Run all tests','شغّل كل الاختبارات'],after:1200},
   {op:'assert',en:'The test ran and found clashes',ar:'الاختبار اشتغل ولقى تعارضات',ok:()=>{ const t=nvCl().tests[nvCl().tests.length-1]; return t&&Array.isArray(t.results)&&t.count>0; },wait:5000},
   {op:'do',fn:()=>{ const t=nvCl().tests[nvCl().tests.length-1]; t.results[0].status='Reviewed'; try{ nvKeep(); CLS.tab='res'; nvClRender(); }catch(e){} }},
   {op:'assert',en:'First clash marked "Reviewed" in the results list',ar:'أول تعارض اتعلّم "Reviewed" في قايمة النتايج',ok:()=>nvCl().tests.slice(-1)[0].results[0].status==='Reviewed'},
   {op:'shot',name:'01_clash_results'},
   {op:'do',fn:()=>{ try{ wxClose('pane:nvclash'); }catch(e){} }},
   {op:'say',en:'The clashes come from the template itself (for example a stair crossing a slab). In a real project each one is reviewed and the model fixed. MEP pipes and ducts are not modelled in 3D yet, so MEP clashes cannot be found.',ar:'التعارضات جاية من القالب نفسه (مثلاً سلم بيقطع بلاطة). في مشروع حقيقي كل واحد بيتراجع والموديل بيتصلح. مواسير ومجاري الـMEP مش متعملة 3D لسه فمينفعش نلاقي تعارضات MEP.'}
  ]});
 S.add({id:'boq',phase:'6.1',n:['Phase 6 · Quantities, BOQ and cost','المرحلة 6 · الكميات والمقايسة والتكلفة'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Quantities from the model become a BOQ and a cost summary in Q.X.','كميات الموديل بتبقى مقايسة وملخص تكلفة في Q.X.'],
  steps:[
   {op:'say',en:'Q.X links to the model: "Model quantities" lists every item, "Build BOQ" groups them, "Cost summary" adds percentages and totals.',ar:'Q.X مربوط بالموديل: "كميات الموديل" بتسرد كل بند، "عمل BOQ" بيجمّعها، "ملخص التكلفة" بيضيف النسب والإجماليات.'},
   {op:'tab',type:'takeoff'},
   {op:'do',fn:()=>{ QX.api.sync(true); QX.mkBoq(); QX.mkCost(); }},
   {op:'assert',en:'Model quantities, BOQ and Cost summary sheets exist',ar:'شيتات كميات الموديل والـBOQ وملخص التكلفة موجودة',ok:()=>{ const n=QX.api.wb().sheets.map(s=>s.name); return n.includes('Model quantities')&&n.some(x=>/^BOQ/i.test(x))&&n.includes('Cost summary'); }},
   {op:'shot',name:'01_boq'},
   {op:'say',en:'The rate cells are empty on purpose. One SAMPLE rate is typed into the BOQ so you can see the total move; use your own rates.',ar:'خانات السعر فاضية عن قصد. سعر تجريبي واحد اتكتب في الـBOQ عشان تشوف الإجمالي بيتحرك؛ استخدم أسعارك.'},
   {op:'do',fn:()=>{ const w=QX.api.wb(), sh=w.sheets.find(s=>/^BOQ/i.test(s.name)); const hdr=[0,1,2,3,4,5].map(k=>qxGet(sh,0,k)); ctx.rc=hdr.findIndex(v=>typeof v==='string'&&/^rate$|سعر/i.test(v)); ctx.ac=hdr.findIndex(v=>typeof v==='string'&&/^amount$|المبلغ/i.test(v)); ctx.qr=-1; for(let r=1;r<40;r++){ const q=qxGet(sh,r,ctx.rc-1); if(typeof q==='number'&&q>0){ ctx.qr=r; ctx.q=q; break; } } if(ctx.rc>0&&ctx.qr>0){ sh.cells[qxK(ctx.qr,ctx.rc)]=100; try{ qxRecalcAll(w); }catch(e){} ctx.amt=qxGet(sh,ctx.qr,ctx.ac); } }},
   {op:'assert',en:'With a sample rate of 100 the item amount = quantity × 100',ar:'بسعر تجريبي ١٠٠ مبلغ البند = الكمية × ١٠٠',ok:()=>typeof ctx.amt==='number'&&Math.abs(ctx.amt-ctx.q*100)<.5},
   card('Specifications (concrete grade, steel, finishes), unit-price lists and a priced estimate with preliminaries: the app has no price list or specification book; rates and specs are typed by the estimator (a price-and-spec session is adding sample books).','المواصفات (رتبة الخرسانة والحديد والتشطيبات) وقوايم الأسعار وتقدير مسعّر بالمصروفات العامة: التطبيق مفيهوش قايمة أسعار أو كتاب مواصفات؛ المقدّر بيكتب الأسعار والمواصفات (جلسة الأسعار والمواصفات بتضيف كتب تجريبية).',['Unit-price list and specification book','قايمة أسعار وكتاب مواصفات'])
  ]});
 /* feature detection example for later sessions: when a skeleton generator command appears, offer it as a real step */
 S.has=id=>!!XC[id];
})();
