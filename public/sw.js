// public/sw.js

const CACHE_NAME = "motiv-cache-v4";
const OFFLINE_URL = "/offline";
const API_CACHE_NAME = "motiv-api-cache-v1";

// Daftar file yang wajib di-cache saat install (App Shell)
const STATIC_ASSETS = [OFFLINE_URL, "/", "/products", "/icons/ikon-motiv.png"];

// API endpoints yang boleh di-cache untuk offline browsing
const CACHEABLE_API_PATTERNS = [
  /\/api\/products($|\?)/, // Product listing
  /\/api\/products\/[^/]+$/, // Product detail
  /\/api\/products\/categories/, // Categories
  /\/api\/stories/, // Stories
];

// API yang TIDAK boleh di-cache (harus selalu fresh)
const NON_CACHEABLE_API = [
  /\/api\/auth/, // Authentication
  /\/api\/cart/, // Cart (harus real-time)
  /\/api\/orders/, // Orders
  /\/api\/checkout/, // Checkout
  /\/api\/payment/, // Payment
];

// Assets yang akan di-cache secara runtime
const RUNTIME_CACHE_PATTERNS = [
  /\/_next\/static\/.*/,
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/,
  /\.(?:woff|woff2|ttf|otf|eot)$/,
];

// 1. INSTALL: Cache aset statis & halaman offline
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  // Paksa SW baru segera aktif
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. ACTIVATE: Bersihkan cache lama
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Active");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            // Hapus cache lama kecuali yang aktif
            if (cache !== CACHE_NAME && cache !== API_CACHE_NAME) {
              console.log("Service Worker: Clearing Old Cache", cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper: Check if API should be cached
function isApiCacheable(url) {
  const pathname = url.pathname;

  // Check if it's a non-cacheable API first
  if (NON_CACHEABLE_API.some((pattern) => pattern.test(pathname))) {
    return false;
  }

  // Check if it matches cacheable patterns
  return CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(pathname));
}

// 3. FETCH: Strategi Caching (Offline Mode dengan API Caching)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Abaikan request non-GET
  if (request.method !== "GET") {
    return;
  }

  // Handle API requests dengan strategi Network-First + Cache Fallback
  if (url.pathname.startsWith("/api/")) {
    // Skip non-cacheable APIs
    if (!isApiCacheable(url)) {
      return; // Let browser handle normally (network only)
    }

    // Cacheable API: Network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: Return cached API response if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              // Add header to indicate this is cached data
              const headers = new Headers(cachedResponse.headers);
              headers.set("X-Cache-Status", "offline");
              return new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: headers,
              });
            }
            // No cache available, return error
            return new Response(
              JSON.stringify({
                success: false,
                offline: true,
                message: "You are offline and this data is not cached",
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // Strategi: Network First untuk navigasi (halaman HTML)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Jika berhasil fetch, simpan copy-nya ke cache
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Jika offline/gagal, ambil dari cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Jika tidak ada di cache, tampilkan halaman offline custom
            return caches.match(OFFLINE_URL);
          });
        })
    );
  } else {
    // Strategi: Stale-While-Revalidate untuk aset statis
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Update cache dengan response baru
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        // Return cached response segera, update di background
        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 4. PUSH: Terima Notifikasi dari Server
self.addEventListener("push", (event) => {
  let data = {
    title: "MOTIV Update",
    body: "Check out our new products!",
    url: "/",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/ikon-motiv.png",
    badge: "/icons/ikon-motiv.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 5. NOTIFICATION CLICK: Aksi saat notifikasi diklik
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Jika ada tab yang sudah terbuka, fokus ke sana
        for (const client of clientList) {
          if (client.url === event.notification.data.url && "focus" in client) {
            return client.focus();
          }
        }
        // Jika tidak, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});
