"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Loading from "@/components/ui/Loading";
import Navbar from "@/components/layout/Navbar";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ totalOrders: 0, totalAddresses: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [ordersRes, addressesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/shipping/addresses"),
      ]);
      const ordersData = await ordersRes.json();
      const addressesData = await addressesRes.json();

      setStats({
        totalOrders: ordersData.success ? ordersData.data?.length || 0 : 0,
        totalAddresses: addressesData.success
          ? addressesData.data?.length || 0
          : 0,
      });
    } catch (error) {
      console.error("Profile stats error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router, fetchStats]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <Loading />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 border-b border-[#E5E7EB] pb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B7280] font-bold mb-4">
            {t("title")}
          </p>
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
            {session.user.name}
          </h1>
          <p className="text-[#374151] text-lg font-medium mb-6">
            {session.user.email}
          </p>
          <span className="inline-block px-4 py-1.5 bg-[#1A1A1A] text-white text-[11px] tracking-widest uppercase font-black">
            {session.user.role}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 border border-[#E5E7EB] shadow-sm">
            <p className="text-[11px] uppercase tracking-widest text-[#6B7280] font-black mb-2">
              {t("totalOrders")}
            </p>
            <p className="text-3xl font-bold text-[#1A1A1A]">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-white p-8 border border-[#E5E7EB] shadow-sm">
            <p className="text-[11px] uppercase tracking-widest text-[#6B7280] font-black mb-2">
              {t("savedAddresses")}
            </p>
            <p className="text-3xl font-bold text-[#1A1A1A]">
              {stats.totalAddresses}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <button
            onClick={() => router.push("/profile/orders")}
            className="w-full flex items-center justify-between p-6 bg-white border border-[#E5E7EB] hover:border-[#1A1A1A] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-6 text-left">
              <div className="p-4 bg-[#F9FAFB] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors text-[#1A1A1A]">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">
                  {t("myOrders")}
                </h3>
                <p className="text-sm text-[#4B5563] font-medium">
                  {t("myOrdersDesc")}
                </p>
              </div>
            </div>
            <svg
              className="w-6 h-6 text-[#E5E7EB] group-hover:text-[#1A1A1A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            onClick={() => router.push("/profile/addresses")}
            className="w-full flex items-center justify-between p-6 bg-white border border-[#E5E7EB] hover:border-[#1A1A1A] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-6 text-left">
              <div className="p-4 bg-[#F9FAFB] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors text-[#1A1A1A]">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">
                  {t("addressBook")}
                </h3>
                <p className="text-sm text-[#4B5563] font-medium">
                  {t("addressBookDesc")}
                </p>
              </div>
            </div>
            <svg
              className="w-6 h-6 text-[#E5E7EB] group-hover:text-[#1A1A1A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
