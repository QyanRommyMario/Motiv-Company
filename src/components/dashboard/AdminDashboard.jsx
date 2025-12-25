"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminDashboard({ session }) {
  const t = useTranslations("admin.homeCards");
  const tSidebar = useTranslations("admin.sidebar");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { href: "/admin", label: tSidebar("dashboard") },
    { href: "/admin/products", label: tSidebar("products") },
    { href: "/admin/orders", label: tSidebar("orders") },
    { href: "/admin/vouchers", label: tSidebar("vouchers") },
    { href: "/admin/stories", label: tSidebar("stories") },
    { href: "/admin/b2b", label: tSidebar("b2bRequests") },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          user={session?.user}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Admin Navbar - Light Theme */}
      <nav className="bg-[#FDFCFA] border-b border-[#E5E5E5] fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-[#1A1A1A]/5 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-[#1A1A1A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                MOTIV
              </span>
              <span className="text-[#666666] text-xs uppercase tracking-wider hidden sm:block">
                Admin
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#666666] hover:text-[#1A1A1A] transition-colors uppercase tracking-wider font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Menu - Like B2B/B2C Navbar */}
            <div className="hidden sm:block relative group">
              <button className="flex items-center space-x-2 text-sm uppercase tracking-widest font-medium text-[#1A1A1A]">
                <span className="max-w-[100px] truncate">
                  {session?.user?.name?.split(" ")[0] || "Admin"}
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
                <Link
                  href="/admin"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold border-b border-gray-50"
                >
                  {tSidebar("dashboard")}
                </Link>
                <Link
                  href="/"
                  className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  {tSidebar("toWebsite")}
                </Link>
                <div className="h-px bg-gray-100 my-2"></div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium"
                >
                  {tSidebar("logout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header - Centered */}
        <div className="mb-16 text-center">
          <p className="text-[#666666] text-sm tracking-[0.2em] uppercase mb-2">
            {t("title")}
          </p>
          <h1 className="text-5xl font-['Playfair_Display'] text-[#1A1A1A] mb-6">
            {session?.user?.name || "Administrator"}
          </h1>
          <div className="border-t border-b border-[#E5E5E5] py-4 max-w-md mx-auto">
            <p className="text-[#1A1A1A] text-base uppercase tracking-[0.2em] font-medium">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Products Management */}
          <Link
            href="/admin/products"
            className="group bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-2">
              {t("products")}
            </h3>
            <p className="text-[#666666] text-sm">{t("productsDesc")}</p>
          </Link>

          {/* Orders Management */}
          <Link
            href="/admin/orders"
            className="group bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-2">
              {t("orders")}
            </h3>
            <p className="text-[#666666] text-sm">{t("ordersDesc")}</p>
          </Link>

          {/* Vouchers Management */}
          <Link
            href="/admin/vouchers"
            className="group bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-2">
              {t("vouchers")}
            </h3>
            <p className="text-[#666666] text-sm">{t("vouchersDesc")}</p>
          </Link>

          {/* Stories Management */}
          <Link
            href="/admin/stories"
            className="group bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-2">
              {t("stories")}
            </h3>
            <p className="text-[#666666] text-sm">{t("storiesDesc")}</p>
          </Link>

          {/* B2B Requests */}
          <Link
            href="/admin/b2b"
            className="group bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-2">
              {t("b2bRequests")}
            </h3>
            <p className="text-[#666666] text-sm">{t("b2bRequestsDesc")}</p>
          </Link>

          {/* Go to Dashboard */}
          <Link
            href="/admin"
            className="group bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-2">
              {tSidebar("dashboard")}
            </h3>
            <p className="text-[#666666] text-sm">{t("dashboardDesc")}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
