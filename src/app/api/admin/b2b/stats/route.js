import { NextResponse } from "next/server";
import { B2BRequestModel } from "@/models/B2BRequestModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/b2b/stats
 * Get B2B statistics (admin only)
 */
export async function GET(request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const stats = await B2BRequestModel.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch B2B statistics" },
      { status: 500 }
    );
  }
}
