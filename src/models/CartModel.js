/**
 * Cart Model
 * Handles shopping cart operations
 */

import supabase from "@/lib/prisma";
import { generateId } from "@/lib/utils";

export class CartModel {
  /**
   * Get user's cart
   */
  static async getByUserId(userId) {
    const { data, error } = await supabase
      .from("CartItem")
      .select(
        `
        *,
        product:Product(id, name, images),
        variant:ProductVariant(id, name, price, stock)
      `
      )
      .eq("userId", userId);

    if (error) throw error;
    return data;
  }

  /**
   * Add item to cart
   */
  static async addItem(userId, productId, variantId, quantity) {
    // Check if item already exists
    const { data: existingItem } = await supabase
      .from("CartItem")
      .select("*")
      .eq("userId", userId)
      .eq("variantId", variantId)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from("CartItem")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Create new cart item
    const { data, error } = await supabase
      .from("CartItem")
      .insert({ id: generateId(), userId, productId, variantId, quantity })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(cartItemId, quantity) {
    const { data, error } = await supabase
      .from("CartItem")
      .update({ quantity })
      .eq("id", cartItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove item from cart
   */
  static async removeItem(cartItemId) {
    const { error } = await supabase
      .from("CartItem")
      .delete()
      .eq("id", cartItemId);

    if (error) throw error;
    return { id: cartItemId };
  }

  /**
   * Clear user's cart
   */
  static async clearCart(userId) {
    const { error } = await supabase
      .from("CartItem")
      .delete()
      .eq("userId", userId);

    if (error) throw error;
    return { userId };
  }
}
