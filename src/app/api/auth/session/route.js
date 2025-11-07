/**
 * Session API Route
 * GET /api/auth/session - Get current user session
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({});
    }

    // Return NextAuth standard format
    return NextResponse.json(session);
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({});
  }
}
