/* sttlocal.js - fully in-browser Arabic speech to text (Whisper via transformers.js + onnxruntime-web WASM). Prefix sl.
   Insert at the END of the chain (after c_ai.js / c_orb.js / c_agent*.js, before `window.__lsv=`). No edit to c_ai.js:
   adds AIS['local-browser'], wraps aiTranscribe (used by the REC button and the always-on listener only when AI.stt==='local-browser'),
   adds command stt_selftest, window.slTranscribe / slPreload / slSelfTest. Files come from vendor/stt/ next to index.html
   (transformers/ = library + ORT wasm, models/whisper-tiny|whisper-base = quantised ONNX). See sttlocal.md. */
const SL={dir:'vendor/stt/',dflt:'whisper-base',pipe:null,pm:'',loading:null,lm:'',bar:null,files:{},last:null,
  vocab:['خرسانة','مسلحة','أساسات','أعمدة','سقف','بلاطة','كمرة','كمرات','مواسير','صرف صحي','مياه','حريق','مناهل','منسوب','مقطع','قطاع','ميل','قطر','مليمتر','سنتيمتر','متر','فيلا','دور','غرف','خريطة','جدول زمني','نشاط','حفر','ردم','تسليح','شدة','عزل','تكييف','مجاري','محطة رفع','طلمبة','طلمبات','ريفيت','أوتوكاد','إكسل','بريمافيرا','نافيس ووركس','آي إف سي','ديه دبليو جي','مخطط','لوحة','مسقط','واجهة','تفاصيل','كميات','مقايسة']};
const slUrl=p=>new URL(SL.dir+p,document.baseURI).href;
const slName=()=>{ const m=String(AI.sttModel||''); return /tiny/i.test(m)?'whisper-tiny':/base/i.test(m)?'whisper-base':SL.dflt; };
/* progress bar shown while the model downloads / compiles (first use only; later starts come from the Cache API) */
function slBar(p,t){ if(!SL.bar){ SL.bar=document.createElement('div'); SL.bar.style.cssText='position:fixed;left:12px;bottom:12px;z-index:99999;background:#10151c;color:#e8eef5;border:1px solid #2c3a4a;border-radius:8px;padding:8px 12px;font:13px system-ui;min-width:230px;direction:rtl;display:none'; SL.bar.innerHTML='<div class=slt></div><div style="height:6px;background:#26313d;border-radius:3px;margin-top:6px"><div class=slp style="height:6px;width:0;background:#3fb27f;border-radius:3px"></div></div>'; document.body.appendChild(SL.bar); }
  if(p<0){ SL.bar.style.display='none'; return; } SL.bar.style.display='block'; SL.bar.firstChild.textContent=t||''; SL.bar.querySelector('.slp').style.width=Math.max(2,Math.min(100,p))+'%'; try{ orbStatus(t||''); }catch(e){} }
function slProg(e){ if(!e||!e.file)return; if(e.status==='progress'||e.status==='done'){ SL.files[e.file]=[e.status==='done'?(e.total||e.loaded||0):(e.loaded||0),e.total||e.loaded||0]; let l=0,t=0; for(const k in SL.files){ l+=SL.files[k][0]; t+=SL.files[k][1]; } if(t)slBar(l/t*100,b2('Downloading speech model ','تنزيل موديل الصوت ')+Math.round(l/1048576)+'/'+Math.round(t/1048576)+' MB'); } }
async function slLoad(name){ name=name||slName();
  if(SL.pipe&&SL.pm===name)return SL.pipe; if(SL.loading&&SL.lm===name)return SL.loading; SL.lm=name; SL.files={};
  return SL.loading=(async()=>{ const t0=performance.now(); slBar(1,b2('Loading speech engine…','تحميل محرك الصوت…'));
    try{ const T=await import(slUrl('transformers/transformers.min.js')), env=T.env;
      env.allowLocalModels=false; env.allowRemoteModels=true; env.useBrowserCache=true; env.remoteHost=slUrl('models/'); env.remotePathTemplate='{model}/';
      const w=env.backends.onnx.wasm; w.wasmPaths=slUrl('transformers/'); w.numThreads=crossOriginIsolated?Math.min(4,navigator.hardwareConcurrency||2):1; w.proxy=false;
      const p=await T.pipeline('automatic-speech-recognition',name,{dtype:'q8',device:'wasm',progress_callback:slProg});
      SL.pipe=p; SL.pm=name; SL.T=T; SL.loadMs=Math.round(performance.now()-t0); SL.threads=w.numThreads; slBar(-1); try{ orbStatus(''); }catch(e){} return p;
    }catch(e){ slBar(-1); SL.loading=null; throw new Error('local STT load failed: '+(e&&e.message||e)); } })(); }
const slPreload=()=>slLoad().then(()=>({ok:true,model:SL.pm,loadMs:SL.loadMs,threads:SL.threads}));
/* any audio (webm/opus blob, wav, ArrayBuffer) -> mono Float32 at 16 kHz */
async function slPcm(src){ if(src instanceof Float32Array)return src; const ab=src instanceof ArrayBuffer?src:await src.arrayBuffer(); const ac=new (window.AudioContext||window.webkitAudioContext)(); let d; try{ d=await ac.decodeAudioData(ab); }finally{ try{ ac.close(); }catch(e){} }
  const oc=new OfflineAudioContext(1,Math.max(1,Math.ceil(d.duration*16000)),16000), s=oc.createBufferSource(); s.buffer=d; s.connect(oc.destination); s.start(); return (await oc.startRendering()).getChannelData(0); }
/* simple voice activity cuts: 30 ms energy frames, adaptive threshold, speech runs merged over <300 ms gaps, packed up to 22 s,
   long runs cut at the quietest frame. Returns [[startSample,endSample],...] (silence-only audio -> []) */
function slSplit(x){ const F=480, n=Math.floor(x.length/F), e=new Float32Array(n); for(let i=0;i<n;i++){ let s=0; for(let j=i*F;j<i*F+F;j++)s+=x[j]*x[j]; e[i]=Math.sqrt(s/F); }
  if(n<8)return [[0,x.length]]; const so=Array.from(e).sort((a,b)=>a-b), th=Math.max(.004,so[Math.floor(n*.1)]*2.5,so[Math.floor(n*.95)]*.06), MAX=Math.floor(22000/30);
  let runs=[],a=-1,gap=0; for(let i=0;i<n;i++){ if(e[i]>th){ if(a<0)a=i; gap=0; } else if(a>=0&&++gap>=10){ runs.push([a,i-gap]); a=-1; gap=0; } } if(a>=0)runs.push([a,n-1-gap]);
  const seg=[]; let cur=null; for(const r of runs){ if(cur&&r[1]-cur[0]<=MAX)cur[1]=r[1]; else{ if(cur)seg.push(cur); cur=r.slice(); } } if(cur)seg.push(cur);
  const out=[]; const cut=s=>{ if(s[1]-s[0]<=MAX){ out.push(s); return; } let m=s[0]+Math.floor(MAX*.6); for(let i=m;i<s[0]+MAX;i++)if(e[i]<e[m])m=i; cut([s[0],m]); cut([m+1,s[1]]); };
  seg.forEach(cut); return out.filter(s=>s[1]-s[0]>=8).map(s=>[Math.max(0,(s[0]-6)*F),Math.min(x.length,(s[1]+7)*F)]); }
/* vocabulary hint: Whisper in transformers.js has no initial-prompt input, so fix single-letter slips (same length, one substituted
   letter, stem >= 5 letters, optional prefix ال/و/ب/ل/ف/ك kept) to the engineering word list. Deliberately conservative. */
const slN=s=>String(s).replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
function slHint(t){ const V=(SL.vocab||[]).filter(v=>v.indexOf(' ')<0&&slN(v).length>=5).map(v=>[v,slN(v)]); return String(t).split(/(\s+)/).map(w=>{ const n=slN(w), m=n.match(/^(ال|[وبلفك])?(.+)$/), pre=m[1]||'', st=m[2]; if(st.length<5||/[^\u0621-\u064A]/.test(st))return w; for(const [v,vn] of V){ if(vn===st)return w; if(vn.length===st.length){ let d=0; for(let i=0;i<st.length&&d<2;i++)if(st[i]!==vn[i])d++; if(d===1)return pre+v; } } return w; }).join(''); }
async function slTranscribe(src){ const t0=performance.now(), p=await slLoad(), x=await slPcm(src), segs=slSplit(x), parts=[]; SL.busy=true;
  try{ for(const [a,b] of segs){ const sec=(b-a)/16000, r=await p(x.subarray(a,b),{language:'arabic',task:'transcribe',max_new_tokens:Math.min(220,24+Math.ceil(sec*9))}); const t=String(r&&r.text||'').trim(); if(t)parts.push(t); } }finally{ SL.busy=false; }
  const raw=parts.join(' ').replace(/\s+/g,' ').trim(), text=slHint(raw); SL.last={model:SL.pm,audioSec:+(x.length/16000).toFixed(2),segments:segs.length,ms:Math.round(performance.now()-t0),threads:SL.threads,raw,text}; return text; }
/* register as an STT provider and take over aiTranscribe only when it is selected */
AIS['local-browser']=['Local in-browser Whisper (offline, no server)','Whisper محلي في المتصفح (بدون سيرفر)','local-browser','whisper-base'];
if(AI.stt==='local-browser'){ if(!AI.sttBase)AI.sttBase='local-browser'; if(!AI.sttModel)AI.sttModel='whisper-base'; }
{ const _t=aiTranscribe; aiTranscribe=async function(blob){ if(AI.stt!=='local-browser')return _t.apply(this,arguments); return slTranscribe(blob); }; }
/* stt_selftest: record 3 s from the microphone, report engine, time and text */
async function slSelfTest(){ let st; try{ st=await navigator.mediaDevices.getUserMedia({audio:true}); }catch(e){ const r={ok:false,error:'microphone: '+(e&&e.message||e)}; say2(r.error,'a'); return r; }
  const mr=new MediaRecorder(st), ch=[]; mr.ondataavailable=e=>{ if(e.data.size)ch.push(e.data); }; const stopped=new Promise(r=>mr.onstop=r); mr.start(); say2(b2('Recording 3 seconds… speak now','بسجل ٣ ثواني… اتكلم دلوقتي'),'a'); await new Promise(r=>setTimeout(r,3000)); mr.stop(); await stopped; st.getTracks().forEach(t=>t.stop());
  try{ const text=await slTranscribe(new Blob(ch,{type:mr.mimeType||'audio/webm'})), L=SL.last, r={ok:true,engine:'transformers.js '+L.model+' q8 wasm x'+L.threads,loadMs:SL.loadMs,ms:L.ms,audioSec:L.audioSec,text}; say2(b2('STT test: ','اختبار الصوت: ')+r.engine+' | '+r.ms+' ms | '+(text||'(nothing heard)'),'a'); console.log('stt_selftest',r); window.__sttSelfTest=r; return r; }
  catch(e){ const r={ok:false,error:String(e&&e.message||e)}; say2(r.error,'a'); window.__sttSelfTest=r; return r; } }
XCMD('stt_selftest','video','Speech-to-text self-test (3 s)','اختبار الكلام لنص (٣ ثواني)',()=>slSelfTest());
if(typeof XDESC!=='undefined')XDESC.stt_selftest=['Record 3 seconds from the microphone and report the local STT engine, time and text','سجّل ٣ ثواني من المايك وبلّغ بمحرك الصوت المحلي والوقت والنص'];
window.slTranscribe=slTranscribe; window.slPreload=slPreload; window.slSelfTest=slSelfTest; window.slSplit=slSplit; window.slPcm=slPcm;
