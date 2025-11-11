import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    // Fetch customers with pagination and aggregated data
    const [customers, totalCount] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
          b2bRequest: {
            select: {
              businessName: true,
              phone: true,
              address: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    // Calculate total spent for each customer using aggregation
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderStats = await prisma.order.aggregate({
          where: {
            userId: customer.id,
            status: { not: "CANCELLED" },
          },
          _sum: {
            total: true,
          },
        });

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          role: customer.role,
          createdAt: customer.createdAt,
          _count: customer._count,
          totalSpent: orderStats._sum.total || 0,
          b2bRequest: customer.b2bRequest,
        };
      })
    );

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
