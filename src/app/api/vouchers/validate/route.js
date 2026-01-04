import { NextResponse } from "next/server";
import { VoucherModel } from "@/models/VoucherModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/vouchers/validate
 * Validate voucher code and calculate discount
 */
export async function POST(request) {
  try {
    // Get session to ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, subtotal } = await request.json();

    // Validation
    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { error: "Voucher code and subtotal are required" },
        { status: 400 }
      );
    }

    if (subtotal < 0) {
      return NextResponse.json(
        { error: "Invalid subtotal amount" },
        { status: 400 }
      );
    }

    // Validate voucher
    const result = await VoucherModel.validate(code, subtotal);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: result.voucher.code,
        type: result.voucher.type,
        value: result.voucher.value,
        discount: result.discount,
        minPurchase: result.voucher.minPurchase,
        maxDiscount: result.voucher.maxDiscount,
      },
      message: result.message,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to validate voucher" },
      { status: 500 }
    );
  }
}
