/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Output standalone for better Vercel deployment
  output: "standalone",
  // Moved from experimental.serverComponentsExternalPackages (deprecated in Next.js 16)
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Turbopack configuration for Prisma
  turbopack: {
    resolveAlias: {
      // Force Prisma client resolution
      ".prisma/client": "./node_modules/.prisma/client",
    },
  },
  // Webpack fallback for ensuring Prisma binaries are included
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Copy Prisma query engine to output
      config.externals = [...config.externals, "@prisma/client", "prisma"];
    }
    return config;
  },
};

export default nextConfig;
