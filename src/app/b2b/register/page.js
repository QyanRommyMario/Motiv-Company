"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Alert from "@/components/ui/Alert";

export default function B2BRegistrationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingRequest, setExistingRequest] = useState(null);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/b2b/register");
      return;
    }

    if (status === "authenticated") {
      checkExistingRequest();
    }
  }, [status]);

  const checkExistingRequest = async () => {
    try {
      setCheckingStatus(true);
      const response = await fetch("/api/b2b/request");
      const data = await response.json();

      if (data.success && data.data) {
        setExistingRequest(data.data);
      }
    } catch (error) {
      console.error("Error checking B2B request:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Validation
    if (!formData.businessName || !formData.phone || !formData.address) {
      setAlert({ type: "error", message: "Mohon lengkapi semua field" });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/b2b/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setAlert({
          type: "success",
          message: "Pengajuan B2B berhasil dikirim!",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setAlert({
          type: "error",
          message: data.error || "Gagal mengirim pengajuan",
        });
      }
    } catch (error) {
      console.error("Error submitting B2B request:", error);
      setAlert({
        type: "error",
        message: "Terjadi kesalahan saat mengirim pengajuan",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || checkingStatus) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#FDFCFA] flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A]"></div>
            <p className="mt-4 text-[#6B7280]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is already B2B
  if (session?.user?.role === "B2B") {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#FDFCFA] py-12 px-4 sm:px-6 lg:px-8 pt-28">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-[#E5E7EB] p-8">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                Anda Sudah B2B Customer
              </h2>
              <p className="text-[#6B7280] mb-6">
                Anda sudah memiliki akses B2B dengan diskon khusus.
              </p>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-4 mb-6">
                <p className="text-[#1A1A1A] font-semibold">
                  Diskon Anda: {session.user.discount || 0}%
                </p>
              </div>
              <button
                onClick={() => router.push("/products")}
                className="bg-[#1A1A1A] text-white px-6 py-3 hover:bg-black transition-colors"
              >
                Mulai Belanja
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has existing request
  if (existingRequest) {
    const statusColors = {
      PENDING: {
        bg: "bg-[#F9FAFB]",
        text: "text-[#1A1A1A]",
        border: "border-[#E5E7EB]",
      },
      APPROVED: {
        bg: "bg-[#F9FAFB]",
        text: "text-[#1A1A1A]",
        border: "border-[#E5E7EB]",
      },
      REJECTED: {
        bg: "bg-[#F9FAFB]",
        text: "text-[#1A1A1A]",
        border: "border-[#E5E7EB]",
      },
    };

    const statusMessages = {
      PENDING: {
        title: "Pengajuan Sedang Diproses",
        message:
          "Pengajuan B2B Anda sedang ditinjau oleh admin. Kami akan menghubungi Anda segera.",
      },
      APPROVED: {
        title: "Pengajuan Disetujui",
        message:
          "Selamat! Pengajuan B2B Anda telah disetujui. Silakan refresh halaman untuk mengaktifkan akun B2B Anda.",
      },
      REJECTED: {
        title: "Pengajuan Ditolak",
        message:
          "Maaf, pengajuan B2B Anda tidak dapat disetujui. Silakan hubungi admin untuk informasi lebih lanjut.",
      },
    };

    const colors = statusColors[existingRequest.status];
    const statusInfo = statusMessages[existingRequest.status];

    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#FDFCFA] py-12 px-4 sm:px-6 lg:px-8 pt-28">
          <div className="max-w-2xl mx-auto">
            <div className={`bg-white ${colors.border} border p-8`}>
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${colors.text} mb-2`}>
                  {statusInfo.title}
                </h2>
                <p className="text-[#6B7280]">{statusInfo.message}</p>
              </div>

              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-6 space-y-3">
                <h3 className="font-semibold text-[#1A1A1A] mb-3">
                  Detail Pengajuan
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Nama Bisnis:</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {existingRequest.businessName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Telepon:</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {existingRequest.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Status:</span>
                    <span className={`font-medium ${colors.text}`}>
                      {existingRequest.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Tanggal Pengajuan:</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {new Date(existingRequest.createdAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {existingRequest.status === "APPROVED" && (
                <div className="mt-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-[#1A1A1A] text-white px-6 py-3 hover:bg-black transition-colors"
                  >
                    Refresh Halaman
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-[#FDFCFA] py-12 px-4 sm:px-6 lg:px-8 pt-28">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Daftar B2B Customer
            </h1>
            <p className="text-[#6B7280]">
              Dapatkan harga khusus dan keuntungan lebih untuk bisnis Anda
            </p>
          </div>

          {/* Alert */}
          {alert && (
            <div className="mb-6">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#E5E7EB] p-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Nama Bisnis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="PT. Contoh Bisnis Indonesia"
                className="w-full px-4 py-3 border-2 border-[#E5E7EB] focus:ring-2 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] bg-white text-[#1A1A1A]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full px-4 py-3 border-2 border-[#E5E7EB] focus:ring-2 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] bg-white text-[#1A1A1A]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Alamat Bisnis <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Jl. Contoh No. 123, Jakarta"
                rows="3"
                className="w-full px-4 py-3 border-2 border-[#E5E7EB] focus:ring-2 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] bg-white text-[#1A1A1A]"
                required
              ></textarea>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-4 text-sm text-[#6B7280]">
              <p className="font-medium text-[#1A1A1A] mb-1">
                Proses Verifikasi
              </p>
              <p>
                Setelah mengirim pengajuan, tim kami akan meninjau data Anda
                dalam 1-2 hari kerja. Anda akan menerima notifikasi melalui
                email setelah verifikasi selesai.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] text-white py-3 px-6 font-medium hover:bg-black transition-colors disabled:bg-[#9CA3AF] disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
