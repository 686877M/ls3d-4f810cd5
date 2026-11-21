/* node loader for the se_ engine chunks (tests only): concatenates the chunk files and returns every top-level const/function as an object */
const fs=require('fs'),path=require('path');
module.exports=function(files){ const dir=__dirname; files=files||['se_codes.js','se_loads.js','se_members.js','se_members2.js','se_api.js']; let src=''; files.forEach(f=>{ if(fs.existsSync(path.join(dir,f)))src+=fs.readFileSync(path.join(dir,f),'utf8')+'\n'; });
 const names=[]; src.replace(/^(?:const|let|function)\s+([A-Za-z_$][\w$]*)/gm,(m,n)=>{ names.push(n); }); const stubs='const TOXAPI={}; const XDESC={}; const XCMD=()=>{}; ';
 return new Function(stubs+src+'\nreturn {'+names.filter(n=>/^se|^SE_/i.test(n)).join(',')+'};')(); };
