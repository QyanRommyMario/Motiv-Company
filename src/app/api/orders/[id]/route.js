/**
 * Order Detail API Route
 * GET /api/orders/[id] - Get order by ID
 * PATCH /api/orders/[id] - Update order status (Admin only)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderModel } from "@/models/OrderModel";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("❌ No session found");
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log("🔍 Fetching order ID:", id, "for user:", session.user.id);

    const order = await OrderModel.findById(id);

    if (!order) {
      console.log("❌ Order not found:", id);
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      console.log(
        "❌ Access denied - order belongs to:",
        order.userId,
        "but user is:",
        session.user.id
      );
      return NextResponse.json(
        { success: false, message: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    console.log("✅ Order found and access granted");
    return NextResponse.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("❌ Get order error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin can update order status
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      trackingNumber,
      shippingCourier,
      shippingService,
      cancellationReason,
    } = body;

    // Validate status
    const validStatuses = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await OrderModel.getById(id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prepare additional data
    const additionalData = {};
    if (trackingNumber) additionalData.trackingNumber = trackingNumber;
    if (shippingCourier) additionalData.shippingCourier = shippingCourier;
    if (shippingService) additionalData.shippingService = shippingService;
    if (cancellationReason)
      additionalData.cancellationReason = cancellationReason;

    // Update order status (with validation)
    let updatedOrder;
    try {
      updatedOrder = await OrderModel.updateStatus(id, status, additionalData);
    } catch (error) {
      // Handle validation errors
      if (error.message.includes("Transisi status tidak valid")) {
        console.log("❌ Invalid status transition:", error.message);
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
      // Re-throw other errors
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Status order berhasil diupdate",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate status order" },
      { status: 500 }
    );
  }
}
