"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import Alert from "@/components/ui/Alert";

export default function EditVoucherPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minPurchase: "0",
    maxDiscount: "",
    quota: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  useEffect(() => {
    fetchVoucher();
  }, []);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/vouchers/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const voucher = data.data;
        setFormData({
          code: voucher.code,
          type: voucher.type,
          value: voucher.value.toString(),
          minPurchase: voucher.minPurchase.toString(),
          maxDiscount: voucher.maxDiscount
            ? voucher.maxDiscount.toString()
            : "",
          quota: voucher.quota.toString(),
          validFrom: formatDateTimeLocal(voucher.validFrom),
          validUntil: formatDateTimeLocal(voucher.validUntil),
          isActive: voucher.isActive,
        });
      } else {
        setAlert({ type: "error", message: "Voucher tidak ditemukan" });
        setTimeout(() => router.push("/admin/vouchers"), 2000);
      }
    } catch (error) {
      console.error("Error fetching voucher:", error);
      setAlert({ type: "error", message: "Gagal memuat data voucher" });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Validation
    if (
      !formData.code ||
      !formData.value ||
      !formData.quota ||
      !formData.validFrom ||
      !formData.validUntil
    ) {
      setAlert({
        type: "error",
        message: "Mohon lengkapi semua field yang wajib diisi",
      });
      return;
    }

    // Validate dates
    const validFrom = new Date(formData.validFrom);
    const validUntil = new Date(formData.validUntil);
    if (validFrom >= validUntil) {
      setAlert({
        type: "error",
        message: "Tanggal mulai harus sebelum tanggal berakhir",
      });
      return;
    }

    // Validate percentage value
    if (formData.type === "PERCENTAGE") {
      const value = parseFloat(formData.value);
      if (value < 0 || value > 100) {
        setAlert({
          type: "error",
          message: "Nilai persentase harus antara 0-100",
        });
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/vouchers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxDiscount: formData.maxDiscount
            ? parseFloat(formData.maxDiscount)
            : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: "success", message: "Voucher berhasil diperbarui!" });
        setTimeout(() => {
          router.push("/admin/vouchers");
        }, 1500);
      } else {
        setAlert({
          type: "error",
          message: data.error || "Gagal memperbarui voucher",
        });
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      setAlert({
        type: "error",
        message: "Terjadi kesalahan saat memperbarui voucher",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
          <p className="ml-3 text-gray-600">Loading voucher...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-coffee-600 hover:text-coffee-700 mb-4 flex items-center"
          >
            <span className="mr-2">←</span> Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Voucher</h1>
          <p className="text-gray-600 mt-1">Perbarui informasi voucher</p>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 space-y-6"
        >
          {/* Kode Voucher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode Voucher <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="PROMO2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent uppercase"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Kode akan otomatis diubah menjadi huruf kapital
            </p>
          </div>

          {/* Tipe Voucher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Voucher <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              required
            >
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="FIXED">Fixed Amount (Rp)</option>
            </select>
          </div>

          {/* Nilai Diskon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nilai Diskon <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder={formData.type === "PERCENTAGE" ? "10" : "50000"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                min="0"
                step={formData.type === "PERCENTAGE" ? "0.01" : "1000"}
                required
              />
              <span className="absolute right-3 top-2 text-gray-500">
                {formData.type === "PERCENTAGE" ? "%" : "Rp"}
              </span>
            </div>
            {formData.type === "PERCENTAGE" && (
              <p className="text-xs text-gray-500 mt-1">
                Nilai persentase antara 0-100
              </p>
            )}
          </div>

          {/* Max Discount (only for percentage) */}
          {formData.type === "PERCENTAGE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimal Diskon (Rp)
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleChange}
                placeholder="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                min="0"
                step="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opsional: Batasi maksimal nominal diskon
              </p>
            </div>
          )}

          {/* Minimum Purchase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Pembelian (Rp)
            </label>
            <input
              type="number"
              name="minPurchase"
              value={formData.minPurchase}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              min="0"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimal 0 (tidak ada minimum)
            </p>
          </div>

          {/* Quota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kuota Penggunaan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quota"
              value={formData.quota}
              onChange={handleChange}
              placeholder="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Jumlah maksimal voucher dapat digunakan
            </p>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berlaku Dari <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berlaku Sampai <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-coffee-600 focus:ring-coffee-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Voucher aktif
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
