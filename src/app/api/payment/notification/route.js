/**
 * Midtrans Payment Notification Webhook
 * POST /api/payment/notification - Handle Midtrans notifications
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

    // Verify notification signature
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

    // Get transaction from database
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

    // Map Midtrans status to our status
    const { orderStatus, paymentStatus } = MidtransService.mapTransactionStatus(
      notification.transaction_status,
      notification.fraud_status
    );

    // Update transaction
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

    // Update order status and payment status synchronously
    const updateData = { paymentStatus };

    // Only update order status if payment is successful (PAID)
    // This prevents auto-advancing order status on failed/pending payments
    if (paymentStatus === "PAID" && orderStatus === "PROCESSING") {
      // Order status will be updated to PROCESSING only when payment is confirmed
      await OrderModel.updateStatus(transaction.orderId, orderStatus);
    } else {
      // Just update payment status without changing order status
      await OrderModel.updatePaymentStatus(transaction.orderId, paymentStatus);
    }

    // TODO: Send email notification to customer
    if (paymentStatus === "PAID") {
      console.log(`Payment successful for order ${transaction.orderNumber}`);
      // Stock already updated during order creation
      // TODO: Implement email notification here
    } else if (paymentStatus === "FAILED" || paymentStatus === "EXPIRED") {
      console.log(
        `Payment ${paymentStatus.toLowerCase()} for order ${
          transaction.orderNumber
        }`
      );
      // TODO: Send payment failed/expired email notification
    }

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

// GET endpoint untuk testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Midtrans notification endpoint is active",
  });
}
