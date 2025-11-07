"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function B2BDashboard({ session }) {
  const discountPercentage = session?.user?.discountPercentage || 10;

  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Business Header - Direct & Professional */}
        <div className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[#666666] text-sm tracking-[0.2em] uppercase mb-2">
                B2B Partner Dashboard
              </p>
              <h1 className="text-5xl font-['Playfair_Display'] text-[#1A1A1A] mb-3">
                {session?.user?.companyName || session?.user?.name}
              </h1>
            </div>
            <div className="bg-[#1A1A1A] text-white px-8 py-4 text-center">
              <p className="text-3xl font-bold mb-1">{discountPercentage}%</p>
              <p className="text-xs uppercase tracking-[0.2em]">
                Discount Active
              </p>
            </div>
          </div>

          {/* Quick Stats - Business Metrics */}
          <div className="grid grid-cols-4 gap-4 border-t border-b border-[#E5E5E5] py-6">
            <div>
              <p className="text-[#666666] text-xs uppercase tracking-[0.15em] mb-2">
                Status
              </p>
              <p className="text-[#1A1A1A] font-medium">Aktif</p>
            </div>
            <div>
              <p className="text-[#666666] text-xs uppercase tracking-[0.15em] mb-2">
                Account Type
              </p>
              <p className="text-[#1A1A1A] font-medium">Business</p>
            </div>
            <div>
              <p className="text-[#666666] text-xs uppercase tracking-[0.15em] mb-2">
                Discount Level
              </p>
              <p className="text-[#1A1A1A] font-medium">
                {discountPercentage}% Off
              </p>
            </div>
            <div>
              <p className="text-[#666666] text-xs uppercase tracking-[0.15em] mb-2">
                Support
              </p>
              <p className="text-[#1A1A1A] font-medium">Priority</p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Efficient & Direct */}
        <div className="mb-16">
          <h2 className="text-2xl font-['Playfair_Display'] text-[#1A1A1A] mb-6">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/products"
              className="group bg-[#1A1A1A] text-white p-8 hover:bg-[#2A2A2A] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <svg
                  className="w-8 h-8"
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
                <span className="text-xs tracking-[0.2em] uppercase">
                  -{discountPercentage}%
                </span>
              </div>
              <h3 className="text-xl font-['Playfair_Display'] mb-1">
                Browse Catalog
              </h3>
              <p className="text-white/70 text-sm">
                View products with discount
              </p>
            </Link>

            <Link
              href="/profile/orders"
              className="group bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] transition-colors"
            >
              <svg
                className="w-8 h-8 text-[#1A1A1A] mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-1">
                Order History
              </h3>
              <p className="text-[#666666] text-sm">Track & reorder</p>
            </Link>

            <Link
              href="/cart"
              className="group bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] transition-colors"
            >
              <svg
                className="w-8 h-8 text-[#1A1A1A] mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-1">
                Shopping Cart
              </h3>
              <p className="text-[#666666] text-sm">Review & checkout</p>
            </Link>
          </div>
        </div>

        {/* Business Benefits - Value Propositions */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E5E5E5] p-10">
            <p className="text-[#666666] text-xs tracking-[0.2em] uppercase mb-4">
              Your Benefits
            </p>
            <h2 className="text-2xl font-['Playfair_Display'] text-[#1A1A1A] mb-8">
              B2B Partnership Advantages
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-[#1A1A1A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1A1A1A] font-medium text-sm">
                    {discountPercentage}% discount on all products
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-[#1A1A1A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1A1A1A] font-medium text-sm">
                    Priority customer support
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-[#1A1A1A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1A1A1A] font-medium text-sm">
                    Flexible delivery schedules
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-[#1A1A1A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1A1A1A] font-medium text-sm">
                    Extended payment terms
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border border-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-[#1A1A1A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1A1A1A] font-medium text-sm">
                    Dedicated account manager
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1A1A1A] text-white p-10">
              <p className="text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                Need Assistance?
              </p>
              <h3 className="text-2xl font-['Playfair_Display'] mb-4">
                Contact Your Account Manager
              </h3>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Our team is ready to help with bulk orders, custom requirements,
                and supply planning.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 border border-white px-6 py-3 text-sm tracking-[0.15em] uppercase hover:bg-white hover:text-[#1A1A1A] transition-all"
              >
                <span>Get in Touch</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div className="bg-white border border-[#E5E5E5] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#666666] text-xs uppercase tracking-[0.15em] mb-1">
                    Account Manager
                  </p>
                  <p className="text-[#1A1A1A] font-medium">
                    Available on request
                  </p>
                </div>
                <svg
                  className="w-8 h-8 text-[#1A1A1A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
