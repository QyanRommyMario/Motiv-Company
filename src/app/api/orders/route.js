/**
 * Orders API Route
 * Production Ready: Manual Payment set to PENDING
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderModel } from "@/models/OrderModel";
import { TransactionModel } from "@/models/TransactionModel";
import { VoucherModel } from "@/models/VoucherModel";
import { MidtransService } from "@/lib/midtrans";
import supabase from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { paymentMethod } = body;

    // 1. Validasi Dasar
    if (!body.shippingAddressId || !body.shipping || !body.items?.length) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // 2. Ambil Data Keranjang & Hitung Ulang Harga (Security)
    const { data: cartItems, error: cartError } = await supabase
      .from("CartItem")
      .select(`*, product:Product(*), variant:ProductVariant(*)`)
      .eq("userId", session.user.id);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0)
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

    // 3. Simpan Order ke Database (Stok berkurang disini)
    const { data: shippingAddress, error: addrError } = await supabase
      .from("ShippingAddress")
      .select("*")
      .eq("id", body.shippingAddressId)
      .single();

    if (addrError || !shippingAddress) {
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
    // 4. PERCABANGAN LOGIKA PEMBAYARAN (FIXED)
    // ==========================================

    if (paymentMethod === "MANUAL") {
      // [PERBAIKAN] Logic Production: Set ke PENDING, bukan PAID.

      await supabase
        .from("Order")
        .update({
          status: "PENDING",
          paymentStatus: "UNPAID",
        })
        .eq("id", order.id);

      // Catat transaksi manual pending
      await TransactionModel.create({
        orderId: order.id,
        transactionId: `MANUAL-${order.orderNumber}`,
        orderNumber: order.orderNumber,
        grossAmount: total,
        paymentType: "manual_transfer",
        transactionStatus: "pending",
        fraudStatus: "accept",
      });

      // Bersihkan Keranjang
      await supabase.from("CartItem").delete().eq("userId", session.user.id);

      return NextResponse.json({
        success: true,
        data: {
          order: { id: order.id, orderNumber: order.orderNumber },
          isManual: true,
          // Redirect ke detail order untuk instruksi transfer
          redirectUrl: `/profile/orders/${order.id}`,
        },
      });
    } else {
      // --- LOGIKA OTOMATIS (MIDTRANS) ---
      const { data: fullOrder, error: orderError } = await supabase
        .from("Order")
        .select(
          `
          *,
          user:User(*),
          items:OrderItem(*, product:Product(*), variant:ProductVariant(*))
        `
        )
        .eq("id", order.id)
        .single();

      if (orderError) throw orderError;

      let midtransData;
      try {
        midtransData = await MidtransService.createTransaction(fullOrder);
      } catch (midtransError) {
        console.error("❌ Midtrans Error:", midtransError.message);
        // Hapus order agar stok kembali jika gagal connect
        await supabase.from("Order").delete().eq("id", order.id);

        return NextResponse.json(
          {
            success: false,
            message: "Gagal koneksi ke pembayaran otomatis. Cek Server Key.",
            error: midtransError.message,
          },
          { status: 500 }
        );
      }

      // Simpan Token Transaksi
      await TransactionModel.create({
        orderId: order.id,
        transactionId: fullOrder.orderNumber,
        orderNumber: fullOrder.orderNumber,
        grossAmount: total,
        snapToken: midtransData.token,
        snapRedirectUrl: midtransData.redirect_url,
      });

      // Bersihkan Keranjang
      await supabase.from("CartItem").delete().eq("userId", session.user.id);

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
