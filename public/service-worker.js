const CACHE_VERSION = "cache-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-1024.png"
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
          if (!cacheName.startsWith(CACHE_VERSION)) {
            console.log("Service Worker: Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache strategy based on request type
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and chrome-extension
  if (url.origin !== location.origin || url.protocol === "chrome-extension:") {
    return;
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    (async () => {
      // Try to get from cache first
      const cachedResponse = await caches.match(request);

      // Cache-first strategy for assets (images, fonts, styles, scripts)
      if (
        request.destination === "image" ||
        request.destination === "font" ||
        request.destination === "style" ||
        request.destination === "script" ||
        url.pathname.startsWith("/icons/") ||
        url.pathname.startsWith("/assets/")
      ) {
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          return cachedResponse || new Response("Resource not available", { status: 404 });
        }
      }

      // Network-first strategy for pages and API calls
      try {
        const response = await fetch(request);
        if (response && response.status === 200 && request.url.indexOf("http") === 0) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        // Fallback to cache if network fails
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return offline page for navigation requests
        if (request.mode === "navigate") {
          return new Response(
            `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
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
                  margin-bottom: 2rem;
                }
                button {
                  background: linear-gradient(135deg, #00bfff, #8b5cf6);
                  border: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  color: white;
                  font-size: 1rem;
                  cursor: pointer;
                  font-weight: 600;
                }
              </style>
            </head>
            <body>
              <div class="offline-container">
                <h1>Você está offline</h1>
                <p>Conecte-se à internet para acessar o Guilda Geek</p>
                <button onclick="window.location.reload()">Tentar novamente</button>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              statusText: "OK",
              headers: new Headers({
                "Content-Type": "text/html; charset=utf-8"
              })
            }
          );
        }

        return new Response("Offline", { 
          status: 503,
          statusText: "Service Unavailable"
        });
      }
    })()
  );
});
