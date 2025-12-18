"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function CartEmpty() {
  const t = useTranslations("cart");

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Ikon Keranjang */}
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-5xl">🛒</span>
      </div>

      {/* Teks Judul - Menggunakan kunci 'empty' */}
      <h2 className="text-2xl font-display font-bold text-[#1A1A1A] mb-3">
        {t("empty")}
      </h2>

      {/* Teks Deskripsi - Menggunakan kunci 'emptyMessage' */}
      <p className="text-gray-500 mb-8 max-w-xs text-center">
        {t("emptyMessage")}
      </p>

      {/* Tombol Navigasi */}
      <Link href="/products">
        <Button
          variant="primary"
          className="px-12 py-4 uppercase tracking-widest text-xs font-bold"
        >
          {t("continueShopping")}
        </Button>
      </Link>
    </div>
  );
}
