import json,base64,os,shutil
D='/private/tmp/hxa_dl/'; O='/private/tmp/mod_hxa/site/vendor/hx-assets/'; os.makedirs(O,exist_ok=True)
meta=json.load(open(D+'tex_meta.json'))
# id: (group, en, ar, rough, metal)
M=[('plank_flooring','floor','Oak planks','باركيه بلانكس',.55,0),('plank_flooring_02','floor','Wide planks','ألواح خشب عريضة',.55,0),('laminate_floor_02','floor','Laminate','لامينيت',.5,0),('dark_wooden_planks','floor','Dark wood planks','خشب غامق',.6,0),('diagonal_parquet','floor','Diagonal parquet','باركيه مائل',.5,0),('rectangular_parquet','floor','Rectangular parquet','باركيه مستطيل',.5,0),
('floor_tiles_06','floor','Floor tiles 06','بلاط أرضيات 06',.35,0),('floor_tiles_08','floor','Floor tiles 08','بلاط أرضيات 08',.35,0),('patio_tiles','floor','Patio tiles','بلاط فناء',.6,0),('terracotta_floor_tiles','floor','Terracotta tiles','بلاط تيراكوتا',.7,0),('interior_tiles','floor','Interior tiles','بلاط داخلي',.4,0),('slate_floor_03','floor','Slate floor','أردواز',.65,0),
('marble_01','floor','Marble','رخام',.25,0),('marble_tiles','floor','Marble tiles','بلاط رخام',.3,0),('marble_mosaic_tiles','floor','Marble mosaic','موزايكو رخام',.35,0),
('smooth_concrete_floor','floor','Smooth concrete','خرسانة ناعمة',.7,0),('concrete_floor_02','floor','Concrete floor','أرضية خرسانة',.8,0),('painted_concrete','floor','Painted concrete','خرسانة مدهونة',.75,0),('scuffed_cement','floor','Scuffed cement','أسمنت مخدوش',.85,0),
('white_plaster_02','wall','White plaster','محارة بيضاء',.9,0),('beige_wall_001','wall','Beige wall 1','حائط بيج 1',.9,0),('beige_wall_002','wall','Beige wall 2','حائط بيج 2',.9,0),('plastered_wall_04','wall','Plastered wall','حائط محارة',.9,0),('grey_plaster','wall','Grey plaster','محارة رمادي',.9,0),
('brick_wall_001','wall','Brick wall','حائط طوب',.9,0),('red_brick_03','wall','Red brick','طوب أحمر',.9,0),('white_bricks','wall','White bricks','طوب أبيض',.9,0),('large_red_bricks','wall','Large red bricks','طوب أحمر كبير',.9,0),
('ceiling_interior','metal','Ceiling panels','أسقف',.8,0),('metal_plate','metal','Metal plate','لوح معدن',.4,.8),('metal_plate_02','metal','Metal plate 2','لوح معدن 2',.4,.8),('blue_metal_plate','metal','Blue metal','معدن أزرق',.4,.7),
('leather_white','fabric','White leather','جلد أبيض',.5,0),('brown_leather','fabric','Brown leather','جلد بني',.5,0),('velour_velvet','fabric','Velvet','قطيفة',.9,0),('rough_linen','fabric','Linen','كتان',.95,0),
('sparse_grass','outdoor','Sparse grass','حشيش خفيف',1,0),('leafy_grass','outdoor','Leafy grass','عشب كثيف',1,0),('asphalt_01','outdoor','Asphalt','أسفلت',.95,0),('worn_asphalt','outdoor','Worn asphalt','أسفلت قديم',.95,0)]
cat={}; packs={}
for i,g,en,ar,r,mt in M:
    inf=json.load(open(D+'meta/%s_info.json'%i)); tile=round(inf['dimensions'][0]/1000,2)
    cat[i]=[g,en,ar,tile,r,mt]
    c=base64.b64encode(open(D+'tex512/%s_diff.jpg'%i,'rb').read()).decode(); n=base64.b64encode(open(D+'tex512/%s_nor.jpg'%i,'rb').read()).decode()
    packs.setdefault(g,[]).append("HXA.pm('%s','%s','%s');"%(i,c,n))
for g,l in packs.items(): open(O+'hxa_mat_%s.js'%g,'w').write('/* H.X materials pack: %s (Poly Haven, CC0). 512 px colour + normal. See CREDITS.md */\n'%g+'\n'.join(l)+'\n')
# models: id: (src, en, ar, w,d,h, group, colour, source label)
K='/private/tmp/hxa_dl/ken_x/Models/GLTF format/'
G=[('sofa','Sofa','كنبة',2.1,.95,.85,'seat','ph','Sofa_01'),('armchair','Armchair','فوتيه',.85,.85,.9,'seat','ph','ArmChair_01'),('dchair','Dining chair','كرسي سفرة',.5,.55,.9,'seat','ph','dining_chair_02'),('deskchair','Desk chair','كرسي مكتب',.6,.6,.95,'seat','kn','chairDesk'),
('dtable','Wooden table','ترابيزة خشب',1.6,.9,.76,'table','ph','WoodenTable_02'),('ctable','Coffee table','ترابيزة قهوة',1.0,.6,.45,'table','ph','modern_coffee_table_01'),('desk','Desk','مكتب',1.4,.7,.76,'table','kn','desk'),('tvunit','Television','تلفزيون',1.0,.25,.65,'decor','kn','televisionModern'),('sidetable','Side table','ترابيزة جانبية',.5,.5,.55,'table','kn','sideTable'),
('bed2','Double bed','سرير مزدوج',1.7,2.1,.9,'bed','kn','bedDouble'),('bed1','Single bed','سرير مفرد',1.0,2.0,.8,'bed','kn','bedSingle'),('wardrobe','Wardrobe / bookcase','دولاب',1.0,.45,2.0,'storage','kn','bookcaseClosedDoors'),
('lampfloor','Floor lamp','أباجورة',.4,.4,1.5,'light','kn','lampRoundFloor'),('lampceil','Ceiling lamp','نجفة سقف',.6,.6,.3,'light','ph','modern_ceiling_lamp_01'),
('toilet','Toilet','مرحاض',.4,.7,.8,'bath','kn','toilet'),('basin','Wash basin','حوض غسيل',.6,.5,.9,'bath','kn','bathroomSink'),('bathtub','Bathtub','بانيو',1.7,.75,.6,'bath','kn','bathtub'),('shower','Shower','دش',.95,.95,2.0,'bath','kn','shower'),
('kcab','Kitchen base unit','وحدة مطبخ سفلية',.6,.6,.9,'kitchen','kn','kitchenCabinet'),('ksink','Kitchen sink unit','وحدة حوض مطبخ',1.0,.6,.9,'kitchen','kn','kitchenSink'),('kstove','Cooker','بوتاجاز',.6,.65,.9,'kitchen','kn','kitchenStove'),('kfridge','Fridge','ثلاجة',.7,.7,1.85,'kitchen','kn','kitchenFridge'),
('door','Door in wall','باب في حائط',1.0,.2,2.2,'opening','kn','doorway'),('window','Window in wall','شباك في حائط',1.2,.2,2.4,'opening','kn','wallWindow'),('plant','Potted plant','نبات زينة',.5,.5,1.1,'decor','kn','pottedPlant')]
gl=[]; tot=0
for gid,en,ar,w,d,h,grp,src,fn in G:
    p=D+'glb/%s.glb'%fn if src=='ph' else K+fn+'.glb'; b=open(p,'rb').read(); assert len(b)<1.5e6; tot+=len(b)
    open(O+'hxa_mdl_%s.js'%gid,'w').write("/* H.X model %s (%s). See CREDITS.md */\nHXA.pg('%s','%s');\n"%(gid,('Poly Haven CC0' if src=='ph' else 'Kenney Furniture Kit CC0'),gid,base64.b64encode(b).decode()))
    gl.append([gid,en,ar,w,d,h,grp,src,fn,len(b)])
print('glb bytes',tot)
shutil.copy(D+'mod/GLTFLoader.js',O+'GLTFLoader.js')
open('/private/tmp/mod_hxa/site/src/incoming3/hxassets_data.js','w').write("/* ====== H.X assets: catalogue data (materials, furniture) and the lazy pack registry. Generated from the downloaded packs; licences in site/vendor/hx-assets/CREDITS.md ====== */\nconst HXA={base:'vendor/hx-assets/',mat:{},mdl:{},cat:%s,gl:%s,pm(id,c,n){ this.mat[id]={c,n}; },pg(id,b){ this.mdl[id]=b; },ld:{}};\n"%(json.dumps(cat,ensure_ascii=False),json.dumps(gl,ensure_ascii=False)))
json.dump({'cat':cat,'gl':gl},open('/tmp/hxa_catalog.json','w'))
