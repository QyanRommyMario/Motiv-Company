/**
 * Orders API Route
 * Handles Order Creation & Midtrans Snap Token
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    // 1. Validasi Dasar
    if (!body.shippingAddressId || !body.shipping || !body.items?.length) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // 2. Ambil Data Terbaru dari Database
    // Jangan percaya data harga dari frontend/body request!
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true, variant: true },
    });

    if (cartItems.length === 0)
      return NextResponse.json(
        { message: "Keranjang kosong" },
        { status: 400 }
      );

    // --- LOGIKA HARGA BARU (FIXED) ---
    // Midtrans menolak jika Total Harga != Sum(Harga Item).
    // Solusinya: Bulatkan harga satuan (Math.round) SEBELUM dikali quantity.

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

      // [PENTING] Bulatkan harga satuan agar jadi Integer murni
      price = Math.round(price);

      subtotal += price * item.quantity;

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: price, // Simpan harga bulat ini ke DB
      };
    });

    // Ongkir juga dibulatkan
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

    // Total Akhir = Subtotal + Ongkir - Voucher
    // Karena semua komponen sudah dibulatkan, total ini pasti valid.
    const total = subtotal + shippingCost - voucherDiscount;

    // 3. Simpan Order ke Database
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
      items: orderItems, // Gunakan items yang sudah dihitung & dibulatkan
    });

    // 4. Minta Token ke Midtrans
    // Ambil ulang order lengkap dengan relasi item & user
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: true,
        items: { include: { product: true, variant: true } },
      },
    });

    let midtransData;
    try {
      // Panggil Service Midtrans
      midtransData = await MidtransService.createTransaction(fullOrder);
    } catch (midtransError) {
      console.error("❌ Midtrans Error:", midtransError.message);

      // Hapus order jika gagal connect ke Midtrans agar user bisa coba lagi
      // Ini mencegah order 'nyangkut' di status PENDING tanpa token pembayaran
      await prisma.order.delete({ where: { id: order.id } });

      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal koneksi ke pembayaran. Cek Server Key Anda atau hitungan harga.",
          error: midtransError.message,
        },
        { status: 500 }
      );
    }

    // 5. Simpan Token Transaksi
    await TransactionModel.create({
      orderId: order.id,
      transactionId: fullOrder.orderNumber,
      orderNumber: fullOrder.orderNumber,
      grossAmount: total,
      snapToken: midtransData.token, // Token sukses didapat
      snapRedirectUrl: midtransData.redirect_url,
    });

    // 6. Bersihkan Keranjang
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

    return NextResponse.json({
      success: true,
      data: {
        order: { id: order.id, orderNumber: order.orderNumber },
        payment: midtransData,
      },
    });
  } catch (error) {
    console.error("Order Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

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
