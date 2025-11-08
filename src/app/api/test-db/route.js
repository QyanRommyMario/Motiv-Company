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
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Test 1: Database connection
    const dbTest = await prisma.$queryRaw`SELECT NOW() as current_time`;
    
    // Test 2: Find admin user
    const adminUser = await prisma.user.findUnique({
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

    // Test 3: Verify password hash (if user exists)
    let passwordTest = null;
    if (adminUser) {
      passwordTest = await bcrypt.compare('Motiv@Admin123', adminUser.password);
    }

    // Test 4: Count total users
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        databaseConnection: {
          status: "✅ Connected",
          time: dbTest[0]?.current_time || "N/A"
        },
        adminUserExists: {
          status: adminUser ? "✅ Found" : "❌ Not Found",
          data: adminUser ? {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            status: adminUser.status,
            createdAt: adminUser.createdAt,
            passwordHashPrefix: adminUser.password.substring(0, 20) + "...",
          } : null
        },
        passwordVerification: {
          status: passwordTest ? "✅ Password Match" : "❌ Password Mismatch",
          tested: "Motiv@Admin123",
          result: passwordTest
        },
        totalUsers: {
          status: "✅ Query Success",
          count: totalUsers
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPreview: process.env.DATABASE_URL 
          ? process.env.DATABASE_URL.substring(0, 30) + "..." 
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
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
