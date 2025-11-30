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

    // --- [VALIDASI LAMA: DIKOMENTARI DULU] ---
    /*
    if (
      !label ||
      !name ||
      !phone ||
      !address ||
      !city ||
      !cityId || // Validasi Ketat
      !province ||
      !provinceId || // Validasi Ketat
      !postalCode
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Semua field harus diisi termasuk Kota dan Provinsi dari dropdown",
        },
        { status: 400 }
      );
    }
    */
    // ----------------------------------------

    // --- [VALIDASI BARU: SEMENTARA] ---
    // Kita loloskan meski cityId/provinceId kosong, yang penting teks alamat ada.
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
            "Semua field teks harus diisi (Label, Nama, HP, Alamat, Kota, Provinsi, Kode Pos)",
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
      cityId: cityId || null, // Boleh null sementara
      province,
      provinceId: provinceId || null, // Boleh null sementara
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
