/* c_demohold.js - TEMPORARY: the published guided demo (old version) saves its house project over the user's project.
   Until the rebuilt demo (clean exit, never saved) is merged, the demo buttons only show a notice. Remove this chunk then. */
demoStart=function(){ try{ const d=document.createElement('div'); d.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;background:#1b1714;color:#e8dcc8;border:1px solid #e0643a;border-radius:10px;padding:12px 18px;font:14px "Segoe UI",system-ui,sans-serif;max-width:560px;text-align:center;box-shadow:0 6px 24px #0008';
 d.textContent=b2('The guided demo is being rebuilt (it will run on its own temporary project and never change yours). It will be back soon.','العرض الموجّه بيتعاد بناؤه (هيشتغل على مشروع مؤقت لوحده ومش هيغيّر مشروعك). هيرجع قريب.');
 document.body.appendChild(d); setTimeout(()=>d.remove(),6000); }catch(e){} };
