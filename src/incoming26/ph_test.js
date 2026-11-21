/* Photos to 3D page test. The page talks to the REAL (patched) bridge, which talks to a FAKE docker and a FAKE NodeODM: no Docker, no real job.
   Run: NODE_PATH=<dir with playwright-core> nice -n 15 node ph_test.js <index.test.html> [chrome path]   (needs python3; starts and stops its own bridge on 38767 / 33007) */
const {chromium}=require('playwright-core'), fs=require('fs'), os=require('os'), path=require('path'), cp=require('child_process');
const PAGE=process.argv[2], CHROME=process.argv[3]||process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', HERE=__dirname;
const BP=38767, OP=33007, TOK='tok-ph-page', ST=fs.mkdtempSync(path.join(os.tmpdir(),'phst_')), FX=path.join(ST,'fx');
cp.execFileSync('python3',[path.join(HERE,'ph_fixtures.py'),FX]);
const br=cp.spawn('python3',[path.join(HERE,'tox_bridge.py'),'--http-only'],{env:Object.assign({},process.env,{TOX_PORT:BP,TOX_TOKEN:TOK,TOX_ODM_PORT:OP,TOX_DOCKER:path.join(HERE,'fake_docker.py'),FAKE_DOCKER_STATE:ST,FAKE_PULL_DELAY:'1.0',TOX_INBOX:path.join(ST,'inbox.jsonl')}),stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let pass=0,fail=0; const R=[]; const ok=(n,c,d)=>{ c?pass++:fail++; console.log((c?'PASS ':'FAIL ')+n+(c?'':'   -> '+d)); };
const jget=async u=>{ const r=await fetch(u); return r.json(); };
(async()=>{ for(let i=0;i<50;i++){ try{ await fetch('http://127.0.0.1:'+BP+'/ping'); break; }catch(e){ await sleep(200); } }
 const b=await chromium.launch({executablePath:CHROME}); const ctx=await b.newContext({viewport:{width:1500,height:900}});
 await ctx.addInitScript(()=>{ try{ ['xto-tabs','xto-rc','xto-gis'].forEach(k=>localStorage.removeItem(k)); sessionStorage.setItem('xto-auth','1'); sessionStorage.setItem('xto-intro-seen','1'); sessionStorage.setItem('xto-hub','1'); localStorage.setItem('xto-test','1'); }catch(e){} });
 const pg=await ctx.newPage(), er=[], hosts=new Set(), photoReq=[]; pg.on('request',q=>{ const u=new URL(q.url()); if(/^\/photo\//.test(u.pathname))photoReq.push(u); }); pg.on('pageerror',x=>er.push(x.message)); pg.on('dialog',d=>d.accept());
 await pg.route(/^https?:\/\//,r=>{ const u=new URL(r.request().url()); hosts.add(u.host); if(u.host==='127.0.0.1:'+BP||u.host==='127.0.0.1:'+OP)return r.continue(); return r.abort(); });
 const E=s=>pg.evaluate(s=>__lsv.ev(s),s);
 await pg.goto('file://'+PAGE,{waitUntil:'domcontentloaded',timeout:120000}); await pg.waitForTimeout(5000);
 /* ---- tab, pane, commands ---- */
 await E("lang='en'; wtNew('capture')"); await pg.waitForTimeout(1200);
 ok('pane:rcphoto is registered and in the default capture layout',await E("!!WX.defs['pane:rcphoto']&&!!WL.capture['pane:rcphoto']"));
 ok('Photos to 3D pane is on screen in the F.X tab',await E("PH.box.isConnected&&/Photos to 3D/.test(PH.box.textContent)"));
 ok('old panes still there (map, mission, data)',await E("RCB.mis.isConnected&&RCB.dat.isConnected&&!!GM.cv&&GM.cv.isConnected"));
 ok('ribbon: capture ribbon fully wired, Photos to 3D group added to the Data tab',await E("RIBP.capture.built===RIBP.capture.tot&&RIBP.capture.tabs.find(t=>t[0]==='data')[2][0][0][0]==='Photos to 3D'&&RIBP.capture.tabs.find(t=>t[0]==='data')[2][0][1].every(id=>!!XC[id]&&!XC[id].stub)"));
 ok('every new command has an XDESC hover text (EN + AR) and a ribbon record',await E("['rc_photo3d','rc_ph_pick','rc_ph_start','rc_ph_run','rc_ph_import','rc_ph_clean'].every(id=>XDESC[id]&&XDESC[id][0].length>20&&/[\\u0600-\\u06FF]/.test(XDESC[id][1])&&RIBM[id]&&RIBM[id].panel==='Photos to 3D')"));
 ok('every button in the pane has a hover text',await E("[...PH.box.querySelectorAll('button')].length>8&&[...PH.box.querySelectorAll('button')].every(x=>x.title&&x.title.length>10)"),await E("[...PH.box.querySelectorAll('button')].filter(x=>!x.title).map(x=>x.textContent).join()"));
 ok('honest limits are on the pane: hours, no GPU, 20+ photos, AGPL, nothing leaves',await E("/hours/.test(PH.box.textContent)&&/no GPU/.test(PH.box.textContent)&&/20\\+ photos/.test(PH.box.textContent)&&/AGPL-3\\.0/.test(PH.box.textContent)&&/never leave this computer/.test(PH.box.textContent)"));
 ok('old shared test: window.TOX tools untouched',await E("['plan_mission','import_survey_file','make_contours','compute_cut_fill','accuracy_report','export_mission'].every(k=>typeof window.TOX[k]==='function')"));
 ok('phrase: "photos to 3d" opens the pane and answers',await E("xaPre('convert photos to 3d')")===true);
 ok('phrase (Arabic): حول الصور الى 3d',await E("xaPre('تحويل الصور الى 3d')")===true);
 /* ---- no bridge yet ---- */
 await E("BR.token=''; 0"); let e1=await E("phStatus().then(()=>PH.err)"); ok('no bridge token: clear message, no request sent',/Connect the local bridge/.test(e1),e1);
 /* ---- connect, engine ---- */
 await E("BR.url='http://127.0.0.1:"+BP+"'; BR.token='"+TOK+"'; PH.pollMs=400; 0");
 let s=await E("phStatus()"); ok('status from bridge: docker up, no image, stopped',s.phase==='stopped'&&s.daemon&&!s.image&&s.host.cpus===8,JSON.stringify(s).slice(0,200));
 ok('pane shows the stopped state and the pull warning',await E("PH.top.querySelector('[data-ph-status]').dataset.phStatus==='stopped'&&/not downloaded yet/.test(PH.top.textContent)"));
 await E("PH.memory='10'; PH.cpus='4'; phStart()"); const seen=[]; for(let i=0;i<60;i++){ const x=await E("phStatus().then(s=>({p:s.phase,d:s.pull.done,dl:s.pull.dl,n:s.pull.seen,t:PH.top.textContent.slice(0,2000)}))"); seen.push(x); if(x.p==='running')break; await sleep(250); }
 ok('pull progress shown while pulling (phase pulling, layers done < seen)',seen.some(x=>x.p==='pulling'&&x.n>0&&(x.dl+x.d)<2*x.n)&&seen.some(x=>x.p==='pulling'&&/image layers/.test(x.t)),JSON.stringify(seen.slice(0,3)));
 ok('NodeODM running after start',seen[seen.length-1].p==='running');
 const ra=fs.readFileSync(path.join(ST,'run_args.txt'),'utf8'); ok('docker run: 127.0.0.1 only, memory 10g, cpus 4, named',/-p 127\.0\.0\.1:33007:3000/.test(ra)&&/--memory 10g/.test(ra)&&/--cpus 4\.0/.test(ra)&&/--name tox-nodeodm/.test(ra),ra);
 /* ---- photos: build JPEGs with EXIF GPS in the page ---- */
 /* simpler EXIF builder (replaces the draft above) */
 await E(`window.__exif=function(o){ const B=[]; const w16=v=>B.push((v>>8)&255,v&255), w32=v=>B.push((v>>>24)&255,(v>>16)&255,(v>>8)&255,v&255); const rat=a=>{ const d=Math.floor(a), m=Math.floor((a-d)*60), s=Math.round(((a-d)*60-m)*60*1000); return [[d,1],[m,1],[s,1000]]; };
   const hasG=o.lat!=null; const n0=1+(hasG?1:0); const ifd0=8, exifAt=ifd0+2+12*n0+4, gpsAt=exifAt+2+12*2+4, dat=gpsAt+(hasG?2+12*6+4:0);
   B.push(0x4D,0x4D,0,0x2A); w32(8); w16(n0); w16(0x8769); w16(4); w32(1); w32(exifAt); if(hasG){ w16(0x8825); w16(4); w32(1); w32(gpsAt); } w32(0);
   w16(2); w16(0xA002); w16(4); w32(1); w32(o.w); w16(0xA003); w16(4); w32(1); w32(o.h); w32(0);
   if(hasG){ const lr=rat(Math.abs(o.lat)), nr=rat(Math.abs(o.lon)); w16(6); w16(1); w16(2); w32(2); B.push(o.lat<0?83:78,0,0,0); w16(2); w16(5); w32(3); w32(dat); w16(3); w16(2); w32(2); B.push(o.lon<0?87:69,0,0,0); w16(4); w16(5); w32(3); w32(dat+24); w16(5); w16(1); w32(1); B.push(0,0,0,0); w16(6); w16(5); w32(1); w32(dat+48); w32(0);
    lr.forEach(r=>{ w32(r[0]); w32(r[1]); }); nr.forEach(r=>{ w32(r[0]); w32(r[1]); }); w32(Math.round(o.alt*100)); w32(100); }
   const t=new Uint8Array(B), seg=new Uint8Array(4+6+t.length); seg.set([0xFF,0xE1,((6+t.length+2)>>8)&255,(6+t.length+2)&255,0x45,0x78,0x69,0x66,0,0],0); seg.set(t,10); return seg; }; 0`);
 await E(`window.__mk=async function(n,o){ o=o||{}; const out=[]; for(let i=0;i<n;i++){ const c=document.createElement('canvas'); c.width=640; c.height=480; const x=c.getContext('2d'); let sd=i*7919+13; const rnd=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff; }; for(let k=0;k<900;k++){ x.fillStyle='rgb('+(rnd()*255|0)+','+(rnd()*255|0)+','+(rnd()*255|0)+')'; x.fillRect(rnd()*640,rnd()*480,8+rnd()*20,8+rnd()*20); }
   let cv=c; if(o.blur&&o.blur.includes(i)){ cv=document.createElement('canvas'); cv.width=640; cv.height=480; const y=cv.getContext('2d'); y.filter='blur(9px)'; y.drawImage(c,0,0); }
   const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.9)), u=new Uint8Array(await blob.arrayBuffer()), g=!(o.nogps&&o.nogps.includes(i)), ex=window.__exif({w:640,h:480,lat:g?30+Math.floor(i/6)*0.0002:null,lon:31+(i%6)*0.0002,alt:80+i*0.5}); const j=new Uint8Array(u.length+ex.length); j.set(u.subarray(0,2),0); j.set(ex,2); j.set(u.subarray(2),2+ex.length);
   out.push(new File([j],'IMG_'+String(i+1).padStart(4,'0')+'.JPG',{type:'image/jpeg'})); } window.__files=out; return out.length; }; 0`);
 ok('built 24 test JPEGs',await E("window.__mk(24,{nogps:[3,4],blur:[10,11]})")===24);
 let sc=await E("phSetFiles(window.__files).then(x=>({n:x.n,jpg:x.jpg,gps:x.gps,noGps:x.noGps,alt:x.alt,ext:x.ext,mp:x.mp,blur:x.blur,checks:x.checks.map(c=>c.lv+': '+c.t)}))");
 ok('scan: 24 photos, 22 with GPS, 2 without (IMG_0004, IMG_0005)',sc.n===24&&sc.gps===22&&sc.noGps.join()==='IMG_0004.JPG,IMG_0005.JPG',JSON.stringify(sc).slice(0,300));
 ok('EXIF altitude read: min 80 (photo 1), max 91.5 (photo 24) from the 22 with GPS',sc.alt&&Math.abs(sc.alt.min-80)<1e-6&&Math.abs(sc.alt.max-91.5)<1e-6,JSON.stringify(sc.alt));
 ok('extent about 5 x 0.0006 degrees = ~96 m x ~66 m',sc.ext&&Math.abs(sc.ext[0]-5*0.0002*111320*Math.cos(30*Math.PI/180))<2&&sc.ext[1]>55&&sc.ext[1]<70,JSON.stringify(sc.ext));
 ok('blur check flags the two blurred photos (IMG_0011, IMG_0012) and no sharp ones',sc.blur.join()==='IMG_0011.JPG,IMG_0012.JPG',JSON.stringify(sc.blur));
 ok('checks: ok count line, warn about 2 without GPS, warn about blur',sc.checks.some(c=>/^ok: 24 photos/.test(c))&&sc.checks.some(c=>/^warn: 2 of 24 JPEGs have no GPS/.test(c))&&sc.checks.some(c=>/^warn: 2 of 24 checked photos look blurry/.test(c)),sc.checks.join(' | '));
 ok('summary and coloured check lines drawn in the pane',await E("/24 photos/.test(PH.top.querySelector('#phSummary').textContent)&&PH.top.querySelectorAll('[data-ph-check=warn]').length===2&&PH.top.querySelectorAll('[data-ph-check=ok]').length===1"));
 sc=await E("(async()=>{ await window.__mk(5); const x=await phSetFiles(window.__files); return x.checks.map(c=>c.lv+': '+c.t); })()"); ok('5 photos: refused as not enough (bad level, mentions 20 and overlap 70 / 60)',sc.some(c=>/^bad: Only 5 photos/.test(c)&&/20/.test(c)&&/70 % front and 60 % side/.test(c)),sc.join('|'));
 sc=await E("(async()=>{ await window.__mk(14); const x=await phSetFiles(window.__files); return x.checks.map(c=>c.lv+': '+c.t); })()"); ok('14 photos: warning (minimum is about 20)',sc.some(c=>/^warn: 14 photos/.test(c)),sc.join('|'));
 sc=await E("(async()=>{ await window.__mk(24,{nogps:Array.from({length:24},(_,i)=>i)}); const x=await phSetFiles(window.__files); return x.checks.map(c=>c.lv+': '+c.t); })()"); ok('no GPS at all: warning about arbitrary scale, GCP suggested',sc.some(c=>/^warn: No photo has GPS/.test(c)&&/gcp_list/.test(c)),sc.join('|'));
 await E("window.__mk(24,{nogps:[3,4],blur:[10,11]})"); await E("phSetFiles(window.__files)");
 /* drag and drop path */
 ok('drag and drop of files onto the drop zone fills the list',await E("(async()=>{ PH.files=[]; PH.scan=null; const dz=PH.top.querySelector('#phDrop'), dt=new DataTransfer(); window.__files.slice(0,9).forEach(f=>dt.items.add(f)); dz.dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true})); for(let i=0;i<40&&!PH.scan;i++)await new Promise(r=>setTimeout(r,150)); return PH.files.length===9&&PH.scan&&PH.scan.n===9; })()"));
 await E("phSetFiles(window.__files)");
 /* GCP file */
 const gcp='EPSG:32636\n'+Array.from({length:18},(_,i)=>(500000+i)+' '+(3300000+i)+' 100 '+(10+i)+' '+(20+i)+' IMG_'+String(1+(i%6)).padStart(4,'0')+'.JPG').join('\n')+'\n';
 ok('GCP file checked: header EPSG, 18 rows, 6 distinct points',await E("(async()=>{ const f=new File([`"+gcp+"`],'gcp_list.txt'); await phSetFiles(window.__files.concat([f])); return PH.gcp&&PH.gcp.info.crs&&PH.gcp.info.rows===18&&PH.gcp.info.ok&&PH.files.some(x=>x.name==='gcp_list.txt')&&PH.scan.n===24; })()"));
 ok('GCP file with no header is flagged',await E("phGcpInfo('1 2 3 4 5 a.jpg\\n').ok===false&&phGcpInfo('1 2 3 4 5 a.jpg\\n').crs===false"));
 /* map overlay */
 ok('Show positions on map adds 22 photo positions',await E("(async()=>{ RC.data.photos=[]; await phShowOnMap(); return RC.data.photos.filter(p=>p.lat!=null).length; })()")===22);
 /* ---- presets and options ---- */
 ok('options balanced: dsm, feature medium, pc medium, depth 11, 5 cm; no 3d-tiles, no dtm',await E("(()=>{ PH.preset='balanced'; PH.adv={dtm:null,gltf:false,pcLas:false,res:'',depth:'',fq:'',pq:'',name:''}; const o=Object.fromEntries(phOptions().map(x=>[x.name,x.value])); return o.dsm===true&&o['feature-quality']==='medium'&&o['pc-quality']==='medium'&&o['mesh-octree-depth']===11&&o['orthophoto-resolution']===5&&!('3d-tiles' in o)&&!('dtm' in o)&&!('fast-orthophoto' in o); })()"));
 ok('options fast: fast-orthophoto true, no dsm',await E("(()=>{ PH.preset='fast'; const o=Object.fromEntries(phOptions().map(x=>[x.name,x.value])); return o['fast-orthophoto']===true&&!('dsm' in o)&&o['orthophoto-resolution']===8; })()"));
 ok('options high + advanced: depth 12, 2 cm, dsm+dtm; overrides res 3, depth 10, gltf, pc-las',await E("(()=>{ PH.preset='high'; let o=Object.fromEntries(phOptions().map(x=>[x.name,x.value])); const a=o['mesh-octree-depth']===12&&o['orthophoto-resolution']===2&&o.dsm===true&&o.dtm===true; Object.assign(PH.adv,{res:'3',depth:'10',gltf:true,pcLas:true,fq:'ultra'}); o=Object.fromEntries(phOptions().map(x=>[x.name,x.value])); return a&&o['orthophoto-resolution']===3&&o['mesh-octree-depth']===10&&o.gltf===true&&o['pc-las']===true&&o['feature-quality']==='ultra'; })()"));
 ok('every option name that can be sent is accepted by the bridge allow-list (same list)',await E("phOptions().every(o=>PHOPT.includes(o.name))"));
 await E("PH.preset='balanced'; PH.adv={dtm:null,gltf:true,pcLas:true,res:'',depth:'',fq:'',pq:'',name:'page test job'}; phRender(); 0");
 ok('time guess shown as rough, not a measurement',await E("/guess/.test(PH.top.textContent)&&/not a measurement/.test(PH.top.textContent)"));
 /* ---- run: upload in batches, poll, progress, ETA ---- */
 const t0=Date.now(); await E("phRun().catch(e=>{ PH.err=e.message; })"); await sleep(700);
 let log=await jget('http://127.0.0.1:'+OP+'/__log'); const ups=log.filter(x=>x[0]==='POST'&&/\/upload\//.test(x[1])), init=log.filter(x=>x[1]==='/task/new/init');
 ok('init sent once; upload went in batches (fixture JPEGs are small: 1 batch of 25 files incl. gcp)',init.length===1&&ups.length>=1,JSON.stringify(log.map(x=>x[1]).slice(0,8))+' err='+await E("PH.err+'|'+PH.up.err"));
 const job=await E("({uuid:PH.job.uuid,opts:PH.job.opts,up:PH.up,name:PH.job.name})"); ok('job options: dsm, gltf and pc-las included (the fake NodeODM knows them), 3d-tiles absent',job.opts.some(o=>o.name==='gltf')&&job.opts.some(o=>o.name==='pc-las')&&!job.opts.some(o=>o.name==='3d-tiles')&&job.name==='page test job',JSON.stringify(job.opts));
 ok('upload progress reaches 100 % and bytes match the files',job.up.pct===100&&job.up.sent===job.up.total&&job.up.total>0,JSON.stringify(job.up));
 const seenP=[]; let done=false; for(let i=0;i<60&&!done;i++){ const x=await E("({c:PH.job.code,p:PH.job.progress,txt:PH.jobBox.textContent,eta:phEta(),log:PH.log.length})"); seenP.push(x); done=x.c===40; await sleep(300); }
 ok('polling: progress climbs (25 per fake step) to 100 and the job ends completed',seenP.some(x=>x.p===75)&&seenP[seenP.length-1].p===100&&seenP.every((x,i)=>i===0||x.p>=seenP[i-1].p)&&seenP[seenP.length-1].c===40,JSON.stringify(seenP.map(x=>x.p)));
 ok('console log lines came through with_output (4 lines) and are shown',seenP[seenP.length-1].log===4&&await E("/fake step 3/.test(PH.jobBox.querySelector('#phLog').textContent)"));
 ok('ETA appears while running (after 5 %) and is labelled rough',seenP.some(x=>x.eta!=null&&/rough/.test(x.txt)),JSON.stringify(seenP.map(x=>x.eta)));
 { const T=await jget('http://127.0.0.1:'+OP+'/__tasks'), t=Object.values(T).find(x=>x.name==='page test job'); ok('NodeODM received 25 files: 24 JPEGs and gcp_list.txt, names intact',t&&t.images===25&&t.files.some(f=>f[0]==='gcp_list.txt')&&t.files.some(f=>f[0]==='IMG_0001.JPG')&&t.files.filter(f=>/\.JPG$/.test(f[0])).length===24&&t.files.every(f=>f[1]>0),JSON.stringify(t).slice(0,200)); }
 /* ---- results: download through the bridge, import ---- */
 ok('results list shows downloadable assets (with LAZ marked as not showable)',await E("PH.jobBox.querySelectorAll('button').length>10&&/LAZ/.test(PH.jobBox.textContent)&&/Textured mesh/.test(PH.jobBox.textContent)"));
 let r=await E("phDownload('dsm.tif').then(b=>b.byteLength)"); ok('download dsm.tif through the bridge (bytes equal fixture size)',r===fs.statSync(path.join(FX,'dsm_pred3.tif')).size,r);
 await E("RC.crs.mode='utm'; RC.crs.zone=0; 0");
 r=await E("phImportAsset('dsm.tif',PH.assets['dsm.tif'])"); ok('DSM (tiled, deflate, predictor 3) imported: 40 x 30, EPSG 32636, surface "dsm"',r.kind==='DEM'&&r.size==='40 x 30'&&r.crs==='EPSG:32636'&&r.surface==='dsm',JSON.stringify(r));
 ok('  -> 1199 points (1 nodata cell skipped), Z 100.00 to 109.70 (hand check: 100 + 0.1*39 + 0.2*29)',r.points===1199&&Math.abs(r.zMin-100)<1e-4&&Math.abs(r.zMax-109.7)<1e-3,JSON.stringify(r));
 ok('  -> tab coordinate system followed the file: UTM zone 36 north',await E("RC.crs.zone===36&&RC.crs.north===true"));
 ok('  -> surface is in RC.surf (used by TIN, contours, cut and fill)',await E("!!RC.surf.dsm"));
 r=await E("rcTool('make_contours',{surface:'dsm',interval:0.37})"); ok('  -> existing make_contours works on it (interval 0.37, 26 levels, 100.27 to 109.52; round-number levels would sit exactly on the fixture vertices, which the old contour routine skips)',r.levels&&r.levels.length===26&&Math.abs(r.levels[0]-100.27)<1e-9&&Math.abs(r.levels[25]-109.52)<1e-9&&r.segments>100,JSON.stringify(r).slice(0,150));
 r=await E("rcTool('compute_cut_fill',{existing:'dsm',level:105,cell:0.5})"); ok('  -> existing cut and fill vs level 105: hand check net = (mean Z 104.85 - 105) x area 282 = -42 m3 (TIN has a small hole at the nodata cell): net between -43 and -38, cut and fill both over 200',r.tin&&r.tin.net>-43&&r.tin.net<-38&&r.tin.cut>200&&r.tin.fill>200,JSON.stringify(r).slice(0,250));
 r=await E("phDownload('orthophoto.tif').then(b=>phImportAsset('orthophoto.tif',b))"); ok('orthophoto (tiled, deflate, predictor 2, RGBA) imported and placed: 64 x 48 px, 0.5 m',r.kind==='orthophoto'&&r.size==='64 x 48'&&r.cellM===0.5&&r.placed===true&&r.transparentPixels===48,JSON.stringify(r));
 ok('  -> pixel (10,3) = 40,15,128,255 and column 0 transparent (decoded like PIL does)',await E("(()=>{ const x=PH.orthoCv.getContext('2d'); const a=x.getImageData(10,3,1,1).data, z=x.getImageData(0,5,1,1).data; return a[0]===40&&a[1]===15&&a[2]===128&&a[3]===255&&z[3]===0; })()"));
 ok('  -> world file: A 0.5, E -0.5, C 500000.25, F 3300023.75; corner on the map = UTM 36N (500000, 3300024)',await E("(()=>{ const w=RC.world, ll=RC.ortho.ll[0], e=fromUTM(500000,3300024,36,true); return w.A===.5&&w.E===-.5&&Math.abs(w.C-500000.25)<1e-9&&Math.abs(w.F-3300023.75)<1e-9&&Math.abs(ll[0]-e[0])<1e-6&&Math.abs(ll[1]-e[1])<1e-6; })()"));
 r=await E("phDownload('dtm.tif').then(b=>phImportAsset('dtm.tif',b))"); ok('DTM (predictor 1) imported too',r.kind==='DEM'&&r.surface==='dtm'&&r.points===1199,JSON.stringify(r).slice(0,150));
 r=await E("phDownload('textured_model.zip').then(b=>phImportAsset('textured_model.zip',b))"); ok('textured OBJ zip: 12 faces, 2 materials, 2 textures, 10 x 10 x 5 m',r.faces===12&&r.materials===2&&r.textures===2&&r.sizeM.join()==='10,10,5',JSON.stringify(r));
 ok('  -> in the 3D scene: group photo3d with 2 meshes; lowest point at 0; centred on x and z',await E("(()=>{ const bb=new T.Box3().setFromObject(PH.root), c=bb.getCenter(new T.Vector3()); return scene.children.includes(PH.root)&&PH.root.children[0].children.length===2&&Math.abs(bb.min.y)<1e-6&&Math.abs(c.x)<1e-6&&Math.abs(c.z)<1e-6&&Math.abs(bb.max.y-5)<1e-6; })()"));
 ok('  -> axes: ODM east/north/up -> scene x/-z/y (north face is at z -10..0 before centring)',await E("(()=>{ const g=PH.root.children[0].children[0].geometry; g.computeBoundingBox(); const b=g.boundingBox; return b.min.y===5&&b.max.y===5&&b.min.x===0&&b.max.x===10&&b.min.z===-10&&b.max.z===0; })()"));
 ok('  -> no coords.txt in this zip: said so, no lat/lon claimed',await E("!PH.mesh.latlon&&/NOT known/.test(PH.mesh.georef)"));
 r=await E("phDownload('all.zip').then(b=>phImportAsset('all.zip',b))"); ok('all.zip: mesh placed with coords.txt: UTM 36N centre E 500105 N 3300205, lat/lon computed',r.utm&&r.utm.E===500105&&r.utm.N===3300205&&r.utm.zone===36&&r.latlon&&r.georef&&/coords\.txt/.test(r.georef),JSON.stringify(r).slice(0,300));
 const ll=await E("fromUTM(500105,3300205,36,true)"); ok('  -> lat/lon equals fromUTM of the centre',await E("Math.abs(PH.mesh.latlon[0]-"+ll[0].toFixed(6)+")<2e-6&&Math.abs(PH.mesh.latlon[1]-"+ll[1].toFixed(6)+")<2e-6"),JSON.stringify([r.latlon,ll]));
 ok('  -> all.zip fixture holds only a mesh: one result (not a list)',!Array.isArray(r)&&r.kind==='textured OBJ',JSON.stringify(r).slice(0,100));
 r=await E("phDownload('georeferenced_model.las').then(b=>phImportAsset('georeferenced_model.las',b))"); ok('LAS point cloud imported through the existing LAS reader: 50 points',r.kind==='LAS'&&r.total===50,JSON.stringify(r).slice(0,200));
 r=await E("phDownload('georeferenced_model.laz').then(b=>phImportAsset('georeferenced_model.laz',b)).catch(e=>e.message)"); ok('LAZ is refused with advice (LAS option / CloudCompare)',/LASzip/.test(r)&&/CloudCompare/.test(r),r);
 r=await E("phDownload('nothing.tif').catch(e=>e.message)"); ok('asset outside the allow-list: 404 message, nothing saved',/asset not allowed/.test(r),r);
 /* GLB, strips and other TIFF variants from disk */
 const b64=n=>fs.readFileSync(path.join(FX,n)).toString('base64'); await E("window.__b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer; 0");
 r=await E("phImportAsset('model.glb',window.__b('"+b64('model.glb')+"'))"); ok('GLB: 2 faces, 1 mesh, 4 x 2 m, texture material',r.kind==='GLB'&&r.faces===2&&r.meshes===1&&r.sizeM.join()==='4,0,2'&&await E("!!PH.mesh&&PH.mesh.kind==='GLB'"),JSON.stringify(r));
 ok('  -> GLB mesh has a texture map',await E("PH.root.children[0].children[0].material.map!=null"));
 r=await E("phImportAsset('dsm.tif',window.__b('"+b64('dsm_pred1.tif')+"')).then(x=>x.points)"); ok('predictor 1 DSM from disk: same 1199 points',r===1199,r);
 await E("window.__tif=null; 0");
 const strip=cp.execFileSync('python3',['-c',"import sys;sys.path.insert(0,'"+HERE+"');import ph_fixtures as F,base64;px=[1.5*c+r for r in range(6) for c in range(8)];print(base64.b64encode(F.tiff(8,6,1,32,3,strip_rows=2,comp=1,pixels=px,geo=(100.0,200.0,2.0,2.0,32636),nodata=-9999)).decode())"]).toString().trim();
 r=await E("phImportAsset('strip.tif',window.__b('"+strip+"')).then(x=>({p:x.points,z:[x.zMin,x.zMax]}))"); ok('strip-based uncompressed float TIFF (the old reader case) also read: 48 points, Z 0 to 15.5 (1.5*7+5)',r.p===48&&Math.abs(r.z[0])<1e-6&&Math.abs(r.z[1]-15.5)<1e-6,JSON.stringify(r));
 const lzw=cp.execFileSync('python3',['-c',"import sys;sys.path.insert(0,'"+HERE+"');import ph_fixtures as F,base64;print(base64.b64encode(F.tiff(8,6,1,8,1,comp=5,pixels=[0]*48,geo=(0.0,0.0,1.0,1.0,32636))).decode())"]).toString().trim();
 r=await E("phImportAsset('lzw.tif',window.__b('"+lzw+"')).catch(e=>e.message)"); ok('LZW TIFF refused with a clear message',/compression 5/.test(r)&&/deflate/.test(r),r);
 r=await E("phImportAsset('x.tif',new Uint8Array([1,2,3,4,5,6,7,8]).buffer).catch(e=>e.message)"); ok('not a TIFF: clear message',/Not a TIFF/.test(r),r);
 /* placement */
 await E("PH.place.dx=10; PH.place.sc=2; PH.place.rot=90; phPlace(); 0"); ok('placement boxes: offset 10, scale 2, rotation 90 degrees applied to the group',await E("PH.root.position.x===10&&PH.root.scale.x===2&&Math.abs(PH.root.rotation.y-Math.PI/2)<1e-9"));
 ok('orthophoto as 3D ground: plane 32 x 24 m under the mesh',await E("(()=>{ phOrthoGround(true); const g=PH.ground; g.geometry.computeBoundingBox(); const b=g.geometry.boundingBox; return Math.abs(b.max.x-b.min.x-32)<1e-9&&Math.abs(b.max.y-b.min.y-24)<1e-9&&PH.root.children.includes(g); })()"));
 ok('pane shows placement boxes and the 3D buttons with hover texts',await E("PH.jobBox.querySelectorAll('[data-ph=dx]').length===1&&[...PH.jobBox.querySelectorAll('button')].every(x=>x.title.length>10)"));
 /* ---- cancel flow ---- */
 await E("PH.adv.name='cancel me'; PH.preset='fast'; 0"); await E("phRun().catch(e=>{ PH.err=e.message; })"); await sleep(600); const cu=await E("PH.job.uuid"); await E("phCancel()"); ok('cancel: job shows canceled and polling stops',await E("PH.job.code===50&&PH.job.done&&/canceled/.test(PH.jobBox.textContent)"));
 ok('cancel reached NodeODM',(await jget('http://127.0.0.1:'+OP+'/task/list')).length>=1);
 /* ---- failure shown ---- */
 /* ---- wipe through the privacy flow ---- */
 ok('PRIV.wipe exists',await E("typeof PRIV.wipe==='function'"));
 const wr=await E("PRIV.wipe({}).then(R=>({mem:R.mem}))"); ok('privacy wipe calls phWipe and reports it ("Photos to 3D: ... container and its job data removed")',wr.mem.some(m=>/Photos to 3D: .*NodeODM container and its job data removed/.test(m)),JSON.stringify(wr));
 const sres=await fetch('http://127.0.0.1:'+BP+'/photo/status',{headers:{'x-tox-token':TOK}}).then(r=>r.json()); ok('after the wipe: container gone (docker rm -f -v was called)',sres.container==='none'&&/rm -f -v tox-nodeodm/.test(fs.readFileSync(path.join(ST,'calls.log'),'utf8')),JSON.stringify(sres).slice(0,150));
 ok('after the wipe: page memory empty (files, job, assets, mesh, ortho, surfaces)',await E("PH.files.length===0&&PH.job===null&&Object.keys(PH.assets).length===0&&!PH.root&&!scene.children.some(o=>o.name==='photo3d')&&!RC.surf.dsm&&!RC.surf.dtm&&RC.ortho==null&&PH.surf.length===0"));
 ok('after the wipe: object URLs of textures revoked (list empty)',await E("PH.urls.length===0"));
 /* ---- Arabic ---- */
 await E("lang='ar'; PH.err=''; PH.msg=''; phRender(); 0"); ok('Arabic UI: headings and buttons in Arabic',await E("/صور إلى 3D/.test(PH.box.textContent)&&/ابدأ|شغّل NodeODM/.test(PH.box.textContent)&&/\\u0627/.test(PH.top.querySelector('button').textContent)"));
 await E("lang='en'; 0");
 /* ---- privacy of requests ---- */
 ok('every /photo/ request the page made went to the local bridge 127.0.0.1:'+BP+' ('+photoReq.length+' requests)',photoReq.length>20&&photoReq.every(u=>u.host==='127.0.0.1:'+BP),JSON.stringify([...new Set(photoReq.map(u=>u.host))]));
 ok('no request went anywhere except 127.0.0.1 from the photo code (outbound log: no external host with the photo paths)',await E("PRIV.log().filter(x=>/photo/.test(x.path)).every(x=>x.host==='127.0.0.1'&&x.cls==='local')"));
 ok('no page errors in the whole run',er.length===0,er.join(' | ').slice(0,300));
 await b.close(); })().catch(e=>{ console.log('FAIL harness: '+e.stack); fail++; }).finally(()=>{ try{ br.kill(); }catch(e){} try{ const p=+fs.readFileSync(path.join(ST,'pid'),'utf8'); process.kill(-p); }catch(e){} try{ fs.rmSync(ST,{recursive:true,force:true}); }catch(e){} console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); });
