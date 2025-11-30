/**
 * Midtrans Payment Gateway Integration
 * Handles Snap API and Core API operations
 */

const midtransClient = require("midtrans-client");

// Debugging: Cek apakah env variable terbaca
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

// Log status koneksi (Masking key untuk keamanan)
console.log("🔌 Initializing Midtrans Service:", {
  mode: isProduction ? "PRODUCTION" : "SANDBOX",
  serverKey: serverKey ? "✅ Loaded" : "❌ MISSING",
  clientKey: clientKey ? "✅ Loaded" : "❌ MISSING",
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
   */
  static async createTransaction(order) {
    try {
      // 1. Susun Item Details terlebih dahulu
      const itemDetails = order.items.map((item) => ({
        id: item.variant.sku || item.variant.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: `${item.product.name} - ${item.variant.name}`.substring(0, 50), // Midtrans limit name length
      }));

      // Tambahkan Ongkir
      if (order.shippingCost > 0) {
        itemDetails.push({
          id: "SHIPPING",
          price: Math.round(order.shippingCost),
          quantity: 1,
          name: "Ongkos Kirim",
        });
      }

      // Tambahkan Diskon (sebagai item dengan harga negatif)
      if (order.discount > 0) {
        itemDetails.push({
          id: "DISCOUNT",
          price: -Math.round(order.discount),
          quantity: 1,
          name: "Diskon",
        });
      }

      // 2. Hitung Gross Amount dari Item Details (Wajib Sama Persis)
      // Ini mencegah error "gross_amount is not equal to the sum of item_details"
      const grossAmount = itemDetails.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 3. Siapkan Parameter Transaksi
      const parameter = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: grossAmount,
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

      // 4. Create Snap transaction
      const transaction = await snap.createTransaction(parameter);

      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      };
    } catch (error) {
      console.error("❌ Midtrans create transaction error:", error.message);
      throw error;
    }
  }

  // ... (Method lain seperti getTransactionStatus dll biarkan tetap sama)
  static async getTransactionStatus(orderId) {
    try {
      const statusResponse = await core.transaction.status(orderId);
      return statusResponse;
    } catch (error) {
      console.error("Midtrans get status error:", error);
      throw error;
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
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire"
    ) {
      orderStatus = "CANCELLED";
      paymentStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      orderStatus = "PENDING";
      paymentStatus = "UNPAID";
    }

    return { orderStatus, paymentStatus };
  }
}
