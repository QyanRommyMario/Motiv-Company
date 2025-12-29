/**
 * User Model
 * Handles all user-related data operations
 */

import supabase from "@/lib/prisma";
import bcrypt from "bcryptjs";

export class UserModel {
  /**
   * Create a new user
   */
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { data: user, error } = await supabase
      .from("User")
      .insert({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "B2C",
        phone: data.phone,
        address: data.address,
      })
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from("User")
      .select("id, name, email, role, status, businessName, phone, address, discount, createdAt")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user
   */
  static async update(id, data) {
    const { data: user, error } = await supabase
      .from("User")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  /**
   * Get all B2B users
   */
  static async getAllB2BUsers() {
    const { data, error } = await supabase
      .from("User")
      .select("id, name, email, businessName, phone, discount, createdAt")
      .eq("role", "B2B");

    if (error) throw error;
    return data;
  }

  /**
   * Update B2B discount
   */
  static async updateB2BDiscount(userId, discount) {
    const { data, error } = await supabase
      .from("User")
      .update({ discount })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
