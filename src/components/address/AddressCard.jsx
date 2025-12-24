"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("address");
  const tCommon = useTranslations("common");
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
      className={`border p-6 transition-all ${
        address.isDefault
          ? "border-[#1A1A1A] bg-[#F9FAFB]"
          : "border-[#E5E7EB] bg-white hover:border-[#6B7280]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[#1A1A1A] tracking-wide">
            {address.label}
          </h3>
          {address.isDefault && (
            <span className="text-xs bg-[#1A1A1A] text-white px-2 py-1 uppercase tracking-wider font-semibold">
              {t("default")}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(address)}
            disabled={loading}
            className="text-sm text-[#6B7280] hover:text-[#1A1A1A] font-medium disabled:opacity-50 transition-colors"
          >
            {tCommon("edit")}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || address.isDefault}
            className="text-sm text-[#6B7280] hover:text-red-600 font-medium disabled:opacity-50 transition-colors"
            title={address.isDefault ? t("cannotDeleteDefault") : ""}
          >
            {deleteConfirm ? t("confirmDelete") : tCommon("delete")}
          </button>
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-1.5 text-sm text-[#6B7280] mb-5">
        <p className="font-semibold text-[#1A1A1A]">{address.name}</p>
        <p>{address.phone}</p>
        <p>{address.address}</p>
        <p>
          {address.city}, {address.province} {address.postalCode}
        </p>
      </div>

      {/* Actions */}
      {!address.isDefault && (
        <button
          onClick={handleSetDefault}
          disabled={loading}
          className="text-sm text-[#1A1A1A] hover:text-black font-semibold disabled:opacity-50 transition-colors uppercase tracking-wide"
        >
          {loading ? tCommon("processing") : t("makeDefault")}
        </button>
      )}

      {deleteConfirm && (
        <div className="mt-4 bg-[#F9FAFB] border border-[#E5E7EB] text-[#1A1A1A] px-4 py-3 text-xs font-medium">
          {t("deleteConfirmMessage")}
        </div>
      )}
    </div>
  );
}
