"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Cek apakah browser mendukung Service Worker
    if ("serviceWorker" in navigator) {
      // Daftarkan file sw.js yang ada di folder public
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker berhasil didaftarkan dengan scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Gagal mendaftarkan Service Worker:", error);
        });
    }
  }, []);

  // Komponen ini tidak merender tampilan apa-apa
  return null;
}
