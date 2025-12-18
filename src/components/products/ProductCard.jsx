"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ProductCard({ product }) {
  const t = useTranslations("products");

  // Ambil harga terendah dari varian produk di database
  const variants = product.variants || [];
  const displayPrice =
    variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;

  const imageSrc =
    product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white border border-[#E5E7EB] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        <div className="relative aspect-square bg-[#F9FAFB] overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
              <span className="text-4xl font-display">M</span>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 flex flex-col flex-grow">
          <h3 className="text-sm font-medium text-[#1A1A1A] line-clamp-2 mb-2 min-h-[40px]">
            {product.name}
          </h3>
          <div className="mt-auto">
            {displayPrice > 0 ? (
              <p className="text-sm font-bold text-[#1A1A1A]">
                Rp {displayPrice.toLocaleString("id-ID")}
              </p>
            ) : (
              <p className="text-xs text-gray-400">Harga belum tersedia</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1">
              {t("viewDetail")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
