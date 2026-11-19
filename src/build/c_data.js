/* ====================== project data: costs, brands, families (BIM 5D style) ====================== */
const STORE_KEY='lsv3-data';
let DATA={items:{},fams:{},cur:'SAR'};
try{const sj=localStorage.getItem(STORE_KEY); if(sj){const j=JSON.parse(sj); if(j.data)DATA=Object.assign(DATA,j.data); if(j.P)Object.assign(P,j.P);}}catch(e){}
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify({data:DATA,P}));}catch(e){}}
function applyData(x){const o=DATA.items[x.code]||{}, F=DATA.fams[o.fam||x.fam]||null; const fam=o.fam||x.fam, typ=o.typ||x.typ, ft=(F&&F.types&&F.types[typ])||{};
 x.fam=fam; x.typ=typ; if(F){x.cat=F.cat||x.cat; x.ifc=F.ifc||x.ifc;} x.brand=o.brand||ft.manufacturer||''; x.model=o.model||ft.model||''; x.supplier=o.supplier||''; x.mark=o.mark||x.code; x.lod=o.lod||'300'; x.phase=o.phase||''; x.notes=o.notes||'';
 const uc=(o.cost!==undefined&&o.cost!=='')?+o.cost:((ft.cost!==undefined&&ft.cost!=='')?+ft.cost:0); x.cost=isFinite(uc)?uc:0; x.total=+(x.cost*x.qty).toFixed(2); x.params=Object.assign({},ft.params||{},o.params||{}); return x;}
function getItems(){return baseItems().map(applyData);}
function syncFams(){baseItems().forEach(x=>{if(x.fam==='—')return; const f=DATA.fams[x.fam]=DATA.fams[x.fam]||{cat:x.cat,ifc:x.ifc,types:{}}; if(!f.types[x.typ])f.types[x.typ]={manufacturer:'',model:'',cost:'',description:x.n[0],params:{}};});}
const PART_ITEMS=(()=>{const m={}; for(const c in ITEM_PARTS)ITEM_PARTS[c].forEach(pid=>(m[pid]=m[pid]||[]).push(c)); return m;})();
function itemsOfPart(pid,idx){const codes=(PART_ITEMS[pid]||[]).filter(c=>pid!=='covers'||(idx===0?c==='M23':c==='M24')); const all=getItems(); return codes.map(c=>all.find(x=>x.code===c)).filter(Boolean);}
function notesReg(){const R=[], it=getItems(); it.filter(x=>x.st==='assumed').forEach(x=>R.push([tr('nr_assumed'),x.code+' '+x.n[lang==='ar'?1:0]+': '+x.lines[0][lang==='ar'?1:0]]));
 R.push([tr('nr_conflict'),b2('Pump capacity: 8 L/S on sheet 01 and 7 L/S in the table.','سعة المضخة: 8 L/S في الشيت 01 و7 L/S في الجدول.')],[tr('nr_tbd'),b2('Electrical specifications (control board, cables, starters) are not supplied yet.','المواصفات الكهربائية (لوحة التحكم والكابلات والبادئات) لسه ما اتوردتش.')],[tr('nr_tbd'),b2('Pipe lengths beyond the model, valve bodies, ladder length, floor/top slab thickness.','أطوال المواسير بره الموديل وأجسام المحابس وطول السلم وسمك الأرضية والتوب.')],[tr('nr_crane'),b2('"Crane 2000 Kg" printed on the sheets belongs to the building plan in the background. The station crane is the 1 t jib crane.','"Crane 2000 Kg" المكتوب في الشيتات تابع لمسقط المبنى في الخلفية. ونش المحطة هو ونش الجرب 1 طن.')]);
 it.filter(x=>x.notes).forEach(x=>R.push([tr('nr_user'),x.code+' '+x.n[lang==='ar'?1:0]+': '+x.notes])); ['lim1','lim2','lim3','lim4','lim5'].forEach(k=>R.push([tr('nr_limit'),tr(k)])); return R;}
function projectJson(){return JSON.stringify({template:'BVT-1',project:DR.title,exported:'2026-11-19',P,DR,SH:{paper:SH.paper,theme:SH.theme,layout:SH.layout,notes:SH.notes,legend:SH.legend,callouts:SH.callouts},data:DATA},null,1);}
function loadProject(txt){const j=JSON.parse(txt); if(j.P)Object.assign(P,j.P); if(j.DR)Object.assign(DR,j.DR); if(j.SH)Object.assign(SH,j.SH); if(j.data)DATA=Object.assign({items:{},fams:{},cur:'SAR'},j.data); persist();}
