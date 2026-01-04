import { NextResponse } from "next/server";
import { B2BRequestModel } from "@/models/B2BRequestModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * POST /api/admin/b2b/requests/[id]/reject
 * Reject B2B request (admin only)
 */
export async function POST(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;

    const result = await B2BRequestModel.reject(id);

    return NextResponse.json({
      success: true,
      data: result,
      message: "B2B request rejected",
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("already processed")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to reject B2B request" },
      { status: 500 }
    );
  }
}
