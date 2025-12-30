/**
 * Admin Products API
 * POST /api/admin/products - Create product
 * GET /api/admin/products - Get all products (admin view)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductModel } from "@/models/ProductModel";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log(
      "📦 Creating product with data:",
      JSON.stringify(body, null, 2)
    );

    const {
      name,
      description,
      category,
      images,
      variants,
      features = [],
    } = body;

    // Validation
    if (!name || !description || !category) {
      console.log("❌ Validation failed: Missing required fields");
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    if (!variants || variants.length === 0) {
      console.log("❌ Validation failed: No variants provided");
      return NextResponse.json(
        { success: false, message: "Minimal 1 varian diperlukan" },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed, creating product...");

    // Create product
    const product = await ProductModel.create({
      name,
      description,
      category,
      images: images || [],
      features: features || [],
      variants: variants.map((v) => ({
        name: v.name || v.size, // Support both 'name' and 'size' from frontend
        price: parseFloat(v.price),
        stock: parseInt(v.stock),
        sku: v.sku || `${name.substring(0, 3).toUpperCase()}-${v.name || v.size}-${Date.now()}`, // Generate SKU if not provided
      })),
    });

    console.log("✅ Product created successfully:", product.id);

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil dibuat",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Create product error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat produk" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      ProductModel.getAll({
        category: category || undefined,
        search: search || undefined,
        skip,
        take: limit,
      }),
      ProductModel.count({
        category: category || undefined,
        search: search || undefined,
      }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}
