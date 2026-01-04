"use client";

/**
 * Product Detail Component
 * Displays product details with add to cart functionality
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import ProductVariantSelector from "./ProductVariantSelector";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function ProductDetail({ product }) {
  const t = useTranslations("productDetail");
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v) => v.stock > 0) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [alert, setAlert] = useState(null);

  // Calculate B2B price
  const hasB2BDiscount =
    session?.user?.role === "B2B" && session.user.discount > 0;
  const discount = session?.user?.discount || 0;
  const originalPrice = selectedVariant?.price || 0;
  const b2bPrice = hasB2BDiscount
    ? originalPrice - (originalPrice * discount) / 100
    : originalPrice;

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= selectedVariant.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    setAlert(null);

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAlert({
          type: "success",
          message: t("addedToCart"),
        });
        setTimeout(() => {
          router.push("/cart");
        }, 1500);
      } else {
        setAlert({ type: "error", message: data.message });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: t("addToCartError"),
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      {/* Image Gallery */}
      <div>
        <div className="bg-gray-200 rounded-lg overflow-hidden mb-4">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
          ) : (
            <div className="w-full h-64 sm:h-80 md:h-96 flex items-center justify-center text-gray-400">
              <span className="text-6xl sm:text-9xl">☕</span>
            </div>
          )}
        </div>

        {/* Thumbnail gallery */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className="bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-75"
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-20 sm:h-24 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        {/* Category */}
        <p className="text-xs sm:text-sm text-gray-900 font-semibold uppercase mb-2">
          {product.category}
        </p>

        {/* Name */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          {product.name}
        </h1>

        {/* B2B Badge */}
        {hasB2BDiscount && (
          <div className="inline-block bg-gray-100 text-gray-900 px-3 sm:px-4 py-2 rounded-lg mb-4 text-sm sm:text-base">
            <span className="font-semibold">{t("b2bSpecialPrice")}</span>
            <span className="ml-2">-{discount}%</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-6">
          {selectedVariant ? (
            hasB2BDiscount ? (
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Rp {b2bPrice.toLocaleString("id-ID")}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-base sm:text-lg text-gray-500 line-through">
                    Rp {originalPrice.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-900 font-semibold">
                    {t("save")}{" "}
                    {(originalPrice - b2bPrice).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                Rp {originalPrice.toLocaleString("id-ID")}
              </div>
            )
          ) : (
            <div className="text-gray-500 text-sm sm:text-base">
              {t("selectVariant")}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed">
          {product.description}
        </p>

        {/* Variant Selector */}
        <div className="mb-6">
          <ProductVariantSelector
            variants={product.variants}
            onSelectVariant={handleVariantSelect}
          />
        </div>

        {/* Quantity Selector */}
        {selectedVariant && selectedVariant.stock > 0 && (
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
              {t("quantity")}
            </label>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-lg sm:text-xl"
              >
                -
              </button>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 w-12 sm:w-16 text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= selectedVariant.stock}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-lg sm:text-xl"
              >
                +
              </button>
              <span className="text-xs sm:text-sm text-gray-600">
                {t("stock")}: {selectedVariant.stock}
              </span>
            </div>
          </div>
        )}

        {/* Alert */}
        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          variant="primary"
          className="w-full text-base sm:text-lg py-3 sm:py-4"
          disabled={!selectedVariant || selectedVariant.stock === 0 || isAdding}
          loading={isAdding}
        >
          {selectedVariant && selectedVariant.stock > 0 ? (
            hasB2BDiscount ? (
              `${t("addToCart")} - Rp ${(b2bPrice * quantity).toLocaleString(
                "id-ID"
              )}`
            ) : (
              `${t("addToCart")} - Rp ${(
                originalPrice * quantity
              ).toLocaleString("id-ID")}`
            )
          ) : (
            t("outOfStock")
          )}
        </Button>

        {/* Product Description */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 text-lg uppercase tracking-wider">
            {t("productDescription")}
          </h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>

          {/* Features if available */}
          {product.features && product.features.length > 0 && (
            <div className="mt-6 space-y-3">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start text-sm">
                  <span className="text-gray-900 mr-2 font-bold">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {hasB2BDiscount && (
            <div className="mt-4 flex items-start text-sm text-gray-900 font-semibold bg-gray-100 p-3 rounded-lg">
              <span className="mr-2 font-bold">✓</span>
              <span>{t("b2bDiscount", { discount: discount })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
