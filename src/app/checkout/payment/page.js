"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Tambah useSearchParams
import { useSession } from "next-auth/react";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import Loading from "@/components/ui/Loading";
import Script from "next/script";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook untuk baca URL
  const { data: session, status } = useSession();

  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [existingSnapToken, setExistingSnapToken] = useState(null); // State token lama

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
      const orderIdFromUrl = searchParams.get("orderId");

      if (orderIdFromUrl) {
        // KASUS 1: Bayar Order Lama (Dari Riwayat Pesanan)
        fetchExistingOrder(orderIdFromUrl);
      } else {
        // KASUS 2: Checkout Baru (Dari Keranjang)
        loadCheckoutSession();
      }
    }
  }, [status, searchParams]);

  // Fungsi Load Data dari Session Storage (Checkout Baru)
  const loadCheckoutSession = () => {
    try {
      const data = sessionStorage.getItem("checkoutData");
      if (!data) {
        router.push("/checkout");
        return;
      }

      const parsedData = JSON.parse(data);
      setCheckoutData(parsedData);

      if (parsedData.voucherCode) {
        setVoucherCode(parsedData.voucherCode);
        setVoucherApplied(true);
        setVoucherDiscount(parsedData.discount || 0);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading session:", err);
      router.push("/checkout");
    }
  };

  // Fungsi Fetch Data dari API (Bayar Order Lama)
  const fetchExistingOrder = async (orderId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();

      if (!json.success) {
        alert("Gagal memuat pesanan: " + json.message);
        router.push("/profile/orders");
        return;
      }

      const order = json.data;

      // Format data agar sesuai tampilan UI
      const formattedData = {
        orderId: order.id, // ID Database
        orderNumber: order.orderNumber, // ID Pesanan (ORD-...)
        subtotal: order.subtotal,
        total: order.total,
        discount: order.discount,
        shipping: {
          cost: order.shippingCost,
          courier: order.courierName,
          service: order.courierService,
        },
        shippingAddress: {
          name: order.shippingName,
          phone: order.shippingPhone,
          address: order.shippingAddress,
          city: order.shippingCity,
          postalCode: order.shippingPostalCode,
        },
        // Jika order lama sudah punya token, simpan!
        snapToken: order.snapToken,
      };

      setCheckoutData(formattedData);
      setExistingSnapToken(order.snapToken); // Simpan token untuk dipakai langsung

      // Jika ada voucher
      if (order.voucherCode) {
        setVoucherCode(order.voucherCode);
        setVoucherApplied(true);
        setVoucherDiscount(order.discount);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Terjadi kesalahan saat memuat pesanan");
      router.push("/profile/orders");
    }
  };

  // ... (handleApplyVoucher dan handleRemoveVoucher biarkan sama) ...
  // Gunakan kode handleApplyVoucher & handleRemoveVoucher dari file Anda sebelumnya
  // Saya singkat disini agar tidak terlalu panjang, tapi pastikan TETAP ADA.
  const handleApplyVoucher = async () => {
    /* ... kode lama ... */
  };
  const handleRemoveVoucher = () => {
    /* ... kode lama ... */
  };

  const handleProcessPayment = async () => {
    setProcessing(true);

    try {
      let token = existingSnapToken;

      // Jika TIDAK ADA token lama (berarti ini Checkout Baru)
      // Kita perlu create order dulu ke Backend
      if (!token) {
        // Create order via API (Hanya untuk Checkout Baru)
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutData),
        });

        const data = await response.json();

        if (!data.success) {
          alert(data.message || "Gagal membuat order");
          setProcessing(false);
          return;
        }

        // Ambil token baru
        token = data.data.payment.snapToken;
      }

      // --- EKSEKUSI SNAP ---
      if (token && typeof window.snap !== "undefined") {
        window.snap.pay(token, {
          onSuccess: function (result) {
            sessionStorage.removeItem("checkoutData");
            // Redirect ke halaman sukses dengan ID Order
            const orderIdTarget = checkoutData.orderNumber || result.order_id;
            router.push(`/checkout/success?orderId=${orderIdTarget}`);
          },
          onPending: function (result) {
            sessionStorage.removeItem("checkoutData");
            const orderIdTarget = checkoutData.orderNumber || result.order_id;
            router.push(
              `/checkout/success?orderId=${orderIdTarget}&status=pending`
            );
          },
          onError: function (result) {
            console.error("Payment error:", result);
            alert("Pembayaran gagal. Silakan coba lagi.");
            setProcessing(false);
          },
          onClose: function () {
            console.log("Popup closed");
            setProcessing(false);
          },
        });
      } else {
        console.error("Snap Token missing or script not loaded");
        alert("Sistem pembayaran belum siap. Mohon refresh halaman.");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      alert("Gagal memproses pembayaran: " + err.message);
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
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ||
          "https://app.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
        onLoad={() => {
          console.log("✅ Snap Loaded");
          setSnapReady(true);
        }}
        onError={(e) => console.error("❌ Snap Failed", e)}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pembayaran
            </h1>
            <p className="text-gray-600">
              {existingSnapToken
                ? "Selesaikan pembayaran Anda"
                : "Konfirmasi dan lakukan pembayaran"}
            </p>
          </div>

          {/* Hanya tampilkan Steps jika Checkout Baru */}
          {!existingSnapToken && <CheckoutSteps currentStep={3} />}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ringkasan Pesanan
            </h2>

            {/* ... (Tampilan Ringkasan Harga - Biarkan Sama) ... */}
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
              {/* ... (Logic Voucher Tampilan) ... */}

              <div className="border-t-2 border-gray-900 pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span className="uppercase tracking-wide">Total</span>
                <span>
                  Rp {checkoutData?.total?.toLocaleString("id-ID") || 0}
                </span>
              </div>
            </div>

            {/* Info Pengiriman */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Informasi Pengiriman
              </h3>
              <div className="text-sm text-gray-700 space-y-1.5">
                <p className="font-semibold text-gray-900">
                  {checkoutData?.shippingAddress?.name}
                </p>
                <p>{checkoutData?.shippingAddress?.phone}</p>
                <p>{checkoutData?.shippingAddress?.address}</p>
                <p>
                  {checkoutData?.shippingAddress?.city},{" "}
                  {checkoutData?.shippingAddress?.postalCode}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleProcessPayment}
                // Button aktif jika Snap Ready
                disabled={processing || !snapReady}
                className="flex-1 px-6 py-4 bg-gray-900 text-white rounded hover:bg-black transition font-bold uppercase tracking-wider text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing
                  ? "Memproses..."
                  : !snapReady
                  ? "Memuat Pembayaran..."
                  : "Bayar Sekarang"}
              </button>

              {/* Jika order lama, tombol kembali ke Riwayat Order */}
              <button
                onClick={() =>
                  router.push(
                    existingSnapToken ? "/profile/orders" : "/checkout"
                  )
                }
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
