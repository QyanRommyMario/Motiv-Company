/**
 * Order Model
 * Handles order operations
 */

import supabase from "@/lib/supabase";
import { generateId } from "@/lib/utils";

export class OrderModel {
  /**
   * Create new order
   */
  static async create(data) {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)
      .toUpperCase()}`;

    // [SECURITY FIX] Validate stock availability WITHOUT deducting yet
    // Stock will be deducted after payment confirmation (prevents race condition)
    for (const item of data.items) {
      const { data: variant, error: variantError } = await supabase
        .from("ProductVariant")
        .select("stock, name")
        .eq("id", item.variantId)
        .single();

      if (variantError || !variant) {
        throw new Error(`Variant dengan ID ${item.variantId} tidak ditemukan`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Stok tidak mencukupi untuk ${variant.name}. Tersedia: ${variant.stock}, Diminta: ${item.quantity}`
        );
      }

      // ✅ Stock validation OK, but NOT deducted yet
      // Will be deducted when payment status = PAID
    }

    // Create the order (without items first)
    const { items, ...orderData } = data;
    const { data: order, error: orderError } = await supabase
      .from("Order")
      .insert({ id: generateId(), orderNumber, ...orderData })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item) => ({
      id: generateId(),
      ...item,
      orderId: order.id,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from("OrderItem")
      .insert(orderItems).select(`
        *,
        product:Product(*),
        variant:ProductVariant(*)
      `);

    if (itemsError) throw itemsError;

    return { ...order, items: createdItems };
  }

  /**
   * Get order by ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
        *,
        items:OrderItem(
          *,
          product:Product(id, name, images),
          variant:ProductVariant(id, name, price)
        ),
        user:User(id, name, email, role),
        transaction:Transaction(id, transactionId, snapToken, transactionStatus, paymentType, vaNumber, bank, settlementTime)
      `
      )
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  /**
   * Get user's orders
   */
  static async getByUserId(userId, options = {}) {
    const { skip = 0, take = 10 } = options;

    const { data, error } = await supabase
      .from("Order")
      .select(
        `
        *,
        items:OrderItem(
          *,
          product:Product(name, images),
          variant:ProductVariant(name)
        )
      `
      )
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .range(skip, skip + take - 1);

    if (error) throw error;
    return data;
  }

  /**
   * Get user's orders with pagination and filters
   */
  static async getUserOrders(userId, options = {}) {
    const { status, limit = 10, offset = 0 } = options;

    let query = supabase
      .from("Order")
      .select(
        `
        *,
        items:OrderItem(
          *,
          product:Product(id, name, images),
          variant:ProductVariant(id, name, price)
        )
      `,
        { count: "exact" }
      )
      .eq("userId", userId);

    if (status) {
      query = query.eq("status", status);
    }

    const {
      data: orders,
      count,
      error,
    } = await query
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { orders, total: count || 0 };
  }

  /**
   * Get all orders (for admin)
   */
  static async getAll(options = {}) {
    const { status, skip = 0, take = 20 } = options;

    let query = supabase
      .from("Order")
      .select(
        `
        *,
        user:User(name, email),
        items:OrderItem(
          *,
          product:Product(name)
        )
      `
      )
      .order("createdAt", { ascending: false })
      .range(skip, skip + take - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Update order status
   */
  static async updateStatus(id, status, additionalData = {}) {
    // Get current order to validate status transition
    const { data: currentOrder, error: findError } = await supabase
      .from("Order")
      .select("status")
      .eq("id", id)
      .single();

    if (findError || !currentOrder) {
      throw new Error("Order tidak ditemukan");
    }

    // Define valid status transitions
    const validTransitions = {
      PENDING: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "CANCELLED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowedNextStatuses = validTransitions[currentOrder.status];
    if (!allowedNextStatuses.includes(status)) {
      throw new Error(
        `Transisi status tidak valid: ${
          currentOrder.status
        } → ${status}. Status yang diizinkan: ${
          allowedNextStatuses.join(", ") || "Tidak ada (status final)"
        }`
      );
    }

    const updateData = { status };

    if (additionalData.trackingNumber) {
      updateData.trackingNumber = additionalData.trackingNumber;
    }
    if (additionalData.shippingCourier) {
      updateData.shippingCourier = additionalData.shippingCourier;
    }
    if (additionalData.shippingService) {
      updateData.shippingService = additionalData.shippingService;
    }

    if (status === "SHIPPED") {
      updateData.shippedAt = new Date().toISOString();
    } else if (status === "DELIVERED") {
      updateData.deliveredAt = new Date().toISOString();
    } else if (status === "CANCELLED") {
      updateData.cancelledAt = new Date().toISOString();
      if (additionalData.cancellationReason) {
        updateData.cancellationReason = additionalData.cancellationReason;
      }

      // Restore stock when order is cancelled
      const { data: order } = await supabase
        .from("Order")
        .select("*, items:OrderItem(*)")
        .eq("id", id)
        .single();

      if (order && order.items) {
        for (const item of order.items) {
          const { data: variant } = await supabase
            .from("ProductVariant")
            .select("stock")
            .eq("id", item.variantId)
            .single();

          if (variant) {
            await supabase
              .from("ProductVariant")
              .update({ stock: variant.stock + item.quantity })
              .eq("id", item.variantId);
          }
        }
      }
    }

    const { data, error } = await supabase
      .from("Order")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        items:OrderItem(*, product:Product(*), variant:ProductVariant(*)),
        user:User(id, name, email),
        transaction:Transaction(*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(id, paymentStatus) {
    const { data, error } = await supabase
      .from("Order")
      .update({ paymentStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * [SECURITY FIX] Deduct stock after payment confirmation (ATOMIC)
   * Prevents race condition where stock is locked for unpaid orders
   * Uses database-level atomic operations with row locking
   */
  static async deductStock(orderId) {
    // Get order with items
    const { data: order, error: orderError } = await supabase
      .from("Order")
      .select("*, items:OrderItem(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found for stock deduction");
    }

    const results = [];

    // Deduct stock for each item using ATOMIC operation
    for (const item of order.items) {
      try {
        // ✅ Use Supabase RPC for atomic stock decrement (prevents race condition)
        const { data, error } = await supabase.rpc("atomic_decrement_stock", {
          variant_id_param: item.variantId,
          quantity_param: item.quantity,
        });

        if (error) {
          console.error(
            `❌ [STOCK ERROR] RPC failed for variant ${item.variantId}:`,
            error
          );
          results.push({
            variantId: item.variantId,
            success: false,
            error: error.message,
          });
          continue;
        }

        const result = data[0]; // RPC returns array with single result

        if (result.success) {
          console.log(
            `✅ [STOCK DEDUCTED] Variant ${item.variantId}: ${result.old_stock} → ${result.new_stock}`
          );
          results.push({
            variantId: item.variantId,
            success: true,
            oldStock: result.old_stock,
            newStock: result.new_stock,
          });
        } else {
          console.warn(
            `⚠️ [STOCK WARNING] ${result.message} for variant ${item.variantId}`
          );
          results.push({
            variantId: item.variantId,
            success: false,
            message: result.message,
          });
          // Payment already confirmed, continue anyway
        }
      } catch (rpcError) {
        console.error(
          `❌ [CRITICAL ERROR] Failed to call atomic_decrement_stock:`,
          rpcError
        );
        results.push({
          variantId: item.variantId,
          success: false,
          error: rpcError.message,
        });
      }
    }

    // Check if all items were processed successfully
    const allSuccess = results.every((r) => r.success);
    if (!allSuccess) {
      console.error(
        `⚠️ [PARTIAL STOCK DEDUCTION] Order ${orderId}: ${
          results.filter((r) => r.success).length
        }/${results.length} items processed`
      );
    }

    return {
      success: allSuccess,
      results,
    };
  }

  /**
   * Get order statistics (for dashboard)
   */
  static async getStatistics() {
    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: processingOrders },
      { count: completedOrders },
    ] = await Promise.all([
      supabase.from("Order").select("id", { count: "exact", head: true }),
      supabase
        .from("Order")
        .select("id", { count: "exact", head: true })
        .eq("status", "PENDING"),
      supabase
        .from("Order")
        .select("id", { count: "exact", head: true })
        .eq("status", "PROCESSING"),
      supabase
        .from("Order")
        .select("id", { count: "exact", head: true })
        .eq("status", "DELIVERED"),
    ]);

    // Get total revenue from paid orders
    const { data: paidOrders } = await supabase
      .from("Order")
      .select("total")
      .eq("paymentStatus", "PAID");

    const totalRevenue =
      paidOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    return {
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      processingOrders: processingOrders || 0,
      completedOrders: completedOrders || 0,
      totalRevenue,
    };
  }
}
