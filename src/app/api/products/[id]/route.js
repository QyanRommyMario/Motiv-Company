/**
 * Product Detail API Route
 * GET /api/products/[id] - Get single product by ID
 */

import { NextResponse } from "next/server";
import { ProductViewModel } from "@/viewmodels/ProductViewModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    // Check if user is B2B
    const session = await getServerSession(authOptions);
    const userDiscount =
      session?.user?.role === "B2B" ? session.user.discount : 0;

    const result = await ProductViewModel.getProductWithB2BPricing(
      id,
      userDiscount
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
