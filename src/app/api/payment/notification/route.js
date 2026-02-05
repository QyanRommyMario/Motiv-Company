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

    // 5. Update Status Order
    if (paymentStatus === "PAID") {
      // Update payment status to PAID
      await OrderModel.updatePaymentStatus(transaction.orderId, "PAID");

      // Update order status based on mapping (should be PROCESSING)
      const currentOrder = await OrderModel.findById(transaction.orderId);
      if (currentOrder.status === "PENDING") {
        await OrderModel.updateStatus(transaction.orderId, orderStatus); // Use mapped status
      }

      // [SECURITY FIX] Deduct stock after payment confirmation (prevents race condition)
      try {
        const stockResult = await OrderModel.deductStock(transaction.orderId);
        
        if (stockResult.success) {
          console.log("✅ [PAYMENT CONFIRMED] Stock deducted successfully:", {
            orderId: transaction.orderId,
            orderNumber: notification.order_id,
            results: stockResult.results,
            timestamp: new Date().toISOString(),
          });
        } else {
          console.warn("⚠️ [PARTIAL SUCCESS] Some items failed stock deduction:", {
            orderId: transaction.orderId,
            orderNumber: notification.order_id,
            results: stockResult.results,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (stockError) {
        console.error(
          "❌ [STOCK ERROR] Failed to deduct stock after payment:",
          {
            orderId: transaction.orderId,
            orderNumber: notification.order_id,
            error: stockError.message,
            stack: stockError.stack,
            timestamp: new Date().toISOString(),
          }
        );
        // Continue - payment already confirmed, stock issue can be resolved manually
      }
    } else if (paymentStatus === "FAILED" || paymentStatus === "EXPIRED") {
      await OrderModel.updatePaymentStatus(transaction.orderId, paymentStatus);
      await OrderModel.updateStatus(transaction.orderId, "CANCELLED", {
        cancellationReason: `Payment ${paymentStatus} by System (Midtrans)`,
      });
    } else if (paymentStatus === "PENDING_REVIEW") {
      // Handle fraud challenge case
      console.warn("⚠️ [FRAUD REVIEW] Transaction requires manual review:", {
        orderId: transaction.orderId,
        orderNumber: notification.order_id,
        fraudStatus: notification.fraud_status,
        transactionStatus: notification.transaction_status,
        timestamp: new Date().toISOString(),
      });
      // Keep order as PENDING, admin needs to review
    }

    return NextResponse.json({
      success: true,
      message: "Notification processed",
    });
  } catch (error) {
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
