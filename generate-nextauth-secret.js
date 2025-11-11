/**
 * Generate NEXTAUTH_SECRET
 * Run this script to generate a secure random secret for NextAuth
 * 
 * Usage:
 *   node generate-nextauth-secret.js
 */

const crypto = require('crypto');

// Generate a random 32-byte secret and convert to base64
const secret = crypto.randomBytes(32).toString('base64');

console.log('\n✅ NEXTAUTH_SECRET Generated!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Add this to your Vercel Environment Variables:\n');
console.log(`NEXTAUTH_SECRET="${secret}"`);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Steps to add to Vercel:\n');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Select project: Motiv-Company');
console.log('3. Settings → Environment Variables');
console.log('4. Click "Add New"');
console.log('5. Name: NEXTAUTH_SECRET');
console.log(`6. Value: ${secret}`);
console.log('7. Environment: Production, Preview, Development');
console.log('8. Click "Save"\n');
console.log('⚠️  Keep this secret SAFE and NEVER commit to git!\n');
