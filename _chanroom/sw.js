// 禪修 App — 離線快取
// 更新 App 時，把 VERSION 改成新的數字，使用者下次開啟就會拿到新版。
const VERSION="zen-v13";
const SHELL = [
  "./",
  "./index.html",
  "./config.js",
  "./manifest.webmanifest",
  "./privacy.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./lib/supabase.js",
  "./fonts/fonts.css"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 雲端資料（Supabase）一律走網路，不快取
  if (url.hostname.endsWith("supabase.co") || url.hostname.endsWith("supabase.in")) return;

  // App 本體：網路優先，離線時用快取
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  // 字型、函式庫：快取優先
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});

// ===== 每日禪修提醒（推播） =====
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  const title = d.title || "禪修室";
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || "該靜坐了，給自己一炷香的時間。",
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png",
    tag: "zen-daily",
    renotify: true,
    data: { url: d.url || "./" }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if (c.url.startsWith(self.registration.scope)) { await c.focus(); return; } }
    await clients.openWindow(url);
  })());
});
