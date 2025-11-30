"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import Loading from "@/components/ui/Loading";
import Script from "next/script";

/**
 * Payment Page
 * Integrates with Midtrans Snap for payment processing
 */

export default function PaymentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout/payment");
      return;
    }

    if (status === "authenticated") {
      loadCheckoutData();
    }
  }, [status]);

  const loadCheckoutData = () => {
    try {
      const data = sessionStorage.getItem("checkoutData");
      if (!data) {
        router.push("/checkout");
        return;
      }

      const parsedData = JSON.parse(data);
      setCheckoutData(parsedData);

      // Load voucher if already applied
      if (parsedData.voucherCode) {
        setVoucherCode(parsedData.voucherCode);
        setVoucherApplied(true);
        setVoucherDiscount(parsedData.discount || 0);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading checkout data:", err);
      router.push("/checkout");
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Mohon masukkan kode voucher");
      return;
    }

    setVoucherLoading(true);
    setVoucherError("");

    try {
      const subtotal = checkoutData?.subtotal || 0;

      const response = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: voucherCode,
          subtotal: subtotal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const discount = data.data.discount;
        const newTotal =
          subtotal + (checkoutData?.shipping?.cost || 0) - discount;

        // Update checkout data
        const updatedCheckoutData = {
          ...checkoutData,
          voucherCode: voucherCode.toUpperCase(),
          discount: discount,
          total: newTotal,
        };

        setCheckoutData(updatedCheckoutData);
        sessionStorage.setItem(
          "checkoutData",
          JSON.stringify(updatedCheckoutData)
        );

        setVoucherApplied(true);
        setVoucherDiscount(discount);
        setVoucherError("");
      } else {
        setVoucherError(data.message || "Voucher tidak valid");
      }
    } catch (error) {
      console.error("Error applying voucher:", error);
      setVoucherError("Gagal menerapkan voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    const subtotal = checkoutData?.subtotal || 0;
    const newTotal = subtotal + (checkoutData?.shipping?.cost || 0);

    const updatedCheckoutData = {
      ...checkoutData,
      voucherCode: null,
      discount: 0,
      total: newTotal,
    };

    setCheckoutData(updatedCheckoutData);
    sessionStorage.setItem("checkoutData", JSON.stringify(updatedCheckoutData));

    setVoucherCode("");
    setVoucherApplied(false);
    setVoucherDiscount(0);
    setVoucherError("");
  };

  const handleProcessPayment = async () => {
    setProcessing(true);

    try {
      // Create order via API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Gagal membuat order");
        setProcessing(false);
        return;
      }

      // Check if Midtrans Snap is available
      if (data.data.payment.snapToken && typeof window.snap !== "undefined") {
        // Open Midtrans Snap payment page
        window.snap.pay(data.data.payment.snapToken, {
          onSuccess: function (result) {
            console.log("Payment success:", result);
            // Clear checkout data
            sessionStorage.removeItem("checkoutData");
            // Redirect to success page
            router.push(
              `/checkout/success?orderId=${data.data.order.orderNumber}`
            );
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            // Clear checkout data
            sessionStorage.removeItem("checkoutData");
            // Redirect to pending page
            router.push(
              `/checkout/success?orderId=${data.data.order.orderNumber}&status=pending`
            );
          },
          onError: function (result) {
            console.error("Payment error:", result);
            alert("Pembayaran gagal. Silakan coba lagi.");
            setProcessing(false);
          },
          onClose: function () {
            console.log("Payment popup closed");
            setProcessing(false);
          },
        });
      } else {
        console.error("Midtrans Snap not loaded properly or Token missing");
        alert(
          "Gagal memuat modul pembayaran. Pastikan koneksi lancar dan coba refresh halaman."
        );
        setProcessing(false);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      alert("Gagal memproses pembayaran. Silakan coba lagi.");
      setProcessing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Load Midtrans Snap.js dengan Error Handling */}
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ||
          "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
        onLoad={() => {
          console.log("✅ Midtrans Snap script loaded!");
          setSnapReady(true);
        }}
        onError={(e) => {
          console.error("❌ Failed to load Midtrans Snap script", e);
          alert("Gagal memuat sistem pembayaran. Mohon refresh halaman.");
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pembayaran
            </h1>
            <p className="text-gray-600">Konfirmasi dan lakukan pembayaran</p>
          </div>

          {/* Checkout Steps */}
          <CheckoutSteps currentStep={3} />

          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Order Summary */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>
                  Rp {checkoutData?.subtotal?.toLocaleString("id-ID") || 0}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Ongkos Kirim</span>
                <span>
                  Rp{" "}
                  {checkoutData?.shipping?.cost?.toLocaleString("id-ID") || 0}
                </span>
              </div>

              {/* Voucher Section */}
              {!voucherApplied ? (
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Punya kode voucher?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      placeholder="Masukkan kode voucher"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 uppercase font-mono font-semibold text-gray-900 bg-white placeholder-gray-400"
                      disabled={voucherLoading}
                    />
                    <button
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || !voucherCode.trim()}
                      className="px-6 py-3 bg-gray-900 text-white rounded hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap font-semibold uppercase tracking-wide text-sm"
                    >
                      {voucherLoading ? "Memeriksa..." : "Gunakan"}
                    </button>
                  </div>
                  {voucherError && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      {voucherError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center bg-gray-50 border-2 border-gray-900 rounded p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Voucher "{voucherCode}" diterapkan
                      </span>
                      <span className="text-lg">✓</span>
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">
                      Hemat Rp {voucherDiscount.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-xs text-gray-700 hover:text-red-600 font-semibold uppercase tracking-wide"
                  >
                    Hapus
                  </button>
                </div>
              )}

              {voucherApplied && (
                <div className="flex justify-between text-gray-900 font-semibold">
                  <span>Diskon Voucher</span>
                  <span>- Rp {voucherDiscount.toLocaleString("id-ID")}</span>
                </div>
              )}

              <div className="border-t-2 border-gray-900 pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span className="uppercase tracking-wide">Total</span>
                <span>
                  Rp {checkoutData?.total?.toLocaleString("id-ID") || 0}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Informasi Pengiriman
              </h3>
              <div className="text-sm text-gray-700 space-y-1.5">
                <p className="font-semibold text-gray-900">
                  {checkoutData?.shippingAddress?.name}
                </p>
                <p className="text-gray-600">
                  {checkoutData?.shippingAddress?.phone}
                </p>
                <p className="text-gray-600">
                  {checkoutData?.shippingAddress?.address}
                </p>
                <p className="text-gray-600">
                  {checkoutData?.shippingAddress?.city},{" "}
                  {checkoutData?.shippingAddress?.province}{" "}
                  {checkoutData?.shippingAddress?.postalCode}
                </p>
                <p className="text-gray-900 font-semibold mt-3 uppercase tracking-wide text-xs">
                  {checkoutData?.shipping?.courier} -{" "}
                  {checkoutData?.shipping?.service}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleProcessPayment}
                disabled={processing || !snapReady}
                className="flex-1 px-6 py-4 bg-gray-900 text-white rounded hover:bg-black transition font-bold uppercase tracking-wider text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing
                  ? "Memproses..."
                  : !snapReady
                  ? "Memuat Pembayaran..."
                  : "Bayar Sekarang"}
              </button>
              <button
                onClick={() => router.push("/checkout")}
                disabled={processing}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded hover:border-gray-900 hover:bg-gray-50 transition font-semibold uppercase tracking-wide text-sm disabled:opacity-50"
              >
                Kembali
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-600">
              <p className="font-bold text-gray-900 mb-2 uppercase tracking-wide">
                Transaksi Aman
              </p>
              <p>
                Pembayaran diproses oleh Midtrans, payment gateway terpercaya di
                Indonesia. Data pembayaran Anda dilindungi dengan enkripsi SSL
                256-bit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
