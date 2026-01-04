import { NextResponse } from "next/server";
import { B2BRequestModel } from "@/models/B2BRequestModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * PATCH /api/admin/b2b/users/[id]/discount
 * Update B2B user discount (admin only)
 */
export async function PATCH(request, { params }) {
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

    if (body.discount === undefined) {
      return NextResponse.json(
        { error: "Discount value is required" },
        { status: 400 }
      );
    }

    const discount = parseFloat(body.discount);

    // Validate discount
    if (discount < 0 || discount > 100) {
      return NextResponse.json(
        { error: "Discount must be between 0 and 100" },
        { status: 400 }
      );
    }

    const user = await B2BRequestModel.updateUserDiscount(id, discount);

    return NextResponse.json({
      success: true,
      data: user,
      message: "B2B user discount updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update B2B user discount" },
      { status: 500 }
    );
  }
}
