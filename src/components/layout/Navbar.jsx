"use client";

/**
 * Modern Navbar Component
 * Minimalist navigation with Onyx Coffee Lab inspired design
 */

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const tAdmin = useTranslations("admin");
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
      // Use absolute URL to prevent port issues
      const baseUrl = window.location.origin;
      await signOut({
        callbackUrl: `${baseUrl}/`,
        redirect: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Force redirect on error
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
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-3xl font-display font-bold tracking-tight text-[#1A1A1A] group-hover:opacity-70 transition-opacity">
              MOTIV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {/* Admin Navigation */}
            {session?.user?.role === "ADMIN" ? (
              <>
                <Link
                  href="/admin"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/admin")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("dashboard")}
                </Link>
                <Link
                  href="/admin/products"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/admin/products")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("products")}
                </Link>
                <Link
                  href="/admin/orders"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/admin/orders")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("orders")}
                </Link>
                <Link
                  href="/admin/vouchers"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/admin/vouchers")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("vouchers")}
                </Link>
                <Link
                  href="/admin/b2b"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/admin/b2b")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("b2bRequests")}
                </Link>
              </>
            ) : session?.user?.role === "B2B" ? (
              /* B2B Navigation */
              <>
                <Link
                  href="/products"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/products")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {t("products")}
                </Link>
                <Link
                  href="/stories"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/stories")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {t("stories")}
                </Link>
                <Link
                  href="/profile/orders"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/profile/orders")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("orders")}
                </Link>
                <Link
                  href="/profile/addresses"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/profile/addresses")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {t("addresses")}
                </Link>
                <Link
                  href="/vouchers"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/vouchers")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("vouchers")}
                </Link>
              </>
            ) : session?.user?.role === "B2C" ? (
              /* B2C Navigation */
              <>
                <Link
                  href="/products"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/products")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {t("products")}
                </Link>
                <Link
                  href="/stories"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/stories")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {t("stories")}
                </Link>
                <Link
                  href="/profile/orders"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/profile/orders")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("orders")}
                </Link>
                <Link
                  href="/profile/addresses"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/profile/addresses")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {t("addresses")}
                </Link>
                <Link
                  href="/vouchers"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/vouchers")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tAdmin("vouchers")}
                </Link>
                <Link
                  href="/b2b/register"
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    isActive("/b2b/register")
                      ? "text-[#1A1A1A]"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  }`}
                >
                  {t("becomeB2B")}
                </Link>
              </>
            ) : (
              /* Guest/Not logged in */
              <Link
                href="/products"
                className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                  isActive("/products")
                    ? "text-[#1A1A1A]"
                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                }`}
              >
                {t("products")}
              </Link>
            )}
          </div>

          {/* Right Side - Auth & Cart */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {status === "loading" ? (
              <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              <>
                {/* Cart Icon - Only for B2C and B2B, not for Admin */}
                {(session.user.role === "B2C" ||
                  session.user.role === "B2B") && (
                  <Link
                    href="/cart"
                    className="relative text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#1A1A1A] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm uppercase tracking-widest font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                    {session?.user?.role === "ADMIN" && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                        ADMIN
                      </span>
                    )}
                    {session?.user?.role === "B2B" && (
                      <span className="px-2 py-1 bg-[#1A1A1A] text-white text-xs font-bold rounded">
                        B2B
                      </span>
                    )}
                    <span>{t("profile")}</span>
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 text-xs text-gray-500 border-b">
                        <div className="font-medium text-[#1A1A1A]">
                          {session?.user?.name || "User"}
                        </div>
                        <div className="text-gray-400">
                          {session?.user?.email || ""}
                        </div>
                        {session?.user?.role === "ADMIN" && (
                          <span className="inline-block mt-1 text-xs bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wide font-bold">
                            ADMINISTRATOR
                          </span>
                        )}
                        {session?.user?.role === "B2B" && (
                          <span className="inline-block mt-1 text-xs bg-[#1A1A1A] text-white px-2 py-0.5 rounded uppercase tracking-wide">
                            B2B Partner - {session?.user?.discount}% Discount
                          </span>
                        )}
                      </div>

                      {/* Sign Out Only */}
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {isSigningOut ? t("signingOut") : t("logout")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm uppercase tracking-widest font-medium text-[#1A1A1A] hover:opacity-70 transition-opacity border border-[#1A1A1A] px-6 py-2.5 hover:bg-[#1A1A1A] hover:text-white"
              >
                {t("login")}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-6 py-4 space-y-4">
            {/* Language Switcher - Mobile */}
            <div className="pb-4 border-b border-gray-200">
              <LanguageSwitcher />
            </div>
            
            {session?.user?.role === "ADMIN" ? (
              // Admin Navigation
              <>
                <Link
                  href="/admin"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("dashboard")}
                </Link>
                <Link
                  href="/admin/products"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("products")}
                </Link>
                <Link
                  href="/admin/orders"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("orders")}
                </Link>
                <Link
                  href="/admin/vouchers"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("vouchers")}
                </Link>
                <Link
                  href="/admin/b2b"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("b2bRequests")}
                </Link>
              </>
            ) : session?.user?.role === "B2B" ? (
              // B2B Navigation
              <>
                <Link
                  href="/products"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("products")}
                </Link>
                <Link
                  href="/cart"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("cart")} {cartCount > 0 && `(${cartCount})`}
                </Link>
                <Link
                  href="/profile/orders"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("orders")}
                </Link>
                <Link
                  href="/profile/addresses"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("addresses")}
                </Link>
                <Link
                  href="/vouchers"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("vouchers")}
                </Link>
              </>
            ) : session?.user?.role === "B2C" ? (
              // B2C Navigation
              <>
                <Link
                  href="/products"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("products")}
                </Link>
                <Link
                  href="/cart"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("cart")} {cartCount > 0 && `(${cartCount})`}
                </Link>
                <Link
                  href="/profile/orders"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("orders")}
                </Link>
                <Link
                  href="/profile/addresses"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("addresses")}
                </Link>
                <Link
                  href="/vouchers"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tAdmin("vouchers")}
                </Link>
                <Link
                  href="/b2b/register"
                  className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("becomeB2B")}
                </Link>
              </>
            ) : (
              // Guest Navigation
              <Link
                href="/products"
                className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("products")}
              </Link>
            )}

            {/* Auth Actions */}
            {session ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                disabled={isSigningOut}
                className="block w-full text-left text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors disabled:opacity-50"
              >
                {isSigningOut ? t("signingOut") : t("logout")}
              </button>
            ) : (
              <Link
                href="/login"
                className="block text-sm uppercase tracking-widest font-medium text-gray-700 hover:text-[#1A1A1A] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
