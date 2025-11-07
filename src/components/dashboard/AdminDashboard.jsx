"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function AdminDashboard({ session }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      <Navbar />

      {/* Add padding top to avoid navbar overlap - Navbar height is h-20 (80px) + extra space */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-6xl md:text-7xl font-['Playfair_Display'] text-white mb-4 font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <div className="w-24 h-1 bg-white/30 mx-auto mb-6"></div>
          <p className="text-white/60 text-xl uppercase tracking-[0.3em] font-light">
            Manage Your Coffee Business
          </p>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Products Management */}
          <Link
            href="/admin/products"
            className="group bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 p-10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 relative overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-8 h-8 text-[#0A0A0A]"
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
                </div>
              </div>
              <h3 className="text-3xl font-['Playfair_Display'] text-white mb-3 font-bold group-hover:text-white/90 transition-colors">
                Products
              </h3>
              <p className="text-white/50 uppercase tracking-[0.2em] text-sm font-medium">
                Manage Inventory
              </p>
            </div>
          </Link>

          {/* Orders Management */}
          <Link
            href="/admin/orders"
            className="group bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 p-10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 relative overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-8 h-8 text-[#0A0A0A]"
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
                </div>
              </div>
              <h3 className="text-3xl font-['Playfair_Display'] text-white mb-3 font-bold group-hover:text-white/90 transition-colors">
                Orders
              </h3>
              <p className="text-white/50 uppercase tracking-[0.2em] text-sm font-medium">
                Process Orders
              </p>
            </div>
          </Link>

          {/* Vouchers Management */}
          <Link
            href="/admin/vouchers"
            className="group bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 p-10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 relative overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-8 h-8 text-[#0A0A0A]"
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
                </div>
              </div>
              <h3 className="text-3xl font-['Playfair_Display'] text-white mb-3 font-bold group-hover:text-white/90 transition-colors">
                Vouchers
              </h3>
              <p className="text-white/50 uppercase tracking-[0.2em] text-sm font-medium">
                Manage Discounts
              </p>
            </div>
          </Link>

          {/* Stories Management - NEW */}
          <Link
            href="/admin/stories"
            className="group bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 p-10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 relative overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-8 h-8 text-[#0A0A0A]"
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
                </div>
              </div>
              <h3 className="text-3xl font-['Playfair_Display'] text-white mb-3 font-bold group-hover:text-white/90 transition-colors">
                Stories
              </h3>
              <p className="text-white/50 uppercase tracking-[0.2em] text-sm font-medium">
                Landing Page Stories
              </p>
            </div>
          </Link>

          {/* B2B Requests */}
          <Link
            href="/admin/b2b"
            className="group bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 p-10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 relative overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-8 h-8 text-[#0A0A0A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-['Playfair_Display'] text-white mb-3 font-bold group-hover:text-white/90 transition-colors">
                B2B Requests
              </h3>
              <p className="text-white/50 uppercase tracking-[0.2em] text-sm font-medium">
                Approve Businesses
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
