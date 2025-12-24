"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter from "@/components/products/ProductFilter";
import { ProductGridSkeleton } from "@/components/ui/Loading";

// Komponen Konten Utama
function ProductsContent() {
  const t = useTranslations("products");
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      <Navbar />

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 sm:pb-8 md:pb-12">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#1A1A1A] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-[#6B7280] text-sm sm:text-base mt-1">
            {t("subtitle")}
          </p>
        </div>

        <ProductFilter onFilterChange={handleFilterChange} />

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#9CA3AF]">
            <span className="uppercase tracking-wider">
              {products.length} {t("productCount")}
            </span>
            {filters.category && (
              <span className="bg-[#1A1A1A] text-white px-2 py-1 text-xs">
                {filters.category}
              </span>
            )}
            {filters.search && (
              <span className="bg-gray-100 text-[#1A1A1A] px-2 py-1 text-xs">
                "{filters.search}"
              </span>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 bg-[#1A1A1A] text-white text-sm uppercase tracking-wider hover:bg-black transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!error && <ProductGrid products={products} loading={loading} />}
      </div>
    </div>
  );
}

// Loading Fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8">
        {/* Title Skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="h-8 sm:h-10 bg-[#E5E7EB] w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-[#E5E7EB] w-72 animate-pulse" />
        </div>
        {/* Filter Skeleton */}
        <div className="bg-white border border-[#E5E7EB] p-6 mb-8 animate-pulse">
          <div className="h-4 bg-[#E5E7EB] w-32 mb-4" />
          <div className="h-10 bg-[#E5E7EB] w-full mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-[#E5E7EB] w-24" />
            ))}
          </div>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

// Halaman Utama
export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductsContent />
    </Suspense>
  );
}
