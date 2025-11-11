/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Ensure Prisma binaries are included in Vercel deployment
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      });
    }
    return config;
  },
  // Output standalone for better Vercel performance
  output: 'standalone',
};

export default nextConfig;
