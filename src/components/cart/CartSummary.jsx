"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function CartSummary({ items, isB2B = false }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const t = useTranslations("cart");

  const subtotal = items.reduce((total, item) => {
    const price = item.b2bPrice || item.price;
    return total + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const total = subtotal;

  const handleCheckout = async () => {
    setIsProcessing(true);
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {t("summaryTitle")}
      </h2>

      <div className="flex justify-between text-gray-600 mb-2">
        <span>{t("totalItems")}</span>
        <span>{totalItems} item</span>
      </div>

      <div className="flex justify-between text-gray-600 mb-2">
        <span>{t("subtotal")}</span>
        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
      </div>

      {isB2B && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">{t("b2bMessage")}</p>
        </div>
      )}

      <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 mb-6">
        <span>{t("total")}</span>
        <span>Rp {total.toLocaleString("id-ID")}</span>
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={handleCheckout}
        disabled={items.length === 0 || isProcessing}
      >
        {isProcessing ? t("processing") : t("checkout")}
      </Button>

      <button
        onClick={() => router.push("/products")}
        className="w-full mt-3 text-center text-gray-900 hover:text-gray-700 text-sm"
      >
        ← {t("continueShopping")}
      </button>

      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-xs text-gray-500">{t("taxIncluded")}</p>
      </div>
    </div>
  );
}
