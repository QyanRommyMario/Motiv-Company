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
      <div className="group bg-white border border-[#E5E7EB] hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 bg-[#F5F4F0] overflow-hidden flex-shrink-0">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-20 h-20 text-[#9CA3AF]"
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
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-[#1A1A1A] text-white px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs uppercase tracking-wider">
              -{session.user.discount}% B2B
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 flex-grow flex flex-col">
          {/* Category */}
          <p className="text-[10px] sm:text-xs text-[#9CA3AF] uppercase tracking-widest mb-1 sm:mb-2">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="text-sm sm:text-base md:text-lg font-medium text-[#1A1A1A] mb-2 sm:mb-3 line-clamp-2 tracking-tight">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#6B7280] mb-3 sm:mb-4 line-clamp-2 leading-relaxed flex-grow">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#E5E7EB] mt-auto">
            <div>
              {hasDiscount ? (
                // B2B Price
                <div className="space-y-0.5 sm:space-y-1">
                  {minB2BPrice === maxB2BPrice ? (
                    <>
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-[#1A1A1A]">
                        Rp {minB2BPrice.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs sm:text-sm text-[#9CA3AF] line-through">
                        Rp {minPrice.toLocaleString("id-ID")}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-[#1A1A1A]">
                        Rp {minB2BPrice.toLocaleString("id-ID")} -{" "}
                        {maxB2BPrice.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs sm:text-sm text-[#9CA3AF] line-through">
                        Rp {minPrice.toLocaleString("id-ID")} -{" "}
                        {maxPrice.toLocaleString("id-ID")}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                // Regular Price
                <>
                  {minPrice === maxPrice ? (
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-[#1A1A1A]">
                      Rp {minPrice.toLocaleString("id-ID")}
                    </p>
                  ) : (
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-[#1A1A1A]">
                      Rp {minPrice.toLocaleString("id-ID")} -{" "}
                      {maxPrice.toLocaleString("id-ID")}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="text-[10px] sm:text-xs uppercase tracking-wider flex-shrink-0">
              {product.variants.some((v) => v.stock > 0) ? (
                <span className="text-[#10B981]">Available</span>
              ) : (
                <span className="text-[#EF4444]">Sold Out</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
