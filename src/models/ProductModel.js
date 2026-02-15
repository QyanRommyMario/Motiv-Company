/**
 * Product Model
 * Handles all product-related data operations
 */

import supabase from "@/lib/supabase";
import { generateId } from "@/lib/utils";

export class ProductModel {
  /**
   * Create a new product with variants
   */
  static async create(data) {
    // Create product first
    const { data: product, error: productError } = await supabase
      .from("Product")
      .insert({
        id: generateId(),
        name: data.name,
        description: data.description,
        images: data.images,
        category: data.category,
        features: data.features || [],
      })
      .select()
      .single();

    if (productError) throw productError;

    // Create variants
    if (data.variants && data.variants.length > 0) {
      const variantsWithProductId = data.variants.map((v) => ({
        id: generateId(),
        ...v,
        productId: product.id,
      }));

      const { data: variants, error: variantsError } = await supabase
        .from("ProductVariant")
        .insert(variantsWithProductId)
        .select();

      if (variantsError) throw variantsError;
      product.variants = variants;
    }

    return product;
  }

  /**
   * Get all products with variants
   */
  static async getAll(options = {}) {
    const { category, search, skip = 0, take = 20 } = options;

    let query = supabase
      .from("Product")
      .select(`*, variants:ProductVariant(*)`)
      .order("createdAt", { ascending: false })
      .range(skip, skip + take - 1);

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Sort variants by price
    return data.map((product) => ({
      ...product,
      variants: product.variants?.sort((a, b) => a.price - b.price) || [],
    }));
  }

  /**
   * Get product by ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from("Product")
      .select(`*, variants:ProductVariant(*)`)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    if (data?.variants) {
      data.variants.sort((a, b) => a.price - b.price);
    }

    return data;
  }

  /**
   * Update product with variants
   */
  static async update(id, data) {
    // 1. Update product base data
    const { error: productError } = await supabase
      .from("Product")
      .update({
        name: data.name,
        description: data.description,
        images: data.images,
        category: data.category,
        features: data.features || [],
      })
      .eq("id", id);

    if (productError) throw productError;

    // 2. Handle variants update
    if (data.variants && data.variants.length > 0) {
      // Get existing variant IDs for this product
      const { data: existingVariants } = await supabase
        .from("ProductVariant")
        .select("id")
        .eq("productId", id);

      const existingIds = existingVariants?.map((v) => v.id) || [];
      const newVariantIds = data.variants.filter((v) => v.id).map((v) => v.id);

      // Delete variants that are no longer in the list
      const toDelete = existingIds.filter((eid) => !newVariantIds.includes(eid));
      if (toDelete.length > 0) {
        await supabase.from("ProductVariant").delete().in("id", toDelete);
      }

      // Update or create each variant
      for (const variant of data.variants) {
        const price = Number(variant.price);
        const stock = Number(variant.stock);

        if (isNaN(price) || isNaN(stock)) {
          throw new Error(`Invalid variant data: price=${variant.price}, stock=${variant.stock}`);
        }

        if (variant.id) {
          // Update existing variant
          const { error: updateError } = await supabase
            .from("ProductVariant")
            .update({
              name: variant.name,
              price: price,
              stock: stock,
            })
            .eq("id", variant.id);

          if (updateError) throw updateError;
        } else {
          // Create new variant
          const { error: insertError } = await supabase
            .from("ProductVariant")
            .insert({
              id: generateId(),
              productId: id,
              name: variant.name,
              price: price,
              stock: stock,
            });

          if (insertError) throw insertError;
        }
      }
    }

    // Return updated product with fresh data
    return await ProductModel.findById(id);
  }

  /**
   * Delete product
   */
  static async delete(id) {
    const { error } = await supabase.from("Product").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    return { id };
  }

  /**
   * Get product categories
   */
  static async getCategories() {
    const { data, error } = await supabase
      .from("Product")
      .select("category")
      .order("category");

    if (error) throw error;
    const categories = [...new Set(data.map((p) => p.category))];
    return categories;
  }

  /**
   * Count products with optional filters
   */
  static async count(options = {}) {
    const { category, search } = options;

    let query = supabase
      .from("Product")
      .select("id", { count: "exact", head: true });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}
