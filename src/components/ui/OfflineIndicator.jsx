"use client";

import { useState, useEffect } from "react";

/**
 * Offline Indicator Component
 * Shows a banner when user is offline but can still browse cached content
 * Banner always shows when offline, hides when online
 */
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    // Set initial state based on navigator.onLine
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" message briefly
      setShowOnlineMessage(true);
      setTimeout(() => setShowOnlineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineMessage(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show banner if: offline OR showing "back online" message
  const showBanner = !isOnline || showOnlineMessage;

  if (!showBanner) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-[200] transform transition-transform duration-300 ${
        showBanner ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div
        className={`flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium ${
          isOnline ? "bg-green-500 text-white" : "bg-amber-500 text-amber-950"
        }`}
      >
        {isOnline ? (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Anda kembali online!</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656m-7.072 7.072a4 4 0 010-5.656m-3.536 9.192a9 9 0 010-12.728"
              />
            </svg>
            <span>Anda sedang offline. Menampilkan data tersimpan.</span>
          </>
        )}
      </div>
    </div>
  );
}
