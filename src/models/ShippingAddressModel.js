import supabase from "@/lib/prisma";
import { generateId } from "@/lib/utils";

/**
 * ShippingAddress Model
 * Handles database operations for shipping addresses
 */
class ShippingAddressModel {
  /**
   * Create new shipping address
   */
  static async create(data) {
    const { data: address, error } = await supabase
      .from("ShippingAddress")
      .insert({ id: generateId(), ...data })
      .select()
      .single();

    if (error) throw error;
    return address;
  }

  /**
   * Get user's shipping addresses
   */
  static async getUserAddresses(userId) {
    const { data, error } = await supabase
      .from("ShippingAddress")
      .select("*")
      .eq("userId", userId)
      .order("isDefault", { ascending: false })
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get address by ID
   */
  static async getById(id) {
    const { data, error } = await supabase
      .from("ShippingAddress")
      .select(`*, user:User(*)`)
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Get default address for user
   */
  static async getDefaultAddress(userId) {
    const { data, error } = await supabase
      .from("ShippingAddress")
      .select("*")
      .eq("userId", userId)
      .eq("isDefault", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Update address
   */
  static async update(id, data) {
    const { data: address, error } = await supabase
      .from("ShippingAddress")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return address;
  }

  /**
   * Set address as default (unset others)
   */
  static async setAsDefault(id, userId) {
    // Unset all default addresses for user
    await supabase
      .from("ShippingAddress")
      .update({ isDefault: false })
      .eq("userId", userId);

    // Set this address as default
    const { data, error } = await supabase
      .from("ShippingAddress")
      .update({ isDefault: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete address
   */
  static async delete(id) {
    const { error } = await supabase
      .from("ShippingAddress")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { id };
  }

  /**
   * Count user addresses
   */
  static async countUserAddresses(userId) {
    const { count, error } = await supabase
      .from("ShippingAddress")
      .select("id", { count: "exact", head: true })
      .eq("userId", userId);

    if (error) throw error;
    return count || 0;
  }
}

export default ShippingAddressModel;
