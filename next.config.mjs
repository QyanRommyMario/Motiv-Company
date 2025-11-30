import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],
  turbopack: {
    resolveAlias: {
      ".prisma/client": "./node_modules/.prisma/client",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, "@prisma/client", "prisma"];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // [PERBAIKAN] Tambahkan *.gtflabs.io dan *.midtrans.com
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com https://*.gtflabs.io https://*.midtrans.com",
              "style-src 'self' 'unsafe-inline' https://*.gtflabs.io https://*.midtrans.com",
              "img-src 'self' data: https: blob: https://*.gtflabs.io https://*.midtrans.com",
              "font-src 'self' data: https://*.gtflabs.io https://*.midtrans.com",
              "connect-src 'self' https://api.sandbox.midtrans.com https://api.midtrans.com https://app.sandbox.midtrans.com https://app.midtrans.com https://*.supabase.co https://*.gtflabs.io https://*.midtrans.com",
              "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
