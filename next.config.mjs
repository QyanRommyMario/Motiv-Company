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
  // KITA KOSONGKAN HEADERS AGAR TIDAK ADA CSP YANG MEMBLOKIR
  async headers() {
    return [];
  },
};

export default withNextIntl(nextConfig);
