import { NextResponse } from "next/server";
import { VoucherModel } from "@/models/VoucherModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/vouchers/stats
 * Get voucher statistics (admin only)
 */
export async function GET(request) {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const stats = await VoucherModel.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch voucher statistics" },
      { status: 500 }
    );
  }
}
