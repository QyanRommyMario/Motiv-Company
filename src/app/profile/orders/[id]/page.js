"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar"; // ✅ Tambah Navbar
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
    if (params?.id) setOrderId(params.id);
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
      if (!response.ok) throw new Error("Gagal memuat detail pesanan");
      const result = await response.json();
      if (result.success && result.data) setOrder(result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (order?.id) router.push(`/checkout/payment?orderId=${order.id}`);
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FDFCFA] py-8 pt-28">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white shadow-md border border-[#E5E7EB] p-12 text-center">
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                {error}
              </h3>
              <button
                onClick={() => router.push("/profile/orders")}
                className="mt-6 px-8 py-3 bg-[#1A1A1A] text-white hover:bg-black transition-colors"
              >
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!order) return null;

  return (
    <>
      <Navbar /> {/* ✅ Konsistensi: Navbar */}
      <div className="min-h-screen bg-[#FDFCFA] py-8 pt-28 print:bg-white print:pt-0">
        <div className="max-w-4xl mx-auto px-4 print:px-0 print:max-w-full">
          {/* Tombol Kembali (Hidden saat print) */}
          <button
            onClick={() => router.push("/profile/orders")}
            className="mb-6 flex items-center text-[#6B7280] hover:text-[#1A1A1A] transition-colors font-medium group print:hidden"
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

          {/* Header Card */}
          <div className="bg-white shadow-md border border-[#E5E7EB] p-6 mb-6 print:shadow-none print:border-0 print:p-0 print:mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                  Detail Pesanan
                </h1>
                <p className="text-[#1A1A1A] font-medium">
                  Order #{order.orderNumber}
                </p>
                <p className="text-sm text-[#6B7280] mt-2">
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
                  className="px-6 py-3 border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors font-semibold flex items-center"
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
                      className="px-8 py-3 bg-[#1A1A1A] text-white hover:bg-black transition-colors font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Bayar Sekarang
                    </button>
                  )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status & Timeline (Hidden saat Print) */}
            <div className="bg-white shadow-md border border-[#E5E7EB] overflow-hidden print:hidden">
              <div className="bg-[#1A1A1A] px-6 py-4">
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

            <div className="bg-white shadow-md border border-[#E5E7EB] overflow-hidden print:hidden">
              <div className="bg-[#1A1A1A] px-6 py-4">
                <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
                  Riwayat Pesanan
                </h2>
              </div>
              <div className="p-6">
                <OrderTimeline order={order} />
              </div>
            </div>

            {/* Produk */}
            <div className="bg-white shadow-md border border-[#E5E7EB] overflow-hidden print:shadow-none print:border print:border-[#1A1A1A]">
              <div className="bg-[#1A1A1A] px-6 py-4 print:bg-white print:border-b print:border-[#1A1A1A]">
                <h2 className="text-lg font-semibold text-white uppercase tracking-wider print:text-[#1A1A1A] print:pl-0">
                  Produk Dipesan
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item, index) => {
                    // Konsistensi pengambilan data produk
                    const product = item.product || item.variant?.product;
                    const variant = item.variant;
                    return (
                      <div
                        key={index}
                        className="flex gap-4 pb-4 border-b border-[#E5E7EB] last:border-0 p-3 print:border-[#E5E7EB]"
                      >
                        <div className="w-20 h-20 bg-[#F9FAFB] shrink-0 overflow-hidden relative border border-[#E5E7EB] print:hidden">
                          {product?.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#E5E7EB] text-[#9CA3AF] text-xs">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#1A1A1A] mb-1">
                            {product?.name || "Product"}
                          </h4>
                          <p className="text-sm text-[#6B7280]">
                            Ukuran:{" "}
                            <span className="font-medium text-[#1A1A1A]">
                              {variant?.size || "-"}
                            </span>
                          </p>
                          <p className="text-sm text-[#6B7280]">
                            Jumlah:{" "}
                            <span className="font-medium text-[#1A1A1A]">
                              {item.quantity}x
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#1A1A1A] mb-1">
                            {formatCurrency(item.price)}
                          </p>
                          <p className="text-sm text-[#6B7280]">
                            Total:{" "}
                            <span className="font-bold text-[#1A1A1A]">
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

            {/* Pengiriman */}
            <div className="bg-white shadow-md border border-[#E5E7EB] overflow-hidden print:shadow-none print:border print:border-[#1A1A1A] print:mt-4">
              <div className="bg-[#1A1A1A] px-6 py-4 print:bg-white print:border-b print:border-[#1A1A1A]">
                <h2 className="text-lg font-semibold text-white uppercase tracking-wider print:text-[#1A1A1A] print:pl-0">
                  Informasi Pengiriman
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280] mb-1">
                      Penerima
                    </p>
                    <p className="font-semibold text-[#1A1A1A] text-lg">
                      {order.recipientName || order.shippingName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6B7280] mb-1">
                      Telepon
                    </p>
                    <p className="font-medium text-[#1A1A1A]">
                      {order.recipientPhone || order.shippingPhone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-[#6B7280] mb-1">
                      Alamat
                    </p>
                    <p className="text-[#1A1A1A]">
                      {order.shippingAddress}, {order.shippingCity}{" "}
                      {order.shippingPostalCode}
                    </p>
                  </div>
                  {(order.courierName || order.courierService) && (
                    <div className="md:col-span-2 pt-4 border-t border-[#E5E7EB] mt-2">
                      <p className="text-sm font-medium text-[#6B7280] mb-1">
                        Kurir
                      </p>
                      <p className="font-semibold text-[#1A1A1A] uppercase">
                        {order.courierName} - {order.courierService}
                      </p>
                      {order.trackingNumber && (
                        <div className="mt-2 print:hidden">
                          <a
                            href={`https://cekresi.com/?noresi=${order.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9FAFB] hover:bg-blue-50 border border-[#E5E7EB]"
                          >
                            <span className="font-mono font-bold text-[#1A1A1A]">
                              {order.trackingNumber}
                            </span>
                            <span className="text-xs text-blue-600">
                              Lacak ↗
                            </span>
                          </a>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <p className="hidden print:block font-mono font-bold mt-1">
                          {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ringkasan Biaya */}
            <div className="bg-white shadow-md border border-[#E5E7EB] overflow-hidden print:shadow-none print:border print:border-[#1A1A1A] print:mt-4 print:break-inside-avoid">
              <div className="bg-[#1A1A1A] px-6 py-4 print:bg-white print:border-b print:border-[#1A1A1A]">
                <h2 className="text-lg font-semibold text-white uppercase tracking-wider print:text-[#1A1A1A] print:pl-0">
                  Ringkasan Biaya
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-2 text-[#1A1A1A]">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Ongkir</span>
                    <span>{formatCurrency(order.shippingCost)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Diskon</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl pt-4 border-t border-[#E5E7EB] mt-2">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Invoice (Print Only) */}
            <div className="hidden print:block text-center mt-12 text-sm text-[#6B7280]">
              <p>Terima kasih telah berbelanja di Motiv Company</p>
              <p>www.motivcompany.com</p>
            </div>

            {/* Help (Screen Only) */}
            <div className="bg-[#1A1A1A] shadow-lg overflow-hidden text-white print:hidden">
              <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-2">Butuh Bantuan?</h2>
                <button
                  onClick={handleContactSupport}
                  className="px-8 py-3 bg-white text-[#1A1A1A] hover:bg-[#F9FAFB] transition-colors font-bold uppercase tracking-wider inline-flex items-center"
                >
                  <span className="mr-2">💬</span> Hubungi Customer Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
