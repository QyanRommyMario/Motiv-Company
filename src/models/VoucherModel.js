/**
 * Voucher Model
 * Handles voucher operations
 */

import prisma from "@/lib/prisma";

export class VoucherModel {
  /**
   * Create new voucher
   */
  static async create(data) {
    return await prisma.voucher.create({
      data,
    });
  }

  /**
   * Get all vouchers
   */
  static async getAll(options = {}) {
    const { isActive, skip = 0, take = 20 } = options;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await prisma.voucher.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
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
    return await prisma.voucher.findUnique({
      where: { code },
    });
  }

  /**
   * Update voucher
   */
  static async update(id, data) {
    return await prisma.voucher.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete voucher
   */
  static async delete(id) {
    return await prisma.voucher.delete({
      where: { id },
    });
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
    if (now < voucher.validFrom) {
      return {
        valid: false,
        message: "Voucher belum berlaku",
      };
    }

    if (now > voucher.validUntil) {
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
    if (now < voucher.validFrom || now > voucher.validUntil) {
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
    return await prisma.voucher.update({
      where: { id },
      data: {
        used: {
          increment: 1,
        },
      },
    });
  }
}
