/**
 * Midtrans Payment Gateway Integration
 * Handles Snap API and Core API operations
 */

const midtransClient = require("midtrans-client");

// Konfigurasi Environment
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

console.log("🔌 Initializing Midtrans Service:", {
  mode: isProduction ? "PRODUCTION" : "SANDBOX",
  serverKeyStatus: serverKey ? "Loaded" : "MISSING",
});

const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

const core = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

export class MidtransService {
  /**
   * Create Snap transaction token
   */
  static async createTransaction(order) {
    try {
      // 1. Susun Item Details (Harga sudah didiskon B2B & dibulatkan dari route.js)
      const itemDetails = order.items.map((item) => ({
        id: item.variant.sku || item.variant.id,
        price: Math.round(item.price), // Double check rounding
        quantity: item.quantity,
        name: `${item.product.name} - ${item.variant.name}`.substring(0, 50),
      }));

      // 2. Tambah Ongkir
      if (order.shippingCost > 0) {
        itemDetails.push({
          id: "SHIPPING",
          price: Math.round(order.shippingCost),
          quantity: 1,
          name: "Ongkos Kirim",
        });
      }

      // 3. Tambah Diskon Voucher (Harga Negatif)
      if (order.discount > 0) {
        itemDetails.push({
          id: "DISCOUNT",
          price: -Math.round(order.discount),
          quantity: 1,
          name: `Voucher ${order.voucherCode || ""}`,
        });
      }

      // 4. Hitung Ulang Gross Amount (Wajib!)
      // Menjumlahkan manual itemDetails agar 100% akurat dengan parameter Midtrans
      const calculatedGrossAmount = itemDetails.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const parameter = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: calculatedGrossAmount, // Pakai hasil hitung ulang
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

      console.log("🚀 Sending to Midtrans:", {
        orderId: parameter.transaction_details.order_id,
        amount: parameter.transaction_details.gross_amount,
      });

      const transaction = await snap.createTransaction(parameter);

      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      };
    } catch (error) {
      console.error("❌ Midtrans Token Error:", error.message);
      throw error;
    }
  }

  // --- Method helper lain tetap sama ---

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
