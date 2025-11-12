"use client";

/**
 * Cart Page
 * Shopping cart with items and summary
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmpty from "@/components/cart/CartEmpty";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, router]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (data.success) {
        setCartItems(data.data.items || []);
      } else {
        setAlert({ type: "error", message: data.message });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setAlert({ type: "error", message: "Gagal memuat keranjang" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();

      if (data.success) {
        // Update local state
        setCartItems((items) =>
          items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
        setAlert({ type: "success", message: "Keranjang diupdate" });
      } else {
        setAlert({ type: "error", message: data.message });
        // Revert quantity change
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setAlert({ type: "error", message: "Gagal mengupdate keranjang" });
      // Revert quantity change
      await fetchCart();
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setCartItems((items) => items.filter((item) => item.id !== itemId));
        setAlert({ type: "success", message: "Item dihapus dari keranjang" });
      } else {
        setAlert({ type: "error", message: data.message });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setAlert({ type: "error", message: "Gagal menghapus item" });
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Kosongkan semua item di keranjang?")) return;

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setCartItems([]);
        setAlert({ type: "success", message: "Keranjang dikosongkan" });
      } else {
        setAlert({ type: "error", message: data.message });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      setAlert({ type: "error", message: "Gagal mengosongkan keranjang" });
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FDFCFA]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A1A1A]"></div>
        </div>
      </div>
    );
  }

  const isB2B = session?.user?.role === "B2B";

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24 lg:pt-28">
        {/* Alert */}
        {alert && (
          <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm rounded">
            {alert.message}
          </div>
        )}

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 lg:mb-12 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#1A1A1A] tracking-tight">
            Shopping Cart
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm uppercase tracking-wider text-[#6B7280] hover:text-[#EF4444] transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary items={cartItems} isB2B={isB2B} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
