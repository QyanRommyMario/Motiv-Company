import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ShippingAddressModel from "@/models/ShippingAddressModel";

/**
 * GET /api/shipping/addresses/[id]
 * Get address by ID
 */
export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const address = await ShippingAddressModel.getById(id);

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/shipping/addresses/[id]
 * Update address
 */
export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    // Verify ownership
    const address = await ShippingAddressModel.getById(id);
    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }

    // If setting as default, unset others
    if (body.isDefault) {
      await ShippingAddressModel.setAsDefault(id, session.user.id);
    }

    const updatedAddress = await ShippingAddressModel.update(id, body);

    return NextResponse.json({
      success: true,
      message: "Alamat berhasil diupdate",
      data: updatedAddress,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shipping/addresses/[id]
 * Delete address
 */
export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Verify ownership
    const address = await ShippingAddressModel.getById(id);
    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }

    await ShippingAddressModel.delete(id);

    return NextResponse.json({
      success: true,
      message: "Alamat berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
