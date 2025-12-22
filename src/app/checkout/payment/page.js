"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import Loading from "@/components/ui/Loading";
import Script from "next/script";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Midtrans State
  const [snapReady, setSnapReady] = useState(false);
  const [existingSnapToken, setExistingSnapToken] = useState(null);

  // Voucher State
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
        fetchExistingOrder(orderIdFromUrl);
      } else {
        loadCheckoutSession();
      }
    }
  }, [status, searchParams]);

  const loadCheckoutSession = async () => {
    try {
      const data = sessionStorage.getItem("checkoutData");
      if (!data) {
        router.push("/checkout");
        return;
      }
      const parsedData = JSON.parse(data);

      if (parsedData.shippingAddressId && !parsedData.shippingAddress) {
        try {
          const res = await fetch(
            `/api/shipping/addresses/${parsedData.shippingAddressId}`
          );
          const json = await res.json();
          if (json.success && json.data) {
            parsedData.shippingAddress = json.data;
            sessionStorage.setItem("checkoutData", JSON.stringify(parsedData));
          } else {
            router.push("/checkout");
            return;
          }
        } catch (e) {
          router.push("/checkout");
          return;
        }
      } else if (!parsedData.shippingAddressId) {
        router.push("/checkout");
        return;
      }

      setCheckoutData(parsedData);
      if (parsedData.voucherCode) {
        setVoucherCode(parsedData.voucherCode);
        setVoucherApplied(true);
        setVoucherDiscount(parsedData.discount || 0);
      }
      setLoading(false);
    } catch (err) {
      router.push("/checkout");
    }
  };

  const fetchExistingOrder = async (orderId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();

      if (!json.success) {
        router.push("/profile/orders");
        return;
      }

      const order = json.data;

      setCheckoutData({
        orderId: order.id,
        orderNumber: order.orderNumber,
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
        snapToken: order.snapToken,
      });
      setExistingSnapToken(order.snapToken);

      if (order.voucherCode) {
        setVoucherCode(order.voucherCode);
        setVoucherApplied(true);
        setVoucherDiscount(order.discount);
      }
      setLoading(false);
    } catch (error) {
      router.push("/profile/orders");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode, subtotal: subtotal }),
      });
      const data = await response.json();
      if (data.success) {
        const discount = data.data.discount;
        const newTotal =
          subtotal + (checkoutData?.shipping?.cost || 0) - discount;
        const updated = {
          ...checkoutData,
          voucherCode: voucherCode.toUpperCase(),
          discount: discount,
          total: newTotal,
        };
        setCheckoutData(updated);
        sessionStorage.setItem("checkoutData", JSON.stringify(updated));
        setVoucherApplied(true);
        setVoucherDiscount(discount);
        setVoucherError("");
      } else {
        setVoucherError(data.message || "Voucher tidak valid");
      }
    } catch (error) {
      setVoucherError("Gagal menerapkan voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    const subtotal = checkoutData?.subtotal || 0;
    const newTotal = subtotal + (checkoutData?.shipping?.cost || 0);
    const updated = {
      ...checkoutData,
      voucherCode: null,
      discount: 0,
      total: newTotal,
    };
    setCheckoutData(updated);
    sessionStorage.setItem("checkoutData", JSON.stringify(updated));
    setVoucherCode("");
    setVoucherApplied(false);
    setVoucherDiscount(0);
    setVoucherError("");
  };

  const handleProcessPayment = async () => {
    setProcessing(true);

    try {
      let token = existingSnapToken;

      if (!token) {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...checkoutData,
            paymentMethod: "MIDTRANS",
          }),
        });

        const data = await response.json();
        if (!data.success)
          throw new Error(data.message || "Gagal membuat order");
        token = data.data.payment.token;
      }

      if (token && window.snap) {
        window.snap.pay(token, {
          onSuccess: (result) => {
            sessionStorage.removeItem("checkoutData");
            const target = checkoutData.orderNumber || result.order_id;
            router.push(`/checkout/success?orderId=${target}`);
          },
          onPending: (result) => {
            sessionStorage.removeItem("checkoutData");
            const target = checkoutData.orderNumber || result.order_id;
            router.push(`/checkout/success?orderId=${target}&status=pending`);
          },
          onError: () => {
            alert("Pembayaran gagal/dibatalkan");
            setProcessing(false);
          },
          onClose: () => setProcessing(false),
        });
      } else {
        alert("Sistem pembayaran belum siap. Coba refresh halaman.");
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
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
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
        onLoad={() => setSnapReady(true)}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pembayaran
            </h1>
            <p className="text-gray-600">
              Selesaikan pesanan Anda melalui Midtrans Payment Gateway
            </p>
          </div>

          {!existingSnapToken && <CheckoutSteps currentStep={3} />}

          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
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

              {!voucherApplied ? (
                <div className="border border-gray-200 rounded p-4 bg-gray-50 my-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      placeholder="Kode Voucher"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded uppercase font-mono text-sm"
                      disabled={voucherLoading}
                    />
                    <button
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || !voucherCode.trim()}
                      className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black text-sm"
                    >
                      {voucherLoading ? "..." : "Gunakan"}
                    </button>
                  </div>
                  {voucherError && (
                    <p className="text-xs text-red-600 mt-2">{voucherError}</p>
                  )}
                </div>
              ) : (
                <div className="flex justify-between text-green-700 font-medium my-2">
                  <span>Diskon Voucher ({voucherCode})</span>
                  <div className="flex items-center gap-2">
                    <span>- Rp {voucherDiscount.toLocaleString("id-ID")}</span>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-xs text-red-500 underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t-2 border-gray-900 pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span className="uppercase tracking-wide">
                  Total Pembayaran
                </span>
                <span>
                  Rp {checkoutData?.total?.toLocaleString("id-ID") || 0}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleProcessPayment}
                disabled={processing || !snapReady}
                className={`flex-1 py-4 px-6 rounded-lg font-bold text-white transition-all uppercase tracking-wide
                    ${
                      processing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-900 hover:bg-black shadow-lg hover:shadow-xl"
                    }
                `}
              >
                {processing ? "Memproses..." : "Bayar Sekarang"}
              </button>

              <button
                onClick={() =>
                  router.push(
                    existingSnapToken ? "/profile/orders" : "/checkout"
                  )
                }
                disabled={processing}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold uppercase transition"
              >
                Kembali
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Pembayaran aman & terenkripsi oleh Midtrans Payment Gateway
              (Sandbox Mode).
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
