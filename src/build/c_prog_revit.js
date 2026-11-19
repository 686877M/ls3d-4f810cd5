/* Revit ribbon (R.X). Wired: views, zoom/orbit, sections, schedules/BOQ, sheets, render, rebar, coordination, loads, site, project info, export. Everything else is listed and marked not built. */
progReg('model',[
['arch','Architecture','العمارة',[
 ['Build','البناء',['Wall|جدار|wall|rv_wall','Door|باب|door|rv_door','Window|شباك|window|rv_window','Component|مكوّن|block|p_fam','Column|عمود|column|rv_col','Roof|سقف|roof|rv_roof','Ceiling|سقف معلق|ceiling|rv_ceil','Floor|بلاطة|floor|rv_floor','Curtain System|نظام ستارة|curtain','Curtain Grid|شبكة ستارة|grid','Mullion|مليون|line']],
 ['Circulation','الحركة',['Railing|درابزين|railing|rv_rail','Ramp|منحدر|ramp|rv_ramp','Stair|سلم|stair|rv_stair']],
 ['Model','النموذج',['Model Text|نص نموذج|text|rv_mtext','Model Line|خط نموذج|line|rv_mline','Model Group|مجموعة نموذج|block','Parts|الأجزاء|parts|p_parts']],
 ['Room & Area','الغرف والمساحات',['Room|غرفة|layout|rv_room','Room Separator|فاصل غرف|line','Tag Room|وسم غرفة|tag','Area|مساحة|layout','Area Boundary|حد مساحة|line','Tag Area|وسم مساحة|tag']],
 ['Opening','الفتحات',['By Face|بالوجه|block','Shaft|مشق|block','Wall|جدار|wall','Vertical|رأسي|block','Dormer|دورمر|roof']],
 ['Datum','المراجع',['Level|منسوب|level|rv_level','Grid|شبكة|grid|rv_grid','Show levels|إظهار المناسيب|level|t_levels']],
 ['Work Plane','مستوى العمل',['Set|تعيين|layout','Show|إظهار|eye','Ref Plane|مستوى مرجعي|cons','Viewer|عارض|eye']]]],
['struct','Structure','الإنشائي',[
 ['Structure','الإنشاء',['Beam|كمرة|beam|rv_beam','Brace|رباط|line','Column|عمود|column|rv_col','Floor|بلاطة|floor|rv_floor','Truss|جمالون|poly','Beam System|نظام كمرات|beam']],
 ['Foundation','الأساسات',['Isolated|منفصلة|block|rv_found','Wall|حائط|wall|rv_wall','Slab|لبشة|floor|rv_fslab']],
 ['Reinforcement','التسليح',['Rebar|حديد تسليح|rebar|p_rebar','Area|مساحة|hatch','Path|مسار|line','Fabric Sheet|شبك لحام|grid','Cover|غطاء خرساني|layer','Rebar Couplers|وصلات حديد|link']],
 ['Analytical Model','النموذج التحليلي',['Check|فحص|safety|p_calc','Loads|الأحمال|gear|p_calc','Boundary Conditions|ظروف الحدود|point','Load Combinations|توليفات الأحمال|table']]]],
['steel','Steel','الحديد',[
 ['Connection','الوصلات',['Connection|وصلة|link','Plate|صفيحة|rect','Bolt|مسمار|point','Anchor|أنكر|point','Weld|لحام|line']],
 ['Fabrication','التصنيع',['Cut|قطع|trim','Cope|تفريز|trim','Shorten|تقصير|trim']]]],
['sys','Systems','الأنظمة',[
 ['HVAC','التكييف',['Mechanical Equipment|معدات ميكانيكية|duct','Air Terminal|مخارج هواء|duct','Duct|مجرى|duct','Duct Fitting|وصلة مجرى|duct','Duct Accessory|ملحق مجرى|duct','Flex Duct|مجرى مرن|duct','Duct Placeholder|مجرى مبدئي|duct','Heating and Cooling Loads|أحمال التبريد والتسخين|gear|=()=>wtNew("hv")']],
 ['Electrical','الكهرباء',['Electrical Equipment|معدات كهربائية|panel','Device|جهاز|panel','Lighting Fixture|وحدة إنارة|light','Cable Tray|ممر كابلات|cable','Conduit|ماسورة كهرباء|cable','Wire|سلك|cable']],
 ['Plumbing & Piping','السباكة والمواسير',['Pipe|ماسورة|pipe','Pipe Fitting|وصلة ماسورة|pipe','Plumbing Fixture|وحدة سباكة|pipe','Sprinkler|رشاش|pipe','Pipe Accessory|ملحق ماسورة|pipe','Pipe Placeholder|ماسورة مبدئية|pipe','Colour by system|تلوين حسب النظام|pipe|plant_sys']],
 ['Mechanical','ميكانيكا',['Mechanical Settings|إعدادات ميكانيكية|gear','Pipe Sizing|مقاسات المواسير|gear','Duct Sizing|مقاسات المجاري|duct|=()=>wtNew("hv")']]]],
['ins','Insert','إدراج',[
 ['Link','ربط',['Link Revit|ربط Revit|link','Link IFC|ربط IFC|link','Link CAD|ربط CAD|link|open','Link Topography|ربط طبوغرافيا|terrain|p_survey','Decal|ملصق|rect','Point Cloud|سحابة نقاط|point','Coordination Model|نموذج تنسيق|link|p_coord']],
 ['Import','استيراد',['Import CAD|استيراد CAD|impt|open','Import gbXML|استيراد gbXML|impt','Image|صورة|rect','Import PDF|استيراد PDF|impt']],
 ['Load from Library','تحميل من المكتبة',['Load Family|تحميل عائلة|block|p_fam','Load as Group|تحميل كمجموعة|block','Insert Views from File|إدراج مناظير من ملف|impt']]]],
['ann','Annotate','التوضيح',[
 ['Dimension','الأبعاد',['Aligned|محاذٍ|dim|rv_dim','Linear|خطي|dim|m_dist','Angular|زاوي|dim|m_ang','Radial|نصف قطر|dim|m_circ','Diameter|قطر|dim','Arc Length|طول قوس|dim','Spot Elevation|منسوب نقطة|level|m_lvl','Spot Coordinate|إحداثي نقطة|point','Spot Slope|ميل نقطة|line']],
 ['Detail','التفاصيل',['Detail Line|خط تفصيل|line','Region|منطقة|hatch','Component|مكوّن|block','Revision Cloud|سحابة مراجعة|poly','Insulation|عزل|poly','Repeating Detail|تفصيل متكرر|array']],
 ['Text','النص',['Text|نص|text|note','Check Spelling|فحص إملاء|text','Find/Replace|بحث واستبدال|text']],
 ['Tag','الوسوم',['Tag by Category|وسم بالفئة|tag','Tag All|وسم الكل|tag','Beam Annotations|توضيحات كمرات|tag','Material Tag|وسم خامة|tag','Keynote|ملاحظة مفتاحية|tag']],
 ['Symbol','الرموز',['Symbol|رمز|block','Stair Path|مسار سلم|line','Span Direction|اتجاه البحر|line']]]],
['anl','Analyze','التحليل',[
 ['Energy Analysis','تحليل الطاقة',['Heating and Cooling Loads|أحمال التبريد والتسخين|gear|=()=>wtNew("hv")','Energy Optimization|تحسين الطاقة|gear|env_en','Space|حيز|layout','Zone|منطقة|layout']],
 ['Reports & Schedules','التقارير والجداول',['Quantities and cost|الكميات والتكلفة|table|p_bom','Pressure Loss Report|تقرير فقد الضغط|table|=()=>wtNew("hv")','Panel Schedules|جداول لوحات|table']],
 ['Check Systems','فحص الأنظمة',['Check Duct Systems|فحص المجاري|safety','Check Pipe Systems|فحص المواسير|safety','Check Circuits|فحص الدوائر|safety','Interference Check|فحص التداخل|clash|clash']],
 ['Review','المراجعة',['Structural review|مراجعة إنشائية|safety|wf_struct','MEP review|مراجعة MEP|safety|wf_mep','Quality review|مراجعة الجودة|safety|wf_qa','Handover|التسليم|safety|wf_hand']]]],
['mass','Massing & Site','الكتل والموقع',[
 ['Conceptual Mass','الكتل التصورية',['Show Mass|إظهار الكتلة|eye','In-Place Mass|كتلة في المكان|block','Place Mass|وضع كتلة|block']],
 ['Model Site','نموذج الموقع',['Toposurface|سطح طبوغرافي|terrain|p_survey','Site Component|مكوّن موقع|block','Parking Component|مكوّن موقف|block','Building Pad|منصة مبنى|floor','Site plan in 3D|الموقع في 3D|terrain|site']],
 ['Modify Site','تعديل الموقع',['Split Surface|تقسيم السطح|trim','Merge Surface|دمج السطح|link','Subregion|منطقة فرعية|hatch','Property Line|حد الملكية|parcel','Graded Region|منطقة تسوية|terrain']]]],
['col','Collaborate','التعاون',[
 ['Manage Collaboration','إدارة التعاون',['Collaborate|تعاون|link|p_team','Worksets|مجموعات العمل|layer','Live session|جلسة مباشرة|link|tm_live']],
 ['Synchronize','المزامنة',['Versions and roll-back|النسخ والرجوع|save|tm_vers','Activity log|سجل النشاط|table|tm_log']],
 ['Coordinate','التنسيق',['Copy/Monitor|نسخ/مراقبة|link','Coordination Review|مراجعة التنسيق|clash|p_coord','Interference Check|فحص التداخل|clash|clash','Reconcile Hosting|تسوية الاستضافة|link']],
 ['Communicate','التواصل',['Share|مشاركة|link|p_share','Search everywhere|بحث شامل|eye|tm_find']]]],
['view','View','عرض',[
 ['Graphics','الرسوميات',['Visibility/Graphics|رؤية/رسوميات|eye|p_views','View Templates|قوالب العرض|layer','Filters|فلاتر|layer','Thin Lines|خطوط رفيعة|line','Show Hidden Lines|إظهار الخطوط المخفية|eye','Ghost concrete|خرسانة شفافة|eye|t_ghost','Water|المية|eye|t_water','Levels|المناسيب|level|t_levels','Ground|الأرض|terrain|t_ground']],
 ['Visual style','نمط العرض',['Shaded|مظلل|iso|d_shaded','Wireframe|إطار سلكي|iso|d_wire','X-ray|أشعة|iso|d_xray']],
 ['Presentation','العرض التقديمي',['Render|ريندر|camera|render','Screenshot|لقطة شاشة|camera|shot','Record video|تسجيل فيديو|record|rec']],
 ['Create','إنشاء',['3D View|منظور 3D|view3d|v_iso','Section|قطاع|section|sA','Callout|وسيلة إيضاح|rect','Plan Views|مساقط|plan|v_plan','Elevation|واجهة|side|v_side','Drafting View|منظر رسم|cad|cad','Duplicate View|نسخ منظر|copy','Legends|مفاتيح|table','Schedules|جداول|table|rv_sched','BOQ and cost|الكميات والتكلفة|table|p_bom','Scope Box|صندوق نطاق|rect']],
 ['Sheet Composition','تكوين اللوحات',['Sheet|لوحة|sheet|sheet','Title Block|بلوك عنوان|rect','Revisions|مراجعات|table','Guide Grid|شبكة إرشاد|grid']],
 ['Navigate','التنقل',['Orbit|تدوير|rot|n_orbit','Pan|إزاحة|move|n_pan','Walk|مشي|move|n_walk','Zoom all|تكبير الكل|zfit|zfit','Zoom in|تكبير|zin|zin','Zoom out|تصغير|zout|zout','Zoom selected|تكبير المحدد|zoomsel|zsel','Perspective|منظور|iso|n_persp','Orthographic|متعامد|iso|n_ortho']],
 ['Windows','النوافذ',['Tile|تجانب|tile|w_tile','Cascade|تتالي|cascade|w_casc','Reset layout|إعادة الترتيب|layout|w_reset','Hide / show top bars|إخفاء/إظهار الأشرطة|layout|ui_bars']]]],
['mgr','Manage','إدارة',[
 ['Settings','الإعدادات',['Materials|الخامات|layer','Object Styles|أنماط الكائنات|layer','Snaps|المغانط|point','Project Information|معلومات المشروع|info|setup','Project Parameters|معاملات المشروع|table|p_edit','Global Parameters|معاملات عامة|table','Shared Parameters|معاملات مشتركة|table','Transfer Project Standards|نقل معايير|link','Purge Unused|حذف غير المستخدم|erase','Project Units|وحدات المشروع|gear','Structural Settings|إعدادات إنشائية|gear','MEP Settings|إعدادات MEP|gear']],
 ['Manage Project','إدارة المشروع',['Manage Links|إدارة الروابط|link','Manage Images|إدارة الصور|rect','Starting View|منظر البدء|view3d','Phasing|المراحل|sched|p_sched','Design Options|خيارات التصميم|layer','Saved projects|المشاريع المحفوظة|projects|projects']],
 ['Inquiry','استعلام',['Warnings|تحذيرات|safety|clash','Select by ID|تحديد بالرقم|point','Review Warnings|مراجعة التحذيرات|safety|p_safety']],
 ['Control','المتابعة',['Pulse and handover|النبض والتسليم|bell|ct_pulse','Project cycle|دورة المشروع|sched|ct_life','Calendar|التقويم|cal|ct_cal']]]],
['addin','Add-Ins','إضافات',[
 ['External Tools','أدوات خارجية',['Agent hub|مركز الوكلاء|link|p_hub','Telegram bot|بوت تيليجرام|link|ct_tg']],
 ['Dynamo','ديناميو',['Dynamo|ديناميو|gear','Dynamo Player|مشغّل ديناميو|play']]]],
['mod','Modify','تعديل',[
 ['Properties','الخصائص',['Properties|خصائص|edit|rv_props','Project Browser|متصفح المشروع|layout|rv_browser','Station parameters|معاملات المحطة|edit|p_edit','Families|العائلات|block|p_fam','Parameters|المعاملات|table|p_edit']],
 ['Clipboard','الحافظة',['Paste|لصق|copy','Cut|قص|trim','Copy|نسخ|copy','Match Type|مطابقة النوع|link']],
 ['Geometry','الهندسة',['Cope|تفريز|trim','Cut|قطع|trim','Join|ربط|link']],
 ['Modify','تعديل',['Align|محاذاة|move','Offset|إزاحة|offset','Mirror|مرآة|mirror','Move|نقل|move','Copy|نسخ|copy','Rotate|تدوير|rot','Trim/Extend|قص/مد|trim','Split|تقسيم|trim','Array|مصفوفة|array','Scale|مقياس|scale','Pin|تثبيت|point','Delete|حذف|erase|rv_del','Undo model tools|تراجع أدوات النموذج|undo|rv_undo','Remove all cuts and measures|إزالة القطاعات والقياسات|erase|rm_all']],
 ['Measure','القياس',['Distance|مسافة|mDist|m_dist','Between|بين|mBetween|m_btw','Angle|زاوية|mAngle|m_ang','Circle / hole|دائرة / فتحة|mCircle|m_circ','Level|منسوب|mLevel|m_lvl','Object|كائن|mObj|m_obj']]]],
['out','Output','الإخراج',[
 ['Drawings','الرسومات',['Sheet|لوحة|sheet|sheet','PDF|PDF|pdf|e_pdf','SVG|SVG|dxf|e_svg','DXF|DXF|dxf|e_dxf']],
 ['3D models','نماذج 3D',['DXF 3D|DXF 3D|dxf|e_dxf3','IFC|IFC|ifc|e_ifc','OBJ|OBJ|obj|e_obj']],
 ['Quantities','الكميات',['BOQ XLSX|حصر XLSX|xlsx|e_boq','BOQ CSV|حصر CSV|csv|e_csv']],
 ['Package','الحزمة',['Project package ZIP|حزمة المشروع|export|pack']]]]
],'arch');
