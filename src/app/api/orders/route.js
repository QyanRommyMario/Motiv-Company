/**
 * Orders API Route
 * Handles Order Creation: Supports Midtrans Snap & Auto-Approved Manual QRIS
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Pastikan path ini sesuai dengan project Anda
import { OrderModel } from "@/models/OrderModel";
import { TransactionModel } from "@/models/TransactionModel";
import { VoucherModel } from "@/models/VoucherModel";
import { MidtransService } from "@/lib/midtrans";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { paymentMethod } = body; // Menangkap metode: 'MIDTRANS' atau 'MANUAL'

    // 1. Validasi Dasar
    if (!body.shippingAddressId || !body.shipping || !body.items?.length) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // 2. Ambil Data Keranjang & Hitung Ulang Harga (Security)
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true, variant: true },
    });

    if (cartItems.length === 0)
      return NextResponse.json(
        { message: "Keranjang kosong" },
        { status: 400 }
      );

    // Cek Status B2B
    const isB2B = session.user.role === "B2B" && session.user.discount > 0;
    const userDiscount = isB2B ? session.user.discount : 0;

    let subtotal = 0;

    const orderItems = cartItems.map((item) => {
      let price = item.variant.price;

      // Terapkan Diskon B2B
      if (isB2B) {
        const discountAmount = (price * userDiscount) / 100;
        price = price - discountAmount;
      }

      price = Math.round(price);
      subtotal += price * item.quantity;

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: price,
      };
    });

    const shippingCost = Math.round(body.shipping.cost || 0);

    // Validasi Voucher
    let voucherDiscount = 0;
    if (body.voucherCode) {
      const voucherCheck = await VoucherModel.validate(
        body.voucherCode,
        subtotal
      );
      if (voucherCheck.valid) {
        voucherDiscount = Math.round(voucherCheck.discount);
      }
    }

    const total = subtotal + shippingCost - voucherDiscount;

    // 3. Simpan Order ke Database (Status Awal: PENDING)
    const shippingAddress = await prisma.shippingAddress.findUnique({
      where: { id: body.shippingAddressId },
    });

    if (!shippingAddress) {
      return NextResponse.json(
        { message: "Alamat pengiriman tidak ditemukan" },
        { status: 400 }
      );
    }

    const order = await OrderModel.create({
      userId: session.user.id,
      shippingName: shippingAddress.name,
      shippingPhone: shippingAddress.phone,
      shippingAddress: shippingAddress.address,
      shippingCity: shippingAddress.city,
      shippingProvince: shippingAddress.province,
      shippingPostalCode: shippingAddress.postalCode,
      courierName: body.shipping.courier,
      courierService: body.shipping.service,
      shippingCost,
      subtotal,
      discount: voucherDiscount,
      total,
      voucherCode: body.voucherCode || null,
      items: orderItems,
    });

    // ==========================================
    // 4. PERCABANGAN LOGIKA PEMBAYARAN
    // ==========================================

    if (paymentMethod === "MANUAL") {
      // --- LOGIKA MANUAL (AUTO-VERIFY UNTUK DEMO) ---

      // Update status order langsung jadi 'PROCESSING' dan 'PAID'
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING", // Order langsung diproses
          paymentStatus: "PAID", // Pembayaran langsung lunas
        },
      });

      // Catat transaksi sebagai 'settlement' (Sukses) agar tercatat di history
      await TransactionModel.create({
        orderId: order.id,
        transactionId: `MANUAL-${order.orderNumber}`,
        orderNumber: order.orderNumber,
        grossAmount: total,
        paymentType: "qris_manual",
        transactionStatus: "settlement", // Status sukses mirip Midtrans
        fraudStatus: "accept",
      });

      // Bersihkan Keranjang
      await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

      return NextResponse.json({
        success: true,
        data: {
          order: { id: order.id, orderNumber: order.orderNumber },
          isManual: true,
          redirectUrl: `/checkout/success?orderId=${order.orderNumber}`,
        },
      });
    } else {
      // --- LOGIKA OTOMATIS (MIDTRANS) ---
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          user: true,
          items: { include: { product: true, variant: true } },
        },
      });

      let midtransData;
      try {
        midtransData = await MidtransService.createTransaction(fullOrder);
      } catch (midtransError) {
        console.error("❌ Midtrans Error:", midtransError.message);
        // Hapus order jika gagal connect ke Midtrans agar user bisa coba lagi
        await prisma.order.delete({ where: { id: order.id } });

        return NextResponse.json(
          {
            success: false,
            message: "Gagal koneksi ke pembayaran otomatis. Cek Server Key.",
            error: midtransError.message,
          },
          { status: 500 }
        );
      }

      // Simpan Token Transaksi (Status: PENDING)
      await TransactionModel.create({
        orderId: order.id,
        transactionId: fullOrder.orderNumber,
        orderNumber: fullOrder.orderNumber,
        grossAmount: total,
        snapToken: midtransData.token,
        snapRedirectUrl: midtransData.redirect_url,
      });

      // Bersihkan Keranjang
      await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

      return NextResponse.json({
        success: true,
        data: {
          order: { id: order.id, orderNumber: order.orderNumber },
          payment: midtransData,
          isManual: false,
        },
      });
    }
  } catch (error) {
    console.error("Order Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Handler GET untuk list orders (Tidak diubah, tetap diperlukan)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const { orders, total } = await OrderModel.getUserOrders(session.user.id, {
      status: searchParams.get("status"),
      limit: parseInt(searchParams.get("limit") || "10"),
      offset: parseInt(searchParams.get("offset") || "0"),
    });

    return NextResponse.json({ success: true, data: { orders, total } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
