/**
 * API Error Handler Utility
 * Provides consistent error handling across all API routes
 */

import { NextResponse } from "next/server";

/**
 * Handle Supabase/PostgreSQL-specific errors
 */
export function handlePrismaError(error) {
  console.error("Database Error:", error);

  // Supabase error codes
  if (error.code === "PGRST116") {
    return NextResponse.json(
      {
        error: "Record not found",
        details: "The requested record does not exist.",
        code: error.code,
      },
      { status: 404 }
    );
  }

  // Unique constraint violation
  if (error.code === "23505") {
    return NextResponse.json(
      {
        error: "Duplicate entry",
        details: "A record with this value already exists.",
        code: error.code,
      },
      { status: 409 }
    );
  }

  // Foreign key constraint
  if (error.code === "23503") {
    return NextResponse.json(
      {
        error: "Invalid reference",
        details: "Referenced record does not exist.",
        code: error.code,
      },
      { status: 400 }
    );
  }

  // Generic database error
  return NextResponse.json(
    {
      error: "Database error",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An error occurred while processing your request.",
      code: error.code,
    },
    { status: 500 }
  );
}

// Alias for Supabase
export const handleSupabaseError = handlePrismaError;

/**
 * Handle general API errors
 */
export function handleApiError(error) {
  console.error("API Error:", error);

  // Check if it's a Prisma error
  if (error.code && error.code.startsWith("P")) {
    return handlePrismaError(error);
  }

  // Validation errors
  if (error.name === "ValidationError") {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.message,
      },
      { status: 400 }
    );
  }

  // Generic error
  return NextResponse.json(
    {
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
    { status: 500 }
  );
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandler(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Get Supabase client with error handling
 */
export async function getPrismaClient() {
  try {
    const { default: supabase } = await import("@/lib/supabase");
    return supabase;
  } catch (error) {
    console.error("Failed to import Supabase client:", error);
    throw new Error("Database connection not available");
  }
}

// Alias for backward compatibility
export const getSupabaseClient = getPrismaClient;

/**
 * Check if user is authenticated
 */
export async function requireAuth(request, requiredRole = null) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to access this resource",
        },
        { status: 401 }
      ),
    };
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return {
      error: NextResponse.json(
        {
          error: "Forbidden",
          message: `This resource requires ${requiredRole} role`,
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}

/**
 * Validate request body
 */
export function validateRequest(data, requiredFields) {
  const missing = requiredFields.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw {
      name: "ValidationError",
      message: `Missing required fields: ${missing.join(", ")}`,
    };
  }

  return true;
}
