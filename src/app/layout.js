import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/SessionProvider";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import OfflineIndicator from "@/components/ui/OfflineIndicator";

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

export const viewport = {
  themeColor: "#1A1A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

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
  // 1. Ambil locale dari cookie server-side
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  // 2. Ambil messages sesuai locale
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
                <ServiceWorkerRegister />
                <OfflineIndicator />
                {children}
              </ToastProvider>
            </AuthProvider>
          </AuthErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
