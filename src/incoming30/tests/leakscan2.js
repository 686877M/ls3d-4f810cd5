// usage: node leakscan2.js <index.test.html> <out.json> <templateId|default>  -- station vocabulary scan: scene, overlays, every pane, every tab type
const L=require('./lib.js'), fs=require('fs');
const VOC=/pump|lift station|sewage|sewer|manhole|wet well|\bwell\b|\btanks?\b|storm|outlet chamber|valve chamber|odou?r|jib crane|penstock|screen basket|محطة|طلمبات|مضخ|صرف|خزان|بئر|محابس|غرفة المخرج|عيّنة|تجريبي|Sample project|LYR-/i;
(async()=>{
 const {b,p,E,errs}=await L.open('file://'+process.argv[2],{wait:7000}); const id=process.argv[4]; const res={};
 await E("lang='en';1");
 if(id!=='default'){ await E("tpNew('"+id+"',{download:false});1"); await p.waitForTimeout(3000); }
 res.state=JSON.parse(await E(`JSON.stringify({tpl:DATA.tpl||null,title:DR.title,root:root.children.length,parts:Object.keys(parts).length,siteVis:siteG.children.filter(c=>c.visible).length,spOn:SP.on,spG:spG.visible,spLab:spLab.children.length,act:ACT.length,items:getItems().length,cap:cap.textContent})`));
 const scan=async()=>p.evaluate(()=>{const o=[];document.querySelectorAll('body *').forEach(e=>{if(e.children.length===0&&e.offsetParent!==null){const s=(e.textContent||'').trim();if(s)o.push(s)}});return o});
 const hit=a=>[...new Set(a.filter(s=>VOC.test(s)).map(s=>s.slice(0,80)))].slice(0,15);
 res.panes={}; const tabs=JSON.parse(await E("JSON.stringify(TABS)"));
 for(const k of tabs){ try{ await E("tab('"+k+"');1"); await p.waitForTimeout(500);
   const t=await p.evaluate(k=>{const e=document.getElementById('p-'+k);return e?e.innerText.split('\n').map(s=>s.trim()).filter(Boolean):[]},k); const h=hit(t); if(h.length)res.panes[k]=h; }catch(e){res.panes[k]='ERR '+e.message.slice(0,60);} }
 res.tabTypes={}; const types=JSON.parse(await E("JSON.stringify(Object.keys(WTYPES))"));
 for(const t of types){ try{ await E("wtNew('"+t+"');1"); await p.waitForTimeout(1800); const h=hit(await scan()); if(h.length)res.tabTypes[t]=h; }catch(e){res.tabTypes[t]='ERR '+e.message.slice(0,60);} }
 res.errs=errs; fs.writeFileSync(process.argv[3],JSON.stringify(res,null,1)); console.log('done',id,'errs',errs.length); await b.close();})();
