"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import StatCard from "@/components/admin/StatCard";
import Loading from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      console.log("🔍 Fetching admin stats...");
      const response = await fetch("/api/admin/stats");
      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Stats loaded:", data);
        setStats(data.stats);
      } else {
        const errorData = await response.json();
        console.error("❌ Failed to fetch stats:", response.status, errorData);
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-[#6B7280] uppercase tracking-widest">
              Memuat dashboard...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-[#1A1A1A] font-semibold text-xl mb-2">
            Gagal memuat data
          </p>
          <p className="text-[#6B7280] mb-4">
            Silakan refresh halaman atau cek console untuk detail error
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#1A1A1A] text-white hover:bg-black transition-colors font-semibold uppercase tracking-wider"
          >
            Refresh Halaman
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { overview, growth, recentOrders, lowStockProducts, topProducts } =
    stats;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Dashboard</h1>
          <p className="text-[#6B7280] mt-2">
            Selamat datang di Admin Panel MOTIV Coffee
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pesanan"
            value={overview?.totalOrders || 0}
            icon="🛒"
            change={`${growth?.ordersThisMonth || 0} bulan ini`}
            changeType="positive"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(overview?.totalRevenue || 0)}
            icon="💰"
            change={`${formatCurrency(
              growth?.revenueThisMonth || 0
            )} bulan ini`}
            changeType="positive"
          />
          <StatCard
            title="Total Produk"
            value={overview?.totalProducts || 0}
            icon="📦"
          />
          <StatCard
            title="Total Pelanggan"
            value={overview?.totalUsers || 0}
            icon="👥"
          />
        </div>

        {/* Pending Orders Alert */}
        {overview?.pendingOrders > 0 && (
          <div className="bg-[#FEF9C3] border border-[#FDE047] p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-[#854D0E]">
                  {overview.pendingOrders} pesanan perlu diproses
                </p>
                <p className="text-sm text-[#A16207]">
                  Ada pesanan yang menunggu konfirmasi atau pengiriman
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="px-4 py-2 bg-[#854D0E] text-white hover:bg-[#713F12] transition-colors font-medium"
              >
                Lihat Pesanan
              </Link>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white border border-[#E5E7EB] shadow-sm">
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                  Pesanan Terbaru
                </h2>
                <Link
                  href="/admin/orders"
                  className="text-[#1A1A1A] hover:text-[#6B7280] font-medium text-sm"
                >
                  Lihat Semua →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {!recentOrders || recentOrders.length === 0 ? (
                <div className="p-6 text-center text-[#6B7280]">
                  Belum ada pesanan
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-[#1A1A1A]">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm text-[#6B7280] mt-1">
                          {order.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1">
                          {new Date(order.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#1A1A1A]">
                          {formatCurrency(order.total)}
                        </p>
                        <span
                          className={`
                          inline-block px-2 py-1 text-xs font-medium mt-1
                          ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "PROCESSING"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        `}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white border border-[#E5E7EB] shadow-sm">
            <div className="p-6 border-b border-[#E5E7EB]">
              <h2 className="text-xl font-semibold text-[#1A1A1A]">
                Produk Terlaris
              </h2>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {!topProducts || topProducts.length === 0 ? (
                <div className="p-6 text-center text-[#6B7280]">
                  Belum ada data penjualan
                </div>
              ) : (
                topProducts.map((item, index) => (
                  <div
                    key={item.variant?.id || index}
                    className="p-4 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 bg-[#F3F4F6] shrink-0">
                        {item.variant?.product?.images?.[0] && (
                          <img
                            src={item.variant.product.images[0]}
                            alt={item.variant?.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1A1A1A] truncate">
                          {item.variant?.product?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {item.variant?.size || "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#1A1A1A]">
                          {item.totalQuantity || 0}x
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {item.orderCount || 0} orders
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts && lowStockProducts.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] shadow-sm">
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <h2 className="text-xl font-semibold text-[#1A1A1A]">
                    Stok Menipis
                  </h2>
                </div>
                <Link
                  href="/admin/products"
                  className="text-[#1A1A1A] hover:text-[#6B7280] font-medium text-sm"
                >
                  Kelola Produk →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {lowStockProducts.map((variant) => (
                <div
                  key={variant.id}
                  className="border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white shrink-0">
                      {variant.product?.images?.[0] && (
                        <img
                          src={variant.product.images[0]}
                          alt={variant.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1A1A1A] text-sm truncate">
                        {variant.product?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {variant.size || "Default"}
                      </p>
                      <p className="text-sm font-bold text-red-600 mt-2">
                        Stok: {variant.stock}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
