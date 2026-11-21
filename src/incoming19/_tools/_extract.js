const fs=require('fs'),path=require('path');
const S=process.argv[2];
const files=fs.readdirSync(S).filter(f=>/^c_.*\.js$|^rs_.*\.js$|^vx\.js$/.test(f));
const src={};files.forEach(f=>src[f]=fs.readFileSync(path.join(S,f),'utf8'));
// XCMD ids (literal)
const ids={};
for(const f of files){const re=/XCMD\(\s*['"]([A-Za-z0-9_:.\-]+)['"]/g;let m;while((m=re.exec(src[f])))(ids[m[1]]=ids[m[1]]||[]).push(f);}
// progReg
const prog={};
for(const f of files){const s=src[f];let i=0;while((i=s.indexOf('progReg(',i))>=0){const st=i+8;let q=s.indexOf(',',st);const type=s.slice(st,q).replace(/['"\s]/g,'');let a=s.indexOf('[',q),d=0,j=a,inS=null;for(;j<s.length;j++){const c=s[j];if(inS){if(c==='\\')j++;else if(c===inS)inS=null;continue;}if(c==="'"||c==='"'||c==='`'){inS=c;continue;}if(c==='[')d++;else if(c===']'){d--;if(d===0)break;}}
 try{const arr=eval(s.slice(a,j+1));(prog[type]=prog[type]||[]).push({f,arr});}catch(e){console.error('fail',f,type,e.message);}
 i=j;}}
fs.writeFileSync(process.argv[3],JSON.stringify({ids,prog},null,0));
console.log(Object.keys(ids).length,'ids; prog types',Object.keys(prog));
