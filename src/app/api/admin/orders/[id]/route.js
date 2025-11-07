/**
 * Admin Single Order API
 * PATCH /api/admin/orders/[id] - Update order status (admin only)
 * GET /api/admin/orders/[id] - Get order details (admin only)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      console.log("❌ Unauthorized access attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Await params for Next.js 16
    const { id } = await params;
    console.log("🔍 Fetching order ID:", id);

    const order = await prisma.order.findUnique({
      where: { id },
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
            phone: true,
            role: true,
          },
        },
        transaction: true,
      },
    });

    if (!order) {
      console.log("❌ Order not found:", id);
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("✅ Order found:", order.orderNumber);
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      console.log("❌ Unauthorized update attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Await params for Next.js 16
    const { id } = await params;
    const body = await request.json();

    console.log("📝 Updating order:", id, "with data:", body);

    // Update order
    const updateData = {};

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.trackingNumber !== undefined) {
      updateData.trackingNumber = body.trackingNumber;
    }

    if (body.paymentStatus) {
      updateData.paymentStatus = body.paymentStatus;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
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
      },
    });

    console.log("✅ Order updated successfully:", order.id);

    return NextResponse.json({
      success: true,
      message: "Order berhasil diupdate",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate order" },
      { status: 500 }
    );
  }
}
