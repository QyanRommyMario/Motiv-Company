"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * AddressSelector Component
 * Allows user to select/create shipping address during checkout
 */

export default function AddressSelector({ onSelectAddress }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/shipping/addresses");
      const data = await response.json();

      if (data.success) {
        setAddresses(data.data);

        // Auto-select default address
        const defaultAddr = data.data.find((addr) => addr.isDefault);
        if (defaultAddr) {
          setSelectedId(defaultAddr.id);
          onSelectAddress(defaultAddr);
        } else if (data.data.length > 0) {
          setSelectedId(data.data[0].id);
          onSelectAddress(data.data[0]);
        }
      }
    } catch (err) {
      setError("Gagal memuat alamat");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (address) => {
    setSelectedId(address.id);
    onSelectAddress(address);
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
      }
    } catch (err) {
      console.error("Error setting default:", err);
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">Memuat alamat...</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
        <h3 className="text-lg font-semibold mb-2">Belum Ada Alamat</h3>
        <p className="text-gray-600 mb-4">
          Anda belum memiliki alamat pengiriman. Tambahkan alamat untuk
          melanjutkan checkout.
        </p>
        <button
          onClick={() => router.push("/profile/addresses?action=add")}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Tambah Alamat
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {addresses.map((address) => (
        <div
          key={address.id}
          className={`border rounded-lg p-4 cursor-pointer transition ${
            selectedId === address.id
              ? "border-gray-900 bg-gray-100"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onClick={() => handleSelect(address)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  checked={selectedId === address.id}
                  onChange={() => handleSelect(address)}
                  className="w-4 h-4 text-gray-900"
                />
                <span className="font-semibold text-gray-900">
                  {address.label}
                </span>
                {address.isDefault && (
                  <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>

              <div className="ml-6 text-sm text-gray-700">
                <p className="font-medium">{address.name}</p>
                <p>{address.phone}</p>
                <p className="mt-1">{address.address}</p>
                <p>
                  {address.city}, {address.province} {address.postalCode}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              {!address.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault(address.id);
                  }}
                  className="text-xs text-gray-900 hover:text-gray-700 underline"
                >
                  Jadikan Default
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/profile/addresses?edit=${address.id}`);
                }}
                className="text-xs text-gray-600 hover:text-gray-700 underline"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() =>
          router.push("/profile/addresses?action=add&returnTo=/checkout")
        }
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition flex items-center justify-center gap-2"
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
        Tambah Alamat Baru
      </button>
    </div>
  );
}
