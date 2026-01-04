import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartViewModel } from "@/viewmodels/CartViewModel";

/**
 * POST /api/cart/add
 * Add item to cart
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
    const { variantId, quantity } = body;

    if (!variantId || !quantity) {
      return NextResponse.json(
        { success: false, message: "variantId dan quantity harus diisi" },
        { status: 400 }
      );
    }

    // Validate cart item
    const validation = await CartViewModel.validateCartItem(
      variantId,
      quantity
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    // Add to cart
    const cartItem = await CartViewModel.addToCart(
      session.user.id,
      variantId,
      quantity
    );

    return NextResponse.json({
      success: true,
      message: "Produk berhasil ditambahkan ke keranjang",
      data: cartItem,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Terjadi kesalahan saat menambahkan ke keranjang",
      },
      { status: 500 }
    );
  }
}
