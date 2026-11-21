/* ====== demo_ch3.js - phases 7-10: tender, planning, construction in stages with hold points, handover, outputs. Evaluated with the other demo files. ====== */
(function(){
 const S=DEMO, B=S.B, ctx={};
 const vis=e=>{ if(!e||!e.isConnected)return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
 const nrx=()=>ACT.filter(a=>a.src==='rx').length;
 const card=(en,ar,need,kind)=>({op:'card',kind:kind,en:en,ar:ar,need:need});
 const STAGES=[{"id": "9.1", "en": "Site setup and set-out", "ar": "تجهيز الموقع والتوقيع", "hold": "HOLD: set-out checked by the consultant before excavation. Record: set-out sheet."}, {"id": "9.2", "en": "Excavation and shoring", "ar": "الحفر والسند", "hold": "HOLD: founding level and soil acceptance (consultant + geotech). Record: excavation approval form with level readings."}, {"id": "9.3", "en": "Blinding and waterproofing of foundations", "ar": "الخرسانة العادية وعزل الأساسات", "hold": "HOLD: blinding level and dimensions; waterproofing continuity. Record: blinding approval."}, {"id": "9.4", "en": "Footings, neck columns and tie beams", "ar": "القواعد ورقاب الأعمدة والسملات", "hold": "HOLD 1: rebar inspection before pour (diameter, spacing, cover, laps, starters, cleanliness, formwork). HOLD 2: pour with approved mix, slum"}, {"id": "9.5", "en": "Ground slab / plinth beams and DPC", "ar": "أرضية الدور الأرضي والعزل الأفقي", "hold": "HOLD: sleeves/embedded services inspected BEFORE pour (MEP + QC). Record: embedded works checklist."}, {"id": "9.6", "en": "Columns, beams and slabs - each floor", "ar": "الأعمدة والكمرات والبلاطات لكل دور", "hold": "HOLD 1: formwork and props inspection. HOLD 2: rebar inspection (incl. top steel, stirrups, cover, laps, openings). HOLD 3: MEP embedded wor"}, {"id": "9.7", "en": "Roof slab, parapet, roof waterproofing and tanks", "ar": "سقف الدور الأخير والبرابيت وعزل الأسطح", "hold": "HOLD: flood test pass (no leaks after 24-48 h). Record: flood test report."}, {"id": "9.8", "en": "Masonry (external and internal walls)", "ar": "المباني (الطوب الخارجي والداخلي)", "hold": "HOLD: opening sizes, verticality, lintels, chase depth. Record: masonry inspection."}, {"id": "9.9", "en": "MEP first fix (rough-in)", "ar": "أعمال الكهروميكانيكا الأولى (داخل الحوائط)", "hold": "HOLD: pressure test water pipes (typ. 1.5 x working pressure, 2-24 h per spec), drain water/air test, conduit continuity and earth continuit"}, {"id": "9.10", "en": "Plaster (internal and external)", "ar": "المحارة الداخلية والخارجية", "hold": "HOLD: MEP first fix tested and closed before plaster. Record: plaster inspection."}, {"id": "9.11", "en": "Floors, wall finishes, ceilings, doors/windows, paint", "ar": "الأرضيات وتشطيبات الحوائط والأسقف والأبواب والدهانات", "hold": "HOLD: wet-area waterproofing flood test; tile sampling approval; colour approvals."}, {"id": "9.12", "en": "MEP second fix (trim)", "ar": "أعمال الكهروميكانيكا الثانية (التركيبات النهائية)", "hold": "HOLD: insulation resistance (megger), earth resistance, RCD trip test, polarity before energising."}, {"id": "9.13", "en": "External works", "ar": "الأعمال الخارجية", "hold": "HOLD: manholes and drainage test, sewer connection approved."}];

 /* ---------------- phase 7: tender and contract ---------------- */
 S.add({id:'tender',phase:'7',n:['Phase 7 · Tender: bid log and comparison','المرحلة 7 · المناقصة: سجل العروض والمقارنة'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Log the tender documents and three sample bids in the register, then compare the bids in a Q.X sheet.','سجّل مستندات المناقصة وثلاثة عروض تجريبية في السجل، وبعدين قارن العروض في شيت Q.X.'],
  steps:[
   {op:'say',en:'Phase 7: the tender package goes out to three to five bidders, questions are logged as RFIs, bids come back and are compared. The document register keeps the trail.',ar:'المرحلة 7: حزمة المناقصة بتروح لـ٣ لـ٥ مقاولين، والأسئلة بتتسجل RFI، والعروض بترجع وتتقارن. سجل المستندات بيحفظ المسار.'},
   {op:'do',fn:()=>{ ctx.d0=TOX.docs().length; ctx.r=[]; ctx.r.push(TOX.addDoc({type:'LTR',dir:'out',subject:'Invitation to tender: Project 6868',body:'Demo record: invitation to three sample bidders.',from:'Consultant',to:'Bidders'})); ['A','B','C'].forEach(x=>ctx.r.push(TOX.addDoc({type:'SUB',dir:'in',subject:'Sample bid from Contractor '+x,body:'Demo record: sealed bid received.',from:'Contractor '+x,to:'Consultant'}))); ctx.r.push(TOX.addDoc({type:'RFI',dir:'in',subject:'Bidder question: slab thickness at the garage',body:'Demo record.',from:'Contractor B',to:'Consultant'})); }},
   {op:'assert',en:'Five records in the register: invitation, three bids, one bidder question',ar:'خمس سجلات في السجل: دعوة وثلاث عروض وسؤال مقاول',ok:()=>TOX.docs().length-ctx.d0===5},
   {op:'say',en:'Bid comparison in Q.X: the three SAMPLE totals, the lowest and the spread against the estimate. The numbers are invented for the demo.',ar:'مقارنة العروض في Q.X: الإجماليات التجريبية الثلاثة، والأقل، والفرق عن التقدير. الأرقام متألفة للديمو.'},
   {op:'tab',type:'takeoff'},
   {op:'do',fn:()=>{ QX.addSheet('Bid comparison',sh=>{ const P=(r,k,v)=>{ sh.cells[qxK(r,k)]=v; }; ['Bidder','Sample total','Difference to estimate %'].forEach((t,k)=>P(0,k,t)); P(1,0,'Estimate (sample)'); P(1,1,1000000); P(2,0,'Contractor A'); P(2,1,1080000); P(2,2,'=(B3-B$2)/B$2*100'); P(3,0,'Contractor B'); P(3,1,985000); P(3,2,'=(B4-B$2)/B$2*100'); P(4,0,'Contractor C'); P(4,1,1210000); P(4,2,'=(B5-B$2)/B$2*100'); P(5,0,'Lowest bid'); P(5,1,'=MIN(B3:B5)'); }); }},
   {op:'assert',en:'The sheet finds the lowest bid (985,000) and Contractor B is 1.5% under the estimate',ar:'الشيت لقى أقل عرض (٩٨٥٬٠٠٠) والمقاول B أقل من التقدير بـ١٫٥٪',ok:()=>{ const sh=QX.api.wb().sheets.find(s=>s.name==='Bid comparison'); return sh&&qxGet(sh,5,1)===985000&&Math.abs(qxGet(sh,3,2)+1.5)<.01; }},
   {op:'shot',name:'01_bid_comparison'},
   card('Negotiation, award recommendation and contract signing are decisions and paperwork done by people.','التفاوض وترسية العقد والتوقيع قرارات وورق بيعملها ناس.',null,'field'),
   card('Tender package templates (instructions to bidders, conditions) exist only as generic document templates; there is no contract builder or bid-analysis tool yet.','قوالب حزمة المناقصة موجودة كقوالب مستندات عامة بس؛ ومفيش بنّاء عقود أو أداة تحليل عروض لسه.',['Contract builder and bid analysis','بنّاء عقود وتحليل عروض'])
  ]});

 /* ---------------- phase 8: planning ---------------- */
 S.add({id:'sched',phase:'8',n:['Phase 8 · P.X planning: schedule from the model (4D / 5D)','المرحلة 8 · P.X التخطيط: الجدول من الموديل (4D / 5D)'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Send the R.X quantities to P.X, compute the schedule, open the Gantt and link the schedule window to the model window.','ابعت كميات R.X لـP.X، احسب الجدول، افتح الجانت واربط نافذة الجدول بنافذة الموديل.'],
  steps:[
   {op:'tab',type:'model'},
   {op:'say',en:'Phase 8: the schedule is built from the model. "Send to P.X" turns each type of work into activities with durations from quantity divided by productivity.',ar:'المرحلة 8: الجدول بيتعمل من الموديل. "ابعت لـP.X" بيحوّل كل نوع شغل لأنشطة مدتها الكمية على الإنتاجية.'},
   {op:'run',cmd:'xf_p6',after:700},
   {op:'assert',en:'The productivity table opened',ar:'جدول الإنتاجية اتفتح',ok:()=>[...document.querySelectorAll('button')].some(b=>b.textContent.trim()===B('Add to the schedule','ضيف للجدول'))},
   {op:'move',to:()=>[...document.querySelectorAll('table.dctab')].find(t=>vis(t)),opt:1,hold:1400,name:['Output per day: a placeholder, use your own productivity','الإنتاجية في اليوم قيمة مبدئية: استخدم إنتاجيتك']},
   {op:'click',to:()=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===B('Add to the schedule','ضيف للجدول')),name:['Add to the schedule','ضيف للجدول']},
   {op:'assert',en:'Activities created from the model (WBS 5)',ar:'اتعملت أنشطة من الموديل (WBS 5)',ok:()=>nrx()>=3,wait:5000},
   {op:'do',fn:()=>{ computeSched(); try{ p6Refresh(); }catch(e){} ctx.fin=ACT.filter(a=>a.src==='rx').slice(-1)[0]; }},
   {op:'assert',en:'Schedule computed: the last activity finishes after the start',ar:'اتحسب الجدول: آخر نشاط بينتهي بعد البداية',ok:()=>ctx.fin&&ctx.fin.fDate>ctx.fin.sDate},
   {op:'shot',name:'01_schedule'},
   {op:'run',cmd:'gantt_open',after:1200},
   {op:'assert',en:'Gantt pane is open',ar:'الجانت مفتوح',ok:()=>{ const l=WX.lay['pane:gantt']; return !!(l&&l.open); }},
   {op:'shot',name:'02_gantt'},
   {op:'say',en:'4D link: link the schedule window with the model window, so selecting an activity shows its work in 3D.',ar:'ربط 4D: نربط نافذة الجدول بنافذة الموديل، فاختيار نشاط يوري شغله في الـ3D.'},
   {op:'do',fn:()=>{ ctx.lk=TOXAPI.link('sched','model'); }},
   {op:'assert',en:'Schedule and model windows share a link colour',ar:'نافذتا الجدول والموديل ليهم نفس لون الربط',ok:()=>!!ctx.lk&&LK.col(LK.winId('sched')||'sched')===LK.col(LK.winId('model')||'model')},
   {op:'do',fn:()=>{ try{ wxClose('pane:gantt'); }catch(e){} }},
   card('The full WBS with all construction stages, resource loading, cost-loaded cash flow and S-curve, and the safety plan (HSE): the schedule here has only the model-based work types.','هيكل الأعمال الكامل بكل مراحل التنفيذ وتحميل الموارد والتدفق النقدي المحمّل بالتكلفة ومنحنى S وخطة السلامة: الجدول هنا فيه أنواع الشغل المبنية على الموديل بس.',['WBS template with stages, cash flow, S-curve, safety plan','قالب WBS بالمراحل وتدفق نقدي وS-curve وخطة سلامة'])
  ]});

 /* ---------------- phase 9: construction in stages ---------------- */
 S.add({id:'build',phase:'9',n:['Phase 9 · Construction in order, with hold points','المرحلة 9 · التنفيذ بالترتيب مع نقاط الإيقاف'],mode:'mixed',
  pre:async()=>{ await S.ensureProject(); },
  sum:['The 13 construction stages in their true order. Each stage has a hold point; the demo registers an inspection request for each one in the document register.','مراحل التنفيذ الـ١٣ بترتيبها الصح. كل مرحلة ليها نقطة إيقاف؛ والديمو بيسجل طلب فحص لكل واحدة في سجل المستندات.'],
  steps:[
   {op:'say',en:'Phase 9 follows the true order of site work. Before each stage is closed, an inspection request is raised and a hold point is signed. The register below keeps those records.',ar:'المرحلة 9 بتتبع الترتيب الحقيقي لشغل الموقع. قبل قفل كل مرحلة بيتفتح طلب فحص وبتتوقّع نقطة إيقاف. السجل ده بيحفظ السجلات دي.'},
   {op:'do',fn:()=>{ ctx.d0=TOX.docs().length; }},
   ...STAGES.flatMap(s=>[
     {op:'say',en:s.id+' '+s.en+'. '+s.hold,ar:s.id+' '+s.ar+'. نقطة الإيقاف: '+s.hold.replace(/^HOLD[^:]*:\s*/,''),hold:4200},
     {op:'do',fn:()=>{ TOX.addDoc({type:'IR',dir:'out',subject:'Inspection request '+s.id+': '+s.en,body:'Demo record. '+s.hold,from:'Contractor',to:'Consultant'}); }}]),
   {op:'assert',en:'13 inspection requests registered, one per construction stage',ar:'اتسجل ١٣ طلب فحص، واحد لكل مرحلة تنفيذ',ok:()=>TOX.docs().length-ctx.d0===13&&TOX.docs().filter(d=>/Inspection request 9\./.test(d.subject)).length>=13},
   card('Set-out sheet, excavation and shoring design, formwork and props checks, concrete cube and slump statistics, ITP (inspection and test plan) library, site logistics and temporary works: no tool yet.','ورقة التوقيع وتصميم الحفر والسند وفحص الشدات والعدّادات وإحصائيات المكعبات والهبوط ومكتبة خطة الفحص والاختبار والخدمات المؤقتة ولوجستيات الموقع: مفيش أداة لسه.',['ITP register, set-out sheet, cube/slump statistics, temporary works','سجل ITP وورقة توقيع وإحصائيات مكعبات وأعمال مؤقتة']),
   card('Workers, crews and equipment per stage are listed in the phase map; resource loading in P.X needs your own crews and rates.','العمال والطواقم والمعدات لكل مرحلة موجودة في خريطة المراحل؛ وتحميل الموارد في P.X محتاج طواقمك وأسعارك.',null,'field')
  ]});

 /* ---------------- phase 10: handover and outputs ---------------- */
 S.add({id:'handover',phase:'10',n:['Phase 10 · Handover: snags, as-built and close-out','المرحلة 10 · التسليم: الملاحظات والرسومات التنفيذية والإقفال'],mode:'mixed',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Register a snag as an issue on the 3D model and close the project documents.','سجّل ملاحظة كـ issue على الموديل 3D وقفّل مستندات المشروع.'],
  steps:[
   {op:'say',en:'Phase 10: testing and commissioning are done on site; then the snag list, the as-built drawings, the O&M manuals and the close-out. The model carries the issues.',ar:'المرحلة 10: الاختبارات والتشغيل التجريبي في الموقع؛ وبعدين قايمة الملاحظات والرسومات التنفيذية وكتيبات التشغيل والإقفال. والموديل شايل الـissues.'},
   card('Electrical and plumbing tests, commissioning for 24 to 72 hours, the occupancy certificate and utility connections are people and authority work.','اختبارات الكهرباء والسباكة والتشغيل التجريبي ٢٤ لـ٧٢ ساعة وشهادة الإشغال وتوصيل المرافق شغل ناس وجهات.',null,'field'),
   {op:'tab',type:'model'},
   {op:'do',fn:()=>{ ctx.i0=IS.list.length; const w=RV.els.find(e=>e.k==='wall'); if(w){ RV.sel=w.id; try{ rvBuild(); rvProps(); }catch(e){} } }},
   {op:'say',en:'A snag found at the walk-through: select a wall and press "New issue from selected element".',ar:'ملاحظة لقيناها في الجولة: اختار حيطة واضغط "مشكلة جديدة من العنصر المحدد".'},
   {op:'run',cmd:'is_new',after:1200},
   {op:'assert',en:'An issue was created on the selected element',ar:'اتعملت issue على العنصر المحدد',ok:()=>IS.list.length===ctx.i0+1},
   {op:'shot',name:'01_snag'},
   {op:'do',fn:()=>{ try{ wxClose('pane:issues'); }catch(e){} }},
   {op:'do',fn:()=>{ ctx.d1=TOX.docs().length; TOX.addDoc({type:'LTR',dir:'out',subject:'Handover letter: Project 6868',body:'Demo record: handover with the as-built package and O&M manuals.',from:'Contractor',to:'Owner'}); }},
   {op:'assert',en:'Handover letter registered',ar:'خطاب التسليم اتسجل',ok:()=>TOX.docs().length===ctx.d1+1},
   card('The handover rules check, as-built update of the model and the asset register run on the existing commands but need real project data, so the demo does not fake them.','فحص قواعد التسليم وتحديث الموديل as-built وسجل الأصول بيشتغلوا على أوامر موجودة لكن محتاجين بيانات مشروع حقيقية، فالديمو مبيزيفهمش.',null)
  ]});
 S.add({id:'out',phase:'10.5',n:['Outputs: sheets, package, vector export, render','المخرجات: اللوحات والحزمة والفكتور والريندر'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Build an Output Center package, export a vector view and render a still, all from the open project. Nothing is downloaded.','ابني حزمة مركز المخرجات، صدّر منظور فكتور، وارندر صورة ثابتة، من المشروع المفتوح. ومفيش حاجة بتتنزّل.'],
  steps:[
   {op:'tab',type:'model'},
   {op:'say',en:'The drawing sheet is composed from the project (title block, views, notes).',ar:'لوحة الرسم بتتكوّن من المشروع (إطار وأوجه وملاحظات).'},
   {op:'run',cmd:'sheet',after:1000,soft:1},
   {op:'say',en:'Output Center: pick numbered deliverables and build a versioned package: drawing sheet PDF, sheet SVG/PNG/DXF, 3D model files and the BOQ.',ar:'مركز المخرجات: اختار مخرجات مرقمة وابني حزمة بنسخة: اللوحة PDF وSVG/PNG/DXF وملفات الموديل 3D والمقايسة.'},
   {op:'run',cmd:'out_open',after:900},
   {op:'do',fn:async()=>{ ctx.v0=OUTC.versions.length; ctx.v=await outBuild([1,2,3,5],null); }},
   {op:'assert',en:'Package version built with files and no failed items',ar:'اتبنت نسخة الحزمة بملفاتها ومن غير مخرجات فاشلة',ok:()=>OUTC.versions.length===ctx.v0+1&&(v=>(Array.isArray(v.files)?v.files.length:+v.files)>0&&!(Array.isArray(v.fails)?v.fails.length:v.fails))(OUTC.versions[OUTC.versions.length-1]),wait:30000},
   {op:'tab',type:'model'},
   {op:'say',en:'Vector export of the current 3D view (SVG).',ar:'تصدير الفكتور للمنظور الحالي (SVG).'},
   {op:'do',fn:async()=>{ ctx.vx=await TOXAPI.vector({fmt:'svg',download:false,rs:false}); }},
   {op:'assert',en:'Vector file created',ar:'ملف الفكتور اتعمل',ok:()=>!!ctx.vx&&(ctx.vx.bytes>500||(ctx.vx.blob&&ctx.vx.blob.size>500)||(ctx.vx.svg&&ctx.vx.svg.length>500)||(typeof ctx.vx==='string'&&ctx.vx.length>500)||(ctx.vx.size>500))},
   {op:'say',en:'Render Studio: a draft-quality still of the current view.',ar:'استوديو الريندر: صورة ثابتة بجودة مسودة للمنظور الحالي.'},
   {op:'do',fn:async()=>{ ctx.rs=await TOX.render({kind:'still',preset:'draft'}); },timeout:180000},
   {op:'assert',en:'Rendered still created',ar:'الصورة المرندرة اتعملت',ok:()=>!!ctx.rs&&ctx.rs.ok!==false&&(ctx.rs.bytes>1000||(ctx.rs.blob&&ctx.rs.blob.size>1000))},
   {op:'shot',name:'01_after_render'},
   {op:'say',en:'End of the tour. The project stays open and usable. These outputs are demonstrations, not an approved design.',ar:'خلصت الجولة. المشروع فاضل مفتوح وتقدر تشتغل عليه. المخرجات دي للتوضيح مش تصميم معتمد.'}
  ]});
})();
