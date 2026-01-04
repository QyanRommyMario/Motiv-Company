/**
 * Admin Statistics API
 * GET /api/admin/stats - Get dashboard statistics
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import supabase from "@/lib/prisma";

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
      ordersCount,
      productsCount,
      usersCount,
      paidOrders,
      pendingOrdersCount,
      recentOrdersData,
      lowStockData,
    ] = await Promise.all([
      // Total orders
      supabase.from("Order").select("id", { count: "exact", head: true }),

      // Total products
      supabase.from("Product").select("id", { count: "exact", head: true }),

      // Total users (customers only)
      supabase
        .from("User")
        .select("id", { count: "exact", head: true })
        .eq("role", "B2C"),

      // Paid orders for revenue
      supabase.from("Order").select("total").eq("paymentStatus", "PAID"),

      // Pending orders
      supabase
        .from("Order")
        .select("id", { count: "exact", head: true })
        .in("status", ["PENDING", "PAID", "PROCESSING"]),

      // Recent orders (last 10)
      supabase
        .from("Order")
        .select(
          `
          *,
          user:User(name, email),
          items:OrderItem(
            *,
            variant:ProductVariant(*, product:Product(name, images))
          )
        `
        )
        .order("createdAt", { ascending: false })
        .limit(10),

      // Low stock products (stock < 10)
      supabase
        .from("ProductVariant")
        .select(`*, product:Product(name, images)`)
        .lt("stock", 10)
        .limit(5),
    ]);

    const totalOrders = ordersCount.count || 0;
    const totalProducts = productsCount.count || 0;
    const totalUsers = usersCount.count || 0;
    const totalRevenue =
      paidOrders.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const pendingOrders = pendingOrdersCount.count || 0;
    const recentOrders = recentOrdersData.data || [];
    const lowStockProducts = lowStockData.data || [];

    // Top selling products (simplified approach)
    const { data: orderItems } = await supabase
      .from("OrderItem")
      .select("variantId, quantity");

    // Group by variantId and sum quantities
    const topProductsMap = new Map();
    (orderItems || []).forEach((item) => {
      const current = topProductsMap.get(item.variantId) || {
        quantity: 0,
        count: 0,
      };
      topProductsMap.set(item.variantId, {
        quantity: current.quantity + item.quantity,
        count: current.count + 1,
      });
    });

    // Get top 5
    const topProductIds = Array.from(topProductsMap.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)
      .map(([id]) => id);

    let topProductsWithDetails = [];
    if (topProductIds.length > 0) {
      const { data: topProductDetails } = await supabase
        .from("ProductVariant")
        .select(`*, product:Product(name, images)`)
        .in("id", topProductIds);

      topProductsWithDetails = topProductIds.map((id) => {
        const detail = topProductDetails?.find((d) => d.id === id);
        const stats = topProductsMap.get(id);
        return {
          totalQuantity: stats?.quantity || 0,
          orderCount: stats?.count || 0,
          variant: detail,
        };
      });
    }

    // Calculate growth (compared to last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [lastMonthOrdersData, lastMonthRevenueData] = await Promise.all([
      supabase
        .from("Order")
        .select("id", { count: "exact", head: true })
        .gte("createdAt", lastMonth.toISOString()),
      supabase
        .from("Order")
        .select("total")
        .eq("paymentStatus", "PAID")
        .gte("createdAt", lastMonth.toISOString()),
    ]);

    const lastMonthOrders = lastMonthOrdersData.count || 0;
    const lastMonthRevenue =
      lastMonthRevenueData.data?.reduce((sum, o) => sum + (o.total || 0), 0) ||
      0;

    return NextResponse.json({
      success: true,
      stats: {
        overview: {
          totalOrders,
          totalProducts,
          totalUsers,
          totalRevenue,
          pendingOrders,
        },
        growth: {
          ordersThisMonth: lastMonthOrders,
          revenueThisMonth: lastMonthRevenue,
        },
        recentOrders,
        lowStockProducts,
        topProducts: topProductsWithDetails,
      },
    });
  } catch (error) {
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
