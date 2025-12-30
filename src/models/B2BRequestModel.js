/**
 * B2BRequest Model
 * Handles B2B request operations
 */

import supabase from "@/lib/prisma";
import { generateId } from "@/lib/utils";

export class B2BRequestModel {
  /**
   * Create B2B request
   */
  static async create(data) {
    const { data: request, error } = await supabase
      .from("B2BRequest")
      .insert({ id: generateId(), ...data })
      .select(
        `
        *,
        user:User(id, name, email)
      `
      )
      .single();

    if (error) throw error;
    return request;
  }

  /**
   * Get all requests
   */
  static async getAll(options = {}) {
    const { status, skip = 0, take = 20 } = options;

    let query = supabase
      .from("B2BRequest")
      .select(
        `
        *,
        user:User(id, name, email)
      `
      )
      .order("createdAt", { ascending: false })
      .range(skip, skip + take - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get request by user ID
   */
  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from("B2BRequest")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Update request status
   */
  static async updateStatus(id, status) {
    const { data, error } = await supabase
      .from("B2BRequest")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Approve request
   */
  static async approve(id, discount = 0) {
    const { data: request, error: findError } = await supabase
      .from("B2BRequest")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !request) {
      throw new Error("Pengajuan tidak ditemukan");
    }

    // Update request status
    await this.updateStatus(id, "APPROVED");

    // Update user role to B2B
    const { error: userError } = await supabase
      .from("User")
      .update({
        role: "B2B",
        status: "ACTIVE",
        businessName: request.businessName,
        phone: request.phone,
        address: request.address,
        discount,
      })
      .eq("id", request.userId);

    if (userError) throw userError;

    return request;
  }

  /**
   * Reject request
   */
  static async reject(id) {
    return await this.updateStatus(id, "REJECTED");
  }
}
