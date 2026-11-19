function collect(){ if(TRIS)return TRIS; const sv=[A.s,A.e,A.mode]; A.s=0;A.e=0; applyAnim(); root.updateMatrixWorld(true); TRIS=[]; let mi=0; const Pv=new T.Vector3();
 root.traverse(o=>{if(!o.isMesh||!o.material.userData.layer)return; let gp=o; while(gp&&!(gp.userData&&gp.userData.part))gp=gp.parent; const gk=gp?gp.userData.part+'#'+gp.userData.idx:'x#0';
  const g=o.geometry,pa=g.attributes.position,ix=g.index,v=[]; for(let i=0;i<pa.count;i++){Pv.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);v.push([Pv.x,Pv.y,Pv.z]);}
  const n=ix?ix.count:pa.count; for(let i=0;i<n;i+=3){const a=ix?ix.getX(i):i,b=ix?ix.getX(i+1):i+1,c=ix?ix.getX(i+2):i+2; TRIS.push({p:[...v[a],...v[b],...v[c]],l:o.material.userData.layer,m:mi,g:gk});} mi++;});
 A.s=sv[0];A.e=sv[1]; applyAnim(); root.updateMatrixWorld(true); return TRIS;}
function meshVolume(tris){let s=0; tris.forEach(t=>{const p=t.p; s+=(p[0]*(p[4]*p[8]-p[5]*p[7])-p[1]*(p[3]*p[8]-p[5]*p[6])+p[2]*(p[3]*p[7]-p[4]*p[6]))/6;}); return Math.abs(s);}
