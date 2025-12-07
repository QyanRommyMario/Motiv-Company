// public/sw.js

const CACHE_NAME = "motiv-cache-v2";
const OFFLINE_URL = "/offline";

// Daftar file yang wajib di-cache saat install
const STATIC_ASSETS = [
  OFFLINE_URL,
  "/icons/ikon-motiv.png",
  "/manifest.json",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
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
            if (cache !== CACHE_NAME) {
              console.log("Service Worker: Clearing Old Cache");
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. FETCH: Strategi Caching (Offline Mode)
self.addEventListener("fetch", (event) => {
  // Abaikan request API (biarkan network only agar data tidak stale)
  // Kecuali Anda ingin cache GET request tertentu
  if (event.request.url.includes("/api/")) {
    return;
  }

  // Strategi: Network First, Fallback to Cache, Fallback to Offline Page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Jika berhasil fetch, simpan copy-nya ke cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Jika offline/gagal, ambil dari cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Jika tidak ada di cache, tampilkan halaman offline custom
            return caches.match(OFFLINE_URL);
          });
        })
    );
  } else {
    // Strategi: Cache First untuk aset statis (gambar, js, css)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((response) => {
            // Cache aset baru yang di-load
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
        );
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
