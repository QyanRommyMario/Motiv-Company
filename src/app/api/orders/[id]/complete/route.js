/**
 * Complete Order API Route (Customer Side)
 * PATCH /api/orders/[id]/complete - Mark order as delivered (customer confirmation)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderModel } from "@/models/OrderModel";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get order and verify ownership
    const order = await OrderModel.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check ownership (customer can only complete their own orders)
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    // Only SHIPPED orders can be completed by customer
    if (order.status !== "SHIPPED") {
      return NextResponse.json(
        {
          success: false,
          message: `Pesanan dengan status ${order.status} tidak dapat diselesaikan. Hanya pesanan dengan status SHIPPED yang dapat dikonfirmasi.`,
        },
        { status: 400 }
      );
    }

    // Update order status to DELIVERED
    const updatedOrder = await OrderModel.updateStatus(id, "DELIVERED", {});

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil diselesaikan",
      order: updatedOrder,
    });
  } catch (error) {
    // Handle validation errors from OrderModel
    if (error.message.includes("Transisi status tidak valid")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyelesaikan pesanan",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
