"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Loading from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Pending", color: "yellow" },
  { value: "PAID", label: "Paid", color: "blue" },
  { value: "PROCESSING", label: "Processing", color: "purple" },
  { value: "SHIPPED", label: "Shipped", color: "indigo" },
  { value: "DELIVERED", label: "Delivered", color: "green" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter) params.append("status", filter);
      params.append("limit", "100");

      console.log("🔍 Fetching admin orders with params:", params.toString());

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        console.log("📦 Received orders:", result);
        if (result.success) {
          setOrders(result.data.orders || []);
        }
      } else {
        console.error("❌ Failed to fetch orders:", response.status);
        const errorData = await response.json();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (
    orderId,
    newStatus,
    additionalData = {}
  ) => {
    try {
      setUpdatingStatus(true);
      console.log("🔄 Updating order status:", {
        orderId,
        newStatus,
        additionalData,
      });

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Order updated:", result);
        alert("Status berhasil diupdate!");
        fetchOrders();
        setShowModal(false);
        setSelectedOrder(null);
      } else {
        const data = await response.json();
        console.error("❌ Update failed:", data);
        alert(data.message || "Gagal update status");
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Pesanan
          </h1>
          <p className="text-gray-600 mt-2">Kelola semua pesanan pelanggan</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Pesanan
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nomor order, nama, email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loading />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📦</div>
              <p>Tidak ada pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.user?.name || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.user?.email || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.paymentStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-gray-900 hover:text-gray-700 font-medium uppercase tracking-wider underline"
                          >
                            Detail
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            className="text-gray-900 hover:text-gray-700 font-medium uppercase tracking-wider underline"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update Status Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                Update Status Order #{selectedOrder.orderNumber}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Baru
                  </label>
                  <select
                    id="newStatus"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500"
                    defaultValue={selectedOrder.status}
                  >
                    {statusOptions
                      .filter((opt) => opt.value)
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Resi (Opsional)
                  </label>
                  <input
                    type="text"
                    id="trackingNumber"
                    placeholder="Masukkan nomor resi..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500"
                    defaultValue={selectedOrder.trackingNumber || ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kurir (Opsional)
                  </label>
                  <input
                    type="text"
                    id="courier"
                    placeholder="JNE, TIKI, POS..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500"
                    defaultValue={selectedOrder.shippingCourier || ""}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={updatingStatus}
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    const newStatus =
                      document.getElementById("newStatus").value;
                    const trackingNumber =
                      document.getElementById("trackingNumber").value;
                    const courier = document.getElementById("courier").value;

                    handleUpdateStatus(selectedOrder.id, newStatus, {
                      trackingNumber: trackingNumber || undefined,
                      shippingCourier: courier || undefined,
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors disabled:opacity-50"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? "Mengupdate..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
