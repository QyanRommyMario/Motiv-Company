export default function manifest() {
  return {
    name: "MOTIV Coffee E-Commerce",
    short_name: "MOTIV",
    description: "Premium Coffee Experience - B2B & B2C Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFCFA",
    theme_color: "#1A1A1A",
    icons: [
      {
        src: "/icons/ikon-motiv.png", // Mengarah ke file Anda
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable", // Agar ikon terlihat bagus di Android (bulat/kotak)
      },
      {
        src: "/icons/ikon-motiv.png", // Mengarah ke file yang sama
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
