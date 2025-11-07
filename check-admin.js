const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@motiv.com" },
    });

    console.log("=== ADMIN USER FROM DATABASE ===");
    console.log("Email:", admin?.email);
    console.log("Name:", admin?.name);
    console.log("Role:", admin?.role);
    console.log("Discount:", admin?.discount);
    console.log("\nFull user object:");
    console.log(JSON.stringify(admin, null, 2));

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
  }
}

checkAdmin();
