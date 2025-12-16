"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function CartSummary({ items, isB2B = false }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const t = useTranslations("cart");

  // Calculate totals
  const subtotal = items.reduce((total, item) => {
    const price = item.b2bPrice || item.price;
    return total + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Shipping will be calculated in checkout
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setIsProcessing(true);
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {t("summaryTitle")}
      </h2>

      {/* Items Count */}
      <div className="flex justify-between text-gray-600 mb-2">
        <span>{t("totalItems")}</span>
        <span>{totalItems} item</span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between text-gray-600 mb-2">
        <span>{t("subtotal")}</span>
        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
      </div>

      {/* B2B Discount Badge */}
      {isB2B && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">{t("b2bMessage")}</p>
        </div>
      )}

      {/* Shipping Note */}
      <div className="flex justify-between text-gray-600 mb-4 pb-4 border-b">
        <span>{t("shipping")}</span>
        <span className="text-sm text-gray-500">{t("shippingCalc")}</span>
      </div>

      {/* Total */}
      <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
        <span>{t("total")}</span>
        <span className="text-gray-900">
          Rp {total.toLocaleString("id-ID")}
        </span>
      </div>

      {/* Checkout Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleCheckout}
        disabled={items.length === 0 || isProcessing}
      >
        {isProcessing ? t("processing") : t("checkout")}
      </Button>

      {/* Continue Shopping */}
      <button
        onClick={() => router.push("/products")}
        className="w-full mt-3 text-center text-gray-900 hover:text-gray-700 text-sm"
      >
        ← {t("continue")}
      </button>

      {/* Info */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-xs text-gray-500 text-center">{t("taxIncluded")}</p>
      </div>
    </div>
  );
}
