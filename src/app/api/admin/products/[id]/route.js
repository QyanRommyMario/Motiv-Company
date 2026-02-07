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
import { updateProductSchema } from "@/lib/validations";
import { apiLimiter } from "@/lib/rateLimiter";
import logger from "@/lib/logger";
import { z } from "zod";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Apply rate limiting
    const limitResponse = await apiLimiter(request);
    if (limitResponse) return limitResponse;

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
    logger.error("Failed to fetch product details", error, {
      adminId: session?.user?.id,
      productId: params?.id,
    });

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
      logger.security("Unauthorized product update attempt", {
        userId: session?.user?.id,
        ip: request.headers.get("x-forwarded-for"),
        productId: params?.id,
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Apply rate limiting
    const limitResponse = await apiLimiter(request);
    if (limitResponse) return limitResponse;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    try {
      const validated = updateProductSchema.parse(body);

      // Check if product exists
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return NextResponse.json(
          { success: false, message: "Produk tidak ditemukan" },
          { status: 404 }
        );
      }

      logger.info("Updating product", {
        adminId: session.user.id,
        productId: id,
        productName: validated.name || existingProduct.name,
      });

      // Update product
      const product = await ProductModel.update(id, {
        name: validated.name,
        description: validated.description,
        category: validated.category,
        images: validated.images,
        features: validated.features,
        variants: validated.variants?.map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price,
          stock: v.stock,
          weight: v.weight,
        })),
      });

      logger.business("Product updated", {
        adminId: session.user.id,
        productId: id,
        productName: product.name,
      });

      return NextResponse.json({
        success: true,
        message: "Produk berhasil diupdate",
        product,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Product update validation failed", {
          adminId: session.user.id,
          productId: id,
          errors: error.errors,
        });

        return NextResponse.json(
          {
            success: false,
            message: "Data produk tidak valid",
            errors: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    logger.error("Product update failed", error, {
      adminId: session?.user?.id,
      productId: params?.id,
    });

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
      logger.security("Unauthorized product deletion attempt", {
        userId: session?.user?.id,
        ip: request.headers.get("x-forwarded-for"),
        productId: params?.id,
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Apply rate limiting
    const limitResponse = await apiLimiter(request);
    if (limitResponse) return limitResponse;

    const { id } = await params;

    // Check if product exists
    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    logger.warn("Deleting product", {
      adminId: session.user.id,
      productId: id,
      productName: product.name,
    });

    // Delete product
    await ProductModel.delete(id);

    logger.business("Product deleted", {
      adminId: session.user.id,
      productId: id,
      productName: product.name,
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    // Extract detailed error message from Supabase
    let errorMessage = "Gagal menghapus produk";
    
    if (error.message) {
      // Check for foreign key constraint violation
      if (error.message.includes("violates foreign key constraint") || 
          error.message.includes("still referenced")) {
        errorMessage = "Produk tidak dapat dihapus karena masih terdapat pesanan yang menggunakan produk ini. Hubungi developer untuk solusi.";
        
        logger.warn("Product deletion blocked by foreign key", {
          adminId: session?.user?.id,
          productId: params?.id,
          error: error.message,
        });
      } else if (error.code === "23503") {
        // PostgreSQL foreign key violation code
        errorMessage = "Produk tidak dapat dihapus karena terhubung dengan data lain (pesanan/keranjang).";
        
        logger.warn("Product deletion blocked by FK constraint", {
          adminId: session?.user?.id,
          productId: params?.id,
          errorCode: error.code,
        });
      } else {
        errorMessage = `Gagal menghapus produk: ${error.message}`;
        
        logger.error("Product deletion failed", error, {
          adminId: session?.user?.id,
          productId: params?.id,
        });
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
