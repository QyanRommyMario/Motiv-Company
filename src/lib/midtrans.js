/**
 * Midtrans Payment Gateway Integration
 * Handles Snap API and Core API operations
 */

const midtransClient = require("midtrans-client");

// Debugging: Cek apakah env variable terbaca
// Pastikan MIDTRANS_IS_PRODUCTION="true" di Vercel Production
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

// Log status koneksi (Masking key untuk keamanan)
console.log("🔌 Initializing Midtrans Service:", {
  mode: isProduction ? "PRODUCTION (Real Money)" : "SANDBOX (Testing)",
  serverKeyStatus: serverKey ? "Loaded" : "MISSING",
});

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey,
});

// Initialize Core API client
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
      // 1. Susun Item Details (Produk)
      // Harga di sini dipastikan bulat dengan Math.round()
      const itemDetails = order.items.map((item) => ({
        id: item.variant.sku || item.variant.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: `${item.product.name} - ${item.variant.name}`.substring(0, 50), // Batas nama Midtrans 50 char
      }));

      // 2. Tambah Ongkir sebagai Item
      if (order.shippingCost > 0) {
        itemDetails.push({
          id: "SHIPPING",
          price: Math.round(order.shippingCost),
          quantity: 1,
          name: "Ongkos Kirim",
        });
      }

      // 3. Tambah Diskon sebagai Item (Harga Negatif)
      if (order.discount > 0) {
        itemDetails.push({
          id: "DISCOUNT",
          price: -Math.round(order.discount),
          quantity: 1,
          name: `Diskon${order.voucherCode ? ` - ${order.voucherCode}` : ""}`,
        });
      }

      // 4. Hitung Ulang Gross Amount dari Item Details
      // Ini WAJIB dilakukan agar total harga cocok 100% dengan penjumlahan item.
      // Jika gross_amount berbeda 1 rupiah saja dari sum(items), Midtrans akan menolak token.
      const calculatedGrossAmount = itemDetails.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 5. Susun Parameter Akhir
      const parameter = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: calculatedGrossAmount, // Gunakan hasil hitung ulang
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
        item_details: itemDetails,
      };

      console.log("🚀 Sending request to Midtrans:", {
        orderId: parameter.transaction_details.order_id,
        grossAmount: parameter.transaction_details.gross_amount,
        itemsCount: parameter.item_details.length,
      });

      // Request Token ke Midtrans
      const transaction = await snap.createTransaction(parameter);

      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      };
    } catch (error) {
      console.error("❌ Midtrans Token Error:", error.message);
      // Lempar error agar ditangkap oleh route.js
      throw error;
    }
  }

  // ... (Method status & lainnya tidak perlu diubah, biarkan seperti semula)
  static async getTransactionStatus(orderId) {
    try {
      const statusResponse = await core.transaction.status(orderId);
      return statusResponse;
    } catch (error) {
      console.error("Midtrans get status error:", error);
      throw error;
    }
  }

  static async approveTransaction(orderId) {
    try {
      const response = await core.transaction.approve(orderId);
      return response;
    } catch (error) {
      console.error("Midtrans approve transaction error:", error);
      throw error;
    }
  }

  static async cancelTransaction(orderId) {
    try {
      const response = await core.transaction.cancel(orderId);
      return response;
    } catch (error) {
      console.error("Midtrans cancel transaction error:", error);
      throw error;
    }
  }

  static async expireTransaction(orderId) {
    try {
      const response = await core.transaction.expire(orderId);
      return response;
    } catch (error) {
      console.error("Midtrans expire transaction error:", error);
      throw error;
    }
  }

  static verifyNotification(notification) {
    try {
      const statusResponse = snap.transaction.notification(notification);
      return statusResponse;
    } catch (error) {
      console.error("Midtrans verify notification error:", error);
      return null;
    }
  }

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
