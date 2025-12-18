"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (session && session.user.role !== "ADMIN") {
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
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCFA] border-b border-[#E5E7EB] backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-3xl font-display font-bold tracking-tight text-[#1A1A1A] group-hover:opacity-70 transition-opacity">
              MOTIV
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="/products"
              className={`text-sm uppercase tracking-widest font-medium ${
                isActive("/products")
                  ? "text-[#1A1A1A]"
                  : "text-[#6B7280] hover:text-[#1A1A1A]"
              }`}
            >
              {t("products")}
            </Link>
            <Link
              href="/stories"
              className={`text-sm uppercase tracking-widest font-medium ${
                isActive("/stories")
                  ? "text-[#1A1A1A]"
                  : "text-[#6B7280] hover:text-[#1A1A1A]"
              }`}
            >
              {t("stories")}
            </Link>
          </div>

          {/* Right Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <LanguageSwitcher />

            {/* Cart Icon (Hanya untuk non-admin) */}
            {session?.user?.role !== "ADMIN" && (
              <Link href="/cart" className="relative p-2">
                <span className="text-sm uppercase tracking-widest font-medium text-[#6B7280] hover:text-[#1A1A1A]">
                  {t("cart")} ({cartCount})
                </span>
              </Link>
            )}

            {status === "loading" ? (
              <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              /* Profile Dropdown */
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm uppercase tracking-widest font-medium text-[#1A1A1A] py-2">
                  <span>
                    {session.user.name?.split(" ")[0] || t("profile")}
                  </span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-0 w-56 bg-white border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                  <div className="py-2">
                    {session.user.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      >
                        Dashboard Admin
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/profile"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {t("myProfile")}
                        </Link>
                        <Link
                          href="/profile/orders"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {t("myOrders")}
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                  className="text-sm uppercase tracking-widest font-medium bg-[#1A1A1A] text-white px-5 py-2.5 hover:bg-opacity-90 transition-all"
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
