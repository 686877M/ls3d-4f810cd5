/* Plant 3D (T.X), Primavera P6 (P.X) and Navisworks (N.X) shells. Same rule: wired where T.O X already does the job, dimmed where not built. */
progReg('plant',[
['home','Home','الرئيسية',[
 ['Project','المشروع',['Project Manager|مدير المشروع|projects|projects','Project Setup|إعداد المشروع|gear|setup','Data Manager|مدير البيانات|table|p_bom','Spec Viewer|عارض المواصفات|table','P&ID Line List|قائمة خطوط P&ID|table']],
 ['Part Insertion','إدراج الأجزاء',['Route Pipe|مسار ماسورة|pipe','Pipe Fitting|وصلة|pipe','Valve|محبس|valve','Custom Part|جزء خاص|block','Insulation|عزل|layer','Parts list|قائمة الأجزاء|parts|p_parts']],
 ['Equipment','المعدات',['Create Equipment|إنشاء معدة|block','Modify Equipment|تعديل معدة|edit|p_edit','Attach Equipment|ربط معدة|link','Nozzle|فوهة|pipe','Families|العائلات|block|p_fam']],
 ['Pipe Supports','ركائز المواسير',['Create Support|إنشاء ركيزة|column','Convert Support|تحويل ركيزة|link']],
 ['Compare','المقارنة',['Colour by system|تلوين حسب النظام|layer|plant_sys','X-ray|أشعة|iso|d_xray','Ghost concrete|خرسانة شفافة|eye|t_ghost','Hide overlays|إخفاء الإضافات|hide|hideov']],
 ['Ortho Views','مساقط أورثو',['Create Ortho View|إنشاء مسقط أورثو|plan|v_plan','Section|قطاع|section|v_secA','Side|جانبي|side|v_side','Adjacent View|منظر مجاور|plan']],
 ['Visibility','الرؤية',['Hide Selected|إخفاء المحدد|hide','Hide Others|إخفاء الباقي|hide','Show All|إظهار الكل|eye']]]],
['isos','Isos','الأيزو',[
 ['Iso Creation','إنشاء الأيزو',['Production Iso|أيزو إنتاج|sheet|plant_sheet','Quick Iso|أيزو سريع|sheet|plant_sheet','Iso view|منظر أيزو|iso|v_iso']],
 ['Iso Annotations','توضيحات الأيزو',['Iso Message|رسالة أيزو|text','Start Point|نقطة بداية|point','Break Point|نقطة كسر|point','Flow Arrow|سهم سريان|line','Insulation Symbol|رمز عزل|layer']],
 ['Export','تصدير',['PCF Export|تصدير PCF|export','Sheet PDF|لوحة PDF|pdf|e_pdf','DXF|DXF|dxf|e_dxf']]]],
['struct','Structure','الهيكل',[
 ['Parts','الأجزاء',['Grid|شبكة|grid','Member|عنصر|beam','Railing|درابزين|railing','Stairs|سلم|stair','Ladder|سلم بحاري|stair','Plate|صفيحة|rect','Footing|قاعدة|floor']],
 ['Cutting','القطع',['Cut Member|قطع عنصر|trim','Miter|شطف|trim','Trim|قص|trim','Extend|مد|trim']],
 ['Review','المراجعة',['Structural review|مراجعة إنشائية|safety|wf_struct','Rebar|التسليح|rebar|p_rebar']]]],
['analysis','Analysis','التحليل',[
 ['Check','الفحص',['Clashes|التعارضات|clash|clash','Coordination|المطابقات|clash|p_coord','MEP review|مراجعة MEP|safety|wf_mep','Safety|السلامة|safety|p_safety']],
 ['Calculations','الحسابات',['Pump and pipe calcs|حسابات مضخات ومواسير|gear|env_qc','Engineering analysis|التحليل الهندسي|gear|p_calc','HVAC|تكييف|duct|=()=>wtNew("hv")']]]],
['view','View','عرض',[
 ['Navigate','التنقل',['Orbit|تدوير|rot|n_orbit','Pan|إزاحة|move|n_pan','Walk|مشي|move|n_walk','Zoom all|تكبير الكل|zfit|zfit','Zoom selected|تكبير المحدد|zoomsel|zsel']],
 ['Visual Styles','أنماط العرض',['Shaded|مظلل|iso|d_shaded','Wireframe|إطار سلكي|iso|d_wire','X-ray|أشعة|iso|d_xray','Perspective|منظور|iso|n_persp','Orthographic|متعامد|iso|n_ortho']],
 ['Windows','النوافذ',['Tile|تجانب|tile|w_tile','Cascade|تتالي|cascade|w_casc','Reset layout|إعادة الترتيب|layout|w_reset']]]],
['output','Output','الإخراج',[
 ['Sheets','اللوحات',['Iso sheet A1|لوحة أيزو A1|sheet|plant_sheet','Drawing sheet|لوحة الرسم|sheet|sheet','Render|ريندر|camera|render','Screenshot|لقطة|camera|shot']],
 ['Export','تصدير',['IFC|IFC|ifc|e_ifc','DXF 3D|DXF 3D|dxf|e_dxf3','OBJ|OBJ|obj|e_obj','BOQ XLSX|حصر XLSX|xlsx|e_boq','Navisworks NWC|NWC|export']],
 ['Package','الحزمة',['Project package ZIP|حزمة المشروع|export|pack','Share|مشاركة|link|p_share']]]]
],'home');
progReg('sched',[
['file','File','ملف',[
 ['Project','المشروع',['New|جديد|new|new','Open|فتح|open|open','Save|حفظ|save|save','Projects|المشاريع|projects|projects','Page Setup|إعداد الصفحة|gear','Print|طباعة|sheet|sheet']],
 ['Import / Export','استيراد / تصدير',['Export XER|تصدير XER|xer|xer','Export MS Project XML|تصدير XML|xml|xml','Export XLSX|تصدير XLSX|xlsx|xlsxs','Export CSV|تصدير CSV|csv|csvs','Import XER|استيراد XER|impt','Import XLSX|استيراد XLSX|impt']]]],
['edit','Edit','تحرير',[
 ['Edit','تحرير',['Undo|تراجع|undo|undo','Redo|إعادة|redo|redo','Cut|قص|trim','Copy|نسخ|copy','Paste|لصق|copy','Add|إضافة|new','Delete|حذف|erase','Dissolve|حلّ نشاط|trim','Renumber Activity IDs|إعادة ترقيم|text']],
 ['Assign','تعيين',['Resources|موارد|parts','Roles|أدوار|parts','Activity Codes|أكواد الأنشطة|tag','Predecessors|سابقة|link','Successors|لاحقة|link','Steps|خطوات|table']],
 ['Find','بحث',['Find|بحث|eye|tm_find','Replace|استبدال|text','Spell Check|فحص إملاء|text']]]],
['view','View','عرض',[
 ['Layout','التخطيط',['Activities (Gantt)|الأنشطة (جانت)|p6|p6','Timeline dock|شريط الزمن|sched|p_tl','4D schedule|جدول 4D|sim4d|p_sched','Activity Network|شبكة الأنشطة|link','Activity Usage Spreadsheet|جدول الاستخدام|table','Resource Usage Profile|منحنى الموارد|table']],
 ['Show','إظهار',['Columns|أعمدة|table','Bars|أشرطة|sched','Timescale|مقياس الزمن|cal','Filters|فلاتر|layer','Group and Sort|تجميع وفرز|layer','Bottom Layout|التخطيط السفلي|layout','Progress Line|خط التقدم|line']],
 ['Zoom','تكبير',['Zoom In|تكبير|zin|zin','Zoom Out|تصغير|zout|zout','Zoom to Best Fit|ملاءمة|zfit|zfit']]]],
['project','Project','المشروع',[
 ['Structure','الهيكل',['WBS|هيكل تجزئة العمل|layout','Activities|الأنشطة|p6|p6','Resource Assignments|تعيينات الموارد|parts','Work Products and Documents|المستندات|sheet|dc_reg','Expenses|مصروفات|boq|p_bom','Thresholds|حدود|bell','Issues|مشاكل|safety|ct_pulse','Risks|مخاطر|safety|p_scen']],
 ['Baselines','خطوط الأساس',['Maintain Baselines|إدارة خطوط الأساس|base|tm_vers','Assign Baselines|تعيين خط الأساس|base']],
 ['Settings','الإعدادات',['Set Default Project|المشروع الافتراضي|gear','Project details|تفاصيل المشروع|info|setup','Calendar|التقويم|cal|ct_cal']]]],
['enterprise','Enterprise','المؤسسة',[
 ['Data','البيانات',['Projects|المشاريع|projects|projects','EPS|هيكل المشاريع|layout','OBS|هيكل المسؤولية|layout','Resources|الموارد|parts','Roles|الأدوار|parts','Calendars|التقاويم|cal|ct_cal','Cost Accounts|حسابات التكلفة|boq','Activity Codes|أكواد الأنشطة|tag','Project Codes|أكواد المشاريع|tag','User Defined Fields|حقول المستخدم|table']]]],
['tools','Tools','أدوات',[
 ['Schedule','الجدولة',['Schedule (F9)|جدولة (F9)|sched|p6','Level Resources|تسوية الموارد|parts','Apply Actuals|تطبيق الفعلي|sched','Update Progress|تحديث التقدم|sched|ct_rep','Recalculate Assignment Costs|إعادة حساب التكاليف|boq','Summarize|تلخيص|table','Store Period Performance|حفظ أداء الفترة|save']],
 ['Analysis','التحليل',['Scenarios and risk|السيناريوهات والمخاطر|safety|p_scen','Claim Digger|مقارنة النسخ|link|tm_vers','Check Schedule|فحص الجدول|safety|p_bim','Global Change|تغيير شامل|gear','Follow-up reports|تقارير المتابعة|table|ct_rep']],
 ['Reports','التقارير',['Reports|تقارير|table|ct_rep','Report Wizard|معالج التقارير|table|o_report','Tracking|تتبع|sched|ct_pulse','Publish|نشر|link|p_share','Video of the 4D schedule|فيديو الجدول 4D|record|recsch']]]],
['admin','Admin','الإدارة',[
 ['Admin','الإدارة',['Users|المستخدمون|parts|p_team','Security Profiles|ملفات الأمان|safety','Admin Preferences|تفضيلات الإدارة|gear','Admin Categories|فئات الإدارة|table','Currencies|العملات|boq','Financial Periods|الفترات المالية|cal']]]]
],'view');
progReg('coord',[
['home','Home','الرئيسية',[
 ['Project','المشروع',['Append|إلحاق|impt|open','Refresh|تحديث|rot','Reset All|إعادة ضبط الكل|rot|w_reset','File Options|خيارات الملف|gear|setup']],
 ['Select & Search','تحديد وبحث',['Select|تحديد|point','Select All|تحديد الكل|rect','Select Same|تحديد المماثل|copy','Selection Tree|شجرة التحديد|layout|p_parts','Find Items|بحث عن عناصر|eye|tm_find','Sets|مجموعات|layer']],
 ['Visibility','الرؤية',['Hide|إخفاء|hide','Require|مطلوب|eye','Hide Unselected|إخفاء غير المحدد|hide','Unhide All|إظهار الكل|eye','Hide overlays|إخفاء الإضافات|hide|hideov']],
 ['Display','العرض',['Links|روابط|link','Quick Properties|خصائص سريعة|edit','Properties|الخصائص|edit|p_edit']],
 ['Tools','الأدوات',['Clash Detective|كاشف التعارض|clash|clash','Coordination (specs vs codes)|المطابقات|clash|p_coord','TimeLiner|تايم لاينر|sim4d|p_sched','Quantification|حصر الكميات|boq|p_bom','Autodesk Rendering|الريندر|camera|render','Animator|المحرّك|play|p_anim','Scripter|السكربتات|text','Batch Utility|أداة الدفعات|gear','Compare|مقارنة|link|tm_vers','DataTools|أدوات البيانات|table','Safety|السلامة|safety|p_safety']]]],
['viewpoint','Viewpoint','زاوية الرؤية',[
 ['Save, Load & Playback','حفظ وتشغيل',['Save Viewpoint|حفظ زاوية|camera|p_views','Views|المناظير|view3d|p_views','Record|تسجيل|record|rec','Play|تشغيل|play|dis']],
 ['Camera','الكاميرا',['Perspective|منظور|iso|n_persp','Orthographic|متعامد|iso|n_ortho','Field of View|مجال الرؤية|eye','Align Camera|محاذاة الكاميرا|move','Top|علوي|plan|n_top','Iso|أيزو|iso|n_iso']],
 ['Navigate','التنقل',['Walk|مشي|move|n_walk','Orbit|تدوير|rot|n_orbit','Pan|إزاحة|move|n_pan','Zoom all|تكبير الكل|zfit|zfit','Look Around|نظر حول|eye','Fly|طيران|move','Realism (collision, gravity)|واقعية (تصادم وجاذبية)|gear']],
 ['Render Style','نمط العرض',['Shaded|مظلل|iso|d_shaded','Wireframe|إطار سلكي|iso|d_wire','X-ray|أشعة|iso|d_xray','Lighting|الإضاءة|light|env_sun']],
 ['Sectioning','القطاعات',['Enable Sectioning|تفعيل القطاعات|section|sA','Plan cut|قطاع أفقي|section|sB','Section Z|قطاع Z|section|sC','Clear cuts|مسح القطاعات|erase|sClr']]]],
['review','Review','المراجعة',[
 ['Measure','القياس',['Point to Point|نقطة لنقطة|mDist|m_dist','Between|بين|mBetween|m_btw','Angle|زاوية|mAngle|m_ang','Area / circle|مساحة / دائرة|mCircle|m_circ','Level|منسوب|mLevel|m_lvl','Object|كائن|mObj|m_obj','Clear|مسح|erase|rm_all']],
 ['Redline','ملاحظات حمراء',['Text|نص|text|note','Draw|رسم|line','Erase|مسح|erase|rm_last']],
 ['Tags','الوسوم',['Add Tag|إضافة وسم|tag|note','Tag ID|رقم وسم|tag']],
 ['Comments','التعليقات',['View Comments|عرض التعليقات|text|tm_log','Find Comments|بحث في التعليقات|eye|tm_find']],
 ['Reviews','مراجعات',['Structural|إنشائي|safety|wf_struct','MEP|MEP|safety|wf_mep','Quality|الجودة|safety|wf_qa','Handover|التسليم|safety|wf_hand']]]],
['anim','Animation','الحركة',[
 ['Create','إنشاء',['Animator|المحرّك|play|p_anim','Record|تسجيل|record|rec','Disassembly video|فيديو الفك|vexp|recdis','Assembly video|فيديو التركيب|vasm|recasm','4D schedule video|فيديو الجدول|record|recsch']],
 ['Playback','التشغيل',['Disassemble|فك|explode|dis','Assemble|تركيب|assemble|asm','Pause|إيقاف|pause|pause']],
 ['Script','السكربت',['Enable Scripts|تفعيل السكربتات|text','Scripter|السكربتات|text']]]],
['view','View','عرض',[
 ['Navigation Aids','مساعدات التنقل',['Navigation Bar|شريط التنقل|layout','ViewCube|مكعب العرض|iso','HUD|بيانات الشاشة|eye','Labels|اللافتات|label|t_labels','Levels|المناسيب|levels|t_levels']],
 ['Grids & Levels','الشبكات والمناسيب',['Show Grid|إظهار الشبكة|grid|t_ground','Mode|الوضع|gear']],
 ['Scene View','منظر المشهد',['Split View|تقسيم المنظر|tile|w_tile','Full Screen|ملء الشاشة|zfit|ui_bars','Background|الخلفية|layer|p_look']],
 ['Workspace','مساحة العمل',['Windows|النوافذ|layout|w_add','Load Workspace|تحميل مساحة|layout|w_reset','Site plan|مسقط الموقع|terrain|site']]]],
['output','Output','الإخراج',[
 ['Publish','نشر',['NWD|NWD|export','Project package ZIP|حزمة المشروع|export|pack','Share|مشاركة|link|p_share']],
 ['Export Scene','تصدير المشهد',['IFC|IFC|ifc|e_ifc','OBJ|OBJ|obj|e_obj','DXF 3D|DXF 3D|dxf|e_dxf3','FBX|FBX|export','Google Earth KML|KML|export']],
 ['Visuals','مرئيات',['Image|صورة|camera|shot','Rendered Image|صورة ريندر|camera|render','Animation|فيديو|record|rec']],
 ['Export Data','تصدير البيانات',['Clash report|تقرير التعارض|table|p_coord','Quantities XLSX|الكميات XLSX|xlsx|e_boq','Schedule XER|الجدول XER|xer|xer','Viewpoints report|تقرير الزوايا|table']]]]
],'home');
