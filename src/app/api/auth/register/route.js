/**
 * Register API Route
 * POST /api/auth/register
 */

import { NextResponse } from "next/server";
import { AuthViewModel } from "@/viewmodels/AuthViewModel";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const result = await AuthViewModel.register(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
