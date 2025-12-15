"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

const statusConfig = {
  PENDING: {
    label: "Menunggu Pembayaran",
    color: "bg-yellow-100 text-yellow-800",
    icon: "⏳",
  },
  PAID: {
    label: "Dibayar",
    color: "bg-blue-100 text-blue-800",
    icon: "✓",
  },
  PROCESSING: {
    label: "Diproses",
    color: "bg-purple-100 text-purple-800",
    icon: "📦",
  },
  SHIPPED: {
    label: "Dikirim",
    color: "bg-indigo-100 text-indigo-800",
    icon: "🚚",
  },
  DELIVERED: {
    label: "Selesai",
    color: "bg-green-100 text-green-800",
    icon: "✓",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-800",
    icon: "✗",
  },
};

const paymentStatusConfig = {
  UNPAID: {
    label: "Belum Dibayar",
    color: "text-yellow-600",
  },
  PAID: {
    label: "Sudah Dibayar",
    color: "text-green-600",
  },
  FAILED: {
    label: "Gagal",
    color: "text-red-600",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    color: "text-gray-600",
  },
};

export default function OrderCard({ order }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const status = statusConfig[order.status] || statusConfig.PENDING;
  const paymentStatus =
    paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.UNPAID;

  // Format tanggal
  const orderDate = new Date(order.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Hitung total items
  const totalItems =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Handle complete order
  const handleCompleteOrder = async () => {
    setShowConfirmModal(false);
    setIsCompleting(true);

    try {
      const response = await fetch(`/api/orders/${order.id}/complete`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          "Pesanan berhasil diselesaikan! Terima kasih atas pembelian Anda.",
          "success"
        );
        router.refresh();
      } else {
        showToast(data.message || "Gagal menyelesaikan pesanan", "error");
      }
    } catch (error) {
      console.error("Error completing order:", error);
      showToast("Terjadi kesalahan saat menyelesaikan pesanan", "error");
    } finally {
      setIsCompleting(false);
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/orders/${order.id}`);
  };

  const handleViewDetail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/orders/${order.id}`);
  };

  const openConfirmModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  return (
    <Link href={`/profile/orders/${order.id}`}>
      <div className="bg-white rounded border border-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-5 pb-4 border-b border-gray-900">
            <div>
              <p className="text-sm sm:text-base font-bold text-gray-900 tracking-wide">
                Order #{order.orderNumber}
              </p>
              <p className="text-xs text-gray-900 mt-1.5 font-semibold">
                {orderDate}
              </p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${status.color} shadow-sm`}
              >
                <span className="mr-1">{status.icon}</span>
                {status.label}
              </span>
              <p
                className={`text-xs mt-2 font-semibold ${paymentStatus.color}`}
              >
                {paymentStatus.label}
              </p>
            </div>
          </div>

          {/* Items Preview - FIXED DATA ACCESS */}
          <div className="py-4 mb-4">
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.slice(0, 2).map((item, index) => {
                  // [PERBAIKAN] Menggunakan fallback akses data yang aman
                  // Coba ambil dari item.product (Priority) atau item.productVariant.product (Legacy/Backup)
                  const product = item.product || item.productVariant?.product;
                  const variant = item.variant || item.productVariant;

                  return (
                    <div
                      key={index}
                      className="flex items-center text-sm bg-gray-50 rounded p-3 border border-gray-300 gap-2 sm:gap-3"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded shrink-0 border border-gray-300 overflow-hidden">
                        {product?.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="ml-2 sm:ml-4 flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm truncate">
                          {product?.name || "Nama Produk Tidak Tersedia"}
                        </p>
                        <p className="text-xs text-gray-900 font-medium">
                          {variant?.size || "-"} • Qty: {item.quantity}x
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
                {order.items.length > 2 && (
                  <p className="text-xs text-gray-900 text-center font-bold py-2 bg-gray-50 rounded border border-gray-300">
                    +{order.items.length - 2} produk lainnya
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-900 text-center py-4 font-bold">
                Tidak ada produk
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 pt-4 border-t border-gray-900">
            <div className="text-sm text-gray-900">
              <p className="font-semibold">
                {totalItems} {totalItems === 1 ? "Produk" : "Produk"}
              </p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <p className="text-xs text-gray-900 font-medium mb-1">
                Total Belanja
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(order.total)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-900">
            {order.status === "PENDING" && order.paymentStatus === "UNPAID" && (
              <button
                onClick={handlePayment}
                className="flex-1 sm:flex-none px-5 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Bayar Sekarang
              </button>
            )}
            {order.status === "SHIPPED" && (
              <button
                onClick={openConfirmModal}
                disabled={isCompleting}
                className={`flex-1 sm:flex-none px-5 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                  isCompleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isCompleting ? "Memproses..." : "Terima Pesanan"}
              </button>
            )}
            <button
              onClick={handleViewDetail}
              className="flex-1 sm:flex-none px-5 py-3 border border-gray-900 text-gray-900 rounded hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirmModal(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-in-right"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Konfirmasi Penerimaan Pesanan
                </h3>
                <p className="text-sm text-gray-600">
                  Apakah Anda yakin pesanan telah diterima dengan baik dan
                  sesuai?
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirmModal(false);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCompleteOrder();
                }}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Ya, Terima
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
