"use client";

import { createContext, useContext, useState, useEffect } from "react";

const OnlineStatusContext = createContext({
  isOnline: true,
  isOfflineData: false,
});

export function OnlineStatusProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export function useOnlineStatus() {
  return useContext(OnlineStatusContext);
}

/**
 * Custom hook for fetching data with offline support
 * Returns cached data when offline with a flag indicating it's stale
 */
export function useOfflineAwareFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, options);

        if (!isMounted) return;

        // Check if response is from cache (offline)
        const cacheStatus = response.headers.get("X-Cache-Status");
        setIsOfflineData(cacheStatus === "offline");

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else if (response.status === 503) {
          // Offline with no cache
          const result = await response.json();
          setError(result.message || "Data tidak tersedia offline");
        } else {
          setError("Gagal memuat data");
        }
      } catch (err) {
        if (!isMounted) return;
        setError("Koneksi gagal");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, isOnline]);

  return { data, loading, error, isOfflineData, isOnline };
}
