// usage: node leakscan.js <index.test.html> <out.json> [sample]   -- scene + visible-text station-vocabulary scan per tab
const L=require('./lib.js'), fs=require('fs');
const VOC=/pump|lift station|sewage|sewer|manhole|wet well|\bwell\b|tank|storm|demo\b|sample project|LYR-|valve chamber|محطة|طلمبات|مضخ|صرف|خزان|عيّنة|تجريبي/i;
(async()=>{
 const {b,p,E,errs}=await L.open('file://'+process.argv[2],{init:process.argv[4]==='sample'});
 const res={};
 res.boot=JSON.parse(await E(`JSON.stringify({tpl:DATA.tpl||null,title:DR.title,root:root.children.length,parts:Object.keys(parts).length,siteG:siteG.children.length,spG:spG.visible,act:ACT.length,items:getItems().length,rvEls:RV.els.length,gml:GM.layers.length,issues:IS.list.length,mm:MM.mt.length})`));
 const types=JSON.parse(await E("JSON.stringify(Object.keys(WTYPES))"));
 for(const t of types){ try{ await E(`wtNew('${t}');1`); await p.waitForTimeout(2500);
   const txt=await p.evaluate(()=>{const o=[];document.querySelectorAll('body *').forEach(e=>{if(e.children.length===0&&e.offsetParent!==null){const s=(e.textContent||'').trim();if(s)o.push(s)}});return o});
   res[t]={nText:txt.length,hits:[...new Set(txt.filter(s=>VOC.test(s)).map(s=>s.slice(0,90)))].slice(0,25)}; }catch(e){res[t]='ERR '+e.message.slice(0,100);} }
 res.errs=errs; fs.writeFileSync(process.argv[3],JSON.stringify(res,null,1)); console.log('done',errs.length); await b.close();})();
