"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import AddressCard from "./AddressCard";
import Loading from "@/components/ui/Loading";

/**
 * AddressList Component
 * Display all user addresses with loading and empty states
 */

export default function AddressList({ onEdit, refresh }) {
  const t = useTranslations("address");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, [refresh]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/shipping/addresses");
      const data = await response.json();

      if (data.success) {
        setAddresses(data.data);
      } else {
        setError(data.message || t("loadError"));
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await fetch(`/api/shipping/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      const data = await response.json();
      if (data.success) {
        fetchAddresses(); // Refresh list
      } else {
        alert(data.message || t("setDefaultError"));
      }
    } catch (err) {
      console.error("Error setting default:", err);
      alert(t("setDefaultError"));
    }
  };

  const handleDelete = async (addressId) => {
    try {
      const response = await fetch(`/api/shipping/addresses/${addressId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchAddresses(); // Refresh list
      } else {
        alert(data.message || t("deleteError"));
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      alert(t("deleteError"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3">
        {error}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-[#9CA3AF] mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
          {t("noAddresses")}
        </h3>
        <p className="text-[#6B7280]">{t("noAddressesDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={onEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      ))}
    </div>
  );
}
