/* Civil 3D ribbon (S.X). Wired: surface from points, contours, volumes, site plan, exports, drawing and measure commands. The rest is listed and marked not built (see docs/UI_SPEC_civil3d.md). */
progReg('survey',[
['home','Home','الرئيسية',[
 ['Palettes','اللوحات',['Toolspace|مساحة الأدوات|layout|p_survey','Properties|الخصائص|edit|p_edit','Prospector|المستكشف|layout|p_survey','Panorama|بانوراما|layout','Tool Palettes|لوحات الأدوات|layout']],
 ['Create Ground Data','بيانات الأرض',['Points|نقاط|point|p_survey','Surfaces|أسطح|surface|p_survey','Feature Lines|خطوط الميزات|line','Survey|مساحة|point|p_survey','Create TIN surface|إنشاء سطح TIN|surface|p_survey','Terrain map|خريطة|terrain|p_geo']],
 ['Create Design','التصميم',['Parcels|قطع|parcel','Alignments|محاور|align','Profile|قطاع طولي|profile','Corridor|كوريدور|align','Intersections|تقاطعات|align','Pipe Network|شبكة مواسير|pipe','Pressure Network|شبكة ضغط|pipe','Grading|تسوية|terrain','Assembly|تجميعة|block']],
 ['Profile & Section Views','قطاعات',['Profile View|منظر قطاع طولي|profile','Sample Lines|خطوط عينات|line','Section Views|مناظير مقاطع|section|sA']],
 ['Draw','الرسم',['Line|خط|line|c_line','Polyline|بوليلاين|poly|c_pl','Circle|دائرة|circle|c_circle','Rectangle|مستطيل|rect|c_rect','Text|نص|text|c_text','Dimension|بُعد|dim|c_dim']],
 ['Modify','التعديل',['Move|نقل|move|c_move','Copy|نسخ|copy|c_copy','Rotate|تدوير|rot|c_rotate','Mirror|مرآة|mirror|c_mirror','Scale|مقياس|scale|c_scale','Offset|إزاحة|offset|c_offset','Erase|مسح|erase|c_erase']]]],
['insert','Insert','إدراج',[
 ['Import','استيراد',['Import points|استيراد نقاط|impt|p_survey','Import CAD|استيراد CAD|impt|open','Import LandXML|استيراد LandXML|impt','Import survey data|استيراد بيانات رفع|impt']],
 ['Map','الخريطة',['Map and GIS|الخريطة وGIS|terrain|p_geo','Satellites|الأقمار|terrain|env_sat','Attach image|إرفاق صورة|rect']]]],
['annot','Annotate','التوضيح',[
 ['Labels & Tables','وسوم وجداول',['Add Labels|إضافة وسوم|tag','Add Tables|إضافة جداول|table','Surface labels|وسوم السطح|tag']],
 ['Dimension','الأبعاد',['Linear|خطي|dim|c_dim','Distance|مسافة|mDist|m_dist','Angle|زاوية|mAngle|m_ang','Level|منسوب|mLevel|m_lvl']],
 ['Text','النص',['Text|نص|text|c_text','3D note|ملاحظة 3D|note|note']]]],
['modify','Modify','تعديل',[
 ['Ground Data','بيانات الأرض',['Surface|سطح|surface|p_survey','Points|نقاط|point|p_survey','Feature Line|خط ميزات|line','Grading|تسوية|terrain']],
 ['Design','التصميم',['Alignment|محور|align','Profile|قطاع|profile','Corridor|كوريدور|align','Pipe Network|شبكة مواسير|pipe','Parcel|قطعة|parcel']],
 ['Edit','التحرير',['Move|نقل|move|c_move','Copy|نسخ|copy|c_copy','Rotate|تدوير|rot|c_rotate','Erase|مسح|erase|c_erase','Remove last|إزالة الأخير|erase|rm_last']]]],
['analyze','Analyze','التحليل',[
 ['Ground Data','بيانات الأرض',['Volumes|حجوم|surface|p_survey','Contours|كنتور|terrain|p_survey','Slope analysis|تحليل الميل|terrain','Elevation analysis|تحليل المناسيب|terrain','Watershed|مستجمع مائي|terrain']],
 ['Design','التصميم',['Check clashes|فحص التعارض|clash|clash','Site safety|سلامة الموقع|safety|p_safety','Calculations|حسابات|gear|p_calc','Seismic, wind, soil|زلازل رياح تربة|gear|env_qc']]]],
['view','View','عرض',[
 ['Navigate','التنقل',['Pan|إزاحة|move|n_pan','Zoom all|تكبير الكل|zfit|zfit','Zoom in|تكبير|zin|zin','Zoom out|تصغير|zout|zout','Orbit|تدوير|rot|n_orbit','Walk|مشي|move|n_walk']],
 ['Views','المناظير',['Plan|مسقط|plan|v_plan','Iso|أيزو|iso|n_iso','Top|علوي|plan|n_top','Site plan|مسقط الموقع|terrain|site','Zoom to station|تكبير للمحطة|zfit|sitest','Zoom to site|تكبير للموقع|zfit|sitez']],
 ['Visual Styles','أنماط العرض',['Shaded|مظلل|iso|d_shaded','Wireframe|إطار سلكي|iso|d_wire','X-ray|أشعة|iso|d_xray']],
 ['Palettes','اللوحات',['Properties|الخصائص|edit|p_edit','Parameters|المعاملات|table|p_edit']]]],
['output','Output','الإخراج',[
 ['Export','التصدير',['Contours DXF|كنتور DXF|dxf|e_dxf','Surface DXF 3D|سطح DXF 3D|dxf|e_dxf3','LandXML|LandXML|export','IFC|IFC|ifc|e_ifc']],
 ['Plot','الطباعة',['Drawing sheet|لوحة الرسم|sheet|sheet','PDF|PDF|pdf|e_pdf','Quantities|الكميات|xlsx|e_boq']]]],
['survey','Survey','المساحة',[
 ['Survey Toolspace','مساحة أدوات الرفع',['Survey Toolspace|أدوات الرفع|layout|p_survey','Survey Databases|قواعد الرفع|table']],
 ['Points','النقاط',['Create points|إنشاء نقاط|point|p_survey','Edit points|تحرير نقاط|point|p_survey','Import points|استيراد نقاط|impt|p_survey','Point groups|مجموعات نقاط|layer']],
 ['Figures and Networks','الأشكال والشبكات',['Figures|أشكال|line','Networks|شبكات|link','Linework codes|أكواد الخطوط|text']],
 ['Query','استعلام',['Survey Query|استعلام الرفع|eye']]]],
['manage','Manage','إدارة',[
 ['Settings','الإعدادات',['Drawing settings|إعدادات الرسم|gear|setup','Surface settings|إعدادات السطح|gear|p_survey','Contour interval|فاصل الكنتور|gear|p_survey']],
 ['Project','المشروع',['Project info|معلومات المشروع|info|setup','Saved projects|المشاريع المحفوظة|projects|projects','Team and versions|الفريق والنسخ|link|p_team']]]]
],'home');
