import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartViewModel } from "@/viewmodels/CartViewModel";

/**
 * GET /api/cart
 * Get user's cart items
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

    // [SECURITY FIX] Real-time B2B discount validation from database
    let userDiscount = 0;
    
    if (session.user.role === "B2B") {
      const supabase = (await import("@/lib/supabase")).default;
      const { data: userData } = await supabase
        .from("User")
        .select("discount, role")
        .eq("id", session.user.id)
        .single();
      
      if (userData && userData.role === "B2B") {
        userDiscount = userData.discount || 0;
      }
    }

    const result = await CartViewModel.getUserCart(
      session.user.id,
      userDiscount
    );

    // getUserCart returns { success, data: { items, subtotal, ... } }
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || "Gagal mengambil keranjang",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
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
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Clear cart
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await CartViewModel.clearCart(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Keranjang berhasil dikosongkan",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
