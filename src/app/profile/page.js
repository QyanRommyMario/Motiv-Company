"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ totalOrders: 0, totalAddresses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const [ordersRes, addressesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/shipping/addresses"),
      ]);
      const ordersData = await ordersRes.json();
      const addressesData = await addressesRes.json();
      setStats({
        totalOrders: ordersData.success ? ordersData.data.length : 0,
        totalAddresses: addressesData.success ? addressesData.data.length : 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) return <Loading />;
  if (!session) return null;

  const menuItems = [
    {
      title: "Pesanan Saya",
      description: "Lacak dan kelola pesanan Anda",
      href: "/profile/orders",
      badge: stats.totalOrders > 0 ? stats.totalOrders : null,
      icon: (
        <svg
          className="w-6 h-6 text-[#1A1A1A]"
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
      ),
    },
    {
      title: "Alamat Pengiriman",
      description: "Kelola alamat pengiriman",
      href: "/profile/addresses",
      badge: stats.totalAddresses > 0 ? stats.totalAddresses : null,
      icon: (
        <svg
          className="w-6 h-6 text-[#1A1A1A]"
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
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
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
          <div className="bg-white p-6 border border-gray-100 rounded-lg">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
              Total Pesanan
            </p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-6 border border-gray-100 rounded-lg">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
              Alamat Tersimpan
            </p>
            <p className="text-2xl font-bold">{stats.totalAddresses}</p>
          </div>
        </div>

        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center justify-between p-6 bg-white border border-gray-100 rounded-lg hover:border-black transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="p-3 bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-[#1A1A1A]">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {item.badge && (
                  <span className="bg-black text-white text-[10px] px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                <svg
                  className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors"
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
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-[#1A1A1A] text-white p-8 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Butuh Bantuan?</h3>
            <p className="text-white/60 text-sm">
              Hubungi kami jika memiliki kendala terkait pesanan.
            </p>
          </div>
          <button className="px-8 py-3 border border-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Hubungi Kami
          </button>
        </div>
      </div>
    </div>
  );
}
