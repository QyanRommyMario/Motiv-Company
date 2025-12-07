import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 1. Lanjutkan request seperti biasa
    const response = NextResponse.next();

    // 2. [FIX FINAL] Hapus paksa Header Keamanan yang memblokir Midtrans
    // Ini mematikan aturan CORS browser yang rewel pada level server
    response.headers.delete("Content-Security-Policy");
    response.headers.delete("X-Frame-Options");
    response.headers.delete("X-Content-Type-Options");
    response.headers.delete("Permissions-Policy");

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
