"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmpty from "@/components/cart/CartEmpty";
import Loading from "@/components/ui/Loading";

export default function CartPage() {
  const t = useTranslations("cart");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    if (status === "authenticated") fetchCart();
  }, [status, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      if (data.success) setCartItems(data.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    setUpdating(true);
    try {
      await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      await fetchCart();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdating(true);
    try {
      await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      await fetchCart();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!confirm(t("clearCart") + "?")) return;
    setUpdating(true);
    try {
      const response = await fetch("/api/cart", { method: "DELETE" });
      const data = await response.json();
      if (data.success) setCartItems([]);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FDFCFA]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
          <div className="h-8 bg-[#E5E7EB] w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E5E7EB] p-5 animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-28 h-28 bg-[#E5E7EB]" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-[#E5E7EB] w-3/4" />
                      <div className="h-3 bg-[#E5E7EB] w-1/2" />
                      <div className="h-5 bg-[#E5E7EB] w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E5E7EB] p-6 animate-pulse">
                <div className="h-6 bg-[#E5E7EB] w-1/2 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-[#E5E7EB]" />
                  <div className="h-4 bg-[#E5E7EB]" />
                  <div className="h-4 bg-[#E5E7EB]" />
                </div>
                <div className="h-12 bg-[#E5E7EB] mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#1A1A1A]">
              {t("summaryTitle")}
            </h1>
            {cartItems.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {t("itemsInCart", { count: cartItems.length })}
              </p>
            )}
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={updating}
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors self-start sm:self-auto disabled:opacity-50"
            >
              {t("clearCart")}
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div
              className={`lg:col-span-2 space-y-4 ${
                updating ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            {/* Cart Summary - Sticky on desktop, fixed on mobile */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <CartSummary
                  items={cartItems}
                  isB2B={session?.user?.role === "B2B"}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Fixed bottom summary bar */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-4 shadow-lg z-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">{t("total")}</p>
              <p className="text-lg font-bold text-[#1A1A1A]">
                Rp{" "}
                {cartItems
                  .reduce(
                    (sum, item) =>
                      sum + (item.b2bPrice || item.price) * item.quantity,
                    0
                  )
                  .toLocaleString("id-ID")}
              </p>
            </div>
            <button
              onClick={() => router.push("/checkout")}
              className="flex-1 max-w-[200px] py-3 bg-[#1A1A1A] text-white text-sm uppercase tracking-wider font-medium"
            >
              {t("checkout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
