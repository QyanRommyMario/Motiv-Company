"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="bg-white border border-[#E5E7EB] p-5 sm:p-6 sticky top-24">
      <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-5 pb-4 border-b border-gray-100">
        {t("summaryTitle")}
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{t("totalItems")}</span>
          <span className="text-[#1A1A1A] font-medium">{totalItems} item</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{t("subtotal")}</span>
          <span className="text-[#1A1A1A] font-medium">
            Rp {subtotal.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{t("shipping")}</span>
          <span className="text-gray-400 text-xs">{t("shippingCalc")}</span>
        </div>
      </div>

      {isB2B && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3 mt-4">
          <p className="text-sm text-blue-700 font-medium">{t("b2bMessage")}</p>
        </div>
      )}

      <div className="flex justify-between items-center text-lg font-bold text-[#1A1A1A] mt-5 pt-4 border-t border-gray-100">
        <span>{t("total")}</span>
        <span>Rp {total.toLocaleString("id-ID")}</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={items.length === 0 || isProcessing}
        className="w-full mt-5 py-4 bg-[#1A1A1A] text-white text-sm uppercase tracking-widest font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t("processing")}
          </>
        ) : (
          <>
            {t("checkout")}
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </>
        )}
      </button>

      <button
        onClick={() => router.push("/products")}
        className="w-full mt-3 py-3 text-center text-[#1A1A1A] hover:bg-gray-50 text-sm transition-colors flex items-center justify-center gap-1"
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {t("continueShopping")}
      </button>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">{t("taxIncluded")}</p>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Secure
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Protected
          </div>
        </div>
      </div>
    </div>
  );
}
