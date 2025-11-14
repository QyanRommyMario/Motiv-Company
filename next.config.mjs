import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.js");

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
  // Headers for CSP - Allow Midtrans Snap
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.sandbox.midtrans.com https://api.midtrans.com https://*.supabase.co",
              "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
