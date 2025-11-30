/**
 * Order Detail API Route
 * GET /api/orders/[id] - Get order by ID & Snap Token
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderModel } from "@/models/OrderModel"; // Pastikan import ini ada jika pakai OrderModel helper, atau pakai prisma langsung
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // [PERBAIKAN 1] Await params (Wajib untuk Next.js 15)
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Order diperlukan" },
        { status: 400 }
      );
    }

    // [PERBAIKAN 2] Ambil data Order + Item + Transaksi (Token)
    // Hapus 'shippingAddress: true' dari include karena di schema Anda itu cuma String, bukan Relasi.
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        transaction: true, // PENTING: Ambil data transaksi untuk dapat Snap Token
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek kepemilikan data (Security)
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    // [PERBAIKAN 3] Format data agar token mudah dibaca Frontend
    // Kita taruh snapToken di root object agar frontend gampang ambilnya
    const formattedOrder = {
      ...order,
      snapToken: order.transaction ? order.transaction.snapToken : null,
    };

    return NextResponse.json({
      success: true,
      data: formattedOrder, // Frontend mengharapkan properti 'data'
    });
  } catch (error) {
    console.error("❌ Get order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data order: " + error.message,
      },
      { status: 500 }
    );
  }
}

// ... (Biarkan fungsi PATCH tetap ada di bawahnya seperti semula)
export async function PATCH(request, { params }) {
  // Kode PATCH Anda yang lama (untuk update status admin) biarkan saja, tidak perlu diubah
  // ...
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
