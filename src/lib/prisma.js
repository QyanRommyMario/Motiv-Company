import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

// Prisma Client options optimized for serverless
const prismaClientOptions = {
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  // Optimize for serverless environments
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

// Singleton pattern for Prisma Client
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // In production (Vercel), always use a fresh instance
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown - only in Node.js environment
if (typeof window === 'undefined') {
  // Handle process termination
  process.on('beforeExit', async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error disconnecting Prisma:', error);
    }
  });
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Error disconnecting Prisma:', error);
      process.exit(1);
    }
  });
  
  // Handle SIGTERM (deployment/restart)
  process.on('SIGTERM', async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Error disconnecting Prisma:', error);
      process.exit(1);
    }
  });
}

export default prisma;
