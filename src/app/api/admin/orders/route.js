/**
 * Admin Orders API
 * GET /api/admin/orders - Get all orders (admin only)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import supabase from "@/lib/prisma";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    console.log("🔍 Admin fetching orders with filters:", {
      status,
      page,
      limit,
    });

    // Build query
    let query = supabase
      .from("Order")
      .select(
        `
        *,
        items:OrderItem(
          *,
          product:Product(id, name, images),
          variant:ProductVariant(id, name, price)
        ),
        user:User(id, name, email, role, phone)
      `,
        { count: "exact" }
      )
      .order("createdAt", { ascending: false })
      .range(skip, skip + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, count: total, error } = await query;

    if (error) throw error;

    console.log(`✅ Found ${orders?.length || 0} orders (total: ${total})`);

    return NextResponse.json({
      success: true,
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
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
