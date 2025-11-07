/**
 * Cleanup Script - Remove Dummy Products
 * This script removes all dummy products by name
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanup() {
  console.log("🧹 Starting cleanup of dummy products...");

  const dummyProductNames = [
    "Southern Weather",
    "Geometry",
    "Cold Extraction",
    "Espresso Blend",
    "Single Origin - Ethiopia",
  ];

  try {
    // Find all dummy products
    const dummyProducts = await prisma.product.findMany({
      where: {
        name: {
          in: dummyProductNames,
        },
      },
    });

    console.log(`📦 Found ${dummyProducts.length} dummy products to delete\n`);

    const productIds = dummyProducts.map((p) => p.id);

    // First, delete all order items that reference these products
    console.log("🔗 Checking for related order items...");
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    });

    if (orderItems.length > 0) {
      console.log(`   Found ${orderItems.length} order items to delete first`);
      await prisma.orderItem.deleteMany({
        where: {
          productId: {
            in: productIds,
          },
        },
      });
      console.log("   ✅ Order items deleted\n");
    } else {
      console.log("   No order items found\n");
    }

    // Then delete cart items
    console.log("🛒 Checking for cart items...");
    const cartItems = await prisma.cartItem.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    });

    if (cartItems.length > 0) {
      console.log(`   Found ${cartItems.length} cart items to delete first`);
      await prisma.cartItem.deleteMany({
        where: {
          productId: {
            in: productIds,
          },
        },
      });
      console.log("   ✅ Cart items deleted\n");
    } else {
      console.log("   No cart items found\n");
    }

    // Now delete the products (variants will be cascade deleted)
    console.log("🗑️  Deleting products...");
    for (const product of dummyProducts) {
      console.log(`   Deleting: ${product.name}`);
      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });
    }

    console.log("\n✅ Cleanup completed successfully!");
    console.log(`   Deleted ${dummyProducts.length} dummy products`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .then(() => {
    console.log("👋 Cleanup script finished");
    process.exit(0);
  });
