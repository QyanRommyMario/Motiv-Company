/**
 * Simple Health Check API
 * Test basic Next.js functionality without Prisma
 */

import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      status: "✅ OK",
      message: "Next.js API is working!",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nextAuthUrlValue: process.env.NEXTAUTH_URL || "Not Set",
        databaseUrlPreview: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.substring(0, 40)}...` 
          : "Not Set"
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: "❌ ERROR",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
