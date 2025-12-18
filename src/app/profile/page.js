"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Loading from "@/components/ui/Loading";
import Navbar from "@/components/layout/Navbar";

export default function ProfilePage() {
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
        <div className="mb-12 border-b border-gray-100 pb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">
            Profil Akun
          </p>
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
            {session.user.name}
          </h1>
          <p className="text-gray-500 mb-6">{session.user.email}</p>
          <span className="inline-block px-3 py-1 border border-black text-black text-[10px] tracking-widest uppercase font-bold">
            {session.user.role}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
              Total Pesanan
            </p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
              Alamat Tersimpan
            </p>
            <p className="text-2xl font-bold">{stats.totalAddresses}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          <button
            onClick={() => router.push("/profile/orders")}
            className="w-full flex items-center justify-between p-6 bg-white border border-gray-100 rounded-lg hover:border-black transition-all group shadow-sm"
          >
            <div className="flex items-center gap-6 text-left">
              <div className="p-3 bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors">
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
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A]">Pesanan Saya</h3>
                <p className="text-sm text-gray-500">
                  Lacak dan kelola pesanan Anda
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-300 group-hover:text-black"
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
            className="w-full flex items-center justify-between p-6 bg-white border border-gray-100 rounded-lg hover:border-black transition-all group shadow-sm"
          >
            <div className="flex items-center gap-6 text-left">
              <div className="p-3 bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A]">Alamat Pengiriman</h3>
                <p className="text-sm text-gray-500">
                  Kelola alamat pengiriman
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-300 group-hover:text-black"
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
