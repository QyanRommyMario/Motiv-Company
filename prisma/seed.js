/**
 * Database Seeder
 * Seeds initial data for development and testing
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@motiv.com" },
    update: {},
    create: {
      email: "admin@motiv.com",
      name: "Admin MOTIV",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create B2C user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      name: "Test User",
      password: userPassword,
      role: "B2C",
      status: "ACTIVE",
    },
  });
  console.log("✅ B2C user created:", user.email);

  // Create B2B user
  const b2bPassword = await bcrypt.hash("b2b123", 10);
  const b2bUser = await prisma.user.upsert({
    where: { email: "b2b@test.com" },
    update: {},
    create: {
      email: "b2b@test.com",
      name: "B2B Test Company",
      password: b2bPassword,
      role: "B2B",
      status: "ACTIVE",
      businessName: "Test Coffee Shop",
      discount: 10,
    },
  });
  console.log("✅ B2B user created:", b2bUser.email);

  // Create sample vouchers
  const vouchers = [
    {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minPurchase: 100000,
      maxDiscount: 50000,
      quota: 100,
      validFrom: new Date(),
      validUntil: new Date("2025-12-31"),
      isActive: true,
    },
    {
      code: "FREESHIP",
      type: "FIXED",
      value: 20000,
      minPurchase: 200000,
      maxDiscount: null,
      quota: 50,
      validFrom: new Date(),
      validUntil: new Date("2025-12-31"),
      isActive: true,
    },
    {
      code: "BIGORDER",
      type: "PERCENTAGE",
      value: 15,
      minPurchase: 500000,
      maxDiscount: 100000,
      quota: 30,
      validFrom: new Date(),
      validUntil: new Date("2025-12-31"),
      isActive: true,
    },
  ];

  for (const voucherData of vouchers) {
    const voucher = await prisma.voucher.upsert({
      where: { code: voucherData.code },
      update: {},
      create: voucherData,
    });
    console.log("✅ Voucher created:", voucher.code);
  }

  console.log("🎉 Database seeding completed!");
  console.log("\n📝 Test Accounts:");
  console.log("Admin: admin@motiv.com / admin123");
  console.log("B2C User: user@test.com / user123");
  console.log("B2B User: b2b@test.com / b2b123");
  console.log("\n🎟️  Test Vouchers:");
  console.log("WELCOME10 - 10% off (min Rp 100,000)");
  console.log("FREESHIP - Rp 20,000 off (min Rp 200,000)");
  console.log("BIGORDER - 15% off (min Rp 500,000)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
