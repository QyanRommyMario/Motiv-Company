/**
 * TransactionModel - Payment Transaction Management
 * Handles Midtrans payment transactions
 */

import prisma from "@/lib/prisma";

export class TransactionModel {
  /**
   * Create new transaction
   */
  static async create(transactionData) {
    try {
      const transaction = await prisma.transaction.create({
        data: {
          orderId: transactionData.orderId,
          transactionId: transactionData.transactionId,
          orderNumber: transactionData.orderNumber,
          paymentType: transactionData.paymentType || null,
          grossAmount: transactionData.grossAmount,
          transactionStatus: transactionData.transactionStatus || "pending",
          fraudStatus: transactionData.fraudStatus || null,

          // Payment details (VA/Code)
          vaNumber: transactionData.vaNumber || null,
          bank: transactionData.bank || null,
          paymentCode: transactionData.paymentCode || null,
          billKey: transactionData.billKey || null,
          billerCode: transactionData.billerCode || null,

          // Snap data
          snapToken: transactionData.snapToken || null,
          snapRedirectUrl: transactionData.snapRedirectUrl || null,

          // Timestamps
          transactionTime: transactionData.transactionTime || null,
          expiryTime: transactionData.expiryTime || null,
        },
        include: {
          order: true,
        },
      });

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
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                  variant: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return transaction;
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
      const transaction = await prisma.transaction.findUnique({
        where: { transactionId },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return transaction;
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
      const transaction = await prisma.transaction.findUnique({
        where: { orderId },
        include: {
          order: true,
        },
      });

      return transaction;
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
      const transaction = await prisma.transaction.update({
        where: { transactionId },
        data: {
          transactionStatus: statusData.transactionStatus,
          fraudStatus: statusData.fraudStatus || null,
          paymentType: statusData.paymentType || undefined,
          vaNumber: statusData.vaNumber || undefined,
          bank: statusData.bank || undefined,
          settlementTime: statusData.settlementTime || undefined,
        },
        include: {
          order: true,
        },
      });

      return transaction;
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
      const transaction = await prisma.transaction.update({
        where: { transactionId },
        data: {
          transactionStatus: "expire",
        },
      });

      return transaction;
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
      const where = {
        transactionStatus: "pending",
      };

      if (olderThan) {
        where.createdAt = {
          lt: olderThan,
        };
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          order: true,
        },
      });

      return transactions;
    } catch (error) {
      console.error("Error getting pending transactions:", error);
      throw error;
    }
  }
}
