/**
 * TransactionModel - Payment Transaction Management
 * Handles Midtrans payment transactions
 */

import supabase from "@/lib/prisma";
import { generateId } from "@/lib/utils";

export class TransactionModel {
  /**
   * Create new transaction
   */
  static async create(transactionData) {
    try {
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
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getById(transactionId) {
    try {
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
    } catch (error) {
      console.error("Error getting transaction:", error);
      throw error;
    }
  }

  /**
   * Get transaction by Midtrans transaction ID
   */
  static async getByTransactionId(transactionId) {
    try {
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
    } catch (error) {
      console.error("Error getting transaction by transactionId:", error);
      throw error;
    }
  }

  /**
   * Get transaction by order ID
   */
  static async getByOrderId(orderId) {
    try {
      const { data, error } = await supabase
        .from("Transaction")
        .select(`*, order:Order(*)`)
        .eq("orderId", orderId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error getting transaction by orderId:", error);
      throw error;
    }
  }

  /**
   * Update transaction status from Midtrans notification
   */
  static async updateStatus(transactionId, statusData) {
    try {
      const updateData = {
        transactionStatus: statusData.transactionStatus,
        fraudStatus: statusData.fraudStatus || null,
      };

      if (statusData.paymentType)
        updateData.paymentType = statusData.paymentType;
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
    } catch (error) {
      console.error("Error updating transaction status:", error);
      throw error;
    }
  }

  /**
   * Mark transaction as expired
   */
  static async markExpired(transactionId) {
    try {
      const { data, error } = await supabase
        .from("Transaction")
        .update({ transactionStatus: "expire" })
        .eq("transactionId", transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error marking transaction as expired:", error);
      throw error;
    }
  }

  /**
   * Get pending transactions (for cleanup/check status)
   */
  static async getPending(olderThan = null) {
    try {
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
    } catch (error) {
      console.error("Error getting pending transactions:", error);
      throw error;
    }
  }
}
