/**
 * Midtrans Payment Notification Webhook
 * Production Ready: Handles Stock Reversal on Failure
 */

import { NextResponse } from "next/server";
import { MidtransService } from "@/lib/midtrans";
import { TransactionModel } from "@/models/TransactionModel";
import { OrderModel } from "@/models/OrderModel";
import crypto from "crypto";

export async function POST(request) {
  try {
    const notification = await request.json();

    console.log("Midtrans notification received:", notification);

    // 1. Verifikasi Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;

    const signatureKey = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    if (signatureKey !== notification.signature_key) {
      console.error("Invalid signature");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 403 }
      );
    }

    // 2. Cari Transaksi
    const transaction = await TransactionModel.getByTransactionId(
      notification.order_id
    );

    if (!transaction) {
      console.error("Transaction not found:", notification.order_id);
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    // 3. Mapping Status
    const { orderStatus, paymentStatus } = MidtransService.mapTransactionStatus(
      notification.transaction_status,
      notification.fraud_status
    );

    // 4. Update Data Transaksi
    await TransactionModel.updateStatus(notification.order_id, {
      transactionStatus: notification.transaction_status,
      fraudStatus: notification.fraud_status,
      paymentType: notification.payment_type,
      vaNumber: notification.va_numbers?.[0]?.va_number || null,
      bank: notification.va_numbers?.[0]?.bank || notification.bank || null,
      settlementTime: notification.settlement_time
        ? new Date(notification.settlement_time)
        : null,
    });

    // 5. Update Status Order (PENTING: Handle Restock)
    if (paymentStatus === "PAID") {
      // Jika bayar sukses -> PROCESSING
      await OrderModel.updatePaymentStatus(transaction.orderId, "PAID");

      // Cek agar tidak mendowngrade status jika sudah SHIPPED dll
      const currentOrder = await OrderModel.findById(transaction.orderId);
      if (currentOrder.status === "PENDING") {
        await OrderModel.updateStatus(transaction.orderId, "PROCESSING");
      }
    } else if (paymentStatus === "FAILED" || paymentStatus === "EXPIRED") {
      // Jika gagal/expired -> CANCELLED
      // OrderModel.updateStatus("CANCELLED") akan otomatis mengembalikan stok (increment)
      // sesuai logika di file OrderModel.js yang sudah Anda miliki.

      await OrderModel.updatePaymentStatus(transaction.orderId, paymentStatus);
      await OrderModel.updateStatus(transaction.orderId, "CANCELLED", {
        cancellationReason: `Payment ${paymentStatus} by System (Midtrans)`,
      });

      console.log(
        `Order ${transaction.orderNumber} dibatalkan & stok dikembalikan.`
      );
    }

    // Status 'PENDING' dibiarkan saja (menunggu user bayar)

    return NextResponse.json({
      success: true,
      message: "Notification processed",
    });
  } catch (error) {
    console.error("Payment notification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process notification",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Midtrans notification endpoint is active",
  });
}
