"use client";

/**
 * Session Provider Component
 * Wraps the app with NextAuth SessionProvider
 */

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children, session }) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
