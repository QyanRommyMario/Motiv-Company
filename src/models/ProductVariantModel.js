/**
 * ProductVariant Model
 * Handles product variant operations
 */

import supabase from "@/lib/supabase";
import { generateId } from "@/lib/utils";

export class ProductVariantModel {
  /**
   * Create variant
   */
  static async create(data) {
    const { data: variant, error } = await supabase
      .from("ProductVariant")
      .insert({ id: generateId(), ...data })
      .select()
      .single();

    if (error) throw error;
    return variant;
  }

  /**
   * Update variant
   */
  static async update(id, data) {
    const { data: variant, error } = await supabase
      .from("ProductVariant")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return variant;
  }

  /**
   * Delete variant
   */
  static async delete(id) {
    const { error } = await supabase
      .from("ProductVariant")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { id };
  }

  /**
   * Update stock (increment)
   */
  static async updateStock(id, quantity) {
    const { data: current } = await supabase
      .from("ProductVariant")
      .select("stock")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("ProductVariant")
      .update({ stock: (current?.stock || 0) + quantity })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Decrease stock
   */
  static async decreaseStock(id, quantity) {
    const { data: variant } = await supabase
      .from("ProductVariant")
      .select("stock, name")
      .eq("id", id)
      .single();

    if (!variant || variant.stock < quantity) {
      throw new Error("Stok tidak mencukupi");
    }

    const { data, error } = await supabase
      .from("ProductVariant")
      .update({ stock: variant.stock - quantity })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
