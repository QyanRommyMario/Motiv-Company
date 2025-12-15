"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams, usePathname } from "next/navigation";
import OrderStatus from "@/components/orders/OrderStatus";
import OrderTimeline from "@/components/orders/OrderTimeline";
import Loading from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Mengambil ID dari URL
  useEffect(() => {
    if (params?.id) {
      setOrderId(params.id);
    }
  }, [params]);

  // Redirect jika user belum login
  useEffect(() => {
    if (status === "unauthenticated") {
      // Callback URL disesuaikan agar kembali ke halaman detail ini setelah login
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  // Fetch detail order
  useEffect(() => {
    if (session?.user && orderId) {
      fetchOrderDetail();
    }
  }, [session, orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Pesanan tidak ditemukan");
        } else if (response.status === 403) {
          throw new Error("Anda tidak memiliki akses ke pesanan ini");
        }
        throw new Error("Gagal memuat detail pesanan");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        throw new Error("Format data pesanan tidak valid");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    // Pastikan order.id tersedia sebelum navigasi
    if (order?.id) {
      router.push(`/checkout/payment?orderId=${order.id}`);
    }
  };

  const handleContactSupport = () => {
    window.open("https://wa.me/6281234567890", "_blank");
  };

  const formatPaymentType = (type) => {
    if (type === "qris_manual") return "QRIS Manual (Konfirmasi Otomatis)";
    if (type === "credit_card") return "Kartu Kredit";
    if (type === "bank_transfer") return "Transfer Bank";
    return type || "Belum dipilih";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{error}</h3>
            <button
              onClick={() => router.push("/profile/orders")}
              className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider"
            >
              Kembali ke Daftar Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Tombol Kembali */}
        <button
          onClick={() => router.push("/profile/orders")}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali ke Daftar Pesanan
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Detail Pesanan
              </h1>
              <p className="text-gray-900 font-medium">
                Order #{order.orderNumber}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Tombol Bayar (Hanya jika PENDING & UNPAID) */}
            {order.status === "PENDING" && order.paymentStatus === "UNPAID" && (
              <button
                onClick={handlePayment}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Bayar Sekarang
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Pesanan */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Status Pesanan
              </h2>
            </div>
            <div className="p-6">
              <OrderStatus
                currentStatus={order.status}
                paymentStatus={order.paymentStatus}
              />
            </div>
          </div>

          {/* Timeline / Riwayat */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Riwayat Pesanan
              </h2>
            </div>
            <div className="p-6">
              <OrderTimeline order={order} />
            </div>
          </div>

          {/* Daftar Produk */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Produk Dipesan
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative border border-gray-200">
                      {item.variant?.product?.images?.[0] ? (
                        <img
                          src={item.variant.product.images[0]}
                          alt={item.variant.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.variant?.product?.name || "Product"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Ukuran:{" "}
                        <span className="font-medium text-gray-900">
                          {item.variant?.size || "-"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Jumlah:{" "}
                        <span className="font-medium text-gray-900">
                          {item.quantity}x
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 mb-1">
                        {formatCurrency(item.price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total:{" "}
                        <span className="font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Informasi Pengiriman */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Informasi Pengiriman
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Penerima
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {order.recipientName || order.shippingName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Telepon
                  </p>
                  <p className="font-medium text-gray-900">
                    {order.recipientPhone || order.shippingPhone}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Alamat Lengkap
                  </p>
                  <p className="text-gray-900 leading-relaxed">
                    {order.shippingAddress}
                  </p>
                  {order.shippingCity && (
                    <p className="text-gray-700 mt-1">
                      {order.shippingCity}, {order.shippingProvince}{" "}
                      {order.shippingPostalCode}
                    </p>
                  )}
                </div>

                {(order.courierName || order.courierService) && (
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 mt-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Kurir & Layanan
                      </p>
                      <p className="font-semibold text-gray-900 uppercase">
                        {order.courierName} - {order.courierService}
                      </p>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Nomor Resi
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                            {order.trackingNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informasi Pembayaran */}
          {order.transaction && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 px-6 py-4">
                <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                  Informasi Pembayaran
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Metode Pembayaran
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatPaymentType(order.transaction.paymentType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Status Pembayaran
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded font-semibold uppercase tracking-wider text-xs ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.paymentStatus === "PAID"
                        ? "Sudah Dibayar"
                        : order.paymentStatus === "FAILED"
                        ? "Gagal"
                        : "Belum Dibayar"}
                    </span>
                  </div>
                  {order.transaction.vaNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Nomor VA
                      </p>
                      <p className="font-mono font-bold text-gray-900 text-lg">
                        {order.transaction.vaNumber}
                      </p>
                    </div>
                  )}
                  {order.transaction.bank && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Bank
                      </p>
                      <p className="font-semibold text-gray-900 uppercase">
                        {order.transaction.bank}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ringkasan Biaya */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Ringkasan Biaya
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Biaya Pengiriman</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.shippingCost)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center text-red-600 bg-red-50 p-2 rounded">
                    <span>Diskon</span>
                    <span className="font-bold">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="pt-4 mt-4 border-t-2 border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">
                    Total Pembayaran
                  </span>
                  <span className="font-bold text-2xl text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bantuan */}
          <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden text-white">
            <div className="p-8 text-center">
              <h2 className="text-xl font-bold mb-2">
                Butuh Bantuan dengan Pesanan Ini?
              </h2>
              <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                Jika Anda memiliki pertanyaan atau kendala mengenai pesanan ini,
                tim support kami siap membantu Anda.
              </p>
              <button
                onClick={handleContactSupport}
                className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-bold uppercase tracking-wider inline-flex items-center"
              >
                <span className="mr-2">💬</span> Hubungi Customer Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
