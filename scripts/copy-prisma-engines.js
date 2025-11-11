#!/usr/bin/env node
/**
 * Copy Prisma query engine to .next/standalone for Vercel deployment
 * This ensures the Prisma engine binary is available at runtime
 */

const fs = require("fs");
const path = require("path");

// Source: where Prisma generates the client
const prismaClientPath = path.join(
  __dirname,
  "..",
  "node_modules",
  ".prisma",
  "client"
);

// Destination: Next.js standalone output
const standaloneClientPath = path.join(
  __dirname,
  "..",
  ".next",
  "standalone",
  "node_modules",
  ".prisma",
  "client"
);

// Also copy to @prisma/client for imports
const prismaCoreClientPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@prisma",
  "client"
);
const standaloneCoreClientPath = path.join(
  __dirname,
  "..",
  ".next",
  "standalone",
  "node_modules",
  "@prisma",
  "client"
);

console.log("📦 Copying Prisma engines for Vercel deployment...\n");

// Function to copy directory recursively
function copyDirectorySync(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read all files/folders in source
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ Copied: ${entry.name}`);
    }
  }
}

try {
  // Check if standalone build exists
  const standalonePath = path.join(__dirname, "..", ".next", "standalone");
  if (!fs.existsSync(standalonePath)) {
    console.log(
      '⚠️  .next/standalone not found. This script should run after "next build"'
    );
    console.log("   Skipping Prisma engine copy...\n");
    process.exit(0);
  }

  // Copy .prisma/client
  console.log("1. Copying .prisma/client...");
  if (fs.existsSync(prismaClientPath)) {
    copyDirectorySync(prismaClientPath, standaloneClientPath);
    console.log("   ✅ .prisma/client copied\n");
  } else {
    console.log(
      '   ⚠️  .prisma/client not found. Run "prisma generate" first.\n'
    );
  }

  // Copy @prisma/client
  console.log("2. Copying @prisma/client...");
  if (fs.existsSync(prismaCoreClientPath)) {
    copyDirectorySync(prismaCoreClientPath, standaloneCoreClientPath);
    console.log("   ✅ @prisma/client copied\n");
  } else {
    console.log("   ⚠️  @prisma/client not found.\n");
  }

  // Verify query engine exists
  const engineFiles = fs
    .readdirSync(standaloneClientPath)
    .filter(
      (file) =>
        file.includes("libquery_engine") && file.includes("rhel-openssl-3.0.x")
    );

  if (engineFiles.length > 0) {
    console.log("✅ Prisma query engine for rhel-openssl-3.0.x found:");
    engineFiles.forEach((file) => console.log(`   - ${file}`));
    console.log("\n🎉 Prisma engines copied successfully!\n");
  } else {
    console.log("⚠️  WARNING: rhel-openssl-3.0.x query engine NOT found!");
    console.log("   Available engines:");
    fs.readdirSync(standaloneClientPath)
      .filter((file) => file.includes("libquery_engine"))
      .forEach((file) => console.log(`   - ${file}`));
    console.log("\n");
  }
} catch (error) {
  console.error("❌ Error copying Prisma engines:", error.message);
  console.error(error);
  process.exit(1);
}
