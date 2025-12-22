const midtransClient = require("midtrans-client");

// Konfigurasi Environment - Paksa ke Sandbox (isProduction: false)
const isProduction = false;
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

// Inisialisasi Snap
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

// Inisialisasi CoreApi
export const core = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

export class MidtransService {
  static async createTransaction(order) {
    try {
      const itemDetails = order.items.map((item) => ({
        id: item.variant.sku || item.variant.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: `${item.product.name} - ${item.variant.name}`.substring(0, 50),
      }));

      if (order.shippingCost > 0) {
        itemDetails.push({
          id: "SHIPPING",
          price: Math.round(order.shippingCost),
          quantity: 1,
          name: "Ongkos Kirim",
        });
      }

      if (order.discount > 0) {
        itemDetails.push({
          id: "DISCOUNT",
          price: -Math.round(order.discount),
          quantity: 1,
          name: `Voucher ${order.voucherCode || ""}`,
        });
      }

      const parameter = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: itemDetails.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          ),
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

      const transaction = await snap.createTransaction(parameter);
      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      };
    } catch (error) {
      console.error("❌ Midtrans API Error:", error.message);
      throw error;
    }
  }

  static async getTransactionStatus(orderId) {
    try {
      return await core.transaction.status(orderId);
    } catch (error) {
      console.error("Midtrans Status Error:", error);
      throw error;
    }
  }

  static mapTransactionStatus(transactionStatus, fraudStatus) {
    let orderStatus = "PENDING";
    let paymentStatus = "UNPAID";

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "accept" || transactionStatus === "settlement") {
        orderStatus = "PAID";
        paymentStatus = "PAID";
      }
    } else if (["deny", "cancel", "expire"].includes(transactionStatus)) {
      orderStatus = "CANCELLED";
      paymentStatus = "FAILED";
    }

    return { orderStatus, paymentStatus };
  }
}
