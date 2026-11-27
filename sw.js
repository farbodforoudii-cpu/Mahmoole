const V='mahmoole-v13';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith('mahmoole-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
const u=new URL(e.request.url);
if(u.pathname.endsWith('rates.json')){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));return}
if(u.origin===location.origin&&(e.request.mode==='navigate'||u.pathname.endsWith('.html'))){
// Fresh page when the network answers quickly; the saved copy after 2.5s, so a slow connection never hangs the app.
e.respondWith((async()=>{const net=fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r});
const saved=(await caches.match(e.request))||(await caches.match('./index.html'));
if(!saved)return net;
return Promise.race([net.then(r=>r.ok?r:saved).catch(()=>saved),new Promise(ok=>setTimeout(()=>ok(saved),2500))])})());return}
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok||n.type==='opaque'){const c=n.clone();caches.open(V).then(x=>x.put(e.request,c))}return n})))});
