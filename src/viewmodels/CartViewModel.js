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

      // Calculate totals
      let subtotal = 0;
      const items = cartItems.map((item) => {
        const variantPrice = item.variant?.price || 0;

        // Hitung harga diskon B2B
        let discountedPrice =
          userDiscount > 0
            ? variantPrice - (variantPrice * userDiscount) / 100
            : variantPrice;

        // [PERBAIKAN KONSISTENSI]
        // Bulatkan harga di sini agar Tampilan Keranjang = Tagihan Midtrans
        discountedPrice = Math.round(discountedPrice);

        // Subtotal dihitung dari harga yang sudah dibulatkan
        const itemTotal = discountedPrice * item.quantity;
        subtotal += itemTotal;

        // Return structured item
        return {
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product?.id,
            name: item.product?.name,
            images: item.product?.images || [],
          },
          variant: item.variant,
          // Harga untuk UI
          price: variantPrice,
          b2bPrice: userDiscount > 0 ? discountedPrice : null, // Harga ini sudah bulat
          unitPrice: variantPrice,
          discountedPrice: discountedPrice,
          itemTotal: itemTotal,
        };
      });

      return {
        success: true,
        data: {
          items,
          subtotal, // Subtotal ini sekarang dijamin Integer (tanpa koma)
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

  // --- Metode di bawah ini tidak perlu diubah (tetap sama) ---

  static async getUserCart(userId, userDiscount = 0) {
    return this.getCart(userId, userDiscount);
  }

  static async validateCartItem(variantId, quantity) {
    try {
      if (!quantity || quantity <= 0)
        return { valid: false, message: "Jumlah harus > 0" };

      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant) return { valid: false, message: "Varian tidak ditemukan" };
      if (variant.stock < quantity)
        return { valid: false, message: `Stok kurang. Sisa: ${variant.stock}` };

      return { valid: true, variant };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  static async getCartItemById(cartItemId) {
    return await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { variant: { include: { product: true } } },
    });
  }

  static async updateCartItem(cartItemId, quantity) {
    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { variant: { include: { product: true } } },
    });
  }

  static async addToCart(userId, variantId, quantity) {
    try {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant) throw new Error("Varian produk tidak ditemukan");

      const existingItem = await prisma.cartItem.findUnique({
        where: { userId_variantId: { userId, variantId } },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (variant.stock < newQuantity)
          throw new Error(`Stok tidak cukup. Tersedia: ${variant.stock}`);

        return await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          include: { variant: { include: { product: true } } },
        });
      } else {
        if (variant.stock < quantity)
          throw new Error(`Stok tidak cukup. Tersedia: ${variant.stock}`);

        return await prisma.cartItem.create({
          data: { userId, productId: variant.productId, variantId, quantity },
          include: { variant: { include: { product: true } } },
        });
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateQuantity(cartItemId, quantity) {
    try {
      if (quantity <= 0) throw new Error("Jumlah harus lebih dari 0");
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { variant: true },
      });
      if (!cartItem) throw new Error("Item tidak ditemukan");
      if (cartItem.variant.stock < quantity)
        throw new Error("Stok tidak cukup");

      await CartModel.updateQuantity(cartItemId, quantity);
      return { success: true, message: "Jumlah diperbarui" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async removeItem(cartItemId) {
    try {
      await CartModel.removeItem(cartItemId);
      return { success: true, message: "Dihapus dari keranjang" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async clearCart(userId) {
    try {
      await CartModel.clearCart(userId);
      return { success: true, message: "Keranjang dikosongkan" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
