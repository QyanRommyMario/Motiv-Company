/**
 * Orders API Route
 * POST /api/orders - Create new order and initialize payment
 * GET /api/orders - Get user orders
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
    console.log("🛒 POST /api/orders called");
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("❌ No session");
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("📦 Request body:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (
      !body.shippingAddressId ||
      !body.shipping ||
      !body.items ||
      body.items.length === 0
    ) {
      console.log("❌ Data order tidak lengkap");
      console.log("Missing fields:", {
        shippingAddressId: !body.shippingAddressId,
        shipping: !body.shipping,
        items: !body.items || body.items.length === 0,
      });
      return NextResponse.json(
        { success: false, message: "Data order tidak lengkap" },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed");

    // Get shipping address
    const shippingAddress = await prisma.shippingAddress.findUnique({
      where: { id: body.shippingAddressId },
    });

    if (!shippingAddress || shippingAddress.userId !== session.user.id) {
      console.log("❌ Alamat pengiriman tidak valid");
      return NextResponse.json(
        { success: false, message: "Alamat pengiriman tidak valid" },
        { status: 400 }
      );
    }

    console.log("✅ Shipping address found:", shippingAddress.id);

    // Get cart items with product and variant details
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    console.log(`✅ Found ${cartItems.length} cart items`);

    if (cartItems.length === 0) {
      console.log("❌ Keranjang kosong");
      return NextResponse.json(
        { success: false, message: "Keranjang kosong" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + item.variant.price * item.quantity;
    }, 0);

    const shippingCost = body.shipping.cost || 0;
    let discount = body.discount || 0;

    // Validate voucher if provided
    if (body.voucherCode) {
      const voucherValidation = await VoucherModel.validate(
        body.voucherCode,
        subtotal
      );
      if (!voucherValidation.valid) {
        return NextResponse.json(
          { success: false, message: voucherValidation.message },
          { status: 400 }
        );
      }
      discount = voucherValidation.discount;
    }

    const total = subtotal + shippingCost - discount;

    console.log("💰 Order totals:", {
      subtotal,
      shippingCost,
      discount,
      total,
    });

    // Prepare order data matching Prisma schema fields
    const orderData = {
      userId: session.user.id,
      // Shipping address fields
      shippingName: shippingAddress.name,
      shippingPhone: shippingAddress.phone,
      shippingAddress: shippingAddress.address,
      shippingCity: shippingAddress.city,
      shippingProvince: shippingAddress.province,
      shippingCountry: shippingAddress.country || "Indonesia",
      shippingPostalCode: shippingAddress.postalCode,
      // Courier fields (not nested, flat in schema)
      courierName: body.shipping.courier || "JNE",
      courierService: body.shipping.service || "REG",
      shippingCost: shippingCost,
      isCustomShipping: false,
      // Payment fields
      subtotal,
      discount,
      total,
      voucherCode: body.voucherCode || null,
      paymentMethod: body.paymentMethod || "midtrans",
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.variant.price,
      })),
    };

    console.log(
      "📝 Creating order with data:",
      JSON.stringify(orderData, null, 2)
    );

    // Create order (with stock validation)
    let order;
    try {
      order = await OrderModel.create(orderData);
      console.log("✅ Order created:", order.id);
    } catch (error) {
      // Handle stock validation errors
      if (error.message.includes("Stok tidak mencukupi")) {
        console.log("❌ Stock insufficient:", error.message);
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
      // Re-throw other errors
      throw error;
    }

    // Get full order data with relations
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
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
          },
        },
      },
    });

    // Create Midtrans transaction
    let snapToken = null;
    let snapRedirectUrl = null;

    try {
      const midtransTransaction = await MidtransService.createTransaction(
        fullOrder
      );
      snapToken = midtransTransaction.token;
      snapRedirectUrl = midtransTransaction.redirect_url;

      // Save transaction to database
      await TransactionModel.create({
        orderId: order.id,
        transactionId: fullOrder.orderNumber, // Use order number as transaction ID
        orderNumber: fullOrder.orderNumber,
        grossAmount: total,
        transactionStatus: "pending",
        snapToken,
        snapRedirectUrl,
        transactionTime: new Date(),
      });
    } catch (midtransError) {
      console.error("Midtrans error:", midtransError);
      // Continue without Midtrans (for testing)
      // In production, you might want to return error
    }

    // Clear user cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    // Increment voucher usage if voucher was used
    if (body.voucherCode) {
      try {
        await VoucherModel.use(body.voucherCode);
      } catch (voucherError) {
        console.error("Error incrementing voucher usage:", voucherError);
        // Don't fail the order if voucher update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order berhasil dibuat",
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
        payment: {
          snapToken,
          snapRedirectUrl,
        },
      },
    });
  } catch (error) {
    console.error("❌❌❌ Create order error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { orders, total } = await OrderModel.getUserOrders(session.user.id, {
      status,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: {
        orders,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
