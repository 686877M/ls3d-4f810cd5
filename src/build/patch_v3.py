import re
SP='/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/'
s=open(SP+'v2_backup.html',encoding='utf-8').read()
rd=lambda n:open(SP+n,encoding='utf-8').read()
# sample project: absolute levels of the base page shifted by -1059.76 m (B.L +1159.76 -> +100.00), see sample_neutral.py
from decimal import Decimal as _D, ROUND_HALF_UP as _R
_LV=re.compile(r'(?<![\w.])11[5-7]\d\.\d+(?![\d])')
s=_LV.sub(lambda m:str((_D(m.group(0))+_D('-1059.76')).quantize(_D(1).scaleb(-len(m.group(0).split('.')[1])),rounding=_R)),s)
assert 'const BL=100.00, P0=' in s
def between(s,a,b,new,keep_a=False):
    i=s.index(a); j=s.index(b,i); return s[:i]+new+s[j:]
# head: panes
s=s.replace('<div class="pane" id="p-parts"></div>','<div class="pane" id="p-parts"></div>\n   <div class="pane" id="p-rebar"></div>\n   <div class="pane" id="p-scen"></div>\n   <div class="pane" id="p-codes"></div>\n   <div class="pane" id="p-help"></div>\n   <div class="pane" id="p-geo"></div>\n   <div class="pane" id="p-survey"></div>\n   <div class="pane" id="p-bim"></div>\n   <div class="pane" id="p-calc"></div>\n   <div class="pane" id="p-coord"></div>\n   <div class="pane" id="p-osheet"></div>\n   <div class="pane" id="p-oreport"></div>\n   <div class="pane" id="p-oslides"></div>\n   <div class="pane" id="p-omedia"></div>\n   <div class="pane" id="p-look"></div>\n   <div class="pane" id="p-agent"></div>\n   <div class="pane" id="p-site"></div>\n   <div class="pane" id="p-meas"></div>\n   <div class="pane" id="p-cad"></div>\n   <div class="pane" id="p-sched"></div>\n   <div class="pane" id="p-safety"></div>\n   <div class="pane" id="p-share"></div>\n   <div class="pane" id="p-fam"></div>\n   <div class="pane" id="p-bom"></div>\n   <div class="pane" id="p-sheet"></div>',1)
s=s.replace('<div class="pane" id="p-about"></div>','',1)
s=s.replace('</style>','.app{visibility:hidden}html{background:#1b1714}</style>',1)
s=s.replace('</style>','#tip{position:absolute;z-index:6;pointer-events:none;max-width:310px;background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:12px;line-height:1.45;box-shadow:var(--shadow)}#tip b{display:block;font-size:13px}#tip .k{color:var(--muted)}\n</style>',1)
# dict
s=s.replace('/* ====================== parameters, state ====================== */',rd('c_dict.js')+'\n/* ====================== parameters, state ====================== */',1)
# state
s=re.sub(r"const A=\{s:0,e:0,playing:false,dir:1,speed:1,loop:false,dur:22\};\nconst STEPS=\[.*?\];",
 "const A={s:0,e:0,playing:false,dir:1,speed:1,loop:false,dur:22,mode:'full',pump:0};\nconst SEQ={\n full:{all:true,steps:[['s1',0,.07],['s2',.07,.16],['s3',.16,.36],['s4',.36,.46],['s5',.46,.54],['s6',.54,.66],['s7',.66,.80],['s8',.80,1]],W:{covA:[0,.07],covB:[0,.07],covC:[0,.07],jib:[.07,.12],hdn:[.10,.16],lift:[.16,.36],swing:[.36,.46],bolts:[.46,.54],valves:[.54,.66],screen:[.66,.80],exp:[.80,1]}},\n pump:{steps:[['s1',0,.14],['s2',.14,.32],['s3',.32,.70],['s4',.70,1]],W:{covA:[0,.14],jib:[.14,.24],hdn:[.20,.32],lift:[.32,.70],swing:[.70,1]}},\n valves:{steps:[['s1c',0,.15],['s5',.15,.45],['s6',.45,1]],W:{covC:[0,.15],bolts:[.15,.45],valves:[.45,1]}},\n screen:{steps:[['s1b',0,.2],['s7',.2,1]],W:{covB:[0,.2],screen:[.2,1]}},\n explode:{steps:[['s8',0,1]],W:{exp:[0,1]}}};\nSEQ.build={build:true,steps:[['b1',0,.14],['b2',.14,.24],['b3',.24,.34],['b4',.34,.47],['b5',.47,.62],['b6',.62,.72],['b7',.72,.84],['b8',.84,1]],W:{},B:{pcblind:[0,.05],wbase:[.03,.1],cfloor:[.08,.14],wwall:[.12,.2],cwalls:[.16,.24],ctop:[.24,.29],wtop:[.27,.32],cfill:[.31,.34],pinlet:[.34,.38],pdis:[.36,.42],bends:[.38,.43],supports:[.4,.45],pheader:[.41,.46],poutlet:[.43,.47],rails:[.47,.51],ladderS:[.49,.53],ladderG:[.51,.55],stilling:[.53,.57],penstock:[.55,.59],screen:[.57,.62],flg:[.62,.65],dj:[.64,.67],nrv:[.66,.69],slv:[.68,.71],bolts:[.7,.72],crane:[.72,.75],pump:[.74,.84],covers:[.84,.88],podor:[.86,.9],carbon:[.87,.91],prefilter:[.88,.92],fan:[.89,.93],pvent:[.9,.94],skid:[.91,.95],shed:[.94,.98],board:[.96,1]}};",s,1,flags=re.S)
assert 'const SEQ=' in s
s=s.replace("['H.W.L',1.62],['H.H.W.L',1.72]","['H.W.L start',1.52],['H.H.W.L',1.62]",1)
# materials/helpers
s=s.replace("const cWater=M(","const cMesh=M(0x99a3ad,{transparent:true,opacity:.5},'S-STEEL');\nconst cWater=M(",1)
s=s.replace("const cyl=(r,h,m,x,y,z,seg)=>","const sph=(r,m,x,y,z)=>mesh(new T.SphereGeometry(r,12,10),m,x,y,z);\nconst cyl=(r,h,m,x,y,z,seg)=>",1)
# build + anim
s=between(s,'function buildModel(){','/* ====================== animation ====================== */',rd('c_build.js'))
s=between(s,'/* ====================== animation ====================== */','/* ====================== flags, sections, clipping ====================== */',rd('c_anim.js'))
s=s.replace("select(h?partOf(h.object):null); if(h)tab('parts');}","if(curTab==='meas')return; select(h?partOf(h.object):null); if(h){ if(typeof xtoClick==='function'&&xtoClick(h,e))return; tab('parts'); }}",1)
s=s.replace("P0={t:.43,","P0={t:.40,tB:.40,tT:.20,tCW:.30,tCF:.40,tCT:.20,",1)
s=s.replace("['t','p_t',.25,.8,.01],","['t','p_t',.2,.8,.01],['tB','p_tB',.2,.8,.01],['tT','p_tT',.15,.6,.01],['tCW','p_tCW',.2,.8,.01],['tCF','p_tCF',.2,.8,.01],['tCT','p_tCT',.15,.6,.01],",1)
s=s.replace("else if(x==='text')e.textContent=p[x];","else if(x==='text')e.textContent=p[x];else if(x==='html')e.innerHTML=p[x];",1)
s=s.replace("STEPS[i][0]","SEQ[A.mode].steps[i][0]")
# remove old select/updateSel one-liners
s=re.sub(r"function select\(id\)\{selId=id;[^\n]*\n","",s,1); s=re.sub(r"function updateSel\(\)\{if\(!selId[^\n]*\n","",s,1)
# levels merge
s=re.sub(r"const levelsFor=\(ax,bb\)=>\(!DR\.lv\|\|ax===1\)\?\[\]:lvList\(\)\.filter\(l=>l\[1\]>=bb\[1\]-\.05&&l\[1\]<=bb\[3\]\+\.05\);",
 "const lvTxt=l=>l.txt||(l[0]+' +'+f2(BL+l[1]));\nconst levelsFor=(ax,bb)=>{if(!DR.lv||ax===1)return []; const out2=[]; lvList().filter(l=>l[1]>=bb[1]-.05&&l[1]<=bb[3]+.05).forEach(l=>{const last=out2[out2.length-1]; if(last&&(l[1]-last[1])<.2){last.txt=(last.txt||lvTxt(last))+' / '+l[0]+' +'+f2(BL+l[1]);} else out2.push(Object.assign([l[0],l[1]],{}));}); return out2;};",s,1)
assert 'const lvTxt' in s
s=s.replace("l[0]+' +'+f2(BL+l[1])","lvTxt(l)")
s=s.replace("const lvTxt=l=>l.txt||(lvTxt(l));","const lvTxt=l=>l.txt||(l[0]+' +'+f2(BL+l[1]));")
# collect
s=between(s,'function collect(){','const proj=',rd('c_collect.js'))
# ifc
s=between(s,'function guid(){','function pdf2d(',rd('c_ifc.js')+'\n')
# ui
uiText=rd('c_ui.js').replace('/*@@C_DATA@@*/',rd('c_data.js')).replace('/*@@C_DRAFT@@*/',rd('c_draft.js')).replace('/*@@C_SHEET@@*/',rd('c_sheet.js')).replace('/*@@C_4D@@*/',rd('c_4d.js').replace('/*@@C_ACT@@*/',rd('c_act.js')).replace('/*@@C_P6@@*/',rd('c_p6.js'))+rd('c_4d_ui.js')+rd('c_p6_ui.js')).replace('/*@@C_FOLLOW@@*/',rd('c_follow.js')+rd('c_hist.js')+rd('c_cad.js')+rd('c_proj.js')+rd('c_ws.js')+rd('c_meas.js')+rd('c_site_data.js')+rd('c_msite_data.js')+rd('c_nets_data.js')+rd('c_site3d.js')+rd('c_rebar.js')+rd('c_tl.js')+rd('c_scen.js')+rd('c_codes.js')+rd('c_pack.js')+rd('c_help.js')+rd('c_nav.js')+rd('c_geo.js')+rd('c_icons.js')+rd('c_shell.js')+rd('c_agent.js')+rd('c_survey.js')+rd('c_bim.js')+rd('c_calc.js')+rd('c_coord.js')+rd('c_office.js')+rd('c_tabs.js')+rd('c_dc.js')+rd('c_pdata.js')+rd('c_social.js')+rd('c_media.js')+rd('c_media2.js')+rd('c_tv.js')+rd('c_soft.js')+rd('c_env.js')+rd('c_sim.js')+rd('c_ctrl.js')+rd('c_team.js')+rd('c_undo.js')+rd('c_ui2.js')+rd('c_ind.js')+rd('c_hub.js')+rd('c_flow.js')+rd('c_render.js')+rd('c_cmd.js')+rd('c_idle.js')+rd('c_login.js')+rd('c_plant.js')+rd('c_rib.js')+rd('c_home.js')+rd('c_hvac.js')+rd('c_duct.js')+rd('c_hvac2.js')+rd('c_duct2.js')+rd('c_prog.js')+rd('c_panels.js')+rd('c_cad2.js')+rd('c_cad3.js')+rd('c_revit.js')+rd('c_revit2.js')+rd('c_revit3.js')+rd('c_rvplan.js')+rd('c_rvsec.js')+rd('c_gis.js')+rd('c_gis2.js')+rd('c_cmddata.js')+rd('c_cmdref.js')+rd('c_xfer.js')+rd('c_agent2.js')+rd('c_agent3.js')+rd('c_hubx.js')+rd('c_cde.js')+rd('c_mom.js')+rd('c_issues.js')+rd('c_regq.js')+rd('c_ifcview.js')+rd('c_pdfview.js')+rd('c_menus.js')+rd('c_bridge.js')+rd('c_ai.js')+rd('c_orb.js')+rd('freeai_data.js')+rd('freeai.js')+rd('c_nowplay.js')+rd('c_mission.js')+rd('c_agent4.js')+rd('c_icon.js')+rd('c_speed.js')+rd('c_mediamenu.js')+rd('c_prog_revit.js')+rd('c_prog_cad.js')+rd('c_prog_civil.js')+rd('c_prog_more.js')+rd('c_parity_cad.js')+rd('c_parity_rvt.js')+rd('c_parity_p6.js')+rd('c_mod_cxsx_cad_a.js')+rd('c_mod_cxsx_cad_b.js')+rd('c_mod_cxsx_sv_a.js')+rd('c_mod_cxsx_sv_b.js')+rd('c_chart.js')+rd('c_p2tog_office.js')+rd('c_p2tog_plant.js')+rd('c_p2tog_gis.js')+rd('c_px2_sched.js')+rd('c_px2_coord.js')+rd('c_rvx_core.js')+rd('c_rvx_arch.js')+rd('c_rvx_annot.js')+rd('c_rvx_views.js')+rd('c_rvx_data.js')+rd('c_gantt.js')+rd('c_i18n.js')+rd('c_occ.js')+rd('c_intro.js')+rd('c_adhan.js')+rd('c_hxassets_data.js')+rd('c_hxassets.js')+rd('c_hxassets_render.js')+rd('c_templates.js')+rd('c_outputs.js')+rd('c_lb_core.js')+rd('c_lb_cad.js')+rd('c_lb_rvsx.js')+rd('c_lb_px.js')+rd('c_lb_ox.js')+rd('c_idle2.js')+rd('c_nv_core.js')+rd('c_nv_tl.js')+rd('c_nv_clash.js')+rd('c_nv_view.js')+rd('c_qx_calc.js')+rd('c_qx_grid.js')+rd('c_qx_tools.js')+rd('c_qx_bi.js')+rd('c_link.js')+rd('c_link2.js')+rd('c_rc_core.js')+rd('c_rc_import.js')+rd('c_rc_terrain.js')+rd('c_rc_bld.js')+rd('c_rc_ui.js')+rd('sttlocal.js')+rd('vx.js')+rd('rs_core.js')+rd('rs_out.js')+rd('rs_ui.js')+rd('demo_stub.js')+rd('ph_core.js')+rd('ph_import.js')+rd('ph_ui.js')+rd('se_codes.js')+rd('se_loads.js')+rd('se_members.js')+rd('se_members2.js')+rd('se_api.js')+rd('se_ui.js')+rd('ps_data.js')+rd('ps_core.js')+rd('ps_ui.js')+rd('rcs_skel.js')+rd('rcs_rebar.js')+rd('qa_core.js')+rd('qa_wbs.js')+rd('qa_hold.js')+rd('qa_cash.js')+rd('qa_perm.js')+rd('qa_logi.js')+rd('qa_close.js')+rd('qa_ui.js')+rd('md_core.js')+rd('md_elec.js')+rd('md_plumb.js')+rd('md_lowc.js')+rd('md_fire.js')+rd('md_route.js')+rd('md_ui.js')+rd('gm_core.js')+rd('gm_ui.js')+rd('gm_catdata.js')+rd('gm_cat.js')+rd('c_demohold.js')+rd('c_ribfix.js')+rd('c_xdesc2.js')+rd('c_upd.js'))
s=between(s,'/* ====================== quantities ====================== */','/* ====================== language, sync, loop ====================== */',uiText)
s=s.replace("renderEdit([]); renderParts(); renderSaved(); const ng=","renderEdit([]); renderParts(); renderSaved(); renderBom(); renderSteps(); renderFams(); drawSheetPrev(); const ng=",1)
s=s.replace("refreshSec(); renderEdit([]); renderParts(); applyLang(); resize(); go(views[0]);","refreshSec(); renderEdit([]); renderParts(); renderBom(); renderSteps(); renderFams(); applyLang(); resize(); go(views[0]);",1)
s=s.replace("stepTween(now); controls.update(); updateSel();","siteFrame(dt); followFrame(dt); if(typeof measFrame==='function')measFrame(); if(typeof spFrame==='function')spFrame(); stepTween(now); controls.update(); updateSel();",1)
s=s.replace("applyLang(); resize(); go(views[0]);","applyLang(); resize(); go(views[0]); afterInit();",1)
s=s.replace("go(views[0]); afterInit();","go(views[0]); afterInit(); if(typeof xtoStart==='function')xtoStart();",1)
s=s.replace("window.__lsv={collect,","window.__lsv={ev:s=>{ if(localStorage.getItem('xto-test')!=='1')throw new Error('test hook is off'); return eval(s); },svgDraft,pdfDraft,dxfDraft,draftOps,getItems,buildSheet,xlsxBlob,sheetPdf,sheetSvg,sheetDxf,SEQ,collect,",1)
s=s.replace("<title>Lift Station 3D Model</title>","<title>Lift Station 3D Model</title>\n<!-- BVT-1 : BIM Viewer Template. Engine = scene, camera, sections, drafting, sheet composer, exports, data and families. Project = the four PROJECT BLOCKs (parameters, geometry, items and IFC mapping, part specs). See template/BVT-1/README.md -->",1)
s=s.replace("/* ====================== scene ====================== */","/* ########## BVT-1 ENGINE (reusable, do not edit per project) ########## */\n/* ====================== scene ====================== */",1)
s=s.replace("const BL=100.00, P0=","/* ########## PROJECT BLOCK 1/4: parameters and defaults (edit per project) ########## */\nconst BL=100.00, P0=",1)
s=s.replace("function buildModel(){","/* ########## PROJECT BLOCK 2/4: model geometry (edit per project) ########## */\nfunction buildModel(){",1)
s=s.replace("function baseItems(){","/* ########## PROJECT BLOCK 3/4: items, quantities, families, IFC mapping (edit per project) ########## */\nfunction baseItems(){",1)
s=s.replace("const PD=[['conc',","/* ########## PROJECT BLOCK 4/4: part specifications shown in the Parts tab (edit per project) ########## */\nconst PD=[['conc',",1)
s=s.replace('<div class="row lang"','<div class="row lang" title="Template BVT-1"',1)
a0="function resize(){if(!renderer)return; const w=host.clientWidth,h=host.clientHeight; renderer.setSize(w,h,false);"
assert a0 in s
s=s.replace(a0,"function resize(){if(!renderer)return; const w=host.clientWidth,h=host.clientHeight; if(!w||!h)return; /*perf: never resize the GL canvas to 0 (hidden host)*/ const key=w+'x'+h+'@'+(renderer.getPixelRatio?renderer.getPixelRatio():1); if(resize.k===key)return; resize.k=key; renderer.setSize(w,h,false);",1)
# perf: lazy WebGL context (chunk lazygl.js)
a="renderer=new T.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio||1,2)); renderer.localClippingEnabled=true; host.insertBefore"
assert s.count(a)==1
s=s.replace(a,"renderer=lazyGL(); host.insertBefore",1)
b="try{ if(softWanted())throw new Error('soft'); renderer=lazyGL();"
assert s.count(b)==1
s=s.replace(b,rd('lazygl.js')+"\n"+b,1)
s=s.replace("':'+e.lineno+')';}","':'+e.lineno+':'+e.colno+')'+((e.error&&e.error.stack)?' | '+String(e.error.stack).split('\\n').slice(1,4).map(function(x){return x.trim().replace(/^at /,'')}).join(' < '):'');}",1)
import os
demo_src='\n'.join(rd(f) for f in ['demo_core.js','demo_ch1.js']+[f for f in ['demo_ch2.js','demo_ch3.js','demo_voice.js'] if os.path.exists(SP+f)])
assert '</script' not in demo_src
_i=s.rindex('</body>'); s=s[:_i]+'<script type="text/plain" id="xDemoSrc">\n'+demo_src+'\n</script>'+s[_i:]  # lazy source: evaluated on first click, not at start
open(SP+'site/src/lift_station_3d.html','w',encoding='utf-8').write(s); print('assembled',len(s)//1024,'KB')
