/**
 * Voucher Model
 * Handles voucher operations
 */

import supabase from "@/lib/supabase";
import { generateId } from "@/lib/utils";

export class VoucherModel {
  /**
   * Create new voucher
   */
  static async create(data) {
    const { data: voucher, error } = await supabase
      .from("Voucher")
      .insert({ id: generateId(), ...data })
      .select()
      .single();

    if (error) throw error;
    return voucher;
  }

  /**
   * Get all vouchers
   */
  static async getAll(options = {}) {
    const { isActive, skip = 0, take = 20 } = options;

    let query = supabase
      .from("Voucher")
      .select("*")
      .order("createdAt", { ascending: false })
      .range(skip, skip + take - 1);

    if (isActive !== undefined) {
      query = query.eq("isActive", isActive);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Alias for getAll (for backward compatibility)
   */
  static async findAll(options = {}) {
    return this.getAll(options);
  }

  /**
   * Find voucher by code
   */
  static async findByCode(code) {
    const { data, error } = await supabase
      .from("Voucher")
      .select("*")
      .eq("code", code)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Update voucher
   */
  static async update(id, data) {
    const { data: voucher, error } = await supabase
      .from("Voucher")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return voucher;
  }

  /**
   * Delete voucher
   */
  static async delete(id) {
    const { error } = await supabase.from("Voucher").delete().eq("id", id);

    if (error) throw error;
    return { id };
  }

  /**
   * Validate voucher (returns validation result object)
   */
  static async validate(code, subtotal) {
    const voucher = await this.findByCode(code.toUpperCase());

    if (!voucher) {
      return {
        valid: false,
        message: "Kode voucher tidak ditemukan",
      };
    }

    if (!voucher.isActive) {
      return {
        valid: false,
        message: "Voucher tidak aktif",
      };
    }

    const now = new Date();
    if (now < new Date(voucher.validFrom)) {
      return {
        valid: false,
        message: "Voucher belum berlaku",
      };
    }

    if (now > new Date(voucher.validUntil)) {
      return {
        valid: false,
        message: "Voucher sudah tidak berlaku",
      };
    }

    if (voucher.used >= voucher.quota) {
      return {
        valid: false,
        message: "Kuota voucher sudah habis",
      };
    }

    if (subtotal < voucher.minPurchase) {
      return {
        valid: false,
        message: `Minimal pembelian Rp ${voucher.minPurchase.toLocaleString(
          "id-ID"
        )}`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (voucher.type === "PERCENTAGE") {
      discount = (subtotal * voucher.value) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.value;
    }

    return {
      valid: true,
      voucher,
      discount,
      message: `Voucher berhasil diterapkan! Diskon Rp ${discount.toLocaleString(
        "id-ID"
      )}`,
    };
  }

  /**
   * Validate and apply voucher
   */
  static async validateAndApply(code, subtotal) {
    const voucher = await this.findByCode(code);

    if (!voucher) {
      throw new Error("Kode voucher tidak ditemukan");
    }

    if (!voucher.isActive) {
      throw new Error("Voucher tidak aktif");
    }

    const now = new Date();
    if (
      now < new Date(voucher.validFrom) ||
      now > new Date(voucher.validUntil)
    ) {
      throw new Error("Voucher sudah tidak berlaku");
    }

    if (voucher.used >= voucher.quota) {
      throw new Error("Kuota voucher sudah habis");
    }

    if (subtotal < voucher.minPurchase) {
      throw new Error(
        `Minimal pembelian Rp ${voucher.minPurchase.toLocaleString("id-ID")}`
      );
    }

    let discount = 0;
    if (voucher.type === "PERCENTAGE") {
      discount = (subtotal * voucher.value) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.value;
    }

    return { voucher, discount };
  }

  /**
   * Increment voucher usage
   */
  static async incrementUsage(id) {
    const { data: voucher } = await supabase
      .from("Voucher")
      .select("used")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("Voucher")
      .update({ used: (voucher?.used || 0) + 1 })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
