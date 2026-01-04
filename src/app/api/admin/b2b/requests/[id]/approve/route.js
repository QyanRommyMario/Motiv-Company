import { NextResponse } from "next/server";
import { B2BRequestModel } from "@/models/B2BRequestModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * POST /api/admin/b2b/requests/[id]/approve
 * Approve B2B request (admin only)
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
    const body = await request.json();
    const discount = body.discount || 10; // Default 10% discount

    // Validate discount
    if (discount < 0 || discount > 100) {
      return NextResponse.json(
        { error: "Discount must be between 0 and 100" },
        { status: 400 }
      );
    }

    const result = await B2BRequestModel.approve(id, discount);

    return NextResponse.json({
      success: true,
      data: result,
      message: "B2B request approved successfully",
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("already processed")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to approve B2B request" },
      { status: 500 }
    );
  }
}
