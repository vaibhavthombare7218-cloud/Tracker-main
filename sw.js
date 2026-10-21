
const CACHE_NAME = "RJKA_v1_pwa_v1";
const APP_ROOT = new URL("./", self.location.href);
const START_URL = new URL("index.html", APP_ROOT).href;

// Activate the new worker.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Remove only old RJKA PWA caches.
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter((key) =>
          key.startsWith("RJKA_v1_pwa_") &&
          key !== CACHE_NAME
        )
        .map((key) => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache cross-origin requests.
  if (url.origin !== self.location.origin) return;

  // Ignore browser extension and unsupported schemes.
  if (url.protocol !== "https:" &&
      url.hostname !== "localhost") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // HTML page navigation: try network first.
    if (request.mode === "navigate") {
      try {
        const response = await fetch(request);

        if (response.ok && response.type === "basic") {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        const cachedPage = await cache.match(request);

        if (cachedPage) return cachedPage;

        const cachedStart = await cache.match(START_URL);

        if (cachedStart) return cachedStart;

        return new Response(
          "ऑफलाइन आहात. हे पेज आधी उघडलेले नसेल तर इंटरनेट जोडून पुन्हा प्रयत्न करा.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      }
    }

    // Other same-origin GET resources.
    try {
      const response = await fetch(request);

      if (response.ok && response.type === "basic") {
        await cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      const cached = await cache.match(request);

      if (cached) return cached;

      return new Response("ऑफलाइन संसाधन उपलब्ध नाही.", {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }
  })());
});
