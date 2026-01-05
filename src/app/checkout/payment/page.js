"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import Loading from "@/components/ui/Loading";
import Script from "next/script";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const t = useTranslations("payment");

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
      setVoucherError(t("enterVoucherCode"));
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
        setVoucherError(data.message || t("invalidVoucher"));
      }
    } catch (error) {
      setVoucherError(t("voucherApplyFailed"));
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
          throw new Error(data.message || t("orderCreateFailed"));
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
            alert(t("paymentFailed"));
            setProcessing(false);
          },
          onClose: () => setProcessing(false),
        });
      } else {
        alert(t("paymentNotReady"));
        setProcessing(false);
      }
    } catch (err) {
      alert(t("paymentProcessFailed") + ": " + err.message);
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

      <div className="min-h-screen bg-[#FDFCFA] py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              {t("title")}
            </h1>
            <p className="text-[#6B7280]">{t("subtitle")}</p>
          </div>

          {!existingSnapToken && <CheckoutSteps currentStep={3} />}

          <div className="bg-white border border-[#E5E7EB] shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              {t("orderSummary")}
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[#6B7280]">
                <span>{t("subtotal")}</span>
                <span>
                  Rp {checkoutData?.subtotal?.toLocaleString("id-ID") || 0}
                </span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>{t("shippingCost")}</span>
                <span>
                  Rp{" "}
                  {checkoutData?.shipping?.cost?.toLocaleString("id-ID") || 0}
                </span>
              </div>

              {!voucherApplied ? (
                <div className="border border-[#E5E7EB] p-4 bg-[#F9FAFB] my-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      placeholder={t("voucherCode")}
                      className="flex-1 px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none uppercase font-mono text-sm"
                      disabled={voucherLoading}
                    />
                    <button
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || !voucherCode.trim()}
                      className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-black text-sm"
                    >
                      {voucherLoading ? "..." : t("apply")}
                    </button>
                  </div>
                  {voucherError && (
                    <p className="text-xs text-red-600 mt-2">{voucherError}</p>
                  )}
                </div>
              ) : (
                <div className="flex justify-between text-green-700 font-medium my-2">
                  <span>
                    {t("voucherDiscount")} ({voucherCode})
                  </span>
                  <div className="flex items-center gap-2">
                    <span>- Rp {voucherDiscount.toLocaleString("id-ID")}</span>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-xs text-red-500 underline"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t-2 border-[#1A1A1A] pt-4 flex justify-between text-xl font-bold text-[#1A1A1A]">
                <span className="uppercase tracking-wide">
                  {t("totalPayment")}
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
                className={`flex-1 py-4 px-6 font-bold text-white transition-all uppercase tracking-wide relative min-h-14
                    ${
                      processing
                        ? "bg-[#9CA3AF] cursor-not-allowed"
                        : "bg-[#1A1A1A] hover:bg-black shadow-lg hover:shadow-xl"
                    }
                `}
              >
                {/* Invisible text to maintain width */}
                <span className={processing ? "invisible" : "visible"}>
                  {t("payNow")}
                </span>

                {/* Loading spinner overlay */}
                {processing && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                )}
              </button>

              <button
                onClick={() =>
                  router.push(
                    existingSnapToken ? "/profile/orders" : "/checkout"
                  )
                }
                disabled={processing}
                className="px-6 py-4 border-2 border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] font-semibold uppercase transition"
              >
                {t("back")}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-[#9CA3AF]">
              {t("securePayment")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
