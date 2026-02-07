/**
 * Admin Products API
 * POST /api/admin/products - Create product
 * GET /api/admin/products - Get all products (admin view)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductModel } from "@/models/ProductModel";
import { createProductSchema, paginationSchema } from "@/lib/validations";
import { apiLimiter } from "@/lib/rateLimiter";
import logger from "@/lib/logger";
import { z } from "zod";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      logger.security("Unauthorized product creation attempt", {
        userId: session?.user?.id,
        ip: request.headers.get("x-forwarded-for"),
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Apply rate limiting
    const limitResponse = await apiLimiter(request);
    if (limitResponse) return limitResponse;

    const body = await request.json();

    // Validate input
    try {
      const validated = createProductSchema.parse(body);

      logger.info("Creating product", {
        adminId: session.user.id,
        productName: validated.name,
      });

      // Create product
      const product = await ProductModel.create({
        name: validated.name,
        description: validated.description,
        category: validated.category,
        images: validated.images,
        features: validated.features || [],
        variants: validated.variants.map((v) => ({
          name: v.name,
          price: v.price,
          stock: v.stock,
          weight: v.weight,
        })),
      });

      logger.business("Product created", {
        adminId: session.user.id,
        productId: product.id,
        productName: product.name,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Produk berhasil dibuat",
          product,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Product creation validation failed", {
          adminId: session.user.id,
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
    logger.error("Product creation failed", error, {
      adminId: session?.user?.id,
    });

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

    // Apply rate limiting
    const limitResponse = await apiLimiter(request);
    if (limitResponse) return limitResponse;

    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    // Validate pagination params
    const validated = paginationSchema.parse({
      skip,
      take: limit,
      category: searchParams.get("category"),
      search: searchParams.get("search"),
    });

    const [products, total] = await Promise.all([
      ProductModel.getAll({
        category: validated.category || undefined,
        search: validated.search || undefined,
        skip: validated.skip,
        take: validated.take,
      }),
      ProductModel.count({
        category: validated.category || undefined,
        search: validated.search || undefined,
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
    logger.error("Failed to fetch products (admin)", error, {
      adminId: session?.user?.id,
    });

    return NextResponse.json(
      { success: false, message: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}
