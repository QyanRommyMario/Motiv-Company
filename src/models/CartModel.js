/**
 * Cart Model
 * Handles shopping cart operations
 */

import prisma from "@/lib/prisma";

export class CartModel {
  /**
   * Get user's cart
   */
  static async getByUserId(userId) {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
        },
      },
    });
  }

  /**
   * Add item to cart
   */
  static async addItem(userId, productId, variantId, quantity) {
    // Check if item already exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    }

    // Create new cart item
    return await prisma.cartItem.create({
      data: {
        userId,
        productId,
        variantId,
        quantity,
      },
    });
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(cartItemId, quantity) {
    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  /**
   * Remove item from cart
   */
  static async removeItem(cartItemId) {
    return await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  /**
   * Clear user's cart
   */
  static async clearCart(userId) {
    return await prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
