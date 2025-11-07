"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import OrderStatus from "@/components/orders/OrderStatus";
import OrderTimeline from "@/components/orders/OrderTimeline";
import Loading from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Handle params async resolution for Next.js 16
  useEffect(() => {
    if (params?.id) {
      setOrderId(params.id);
    }
  }, [params]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile/orders");
    }
  }, [status, router]);

  // Fetch order detail
  useEffect(() => {
    if (session && orderId) {
      fetchOrderDetail();
    }
  }, [session, orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching order detail:", orderId);

      const response = await fetch(`/api/orders/${orderId}`);
      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Pesanan tidak ditemukan");
        } else if (response.status === 403) {
          throw new Error("Anda tidak memiliki akses ke pesanan ini");
        }
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error response:", errorData);
        throw new Error("Gagal memuat detail pesanan");
      }

      const data = await response.json();
      console.log("✅ Order loaded:", data);
      setOrder(data.order);
    } catch (error) {
      console.error("❌ Error fetching order:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    // Redirect ke halaman payment dengan order ID
    router.push(`/checkout/payment?orderId=${order.id}`);
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support
    alert("Fitur hubungi customer service akan segera hadir");
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
      <div className="min-h-screen bg-gray-50 py-8">
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

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/profile/orders")}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
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
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Action Buttons */}
            {order.status === "PENDING" && order.paymentStatus === "UNPAID" && (
              <button
                onClick={handlePayment}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider"
              >
                Bayar Sekarang
              </button>
            )}
          </div>
        </div>

        {/* Single Column Layout */}
        <div className="space-y-6">
          {/* Order Status */}
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

          {/* Timeline */}
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

          {/* Products */}
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
                    <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                      {item.variant?.product?.images?.[0] ? (
                        <img
                          src={item.variant.product.images[0]}
                          alt={item.variant.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.variant?.product?.name || "Product"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Ukuran: {item.variant?.size || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Jumlah:{" "}
                        <span className="font-semibold">{item.quantity}x</span>
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

          {/* Shipping Info */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Informasi Pengiriman
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Penerima
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {order.recipientName || order.shippingName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Telepon
                  </p>
                  <p className="font-medium text-gray-900">
                    {order.recipientPhone || order.shippingPhone}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Alamat
                  </p>
                  <p className="text-gray-900">{order.shippingAddress}</p>
                  {order.shippingCity && (
                    <p className="text-gray-700 mt-1">
                      {order.shippingCity}, {order.shippingProvince}{" "}
                      {order.shippingPostalCode}
                    </p>
                  )}
                </div>
                {order.shippingCourier && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Kurir
                      </p>
                      <p className="font-semibold text-gray-900 uppercase">
                        {order.shippingCourier}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Layanan
                      </p>
                      <p className="font-medium text-gray-900">
                        {order.shippingService}
                      </p>
                    </div>
                  </>
                )}
                {order.trackingNumber && (
                  <div className="md:col-span-2 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Nomor Resi
                    </p>
                    <p className="font-mono font-bold text-gray-900 bg-gray-100 px-4 py-3 rounded inline-block">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
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
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Metode Pembayaran
                    </p>
                    <p className="font-semibold text-gray-900">
                      {order.transaction.paymentType || "Belum dipilih"}
                    </p>
                  </div>
                  {order.transaction.vaNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        VA Number
                      </p>
                      <p className="font-mono font-bold text-gray-900">
                        {order.transaction.vaNumber}
                      </p>
                    </div>
                  )}
                  {order.transaction.bank && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Bank
                      </p>
                      <p className="font-semibold text-gray-900 uppercase">
                        {order.transaction.bank}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
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
                </div>
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Ringkasan Pembayaran
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Subtotal Produk</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Biaya Pengiriman</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {formatCurrency(order.shippingCost)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center py-2 bg-red-50 -mx-6 px-6 rounded">
                    <span className="text-red-700 font-medium">Diskon</span>
                    <span className="font-bold text-red-600 text-lg">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
                  <span className="font-bold text-gray-900 text-xl">
                    Total Pembayaran
                  </span>
                  <span className="font-bold text-2xl text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-lg shadow-md border-2 border-gray-900 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Butuh Bantuan?
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Hubungi customer service kami jika ada pertanyaan tentang
                pesanan Anda
              </p>
              <button
                onClick={handleContactSupport}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider"
              >
                Hubungi CS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
