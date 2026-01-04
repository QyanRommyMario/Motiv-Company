"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import B2BDashboard from "@/components/dashboard/B2BDashboard";
import B2CDashboard from "@/components/dashboard/B2CDashboard";
import GuestLanding from "@/components/dashboard/GuestLanding";

export default function Home() {
  const { data: session, status } = useSession();
  const [manualSession, setManualSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        setManualSession(data);
      } catch (error) {
        // Error handled silently
      } finally {
        setIsLoadingSession(false);
      }
    }
    fetchSession();
  }, []);

  const activeSession = session || manualSession;
  const activeStatus =
    status === "loading" || isLoadingSession
      ? "loading"
      : activeSession
      ? "authenticated"
      : "unauthenticated";

  if (activeStatus === "loading") {
    return (
      <div
        className="min-h-screen bg-[#FDFCFA] flex items-center justify-center"
        role="status"
        aria-label="Loading page"
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-[#1A1A1A] uppercase tracking-[0.15em] text-sm font-bold">
            Loading...
          </p>
          <span className="sr-only">Please wait while the page loads</span>
        </div>
      </div>
    );
  }

  if (activeSession?.user?.role === "ADMIN") {
    return <AdminDashboard session={activeSession} />;
  }

  if (activeSession?.user?.role === "B2B") {
    return <B2BDashboard session={activeSession} />;
  }

  if (activeSession?.user?.role === "B2C") {
    return <B2CDashboard session={activeSession} />;
  }

  return <GuestLanding />;
}
