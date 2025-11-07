import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartViewModel } from "@/viewmodels/CartViewModel";

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    const { id } = await context.params;
    const body = await request.json();
    const { quantity } = body;
    if (quantity === undefined || quantity < 0)
      return NextResponse.json(
        { success: false, message: "Quantity tidak valid" },
        { status: 400 }
      );
    const cartItem = await CartViewModel.getCartItemById(id);
    if (!cartItem || cartItem.userId !== session.user.id)
      return NextResponse.json(
        { success: false, message: "Cart item tidak ditemukan" },
        { status: 404 }
      );
    const validation = await CartViewModel.validateCartItem(
      cartItem.variantId,
      quantity
    );
    if (!validation.valid)
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    const updatedItem = await CartViewModel.updateCartItem(id, quantity);
    return NextResponse.json({
      success: true,
      message: "Keranjang berhasil diupdate",
      data: updatedItem,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    const { id } = await context.params;
    const cartItem = await CartViewModel.getCartItemById(id);
    if (!cartItem || cartItem.userId !== session.user.id)
      return NextResponse.json(
        { success: false, message: "Cart item tidak ditemukan" },
        { status: 404 }
      );
    await CartViewModel.removeItem(id);
    return NextResponse.json({
      success: true,
      message: "Item berhasil dihapus dari keranjang",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
