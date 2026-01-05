"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import Loading from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";

const statusOptions = [
  { value: "PENDING", label: "Pending", color: "yellow" },
  { value: "PAID", label: "Paid", color: "blue" },
  { value: "PROCESSING", label: "Processing", color: "purple" },
  { value: "SHIPPED", label: "Shipped", color: "indigo" },
  { value: "DELIVERED", label: "Delivered", color: "green" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Handle params async resolution
    if (params?.id) {
      setOrderId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${orderId}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOrder(result.data);
          setNewStatus(result.data.status);
          setTrackingNumber(result.data.trackingNumber || "");
        } else {
          alert("Gagal memuat detail order");
          router.push("/admin/orders");
        }
      } else {
        alert("Gagal memuat detail order");
        router.push("/admin/orders");
      }
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      });

      if (response.ok) {
        alert("Status berhasil diupdate!");
        fetchOrderDetail();
      } else {
        const data = await response.json();
        alert(data.message || "Gagal update status");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loading />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Order tidak ditemukan</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header with Better Styling */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 font-medium transition-colors"
          >
            <span className="text-xl">←</span> Kembali ke Daftar Pesanan
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  📅{" "}
                  {new Date(order.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  📦 {order.items?.length || 0} Item
                </span>
              </div>
            </div>
            <span
              className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Single Column Layout */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                📦 Item Pesanan
              </h2>
            </div>
            <div className="p-6 bg-white">
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.product?.name}
                      </h3>
                      {item.variant && (
                        <p className="text-sm text-gray-600 mb-2">
                          {item.variant.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          Qty:{" "}
                          <span className="font-semibold">{item.quantity}</span>
                        </p>
                        <p className="font-bold text-gray-900 text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                📍 Alamat Pengiriman
              </h2>
            </div>
            <div className="p-6 bg-white">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Penerima</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {order.shippingName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Telepon</p>
                    <p className="text-gray-900 font-medium">
                      {order.shippingPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Alamat Lengkap</p>
                    <p className="text-gray-900">{order.shippingAddress}</p>
                    <p className="text-gray-700 mt-1">
                      {order.shippingCity}, {order.shippingProvince}{" "}
                      {order.shippingPostalCode}
                    </p>
                  </div>
                </div>
                {order.shippingCourier && (
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kurir</p>
                      <p className="text-gray-900 font-semibold uppercase">
                        {order.shippingCourier}
                      </p>
                    </div>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📦</span>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nomor Resi</p>
                      <p className="text-gray-900 font-mono font-semibold bg-gray-100 px-3 py-2 rounded inline-block">
                        {order.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                👤 Info Pelanggan
              </h2>
            </div>
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Nama
                    </p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {order.user?.name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Email
                    </p>
                    <p className="text-gray-900 break-all">
                      {order.user?.email || "-"}
                    </p>
                  </div>
                </div>
                {order.user?.phone && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Telepon
                      </p>
                      <p className="text-gray-900 font-medium">
                        {order.user.phone}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Role
                    </p>
                    <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs rounded uppercase tracking-wider font-semibold">
                      {order.user?.role || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                💰 Ringkasan Pembayaran
              </h2>
            </div>
            <div className="p-6 bg-white space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-gray-900 font-semibold text-lg">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Biaya Pengiriman</span>
                <span className="text-gray-900 font-semibold text-lg">
                  {formatCurrency(order.shippingCost)}
                </span>
              </div>
              {order.voucherDiscount > 0 && (
                <div className="flex justify-between items-center py-2 bg-red-50 -mx-6 px-6 rounded">
                  <span className="text-red-700 font-medium">
                    💎 Diskon Voucher
                  </span>
                  <span className="text-red-600 font-bold text-lg">
                    -{formatCurrency(order.voucherDiscount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900 font-bold text-xl">
                <span className="text-gray-900">Total Pembayaran</span>
                <span className="text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200 bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Status Pembayaran
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {order.paymentStatus === "PAID" ? "✅" : "⏳"}
                  </span>
                  <p className="font-bold text-gray-900 uppercase tracking-wider text-lg">
                    {order.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-900">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                ⚙️ Update Status Pesanan
              </h2>
            </div>
            <div className="p-6 bg-white space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status Pesanan
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nomor Resi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Masukkan nomor resi..."
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus || newStatus === order.status}
                className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider relative min-h-12"
              >
                <span className={updatingStatus ? "invisible" : "visible"}>
                  Update Status
                </span>
                {updatingStatus && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
