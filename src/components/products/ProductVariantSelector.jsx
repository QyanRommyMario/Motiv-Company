"use client";

/**
 * Product Variant Selector Component
 * Select product variant (size/weight)
 */

import { useState } from "react";

export default function ProductVariantSelector({ variants, onSelectVariant }) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants.find((v) => v.stock > 0)?.id || variants[0]?.id
  );

  const handleSelect = (variant) => {
    setSelectedVariantId(variant.id);
    onSelectVariant(variant);
  };

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
        Pilih Varian
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = variant.stock === 0;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && handleSelect(variant)}
              disabled={isOutOfStock}
              className={`
                p-3 sm:p-4 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? "border-gray-900 bg-gray-100"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }
                ${
                  isOutOfStock
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
            >
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {variant.name}
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                  Rp {variant.price.toLocaleString("id-ID")}
                </p>
                {variant.originalPrice && (
                  <p className="text-xs sm:text-sm text-gray-500 line-through">
                    Rp {variant.originalPrice.toLocaleString("id-ID")}
                  </p>
                )}
                {variant.discountPercentage && (
                  <p className="text-xs text-gray-900 font-semibold mt-1">
                    -{variant.discountPercentage}% B2B
                  </p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    isOutOfStock ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {isOutOfStock ? "Habis" : `Stok: ${variant.stock}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
