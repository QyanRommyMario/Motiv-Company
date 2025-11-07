/**
 * Proxy
 * Protects routes that require authentication
 * Renamed from middleware.js to proxy.js (Next.js 16 requirement)
 */

import { withAuth } from "next-auth/middleware";

export function proxy(request) {
  return withAuth(request, {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  });
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
