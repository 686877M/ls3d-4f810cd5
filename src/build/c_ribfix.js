/* c_ribfix.js - ribbon layout: the "Commands reference" button and the "Working x of y" counter sat (sticky) on top of the
   ribbon groups and hid icons; the ribbon could grow and cover the document tabs. Now: both live at the end of the ribbon
   TAB row, the groups row has a fixed height and scrolls sideways instead of wrapping or growing. */
(function(){
 const st=document.createElement('style'); st.id='xRibFixCss';
 st.textContent='#xTabs{display:flex;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}#xTabs::-webkit-scrollbar{display:none}'+
  '#xTabs>button{flex:none}#xRib{flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;max-height:var(--ribh,64px);scrollbar-width:thin}'+
  '#xRib>.xg{flex:none}#xTabs #xRibRef,#xTabs #xRibCount{position:static!important;align-self:center!important;flex:none}'+
  '#xTabs #xRibCount{margin-inline-start:auto!important;padding:0 8px}#xTabs #xRibRef{margin-inline-start:6px!important;margin-inline-end:6px}'+
  '@media (max-width:1180px){#xTabs #xRibCount{display:none}}';
 document.head.appendChild(st);
 const fix=()=>{ try{ const t=document.getElementById('xTabs'); if(!t)return; const c=document.getElementById('xRibCount'), r=document.getElementById('xRibRef'); if(c&&c.parentNode!==t)t.appendChild(c); if(r&&r.parentNode!==t)t.appendChild(r); }catch(e){} };
 if(typeof xRibbon==='function'){ const o=xRibbon; xRibbon=function(){ const v=o.apply(this,arguments); fix(); return v; }; }
 setTimeout(fix,0);
})();
