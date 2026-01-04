import { NextResponse } from "next/server";
import { B2BRequestModel } from "@/models/B2BRequestModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/b2b/requests
 * Get all B2B requests (admin only)
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

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const requests = await B2BRequestModel.getAll(filters);

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch B2B requests" },
      { status: 500 }
    );
  }
}
