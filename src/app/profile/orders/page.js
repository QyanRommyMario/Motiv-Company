"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar"; // ✅ Tambah Navbar
import OrderCard from "@/components/orders/OrderCard";
import OrderFilter from "@/components/orders/OrderFilter";
import Loading from "@/components/ui/Loading";

function OrderListContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State filter
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    days: "",
    search: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.days) params.append("days", filters.days);
      if (filters.search) params.append("search", filters.search);
      params.append("limit", "20");

      const response = await fetch(`/api/orders?${params.toString()}`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data.orders)) {
        setOrders(result.data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Gagal memuat pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Navbar /> {/* ✅ Konsistensi: Navbar */}
      <div className="min-h-screen bg-gray-50 py-8 pt-28">
        {" "}
        {/* ✅ Padding konsisten */}
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Riwayat Pesanan
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola dan pantau status pesanan Anda
              </p>
            </div>
            <button
              onClick={() => router.push("/products")}
              className="px-6 py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors font-semibold text-sm"
            >
              Belanja Lagi
            </button>
          </div>

          {/* Filter Section */}
          <div className="mb-6 sticky top-24 z-10">
            <OrderFilter filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <Loading />
              </div>
            ) : orders.length > 0 ? (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum ada pesanan
                </h3>
                <p className="text-gray-600 mb-6">
                  Anda belum melakukan pemesanan apapun.
                </p>
                <button
                  onClick={() => router.push("/products")}
                  className="px-8 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider"
                >
                  Lihat Produk
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrderListPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrderListContent />
    </Suspense>
  );
}
