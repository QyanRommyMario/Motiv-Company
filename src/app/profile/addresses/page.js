"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import AddressList from "@/components/address/AddressList";
import AddressForm from "@/components/address/AddressForm";
import Loading from "@/components/ui/Loading";

/**
 * Address Management Page
 * Allows users to view, create, edit, and delete shipping addresses
 */

export default function AddressesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile/addresses");
      return;
    }

    // Check if should show add form from URL
    const action = searchParams.get("action");
    const editId = searchParams.get("edit");

    if (action === "add") {
      setShowForm(true);
    } else if (editId) {
      fetchAndEditAddress(editId);
    }
  }, [status, searchParams]);

  const fetchAndEditAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/shipping/addresses/${addressId}`);
      const data = await response.json();

      if (data.success) {
        setEditingAddress(data.data);
        setShowForm(true);
      }
    } catch (err) {
      console.error("Error fetching address:", err);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);

    // Clear URL params
    const returnTo = searchParams.get("returnTo");
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.push("/profile/addresses");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = editingAddress
        ? `/api/shipping/addresses/${editingAddress.id}`
        : "/api/shipping/addresses";

      const method = editingAddress ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingAddress(null);
        setRefresh((prev) => prev + 1); // Trigger refresh

        // Check if should return to another page
        const returnTo = searchParams.get("returnTo");
        if (returnTo) {
          router.push(returnTo);
        } else {
          router.push("/profile/addresses");
        }
      } else {
        alert(data.message || "Gagal menyimpan alamat");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Gagal menyimpan alamat");
    }
  };

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-28 bg-white">
          <Loading />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-8 pt-28">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                  Alamat Pengiriman
                </h1>
                <p className="text-gray-600">
                  Kelola alamat pengiriman untuk memudahkan checkout
                </p>
              </div>

              {!showForm && (
                <button
                  onClick={handleAddNew}
                  className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-black transition-colors font-semibold uppercase tracking-wider text-sm flex items-center gap-2"
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
                  Tambah Alamat
                </button>
              )}
            </div>
          </div>

          {/* Form or List */}
          <div className="bg-white border border-gray-200 rounded">
            {showForm ? (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
                  {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
                </h2>
                <AddressForm
                  address={editingAddress}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            ) : (
              <div className="p-8">
                <AddressList onEdit={handleEdit} refresh={refresh} />
              </div>
            )}
          </div>

          {/* Back Button */}
          {!showForm && (
            <div className="mt-8">
              <button
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Kembali ke Beranda
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
