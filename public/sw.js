(() => {
  // <stdin>
  var VERSION = "1749619531";
  var preCache = [
    "/images/taichi.png",
    "/css/loader.css",
    "/css/main.css",
    "/js/main.js",
    "/images/mygo.webp"
  ];
  var cacheDomain = [
    "fonts.googleapis.com",
    "npm.webcache.cn",
    "unpkg.com",
    "fastly.jsdelivr.net",
    "cdn.jsdelivr.net"
  ];
  self.addEventListener("install", (event) => {
    console.log(`Service Worker ${VERSION} installing.`);
    event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(preCache)));
  });
  async function cacheRequest(request, options) {
    try {
      const responseToCache = await fetch(request);
      const cache = await caches.open(VERSION);
      if (!/^https?:$/i.test(new URL(request.url).protocol))
        return responseToCache;
      cache.put(request, responseToCache.clone());
      return responseToCache;
    } catch (e) {
      const responseToCache = await fetch(request, options);
      const cache = await caches.open(VERSION);
      if (!/^https?:$/i.test(new URL(request.url).protocol))
        return responseToCache;
      cache.put(request, responseToCache.clone());
      return responseToCache;
    }
  }
  async function respondRequest(request, options) {
    const response = await caches.match(request);
    if (response) {
      return response;
    }
    return cacheRequest(request, options);
  }
  self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (cacheDomain.includes(url.hostname)) {
      event.respondWith(respondRequest(event.request));
    } else {
      if (event.request.method === "POST" || event.request.method === "GET" && url.search) {
        try {
          event.respondWith(fetch(event.request));
        } catch (e) {
          event.respondWith(fetch(event.request, { mode: "no-cors" }));
        }
      } else {
        event.respondWith(respondRequest(event.request, { mode: "no-cors" }));
      }
    }
  });
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (VERSION !== cacheName) {
              console.log(`Service Worker: deleting old cache ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
    console.log(`Service Worker ${VERSION} activated.`);
  });
  self.addEventListener("message", (event) => {
    console.log("Service Worker: message received");
    if (event.data === "skipWaiting") {
      self.skipWaiting();
    }
  });
})();
