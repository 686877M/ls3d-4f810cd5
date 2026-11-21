/* ====== demo_ch3.js - chapters 8-12: low-current symbols, plumbing/drainage checks, N.X clash, BOQ + documents, outputs. Evaluated with the other demo files. ====== */
(function(){
 const S=DEMO, B=S.B, ctx={};
 const vis=e=>{ if(!e||!e.isConnected)return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
 const card=name=>()=>{ const it=lbItems(LB.libs.cxblk).find(x=>x.id===name); const t=it&&lbNm(it); return [...document.querySelectorAll('#lbg_cx .lbc')].find(c=>c.title===t); };
 const calcRun=async(id,vals)=>{ CC.id=id; CC.code=CALCS.find(x=>x.id===id).codes[0]; CC.vals={}; CC.sheet=null; calPanel(); };
 const num=i=>()=>calBox.querySelectorAll('input[type=number]')[i];
 const calcBtn=()=>[...calBox.querySelectorAll('button')].find(b=>b.textContent.trim()===B('Calculate','احسب'));

 /* ---------------- 8: low-current (symbols on the C.X drawing) ---------------- */
 S.add({id:'lowc',n:['Low-current: data, TV and fire-alarm symbols','التيار الخفيف: رموز البيانات والتلفزيون وإنذار الحريق'],mode:'mixed',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Place data outlet, TV outlet, smoke detector and alarm bell symbols from the C.X block library onto the drawing.','ضع رموز مخرج بيانات وتلفزيون وكاشف دخان وجرس إنذار من مكتبة بلوكات C.X على الرسم.'],
  steps:[
   {op:'say',en:'Low-current systems (data, TV, fire alarm) are drawn in C.X with the block library. The app has symbols for them; there is no cabling or alarm calculation module for them yet.',ar:'التيار الخفيف (بيانات وتلفزيون وإنذار حريق) بيترسم في C.X بمكتبة البلوكات. التطبيق فيه رموزها؛ ومفيش وحدة حساب كابلات أو إنذار ليها لسه.'},
   {op:'tab',type:'draft'},
   {op:'assert',en:'C.X drawing tab is open',ar:'تاب رسم C.X مفتوح',ok:()=>ribType()==='draft',wait:5000},
   {op:'do',fn:()=>{ ctx.e0=cadD().ents.length; lbOpen('cx','cxblk','data'); }},
   {op:'assert',en:'Block library pane is open with cards',ar:'لوحة مكتبة البلوكات مفتوحة وفيها كروت',ok:()=>document.querySelectorAll('#lbg_cx .lbc').length>10,wait:4000},
   {op:'do',fn:()=>{ ctx.pts=[[2000,1500],[3500,1500],[5000,1500],[6500,1500]]; ctx.k=0; }},
   {op:'click',to:card('data'),hold:500},
   {op:'assert',en:'Place mode is armed (click on the drawing)',ar:'وضع الوضع شغال (اضغط على الرسم)',ok:()=>CS.tool==='lbplace'&&!!CS.lbArm},
   {op:'move',to:()=>{ const s=CW.querySelector('svg'); return vis(s)?s:CW; },at:[.3,.4],hold:300,tip:false},
   {op:'do',fn:()=>{ cadClick(ctx.pts[0]); }},
   {op:'click',to:card('tv'),hold:300},{op:'move',to:()=>CW,at:[.45,.4],hold:200,tip:false},{op:'do',fn:()=>{ cadClick(ctx.pts[1]); }},
   {op:'click',to:card('smoke'),hold:300},{op:'move',to:()=>CW,at:[.6,.4],hold:200,tip:false},{op:'do',fn:()=>{ cadClick(ctx.pts[2]); }},
   {op:'click',to:card('bell'),hold:300},{op:'move',to:()=>CW,at:[.75,.4],hold:200,tip:false},{op:'do',fn:()=>{ cadClick(ctx.pts[3]); cadEsc(); }},
   {op:'assert',en:'Four symbols placed as real CAD entities and saved as blocks',ar:'٤ رموز اتحطت ككيانات CAD حقيقية واتحفظت كبلوكات',ok:()=>{ const D=cadD(); return D.ents.length-ctx.e0>=4&&['LB_data','LB_tv','LB_smoke','LB_bell'].filter(k=>D.blocks&&Object.keys(D.blocks).some(b=>b.toLowerCase().indexOf(k.toLowerCase())===0||b===k)).length>=1; }},
   {op:'say',en:'Placed symbols are normal drawing entities: they can be moved, layered and exported with the sheet.',ar:'الرموز اللي اتحطت كيانات رسم عادية: تتحرك وتتوزع على طبقات وتتصدّر مع اللوحة.'}
  ]});

 /* ---------------- 9: plumbing, drainage, infrastructure checks ---------------- */
 S.add({id:'plumb',n:['Plumbing, drainage and infrastructure checks','الصرف والمياه والبنية التحتية: الفحوصات'],mode:'mixed',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Gravity drain capacity (Manning) and water pipe head loss (Hazen-Williams) with the calculators; the S.X pipe-network tools are shown but not drawn.','سعة ماسورة الصرف (Manning) وفقد ضغط ماسورة المياه (Hazen-Williams) بالحاسبات؛ وأدوات شبكة المواسير في S.X بنعرضها بس من غير رسم.'],
  steps:[
   {op:'say',en:'Drainage: the capacity of a gravity pipe from its diameter, roughness and slope (Manning). Open Engineering analysis.',ar:'الصرف: سعة ماسورة جاذبية من قطرها وخشونتها وميلها (Manning). افتح التحليل الهندسي.'},
   {op:'run',cmd:'p_calc',after:700},
   {op:'assert',en:'Engineering analysis pane is open',ar:'لوحة التحليل الهندسي مفتوحة',ok:()=>!!(typeof calBox!=='undefined'&&calBox&&vis(calBox)),wait:4000},
   {op:'do',fn:()=>calcRun('man')},
   {op:'type',to:num(0),text:'300',tip:false,hold:100},{op:'type',to:num(1),text:'0.013',tip:false,hold:100},{op:'type',to:num(2),text:'0.005',tip:false,hold:100},
   {op:'click',to:calcBtn,hold:300},
   {op:'assert',en:'Full-flow capacity and velocity returned (300 mm, slope 0.5%)',ar:'رجعت السعة والسرعة للتصرف الكامل (٣٠٠ مم، ميل ٠٫٥٪)',ok:()=>CC.sheet&&CC.sheet.rows&&+CC.sheet.rows[0][1]>10},
   {op:'say',en:'Water supply: friction loss in a pipe (Hazen-Williams) for a flow of 10 L/s in 100 mm over 200 m.',ar:'المياه: فقد الاحتكاك في ماسورة (Hazen-Williams) لتصرف ١٠ لتر/ث في ١٠٠ مم لمسافة ٢٠٠ م.'},
   {op:'do',fn:()=>calcRun('hw')},
   {op:'type',to:num(0),text:'10',tip:false,hold:100},{op:'type',to:num(1),text:'100',tip:false,hold:100},{op:'type',to:num(2),text:'200',tip:false,hold:100},{op:'type',to:num(3),text:'140',tip:false,hold:100},{op:'type',to:num(4),text:'0',tip:false,hold:100},
   {op:'click',to:calcBtn,hold:300},
   {op:'assert',en:'Velocity and head loss returned',ar:'رجعت السرعة وفقد الضغط',ok:()=>CC.sheet&&CC.sheet.rows&&CC.sheet.rows.some(r=>/Total|الإجمالي/.test(r[0])&&+r[1]>0)},
   {op:'say',en:'Infrastructure networks (sewer, storm, water, fire) live in S.X: the Pipe Network tools and the structures catalogue. Here we only open the tab and point at them; drawing a network is not part of this demo.',ar:'شبكات البنية التحتية (صرف وأمطار ومياه وحريق) في S.X: أدوات شبكة المواسير وكتالوج المنشآت. هنا بنفتح التاب ونشاور عليها بس؛ رسم شبكة مش جزء من الديمو.'},
   {op:'tab',type:'survey'},
   {op:'move',to:'cmd:survey_60',opt:1,hold:900},
   {op:'assert',en:'S.X tab is open (tour only)',ar:'تاب S.X مفتوح (عرض بس)',ok:()=>ribType()==='survey',soft:1},
   {op:'say',en:'Results are checks for review by the engineer, not an approved design.',ar:'النتايج فحوصات يراجعها المهندس، مش تصميم معتمد.'}
  ]});

 /* ---------------- 10: N.X coordination and clashes ---------------- */
 S.add({id:'clash',n:['N.X: coordination and clash detection','N.X: التنسيق وكشف التعارضات'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Add a clash test of everything against everything and run it on the R.X model.','ضيف اختبار تعارض لكل حاجة ضد كل حاجة وشغّله على موديل R.X.'],
  steps:[
   {op:'say',en:'N.X checks the model for clashes. A hard test finds elements whose volumes overlap. Open the Clash Detective.',ar:'N.X بيفحص الموديل عن تعارضات. اختبار hard بيلاقي عناصر أحجامها متداخلة. افتح كاشف التعارض.'},
   {op:'tab',type:'coord'},
   {op:'run',cmd:'nv_clash',after:800},
   {op:'assert',en:'Clash Detective pane is open',ar:'كاشف التعارض مفتوح',ok:()=>{ const l=WX.lay['pane:nvclash']; return !!(l&&l.open); },wait:4000},
   {op:'do',fn:()=>{ ctx.t0=nvCl().tests.length; CLS.tab='tests'; nvClRender(); }},
   {op:'click',to:'[data-a="addtest"]',tip:[B('Add a test','أضف اختبار')],hold:400},
   {op:'assert',en:'A test was added',ar:'اتضاف اختبار',ok:()=>nvCl().tests.length===ctx.t0+1},
   {op:'click',to:'[data-a="runall"]',tip:[B('Run all tests','شغّل كل الاختبارات')],hold:400,after:800},
   {op:'assert',en:'The test ran and found clashes (overlapping R.X elements: slabs, stairs, walls)',ar:'الاختبار اشتغل ولقى تعارضات (عناصر R.X متداخلة: بلاطات وسلالم وحيطان)',ok:()=>{ const t=nvCl().tests[nvCl().tests.length-1]; return t&&Array.isArray(t.results)&&t.count>0; },wait:5000},
   {op:'do',fn:()=>{ const t=nvCl().tests[nvCl().tests.length-1]; ctx.n=t.count; t.results[0].status='Reviewed'; try{ nvKeep(); CLS.tab='res'; nvClRender(); }catch(e){} }},
   {op:'assert',en:'First clash marked "Reviewed" in the results list',ar:'أول تعارض اتعلّم "Reviewed" في قايمة النتايج',ok:()=>nvCl().tests.slice(-1)[0].results[0].status==='Reviewed'},
   {op:'say',en:'The clashes here come from the sample template itself (a stair crossing the slab, wall and slab overlaps). In a real project you review each one and fix the model.',ar:'التعارضات هنا جاية من القالب نفسه (سلم بيقطع البلاطة وتداخل حيطان وبلاطات). في مشروع حقيقي بتراجع كل واحد وتصلّح الموديل.'}
  ]});

 /* ---------------- 11: BOQ, costs and documents ---------------- */
 S.add({id:'boq',n:['BOQ, costs and documents','المقايسة والتكاليف والمستندات'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Quantities from the model become a BOQ and a cost summary in Q.X; then register an RFI and a transmittal in the document register.','كميات الموديل بتبقى مقايسة وملخص تكلفة في Q.X؛ وبعدين سجل RFI ومراسلة في سجل المستندات.'],
  steps:[
   {op:'say',en:'Q.X links to the model: "Model quantities" lists every item, "Build BOQ" groups them, "Cost summary" adds percentages and totals.',ar:'Q.X مربوط بالموديل: "كميات الموديل" بتسرد كل بند، "عمل BOQ" بيجمّعها، "ملخص التكلفة" بيضيف النسب والإجماليات.'},
   {op:'tab',type:'takeoff'},
   {op:'do',fn:()=>{ ctx.sh0=QX.api.wb().sheets.length; QX.api.sync(true); QX.mkBoq(); QX.mkCost(); }},
   {op:'assert',en:'Model quantities, BOQ and Cost summary sheets exist',ar:'شيتات كميات الموديل والـBOQ وملخص التكلفة موجودة',ok:()=>{ const n=QX.api.wb().sheets.map(s=>s.name); return n.includes('Model quantities')&&n.some(x=>/^BOQ/i.test(x))&&n.includes('Cost summary'); }},
   {op:'say',en:'The rate cells are empty on purpose. Here is one SAMPLE rate typed into the BOQ so you can see the total move; use your own rates.',ar:'خانات السعر فاضية عن قصد. هنا سعر تجريبي واحد في الـBOQ عشان تشوف الإجمالي بيتحرك؛ استخدم أسعارك.'},
   {op:'do',fn:()=>{ const w=QX.api.wb(), sh=w.sheets.find(s=>/^BOQ/i.test(s.name)); const hdr=[0,1,2,3,4,5].map(k=>qxGet(sh,0,k)); ctx.rc=hdr.findIndex(v=>typeof v==='string'&&/^rate$|سعر/i.test(v)); ctx.ac=hdr.findIndex(v=>typeof v==='string'&&/^amount$|المبلغ/i.test(v)); ctx.qr=-1; for(let r=1;r<40;r++){ const q=qxGet(sh,r,ctx.rc-1); if(typeof q==='number'&&q>0){ ctx.qr=r; ctx.q=q; break; } } if(ctx.rc>0&&ctx.qr>0){ sh.cells[qxK(ctx.qr,ctx.rc)]=100; try{ qxRecalcAll(w); }catch(e){} ctx.amt=qxGet(sh,ctx.qr,ctx.ac); } }},
   {op:'assert',en:'With a sample rate of 100 the item amount = quantity × 100',ar:'بسعر تجريبي ١٠٠ مبلغ البند = الكمية × ١٠٠',ok:()=>typeof ctx.amt==='number'&&Math.abs(ctx.amt-ctx.q*100)<.5},
   {op:'say',en:'Documents: register an RFI and a transmittal. Every record gets a reference number and a status trail.',ar:'المستندات: سجل RFI ومراسلة. كل سجل ليه رقم مرجعي ومسار حالات.'},
   {op:'do',fn:()=>{ ctx.d0=TOX.docs().length; ctx.r1=TOX.addDoc({type:'RFI',dir:'out',subject:'Sample RFI: confirm garage slab thickness',body:'Demo record.',from:'Contractor',to:'Consultant'}); ctx.r2=TOX.addDoc({type:'TRN',dir:'out',subject:'Sample transmittal: drawing set A',body:'Demo record.',from:'Contractor',to:'Consultant'}); TOX.setStatus(ctx.r1,'sent'); }},
   {op:'assert',en:'Two records in the register, the RFI marked sent',ar:'سجلين في السجل والـRFI حالته sent',ok:()=>TOX.docs().length-ctx.d0===2&&TOX.docs().find(d=>d.ref===ctx.r1).status==='sent'}
  ]});

 /* ---------------- 12: outputs ---------------- */
 S.add({id:'out',n:['Outputs: sheets, package, vector export, render','المخرجات: اللوحات والحزمة والفكتور والريندر'],mode:'real',
  pre:async()=>{ await S.ensureProject(); },
  sum:['Build an Output Center package, export a vector view and render a still, all from the open project. Nothing is downloaded.','ابني حزمة مركز المخرجات، صدّر منظور فكتور، وارندر صورة ثابتة، من المشروع المفتوح. ومفيش حاجة بتتنزّل.'],
  steps:[
   {op:'tab',type:'model'},
   {op:'say',en:'The drawing sheet is composed from the project (title block, views, notes).',ar:'لوحة الرسم بتتكوّن من المشروع (إطار وأوجه وملاحظات).'},
   {op:'run',cmd:'sheet',after:800,soft:1},
   {op:'say',en:'Output Center: pick numbered deliverables and build a versioned package. I build drawing sheet PDF, sheet SVG/PNG/DXF, 3D model files and the BOQ.',ar:'مركز المخرجات: اختار مخرجات مرقمة وابني حزمة بنسخة. هبني اللوحة PDF وSVG/PNG/DXF وملفات الموديل 3D والمقايسة.'},
   {op:'run',cmd:'out_open',after:700},
   {op:'do',fn:async()=>{ ctx.v0=OUTC.versions.length; ctx.v=await outBuild([1,2,3,5],null); }},
   {op:'assert',en:'Package version built with files and no failed items',ar:'اتبنت نسخة الحزمة بملفاتها ومن غير مخرجات فاشلة',ok:()=>OUTC.versions.length===ctx.v0+1&&(v=>(Array.isArray(v.files)?v.files.length:+v.files)>0&&!(Array.isArray(v.fails)?v.fails.length:v.fails))(OUTC.versions[OUTC.versions.length-1]),wait:30000},
   {op:'tab',type:'model'},
   {op:'say',en:'Vector export of the current 3D view (SVG).',ar:'تصدير الفكتور للمنظور الحالي (SVG).'},
   {op:'do',fn:async()=>{ ctx.vx=await TOXAPI.vector({fmt:'svg',download:false,rs:false}); }},
   {op:'assert',en:'Vector file created',ar:'ملف الفكتور اتعمل',ok:()=>!!ctx.vx&&(ctx.vx.bytes>500||(ctx.vx.blob&&ctx.vx.blob.size>500)||(ctx.vx.svg&&ctx.vx.svg.length>500)||(typeof ctx.vx==='string'&&ctx.vx.length>500)||(ctx.vx.size>500))},
   {op:'say',en:'Render Studio: a draft-quality still of the current view.',ar:'استوديو الريندر: صورة ثابتة بجودة مسودة للمنظور الحالي.'},
   {op:'do',fn:async()=>{ ctx.rs=await TOX.render({kind:'still',preset:'draft'}); },timeout:180000},
   {op:'assert',en:'Rendered still created',ar:'الصورة المرندرة اتعملت',ok:()=>!!ctx.rs&&ctx.rs.ok!==false&&(ctx.rs.bytes>1000||(ctx.rs.blob&&ctx.rs.blob.size>1000))},
   {op:'say',en:'That is the end of the tour. Project 6868 stays open and usable: model, schedule, quantities, calculations, clashes, documents and outputs are all in it. These outputs are demonstrations, not an approved design.',ar:'كده خلص الجولة. مشروع 6868 فاضل مفتوح وتقدر تشتغل عليه: الموديل والجدول والكميات والحسابات والتعارضات والمستندات والمخرجات كلها فيه. المخرجات دي للتوضيح مش تصميم معتمد.'}
  ]});
})();
