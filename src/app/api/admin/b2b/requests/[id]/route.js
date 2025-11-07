import { NextResponse } from "next/server";
import { B2BRequestModel } from "@/models/B2BRequestModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/b2b/requests/[id]
 * Get B2B request by ID (admin only)
 */
export async function GET(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;
    const b2bRequest = await B2BRequestModel.findById(id);

    if (!b2bRequest) {
      return NextResponse.json(
        { error: "B2B request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: b2bRequest,
    });
  } catch (error) {
    console.error("Error fetching B2B request:", error);
    return NextResponse.json(
      { error: "Failed to fetch B2B request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/b2b/requests/[id]
 * Delete B2B request (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;

    const b2bRequest = await B2BRequestModel.findById(id);
    if (!b2bRequest) {
      return NextResponse.json(
        { error: "B2B request not found" },
        { status: 404 }
      );
    }

    await B2BRequestModel.delete(id);

    return NextResponse.json({
      success: true,
      message: "B2B request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting B2B request:", error);
    return NextResponse.json(
      { error: "Failed to delete B2B request" },
      { status: 500 }
    );
  }
}
