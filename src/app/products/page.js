"use client";

/**
 * Products Page
 * Browse all products with filter and search
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter from "@/components/products/ProductFilter";

export default function ProductsPage() {
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

      if (data.success) {
        setProducts(data.data);
      }
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
    <div className="min-h-screen bg-[#FDFCFA]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1A1A1A] mb-4 tracking-tight">
            Our Collection
          </h1>
          <p className="text-[#6B7280] text-lg">
            Discover our carefully curated selection of premium coffee
          </p>
        </div>

        {/* Filter */}
        <ProductFilter onFilterChange={handleFilterChange} />

        {/* Results count */}
        {!loading && (
          <div className="mb-6 text-sm text-[#9CA3AF] uppercase tracking-wider">
            {products.length} Product{products.length !== 1 ? "s" : ""}
            {filters.category && ` — ${filters.category}`}
            {filters.search && ` — "${filters.search}"`}
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}
