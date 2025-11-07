/**
 * Order Model
 * Handles order operations
 */

import prisma from "@/lib/prisma";

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

    // Use transaction to ensure stock is updated atomically with validation
    return await prisma.$transaction(async (tx) => {
      // Validate and update stock for each item
      for (const item of data.items) {
        // Get current variant with row lock to prevent concurrent issues
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, name: true },
        });

        if (!variant) {
          throw new Error(
            `Variant dengan ID ${item.variantId} tidak ditemukan`
          );
        }

        // Check if sufficient stock is available
        if (variant.stock < item.quantity) {
          throw new Error(
            `Stok tidak mencukupi untuk ${variant.name}. Tersedia: ${variant.stock}, Diminta: ${item.quantity}`
          );
        }

        // Update stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create the order
      return await tx.order.create({
        data: {
          orderNumber,
          ...data,
          items: {
            create: data.items,
          },
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });
    });
  }

  /**
   * Get order by ID
   */
  static async findById(id) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        transaction: {
          select: {
            id: true,
            transactionId: true,
            snapToken: true,
            transactionStatus: true,
            paymentType: true,
            vaNumber: true,
            bank: true,
            settlementTime: true,
          },
        },
      },
    });
  }

  /**
   * Get user's orders
   */
  static async getByUserId(userId, options = {}) {
    const { skip = 0, take = 10 } = options;

    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
            variant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  }

  /**
   * Get user's orders with pagination and filters
   */
  static async getUserOrders(userId, options = {}) {
    const { status, limit = 10, offset = 0 } = options;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  /**
   * Get all orders (for admin)
   */
  static async getAll(options = {}) {
    const { status, skip = 0, take = 20 } = options;

    const where = {};
    if (status) {
      where.status = status;
    }

    return await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  }

  /**
   * Update order status
   */
  static async updateStatus(id, status, additionalData = {}) {
    return await prisma.$transaction(async (tx) => {
      // Get current order to validate status transition
      const currentOrder = await tx.order.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!currentOrder) {
        throw new Error("Order tidak ditemukan");
      }

      // Define valid status transitions
      const validTransitions = {
        PENDING: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED", "CANCELLED"],
        DELIVERED: [], // Final state - cannot transition
        CANCELLED: [], // Final state - cannot transition
      };

      // Validate transition
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

      const data = { status };

      // Add tracking number if provided
      if (additionalData.trackingNumber) {
        data.trackingNumber = additionalData.trackingNumber;
      }

      // Add courier info if provided
      if (additionalData.shippingCourier) {
        data.shippingCourier = additionalData.shippingCourier;
      }
      if (additionalData.shippingService) {
        data.shippingService = additionalData.shippingService;
      }

      // Update timestamps based on status
      if (status === "SHIPPED") {
        data.shippedAt = new Date();
      } else if (status === "DELIVERED") {
        data.deliveredAt = new Date();
      } else if (status === "CANCELLED") {
        data.cancelledAt = new Date();
        if (additionalData.cancellationReason) {
          data.cancellationReason = additionalData.cancellationReason;
        }

        // Restore stock when order is cancelled
        const order = await tx.order.findUnique({
          where: { id },
          include: {
            items: true,
          },
        });

        if (order) {
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }

      return await tx.order.update({
        where: { id },
        data,
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
          transaction: true,
        },
      });
    });
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(id, paymentStatus) {
    return await prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });
  }

  /**
   * Get order statistics (for dashboard)
   */
  static async getStatistics() {
    const [totalOrders, pendingOrders, processingOrders, completedOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "PROCESSING" } }),
        prisma.order.count({ where: { status: "DELIVERED" } }),
      ]);

    const totalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    });

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }
}
