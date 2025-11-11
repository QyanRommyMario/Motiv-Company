/**
 * API Error Handler Utility
 * Provides consistent error handling across all API routes
 */

import { NextResponse } from "next/server";

/**
 * Handle Prisma-specific errors
 */
export function handlePrismaError(error) {
  console.error("Prisma Error:", error);

  // Database connection errors
  if (error.code === "P1001") {
    return NextResponse.json(
      {
        error: "Database connection failed",
        details:
          "Cannot reach database server. Please check your DATABASE_URL environment variable.",
        code: error.code,
      },
      { status: 503 }
    );
  }

  // Database timeout
  if (error.code === "P1002") {
    return NextResponse.json(
      {
        error: "Database timeout",
        details: "The database server timed out. Please try again.",
        code: error.code,
      },
      { status: 504 }
    );
  }

  // Authentication failed
  if (error.code === "P1003") {
    return NextResponse.json(
      {
        error: "Database authentication failed",
        details: "Invalid database credentials.",
        code: error.code,
      },
      { status: 503 }
    );
  }

  // Unique constraint violation
  if (error.code === "P2002") {
    return NextResponse.json(
      {
        error: "Duplicate entry",
        details: `A record with this ${
          error.meta?.target?.join(", ") || "value"
        } already exists.`,
        code: error.code,
      },
      { status: 409 }
    );
  }

  // Foreign key constraint
  if (error.code === "P2003") {
    return NextResponse.json(
      {
        error: "Invalid reference",
        details: "Referenced record does not exist.",
        code: error.code,
      },
      { status: 400 }
    );
  }

  // Record not found
  if (error.code === "P2025") {
    return NextResponse.json(
      {
        error: "Record not found",
        details: "The requested record does not exist.",
        code: error.code,
      },
      { status: 404 }
    );
  }

  // Generic Prisma error
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
 * Get Prisma client with error handling
 */
export async function getPrismaClient() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
  } catch (error) {
    console.error("Failed to import Prisma client:", error);
    throw new Error("Database connection not available");
  }
}

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
