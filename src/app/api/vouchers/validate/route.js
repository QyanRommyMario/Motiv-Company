import { NextResponse } from "next/server";
import { VoucherModel } from "@/models/VoucherModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateVoucherSchema } from "@/lib/validations";
import { apiLimiter } from "@/lib/rateLimiter";
import logger from "@/lib/logger";
import { z } from "zod";

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

    // Apply rate limiting
    const limitResponse = await apiLimiter(request);
    if (limitResponse) return limitResponse;

    const body = await request.json();

    // Validate input
    try {
      const validated = validateVoucherSchema.parse(body);

      logger.info("Voucher validation requested", {
        userId: session.user.id,
        code: validated.code,
        subtotal: validated.subtotal,
      });

      // Validate voucher
      const result = await VoucherModel.validate(
        validated.code,
        validated.subtotal
      );

      if (!result.valid) {
        logger.warn("Voucher validation failed", {
          userId: session.user.id,
          code: validated.code,
          reason: result.message,
        });

        return NextResponse.json(
          {
            success: false,
            message: result.message,
          },
          { status: 400 }
        );
      }

      logger.business("Voucher validated successfully", {
        userId: session.user.id,
        code: result.voucher.code,
        discount: result.discount,
        subtotal: validated.subtotal,
      });

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
      if (error instanceof z.ZodError) {
        logger.warn("Voucher validation input failed", {
          userId: session.user.id,
          errors: error.errors,
        });

        return NextResponse.json(
          {
            success: false,
            message: "Data tidak valid",
            errors: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    logger.error("Voucher validation error", error, {
      userId: session?.user?.id,
    });

    return NextResponse.json(
      { error: "Failed to validate voucher" },
      { status: 500 }
    );
  }
}
