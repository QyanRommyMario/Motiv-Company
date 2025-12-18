"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ProductCard({ product }) {
  const t = useTranslations("products");

  // Logika harga: tampilkan harga diskon jika ada
  const displayPrice = product.price;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        {/* Image Container - Diperbaiki agar gambar muncul */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {t("noImage")}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-[#1A1A1A] mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-[#1A1A1A]">
            Rp {displayPrice?.toLocaleString("id-ID")}
          </p>

          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold uppercase tracking-widest border-b border-[#1A1A1A]">
              {t("viewDetail")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
