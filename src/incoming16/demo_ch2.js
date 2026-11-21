/* ====== demo_ch2.js - chapters 3-7: site + earthworks + cost, P.X schedule, structure checks, electrical (AC), HVAC. Evaluated with demo_core.js and demo_ch1.js. ======
   Honest rule used here: "run" = the real ribbon button (XC command); "do" = a call to the same function/API the button or form uses (TOX.*, store edits) when the real input is an OS file dialog or many form fields. Every chapter ends in asserts on the data. */
(function(){
 const S=DEMO, B=S.B, ctx={};
 const sleepq=ms=>S.sleep(ms);
 const qxVal=(name,r,c)=>{ const sh=QX.api.wb().sheets.find(s=>s.name===name); return sh?qxGet(sh,r,c):null; };
 const nrx=()=>ACT.filter(a=>a.src==='rx').length;

 /* ---------------- 3: site, survey, excavation, earthworks cost ---------------- */
 S.add({id:'site',n:['Site: survey, excavation and earthworks cost','الموقع: المساحة والحفر وتكلفة الأعمال الترابية'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Import survey points, build the ground surface and contours, compute cut and fill against a design level, then price it in a Q.X sheet.','استيراد نقط المساحة، عمل سطح الأرض والكنتور، حساب القطع والردم على منسوب التصميم، وبعدين تسعيره في شيت Q.X.'],
  steps:[
   {op:'say',en:'F.X is the reality-capture and terrain tab. Survey points normally come from a file on your computer (CSV, DXF, LandXML, GPX). The file dialog is outside the browser, so the demo feeds 36 sample points to the same import function.',ar:'F.X هو تاب التقاط الواقع والتضاريس. نقط المساحة عادةً بتيجي من ملف على جهازك (CSV أو DXF أو LandXML أو GPX). نافذة الملف برّه المتصفح، فالديمو بيدّي ٣٦ نقطة تجريبية لنفس دالة الاستيراد.'},
   {op:'tab',type:'capture'},
   {op:'assert',en:'F.X tab is open',ar:'تاب F.X مفتوح',ok:()=>ribType()==='capture',wait:5000},
   {op:'do',fn:async()=>{ let csv='P,E,N,Z\n',n=1; for(let i=0;i<6;i++)for(let j=0;j<6;j++)csv+=(n++)+','+(i*5)+','+(j*5)+','+(100+.4*i-.3*j+Math.sin(i+j)*.2).toFixed(2)+'\n'; ctx.imp=await TOX.importSurveyFile({name:'sample_points.csv',text:csv,order:'P,E,N,Z'}); }},
   {op:'assert',en:'36 survey points imported',ar:'اتستوردت ٣٦ نقطة مساحة',ok:()=>TOX.captureState().points===36},
   {op:'say',en:'Build the TIN surface from the points with the ribbon button.',ar:'نعمل سطح TIN من النقط بزرار الشريط.'},
   {op:'run',cmd:'rc_tin',after:600},
   {op:'assert',en:'Ground surface (TIN) exists',ar:'سطح الأرض (TIN) اتعمل',ok:()=>TOX.captureState().surfaces.length>=1},
   {op:'do',fn:async()=>{ ctx.cont=await TOX.makeContours({interval:.5}); }},
   {op:'assert',en:'Contours drawn every 0.5 m',ar:'الكنتور اتعمل كل ٠٫٥ م',ok:()=>ctx.cont&&ctx.cont.segments>0},
   {op:'say',en:'Excavation and backfill: cut and fill of the ground against a design platform level of 100.00 m.',ar:'الحفر والردم: القطع والردم للأرض مقابل منسوب منصة التصميم ١٠٠٫٠٠ م.'},
   {op:'run',cmd:'rc_qty',after:500},
   {op:'do',fn:async()=>{ ctx.cf=await TOX.computeCutFill({level:100}); }},
   {op:'assert',en:'Cut and fill volumes computed (m³)',ar:'اتحسبت أحجام القطع والردم (م³)',ok:()=>ctx.cf&&ctx.cf.tin.cut>0&&ctx.cf.tin.fill>0},
   {op:'say',en:'Cost: a Q.X sheet multiplies the volumes by unit rates. The app ships no price list, so the rates here are SAMPLE placeholders for the demo; type your own.',ar:'التكلفة: شيت Q.X بيضرب الأحجام في أسعار الوحدة. التطبيق مفيهوش قايمة أسعار، فالأسعار هنا تجريبية للديمو؛ اكتب أسعارك.'},
   {op:'do',fn:()=>{ const c=ctx.cf.tin.cut, f=ctx.cf.tin.fill; QX.addSheet('Earthworks',sh=>{ const P=(r,k,v)=>{ sh.cells[qxK(r,k)]=v; }; ['Item','Quantity m3','Sample rate (placeholder)','Cost'].forEach((t,k)=>P(0,k,t)); P(1,0,'Excavation (cut)'); P(1,1,+c.toFixed(2)); P(1,2,40); P(1,3,'=B2*C2'); P(2,0,'Backfill (fill)'); P(2,1,+f.toFixed(2)); P(2,2,25); P(2,3,'=B3*C3'); P(3,0,'Total'); P(3,3,'=D2+D3'); }); }},
   {op:'assert',en:'Earthworks sheet total = cut × rate + fill × rate',ar:'إجمالي شيت الأعمال الترابية = قطع × سعر + ردم × سعر',ok:()=>{ const t=qxVal('Earthworks',3,3); return typeof t==='number'&&Math.abs(t-(ctx.cf.tin.cut*40+ctx.cf.tin.fill*25))<1; }},
   {op:'do',fn:()=>{ ctx.site=qxVal('Earthworks',3,3); }},
   {op:'say',en:'GIS: "Send the model to the map" places the building footprint on the G.X map layers.',ar:'GIS: "ابعت الموديل للخريطة" بيحط مسقط المبنى على طبقات خريطة G.X.'},
   {op:'run',cmd:'xf_gis',after:800,soft:1},
   {op:'assert',en:'Map layers hold features',ar:'طبقات الخريطة فيها عناصر',soft:1,ok:()=>GM.layers.some(l=>l.feat&&l.feat.length>0)}
  ]});

 /* ---------------- 4: P.X schedule linked to the model ---------------- */
 S.add({id:'sched',n:['P.X: schedule from the model (4D / 5D)','P.X: الجدول من الموديل (4D / 5D)'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Send the R.X quantities to P.X, compute the schedule, open the Gantt and link the schedule window to the model window.','ابعت كميات R.X لـP.X، احسب الجدول، افتح الجانت واربط نافذة الجدول بنافذة الموديل.'],
  steps:[
   {op:'tab',type:'model'},
   {op:'say',en:'The schedule is built from the model: "Send to P.X" turns each type of work (foundations, walls, slabs, roof...) into activities with durations from quantities divided by productivity.',ar:'الجدول بيتعمل من الموديل: "ابعت لـP.X" بيحوّل كل نوع شغل (أساسات وحيطان وبلاطات وسقف...) لأنشطة مدتها الكمية على الإنتاجية.'},
   {op:'run',cmd:'xf_p6',after:500},
   {op:'assert',en:'The productivity table opened',ar:'جدول الإنتاجية اتفتح',ok:()=>[...document.querySelectorAll('button')].some(b=>b.textContent.trim()===B('Add to the schedule','ضيف للجدول'))},
   {op:'move',to:()=>[...document.querySelectorAll('table.dctab')].find(t=>vis(t)),opt:1,hold:900,tip:[B('Output per day is a placeholder: use your own productivity','الإنتاجية في اليوم قيمة مبدئية: استخدم إنتاجيتك')]},
   {op:'click',to:()=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===B('Add to the schedule','ضيف للجدول')),hold:400},
   {op:'assert',en:'Activities created from the model (WBS 5)',ar:'اتعملت أنشطة من الموديل (WBS 5)',ok:()=>nrx()>=3,wait:5000},
   {op:'do',fn:()=>{ computeSched(); try{ p6Refresh(); }catch(e){} ctx.fin=ACT.filter(a=>a.src==='rx').slice(-1)[0]; }},
   {op:'assert',en:'Schedule computed: the last activity has a finish date after the start',ar:'اتحسب الجدول: آخر نشاط له تاريخ نهاية بعد البداية',ok:()=>ctx.fin&&ctx.fin.fDate>ctx.fin.sDate},
   {op:'say',en:'The Gantt chart shows the same activities as bars with the critical path.',ar:'الجانت بيعرض نفس الأنشطة أعمدة مع المسار الحرج.'},
   {op:'run',cmd:'gantt_open',after:900},
   {op:'assert',en:'Gantt pane is open',ar:'الجانت مفتوح',ok:()=>{ const l=WX.lay['pane:gantt']; return !!(l&&l.open); }},
   {op:'say',en:'4D link: link the schedule window with the model window, so selecting an activity shows its work in 3D.',ar:'ربط 4D: نربط نافذة الجدول بنافذة الموديل، فاختيار نشاط يوري شغله في الـ3D.'},
   {op:'do',fn:()=>{ ctx.lk=TOXAPI.link('sched','model'); }},
   {op:'assert',en:'Schedule and model windows share a link colour',ar:'نافذتا الجدول والموديل ليهم نفس لون الربط',ok:()=>!!ctx.lk&&LK.col(LK.winId('sched')||'sched')===LK.col(LK.winId('model')||'model')}
  ]});

 /* ---------------- 5: structure: quantities, concrete check ---------------- */
 S.add({id:'struct',n:['Structure: concrete quantities and a bending check','الإنشائي: كميات الخرسانة وفحص العزم'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Concrete volumes from the R.X model, then a concrete section flexure and shear check with a code selected.','أحجام الخرسانة من موديل R.X، وبعدين فحص انحناء وقص لقطاع خرساني بكود مختار.'],
  steps:[
   {op:'say',en:'Concrete quantities come from the model elements: walls, floor slabs and columns, measured in m³.',ar:'كميات الخرسانة جاية من عناصر الموديل: حيطان وبلاطات وأعمدة بالمتر المكعب.'},
   {op:'do',fn:async()=>{ ctx.q=rvQty(); const s=QX.api.sync(true); ctx.mq=s&&s.name; }},
   {op:'assert',en:'Model quantities sheet in Q.X, with floor slab volume > 0 m³',ar:'شيت كميات الموديل في Q.X وحجم البلاطات أكبر من صفر',ok:()=>ctx.mq==='Model quantities'&&ctx.q.floor.V>0&&ctx.q.wall.V>0},
   {op:'say',en:'Reinforcement: R.X has the rebar tool for placing bars; the rebar pane of the Parts tab belongs to the lift-station sample, so it is not shown here.',ar:'التسليح: R.X فيه أداة حديد لوضع الأسياخ؛ أما لوحة الحديد في تاب الأجزاء فتبع نموذج المحطة، فمش بنعرضها هنا.'},
   {op:'say',en:'Moment check: open Engineering analysis, pick "Concrete section: flexure and shear", enter the factored moment and the section, and press Calculate.',ar:'فحص العزم: افتح التحليل الهندسي، اختار "قطاع خرساني: انحناء وقص"، دخّل العزم المضروب في المعاملات والقطاع، واضغط احسب.'},
   {op:'run',cmd:'p_calc',after:700},
   {op:'assert',en:'Engineering analysis pane is open',ar:'لوحة التحليل الهندسي مفتوحة',ok:()=>!!(typeof calBox!=='undefined'&&calBox&&vis(calBox)),wait:4000},
   {op:'do',fn:()=>{ CC.id='flex'; CC.code='ACI 318'; CC.vals={}; CC.sheet=null; calPanel(); }},
   {op:'type',to:()=>calBox.querySelectorAll('input[type=number]')[0],text:'120',tip:false,hold:100},
   {op:'type',to:()=>calBox.querySelectorAll('input[type=number]')[1],text:'80',tip:false,hold:100},
   {op:'type',to:()=>calBox.querySelectorAll('input[type=number]')[7],text:'30',tip:false,hold:100},
   {op:'click',to:()=>[...calBox.querySelectorAll('button')].find(b=>b.textContent.trim()===B('Calculate','احسب')),hold:300},
   {op:'assert',en:'The check ran and returned result rows (no FAIL)',ar:'الفحص اتنفذ ورجّع نتايج (من غير FAIL)',ok:()=>CC.sheet&&CC.sheet.rows&&CC.sheet.rows.length>2&&!CC.sheet.rows.some(r=>r[3]==='FAIL')},
   {op:'say',en:'These numbers are a demonstration of the calculator, not a structural design: the designer enters real loads and checks the code.',ar:'الأرقام دي توضيح للحاسبة مش تصميم إنشائي: المصمم بيدخل أحمال حقيقية ويراجع الكود.'}
  ]});

 /* ---------------- 6: electrical (AC circuits) ---------------- */
 S.add({id:'elec',n:['Electrical: AC unit circuits','الكهرباء: دوائر وحدات التكييف'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Add the rooms in V.X, then create one AC unit per room and read its current, breaker and cable size.','ضيف الغرف في V.X، وبعدين اعمل وحدة تكييف لكل غرفة واقرأ تيارها وقاطعها ومقاس كابلها.'],
  steps:[
   {op:'say',en:'The electrical data of the air conditioners follows the rooms. Open V.X and add three rooms.',ar:'بيانات كهرباء التكييف تابعة للغرف. افتح V.X وضيف ٣ غرف.'},
   {op:'tab',type:'hv'},
   {op:'do',fn:()=>{ ctx.r0=HVD.rooms.length; }},
   {op:'run',cmd:'hv_room'},{op:'run',cmd:'hv_room'},{op:'run',cmd:'hv_room'},
   {op:'assert',en:'3 rooms added',ar:'اتضافت ٣ غرف',ok:()=>HVD.rooms.length-ctx.r0===3},
   {op:'do',fn:()=>{ const v=HVD.rooms.slice(-3); [['Living',40,6],['Master bedroom',24,3],['Kitchen',16,3]].forEach((x,i)=>{ Object.assign(v[i],{n:x[0],A:x[1],pp:x[2],gS:4,wS:8}); }); hvSave(); hvRender(); }},
   {op:'say',en:'Now "Units from cooling load" creates one AC unit per room and sizes the current, the breaker and the cable.',ar:'دلوقتي "وحدات من حمل التبريد" بتعمل وحدة تكييف لكل غرفة وبتحسب التيار والقاطع والكابل.'},
   {op:'run',cmd:'ace_load',after:800},
   {op:'assert',en:'AC units created, each with current > 0 A and a breaker size',ar:'اتعملت وحدات التكييف وليها تيار أكبر من صفر وقاطع',ok:()=>ACE.units.length>=3&&ACE.units.every(u=>{ const r=aceCalc(u); return r.I>0&&r.br>0; })},
   {op:'run',cmd:'ace_open',after:900},
   {op:'assert',en:'AC electrical pane open',ar:'لوحة كهرباء التكييف مفتوحة',ok:()=>{ const l=WX.lay['pane:acel']; return !!(l&&l.open); }},
   {op:'say',en:'This covers the AC circuits. Lighting, power panels and cable trays are not calculated in this app yet: the R.X ribbon has their tools as model placeholders only.',ar:'ده بيغطي دوائر التكييف. الإنارة ولوحات الكهرباء وصواني الكابلات مش محسوبة في التطبيق لسه: شريط R.X فيه أدواتها كمكان محجوز بس.'}
  ]});

 /* ---------------- 7: HVAC ---------------- */
 S.add({id:'hvac',n:['HVAC: cooling load and ducts','التكييف: حمل التبريد والمجاري'],mode:'real',
  pre:async()=>{ await S.ensureProject(); if(HVD.rooms.length<1){ HVD.rooms.push(Object.assign({},HVR,{n:'Room 1',A:30})); hvSave(); } },
  sum:['Hourly cooling load per room, then duct sizes from the loads.','حمل التبريد بالساعة لكل غرفة، وبعدين مقاسات المجاري من الأحمال.'],
  steps:[
   {op:'tab',type:'hv'},
   {op:'say',en:'V.X computes the cooling load of each room on a design day: walls, glass, people, lights, equipment and ventilation. The design temperatures are editable placeholders.',ar:'V.X بيحسب حمل التبريد لكل غرفة في يوم التصميم: حيطان وزجاج وناس وإضاءة وأجهزة وتهوية. درجات الحرارة قيم مبدئية تتعدل.'},
   {op:'do',fn:()=>{ ctx.hv=hvCalc(); hvRender(); }},
   {op:'assert',en:'Cooling load computed for every room',ar:'اتحسب حمل التبريد لكل غرفة',ok:()=>ctx.hv&&ctx.hv.rooms&&ctx.hv.rooms.length===HVD.rooms.length&&JSON.stringify(ctx.hv.rooms[0]).length>200},
   {op:'say',en:'Duct flows come straight from the room loads.',ar:'تدفقات المجاري جاية مباشرة من أحمال الغرف.'},
   {op:'do',fn:()=>{ ctx.du0=DUC.secs.length; }},
   {op:'run',cmd:'du_load',after:800},
   {op:'assert',en:'Duct sections created from the loads (airflow > 0)',ar:'اتعملت قطاعات مجاري من الأحمال (تدفق أكبر من صفر)',ok:()=>DUC.secs.length>ctx.du0&&DUC.secs.slice(-1)[0].Q>0},
   {op:'run',cmd:'dp_open',after:700,soft:1},
   {op:'say',en:'The result is a sizing aid for review by the HVAC engineer, not an approved design.',ar:'النتيجة أداة مساعدة للتحجيم يراجعها مهندس التكييف، مش تصميم معتمد.'}
  ]});
 const vis=e=>{ if(!e||!e.isConnected)return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
})();
