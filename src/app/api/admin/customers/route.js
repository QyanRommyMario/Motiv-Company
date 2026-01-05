import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import supabase from "@/lib/supabase";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Fetch customers with pagination
    const {
      data: customers,
      count: totalCount,
      error,
    } = await supabase
      .from("User")
      .select(
        `
        id, name, email, role, createdAt,
        b2bRequest:B2BRequest(businessName, phone, address, status)
      `,
        { count: "exact" }
      )
      .order("createdAt", { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    // Get order counts for each customer
    const customerIds = customers?.map((c) => c.id) || [];

    let customersWithStats = customers || [];

    if (customerIds.length > 0) {
      // Get order data for all customers at once
      const { data: orderData } = await supabase
        .from("Order")
        .select("userId, total, status")
        .in("userId", customerIds);

      // Calculate stats per customer
      customersWithStats = (customers || []).map((customer) => {
        const customerOrders = (orderData || []).filter(
          (o) => o.userId === customer.id
        );
        const activeOrders = customerOrders.filter(
          (o) => o.status !== "CANCELLED"
        );
        const totalSpent = activeOrders.reduce(
          (sum, o) => sum + (o.total || 0),
          0
        );

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          role: customer.role,
          createdAt: customer.createdAt,
          _count: { orders: customerOrders.length },
          totalSpent,
          b2bRequest: customer.b2bRequest,
        };
      });
    }

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
