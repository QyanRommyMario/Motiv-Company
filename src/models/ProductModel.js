/**
 * Product Model
 * Handles all product-related data operations
 */

import prisma from "@/lib/prisma";

export class ProductModel {
  /**
   * Create a new product with variants
   */
  static async create(data) {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        images: data.images,
        category: data.category,
        features: data.features || [],
        variants: {
          create: data.variants,
        },
      },
      include: {
        variants: true,
      },
    });
  }

  /**
   * Get all products with variants
   */
  static async getAll(options = {}) {
    const { category, search, skip = 0, take = 20 } = options;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return await prisma.product.findMany({
      where,
      include: {
        variants: {
          orderBy: { price: "asc" },
        },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get product by ID
   */
  static async findById(id) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { price: "asc" },
        },
      },
    });
  }

  /**
   * Update product
   */
  static async update(id, data) {
    return await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        images: data.images,
        category: data.category,
        features: data.features || [],
      },
      include: {
        variants: true,
      },
    });
  }

  /**
   * Delete product
   */
  static async delete(id) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Get product categories
   */
  static async getCategories() {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    return products.map((p) => p.category);
  }

  /**
   * Count products with optional filters
   */
  static async count(options = {}) {
    const { category, search } = options;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return await prisma.product.count({ where });
  }
}
