import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ShippingAddressModel from "@/models/ShippingAddressModel";

/**
 * GET /api/shipping/addresses
 * Get user's shipping addresses
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const addresses = await ShippingAddressModel.getUserAddresses(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shipping/addresses
 * Create new shipping address
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      label,
      name,
      phone,
      address,
      city,
      province,
      country,
      postalCode,
      isDefault,
    } = body;

    // Validation
    if (
      !label ||
      !name ||
      !phone ||
      !address ||
      !city ||
      !province ||
      !postalCode
    ) {
      return NextResponse.json(
        { success: false, message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const newAddress = await ShippingAddressModel.create({
      userId: session.user.id,
      label,
      name,
      phone,
      address,
      city,
      province,
      country: country || "Indonesia",
      postalCode,
      isDefault: isDefault || false,
    });

    // If this is set as default, unset others
    if (isDefault) {
      await ShippingAddressModel.setAsDefault(newAddress.id, session.user.id);
    }

    return NextResponse.json({
      success: true,
      message: "Alamat berhasil ditambahkan",
      data: newAddress,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
