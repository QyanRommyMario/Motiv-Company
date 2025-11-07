import { NextResponse } from "next/server";
import { VoucherModel } from "@/models/VoucherModel";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/vouchers
 * Get all vouchers (admin only)
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
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      isActive:
        searchParams.get("isActive") === "true"
          ? true
          : searchParams.get("isActive") === "false"
          ? false
          : undefined,
    };

    const vouchers = await VoucherModel.findAll(filters);

    return NextResponse.json({
      success: true,
      data: vouchers,
    });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/vouchers
 * Create new voucher (admin only)
 */
export async function POST(request) {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const data = await request.json();

    // Validation
    if (
      !data.code ||
      !data.type ||
      !data.value ||
      !data.quota ||
      !data.validFrom ||
      !data.validUntil
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate voucher type
    if (!["PERCENTAGE", "FIXED"].includes(data.type)) {
      return NextResponse.json(
        { error: "Invalid voucher type. Must be PERCENTAGE or FIXED" },
        { status: 400 }
      );
    }

    // Validate percentage value
    if (data.type === "PERCENTAGE" && (data.value < 0 || data.value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Validate dates
    const validFrom = new Date(data.validFrom);
    const validUntil = new Date(data.validUntil);
    if (validFrom >= validUntil) {
      return NextResponse.json(
        { error: "Valid from date must be before valid until date" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingVoucher = await VoucherModel.findByCode(data.code);
    if (existingVoucher) {
      return NextResponse.json(
        { error: "Voucher code already exists" },
        { status: 400 }
      );
    }

    const voucher = await VoucherModel.create(data);

    return NextResponse.json(
      {
        success: true,
        data: voucher,
        message: "Voucher created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating voucher:", error);
    return NextResponse.json(
      { error: "Failed to create voucher" },
      { status: 500 }
    );
  }
}
