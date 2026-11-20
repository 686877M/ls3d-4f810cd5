/* ====== Speed: the 3D loop does not render while something covers it (login, splash, intro, idle screen, hidden tab) and drops to about 20 fps when nobody touches the page and nothing is playing. Full speed again on the first touch. ====== */
const SPD={last:0,input:Date.now()};
['pointerdown','pointermove','wheel','keydown','touchstart'].forEach(e=>addEventListener(e,()=>{ SPD.input=Date.now(); },{passive:true,capture:true}));
const spdCovered=()=>document.hidden||!!(document.getElementById('xLogin')||document.getElementById('xIntro')||document.getElementById('xIdle')||document.getElementById('xSplash'));
{ const _f=frame; frame=function(now){ if(spdCovered())return; const busy=A.playing||(typeof PLAYING!=='undefined'&&PLAYING)||(typeof XREC!=='undefined'&&XREC)||Date.now()-SPD.input<2500||(typeof tw!=='undefined'&&tw); if(!busy&&now-SPD.last<48)return; SPD.last=now; return _f.apply(this,arguments); }; try{ renderer.setAnimationLoop(frame); }catch(e){} }
