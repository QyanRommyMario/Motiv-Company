"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import OrderCard from "@/components/orders/OrderCard";
import OrderFilter from "@/components/orders/OrderFilter";
import Loading from "@/components/ui/Loading";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    days: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile/orders");
    }
  }, [status, router]);

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.status) params.append("status", filters.status);
      if (filters.days) params.append("days", filters.days);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setOrders(data.orders || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / pagination.limit),
        }));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch orders on mount and when filters change
  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session, fetchOrders]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <Loading />
      </>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 pt-20 sm:pt-24 lg:pt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-900">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Pesanan Saya
            </h1>
            <p className="text-gray-900 font-medium text-sm sm:text-base">
              Lihat dan kelola semua pesanan Anda
            </p>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <OrderFilter
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loading />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded border border-gray-900 p-12 text-center shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Belum Ada Pesanan
              </h3>
              <p className="text-gray-900 mb-6 font-medium">
                {filters.status || filters.days || filters.search
                  ? "Tidak ada pesanan yang sesuai dengan filter"
                  : "Anda belum memiliki pesanan. Mari mulai berbelanja!"}
              </p>
              <button
                onClick={() => router.push("/products")}
                className="px-8 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <>
              {/* Results Info */}
              <div className="mb-4 text-sm text-gray-900 font-semibold">
                Menampilkan {orders.length} dari {pagination.total} pesanan
              </div>

              {/* Order Cards */}
              <div className="space-y-4 mb-8">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 sm:px-4 py-2 border border-gray-900 text-gray-900 font-bold rounded hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <div className="flex gap-2">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`
                        px-3 sm:px-4 py-2 rounded font-bold transition-all text-sm
                        ${
                          page === pagination.page
                            ? "bg-gray-900 text-white shadow-md"
                            : "border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                        }
                      `}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 sm:px-4 py-2 border border-gray-900 text-gray-900 font-bold rounded hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
