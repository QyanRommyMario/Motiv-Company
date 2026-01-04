import { NextResponse } from "next/server";
import { B2BRequestModel } from "@/models/B2BRequestModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/b2b/users
 * Get all B2B users (admin only)
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

    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get("search") || undefined,
    };

    const users = await B2BRequestModel.getAllB2BUsers(filters);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch B2B users" },
      { status: 500 }
    );
  }
}
