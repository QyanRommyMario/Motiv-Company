/**
 * Script untuk Generate RSA Key Pair untuk Midtrans Merchant Public Key
 *
 * Jalankan dengan: node scripts/generate-midtrans-keys.js
 *
 * Script ini akan generate:
 * 1. Private Key (simpan dengan aman, jangan di-commit ke git)
 * 2. Public Key (yang akan didaftarkan ke Midtrans Dashboard)
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

console.log("🔐 Generating RSA Key Pair untuk Midtrans...\n");

// Generate RSA key pair (2048 bits)
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Direktori untuk menyimpan keys
const keysDir = path.join(__dirname, "..", ".keys");

// Buat direktori jika belum ada
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Simpan private key
const privateKeyPath = path.join(keysDir, "midtrans-private.pem");
fs.writeFileSync(privateKeyPath, privateKey);

// Simpan public key
const publicKeyPath = path.join(keysDir, "midtrans-public.pem");
fs.writeFileSync(publicKeyPath, publicKey);

console.log("✅ Keys berhasil di-generate!\n");
console.log("📁 Lokasi file:");
console.log(`   Private Key: ${privateKeyPath}`);
console.log(`   Public Key:  ${publicKeyPath}\n`);

console.log("📋 PUBLIC KEY untuk didaftarkan ke Midtrans Dashboard:");
console.log("=".repeat(70));
console.log(publicKey);
console.log("=".repeat(70));

console.log("\n📌 LANGKAH SELANJUTNYA:");
console.log("1. Copy PUBLIC KEY di atas");
console.log(
  "2. Login ke https://dashboard.sandbox.midtrans.com (untuk sandbox)",
);
console.log("   atau https://dashboard.midtrans.com (untuk production)");
console.log("3. Masuk ke Settings > Access Keys");
console.log('4. Scroll ke bagian "Merchant Public Key"');
console.log("5. Paste public key yang sudah di-copy");
console.log('6. Klik "Register" atau "Save"');
console.log("\n⚠️  PENTING:");
console.log("   - Private key JANGAN pernah dibagikan atau di-commit ke git");
console.log("   - Tambahkan .keys/ ke .gitignore");
console.log("   - Public key aman untuk dibagikan ke Midtrans\n");

// Update .gitignore
const gitignorePath = path.join(__dirname, "..", ".gitignore");
let gitignoreContent = "";

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
}

if (!gitignoreContent.includes(".keys/")) {
  gitignoreContent +=
    "\n# Midtrans Keys (Private Keys - DO NOT COMMIT)\n.keys/\n";
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log("✅ .gitignore sudah diupdate untuk melindungi private keys\n");
}
