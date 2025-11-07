"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Loading from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      params.append("limit", "50");

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/admin/products/${selectedProduct.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Produk berhasil dihapus!");
        fetchProducts();
        setShowDeleteModal(false);
        setSelectedProduct(null);
      } else {
        const data = await response.json();
        alert(data.message || "Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return product.name.toLowerCase().includes(searchLower);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              Manajemen Produk
            </h1>
            <p className="text-[#6B7280] mt-2">
              Kelola produk kopi Anda - Total: {filteredProducts.length} produk
            </p>
          </div>
          <Link
            href="/admin/products/create"
            className="px-6 py-3 bg-[#1A1A1A] text-white hover:bg-black transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Produk
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Cari Produk
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Nama produk..."
                  className="flex-1 px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-[#1A1A1A] text-white hover:bg-black transition-colors font-medium"
                >
                  Cari
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] font-medium bg-white"
              >
                <option value="">Semua Kategori</option>
                <option value="ARABICA">Arabica</option>
                <option value="ROBUSTA">Robusta</option>
                <option value="BLEND">Blend</option>
                <option value="INSTANT">Instant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-[#9CA3AF]"
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
            <p className="text-[#6B7280] font-medium">Tidak ada produk</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#1A1A1A] transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="aspect-square bg-[#F3F4F6] relative flex-shrink-0">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-20 h-20 text-[#9CA3AF]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M2 21h19v-3H2v3zM20 8H3v8h17V8zM4 14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3z" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>

                {/* Content - Flex grow to push buttons to bottom */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-[#1A1A1A] mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#6B7280] mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Variants */}
                  <div className="mb-4 flex-grow">
                    <p className="text-xs font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">
                      {product.variants?.length || 0} Varian Tersedia
                    </p>
                    <div className="space-y-1.5">
                      {product.variants?.slice(0, 2).map((variant) => (
                        <div
                          key={variant.id}
                          className="flex justify-between text-sm bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2"
                        >
                          <span className="font-semibold text-[#1A1A1A]">
                            {variant.size}
                          </span>
                          <span className="font-bold text-[#1A1A1A]">
                            {formatCurrency(variant.price)}
                          </span>
                        </div>
                      ))}
                      {product.variants?.length > 2 && (
                        <p className="text-xs text-[#6B7280] font-medium pl-3">
                          +{product.variants.length - 2} varian lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock Warning */}
                  {product.variants?.some((v) => v.stock < 10) && (
                    <div className="mb-4 p-3 bg-[#FEF3C7] border-l-4 border-[#F59E0B] text-xs text-[#92400E] font-semibold flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Beberapa varian stok menipis
                    </div>
                  )}

                  {/* Actions - Fixed positioning */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[#E5E7EB]">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex-1 px-4 py-2.5 bg-[#1A1A1A] text-white hover:bg-black transition-colors text-sm font-semibold text-center flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 px-4 py-2.5 bg-white text-[#DC2626] border-2 border-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full p-8 border-4 border-[#1A1A1A]">
              <div className="text-center mb-6">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-[#DC2626]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                  Hapus Produk?
                </h3>
                <p className="text-[#6B7280] mb-2">
                  Apakah Anda yakin ingin menghapus produk{" "}
                  <strong className="text-[#1A1A1A]">
                    {selectedProduct.name}
                  </strong>
                  ?
                </p>
                <p className="text-sm text-[#DC2626] font-semibold mt-3 bg-[#FEE2E2] py-2 px-4 border border-[#DC2626]">
                  Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all font-semibold"
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors disabled:opacity-50 font-semibold"
                  disabled={deleting}
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
