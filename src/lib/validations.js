/**
 * Input Validation Schemas
 * Using Zod for runtime type checking and validation
 */

import { z } from "zod";

// ========================================
// AUTH SCHEMAS
// ========================================

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),
  email: z
    .string()
    .email("Format email tidak valid")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, kecil, dan angka"
    ),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Format nomor HP tidak valid")
    .optional()
    .nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").toLowerCase().trim(),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

// ========================================
// ORDER SCHEMAS
// ========================================

export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid("ID alamat tidak valid"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid().optional(),
        variantId: z.string().uuid("ID variant tidak valid"),
        quantity: z
          .number()
          .int("Jumlah harus bilangan bulat")
          .min(1, "Jumlah minimal 1")
          .max(1000, "Jumlah maksimal 1000"),
      })
    )
    .min(1, "Keranjang tidak boleh kosong"),
  shipping: z.object({
    courier: z.string().min(1, "Kurir harus dipilih"),
    service: z.string().min(1, "Layanan pengiriman harus dipilih"),
    cost: z
      .number()
      .int("Biaya pengiriman harus bilangan bulat")
      .positive("Biaya pengiriman harus positif"),
    etd: z.string(),
  }),
  voucherCode: z.string().trim().toUpperCase().optional().nullable(),
  paymentMethod: z.enum(["ONLINE", "TRANSFER", "COD"], {
    errorMap: () => ({ message: "Metode pembayaran tidak valid" }),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().optional().nullable(),
  shippingCourier: z.string().optional().nullable(),
  shippingService: z.string().optional().nullable(),
  cancellationReason: z.string().optional().nullable(),
});

// ========================================
// PRODUCT SCHEMAS
// ========================================

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Nama produk minimal 3 karakter")
    .max(200, "Nama produk maksimal 200 karakter")
    .trim(),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(5000, "Deskripsi maksimal 5000 karakter")
    .trim(),
  category: z.string().min(2, "Kategori harus diisi").trim(),
  images: z
    .array(z.string().url("URL gambar tidak valid"))
    .min(1, "Minimal 1 gambar")
    .max(5, "Maksimal 5 gambar"),
  features: z.array(z.string().trim()).optional().nullable(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "Nama variant harus diisi").trim(),
        price: z
          .number()
          .int("Harga harus bilangan bulat")
          .positive("Harga harus positif"),
        stock: z
          .number()
          .int("Stok harus bilangan bulat")
          .min(0, "Stok tidak boleh negatif"),
        weight: z
          .number()
          .int("Berat harus bilangan bulat")
          .positive("Berat harus positif"),
      })
    )
    .min(1, "Minimal 1 variant"),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid("ID produk tidak valid"),
});

export const productVariantSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  weight: z.number().int().positive(),
  productId: z.string().uuid(),
});

// ========================================
// B2B SCHEMAS
// ========================================

export const b2bRequestSchema = z.object({
  companyName: z
    .string()
    .min(3, "Nama perusahaan minimal 3 karakter")
    .max(200, "Nama perusahaan maksimal 200 karakter")
    .trim(),
  npwp: z
    .string()
    .regex(/^\d{15}$/, "NPWP harus 15 digit angka")
    .optional()
    .nullable(),
  businessType: z.enum(
    ["RETAIL", "CAFE", "RESTAURANT", "DISTRIBUTOR", "OTHER"],
    {
      errorMap: () => ({ message: "Tipe bisnis tidak valid" }),
    }
  ),
  address: z
    .string()
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter")
    .trim(),
  estimatedMonthlyOrder: z
    .number()
    .int("Estimasi order harus bilangan bulat")
    .min(1000000, "Estimasi order minimal Rp 1.000.000")
    .optional()
    .nullable(),
  documents: z.array(z.string().url()).optional().nullable(),
});

export const updateB2BDiscountSchema = z.object({
  userId: z.string().uuid("ID user tidak valid"),
  discount: z
    .number()
    .int("Diskon harus bilangan bulat")
    .min(0, "Diskon minimal 0%")
    .max(100, "Diskon maksimal 100%"),
});

// ========================================
// VOUCHER SCHEMAS
// ========================================

export const createVoucherSchema = z.object({
  code: z
    .string()
    .min(3, "Kode voucher minimal 3 karakter")
    .max(20, "Kode voucher maksimal 20 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode voucher harus huruf kapital dan angka")
    .trim()
    .toUpperCase(),
  name: z.string().min(3).max(100).trim(),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["PERCENTAGE", "FIXED"], {
    errorMap: () => ({ message: "Tipe voucher tidak valid" }),
  }),
  value: z.number().int().positive("Nilai voucher harus positif"),
  minPurchase: z
    .number()
    .int()
    .min(0, "Minimal pembelian tidak boleh negatif")
    .optional()
    .nullable(),
  maxDiscount: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  maxUsage: z
    .number()
    .int()
    .positive("Maksimal penggunaan harus positif"),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().optional(),
});

export const validateVoucherSchema = z.object({
  code: z.string().min(1).trim().toUpperCase(),
  subtotal: z.number().positive("Subtotal harus positif"),
});

// ========================================
// SHIPPING ADDRESS SCHEMAS
// ========================================

export const shippingAddressSchema = z.object({
  recipientName: z
    .string()
    .min(2, "Nama penerima minimal 2 karakter")
    .max(100)
    .trim(),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Format nomor HP tidak valid"),
  fullAddress: z
    .string()
    .min(10, "Alamat lengkap minimal 10 karakter")
    .max(500)
    .trim(),
  province: z.string().min(1, "Provinsi harus dipilih"),
  city: z.string().min(1, "Kota harus dipilih"),
  district: z.string().min(1, "Kecamatan harus dipilih"),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Kode pos harus 5 digit")
    .optional()
    .nullable(),
  label: z
    .enum(["HOME", "OFFICE", "OTHER"])
    .optional()
    .default("HOME"),
  isDefault: z.boolean().optional().default(false),
});

// ========================================
// SHIPPING COST SCHEMAS
// ========================================

export const shippingCostSchema = z.object({
  destination: z.string().min(1, "Tujuan pengiriman harus diisi"),
  weight: z
    .number()
    .int("Berat harus bilangan bulat")
    .positive("Berat harus positif")
    .max(30000, "Berat maksimal 30kg"),
  courier: z.enum(["jne", "pos", "tiki"], {
    errorMap: () => ({ message: "Kurir tidak valid" }),
  }),
});

// ========================================
// UPLOAD SCHEMAS
// ========================================

export const uploadFileSchema = z.object({
  fileSize: z
    .number()
    .max(5 * 1024 * 1024, "Ukuran file maksimal 5MB"),
  fileType: z.enum(
    ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    {
      errorMap: () => ({ message: "Tipe file harus JPEG, PNG, atau WebP" }),
    }
  ),
  fileName: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/, "Nama file tidak valid"),
});

// ========================================
// PAGINATION SCHEMAS
// ========================================

export const paginationSchema = z.object({
  skip: z.coerce.number().int().min(0).optional().default(0),
  take: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  status: z.string().trim().optional().nullable(),
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Validate and sanitize input data
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {object} { success: boolean, data?: any, errors?: array }
 */
export function validateInput(schema, data) {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: "unknown", message: "Validation failed" }],
    };
  }
}

/**
 * Create validation middleware for Next.js API routes
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Middleware function
 */
export function createValidationMiddleware(schema) {
  return async (data) => {
    const result = validateInput(schema, data);
    if (!result.success) {
      const error = new Error("Validation failed");
      error.validationErrors = result.errors;
      error.statusCode = 400;
      throw error;
    }
    return result.data;
  };
}
