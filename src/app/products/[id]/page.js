"use client";

/**
 * Product Detail Page
 * Single product view with add to cart
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import ProductDetail from "@/components/products/ProductDetail";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("products");
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
        setError(data.message || t("productNotFound"));
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(t("errorLoadingProduct"));
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
      <div className="min-h-screen bg-[#FDFCFA] pt-16">
        <Navbar />
        <Loading fullScreen />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFCFA] pt-16">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              {error || t("productNotFound")}
            </h2>
            <p className="text-[#6B7280] mb-6">
              {t("productNotFoundDesc")}
            </p>
            <Link href="/products">
              <Button variant="primary">{t("backToCatalog")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 text-xs sm:text-sm overflow-x-auto">
          <ol className="flex items-center space-x-2 text-[#6B7280] whitespace-nowrap">
            <li>
              <Link href="/" className="hover:text-[#1A1A1A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-[#1A1A1A]">
                Products
              </Link>
            </li>
            <li>/</li>
            <li className="text-[#1A1A1A] font-medium truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Detail */}
        <div className="bg-white shadow-md p-4 sm:p-6 lg:p-8 border border-[#E5E7EB]">
          <ProductDetail product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 pb-6 sm:pb-8">
            <div className="border-t border-[#E5E7EB] pt-6 sm:pt-8">
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-4 sm:mb-6">
                {t("relatedProducts")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.id}`}
                    className="group bg-white border border-[#E5E7EB] overflow-hidden hover:border-[#1A1A1A] hover:shadow-lg transition-all"
                  >
                    <div className="aspect-[4/3] relative bg-[#F9FAFB] overflow-hidden">
                      {relatedProduct.images &&
                      relatedProduct.images.length > 0 ? (
                        <img
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
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
                        <span className="inline-block px-2 py-1 bg-white/90 backdrop-blur-sm text-[#6B7280] text-xs font-medium shadow-sm">
                          {relatedProduct.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#1A1A1A] mb-1 group-hover:text-[#6B7280] transition-colors line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      {relatedProduct.variants &&
                        relatedProduct.variants.length > 0 && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold text-[#1A1A1A]">
                              Rp{" "}
                              {relatedProduct.variants[0].price.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                            <span className="text-xs text-[#6B7280] font-medium group-hover:text-[#1A1A1A] transition-colors">
                              {t("viewProduct")}
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
