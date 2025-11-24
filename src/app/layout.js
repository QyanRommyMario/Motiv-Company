import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/SessionProvider";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"; // 1. Import ini

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

// Konfigurasi Viewport PWA
export const viewport = {
  themeColor: "#1A1A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Konfigurasi Metadata PWA
export const metadata = {
  title: "MOTIV Coffee - E-Commerce Kopi Premium",
  description: "Belanja kopi premium dengan harga terbaik.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MOTIV Coffee",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthErrorBoundary>
            <AuthProvider>
              <ToastProvider>
                {/* 2. Pasang komponen di sini (di dalam body) */}
                <ServiceWorkerRegister />
                {children}
              </ToastProvider>
            </AuthProvider>
          </AuthErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
