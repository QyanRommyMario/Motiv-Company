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
  const [scrolled, setScrolled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Don't render navbar on admin pages - admin has its own layout
  const isAdminPage = pathname?.startsWith("/admin");

  const isGuestLanding = pathname === "/" && !session;
  const isB2B = session?.user?.role === "B2B";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    if (session) fetchCartCount();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [session]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

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
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/", redirect: true });
  };

  // Don't render on admin pages
  if (isAdminPage) {
    return null;
  }

  const isActive = (path) => pathname === path || pathname?.startsWith(path);

  const navBg = isGuestLanding
    ? scrolled
      ? "bg-black/90 backdrop-blur-md border-white/10"
      : "bg-transparent border-transparent"
    : "bg-[#FDFCFA]/95 backdrop-blur-sm border-[#E5E7EB]";

  const textColor =
    isGuestLanding && !scrolled ? "text-white" : "text-[#1A1A1A]";

  // Different nav links for B2B users
  const navLinks = isB2B
    ? [
        { href: "/products", label: t("products") },
        { href: "/vouchers", label: t("vouchers") },
      ]
    : [
        { href: "/products", label: t("products") },
        { href: "/stories", label: t("stories") },
        { href: "/vouchers", label: t("vouchers") },
      ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${navBg}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0"
              aria-label="MOTIV Coffee - Home"
            >
              <span
                className={`text-2xl sm:text-3xl font-display font-bold tracking-tight transition-colors duration-300 ${textColor}`}
                aria-hidden="true"
              >
                MOTIV
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm uppercase tracking-widest font-medium transition-all ${
                    isActive(link.href)
                      ? "opacity-100 font-bold"
                      : "opacity-70 hover:opacity-100"
                  } ${textColor}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Language Switcher - Hidden on mobile */}
              <div className="hidden sm:block">
                <LanguageSwitcher
                  variant={isGuestLanding && !scrolled ? "dark" : "light"}
                />
              </div>

              {/* Cart Icon */}
              {session && session.user.role !== "ADMIN" && (
                <Link
                  href="/cart"
                  className={`relative p-2 transition-colors ${textColor} hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A1A1A]`}
                  aria-label={`Shopping cart${
                    cartCount > 0 ? `, ${cartCount} items` : ", empty"
                  }`}
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Desktop User Menu */}
              {status === "loading" ? (
                <div className="hidden sm:block w-16 h-6 bg-gray-200/20 animate-pulse rounded"></div>
              ) : session ? (
                <div className="hidden sm:block relative group">
                  <button
                    className={`flex items-center space-x-2 text-sm uppercase tracking-widest font-medium transition-colors ${textColor}`}
                  >
                    <span className="max-w-[100px] truncate">
                      {session.user.name?.split(" ")[0]}
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

                  <div className="absolute right-0 mt-0 w-60 bg-white border border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[110] py-2">
                    {session.user.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold border-b border-gray-50"
                      >
                        {t("roleAdministrator")}
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/profile"
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          {t("profile")}
                        </Link>
                        <Link
                          href="/profile/orders"
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          {t("myOrders")}
                        </Link>
                        <Link
                          href="/profile/addresses"
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          {t("addresses")}
                        </Link>
                        {/* B2B Registration Link for B2C users */}
                        {session.user.role === "B2C" && (
                          <Link
                            href="/b2b/register"
                            className="block px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-yellow-50 font-medium border-t border-gray-100"
                          >
                            {t("becomeB2B")}
                          </Link>
                        )}
                      </>
                    )}
                    <div className="h-px bg-gray-100 my-2"></div>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium"
                    >
                      {isSigningOut ? t("signingOut") : t("logout")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    href="/login"
                    className={`text-sm uppercase tracking-widest font-medium ${textColor} hover:opacity-70 transition-opacity`}
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    className={`text-sm uppercase tracking-widest font-medium px-4 lg:px-6 py-2 transition-all ${
                      isGuestLanding && !scrolled
                        ? "bg-white text-black hover:bg-gray-100"
                        : "bg-[#1A1A1A] text-white hover:bg-black"
                    }`}
                  >
                    {t("register")}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 ${textColor} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A1A1A]`}
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
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
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[90] md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <nav
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white z-[95] md:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="text-xl font-display font-bold">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-6 py-3 text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-gray-50 text-[#1A1A1A] font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-gray-100 my-4 mx-6" />

            {session ? (
              <>
                {session.user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="block px-6 py-3 text-base font-bold text-[#1A1A1A] hover:bg-gray-50"
                  >
                    {t("roleAdministrator")}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/profile"
                      className="block px-6 py-3 text-base text-gray-600 hover:bg-gray-50"
                    >
                      {t("profile")}
                    </Link>
                    <Link
                      href="/profile/orders"
                      className="block px-6 py-3 text-base text-gray-600 hover:bg-gray-50"
                    >
                      {t("myOrders")}
                    </Link>
                    <Link
                      href="/profile/addresses"
                      className="block px-6 py-3 text-base text-gray-600 hover:bg-gray-50"
                    >
                      {t("addresses")}
                    </Link>
                    {/* B2B Registration Link for B2C users in mobile menu */}
                    {session.user.role === "B2C" && (
                      <Link
                        href="/b2b/register"
                        className="block px-6 py-3 text-base text-[#1A1A1A] hover:bg-yellow-50 font-medium border-t border-gray-100"
                      >
                        {t("becomeB2B")}
                      </Link>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="px-6 py-4 space-y-3">
                <Link
                  href="/login"
                  className="block w-full py-3 text-center text-[#1A1A1A] border border-[#1A1A1A] font-medium hover:bg-gray-50 transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="block w-full py-3 text-center bg-[#1A1A1A] text-white font-medium hover:bg-black transition-colors"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="border-t border-gray-100 p-4 space-y-4">
            {/* Language Switcher in Mobile */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Language</span>
              <LanguageSwitcher variant="light" />
            </div>

            {session && (
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full py-3 text-center text-red-600 border border-red-200 font-medium hover:bg-red-50 transition-colors"
              >
                {isSigningOut ? t("signingOut") : t("logout")}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
