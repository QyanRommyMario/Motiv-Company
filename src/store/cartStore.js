import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cart Store using Zustand
 * Manages shopping cart state with localStorage persistence
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      error: null,

      // Actions

      /**
       * Add item to cart or update quantity if exists
       */
      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.variantId === item.variantId
        );

        if (existingIndex > -1) {
          // Update existing item quantity
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          // Add new item
          set({ items: [...items, item] });
        }
      },

      /**
       * Update item quantity
       */
      updateQuantity: (variantId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          // Remove item if quantity is 0
          set({ items: items.filter((i) => i.variantId !== variantId) });
        } else {
          // Update quantity
          const updatedItems = items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          );
          set({ items: updatedItems });
        }
      },

      /**
       * Remove item from cart
       */
      removeItem: (variantId) => {
        const { items } = get();
        set({ items: items.filter((i) => i.variantId !== variantId) });
      },

      /**
       * Clear all items from cart
       */
      clearCart: () => {
        set({ items: [], error: null });
      },

      /**
       * Sync cart with server (for logged-in users)
       */
      syncWithServer: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/cart");
          const data = await response.json();

          if (data.success) {
            set({ items: data.data.items, isLoading: false });
          } else {
            set({ error: data.message, isLoading: false });
          }
        } catch (error) {
          console.error("Error syncing cart:", error);
          set({ error: "Gagal sinkronisasi keranjang", isLoading: false });
        }
      },

      /**
       * Save cart to server (for logged-in users)
       */
      saveToServer: async () => {
        const { items } = get();
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          });
          const data = await response.json();

          if (!data.success) {
            set({ error: data.message, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error saving cart:", error);
          set({ error: "Gagal menyimpan keranjang", isLoading: false });
        }
      },

      /**
       * Get total items count
       */
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      /**
       * Get cart subtotal
       */
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.b2bPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },

      /**
       * Check if item is in cart
       */
      isInCart: (variantId) => {
        const { items } = get();
        return items.some((item) => item.variantId === variantId);
      },

      /**
       * Get item quantity in cart
       */
      getItemQuantity: (variantId) => {
        const { items } = get();
        const item = items.find((i) => i.variantId === variantId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: "cart-storage", // localStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

export default useCartStore;
