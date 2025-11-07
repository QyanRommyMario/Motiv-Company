/**
 * Products API Route
 * GET /api/products - Get all products with optional filters
 */

import { NextResponse } from "next/server";
import { ProductViewModel } from "@/viewmodels/ProductViewModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const result = await ProductViewModel.getProducts({
      category,
      search,
      skip,
      take: limit,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Check if user is B2B to apply discount
    const session = await getServerSession(authOptions);

    if (session?.user?.role === "B2B" && session.user.discount > 0) {
      // Apply B2B discount to all products
      const productsWithDiscount = result.data.map((product) => ({
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          originalPrice: variant.price,
          price: ProductViewModel.applyB2BDiscount(
            variant.price,
            session.user.discount
          ),
          discountPercentage: session.user.discount,
        })),
      }));

      return NextResponse.json({
        success: true,
        data: productsWithDiscount,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
