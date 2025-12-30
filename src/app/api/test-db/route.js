/**
 * Test Database Connection API
 * GET /api/test-db
 *
 * Use this to verify:
 * 1. Database connection works from Vercel
 * 2. Admin user exists in database
 * 3. Password hash is correct
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  let supabase = null;

  try {
    // Test 1: Import Supabase
    let supabaseImportError = null;
    try {
      const { default: supabaseClient } = await import("@/lib/prisma");
      supabase = supabaseClient;
    } catch (err) {
      supabaseImportError = {
        message: err.message,
        stack: err.stack,
      };
    }

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to import Supabase Client",
          supabaseImportError,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Test 2: Simple database query
    let dbTest = null;
    let dbError = null;
    try {
      const { data, error } = await supabase.rpc("get_db_info");
      if (error) {
        // Fallback: just test connection with simple query
        const { data: testData, error: testError } = await supabase
          .from("User")
          .select("id")
          .limit(1);
        if (testError) throw testError;
        dbTest = [
          {
            current_time: new Date().toISOString(),
            db_version: "Supabase PostgreSQL",
          },
        ];
      } else {
        dbTest = data;
      }
    } catch (err) {
      dbError = {
        message: err.message,
        code: err.code,
      };
    }

    // Test 3: Find admin user
    let adminUser = null;
    let userError = null;
    try {
      const { data, error } = await supabase
        .from("User")
        .select("id, name, email, role, password, status, createdAt")
        .eq("email", "admin@motiv.com")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      adminUser = data;
    } catch (err) {
      userError = {
        message: err.message,
        code: err.code,
      };
    }

    // Test 4: Verify password hash (if user exists)
    let passwordTest = null;
    if (adminUser) {
      passwordTest = await bcrypt.compare("Motiv@Admin123", adminUser.password);
    }

    // Test 5: Count total users
    let totalUsers = null;
    let countError = null;
    try {
      const { count, error } = await supabase
        .from("User")
        .select("id", { count: "exact", head: true });

      if (error) throw error;
      totalUsers = count;
    } catch (err) {
      countError = {
        message: err.message,
        code: err.code,
      };
    }

    return NextResponse.json({
      success: !dbError && !userError,
      timestamp: new Date().toISOString(),
      tests: {
        supabaseClient: {
          status: supabase ? "✅ Imported" : "❌ Failed",
          error: supabaseImportError,
        },
        databaseConnection: {
          status: dbError ? "❌ Failed" : "✅ Connected",
          time: dbTest?.[0]?.current_time || new Date().toISOString(),
          version: dbTest?.[0]?.db_version || "Supabase PostgreSQL",
          error: dbError,
        },
        adminUserQuery: {
          status: userError
            ? "❌ Query Failed"
            : adminUser
            ? "✅ User Found"
            : "⚠️ User Not Found",
          data: adminUser
            ? {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                status: adminUser.status,
                createdAt: adminUser.createdAt,
                passwordHashPrefix: adminUser.password.substring(0, 30) + "...",
                passwordHashSuffix:
                  "..." +
                  adminUser.password.substring(adminUser.password.length - 10),
              }
            : null,
          error: userError,
        },
        passwordVerification: {
          status:
            passwordTest === true
              ? "✅ Password Match"
              : passwordTest === false
              ? "❌ Password Mismatch"
              : "⚠️ Not Tested",
          tested: "Motiv@Admin123",
          result: passwordTest,
        },
        userCount: {
          status: countError ? "❌ Failed" : "✅ Success",
          count: totalUsers,
          error: countError,
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey:
          !!process.env.SUPABASE_SERVICE_ROLE_KEY ||
          !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          name: error.name,
          code: error.code,
          stack: error.stack,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
