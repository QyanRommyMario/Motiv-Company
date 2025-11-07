/**
 * List all products in database
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function listProducts() {
  console.log("📦 Listing all products in database...\n");

  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
    });

    console.log(`Found ${products.length} products:\n`);

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Variants: ${product.variants.length}`);
      console.log(`   Created: ${product.createdAt}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listProducts();
