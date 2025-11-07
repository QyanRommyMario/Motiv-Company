"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

// Professional SVG Icons
const icons = {
  dashboard: (
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  produk: (
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
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  kategori: (
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
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  pesanan: (
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
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  pelanggan: (
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
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  voucher: (
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
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  ),
  b2b: (
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
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  home: (
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
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  logout: (
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
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  stories: (
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
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
};

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "dashboard" },
  { name: "Produk", href: "/admin/products", icon: "produk" },
  { name: "Kategori", href: "/admin/categories", icon: "kategori" },
  { name: "Pesanan", href: "/admin/orders", icon: "pesanan" },
  { name: "Pelanggan", href: "/admin/customers", icon: "pelanggan" },
  { name: "Voucher", href: "/admin/vouchers", icon: "voucher" },
  { name: "Stories", href: "/admin/stories", icon: "stories" },
  { name: "B2B Requests", href: "/admin/b2b", icon: "b2b" },
];

export default function AdminSidebar({ user }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="w-64 bg-[#1A1A1A] text-white h-screen flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#1A1A1A]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2 21h19v-3H2v3zM20 8H3v8h17V8zM4 14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">MOTIV Coffee</h1>
            <p className="text-xs text-white/50 uppercase tracking-wider">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center font-bold text-[#1A1A1A] text-lg">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-white">
              {user?.name || "Admin MOTIV"}
            </p>
            <p className="text-xs text-white/50 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Fix active state logic for exact and nested paths
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 transition-all duration-200
                ${
                  isActive
                    ? "bg-white text-[#1A1A1A] font-semibold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span className={isActive ? "text-[#1A1A1A]" : "text-white/70"}>
                {icons[item.icon]}
              </span>
              <span className="font-medium text-sm tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Links */}
      <div className="p-4 border-t border-white/10 space-y-1 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <span className="text-white/70">{icons.home}</span>
          <span className="font-medium text-sm tracking-wide">Ke Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <span className="text-white/70">{icons.logout}</span>
          <span className="font-medium text-sm tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );
}
