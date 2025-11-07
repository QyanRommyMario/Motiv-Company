"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Alert from "@/components/ui/Alert";

export default function VouchersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchVouchers();
    }
  }, [status]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vouchers");
      const data = await response.json();

      if (data.success) {
        setVouchers(data.data);
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to fetch vouchers",
        });
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setAlert({ type: "error", message: "Failed to fetch vouchers" });
    } finally {
      setLoading(false);
    }
  };

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setAlert({
      type: "success",
      message: `Kode voucher ${code} berhasil disalin!`,
    });
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getDiscountText = (voucher) => {
    if (voucher.type === "PERCENTAGE") {
      let text = `${voucher.value}% OFF`;
      if (voucher.maxDiscount) {
        text += ` (Max Rp ${voucher.maxDiscount.toLocaleString("id-ID")})`;
      }
      return text;
    }
    return `Rp ${voucher.value.toLocaleString("id-ID")} OFF`;
  };

  const getDiscountTextSize = (text) => {
    // Dynamic font size based on text length
    if (text.length > 30) return "text-xl"; // Very long text
    if (text.length > 20) return "text-2xl"; // Long text
    return "text-3xl"; // Normal text
  };

  const getProgressPercentage = (used, quota) => {
    return Math.min((used / quota) * 100, 100);
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center pt-28">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading vouchers...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Voucher Diskon
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dapatkan diskon spesial untuk pembelian Anda
            </p>
          </div>

          {/* Alert */}
          {alert && (
            <div className="mb-8">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          {/* Vouchers Grid */}
          {vouchers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded p-16 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Belum Ada Voucher Tersedia
              </h2>
              <p className="text-gray-600">
                Voucher diskon akan muncul di sini. Cek kembali nanti!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vouchers.map((voucher) => {
                const progressPercentage = getProgressPercentage(
                  voucher.used,
                  voucher.quota
                );
                const almostFull = progressPercentage >= 80;
                const discountText = getDiscountText(voucher);
                const textSize = getDiscountTextSize(discountText);

                return (
                  <div
                    key={voucher.id}
                    className="bg-white border border-gray-200 rounded overflow-hidden hover:border-gray-900 transition-all duration-300 group flex flex-col"
                  >
                    {/* Voucher Header */}
                    <div className="bg-gray-900 p-6 text-white h-[200px] flex flex-col">
                      <div className="mb-4 h-[90px] flex flex-col justify-center">
                        <div
                          className={`${textSize} font-bold tracking-tight wrap-break-word leading-tight`}
                        >
                          {discountText}
                        </div>
                        <div className="text-sm text-gray-300 uppercase tracking-wider mt-2">
                          {voucher.type === "PERCENTAGE"
                            ? "Diskon Persentase"
                            : "Diskon Tetap"}
                        </div>
                      </div>

                      {/* Voucher Code */}
                      <div className="bg-white/10 rounded p-3 backdrop-blur-sm border border-white/20">
                        <div className="text-xs text-gray-300 mb-1 uppercase tracking-wider">
                          Kode Voucher
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="font-mono font-bold text-lg tracking-wider">
                            {voucher.code}
                          </div>
                          <button
                            onClick={() => copyVoucherCode(voucher.code)}
                            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
                          >
                            {copiedCode === voucher.code ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Voucher Details */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      {/* Minimum Purchase - Always show with fixed height */}
                      <div className="flex items-start gap-3 py-3 border-b border-gray-100 min-h-20">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                            Minimum Pembelian
                          </div>
                          <div className="font-semibold text-gray-900">
                            {voucher.minPurchase > 0
                              ? `Rp ${voucher.minPurchase.toLocaleString(
                                  "id-ID"
                                )}`
                              : "Tidak ada minimum"}
                          </div>
                        </div>
                      </div>

                      {/* Validity Period */}
                      <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                            Berlaku Sampai
                          </div>
                          <div className="font-semibold text-gray-900">
                            {formatDate(voucher.validUntil)}
                          </div>
                        </div>
                      </div>

                      {/* Quota Progress */}
                      <div className="py-3 flex-1">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500 uppercase tracking-wide">
                            Sisa Kuota
                          </span>
                          <span
                            className={`font-semibold ${
                              almostFull ? "text-red-600" : "text-gray-900"
                            }`}
                          >
                            {voucher.quota - voucher.used} / {voucher.quota}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              almostFull ? "bg-red-600" : "bg-gray-900"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        {almostFull && (
                          <div className="text-xs text-red-600 mt-2 font-medium">
                            Segera digunakan, kuota hampir habis!
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          copyVoucherCode(voucher.code);
                          setTimeout(() => router.push("/cart"), 500);
                        }}
                        className="w-full bg-gray-900 text-white py-3 rounded font-semibold hover:bg-black transition-colors uppercase tracking-wider text-sm mt-auto"
                      >
                        Gunakan Sekarang
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-16 border border-gray-200 rounded p-8">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg tracking-wide uppercase">
              Cara Menggunakan Voucher
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Pilih voucher yang ingin digunakan dan salin kode voucher</li>
              <li>Tambahkan produk ke keranjang belanja</li>
              <li>Di halaman checkout, masukkan kode voucher</li>
              <li>Klik "Gunakan" untuk mendapatkan diskon</li>
              <li>Selesaikan pembayaran dengan harga yang sudah didiskon</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
