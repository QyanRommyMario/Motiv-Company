/**
 * Cart ViewModel
 * Handles shopping cart business logic
 */

import { CartModel } from "@/models/CartModel";
import { ProductVariantModel } from "@/models/ProductVariantModel";
import prisma from "@/lib/prisma";

export class CartViewModel {
  /**
   * Get user's cart
   */
  static async getCart(userId, userDiscount = 0) {
    try {
      const cartItems = await CartModel.getByUserId(userId);

      console.log("📦 Raw cart items from DB:", cartItems.length);

      // Calculate totals
      let subtotal = 0;
      const items = cartItems.map((item) => {
        const variantPrice = item.variant?.price || 0;
        const discountedPrice =
          userDiscount > 0
            ? variantPrice - (variantPrice * userDiscount) / 100
            : variantPrice;

        const itemTotal = discountedPrice * item.quantity;
        subtotal += itemTotal;

        console.log("🖼️ Cart item product data:", {
          productId: item.product?.id,
          productName: item.product?.name,
          hasImages: !!item.product?.images,
          imagesLength: item.product?.images?.length,
          firstImage: item.product?.images?.[0],
        });

        // Return properly structured item for frontend
        return {
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product?.id,
            name: item.product?.name,
            images: item.product?.images || [],
          },
          variant: item.variant,
          // Add price fields expected by CartItem component
          price: variantPrice,
          b2bPrice: userDiscount > 0 ? discountedPrice : null,
          unitPrice: variantPrice,
          discountedPrice: discountedPrice,
          itemTotal: itemTotal,
        };
      });

      console.log("✅ Formatted cart items:", items.length);

      return {
        success: true,
        data: {
          items,
          subtotal,
          itemCount: items.length,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        },
      };
    } catch (error) {
      console.error("❌ getCart error:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Alias for getCart (for backward compatibility)
   */
  static async getUserCart(userId, userDiscount = 0) {
    return this.getCart(userId, userDiscount);
  }

  /**
   * Validate cart item before adding/updating
   */
  static async validateCartItem(variantId, quantity) {
    try {
      // Check if quantity is valid
      if (!quantity || quantity <= 0) {
        return {
          valid: false,
          message: "Jumlah harus lebih dari 0",
        };
      }

      // Check if variant exists and has enough stock
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
          product: true,
        },
      });

      if (!variant) {
        return {
          valid: false,
          message: "Varian produk tidak ditemukan",
        };
      }

      if (variant.stock < quantity) {
        return {
          valid: false,
          message: `Stok tidak cukup. Tersedia: ${variant.stock}`,
        };
      }

      return {
        valid: true,
        variant,
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
      };
    }
  }

  /**
   * Get cart item by ID
   */
  static async getCartItemById(cartItemId) {
    try {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      });

      return cartItem;
    } catch (error) {
      throw new Error(`Error getting cart item: ${error.message}`);
    }
  }

  /**
   * Update cart item
   */
  static async updateCartItem(cartItemId, quantity) {
    try {
      const updatedItem = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      });

      return updatedItem;
    } catch (error) {
      throw new Error(`Error updating cart item: ${error.message}`);
    }
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId, variantId, quantity) {
    try {
      console.log("🛒 addToCart called with:", { userId, variantId, quantity });

      // Get variant with product info
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      console.log("🔍 Found variant:", variant ? variant.name : "NOT FOUND");

      if (!variant) {
        throw new Error("Varian produk tidak ditemukan");
      }

      // Check if adding to existing cart item
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_variantId: {
            userId,
            variantId,
          },
        },
      });

      console.log(
        "🔍 Existing cart item:",
        existingItem ? "FOUND (updating)" : "NOT FOUND (creating new)"
      );

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;

        console.log(
          `📊 Updating quantity: ${existingItem.quantity} + ${quantity} = ${newQuantity}`
        );

        if (variant.stock < newQuantity) {
          throw new Error(`Stok tidak cukup. Tersedia: ${variant.stock}`);
        }

        const updated = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        });

        console.log("✅ Cart item UPDATED:", updated.id);
        return updated;
      } else {
        // Create new cart item
        console.log(`📊 Creating new cart item with quantity: ${quantity}`);

        if (variant.stock < quantity) {
          throw new Error(`Stok tidak cukup. Tersedia: ${variant.stock}`);
        }

        const cartItem = await prisma.cartItem.create({
          data: {
            userId,
            productId: variant.productId,
            variantId,
            quantity,
          },
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        });

        console.log("✅ Cart item CREATED:", cartItem.id);
        return cartItem;
      }
    } catch (error) {
      console.error("❌ addToCart error:", error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(cartItemId, quantity) {
    try {
      if (quantity <= 0) {
        throw new Error("Jumlah harus lebih dari 0");
      }

      // Get cart item to check stock
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { variant: true },
      });

      if (!cartItem) {
        throw new Error("Item tidak ditemukan");
      }

      if (cartItem.variant.stock < quantity) {
        throw new Error("Stok tidak cukup");
      }

      await CartModel.updateQuantity(cartItemId, quantity);

      return {
        success: true,
        message: "Jumlah berhasil diperbarui",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(cartItemId) {
    try {
      await CartModel.removeItem(cartItemId);

      return {
        success: true,
        message: "Produk berhasil dihapus dari keranjang",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Clear cart
   */
  static async clearCart(userId) {
    try {
      await CartModel.clearCart(userId);

      return {
        success: true,
        message: "Keranjang berhasil dikosongkan",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
