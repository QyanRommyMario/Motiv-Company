"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ProductCard({ product }) {
  const t = useTranslations("products");
  const tCart = useTranslations("cart");
  const [imageError, setImageError] = useState(false);

  // Ambil harga terendah dari varian produk
  const variants = product?.variants || [];
  const displayPrice =
    variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;
  const hasMultipleVariants = variants.length > 1;

  // Cek stok - semua varian habis = out of stock
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const isOutOfStock = variants.length > 0 && totalStock === 0;

  // Logika pengambilan gambar
  const imageSrc =
    product?.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <Link href={`/products/${product?.id}`} className="block h-full">
      <div
        className={`group bg-white border border-[#E5E7EB] overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#1A1A1A]/20 h-full flex flex-col ${
          isOutOfStock ? "opacity-75" : ""
        }`}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-[#F9FAFB] overflow-hidden">
          {imageSrc && !imageError ? (
            <Image
              src={imageSrc}
              alt={product?.name || "Product image"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                isOutOfStock ? "grayscale" : ""
              }`}
              onError={() => setImageError(true)}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
              role="img"
              aria-label="No product image available"
            >
              <div className="text-center">
                <span className="text-5xl" aria-hidden="true">
                  ☕
                </span>
                <p className="text-xs text-gray-500 mt-2">No Image</p>
              </div>
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
              <span className="bg-[#1A1A1A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-2">
                {tCart("outOfStock")}
              </span>
            </div>
          )}

          {/* Quick View Overlay - Desktop Only, hanya jika ada stok */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-white text-[#1A1A1A] text-xs font-bold uppercase tracking-wider px-4 py-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                {t("viewDetail")}
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4 flex flex-col grow">
          {/* Category Badge */}
          {product?.category && (
            <span className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
              {product.category}
            </span>
          )}

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-medium text-[#1A1A1A] line-clamp-2 mb-2 min-h-10 leading-tight">
            {product?.name}
          </h3>

          {/* Price Section */}
          <div className="mt-auto">
            {displayPrice > 0 ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <p
                  className={`text-base sm:text-lg font-bold ${
                    isOutOfStock ? "text-gray-500" : "text-[#1A1A1A]"
                  }`}
                >
                  Rp {displayPrice.toLocaleString("id-ID")}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-600">{t("priceNotAvailable")}</p>
            )}

            {/* Stock indicator */}
            {isOutOfStock ? (
              <p className="text-[10px] text-red-500 font-medium mt-1">
                {tCart("outOfStock")}
              </p>
            ) : hasMultipleVariants ? (
              <p className="text-[10px] text-gray-600 mt-1">
                {tCart("variantsAvailable", { count: variants.length })}
              </p>
            ) : null}
          </div>

          {/* Mobile: View Detail Button */}
          <div className="mt-3 pt-3 border-t border-gray-100 sm:hidden">
            <span
              className={`text-xs font-medium flex items-center justify-center gap-1 ${
                isOutOfStock ? "text-gray-500" : "text-[#1A1A1A]"
              }`}
            >
              {t("viewDetail")}
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
