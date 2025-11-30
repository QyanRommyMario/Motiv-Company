import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ShippingAddressModel from "@/models/ShippingAddressModel";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    const addresses = await ShippingAddressModel.getUserAddresses(
      session.user.id
    );
    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

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

    // [VALIDASI DILONGGARKAN] Hapus cek cityId & provinceId
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
            "Field wajib: Label, Nama, HP, Alamat, Kota, Provinsi, Kode Pos",
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
      cityId: cityId || null,
      province,
      provinceId: provinceId || null,
      country: country || "Indonesia",
      postalCode,
      isDefault: isDefault || false,
    });

    if (isDefault)
      await ShippingAddressModel.setAsDefault(newAddress.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Alamat berhasil ditambahkan",
      data: newAddress,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
