# Reads the OPEN catalogues (data only: URL templates, attribution, max zoom; no tiles) and writes catalogs_applied.json for catalogue.py:
#  - leaflet-providers (BSD-2-Clause) through xyzservices' machine-readable copy cats/lpp.json (leaflet-providers-parsed.json, xyzservices is BSD-3-Clause)
#  - xyzservices-providers.json (BSD-3-Clause) cats/xyz.json
#  - NASA GIBS WMTS GetCapabilities cats/../probe/gibs_cap.xml (layer id, format, tile matrix set, default date)
#  - Esri Wayback config probe/wb.json
import json,re
L=json.load(open('cats/lpp.json')); X=json.load(open('cats/xyz.json')); gcap=open('probe/gibs_cap.xml').read()
def A(s): return s.replace('(C)','©').replace('&copy;','©')
def lp(path):
    for D in (L,X):
        d=D
        try:
            for k in path.split('.'): d=d[k]
            return d
        except KeyError: pass
    raise KeyError(path)
def xz(path):
    d=X
    for k in path.split('.'): d=d[k]
    return d
LP='leaflet-providers (BSD-2) '; XY='xyzservices (BSD-3) '; GB='NASA GIBS GetCapabilities '
# id -> (source label, catalogue lookup or None)
M={'osm':(LP+'OpenStreetMap.Mapnik','OpenStreetMap.Mapnik'),'osm_de':(LP+'OpenStreetMap.DE','OpenStreetMap.DE'),'osm_hot':(LP+'OpenStreetMap.HOT','OpenStreetMap.HOT'),'cyclosm':(LP+'CyclOSM','CyclOSM'),
 'carto_light':(LP+'CartoDB.Positron','CartoDB.Positron'),'carto_dark':(LP+'CartoDB.DarkMatter','CartoDB.DarkMatter'),'carto_voyager':(LP+'CartoDB.Voyager','CartoDB.Voyager'),
 'esri_street':(LP+'Esri.WorldStreetMap','Esri.WorldStreetMap'),'esri_gray':(LP+'Esri.WorldGrayCanvas','Esri.WorldGrayCanvas'),'otm':(LP+'OpenTopoMap','OpenTopoMap'),'esri_topo':(LP+'Esri.WorldTopoMap','Esri.WorldTopoMap'),'esri_natgeo':(LP+'Esri.NatGeoWorldMap','Esri.NatGeoWorldMap'),
 'esri_img':(LP+'Esri.WorldImagery','Esri.WorldImagery'),'openrailway':(LP+'OpenRailwayMap','OpenRailwayMap'),'openseamap':(LP+'OpenSeaMap','OpenSeaMap'),
 'gibs_modis_tc':(GB+'MODIS_Terra_CorrectedReflectance_TrueColor + '+LP+'NASAGIBS.ModisTerraTrueColorCR','NASAGIBS.ModisTerraTrueColorCR'),'gibs_lst_day':(GB+'MODIS_Terra_Land_Surface_Temp_Day + '+LP+'NASAGIBS.ModisTerraLSTDay','NASAGIBS.ModisTerraLSTDay'),'gibs_snow':(GB+'MODIS_Terra_NDSI_Snow_Cover + '+LP+'NASAGIBS.ModisTerraSnowCover','NASAGIBS.ModisTerraSnowCover'),'gibs_aerosol':(GB+'MODIS_Terra_Aerosol + '+LP+'NASAGIBS.ModisTerraAOD','NASAGIBS.ModisTerraAOD'),
 'gibs_viirs_tc':(GB+'VIIRS_SNPP_CorrectedReflectance_TrueColor',None),'gibs_bm':(GB+'BlueMarble_ShadedRelief_Bathymetry',None),'gibs_lst_night':(GB+'MODIS_Terra_Land_Surface_Temp_Night',None),'gibs_sst':(GB+'GHRSST_L4_MUR_Sea_Surface_Temperature',None),'gibs_bmarble':(GB+'VIIRS_Black_Marble',None),'gibs_dnb':(GB+'VIIRS_SNPP_DayNightBand_ENCC',None),'gibs_ndvi':(GB+'MODIS_Terra_NDVI_8Day',None),'gibs_hls':(GB+'HLS_S30_Nadir_BRDF_Adjusted_Reflectance',None),
 'fires':(GB+'MODIS_Terra_Thermal_Anomalies_All / VIIRS_SNPP_Thermal_Anomalies_375m_All (format application/vnd.mapbox-vector-tile) + NASA FIRMS viewer link',None),'wayback':('Esri Wayback config JSON (waybackconfig.json, release list)',None),'rainviewer':('RainViewer public API docs (weather-maps.json), own research; not in leaflet-providers',None),
 'eox_terrain':('EOX maps WMTS (maps.eox.at), own research',None),'esri_hill':('Esri ArcGIS service name World_Hillshade, own research',None),'worldcover':('ESA WorldCover / Terrascope WMTS docs, own research',None),'gsw':('JRC Global Surface Water Explorer tile bucket, own research',None),'gfc':('Hansen / UMD Global Forest Change tile bucket, own research',None),
 'esri_labels':('existing repo c_gis.js OVERLAYS (Esri reference service)',None),'esri_trans':('existing repo c_gis.js OVERLAYS (Esri reference service)',None),'img_key':('Esri ArcGIS Location Platform docs, own research',None),'sentinelhub':('Sentinel Hub OGC WMTS docs, own research',None),'maptiler_sat':(XY+'MapTiler.Satellite',None)}
for y in (2016,2018,2019,2020,2021,2022,2023,2024): M['eox_%d'%y]=('EOX Sentinel-2 cloudless WMTS (s2maps.eu / maps.eox.at), own research; not in leaflet-providers',None)
src={}; attr={}; zz={}
for i,(s,k) in M.items():
    src[i]=s
    if k:
        v=lp(k); attr[i]=A(v['attribution'])
src['lk_*']='existing repo c_gis2.js viewer links + own research'
# extras: free, no key (tested later by probe_final.py)
G='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/'
ga=A(lp('NASAGIBS.ModisTerraLSTDay')['attribution'])
def lpe(i,g,k,key,en,ar,lic,tx,pz,u=None,z=None,op=None,**kw):
    v=lp(key); e=dict(id=i,g=g,k=k,en=en,ar=ar,u=u or v['url'].replace('{s}','a').replace('{r}','').replace('{variant}',v.get('variant','')).replace('{ext}',v.get('ext','png')),a=A(v['attribution']),z=z or v.get('max_zoom') or 19,lic=lic,tx=tx,pz=pz,src=LP+key); 
    if op is not None: e['op']=op
    e.update(kw); return e
OSMT=('Community tile server from the leaflet-providers list: light use only, no bulk download, no SLA. Licence of the data: see attribution.','سيرفر مجتمعي من قايمة leaflet-providers: استخدام خفيف بس، ممنوع التحميل الكتير، بدون ضمان. ترخيص البيانات: شوف الإسناد.')
ESR=('Esri public tile URL, no key: licence for direct third-party use NOT confirmed; private demo only.','رابط بلاطات Esri العام بدون مفتاح: ترخيص الاستخدام المباشر غير مؤكد؛ لديمو خاص بس.')
GIB=('NASA GIBS: NASA open data, acknowledgement requested, no key. Commercial use not stated explicitly on the pages seen: check the GIBS data-use page.','NASA GIBS: بيانات NASA مفتوحة وبتطلب الإسناد، بدون مفتاح. الاستخدام التجاري مش مذكور صراحة: راجع صفحة شروط GIBS.')
E=[]
E.append(lpe('osm_fr','street','b','OpenStreetMap.France','OpenStreetMap France','OpenStreetMap فرنسا','light',OSMT,12))
E.append(lpe('opnv','street','b','OPNVKarte','Public transport map (OPNVKarte)','خريطة المواصلات العامة (OPNVKarte)','light',OSMT,12))
E.append(dict(id='un_clearmap',g='topo',k='b',en='UN ClearMap (United Nations web topo)',ar='UN ClearMap (طبوغرافي الأمم المتحدة)',u=xz('UN.ClearMap')['url'],a=A(xz('UN.ClearMap')['attribution']),z=18,lic='check',tx=('United Nations geospatial web service (from the xyzservices list): terms not checked here; the UN asks for the attribution shown.','خدمة الأمم المتحدة الجغرافية (من قايمة xyzservices): الشروط ماتحققتش هنا؛ الإسناد المعروض مطلوب.'),pz=8,src=XY+'UN.ClearMap'))
for key,i,en,ar,z in [('WorldShadedRelief','esri_shaded','Esri shaded relief','تظليل التضاريس Esri',13),('WorldTerrain','esri_terrain','Esri terrain base','تضاريس Esri الأساسية',13),('WorldPhysical','esri_physical','Esri physical map','الخريطة الفيزيائية Esri',8),('OceanBasemap','esri_ocean','Esri ocean basemap','خريطة المحيطات Esri',13)]:
    E.append(lpe(i,'topo','b','Esri.'+key,en,ar,'unclear',ESR,min(z,8),u=lp('Esri.'+key)['url'].replace('{variant}',lp('Esri.'+key)['variant']),z=z))
for key,i,en,ar in [('hiking','wmt_hiking','Hiking trails (Waymarked Trails)','مسارات المشي (Waymarked Trails)'),('cycling','wmt_cycling','Cycling routes (Waymarked Trails)','مسارات الدراجات (Waymarked Trails)')]:
    E.append(lpe(i,'ref','o','WaymarkedTrails.'+key,en,ar,'light',OSMT,10,u=lp('WaymarkedTrails.'+key)['url'].replace('{variant}',key),z=18,op=.9))
# GIBS extras: variant id from leaflet-providers, host/tile matrix from GetCapabilities
def gibs_layer(lid):
    m=re.search(r'<Layer>(?:(?!</Layer>).)*?<ows:Identifier>'+lid+r'</ows:Identifier>.*?</Layer>',gcap,re.S)
    if not m: return None
    b=m.group(0); return dict(fmt=re.findall(r'<Format>image/(\w+)',b)[0],tms=re.findall(r'<TileMatrixSet>GoogleMapsCompatible_Level(\d+)',b)[0],d=(re.search(r'<Default>([^<]*)',b) or re.search(r'<Value>([^<]*)',b) or [0,'2012-01-01'])[1].split('/')[0])
for key,i,g,en,ar,dd,op in [('ModisTerraBands721CR','gibs_b721','aerial','MODIS Terra bands 7-2-1 (burn scars, snow, vegetation; NASA GIBS)','MODIS Terra نطاقات 7-2-1 (حروق وثلج ونبات)','2026-11-10',1),('ModisTerraBands367CR','gibs_b367','aerial','MODIS Terra bands 3-6-7 (snow and ice, clouds; NASA GIBS)','MODIS Terra نطاقات 3-6-7 (ثلج وجليد وسحب)','2026-11-10',1),('ViirsEarthAtNight2012','gibs_citylights','land','Earth at night 2012, city lights (VIIRS, NASA GIBS)','الأرض بالليل 2012، أضواء المدن (VIIRS)',None,.8),('ModisTerraChlorophyll','gibs_chloro','land','Ocean chlorophyll-a (MODIS, NASA GIBS)','كلوروفيل المحيط (MODIS)','2026-11-10',.8)]:
    v=dict(lp('NASAGIBS.'+key)); v.setdefault('variant',(re.search(r'/best/([^/]+)/default',v['url']) or [0,''])[1]); gl=gibs_layer(v['variant']); 
    if not gl: print('GIBS layer not in capabilities',v['variant']); continue
    u=G+v['variant']+'/default/'+('{time}' if dd else gl['d'])+'/GoogleMapsCompatible_Level'+gl['tms']+'/{z}/{y}/{x}.'+gl['fmt']; z=int(gl['tms'])
    e=dict(id=i,g=g,k='o' if g=='land' else 'b',en=en,ar=ar,u=u,a=A(v['attribution']),z=z,lic='open',tx=GIB,pz=min(z,7),op=op,src=LP+'NASAGIBS.'+key+' + '+GB+v['variant'])
    if dd: e['time']=dict(min='2000-02-24',max='today',d=dd)
    E.append(e)
# key layers from the lists (not tested)
K=lambda i,en,ar,u,a,z,key,txt,txa,src:dict(id=i,g='key',k='b',en=en,ar=ar,u=u,a=a,z=z,lic='key',key=key,tx=(txt,txa),pz=0,src=src)
st=lp('Stadia.AlidadeSatellite'); tf=lp('Thunderforest.Landscape'); mt=xz('MapTiler.Satellite')
E.append(K('stadia_sat','Stadia Alidade satellite (needs your key)','Stadia أقمار (محتاج مفتاحك)','https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg?api_key={key}',A(st['attribution']),20,'stadia','Stadia Maps: your own key (free tier for non-commercial use with limits, paid for commercial; their terms). NOT tested: no key.','Stadia Maps: مفتاحك الخاص (مجاني لغير التجاري بحدود، التجاري مدفوع؛ شروطهم). مااتجربش.',LP+'Stadia.AlidadeSatellite'))
E.append(K('stadia_terrain','Stadia Stamen terrain (needs your key)','Stadia Stamen تضاريس (محتاج مفتاحك)','https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png?api_key={key}',A(lp('Stadia.StamenTerrain')['attribution']),18,'stadia','Stadia Maps: see Stadia satellite. NOT tested.','Stadia Maps: زي الأقمار. مااتجربش.',LP+'Stadia.StamenTerrain'))
for key,i,en,ar,var in [('Landscape','tf_landscape','Thunderforest Landscape (needs your key)','Thunderforest Landscape (محتاج مفتاحك)','landscape'),('OpenCycleMap','tf_cycle','Thunderforest OpenCycleMap (needs your key)','Thunderforest OpenCycleMap (محتاج مفتاحك)','cycle'),('Outdoors','tf_outdoors','Thunderforest Outdoors (needs your key)','Thunderforest Outdoors (محتاج مفتاحك)','outdoors')]:
    E.append(K(i,en,ar,'https://api.thunderforest.com/%s/{z}/{x}/{y}.png?apikey={key}'%var,A(lp('Thunderforest.'+key)['attribution']),22,'thunderforest','Thunderforest: your own key (free hobby plan with limits, paid otherwise; their terms). NOT tested: no key.','Thunderforest: مفتاحك الخاص (خطة مجانية بحدود، غير كده مدفوع؛ شروطهم). مااتجربش.',LP+'Thunderforest.'+key))
json.dump(dict(src=src,attr=attr,extra=E),open('catalogs_applied.json','w'),ensure_ascii=False,indent=1); print(len(src),'sources',len(attr),'attributions replaced',len(E),'extra entries')
