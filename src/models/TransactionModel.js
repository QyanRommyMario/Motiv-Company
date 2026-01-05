/**
 * TransactionModel - Payment Transaction Management
 * Handles Midtrans payment transactions
 */

import supabase from "@/lib/supabase";
import { generateId } from "@/lib/utils";

export class TransactionModel {
  /**
   * Create new transaction
   */
  static async create(transactionData) {
    const { data: transaction, error } = await supabase
      .from("Transaction")
      .insert({
        id: generateId(),
        orderId: transactionData.orderId,
        transactionId: transactionData.transactionId,
        orderNumber: transactionData.orderNumber,
        paymentType: transactionData.paymentType || null,
        grossAmount: transactionData.grossAmount,
        transactionStatus: transactionData.transactionStatus || "pending",
        fraudStatus: transactionData.fraudStatus || null,
        vaNumber: transactionData.vaNumber || null,
        bank: transactionData.bank || null,
        paymentCode: transactionData.paymentCode || null,
        billKey: transactionData.billKey || null,
        billerCode: transactionData.billerCode || null,
        snapToken: transactionData.snapToken || null,
        snapRedirectUrl: transactionData.snapRedirectUrl || null,
        transactionTime: transactionData.transactionTime || null,
        expiryTime: transactionData.expiryTime || null,
      })
      .select(`*, order:Order(*)`)
      .single();

    if (error) throw error;
    return transaction;
  }

  /**
   * Get transaction by ID
   */
  static async getById(transactionId) {
    const { data, error } = await supabase
      .from("Transaction")
      .select(
        `
        *,
        order:Order(
          *,
          items:OrderItem(*, product:Product(*), variant:ProductVariant(*)),
          user:User(id, name, email)
        )
      `
      )
      .eq("id", transactionId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Get transaction by Midtrans transaction ID
   */
  static async getByTransactionId(transactionId) {
    const { data, error } = await supabase
      .from("Transaction")
      .select(
        `
        *,
        order:Order(
          *,
          user:User(id, name, email)
        )
      `
      )
      .eq("transactionId", transactionId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Get transaction by order ID
   */
  static async getByOrderId(orderId) {
    const { data, error } = await supabase
      .from("Transaction")
      .select(`*, order:Order(*)`)
      .eq("orderId", orderId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Update transaction status from Midtrans notification
   */
  static async updateStatus(transactionId, statusData) {
    const updateData = {
      transactionStatus: statusData.transactionStatus,
      fraudStatus: statusData.fraudStatus || null,
    };

    if (statusData.paymentType) updateData.paymentType = statusData.paymentType;
    if (statusData.vaNumber) updateData.vaNumber = statusData.vaNumber;
    if (statusData.bank) updateData.bank = statusData.bank;
    if (statusData.settlementTime)
      updateData.settlementTime = statusData.settlementTime;

    const { data, error } = await supabase
      .from("Transaction")
      .update(updateData)
      .eq("transactionId", transactionId)
      .select(`*, order:Order(*)`)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark transaction as expired
   */
  static async markExpired(transactionId) {
    const { data, error } = await supabase
      .from("Transaction")
      .update({ transactionStatus: "expire" })
      .eq("transactionId", transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get pending transactions (for cleanup/check status)
   */
  static async getPending(olderThan = null) {
    let query = supabase
      .from("Transaction")
      .select(`*, order:Order(*)`)
      .eq("transactionStatus", "pending");

    if (olderThan) {
      query = query.lt("createdAt", olderThan.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
