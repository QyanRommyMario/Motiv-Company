/**
 * Vercel Environment Variables Setup Script
 *
 * Jalankan script ini untuk set environment variables ke Vercel:
 * node scripts/setup-vercel-env.js
 *
 * Prerequisites:
 * 1. Install Vercel CLI: npm i -g vercel
 * 2. Login: vercel login
 * 3. Link project: vercel link
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Vercel Environment Variables...\n");

// Read .env file
const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env file not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");

// Parse critical Midtrans variables
const midtransVars = {
  MIDTRANS_SERVER_KEY: extractEnvVar(envContent, "MIDTRANS_SERVER_KEY"),
  MIDTRANS_CLIENT_KEY: extractEnvVar(envContent, "MIDTRANS_CLIENT_KEY"),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: extractEnvVar(
    envContent,
    "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY",
  ),
  MIDTRANS_IS_PRODUCTION: extractEnvVar(envContent, "MIDTRANS_IS_PRODUCTION"),
  NEXT_PUBLIC_MIDTRANS_API_URL: extractEnvVar(
    envContent,
    "NEXT_PUBLIC_MIDTRANS_API_URL",
  ),
  NEXT_PUBLIC_MIDTRANS_SNAP_URL: extractEnvVar(
    envContent,
    "NEXT_PUBLIC_MIDTRANS_SNAP_URL",
  ),
  MIDTRANS_CLIENT_ID: extractEnvVar(envContent, "MIDTRANS_CLIENT_ID"),
  MIDTRANS_CLIENT_SECRET: extractEnvVar(envContent, "MIDTRANS_CLIENT_SECRET"),
};

// Validate
let missingVars = [];
Object.keys(midtransVars).forEach((key) => {
  if (!midtransVars[key]) {
    missingVars.push(key);
  }
});

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((v) => console.error(`   - ${v}`));
  process.exit(1);
}

console.log("✅ Environment variables validated\n");
console.log("📋 Midtrans Configuration:");
console.log(`   Server Key: ${maskKey(midtransVars.MIDTRANS_SERVER_KEY)}`);
console.log(
  `   Client Key: ${maskKey(midtransVars.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY)}`,
);
console.log(
  `   Mode: ${midtransVars.MIDTRANS_IS_PRODUCTION === "false" ? "SANDBOX" : "PRODUCTION"}\n`,
);

// Generate commands
console.log("📝 Run these commands to set Vercel environment variables:\n");
console.log(
  "# Critical Midtrans Variables (Production + Preview + Development)",
);
Object.keys(midtransVars).forEach((key) => {
  const value = midtransVars[key];
  console.log(`vercel env add ${key} production`);
  console.log(
    `# Enter value: ${key.includes("SECRET") ? maskKey(value) : value}\n`,
  );
});

console.log("\n💡 Or use this one-liner (interactive):");
console.log("vercel env pull .env.production");

console.log("\n⚠️  IMPORTANT:");
console.log("1. Make sure you have run: vercel login && vercel link");
console.log(
  "2. Set these variables for all environments: production, preview, development",
);
console.log("3. After setting, redeploy: vercel --prod\n");

// Helper functions
function extractEnvVar(content, varName) {
  const regex = new RegExp(`^${varName}=["']?([^"'\\n]+)["']?`, "m");
  const match = content.match(regex);
  return match ? match[1] : null;
}

function maskKey(key) {
  if (!key || key.length < 10) return "***";
  return key.substring(0, 8) + "..." + key.substring(key.length - 4);
}

console.log("✅ Script completed!\n");
