// src/components/ServiceWorkerRegister.jsx
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW Registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("SW Registration failed:", error);
        });
    }

    // 2. Request Notification Permission (Opsional: Bisa dipindah ke tombol di Profile)
    if ("Notification" in window && "serviceWorker" in navigator) {
      // Cek apakah permission belum pernah diminta (default)
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
            // Di sini Anda bisa memanggil fungsi subscribeUserToPush()
            // untuk mengirim subscription object ke backend database Anda.
          }
        });
      }
    }
  }, []);

  return null;
}
