"use client";

/**
 * Product Detail Page
 * Single product view with add to cart
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProductDetail from "@/components/products/ProductDetail";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        // Fetch related products after getting the product
        fetchRelatedProducts(data.data.category, data.data.id);
      } else {
        setError(data.message || "Produk tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Terjadi kesalahan saat memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category, currentProductId) => {
    try {
      // First, try to get products from same category
      let response = await fetch(`/api/products?category=${category}&limit=10`);
      let data = await response.json();

      // Handle response format
      let products = [];
      if (data.success === true && Array.isArray(data.data)) {
        products = data.data;
      } else if (data.success === undefined && Array.isArray(data.data)) {
        products = data.data;
      } else if (Array.isArray(data)) {
        products = data;
      }

      // Filter out current product
      let filtered = products.filter((p) => p.id !== currentProductId);

      // If we don't have enough products from same category, get from all categories
      if (filtered.length < 3) {
        response = await fetch(`/api/products?limit=10`);
        data = await response.json();

        if (data.success === true && Array.isArray(data.data)) {
          products = data.data;
        } else if (data.success === undefined && Array.isArray(data.data)) {
          products = data.data;
        } else if (Array.isArray(data)) {
          products = data;
        }

        filtered = products.filter((p) => p.id !== currentProductId);
      }

      // Take only first 3
      const final = filtered.slice(0, 3);
      setRelatedProducts(final);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loading fullScreen />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Produk Tidak Ditemukan"}
            </h2>
            <p className="text-gray-600 mb-6">
              Produk yang Anda cari tidak tersedia
            </p>
            <Link href="/products">
              <Button variant="primary">Kembali ke Katalog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-24 sm:pt-28 lg:pt-32">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 text-xs sm:text-sm overflow-x-auto">
          <ol className="flex items-center space-x-2 text-gray-600 whitespace-nowrap">
            <li>
              <Link href="/" className="hover:text-amber-600">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-amber-600">
                Products
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Detail */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          <ProductDetail product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 pb-6 sm:pb-8">
            <div className="border-t border-gray-200 pt-6 sm:pt-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Produk Lainnya
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.id}`}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-900 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-[4/3] relative bg-gray-50 overflow-hidden">
                      {relatedProduct.images &&
                      relatedProduct.images.length > 0 ? (
                        <img
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg
                            className="w-16 h-16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="inline-block px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded shadow-sm">
                          {relatedProduct.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      {relatedProduct.variants &&
                        relatedProduct.variants.length > 0 && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold text-gray-900">
                              Rp{" "}
                              {relatedProduct.variants[0].price.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                            <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                              Lihat →
                            </span>
                          </div>
                        )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
