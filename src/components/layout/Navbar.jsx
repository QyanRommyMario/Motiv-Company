"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();

  const isGuestLanding = pathname === "/" && !session;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    if (session) fetchCartCount();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/", redirect: true });
  };

  const isActive = (path) => pathname === path || pathname?.startsWith(path);

  const navBg = isGuestLanding
    ? scrolled
      ? "bg-black/90 backdrop-blur-md border-white/10"
      : "bg-transparent border-transparent"
    : "bg-[#FDFCFA]/95 backdrop-blur-sm border-[#E5E7EB]";

  const textColor =
    isGuestLanding && !scrolled ? "text-white" : "text-[#1A1A1A]";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <span
              className={`text-3xl font-display font-bold tracking-tight transition-colors duration-300 ${textColor}`}
            >
              MOTIV
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="/products"
              className={`text-sm uppercase tracking-widest font-medium transition-all ${
                isActive("/products")
                  ? "opacity-100 font-bold"
                  : "opacity-70 hover:opacity-100"
              } ${textColor}`}
            >
              Produk
            </Link>
            <Link
              href="/stories"
              className={`text-sm uppercase tracking-widest font-medium transition-all ${
                isActive("/stories")
                  ? "opacity-100 font-bold"
                  : "opacity-70 hover:opacity-100"
              } ${textColor}`}
            >
              Cerita
            </Link>
            <Link
              href="/vouchers"
              className={`text-sm uppercase tracking-widest font-medium transition-all ${
                isActive("/vouchers")
                  ? "opacity-100 font-bold"
                  : "opacity-70 hover:opacity-100"
              } ${textColor}`}
            >
              Voucher
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <LanguageSwitcher
              variant={isGuestLanding && !scrolled ? "dark" : "light"}
            />

            {session && session.user.role !== "ADMIN" && (
              <Link
                href="/cart"
                className={`relative p-2 transition-colors ${textColor} hover:opacity-70`}
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
                    strokeWidth="1.5"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center inline-block">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {status === "loading" ? (
              <div className="w-16 h-6 bg-gray-200/20 animate-pulse rounded"></div>
            ) : session ? (
              <div className="relative group">
                <button
                  className={`flex items-center space-x-2 text-sm uppercase tracking-widest font-medium transition-colors ${textColor}`}
                >
                  <span>{session.user.name?.split(" ")[0]}</span>
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

                <div className="absolute right-0 mt-0 w-60 bg-white border border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[110] py-2 rounded-sm">
                  {session.user.role === "ADMIN" ? (
                    <Link
                      href="/admin"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold border-b border-gray-50"
                    >
                      ADMIN DASHBOARD
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        Profil
                      </Link>
                      <Link
                        href="/profile/orders"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        Pesanan Saya
                      </Link>
                      <Link
                        href="/profile/addresses"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        Alamat
                      </Link>
                    </>
                  )}
                  <div className="h-px bg-gray-100 my-2"></div>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    {isSigningOut ? "Keluar..." : "Keluar"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`text-sm uppercase tracking-widest font-medium ${textColor}`}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className={`text-sm uppercase tracking-widest font-medium px-6 py-2.5 transition-all ${
                    isGuestLanding && !scrolled
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
