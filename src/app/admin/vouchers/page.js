"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import Alert from "@/components/ui/Alert";

export default function AdminVouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    code: "",
  });

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, [search, typeFilter, statusFilter]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("isActive", statusFilter);

      const response = await fetch(`/api/admin/vouchers?${params}`);
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

  const handleToggleActive = async (id) => {
    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: "success", message: data.message });
        fetchVouchers();
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to toggle voucher status",
        });
      }
    } catch (error) {
      console.error("Error toggling voucher:", error);
      setAlert({ type: "error", message: "Failed to toggle voucher status" });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/vouchers/${deleteModal.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: "success", message: "Voucher berhasil dihapus" });
        setDeleteModal({ show: false, id: null, code: "" });
        fetchVouchers();
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to delete voucher",
        });
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
      setAlert({ type: "error", message: "Failed to delete voucher" });
    }
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const isUpcoming = (validFrom) => {
    return new Date(validFrom) > new Date();
  };

  const getVoucherStatus = (voucher) => {
    if (!voucher.isActive)
      return { text: "Nonaktif", color: "bg-gray-100 text-gray-800" };
    if (isExpired(voucher.validUntil))
      return { text: "Expired", color: "bg-red-100 text-red-800" };
    if (isUpcoming(voucher.validFrom))
      return { text: "Upcoming", color: "bg-blue-100 text-blue-800" };
    if (voucher.used >= voucher.quota)
      return { text: "Habis", color: "bg-orange-100 text-orange-800" };
    return { text: "Aktif", color: "bg-green-100 text-green-800" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatValue = (type, value, maxDiscount) => {
    if (type === "PERCENTAGE") {
      let text = `${value}%`;
      if (maxDiscount) {
        text += ` (Max Rp ${maxDiscount.toLocaleString("id-ID")})`;
      }
      return text;
    }
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              Manajemen Voucher & Offers
            </h1>
            <p className="text-[#6B7280] mt-2">
              Kelola voucher diskon untuk pelanggan B2C dan B2B - Total:{" "}
              {vouchers.length} voucher
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/vouchers/create")}
            className="px-6 py-3 bg-[#1A1A1A] text-white hover:bg-black transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Voucher
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-[#EFF6FF] border-l-4 border-[#3B82F6] p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-[#1E40AF] flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-bold text-[#1E40AF] mb-1">
                Tentang Voucher & Offers
              </h3>
              <p className="text-sm text-[#1E40AF]">
                Voucher adalah kode diskon yang dapat digunakan pelanggan saat
                checkout. Anda dapat membuat voucher untuk B2C (retail) atau B2B
                (business) dengan tipe persentase atau fixed amount. Pastikan
                mengatur periode dan kuota penggunaan dengan tepat.
              </p>
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Filters */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Cari Kode Voucher
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Masukkan kode voucher..."
                className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Tipe Diskon
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] font-medium bg-white"
              >
                <option value="">Semua Tipe</option>
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Fixed Amount (Rp)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Status Voucher
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] font-medium bg-white"
              >
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vouchers Table */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E5E7EB] border-t-[#1A1A1A]"></div>
              <p className="mt-4 text-[#6B7280] font-medium">
                Loading vouchers...
              </p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <p className="text-[#6B7280] font-medium">Tidak ada voucher</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-[#E5E7EB]">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Kode Voucher
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Tipe Diskon
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Nilai Diskon
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Min. Pembelian
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Kuota
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Periode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E5E7EB]">
                  {vouchers.map((voucher) => {
                    const status = getVoucherStatus(voucher);
                    return (
                      <tr
                        key={voucher.id}
                        className="hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-[#1A1A1A] font-mono tracking-wider">
                            {voucher.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              voucher.type === "PERCENTAGE"
                                ? "bg-[#DBEAFE] text-[#1E40AF]"
                                : "bg-[#F3E8FF] text-[#7C3AED]"
                            }`}
                          >
                            {voucher.type === "PERCENTAGE"
                              ? "Persentase"
                              : "Fixed"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1A1A1A]">
                          {formatValue(
                            voucher.type,
                            voucher.value,
                            voucher.maxDiscount
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1A1A1A]">
                          Rp {voucher.minPurchase.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[#1A1A1A] mb-1">
                            {voucher.used} / {voucher.quota}
                          </div>
                          <div className="w-full bg-[#E5E7EB] h-2">
                            <div
                              className="bg-[#1A1A1A] h-2"
                              style={{
                                width: `${Math.min(
                                  (voucher.used / voucher.quota) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-semibold text-[#1A1A1A]">
                            {formatDate(voucher.validFrom)}
                          </div>
                          <div className="text-[#6B7280]">
                            s/d {formatDate(voucher.validUntil)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/vouchers/${voucher.id}/edit`
                                )
                              }
                              className="p-2 text-[#1A1A1A] hover:bg-[#E5E7EB] transition-colors"
                              title="Edit"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleActive(voucher.id)}
                              className={`p-2 transition-colors ${
                                voucher.isActive
                                  ? "text-[#EAB308] hover:bg-[#FEF3C7]"
                                  : "text-[#16A34A] hover:bg-[#DCFCE7]"
                              }`}
                              title={
                                voucher.isActive ? "Nonaktifkan" : "Aktifkan"
                              }
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {voucher.isActive ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                )}
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModal({
                                  show: true,
                                  id: voucher.id,
                                  code: voucher.code,
                                })
                              }
                              className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                              title="Hapus"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 border-4 border-[#1A1A1A]">
            <div className="text-center mb-6">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-[#DC2626]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                Hapus Voucher?
              </h3>
              <p className="text-[#6B7280] mb-2">
                Apakah Anda yakin ingin menghapus voucher{" "}
                <strong className="text-[#1A1A1A] font-mono tracking-wider">
                  {deleteModal.code}
                </strong>
                ?
              </p>
              <p className="text-sm text-[#DC2626] font-semibold mt-3 bg-[#FEE2E2] py-2 px-4 border border-[#DC2626]">
                Tindakan ini tidak dapat dibatalkan!
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ show: false, id: null, code: "" })
                }
                className="flex-1 px-6 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
