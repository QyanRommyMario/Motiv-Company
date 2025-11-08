/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Ensure Prisma binaries are included in Vercel deployment
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Output standalone for better Prisma compatibility
  output: 'standalone',
};

export default nextConfig;
