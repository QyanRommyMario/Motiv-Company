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

  useEffect(() => {
    if (params?.id) {
      setOrderId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

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
    if (order?.id) {
      router.push(`/checkout/payment?orderId=${order.id}`);
    }
  };

  const handleContactSupport = () => {
    const message = `Halo Admin Motiv, saya butuh bantuan untuk Order #${order?.orderNumber}`;
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handlePrintInvoice = () => {
    window.print();
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
    <div className="min-h-screen bg-gray-50 py-8 pt-24 print:bg-white print:pt-0">
      <div className="max-w-4xl mx-auto px-4 print:px-0 print:max-w-full">
        {/* Tombol Kembali */}
        <button
          onClick={() => router.push("/profile/orders")}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium group print:hidden"
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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 print:shadow-none print:border-0 print:p-0 print:mb-8">
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

            <div className="flex gap-3 print:hidden">
              <button
                onClick={handlePrintInvoice}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center"
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
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Invoice
              </button>

              {order.status === "PENDING" &&
                order.paymentStatus === "UNPAID" && (
                  <button
                    onClick={handlePayment}
                    className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Bayar Sekarang
                  </button>
                )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Pesanan */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden print:hidden">
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
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden print:hidden">
            <div className="bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                Riwayat Pesanan
              </h2>
            </div>
            <div className="p-6">
              <OrderTimeline order={order} />
            </div>
          </div>

          {/* Produk Dipesan */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden print:shadow-none print:border print:border-gray-900">
            <div className="bg-gray-900 px-6 py-4 print:bg-white print:border-b print:border-gray-900">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider print:text-gray-900 print:pl-0">
                Produk Dipesan
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  // [PERBAIKAN] Menggunakan item.product sebagai prioritas
                  const product = item.product || item.variant?.product;
                  const variant = item.variant;

                  return (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 p-3 rounded-lg print:border-gray-300"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative border border-gray-200 print:hidden">
                        {product?.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
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
                          {product?.name || "Product"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Ukuran:{" "}
                          <span className="font-medium text-gray-900">
                            {variant?.size || "-"}
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
                  );
                })}
              </div>
            </div>
          </div>

          {/* Informasi Pengiriman */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden print:shadow-none print:border print:border-gray-900 print:mt-4">
            <div className="bg-gray-900 px-6 py-4 print:bg-white print:border-b print:border-gray-900">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider print:text-gray-900 print:pl-0">
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
                      <div className="print:hidden">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Nomor Resi (Klik untuk melacak)
                        </p>
                        <a
                          href={`https://cekresi.com/?noresi=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 group hover:opacity-80 transition-opacity"
                        >
                          <p className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded border border-gray-300 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700">
                            {order.trackingNumber}
                          </p>
                          <svg
                            className="w-4 h-4 text-gray-500 group-hover:text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div className="hidden print:block">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Nomor Resi
                        </p>
                        <p className="font-mono font-bold text-gray-900">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ringkasan Biaya */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden print:shadow-none print:border print:border-gray-900 print:mt-4 print:break-inside-avoid">
            <div className="bg-gray-900 px-6 py-4 print:bg-white print:border-b print:border-gray-900">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wider print:text-gray-900 print:pl-0">
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
                  <div className="flex justify-between items-center text-red-600 bg-red-50 p-2 rounded print:bg-transparent print:p-0 print:text-gray-900">
                    <span>Diskon</span>
                    <span className="font-bold">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="pt-4 mt-4 border-t-2 border-gray-100 flex justify-between items-center print:border-gray-900">
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
          <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden text-white print:hidden">
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

          <div className="hidden print:block text-center mt-12 text-sm text-gray-600">
            <p>Terima kasih telah berbelanja di Motiv Company</p>
            <p>www.motivcompany.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
