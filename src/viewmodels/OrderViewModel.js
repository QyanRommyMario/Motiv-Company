/**
 * Order ViewModel
 * Handles order business logic
 */

import { OrderModel } from "@/models/OrderModel";
import { CartModel } from "@/models/CartModel";
import { VoucherModel } from "@/models/VoucherModel";
import { ProductVariantModel } from "@/models/ProductVariantModel";
import supabase from "@/lib/prisma";

export class OrderViewModel {
  /**
   * Create order from cart
   */
  static async createOrder(userId, orderData) {
    try {
      // Get cart items
      const cartItems = await CartModel.getByUserId(userId);

      if (cartItems.length === 0) {
        throw new Error("Keranjang Anda kosong");
      }

      // Get user info
      const { data: user, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Validate stock
      for (const item of cartItems) {
        if (item.variant.stock < item.quantity) {
          throw new Error(
            `Stok ${item.product.name} - ${item.variant.name} tidak mencukupi`
          );
        }
      }

      // Calculate subtotal with B2B discount
      let subtotal = 0;
      const orderItems = cartItems.map((item) => {
        let price = item.variant.price;

        // Apply B2B discount
        if (user.role === "B2B" && user.discount > 0) {
          price = price - (price * user.discount) / 100;
        }

        subtotal += price * item.quantity;

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price,
        };
      });

      // Apply voucher if provided
      let discount = 0;
      let voucherCode = null;

      if (orderData.voucherCode) {
        const voucherResult = await VoucherModel.validateAndApply(
          orderData.voucherCode,
          subtotal
        );
        discount = voucherResult.discount;
        voucherCode = orderData.voucherCode;
      }

      // Calculate total
      const total = subtotal - discount + orderData.shippingCost;

      // Create order
      const order = await OrderModel.create({
        userId,
        items: orderItems,
        shippingName: orderData.shippingName,
        shippingPhone: orderData.shippingPhone,
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingProvince: orderData.shippingProvince,
        shippingPostalCode: orderData.shippingPostalCode,
        courierName: orderData.courierName,
        courierService: orderData.courierService,
        shippingCost: orderData.shippingCost,
        isCustomShipping: orderData.isCustomShipping || false,
        customShippingNote: orderData.customShippingNote,
        subtotal,
        discount,
        voucherCode,
        total,
      });

      // Decrease stock
      for (const item of cartItems) {
        await ProductVariantModel.decreaseStock(item.variantId, item.quantity);
      }

      // Increment voucher usage
      if (voucherCode) {
        const voucher = await VoucherModel.findByCode(voucherCode);
        await VoucherModel.incrementUsage(voucher.id);
      }

      // Clear cart
      await CartModel.clearCart(userId);

      return {
        success: true,
        message: "Pesanan berhasil dibuat",
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId, userId = null) {
    try {
      const order = await OrderModel.findById(orderId);

      if (!order) {
        throw new Error("Pesanan tidak ditemukan");
      }

      // Verify user owns this order (if not admin)
      if (userId && order.userId !== userId) {
        throw new Error("Unauthorized");
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId, options = {}) {
    try {
      const orders = await OrderModel.getByUserId(userId, options);

      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get all orders (Admin)
   */
  static async getAllOrders(options = {}) {
    try {
      const orders = await OrderModel.getAll(options);

      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Update order status (Admin)
   */
  static async updateOrderStatus(orderId, status, trackingNumber = null) {
    try {
      const order = await OrderModel.updateStatus(
        orderId,
        status,
        trackingNumber
      );

      return {
        success: true,
        message: "Status pesanan berhasil diperbarui",
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get order statistics (Admin Dashboard)
   */
  static async getStatistics() {
    try {
      const stats = await OrderModel.getStatistics();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
