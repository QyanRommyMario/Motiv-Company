/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Moved from experimental.serverComponentsExternalPackages (deprecated in Next.js 16)
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Empty turbopack config to silence Next.js 16 warning
  // Prisma works fine with Turbopack without additional configuration
  turbopack: {},
};

export default nextConfig;
