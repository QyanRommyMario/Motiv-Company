/**
 * Midtrans Payment Gateway Integration
 * Handles Snap API and Core API operations
 */

const midtransClient = require("midtrans-client");

// Debugging: Cek apakah env variable terbaca (Hanya tampil di terminal server)
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

// Log status koneksi (Masking key untuk keamanan di log)
console.log("🔌 Initializing Midtrans Service:", {
  mode: isProduction ? "PRODUCTION (Uang Asli)" : "SANDBOX (Testing)",
  serverKeyStatus: serverKey
    ? `Loaded (${serverKey.substring(0, 5)}...)`
    : "MISSING/UNDEFINED",
  clientKeyStatus: clientKey
    ? `Loaded (${clientKey.substring(0, 5)}...)`
    : "MISSING/UNDEFINED",
});

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey,
});

// Initialize Core API client (for transaction status check)
const core = new midtransClient.CoreApi({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey,
});

export class MidtransService {
  /**
   * Create Snap transaction token
   * @param {Object} order - Order data
   * @returns {Object} Snap token and redirect URL
   */
  static async createTransaction(order) {
    try {
      // Prepare transaction parameter
      const parameter = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: Math.round(order.total), // Midtrans requires integer
        },
        customer_details: {
          first_name: order.user.name,
          email: order.user.email,
          phone: order.user.phone || order.shippingPhone,
          shipping_address: {
            first_name: order.shippingName,
            phone: order.shippingPhone,
            address: order.shippingAddress,
            city: order.shippingCity,
            postal_code: order.shippingPostalCode,
          },
        },
        item_details: order.items.map((item) => ({
          id: item.variant.sku,
          price: Math.round(item.price),
          quantity: item.quantity,
          name: `${item.product.name} - ${item.variant.name}`,
        })),
        // Add shipping cost as item
        ...(order.shippingCost > 0 && {
          item_details: [
            ...order.items.map((item) => ({
              id: item.variant.sku,
              price: Math.round(item.price),
              quantity: item.quantity,
              name: `${item.product.name} - ${item.variant.name}`,
            })),
            {
              id: "SHIPPING",
              price: Math.round(order.shippingCost),
              quantity: 1,
              name: `Ongkir - ${order.courierName} ${order.courierService}`,
            },
          ],
        }),
      };

      // Add discount if exists
      if (order.discount > 0) {
        parameter.item_details.push({
          id: "DISCOUNT",
          price: -Math.round(order.discount),
          quantity: 1,
          name: `Diskon${order.voucherCode ? ` - ${order.voucherCode}` : ""}`,
        });
      }

      console.log("🚀 Sending request to Midtrans:", {
        orderId: parameter.transaction_details.order_id,
        grossAmount: parameter.transaction_details.gross_amount,
        serverKeyUsed: serverKey ? "Present" : "MISSING",
      });

      // Create Snap transaction
      const transaction = await snap.createTransaction(parameter);

      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      };
    } catch (error) {
      console.error("❌ Midtrans create transaction error:", error);
      // Pass error message to be handled by API route
      throw error;
    }
  }

  /**
   * Get transaction status from Midtrans
   * @param {string} orderId - Order number
   * @returns {Object} Transaction status
   */
  static async getTransactionStatus(orderId) {
    try {
      const statusResponse = await core.transaction.status(orderId);
      return statusResponse;
    } catch (error) {
      console.error("Midtrans get status error:", error);
      throw error;
    }
  }

  /**
   * Approve challenge transaction
   * @param {string} orderId - Order number
   */
  static async approveTransaction(orderId) {
    try {
      const response = await core.transaction.approve(orderId);
      return response;
    } catch (error) {
      console.error("Midtrans approve transaction error:", error);
      throw error;
    }
  }

  /**
   * Cancel transaction
   * @param {string} orderId - Order number
   */
  static async cancelTransaction(orderId) {
    try {
      const response = await core.transaction.cancel(orderId);
      return response;
    } catch (error) {
      console.error("Midtrans cancel transaction error:", error);
      throw error;
    }
  }

  /**
   * Expire transaction (for pending payment)
   * @param {string} orderId - Order number
   */
  static async expireTransaction(orderId) {
    try {
      const response = await core.transaction.expire(orderId);
      return response;
    } catch (error) {
      console.error("Midtrans expire transaction error:", error);
      throw error;
    }
  }

  /**
   * Verify notification authenticity
   * @param {Object} notification - Notification data from Midtrans
   * @returns {boolean}
   */
  static verifyNotification(notification) {
    try {
      const statusResponse = snap.transaction.notification(notification);
      return statusResponse;
    } catch (error) {
      console.error("Midtrans verify notification error:", error);
      return null;
    }
  }

  /**
   * Map Midtrans status to our order status
   * @param {string} transactionStatus - Midtrans transaction status
   * @param {string} fraudStatus - Midtrans fraud status
   * @returns {Object} Mapped statuses
   */
  static mapTransactionStatus(transactionStatus, fraudStatus) {
    let orderStatus = "PENDING";
    let paymentStatus = "UNPAID";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        orderStatus = "PAID";
        paymentStatus = "PAID";
      } else if (fraudStatus === "challenge") {
        orderStatus = "PENDING";
        paymentStatus = "UNPAID";
      }
    } else if (transactionStatus === "settlement") {
      orderStatus = "PAID";
      paymentStatus = "PAID";
    } else if (transactionStatus === "deny" || transactionStatus === "cancel") {
      orderStatus = "CANCELLED";
      paymentStatus = "FAILED";
    } else if (transactionStatus === "expire") {
      orderStatus = "CANCELLED";
      paymentStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      orderStatus = "PENDING";
      paymentStatus = "UNPAID";
    }

    return {
      orderStatus,
      paymentStatus,
    };
  }
}
