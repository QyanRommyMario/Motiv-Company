"use client";

/**
 * CartSummary Component
 * Display cart totals and checkout button
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function CartSummary({ items, isB2B = false }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

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
    // Navigate to checkout page
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Ringkasan Belanja
      </h2>

      {/* Items Count */}
      <div className="flex justify-between text-gray-600 mb-2">
        <span>Total Item</span>
        <span>{totalItems} item</span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between text-gray-600 mb-2">
        <span>Subtotal</span>
        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
      </div>

      {/* B2B Discount Badge */}
      {isB2B && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">
            ✨ Anda mendapatkan harga khusus B2B!
          </p>
        </div>
      )}

      {/* Shipping Note */}
      <div className="flex justify-between text-gray-600 mb-4 pb-4 border-b">
        <span>Ongkos Kirim</span>
        <span className="text-sm text-gray-500">Dihitung di checkout</span>
      </div>

      {/* Total */}
      <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
        <span>Total</span>
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
        {isProcessing ? "Memproses..." : "Lanjut ke Checkout"}
      </Button>

      {/* Continue Shopping */}
      <button
        onClick={() => router.push("/products")}
        className="w-full mt-3 text-center text-gray-900 hover:text-gray-700 text-sm"
      >
        ← Lanjut Belanja
      </button>

      {/* Info */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-xs text-gray-500 text-center">
          Harga sudah termasuk PPN 11%
        </p>
      </div>
    </div>
  );
}
