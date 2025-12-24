"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Loading from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchSearch =
      !search ||
      customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase());

    const matchRole = !roleFilter || customer.role === roleFilter;

    return matchSearch && matchRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-[#DC2626] text-white";
      case "B2B":
        return "bg-[#1A1A1A] text-white";
      default:
        return "bg-[#6B7280] text-white";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              Manajemen Pelanggan
            </h1>
            <p className="text-[#6B7280] mt-2">
              Kelola data pelanggan - Total: {filteredCustomers.length}{" "}
              pelanggan
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Cari Pelanggan
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama atau email..."
                className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Filter Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] font-medium bg-white"
              >
                <option value="">Semua Role</option>
                <option value="USER">User (Retail)</option>
                <option value="B2B">B2B (Business)</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
              <p className="mt-3 text-sm text-[#6B7280] uppercase tracking-wider">
                Memuat pelanggan...
              </p>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] shadow-sm p-12 text-center">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="text-[#6B7280] font-medium">Tidak ada pelanggan</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E5E7EB]">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Total Orders
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Bergabung
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E5E7EB]">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center text-white font-bold text-sm">
                            {customer.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-[#1A1A1A]">
                              {customer.name || "N/A"}
                            </div>
                            <div className="text-xs text-[#6B7280]">
                              ID: {customer.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#1A1A1A] font-medium">
                          {customer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor(
                            customer.role
                          )}`}
                        >
                          {customer.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#1A1A1A]">
                          {customer._count?.orders || 0} pesanan
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-[#1A1A1A]">
                          {formatCurrency(customer.totalSpent || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#6B7280]">
                          {formatDate(customer.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDetailModal(true);
                          }}
                          className="text-[#1A1A1A] hover:text-[#6B7280] font-semibold text-sm"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-2xl w-full p-8 border-4 border-[#1A1A1A] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-[#1A1A1A]">
                  Detail Pelanggan
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="text-[#6B7280] hover:text-[#1A1A1A]"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="border-2 border-[#E5E7EB] p-6">
                  <h4 className="font-bold text-[#1A1A1A] mb-4 uppercase tracking-wider text-sm">
                    Informasi Dasar
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">
                        Nama
                      </p>
                      <p className="font-semibold text-[#1A1A1A]">
                        {selectedCustomer.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <p className="font-semibold text-[#1A1A1A]">
                        {selectedCustomer.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">
                        Role
                      </p>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold uppercase ${getRoleBadgeColor(
                          selectedCustomer.role
                        )}`}
                      >
                        {selectedCustomer.role}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">
                        Bergabung
                      </p>
                      <p className="font-semibold text-[#1A1A1A]">
                        {formatDate(selectedCustomer.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="border-2 border-[#E5E7EB] p-6">
                  <h4 className="font-bold text-[#1A1A1A] mb-4 uppercase tracking-wider text-sm">
                    Statistik Pembelian
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F9FAFB] p-4 border border-[#E5E7EB]">
                      <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">
                        Total Pesanan
                      </p>
                      <p className="text-3xl font-bold text-[#1A1A1A]">
                        {selectedCustomer._count?.orders || 0}
                      </p>
                    </div>
                    <div className="bg-[#F9FAFB] p-4 border border-[#E5E7EB]">
                      <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">
                        Total Pengeluaran
                      </p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">
                        {formatCurrency(selectedCustomer.totalSpent || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* B2B Info if applicable */}
                {selectedCustomer.role === "B2B" &&
                  selectedCustomer.b2bRequest && (
                    <div className="border-2 border-[#E5E7EB] p-6">
                      <h4 className="font-bold text-[#1A1A1A] mb-4 uppercase tracking-wider text-sm">
                        Informasi Business
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">
                            Nama Bisnis
                          </p>
                          <p className="font-semibold text-[#1A1A1A]">
                            {selectedCustomer.b2bRequest.businessName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">
                            No. Telepon
                          </p>
                          <p className="font-semibold text-[#1A1A1A]">
                            {selectedCustomer.b2bRequest.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">
                            Alamat
                          </p>
                          <p className="font-semibold text-[#1A1A1A]">
                            {selectedCustomer.b2bRequest.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">
                            Status Permintaan
                          </p>
                          <p className="font-semibold text-[#1A1A1A]">
                            {selectedCustomer.b2bRequest.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="w-full px-6 py-3 bg-[#1A1A1A] text-white hover:bg-black transition-colors font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
