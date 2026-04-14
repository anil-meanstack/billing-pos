const CACHE_NAME = "react-django-cache-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "/",
        "/index.html"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // ❌ Skip API calls (important)
  if (url.pathname.includes("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // ✅ Network First strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(event.request))
  );
});