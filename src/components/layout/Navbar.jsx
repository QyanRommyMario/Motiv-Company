"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (session) {
      fetchCartCount();
    }
  }, [session]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      if (data.success && data.data.items) {
        const total = data.data.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(total);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: "/", redirect: true });
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/";
    } finally {
      setIsSigningOut(false);
    }
  };

  const isActive = (path) => pathname === path || pathname?.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCFA] border-b border-[#E5E7EB] backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center group">
            <span className="text-3xl font-display font-bold tracking-tight text-[#1A1A1A] group-hover:opacity-70 transition-opacity">
              MOTIV
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="/products"
              className={`text-sm uppercase tracking-widest font-medium ${
                isActive("/products") ? "text-[#1A1A1A]" : "text-[#6B7280]"
              }`}
            >
              {t("products")}
            </Link>
            <Link
              href="/stories"
              className={`text-sm uppercase tracking-widest font-medium ${
                isActive("/stories") ? "text-[#1A1A1A]" : "text-[#6B7280]"
              }`}
            >
              {t("stories")}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <LanguageSwitcher />
            {status === "loading" ? (
              <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-sm uppercase tracking-widest font-medium text-[#6B7280] hover:text-[#1A1A1A]">
                  <span>{t("profile")}</span>
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-2">
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {isSigningOut ? t("signingOut") : t("logout")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm uppercase tracking-widest font-medium text-[#1A1A1A]"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="text-sm uppercase tracking-widest font-medium bg-[#1A1A1A] text-white px-4 py-2 hover:bg-opacity-90"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
