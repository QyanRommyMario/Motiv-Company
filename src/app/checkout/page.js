"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import useCartStore from "@/store/cartStore";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import AddressSelector from "@/components/checkout/AddressSelector";
import ShippingCalculator from "@/components/checkout/ShippingCalculator";
import OrderSummary from "@/components/checkout/OrderSummary";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";

/**
 * Checkout Page
 * Multi-step checkout: Address → Shipping → Payment
 */

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, syncWithServer } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    if (status === "authenticated") {
      initializeCheckout();
    }
  }, [status]);

  const initializeCheckout = async () => {
    try {
      await syncWithServer();
      setLoading(false);
    } catch (err) {
      setError(t("loadCheckoutError"));
      setLoading(false);
    }
  };

  const calculateTotalWeight = () => {
    // Calculate total weight from cart items (in grams)
    // Default: 1000g per item if weight not specified
    return items.reduce((total, item) => {
      const weight = item.product?.weight || 1000;
      return total + weight * item.quantity;
    }, 0);
  };

  const handleProceedToPayment = async () => {
    // Validate
    if (!selectedAddress) {
      setError(t("selectAddressError"));
      return;
    }

    if (!selectedShipping) {
      setError(t("selectShippingError"));
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => {
        // [FIX] Gunakan harga B2B jika ada untuk user B2B
        const price = item.discountedPrice || item.b2bPrice || item.price || item.variant?.price || 0;
        return sum + price * item.quantity;
      }, 0);

      // Calculate total (subtotal + shipping)
      const total = subtotal + selectedShipping.cost;

      // Prepare order data with all required fields
      const orderData = {
        shippingAddressId: selectedAddress.id,
        shipping: {
          courier: selectedShipping.courier,
          service: selectedShipping.service,
          cost: selectedShipping.cost,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
          // [FIX] Simpan harga yang sudah didiskon untuk B2B
          price: item.discountedPrice || item.b2bPrice || item.price || item.variant.price,
        })),
        subtotal: subtotal,
        total: total,
        notes: notes,
      };

      // Store order data in sessionStorage for payment page
      sessionStorage.setItem("checkoutData", JSON.stringify(orderData));

      router.push("/checkout/payment");
    } catch (err) {
      setError(t("createOrderError"));
      setProcessing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <svg
            className="w-24 h-24 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold mb-2">{tCart("empty")}</h1>
          <p className="text-gray-600 mb-6">{tCart("emptyDescription")}</p>
          <Button onClick={() => router.push("/products")}>
            {tCart("shopNow")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280]">{t("subtitle")}</p>
        </div>

        {/* Checkout Steps */}
        <CheckoutSteps currentStep={2} />

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Left Column: Address & Shipping */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Shipping Address Section */}
            <div className="bg-white border border-[#E5E7EB] shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                  {t("shippingAddress")}
                </h2>
              </div>

              <AddressSelector onSelectAddress={setSelectedAddress} />
            </div>

            {/* Shipping Method Section */}
            <div className="bg-white border border-[#E5E7EB] shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                  {t("shippingMethod")}
                </h2>
              </div>

              <ShippingCalculator
                destination={selectedAddress}
                weight={calculateTotalWeight()}
                onSelectShipping={setSelectedShipping}
              />
            </div>

            {/* Order Notes */}
            <div className="bg-white border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-3">
                {t("orderNotes")}
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("orderNotesPlaceholder")}
                rows={4}
                className="w-full px-4 py-3 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none resize-none"
              />
              <p className="text-xs text-[#6B7280] mt-2">
                {t("orderNotesHelp")}
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 z-10 space-y-6">
              <OrderSummary
                items={items}
                shippingCost={selectedShipping?.cost || 0}
                discount={0}
              />

              <div className="space-y-3">
                <Button
                  onClick={handleProceedToPayment}
                  disabled={!selectedAddress || !selectedShipping || processing}
                  fullWidth
                  loading={processing}
                >
                  {t("proceedPayment")}
                </Button>

                <button
                  onClick={() => router.push("/cart")}
                  className="w-full px-6 py-3 border-2 border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] transition font-medium"
                >
                  {t("backToCart")}
                </button>
              </div>

              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-4 text-sm text-[#6B7280]">
                <p className="font-medium mb-2 text-[#1A1A1A]">
                  🔒 {t("secureTransaction")}
                </p>
                <p>{t("secureTransactionDescription")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
