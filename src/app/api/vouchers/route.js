import { NextResponse } from "next/server";
import { VoucherModel } from "@/models/VoucherModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiLimiter } from "@/lib/rateLimiter";
import logger from "@/lib/logger";

/**
 * GET /api/vouchers
 * Get all valid vouchers for customers
 */
export async function GET(request) {
  try {
    // Get session to ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply rate limiting
    const limitResponse = await apiLimiter(request);
    if (limitResponse) return limitResponse;

    // Get only valid and active vouchers
    const vouchers = await VoucherModel.findAll({
      isActive: true,
      valid: true,
    });

    // Filter vouchers that still have quota
    const availableVouchers = vouchers.filter(
      (voucher) => voucher.used < voucher.quota
    );

    logger.info("Vouchers fetched", {
      userId: session.user.id,
      count: availableVouchers.length,
    });

    return NextResponse.json({
      success: true,
      data: availableVouchers,
    });
  } catch (error) {
    logger.error("Failed to fetch vouchers", error, {
      userId: session?.user?.id,
    });

    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}
