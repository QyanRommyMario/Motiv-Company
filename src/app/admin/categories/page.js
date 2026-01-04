"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Loading from "@/components/ui/Loading";

const categoryTypes = [
  {
    value: "ARABICA",
    label: "Arabica",
    description: "Kopi premium dengan cita rasa kompleks",
  },
  {
    value: "ROBUSTA",
    label: "Robusta",
    description: "Kopi kuat dengan kafein tinggi",
  },
  {
    value: "BLEND",
    label: "Blend",
    description: "Campuran arabica dan robusta",
  },
  { value: "INSTANT", label: "Instant", description: "Kopi instan praktis" },
];

export default function AdminCategoriesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products?limit=100");
      if (response.ok) {
        const data = await response.json();
        const allProducts = data.products || [];
        setProducts(allProducts);
        calculateStatistics(allProducts);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (allProducts) => {
    const stats = categoryTypes.map((cat) => {
      const categoryProducts = allProducts.filter(
        (p) => p.category === cat.value
      );

      const totalStock = categoryProducts.reduce((sum, p) => {
        return sum + (p.variants?.reduce((vSum, v) => vSum + v.stock, 0) || 0);
      }, 0);

      const avgPrice =
        categoryProducts.length > 0
          ? categoryProducts.reduce((sum, p) => {
              const prices = p.variants?.map((v) => v.price) || [];
              const avgProductPrice =
                prices.length > 0
                  ? prices.reduce((a, b) => a + b, 0) / prices.length
                  : 0;
              return sum + avgProductPrice;
            }, 0) / categoryProducts.length
          : 0;

      return {
        ...cat,
        productCount: categoryProducts.length,
        totalStock,
        avgPrice,
        products: categoryProducts,
      };
    });

    setStatistics(stats);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "ARABICA":
        return (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        );
      case "ROBUSTA":
        return (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "BLEND":
        return (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        );
      case "INSTANT":
        return (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Manajemen Kategori
          </h1>
          <p className="text-[#6B7280] mt-2">
            Overview kategori produk kopi - Total: {products.length} produk
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-[#92400E] shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-bold text-[#92400E] mb-1">
                Informasi Kategori
              </h3>
              <p className="text-sm text-[#92400E]">
                Kategori produk bersifat tetap dan tidak dapat diubah. Kategori
                ini digunakan untuk mengklasifikasikan jenis kopi berdasarkan
                tipe biji dan proses pembuatan. Anda dapat menambah produk baru
                ke kategori yang sudah ada.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat) => (
              <div
                key={stat.value}
                className="bg-white border-2 border-[#E5E7EB] hover:border-[#1A1A1A] transition-all duration-300 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#1A1A1A]">
                    {getCategoryIcon(stat.value)}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#1A1A1A]">
                      {stat.productCount}
                    </div>
                    <div className="text-xs text-[#6B7280] uppercase tracking-wider">
                      Produk
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  {stat.label}
                </h3>
                <p className="text-sm text-[#6B7280] mb-4">
                  {stat.description}
                </p>

                <div className="space-y-2 pt-4 border-t-2 border-[#E5E7EB]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider">
                      Total Stok
                    </span>
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {stat.totalStock} unit
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider">
                      Harga Rata-rata
                    </span>
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {formatCurrency(stat.avgPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Details */}
        {!loading && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-3">
              Detail Produk per Kategori
            </h2>

            {statistics.map((stat) => (
              <div
                key={stat.value}
                className="bg-white border border-[#E5E7EB] shadow-sm"
              >
                <div className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-[#1A1A1A]">
                        {getCategoryIcon(stat.value)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1A1A1A]">
                          {stat.label}
                        </h3>
                        <p className="text-sm text-[#6B7280]">
                          {stat.productCount} produk tersedia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {stat.products.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <p className="text-[#6B7280] font-medium">
                        Belum ada produk dalam kategori ini
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stat.products.map((product) => (
                        <div
                          key={product.id}
                          className="border border-[#E5E7EB] hover:border-[#1A1A1A] transition-all p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 bg-[#F3F4F6] shrink-0 flex items-center justify-center">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg
                                  className="w-8 h-8 text-[#9CA3AF]"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M2 21h19v-3H2v3zM20 8H3v8h17V8zM4 14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#1A1A1A] text-sm mb-1 truncate">
                                {product.name}
                              </h4>
                              <p className="text-xs text-[#6B7280] mb-2">
                                {product.variants?.length || 0} varian
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-[#1A1A1A]">
                                  Stok:{" "}
                                  {product.variants?.reduce(
                                    (sum, v) => sum + v.stock,
                                    0
                                  ) || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
