/**
 * Admin Statistics API
 * GET /api/admin/stats - Get dashboard statistics
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin access
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get statistics in parallel
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      pendingOrders,
      recentOrders,
      lowStockProducts,
      topProducts,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Total products
      prisma.product.count(),

      // Total users (customers only)
      prisma.user.count({
        where: { role: "B2C" },
      }),

      // Total revenue (paid orders only)
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),

      // Pending orders
      prisma.order.count({
        where: {
          status: { in: ["PENDING", "PAID", "PROCESSING"] },
        },
      }),

      // Recent orders (last 10)
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true,
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      // Low stock products (stock < 10)
      prisma.productVariant.findMany({
        where: {
          stock: { lt: 10 },
        },
        include: {
          product: {
            select: {
              name: true,
              images: true,
            },
          },
        },
        take: 5,
      }),

      // Top selling products (by order items count)
      prisma.orderItem.groupBy({
        by: ["variantId"],
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      }),
    ]);

    // Get product details for top products
    const topProductIds = topProducts.map((p) => p.variantId);
    const topProductDetails = await prisma.productVariant.findMany({
      where: {
        id: { in: topProductIds },
      },
      include: {
        product: {
          select: {
            name: true,
            images: true,
          },
        },
      },
    });

    // Merge top products with details
    const topProductsWithDetails = topProducts.map((tp) => {
      const detail = topProductDetails.find((d) => d.id === tp.variantId);
      return {
        ...tp,
        variant: detail,
      };
    });

    // Calculate growth (compared to last month - simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [lastMonthOrders, lastMonthRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: lastMonth },
        },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: lastMonth },
        },
        _sum: { total: true },
      }),
    ]);

    console.log("📊 Dashboard stats calculated successfully");

    return NextResponse.json({
      success: true,
      stats: {
        overview: {
          totalOrders,
          totalProducts,
          totalUsers,
          totalRevenue: totalRevenue._sum.total || 0,
          pendingOrders,
        },
        growth: {
          ordersThisMonth: lastMonthOrders,
          revenueThisMonth: lastMonthRevenue._sum.total || 0,
        },
        recentOrders,
        lowStockProducts,
        topProducts: topProductsWithDetails,
      },
    });
  } catch (error) {
    console.error("❌ Admin stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get statistics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
