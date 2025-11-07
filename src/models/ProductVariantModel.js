/**
 * ProductVariant Model
 * Handles product variant operations
 */

import prisma from "@/lib/prisma";

export class ProductVariantModel {
  /**
   * Create variant
   */
  static async create(data) {
    return await prisma.productVariant.create({
      data,
    });
  }

  /**
   * Update variant
   */
  static async update(id, data) {
    return await prisma.productVariant.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete variant
   */
  static async delete(id) {
    return await prisma.productVariant.delete({
      where: { id },
    });
  }

  /**
   * Update stock
   */
  static async updateStock(id, quantity) {
    return await prisma.productVariant.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }

  /**
   * Decrease stock
   */
  static async decreaseStock(id, quantity) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant || variant.stock < quantity) {
      throw new Error("Stok tidak mencukupi");
    }

    return await prisma.productVariant.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }
}
