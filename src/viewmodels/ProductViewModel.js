/**
 * Product ViewModel
 * Handles product business logic
 */

import { ProductModel } from "@/models/ProductModel";
import { ProductVariantModel } from "@/models/ProductVariantModel";

export class ProductViewModel {
  /**
   * Get all products
   */
  static async getProducts(filters = {}) {
    try {
      const products = await ProductModel.getAll(filters);

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id) {
    try {
      const product = await ProductModel.findById(id);

      if (!product) {
        throw new Error("Produk tidak ditemukan");
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Apply B2B discount to product price
   */
  static applyB2BDiscount(price, discountPercentage) {
    if (!discountPercentage || discountPercentage <= 0) {
      return price;
    }

    const discount = (price * discountPercentage) / 100;
    return price - discount;
  }

  /**
   * Get product with B2B pricing
   */
  static async getProductWithB2BPricing(id, userDiscount = 0) {
    try {
      const result = await this.getProductById(id);

      if (!result.success) {
        return result;
      }

      const product = result.data;

      // Apply B2B discount to variants
      if (userDiscount > 0) {
        product.variants = product.variants.map((variant) => ({
          ...variant,
          originalPrice: variant.price,
          price: this.applyB2BDiscount(variant.price, userDiscount),
          discount: userDiscount,
        }));
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Create product (Admin only)
   */
  static async createProduct(data) {
    try {
      // Validate input
      if (!data.name || !data.description || !data.category) {
        throw new Error("Data produk tidak lengkap");
      }

      if (!data.variants || data.variants.length === 0) {
        throw new Error("Produk harus memiliki minimal 1 varian");
      }

      // Validate variants
      for (const variant of data.variants) {
        if (!variant.name || !variant.price || !variant.stock || !variant.sku) {
          throw new Error("Data varian tidak lengkap");
        }
      }

      const product = await ProductModel.create(data);

      return {
        success: true,
        message: "Produk berhasil ditambahkan",
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Update product (Admin only)
   */
  static async updateProduct(id, data) {
    try {
      const product = await ProductModel.update(id, data);

      return {
        success: true,
        message: "Produk berhasil diperbarui",
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Delete product (Admin only)
   */
  static async deleteProduct(id) {
    try {
      await ProductModel.delete(id);

      return {
        success: true,
        message: "Produk berhasil dihapus",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get categories
   */
  static async getCategories() {
    try {
      const categories = await ProductModel.getCategories();

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
