/**
 * Application Configuration
 * Centralized configuration for business logic constants
 */

export const BusinessConfig = {
  /**
   * B2B Configuration
   */
  B2B: {
    // [UPDATED] Minimum Order Quantity - DISABLED (no restriction)
    // B2B customers can purchase any quantity including single items
    MINIMUM_ORDER_QUANTITY: parseInt(process.env.B2B_MIN_ORDER_QUANTITY || "0"),

    // [UPDATED] Allow B2B customers to use vouchers - ENABLED by default
    // Discount stacking is now permitted per business requirement
    ALLOW_VOUCHER_STACKING: process.env.B2B_ALLOW_VOUCHER !== "false", // Default: true

    // Maximum discount percentage
    MAX_DISCOUNT_PERCENTAGE: parseInt(process.env.B2B_MAX_DISCOUNT || "50"),
  },

  /**
   * Stock Management Configuration
   */
  Stock: {
    // Deduct stock after payment (true) or at order creation (false)
    DEDUCT_AFTER_PAYMENT: process.env.STOCK_DEDUCT_AFTER_PAYMENT !== "false",

    // Low stock threshold for alerts
    LOW_STOCK_THRESHOLD: parseInt(process.env.LOW_STOCK_THRESHOLD || "10"),
  },

  /**
   * Security Configuration
   */
  Security: {
    // Enable security audit logging
    ENABLE_AUDIT_LOG: process.env.ENABLE_AUDIT_LOG !== "false",

    // Log suspicious activities (price manipulation attempts)
    LOG_SUSPICIOUS_ACTIVITIES: process.env.LOG_SUSPICIOUS === "true" || true,
  },

  /**
   * Payment Configuration
   */
  Payment: {
    // Manual payment requires admin approval
    MANUAL_PAYMENT_AUTO_APPROVE:
      process.env.MANUAL_PAYMENT_AUTO_APPROVE === "true" || false,
  },
};

/**
 * Get configuration value with type validation
 */
export function getConfig(path) {
  const keys = path.split(".");
  let value = BusinessConfig;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      throw new Error(`Configuration key not found: ${path}`);
    }
  }

  return value;
}
