// Prints every caption line of the guided demo as JSON: [{ch,op,en,ar}].
// usage: node extract_captions.js <dir with demo_ch*.js>
// Runs the chapter files against a catch-all stub (nothing in them executes at load except S.add(...)), so the
// extraction follows whatever the demo session writes, with no regex on the script text.
const fs=require('fs'), path=require('path');
const dir=process.argv[2]||'.';
const files=fs.readdirSync(dir).filter(f=>/^demo_ch\d+\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(7))-parseInt(b.slice(7)));
const chapters=[];
const DEMO={B:(en,ar)=>ar, L:()=>1, add(c){ chapters.push(c); }, ops:{}, api:{}, h(){ return stub; }};
const stub=new Proxy(function(){}, {get:(t,k)=>k===Symbol.toPrimitive?()=>'':k==='then'?undefined:stub, apply:()=>stub, construct:()=>stub, has:()=>true, set:()=>true});
const scope=new Proxy({}, {
  has:(t,k)=>k!=='DEMO'&&k!=='globalThis'&&typeof k==='string',
  get:(t,k)=>k===Symbol.unscopables?undefined:(k in globalThis?globalThis[k]:stub),
  set:()=>true });
for(const f of files){
  const src=fs.readFileSync(path.join(dir,f),'utf8');
  try{ new Function('DEMO','__s','with(__s){'+src+'\n}')(DEMO,scope); }catch(e){ console.error('extract: '+f+': '+e.message); process.exit(2); }
}
const out=[];
chapters.forEach((c,ci)=>{
  const id=c.id||('ch'+ci);
  (c.steps||[]).forEach(st=>{ if(st&&(st.op==='say'||st.op==='cap')&&typeof st.ar==='string'&&st.ar.trim()) out.push({ch:id,op:st.op,en:st.en||'',ar:st.ar}); });
});
process.stdout.write(JSON.stringify(out));
