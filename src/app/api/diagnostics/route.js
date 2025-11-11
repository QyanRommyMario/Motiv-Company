import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
      },
      database: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        databaseUrlPreview: process.env.DATABASE_URL
          ? `${process.env.DATABASE_URL.substring(0, 50)}...`
          : "NOT SET",
        connectionHost: process.env.DATABASE_URL
          ? extractHost(process.env.DATABASE_URL)
          : "NOT SET",
      },
      auth: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL || "NOT SET",
      },
    };

    return NextResponse.json({
      success: true,
      message: "Diagnostics retrieved",
      data: diagnostics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error retrieving diagnostics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function extractHost(url) {
  try {
    const match = url.match(/@([^/]+)/);
    return match ? match[1] : "unknown";
  } catch {
    return "error parsing";
  }
}
