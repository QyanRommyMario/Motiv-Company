// src/app/offline/page.js
"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFA] text-center p-6">
      <div className="text-6xl mb-4">☕</div>
      <h1 className="text-3xl font-display font-bold text-[#1A1A1A] mb-2">
        Koneksi Terputus
      </h1>
      <p className="text-[#6B7280] mb-8 max-w-md">
        Sepertinya Anda sedang offline. Cek koneksi internet Anda untuk memuat
        ulang halaman.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-[#1A1A1A] text-white px-8 py-3 uppercase tracking-widest text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Coba Lagi
      </button>
      <div className="mt-8 pt-8 border-t border-gray-200 w-full max-w-xs">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-[#1A1A1A] underline"
        >
          Kembali ke Beranda (Cache)
        </Link>
      </div>
    </div>
  );
}
