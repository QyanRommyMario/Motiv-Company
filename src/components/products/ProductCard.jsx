"use client";

/**
 * Product Card Component - Modern Minimalist Design
 * Displays product in grid/list view
 */

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ProductCard({ product }) {
  const { data: session } = useSession();
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const hasDiscount =
    session?.user?.role === "B2B" && session.user.discount > 0;

  // Calculate B2B prices
  const discount = session?.user?.discount || 0;
  const minB2BPrice = hasDiscount
    ? minPrice - (minPrice * discount) / 100
    : minPrice;
  const maxB2BPrice = hasDiscount
    ? maxPrice - (maxPrice * discount) / 100
    : maxPrice;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white border border-[#E5E7EB] hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col rounded-lg">
        {/* Image */}
        <div className="relative aspect-square bg-[#F5F4F0] overflow-hidden flex-shrink-0">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* B2B Badge */}
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-[#1A1A1A] text-white px-2.5 py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wider rounded">
              -{session.user.discount}% B2B
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-grow flex flex-col">
          {/* Category */}
          <p className="text-[10px] sm:text-xs text-[#9CA3AF] uppercase tracking-widest mb-1.5">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="text-sm sm:text-base font-medium text-[#1A1A1A] mb-2 line-clamp-2 tracking-tight leading-snug">
            {product.name}
          </h3>

          {/* Description - Hide on mobile, show on sm+ */}
          <p className="hidden sm:block text-sm text-[#6B7280] mb-3 line-clamp-2 leading-relaxed flex-grow">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-end justify-between pt-3 border-t border-[#E5E7EB] mt-auto">
            <div className="flex-1 min-w-0">
              {hasDiscount ? (
                // B2B Price
                <div className="space-y-0.5">
                  {minB2BPrice === maxB2BPrice ? (
                    <>
                      <p className="text-base sm:text-lg font-semibold text-[#1A1A1A] truncate">
                        Rp {minB2BPrice.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-[#9CA3AF] line-through truncate">
                        Rp {minPrice.toLocaleString("id-ID")}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-base sm:text-lg font-semibold text-[#1A1A1A] truncate">
                        Rp {minB2BPrice.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-[#9CA3AF] line-through truncate">
                        Rp {minPrice.toLocaleString("id-ID")}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                // Regular Price
                <>
                  {minPrice === maxPrice ? (
                    <p className="text-base sm:text-lg font-semibold text-[#1A1A1A] truncate">
                      Rp {minPrice.toLocaleString("id-ID")}
                    </p>
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-[#1A1A1A] truncate">
                      Rp {minPrice.toLocaleString("id-ID")}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="text-[10px] sm:text-xs uppercase tracking-wider ml-3 flex-shrink-0">
              {product.variants.some((v) => v.stock > 0) ? (
                <span className="text-[#10B981] font-medium">In Stock</span>
              ) : (
                <span className="text-[#EF4444] font-medium">Out</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
