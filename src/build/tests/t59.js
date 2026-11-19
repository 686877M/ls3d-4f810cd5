const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:process.argv[2],args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1500,height:900}}); await ctx.addInitScript(()=>{try{sessionStorage.setItem('xto-auth','1');localStorage.setItem('xto-test','1');sessionStorage.setItem('xto-splash','1');}catch(e){}}); const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',x=>er.push(x.message)); pg.on('console',m=>{if(m.type()==='error')er.push('C:'+m.text().slice(0,150));});
const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
await pg.goto('file:///tmp/ls_index.html'); await pg.waitForTimeout(5000); await E("wtSwitch(WTAB.tabs[1].id)"); await pg.waitForTimeout(900);
await E("tlRender()"); await pg.waitForTimeout(500);
const row=await pg.$('#tlw tr[data-id]'); console.log('row?',!!row);
if(row){ await row.click({button:'right'}); await pg.waitForTimeout(400); console.log('menu items',await E("[...document.querySelectorAll('.xmenu .xm')].map(x=>x.textContent).join(' | ')")); await pg.screenshot({path:'/tmp/ctx1.png'}); await pg.keyboard.press('Escape'); await pg.mouse.click(5,5); }
await E("dcAdd({type:'RFI',dir:'out',subject:'T'}); dcOpen('reg')"); await pg.waitForTimeout(500);
const dr=await pg.$('#dcBox tr.cl'); if(dr){ await dr.click({button:'right'}); await pg.waitForTimeout(300); console.log('doc menu',await E("[...document.querySelectorAll('.xmenu .xm')].map(x=>x.textContent).join(' | ')")); await pg.mouse.click(5,5); }
await pg.click('#xDocTabs .dt >> nth=1',{button:'right'}); await pg.waitForTimeout(300); console.log('tab menu',await E("[...document.querySelectorAll('.xmenu .xm')].map(x=>x.textContent).join(' | ')"));
console.log('tipFill',await E("(()=>{ const its=itemsOfPart(Object.keys(parts)[0],0); tipFill(its,Object.keys(parts)[0],0,1); return tip.innerText.slice(0,160); })()"));
console.log('ERR',er.slice(0,5)); await b.close();})();
