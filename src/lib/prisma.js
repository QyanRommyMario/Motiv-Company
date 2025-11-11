import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = global;

// Detect Vercel serverless environment
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

// Prisma Client options optimized for serverless
const prismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  // Optimize for serverless environments
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling for better performance
  // Supabase pooler recommended settings
  __internal: {
    engine: {
      // Use pgBouncer connection pooling
      pgBouncer: true,
      // Connection pool size
      poolTimeout: 10, // 10 seconds timeout
      connectionLimit: 10, // Max 10 connections per serverless instance
    },
  },
};

// In Vercel, help Prisma find the query engine
if (isVercel) {
  // Vercel serverless function paths
  const possiblePaths = [
    "/var/task/node_modules/.prisma/client",
    "/var/task/.next/standalone/node_modules/.prisma/client",
    path.join(process.cwd(), "node_modules/.prisma/client"),
  ];

  // Set environment variable to help Prisma locate engine
  if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
    for (const basePath of possiblePaths) {
      const enginePath = path.join(
        basePath,
        "libquery_engine-rhel-openssl-3.0.x.so.node"
      );
      try {
        if (require("fs").existsSync(enginePath)) {
          process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
          console.log("✅ Prisma engine found:", enginePath);
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }
  }
}

// Singleton pattern for Prisma Client
export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // In production (Vercel), always use a fresh instance
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown - only in Node.js environment
if (typeof window === "undefined") {
  // Handle process termination
  process.on("beforeExit", async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Error disconnecting Prisma:", error);
    }
  });

  // Handle SIGINT (Ctrl+C)
  process.on("SIGINT", async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error("Error disconnecting Prisma:", error);
      process.exit(1);
    }
  });

  // Handle SIGTERM (deployment/restart)
  process.on("SIGTERM", async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error("Error disconnecting Prisma:", error);
      process.exit(1);
    }
  });
}

export default prisma;
