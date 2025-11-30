import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ShippingAddressModel from "@/models/ShippingAddressModel";

/**
 * GET /api/shipping/addresses
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
      cityId,
      province,
      provinceId,
      country,
      postalCode,
      isDefault,
    } = body;

    // [PERBAIKAN] Hapus cityId & provinceId dari validasi wajib
    // Agar tidak error 400 jika data ID belum tersedia
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
        {
          success: false,
          message:
            "Semua field harus diisi (Label, Nama, HP, Alamat, Kota, Provinsi, Kode Pos)",
        },
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
      cityId: cityId || null, // Boleh null
      province,
      provinceId: provinceId || null, // Boleh null
      country: country || "Indonesia",
      postalCode,
      isDefault: isDefault || false,
    });

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
