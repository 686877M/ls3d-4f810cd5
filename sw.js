// T.O X app shell: fresh copy when online, last good copy when offline. build.txt is never cached (update banner needs the live value).
const C='tox-shell-1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||/build\.txt$/.test(u.pathname))return;
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const k=r.clone(); caches.open(C).then(c=>c.put(e.request,k)); } return r; }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||Response.error())));
});
