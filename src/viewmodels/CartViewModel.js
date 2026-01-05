/**
 * Cart ViewModel
 * Handles shopping cart business logic
 */

import { CartModel } from "@/models/CartModel";
import { ProductVariantModel } from "@/models/ProductVariantModel";
import supabase from "@/lib/supabase";
import { generateId } from "@/lib/utils";

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

      const { data: variant, error } = await supabase
        .from("ProductVariant")
        .select(`*, product:Product(*)`)
        .eq("id", variantId)
        .single();

      if (error || !variant)
        return { valid: false, message: "Varian tidak ditemukan" };
      if (variant.stock < quantity)
        return { valid: false, message: `Stok kurang. Sisa: ${variant.stock}` };

      return { valid: true, variant };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  static async getCartItemById(cartItemId) {
    const { data, error } = await supabase
      .from("CartItem")
      .select(`*, variant:ProductVariant(*, product:Product(*))`)
      .eq("id", cartItemId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  static async updateCartItem(cartItemId, quantity) {
    const { data, error } = await supabase
      .from("CartItem")
      .update({ quantity })
      .eq("id", cartItemId)
      .select(`*, variant:ProductVariant(*, product:Product(*))`)
      .single();

    if (error) throw error;
    return data;
  }

  static async addToCart(userId, variantId, quantity) {
    try {
      const { data: variant, error: variantError } = await supabase
        .from("ProductVariant")
        .select(`*, product:Product(*)`)
        .eq("id", variantId)
        .single();

      if (variantError || !variant)
        throw new Error("Varian produk tidak ditemukan");

      const { data: existingItem } = await supabase
        .from("CartItem")
        .select("*")
        .eq("userId", userId)
        .eq("variantId", variantId)
        .single();

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (variant.stock < newQuantity)
          throw new Error(`Stok tidak cukup. Tersedia: ${variant.stock}`);

        const { data, error } = await supabase
          .from("CartItem")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id)
          .select(`*, variant:ProductVariant(*, product:Product(*))`)
          .single();

        if (error) throw error;
        return data;
      } else {
        if (variant.stock < quantity)
          throw new Error(`Stok tidak cukup. Tersedia: ${variant.stock}`);

        const { data, error } = await supabase
          .from("CartItem")
          .insert({
            id: generateId(),
            userId,
            productId: variant.productId,
            variantId,
            quantity,
          })
          .select(`*, variant:ProductVariant(*, product:Product(*))`)
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateQuantity(cartItemId, quantity) {
    try {
      if (quantity <= 0) throw new Error("Jumlah harus lebih dari 0");

      const { data: cartItem, error } = await supabase
        .from("CartItem")
        .select(`*, variant:ProductVariant(*)`)
        .eq("id", cartItemId)
        .single();

      if (error || !cartItem) throw new Error("Item tidak ditemukan");
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
