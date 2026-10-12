const CACHE_NAME = "RJKA-v1.0.1";

const APP_FILES = [
"./",
"./index.html",
"./style.css",
"./app.js",
"./manifest.json",
"./account.html",
"./account.js",
"./transactions.html",
"./transactions.js",
"./income.html",
"./income.js",
"./expense.html",
"./expense.js",
"./budget.html",
"./budget.js"
];

self.addEventListener("install", event => {
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => cache.addAll(APP_FILES))
.then(() => self.skipWaiting())
);
});

self.addEventListener("activate", event => {
event.waitUntil(
caches.keys()
.then(keys => Promise.all(
keys
.filter(key => key.startsWith("RJKA-") && key !== CACHE_NAME)
.map(key => caches.delete(key))
))
.then(() => self.clients.claim())
);
});

self.addEventListener("fetch", event => {
const request = event.request;

if (request.method !== "GET") return;

const url = new URL(request.url);

// इतर वेबसाइटच्या विनंत्यांमध्ये हस्तक्षेप करू नका.
if (url.origin !== self.location.origin) return;

event.respondWith(
fetch(request)
.then(response => {
if (response.ok) {
const copy = response.clone();
caches.open(CACHE_NAME)
.then(cache => cache.put(request, copy));
}
return response;
})
.catch(async () => {
const cached = await caches.match(request);
if (cached) return cached;

    // फक्त मुख्य पेजसाठी fallback; प्रत्येक URL साठी नाही.
    if (request.mode === "navigate") {
      const path = url.pathname.replace(/\/+$/, "");
      const lastPart = path.split("/").pop();

      if (path === "" || lastPart === "index.html") {
        const home = await caches.match("./index.html");
        if (home) return home;
      }
    }

    return new Response(
      "हे पेज सध्या उपलब्ध नाही. इंटरनेट कनेक्शन तपासून पुन्हा प्रयत्न करा.",
      {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      }
    );
  })

);
});
