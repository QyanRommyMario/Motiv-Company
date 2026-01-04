/**
 * Admin Product Detail API
 * GET /api/admin/products/[id] - Get product by ID
 * PUT /api/admin/products/[id] - Update product
 * DELETE /api/admin/products/[id] - Delete product
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductModel } from "@/models/ProductModel";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      category,
      images,
      variants,
      features = [],
    } = body;

    // Check if product exists
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update product
    const product = await ProductModel.update(id, {
      name,
      description,
      category,
      images,
      features,
      variants: variants?.map((v) => ({
        id: v.id, // Include ID if updating existing variant
        name: v.name || v.size, // Support both 'name' and 'size'
        price: parseFloat(v.price),
        stock: parseInt(v.stock),
      })),
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diupdate",
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate produk" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if product exists
    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete product
    await ProductModel.delete(id);

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
