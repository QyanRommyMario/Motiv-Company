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
      console.log("❌ Unauthorized: No session");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { variantId, quantity } = body;

    console.log("📦 Add to cart request:", {
      userId: session.user.id,
      variantId,
      quantity,
    });

    if (!variantId || !quantity) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { success: false, message: "variantId dan quantity harus diisi" },
        { status: 400 }
      );
    }

    // Validate cart item
    console.log("🔍 Validating cart item...");
    const validation = await CartViewModel.validateCartItem(
      variantId,
      quantity
    );

    if (!validation.valid) {
      console.log("❌ Validation failed:", validation.message);
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed");

    // Add to cart
    console.log("➕ Adding to cart...");
    const cartItem = await CartViewModel.addToCart(
      session.user.id,
      variantId,
      quantity
    );

    console.log("✅ Cart item added:", cartItem);

    return NextResponse.json({
      success: true,
      message: "Produk berhasil ditambahkan ke keranjang",
      data: cartItem,
    });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
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
