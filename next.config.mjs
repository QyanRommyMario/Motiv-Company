import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],

  // OPTIMASI GAMBAR (PENTING UNTUK SKOR LIGHTHOUSE)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // Mengizinkan gambar dari Supabase
      },
    ],
    formats: ["image/avif", "image/webp"], // Prioritaskan format AVIF (lebih kecil dari WebP)
    minimumCacheTTL: 60,
  },

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
    return [];
  },
};

export default withNextIntl(nextConfig);
