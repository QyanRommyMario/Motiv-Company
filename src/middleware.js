import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // [SECURITY FIX] Middleware-level Admin Role Check
    // Proteksi admin routes di level middleware (defense in depth)
    if (
      req.nextUrl.pathname.startsWith("/admin") ||
      req.nextUrl.pathname.startsWith("/api/admin")
    ) {
      if (token?.role !== "ADMIN") {
        // Redirect non-admin users away from admin area
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 1. Lanjutkan request seperti biasa
    const response = NextResponse.next();

    // 2. [SECURITY FIX] Set proper security headers for Midtrans compatibility
    // Configure CSP to allow Midtrans while maintaining security
    const csp = [
      "default-src 'self'",
      "script-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com 'unsafe-inline' 'unsafe-eval'",
      "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
      "connect-src 'self' https://api.midtrans.com https://api.sandbox.midtrans.com https://*.supabase.co wss://*.supabase.co",
      "img-src 'self' data: https: blob:",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(self)"
    );
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  },
  {
    callbacks: {
      // Pastikan user login (token ada)
      authorized: ({ token }) => !!token,
    },
  }
);

// Tentukan halaman mana saja yang wajib login & kena pembersihan header
export const config = {
  matcher: [
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/admin/:path*",
    // PENTING: Tambahkan rute API ini agar header-nya juga dibersihkan saat pembayaran
    "/api/orders/:path*",
  ],
};
