"use client";

/**
 * Product Grid Component
 * Displays products in a responsive grid with loading skeletons
 */

import { useTranslations } from "next-intl";
import ProductCard from "./ProductCard";
import Loading, { ProductGridSkeleton } from "@/components/ui/Loading";
import Link from "next/link";

export default function ProductGrid({ products, loading, columns = 4 }) {
  const t = useTranslations("products");

  // Show skeleton loading
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20 px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
          <span className="text-4xl sm:text-5xl">☕</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-2">
          {t("noProducts")}
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
          {t("noProductsMessage")}
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-[#1A1A1A] text-white text-sm uppercase tracking-wider font-medium hover:bg-black transition-colors"
        >
          {t("allCategories")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
