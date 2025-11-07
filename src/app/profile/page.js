"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAddresses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
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
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <Loading />;
  }

  if (!session) {
    return null;
  }

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
    {
      title: "Wishlist",
      description: "Simpan produk favorit Anda",
      href: "/profile/wishlist",
      badge: null,
      comingSoon: true,
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      title: "Pengaturan Akun",
      description: "Ubah profil dan keamanan",
      href: "/profile/settings",
      badge: null,
      comingSoon: true,
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section - Elegant & Minimal */}
        <div className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[#999999] text-xs tracking-[0.2em] uppercase mb-3">
                Profil Pengguna
              </p>
              <h1 className="text-5xl font-['Playfair_Display'] text-[#1A1A1A] mb-3">
                {session.user.name}
              </h1>
              <p className="text-[#666666] mb-2">{session.user.email}</p>
              {session.user.role === "B2B" && (
                <span className="inline-block px-3 py-1 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-[0.15em] uppercase">
                  B2B Partner
                </span>
              )}
              {session.user.role === "ADMIN" && (
                <span className="inline-block px-3 py-1 bg-[#1A1A1A] text-white text-xs tracking-[0.15em] uppercase">
                  Administrator
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-[#999999] text-xs uppercase tracking-[0.15em] mb-2">
                Status
              </p>
              <p className="text-[#1A1A1A] font-medium">Aktif</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-8 border-t border-b border-[#E5E5E5] py-6">
            <div>
              <p className="text-[#666666] text-xs uppercase tracking-[0.15em] mb-2">
                Pesanan
              </p>
              <p className="text-3xl font-['Playfair_Display'] text-[#1A1A1A]">
                {stats.totalOrders}
              </p>
            </div>
            <div>
              <p className="text-[#666666] text-xs uppercase tracking-[0.15em] mb-2">
                Alamat
              </p>
              <p className="text-3xl font-['Playfair_Display'] text-[#1A1A1A]">
                {stats.totalAddresses}
              </p>
            </div>
            <div>
              <p className="text-[#666666] text-xs uppercase tracking-[0.15em] mb-2">
                Wishlist
              </p>
              <p className="text-3xl font-['Playfair_Display'] text-[#1A1A1A]">
                0
              </p>
            </div>
          </div>
        </div>

        {/* Menu Grid - Clean & Structured */}
        <div className="mb-16">
          <h2 className="text-2xl font-['Playfair_Display'] text-[#1A1A1A] mb-8">
            Menu Profil
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => !item.comingSoon && router.push(item.href)}
                disabled={item.comingSoon}
                className={`
                  group bg-white border border-[#E5E5E5] p-8 text-left transition-all
                  ${
                    item.comingSoon
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-[#1A1A1A]"
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 border border-[#E5E5E5] flex items-center justify-center">
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="px-3 py-1 bg-[#1A1A1A] text-white text-xs tracking-[0.15em] uppercase">
                      {item.badge}
                    </span>
                  )}
                  {item.comingSoon && (
                    <span className="px-3 py-1 border border-[#E5E5E5] text-[#999999] text-xs tracking-[0.15em] uppercase">
                      Segera
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-['Playfair_Display'] text-[#1A1A1A] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#666666] text-sm mb-4">
                  {item.description}
                </p>
                {!item.comingSoon && (
                  <div className="flex items-center text-sm text-[#1A1A1A] tracking-[0.15em] uppercase group-hover:gap-2 transition-all">
                    <span>Buka</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Help Section - Professional */}
        <div className="bg-[#1A1A1A] text-white p-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                Butuh Bantuan?
              </p>
              <h3 className="text-2xl font-['Playfair_Display'] mb-3">
                Hubungi Customer Service
              </h3>
              <p className="text-white/70 text-sm">
                Tim kami siap membantu Anda
              </p>
            </div>
            <button className="border border-white px-8 py-3 text-sm tracking-[0.15em] uppercase hover:bg-white hover:text-[#1A1A1A] transition-all">
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
