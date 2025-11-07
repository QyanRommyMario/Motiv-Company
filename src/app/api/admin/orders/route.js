/**
 * Admin Orders API
 * GET /api/admin/orders - Get all orders (admin only)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where = {};
    if (status) {
      where.status = status;
    }

    console.log("🔍 Admin fetching orders with filters:", {
      status,
      limit,
      offset,
    });

    // Fetch orders with user info
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    console.log(`✅ Found ${orders.length} orders (total: ${total})`);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("❌ Admin orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data orders" },
      { status: 500 }
    );
  }
}
