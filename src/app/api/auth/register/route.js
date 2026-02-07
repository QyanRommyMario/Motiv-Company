/**
 * Register API Route
 * POST /api/auth/register
 */

import { NextResponse } from "next/server";
import { AuthViewModel } from "@/viewmodels/AuthViewModel";
import { registerSchema } from "@/lib/validations";
import { authLimiter } from "@/lib/rateLimiter";
import logger from "@/lib/logger";
import { z } from "zod";

export async function POST(request) {
  try {
    // Apply rate limiting
    const limitResponse = await authLimiter(request);
    if (limitResponse) return limitResponse;

    const body = await request.json();

    // Validate input
    try {
      const validated = registerSchema.parse(body);
      
      // Log registration attempt
      logger.auth("Registration attempt", {
        email: validated.email,
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });

      const result = await AuthViewModel.register(validated);

      if (!result.success) {
        logger.warn("Registration failed", {
          email: validated.email,
          reason: result.message,
        });
        return NextResponse.json(result, { status: 400 });
      }

      logger.auth("Registration successful", {
        userId: result.data?.id,
        email: validated.email,
      });

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Registration validation failed", {
          errors: error.errors,
          ip: request.headers.get("x-forwarded-for"),
        });

        return NextResponse.json(
          {
            success: false,
            message: "Data tidak valid",
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
    logger.error("Registration error", error, {
      ip: request.headers.get("x-forwarded-for"),
    });

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
