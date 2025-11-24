// public/sw.js
// Service Worker Standar untuk memenuhi syarat PWA Installable

const CACHE_NAME = "motiv-cache-v1";

// Event Install: Dipanggil saat Service Worker pertama kali dipasang
self.addEventListener("install", (event) => {
  console.log("Service Worker: Menginstall...");
  // Paksa SW baru untuk segera aktif, melewati fase menunggu
  self.skipWaiting();
});

// Event Activate: Dipanggil setelah SW berhasil diinstall
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Aktif");
  // Mengambil alih kontrol semua klien (tab) yang terbuka segera
  event.waitUntil(self.clients.claim());
});

// Event Fetch: Syarat WAJIB agar Chrome menampilkan tombol Install
// Kita biarkan kosong agar request tetap normal ke internet (Network Only)
// Ini aman dan tidak akan mengacaukan data aplikasi Anda.
self.addEventListener("fetch", (event) => {
  // Logika caching bisa ditambahkan di sini nanti jika diperlukan.
  // Saat ini kita biarkan default (langsung ke server) agar aplikasi stabil.
});
