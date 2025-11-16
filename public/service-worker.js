const CACHE_NAME = "guilda-geek-v2";
const STATIC_CACHE = "guilda-static-v2";
const DYNAMIC_CACHE = "guilda-dynamic-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-180x180.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// Install event - precache static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log("Service Worker: Caching static assets");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("Service Worker: Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - cache strategy based on request type
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Cache-first strategy for static assets (images, fonts, CSS, JS)
      if (
        request.destination === "image" ||
        request.destination === "font" ||
        request.destination === "style" ||
        request.destination === "script"
      ) {
        return cachedResponse || fetch(request).then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      }

      // Network-first strategy for API calls and dynamic content
      return fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline message for navigation requests
          if (request.mode === "navigate") {
            return new Response(
              `<!DOCTYPE html>
              <html lang="pt-BR">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Guilda - Offline</title>
                <style>
                  body {
                    font-family: 'Rajdhani', sans-serif;
                    background: linear-gradient(135deg, #080812 0%, #1a0f2e 50%, #0d1f2d 100%);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    text-align: center;
                    padding: 20px;
                  }
                  .offline-container {
                    max-width: 400px;
                  }
                  h1 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #00bfff, #8b5cf6, #ff00ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                  }
                  p {
                    font-size: 1.2rem;
                    opacity: 0.9;
                  }
                </style>
              </head>
              <body>
                <div class="offline-container">
                  <h1>Você está offline</h1>
                  <p>Conecte-se à internet para acessar o Guilda Geek</p>
                </div>
              </body>
              </html>`,
              {
                status: 200,
                statusText: "OK",
                headers: new Headers({
                  "Content-Type": "text/html"
                })
              }
            );
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});
