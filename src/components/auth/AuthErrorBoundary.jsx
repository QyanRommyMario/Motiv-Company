"use client";

import { useEffect } from "react";

/**
 * Error Boundary for NextAuth Errors
 * Suppress CLIENT_FETCH_ERROR for unauthenticated users
 */
export default function AuthErrorBoundary({ children }) {
  useEffect(() => {
    // Suppress NextAuth CLIENT_FETCH_ERROR in console
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("[next-auth][error][CLIENT_FETCH_ERROR]")
      ) {
        // Ignore this error - it's expected for unauthenticated users
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
}
