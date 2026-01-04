/**
 * Categories API Route
 * GET /api/products/categories - Get all product categories
 */

import { NextResponse } from "next/server";
import { ProductViewModel } from "@/viewmodels/ProductViewModel";

export async function GET() {
  try {
    const result = await ProductViewModel.getCategories();

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
