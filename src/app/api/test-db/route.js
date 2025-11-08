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
  let prisma = null;
  
  try {
    // Test 1: Import Prisma
    let prismaImportError = null;
    try {
      const { default: prismaClient } = await import("@/lib/prisma");
      prisma = prismaClient;
    } catch (err) {
      prismaImportError = {
        message: err.message,
        stack: err.stack,
      };
    }

    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: "Failed to import Prisma Client",
        prismaImportError,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Test 2: Simple database query
    let dbTest = null;
    let dbError = null;
    try {
      dbTest = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
    } catch (err) {
      dbError = {
        message: err.message,
        code: err.code,
        stack: err.stack,
      };
    }
    
    // Test 3: Find admin user
    let adminUser = null;
    let userError = null;
    try {
      adminUser = await prisma.user.findUnique({
        where: { email: 'admin@motiv.com' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          password: true,
          status: true,
          createdAt: true,
        }
      });
    } catch (err) {
      userError = {
        message: err.message,
        code: err.code,
        stack: err.stack,
      };
    }

    // Test 4: Verify password hash (if user exists)
    let passwordTest = null;
    if (adminUser) {
      passwordTest = await bcrypt.compare('Motiv@Admin123', adminUser.password);
    }

    // Test 5: Count total users
    let totalUsers = null;
    let countError = null;
    try {
      totalUsers = await prisma.user.count();
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
        prismaClient: {
          status: prisma ? "✅ Imported" : "❌ Failed",
          error: prismaImportError
        },
        databaseConnection: {
          status: dbError ? "❌ Failed" : "✅ Connected",
          time: dbTest?.[0]?.current_time || "N/A",
          version: dbTest?.[0]?.db_version || "N/A",
          error: dbError
        },
        adminUserQuery: {
          status: userError ? "❌ Query Failed" : (adminUser ? "✅ User Found" : "⚠️ User Not Found"),
          data: adminUser ? {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            status: adminUser.status,
            createdAt: adminUser.createdAt,
            passwordHashPrefix: adminUser.password.substring(0, 30) + "...",
            passwordHashSuffix: "..." + adminUser.password.substring(adminUser.password.length - 10),
          } : null,
          error: userError
        },
        passwordVerification: {
          status: passwordTest === true ? "✅ Password Match" : passwordTest === false ? "❌ Password Mismatch" : "⚠️ Not Tested",
          tested: "Motiv@Admin123",
          result: passwordTest
        },
        userCount: {
          status: countError ? "❌ Failed" : "✅ Success",
          count: totalUsers,
          error: countError
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        databaseUrlPreview: process.env.DATABASE_URL 
          ? process.env.DATABASE_URL.substring(0, 40) + "..." 
          : "Not Set"
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  } finally {
    // Disconnect Prisma if connected
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
