/* perf: the WebGL context is created on the first frame that really draws (3D view visible, login gone), not at start. Same renderer API, so the rest of the app is unchanged. If WebGL cannot be created it falls back to the software renderer once, by reload (xto-soft). */
function lazyGL(){
 const cv=document.createElement('canvas'); cv.style.display='block';
 let real=null, loop=null, raf=0, pr=Math.min(devicePixelRatio||1,2), sz=null, rt=false, dead=false; const pend={}, shadow={enabled:false};
 const mk=()=>{ if(real||dead)return real;
  try{ real=new T.WebGLRenderer({antialias:true,canvas:cv}); }catch(e){ dead=true; try{ localStorage.setItem('xto-soft','1'); if(!sessionStorage.getItem('xto-glfb')){ sessionStorage.setItem('xto-glfb','1'); location.reload(); } }catch(x){} return null; }
  real.setPixelRatio(pr); real.localClippingEnabled=true; Object.assign(real.shadowMap,shadow); for(const k in pend)real[k]=pend[k]; if(sz)real.setSize(sz[0],sz[1],false); return real; };
 const tick=t=>{ if(!loop){ raf=0; return; } loop(t); raf=requestAnimationFrame(tick); };
 const own={domElement:cv,
  getPixelRatio:()=>real?real.getPixelRatio():pr,
  setPixelRatio:v=>{ pr=v; if(real)real.setPixelRatio(v); },
  setSize:(w,h,u)=>{ sz=[w,h]; if(real)real.setSize(w,h,u); },
  setAnimationLoop:f=>{ loop=f; if(f&&!raf)raf=requestAnimationFrame(tick); else if(!f&&raf){ cancelAnimationFrame(raf); raf=0; } },
  setRenderTarget:(t,...a)=>{ if(!t&&!real){ rt=false; return; } rt=!!t; const r=mk(); if(r)r.setRenderTarget(t,...a); },
  render:(s,c)=>{ if(!real&&!rt&&!cv.clientWidth)return; const r=mk(); if(r)r.render(s,c); }};
 return new Proxy(own,{
  get(o,k){ if(k in o)return o[k]; if(k==='isSoft')return undefined; if(k==='shadowMap'&&!real)return shadow; const r=mk(); if(!r)return undefined; const v=r[k]; return typeof v==='function'?v.bind(r):v; },
  set(o,k,v){ if(real)real[k]=v; else pend[k]=v; return true; },
  has(o,k){ return k in o||(real?k in real:true); }});
}
