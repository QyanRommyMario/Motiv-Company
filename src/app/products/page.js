"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter from "@/components/products/ProductFilter";

// 1. Komponen Konten (Butuh useTranslations)
function ProductsContent() {
  const t = useTranslations("products");
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1A1A1A] mb-3 md:mb-4 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-[#6B7280] text-base md:text-lg">{t("subtitle")}</p>
        </div>

        <ProductFilter onFilterChange={handleFilterChange} />

        {!loading && (
          <div className="mb-4 md:mb-6 text-xs sm:text-sm text-[#9CA3AF] uppercase tracking-wider">
            {products.length} {t("productCount", { count: products.length })}
            {filters.category && ` — ${filters.category}`}
            {filters.search && ` — "${filters.search}"`}
          </div>
        )}

        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}

// 2. Komponen Loading (Terpisah agar bisa dipanggil di Suspense)
function LoadingFallback() {
  const t = useTranslations("products"); // Panggil hook di sini
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          {/* Teks Loading Dinamis */}
          <p className="text-gray-600">{t("loadingProducts")}</p>
        </div>
      </div>
    </div>
  );
}

// 3. Halaman Utama
export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* Note: LoadingFallback harus client component jika pakai useTranslations, 
         tapi karena ini file "use client", function di dalamnya aman. */}
      <ProductsContent />
    </Suspense>
  );
}
