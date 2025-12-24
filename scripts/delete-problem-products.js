/**
 * Script untuk menghapus produk bermasalah dari database Supabase
 * Jalankan: node scripts/delete-problem-products.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Mencari produk bermasalah...\n");

  // Cari semua produk
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });

  console.log(`📦 Total produk: ${products.length}\n`);

  // Filter produk bermasalah:
  // 1. Produk tanpa gambar atau gambar tidak valid
  // 2. Produk dengan nama dummy/test
  const problemProducts = products.filter((p) => {
    const hasNoImage = !p.images || p.images.length === 0;
    const hasInvalidImage =
      p.images &&
      p.images.some(
        (img) =>
          !img ||
          img === "" ||
          img.includes("placeholder") ||
          img.includes("undefined")
      );
    const isDummy =
      p.name.toLowerCase().includes("test") ||
      p.name.toLowerCase().includes("dummy") ||
      p.name.toLowerCase().includes("sample") ||
      p.name.toLowerCase().includes("premium coffee beans");

    return hasNoImage || hasInvalidImage || isDummy;
  });

  if (problemProducts.length === 0) {
    console.log("✅ Tidak ada produk bermasalah ditemukan!");
    return;
  }

  console.log(`⚠️  Ditemukan ${problemProducts.length} produk bermasalah:\n`);

  problemProducts.forEach((p, i) => {
    console.log(`${i + 1}. ID: ${p.id}`);
    console.log(`   Nama: ${p.name}`);
    console.log(`   Gambar: ${JSON.stringify(p.images)}`);
    console.log(`   Variants: ${p.variants.length}`);
    console.log("");
  });

  // Konfirmasi hapus
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "\n🗑️  Hapus semua produk bermasalah di atas? (y/n): ",
    async (answer) => {
      if (answer.toLowerCase() === "y") {
        console.log("\n🗑️  Menghapus produk...\n");

        for (const product of problemProducts) {
          try {
            // Hapus order items yang terkait dengan variant produk ini
            const variantIds = product.variants.map((v) => v.id);

            if (variantIds.length > 0) {
              // Hapus cart items dulu
              await prisma.cartItem.deleteMany({
                where: { variantId: { in: variantIds } },
              });
              console.log(`   ✓ Cart items untuk ${product.name} dihapus`);

              // Hapus order items
              await prisma.orderItem.deleteMany({
                where: { variantId: { in: variantIds } },
              });
              console.log(`   ✓ Order items untuk ${product.name} dihapus`);

              // Hapus variants
              await prisma.productVariant.deleteMany({
                where: { productId: product.id },
              });
              console.log(`   ✓ Variants untuk ${product.name} dihapus`);
            }

            // Hapus produk
            await prisma.product.delete({
              where: { id: product.id },
            });
            console.log(`   ✓ Produk "${product.name}" berhasil dihapus\n`);
          } catch (error) {
            console.error(
              `   ✗ Gagal menghapus ${product.name}:`,
              error.message
            );
          }
        }

        console.log("✅ Selesai!");
      } else {
        console.log("❌ Dibatalkan");
      }

      rl.close();
      await prisma.$disconnect();
    }
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
