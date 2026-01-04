import { NextResponse } from "next/server";
import { VoucherModel } from "@/models/VoucherModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/vouchers/[id]
 * Get voucher by ID (admin only)
 */
export async function GET(request, { params }) {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;
    const voucher = await VoucherModel.findById(id);

    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch voucher" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/vouchers/[id]
 * Update voucher (admin only)
 */
export async function PUT(request, { params }) {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;
    const data = await request.json();

    // Check if voucher exists
    const existingVoucher = await VoucherModel.findById(id);
    if (!existingVoucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    // Validate voucher type if provided
    if (data.type && !["PERCENTAGE", "FIXED"].includes(data.type)) {
      return NextResponse.json(
        { error: "Invalid voucher type. Must be PERCENTAGE or FIXED" },
        { status: 400 }
      );
    }

    // Validate percentage value if provided
    if (
      data.type === "PERCENTAGE" &&
      data.value !== undefined &&
      (data.value < 0 || data.value > 100)
    ) {
      return NextResponse.json(
        { error: "Percentage value must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (data.validFrom && data.validUntil) {
      const validFrom = new Date(data.validFrom);
      const validUntil = new Date(data.validUntil);
      if (validFrom >= validUntil) {
        return NextResponse.json(
          { error: "Valid from date must be before valid until date" },
          { status: 400 }
        );
      }
    }

    // Check if code already exists (if code is being updated)
    if (data.code && data.code.toUpperCase() !== existingVoucher.code) {
      const codeExists = await VoucherModel.findByCode(data.code);
      if (codeExists) {
        return NextResponse.json(
          { error: "Voucher code already exists" },
          { status: 400 }
        );
      }
    }

    const voucher = await VoucherModel.update(id, data);

    return NextResponse.json({
      success: true,
      data: voucher,
      message: "Voucher updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update voucher" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/vouchers/[id]
 * Delete voucher (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;

    // Check if voucher exists
    const voucher = await VoucherModel.findById(id);
    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    await VoucherModel.delete(id);

    return NextResponse.json({
      success: true,
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete voucher" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/vouchers/[id]
 * Toggle voucher active status (admin only)
 */
export async function PATCH(request, { params }) {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;

    // Check if voucher exists
    const existingVoucher = await VoucherModel.findById(id);
    if (!existingVoucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    const voucher = await VoucherModel.toggleActive(id);

    return NextResponse.json({
      success: true,
      data: voucher,
      message: `Voucher ${
        voucher.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to toggle voucher status" },
      { status: 500 }
    );
  }
}
