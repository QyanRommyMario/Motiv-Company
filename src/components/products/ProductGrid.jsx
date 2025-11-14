"use client";

/**
 * Product Grid Component
 * Displays products in a responsive grid
 */

import { useTranslations } from "next-intl";
import ProductCard from "./ProductCard";
import Loading from "@/components/ui/Loading";

export default function ProductGrid({ products, loading }) {
  const t = useTranslations("products");

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loading size="lg" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">☕</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t("noProducts")}
        </h3>
        <p className="text-gray-600">{t("noProductsMessage")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
