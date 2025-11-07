"use client";

import { useState } from "react";

/**
 * AddressCard Component
 * Display single address with actions (edit, delete, set default)
 */

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleSetDefault = async () => {
    setLoading(true);
    try {
      await onSetDefault(address.id);
    } catch (err) {
      console.error("Error setting default:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000); // Reset after 3s
      return;
    }

    setLoading(true);
    try {
      await onDelete(address.id);
    } catch (err) {
      console.error("Error deleting address:", err);
      setLoading(false);
    }
  };

  return (
    <div
      className={`border rounded p-6 transition-all ${
        address.isDefault
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 bg-white hover:border-gray-400"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 tracking-wide">
            {address.label}
          </h3>
          {address.isDefault && (
            <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded uppercase tracking-wider font-semibold">
              Default
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(address)}
            disabled={loading}
            className="text-sm text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || address.isDefault}
            className="text-sm text-gray-700 hover:text-red-600 font-medium disabled:opacity-50 transition-colors"
            title={
              address.isDefault ? "Tidak dapat menghapus alamat default" : ""
            }
          >
            {deleteConfirm ? "Yakin?" : "Hapus"}
          </button>
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-1.5 text-sm text-gray-700 mb-5">
        <p className="font-semibold text-gray-900">{address.name}</p>
        <p className="text-gray-600">{address.phone}</p>
        <p className="text-gray-600">{address.address}</p>
        <p className="text-gray-600">
          {address.city}, {address.province} {address.postalCode}
        </p>
      </div>

      {/* Actions */}
      {!address.isDefault && (
        <button
          onClick={handleSetDefault}
          disabled={loading}
          className="text-sm text-gray-900 hover:text-black font-semibold disabled:opacity-50 transition-colors uppercase tracking-wide"
        >
          {loading ? "Memproses..." : "Jadikan Alamat Utama"}
        </button>
      )}

      {deleteConfirm && (
        <div className="mt-4 bg-gray-100 border border-gray-300 text-gray-900 px-4 py-3 rounded text-xs font-medium">
          Klik "Hapus" sekali lagi untuk konfirmasi penghapusan
        </div>
      )}
    </div>
  );
}
