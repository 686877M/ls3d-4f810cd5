/* AutoCAD ribbon (C.X). Wired: the CAD editor drawing and modify commands, zoom, measure, undo, plot sheet and exports. */
progReg('draft',[
['home','Home','الرئيسية',[
 ['Draw','الرسم',['Line|خط|line|c_line','Polyline|بوليلاين|poly|c_pl','Circle|دائرة|circle|c_circle','Arc|قوس|arc|c_arc','Rectangle|مستطيل|rect|c_rect','Polygon|مضلع|poly|c_poly','Ellipse|قطع ناقص|ellipse|c_ell','Spline|منحنى|spline|c_spline','Hatch|تهشير|hatch|c_hatch','Gradient|تدرج|hatch','Boundary|حد|rect','Region|منطقة|rect','Wipeout|ممحاة|rect','Revision Cloud|سحابة مراجعة|poly|c_cloud','Point|نقطة|point|c_point','Construction Line|خط إنشاء|cons|c_xline','Ray|شعاع|line']],
 ['Modify','التعديل',['Move|نقل|move|c_move','Copy|نسخ|copy|c_copy','Stretch|مط|scale|c_stretch','Rotate|تدوير|rot|c_rotate','Mirror|مرآة|mirror|c_mirror','Scale|مقياس|scale|c_scale','Trim|قص|trim|c_trim','Extend|مد|trim|c_extend','Fillet|تدوير زوايا|arc|c_fillet','Chamfer|شطف|line|c_chamfer','Array|مصفوفة|array|c_array','Offset|إزاحة|offset|c_offset','Erase|مسح|erase|c_erase','Explode|تفجير|erase|c_explode','Join|ضم|link|c_join','Break|كسر|trim|c_break','Blend|دمج منحنى|spline','Lengthen|إطالة|line|c_lengthen','Align|محاذاة|move|c_align','Edit Polyline|تحرير بوليلاين|poly']],
 ['Annotation','التوضيح',['Text|نص|text|c_text','Dimension|بُعد|dim|c_dim','Leader|خط إيضاح|line|c_leader','Table|جدول|table|c_table','Mtext|نص متعدد|text']],
 ['Layers','الطبقات',['Layer Properties|خصائص الطبقات|layer|ly_mgr','Layer Previous|الطبقة السابقة|layer|ly_prev','Isolate|عزل|layer|ly_iso','Unisolate (all on)|إلغاء العزل|layer|ly_all','Freeze|تجميد|layer|ly_freeze','Lock|قفل|layer|ly_lock','Make Current|تعيين كحالية|layer','Match|مطابقة|layer']],
 ['Block','البلوك',['Insert|إدراج|block|c_binsert','Create|إنشاء|block|c_bcreate','Edit|تحرير|block','Define Attributes|تعريف خصائص|block']],
 ['Properties','الخصائص',['Match Properties|مطابقة الخصائص|link|c_matchp','Color|اللون|layer','Linetype|نوع الخط|line|ly_lt','Lineweight|سمك الخط|line|ly_lw']],
 ['Groups','المجموعات',['Group|تجميع|block','Ungroup|فك التجميع|block']],
 ['Utilities','الأدوات',['Measure Distance|قياس مسافة|mDist|m_dist','Area|المساحة|layout|c_area','ID Point|هوية نقطة|point|c_id','Quick Calc|حاسبة|gear|p_calc','Angle|زاوية|mAngle|m_ang']],
 ['Clipboard','الحافظة',['Paste|لصق|copy','Copy Clip|نسخ للحافظة|copy','Cut|قص|trim','Undo|تراجع|undo|undo','Redo|إعادة|redo|redo']]]],
['insert','Insert','إدراج',[
 ['Block','البلوك',['Insert|إدراج|block|c_binsert','Create Block|إنشاء بلوك|block|c_bcreate','Edit Block|تحرير بلوك|block']],
 ['Reference','المرجع',['Attach|إرفاق|xref','Clip|قص مرجع|trim','Underlay|خلفية|xref']],
 ['Import','استيراد',['Import|استيراد|impt|open','PDF Import|استيراد PDF|impt']],
 ['Data','البيانات',['Data Extraction|استخراج بيانات|table|p_bom','Link Data|ربط بيانات|link']],
 ['Linking','الربط',['Hyperlink|رابط|link','Location|الموقع|point|p_geo']]]],
['annot','Annotate','التوضيح',[
 ['Text','النص',['Multiline Text|نص متعدد|text|c_text','Single Line|سطر واحد|text','Check Spelling|فحص إملاء|text','Find|بحث|text']],
 ['Dimensions','الأبعاد',['Linear|خطي|dim|c_dim','Aligned|محاذٍ|dim|m_dist','Angular|زاوي|dim|m_ang','Radius|نصف قطر|dim|m_circ','Diameter|قطر|dim','Arc Length|طول قوس|dim','Baseline|خط أساس|dim','Continue|متابعة|dim','Update|تحديث|dim','Dim Style|نمط الأبعاد|gear']],
 ['Leaders','خطوط الإيضاح',['Multileader|ملتي ليدر|line|c_leader','Add Leader|إضافة|line','Align|محاذاة|line']],
 ['Tables','الجداول',['Table|جدول|table|c_table','Link Table|ربط جدول|link']],
 ['Markup','الملاحظات',['Revision Cloud|سحابة مراجعة|poly|c_cloud','Wipeout|ممحاة|rect','Note in 3D|ملاحظة 3D|note|note']]]],
['param','Parametric','بارامتري',[
 ['Geometric','هندسية',['Coincident|تطابق|point','Collinear|على خط واحد|line','Concentric|متحدة المركز|circle','Fix|تثبيت|point','Parallel|توازي|line','Perpendicular|تعامد|line','Horizontal|أفقي|line','Vertical|رأسي|line','Tangent|مماس|arc','Smooth|نعومة|spline','Symmetric|تماثل|mirror','Equal|تساوي|line']],
 ['Dimensional','بُعدية',['Linear|خطي|dim','Aligned|محاذٍ|dim','Angular|زاوي|dim','Radius|نصف قطر|dim','Diameter|قطر|dim','Convert|تحويل|link']],
 ['Manage','إدارة',['Delete Constraints|حذف القيود|erase','Show/Hide|إظهار/إخفاء|eye','Parameters Manager|مدير المعاملات|table']]]],
['view','View','عرض',[
 ['Navigate','التنقل',['Pan|إزاحة|move|n_pan','Zoom Extents|تكبير للكل|zfit|zfit','Zoom Window|تكبير نافذة|zoomsel|zsel','Zoom In|تكبير|zin|zin','Zoom Out|تصغير|zout|zout','Orbit|تدوير|rot|n_orbit']],
 ['Visual Styles','أنماط العرض',['2D Wireframe|إطار سلكي 2D|iso|d_wire','Shaded|مظلل|iso|d_shaded','X-ray|أشعة|iso|d_xray','Hidden|مخفي|iso','Realistic|واقعي|iso|render','Conceptual|تصوري|iso','Sketchy|رسم يدوي|iso','Shades of Gray|تدرج رمادي|iso']],
 ['Model Viewports','نوافذ العرض',['Named Views|مناظير مسماة|view3d|p_views','Viewport Configuration|ضبط النوافذ|layout','Top|علوي|plan|n_top','Iso|أيزو|iso|n_iso']],
 ['Palettes','اللوحات',['Properties|الخصائص|edit|p_edit','Tool Palettes|لوحات الأدوات|layout','Sheet Set Manager|مدير مجموعات اللوحات|sheet|sheet','Layers|الطبقات|layer|ly_mgr','Measure|قياس|measure|p_review']],
 ['Interface','الواجهة',['Switch Windows|تبديل النوافذ|tile|w_tile','Cascade|تتالي|cascade|w_casc','Reset layout|إعادة الترتيب|layout|w_reset','Hide / show bars|إخفاء/إظهار الأشرطة|layout|ui_bars']]]],
['manage','Manage','إدارة',[
 ['Action Recorder','مسجل الأفعال',['Record|تسجيل|record|rec','Play|تشغيل|play|dis']],
 ['Customization','التخصيص',['User Interface|الواجهة|gear|p_look','Tool Palettes|لوحات الأدوات|layout','Edit Aliases|تحرير الاختصارات|text']],
 ['CAD Standards','معايير CAD',['Configure|ضبط|gear','Check|فحص|safety|p_safety','Layer Translator|مترجم الطبقات|layer']],
 ['Applications','التطبيقات',['Load Application|تحميل تطبيق|impt','Run Script|تشغيل سكربت|play']]]],
['output','Output','الإخراج',[
 ['Plot','الطباعة',['Plot|طباعة|sheet|sheet','Batch Plot|طباعة دفعة|sheet','Preview|معاينة|eye|sheet','Page Setup Manager|إعداد الصفحة|gear','Plotter Manager|مدير الطابعات|gear']],
 ['Export to DWF/PDF','تصدير DWF/PDF',['Export PDF|تصدير PDF|pdf|e_pdf','Export SVG|تصدير SVG|dxf|e_svg','Export DXF|تصدير DXF|dxf|e_dxf','DWF|DWF|dxf']],
 ['Package','الحزمة',['Project package ZIP|حزمة المشروع|export|pack','Share|مشاركة|link|p_share']]]]
],'home');
