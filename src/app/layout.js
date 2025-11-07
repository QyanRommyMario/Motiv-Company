import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/SessionProvider";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

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

export const metadata = {
  title: "MOTIV Coffee - E-Commerce Kopi Premium",
  description:
    "Belanja kopi premium dengan harga terbaik. Fitur B2B dan B2C tersedia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthErrorBoundary>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
