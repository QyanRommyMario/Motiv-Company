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

  const handleClearCart = async () => {
    if (!confirm(t("clearCart") + "?")) return;
    try {
      const response = await fetch("/api/cart", { method: "DELETE" });
      const data = await response.json();
      if (data.success) setCartItems([]);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || status === "loading") return <Loading />;

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-[#1A1A1A]">
            {t("summaryTitle")}
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
            >
              {t("clearCart")}
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={fetchCart}
                  onRemove={fetchCart}
                />
              ))}
            </div>
            <div className="lg:col-span-1">
              <CartSummary
                items={cartItems}
                isB2B={session?.user?.role === "B2B"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
