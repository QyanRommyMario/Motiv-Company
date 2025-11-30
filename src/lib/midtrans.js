/**
 * Midtrans Payment Gateway Integration
 * Handles Snap API and Core API operations
 */

const midtransClient = require("midtrans-client");

// Debugging: Cek env variable
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
  static async createTransaction(order) {
    try {
      // 1. Buat daftar item dasar
      const itemDetails = order.items.map((item) => ({
        id: item.variant.sku || item.variant.id,
        price: Math.round(item.price), // Pastikan bulat
        quantity: item.quantity,
        name: `${item.product.name} - ${item.variant.name}`.substring(0, 50),
      }));

      // 2. Tambah Ongkir (jika ada)
      if (order.shippingCost > 0) {
        itemDetails.push({
          id: "SHIPPING",
          price: Math.round(order.shippingCost),
          quantity: 1,
          name: "Ongkos Kirim",
        });
      }

      // 3. Tambah Diskon (jika ada)
      if (order.discount > 0) {
        itemDetails.push({
          id: "DISCOUNT",
          price: -Math.round(order.discount),
          quantity: 1,
          name: "Diskon Voucher",
        });
      }

      // 4. Hitung Ulang Gross Amount dari Item Details
      // Ini adalah pengaman terakhir agar Total == Sum(Items)
      const calculatedGrossAmount = itemDetails.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

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

  // ... (Method lain seperti getTransactionStatus dll biarkan sama)
  static async getTransactionStatus(orderId) {
    try {
      const statusResponse = await core.transaction.status(orderId);
      return statusResponse;
    } catch (error) {
      console.error("Midtrans get status error:", error);
      throw error;
    }
  }
}
