"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import Button from "@/components/ui/Button";

/**
 * Checkout Success Page
 * Order confirmation page after successful payment
 */

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // Clear cart data from localStorage
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Checkout Steps */}
        <CheckoutSteps currentStep={4} />

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Pesanan Berhasil!
          </h1>
          <p className="text-gray-600 mb-6">
            Terima kasih telah berbelanja. Pesanan Anda sedang diproses.
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 inline-block">
              <p className="text-sm text-gray-600 mb-1">ID Pesanan</p>
              <p className="text-xl font-bold text-gray-900">{orderId}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">Langkah Selanjutnya:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Konfirmasi pesanan telah dikirim ke email Anda</li>
                  <li>Pesanan akan diproses dalam 1-2 hari kerja</li>
                  <li>Anda dapat melacak pesanan di halaman Pesanan Saya</li>
                  <li>Hubungi customer service jika ada pertanyaan</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/products")}>
              Lanjut Belanja
            </Button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
