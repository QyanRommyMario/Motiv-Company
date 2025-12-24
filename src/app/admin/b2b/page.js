"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import Alert from "@/components/ui/Alert";

export default function AdminB2BPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("requests"); // 'requests' or 'users'
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [requestStatusFilter, setRequestStatusFilter] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Modals
  const [approveModal, setApproveModal] = useState({
    show: false,
    request: null,
    discount: 10,
  });
  const [rejectModal, setRejectModal] = useState({
    show: false,
    request: null,
  });
  const [discountModal, setDiscountModal] = useState({
    show: false,
    user: null,
    discount: 0,
  });

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    } else {
      fetchUsers();
    }
  }, [activeTab, requestStatusFilter, requestSearch, userSearch]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (requestStatusFilter) params.append("status", requestStatusFilter);
      if (requestSearch) params.append("search", requestSearch);

      const response = await fetch(`/api/admin/b2b/requests?${params}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to fetch requests",
        });
      }
    } catch (error) {
      console.error("Error fetching B2B requests:", error);
      setAlert({ type: "error", message: "Failed to fetch B2B requests" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userSearch) params.append("search", userSearch);

      const response = await fetch(`/api/admin/b2b/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to fetch users",
        });
      }
    } catch (error) {
      console.error("Error fetching B2B users:", error);
      setAlert({ type: "error", message: "Failed to fetch B2B users" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approveModal.request) return;

    try {
      const discountValue = parseFloat(approveModal.discount);
      if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
        setAlert({ type: "error", message: "Diskon harus antara 0-100%" });
        return;
      }

      const response = await fetch(
        `/api/admin/b2b/requests/${approveModal.request.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ discount: discountValue }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAlert({
          type: "success",
          message: "B2B request approved successfully",
        });
        setApproveModal({ show: false, request: null, discount: 10 });
        fetchRequests();
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to approve request",
        });
      }
    } catch (error) {
      console.error("Error approving request:", error);
      setAlert({ type: "error", message: "Failed to approve request" });
    }
  };

  const handleReject = async () => {
    if (!rejectModal.request) return;

    try {
      const response = await fetch(
        `/api/admin/b2b/requests/${rejectModal.request.id}/reject`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        setAlert({ type: "success", message: "B2B request rejected" });
        setRejectModal({ show: false, request: null });
        fetchRequests();
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to reject request",
        });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      setAlert({ type: "error", message: "Failed to reject request" });
    }
  };

  const handleUpdateDiscount = async () => {
    if (!discountModal.user) return;

    try {
      const discountValue = parseFloat(discountModal.discount);
      if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
        setAlert({ type: "error", message: "Diskon harus antara 0-100%" });
        return;
      }

      const response = await fetch(
        `/api/admin/b2b/users/${discountModal.user.id}/discount`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ discount: discountValue }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAlert({ type: "success", message: "Discount updated successfully" });
        setDiscountModal({ show: false, user: null, discount: 0 });
        fetchUsers();
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to update discount",
        });
      }
    } catch (error) {
      console.error("Error updating discount:", error);
      setAlert({ type: "error", message: "Failed to update discount" });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-[#F9FAFB] text-[#6B7280]";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">B2B Management</h1>
          <p className="text-[#6B7280] mt-1">
            Kelola pengajuan dan pengguna B2B
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Tabs */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm">
          <div className="border-b border-[#E5E7EB]">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "requests"
                    ? "border-[#1A1A1A] text-[#1A1A1A]"
                    : "border-transparent text-[#6B7280] hover:text-[#1A1A1A] hover:border-[#E5E7EB]"
                }`}
              >
                Pengajuan B2B
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "users"
                    ? "border-[#1A1A1A] text-[#1A1A1A]"
                    : "border-transparent text-[#6B7280] hover:text-[#1A1A1A] hover:border-[#E5E7EB]"
                }`}
              >
                B2B Users
              </button>
            </nav>
          </div>

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="p-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Cari
                  </label>
                  <input
                    type="text"
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="Nama bisnis, nama, email..."
                    className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Status
                  </label>
                  <select
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] bg-white"
                  >
                    <option value="">Semua Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Requests Table */}
              {loading ? (
                <div className="flex items-center justify-center min-h-[30vh]">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
                    <p className="mt-3 text-sm text-[#6B7280] uppercase tracking-wider">
                      Memuat pengajuan...
                    </p>
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-[#6B7280]">
                  <p>Tidak ada pengajuan B2B</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E5E7EB]">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Bisnis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Pengguna
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#E5E7EB]">
                      {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-[#F9FAFB]">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-[#1A1A1A]">
                              {request.businessName}
                            </div>
                            <div className="text-sm text-[#6B7280] truncate max-w-xs">
                              {request.address}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#1A1A1A]">
                              {request.user.name}
                            </div>
                            <div className="text-sm text-[#6B7280]">
                              {request.user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1A1A1A]">
                            {request.phone}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1A1A1A]">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium space-x-2">
                            {request.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    setApproveModal({
                                      show: true,
                                      request,
                                      discount: 10,
                                    })
                                  }
                                  className="text-green-600 hover:text-green-800 font-semibold uppercase tracking-wider"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    setRejectModal({ show: true, request })
                                  }
                                  className="text-red-600 hover:text-red-800 font-semibold uppercase tracking-wider"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Cari B2B User
                </label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Nama, email, nama bisnis..."
                  className="w-full px-4 py-2 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                />
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="flex items-center justify-center min-h-[30vh]">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
                    <p className="mt-3 text-sm text-[#6B7280] uppercase tracking-wider">
                      Memuat pengguna...
                    </p>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-[#6B7280]">
                  <p>Tidak ada B2B user</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E5E7EB]">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Nama Bisnis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Pengguna
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Diskon
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Bergabung
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#E5E7EB]">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-[#F9FAFB]">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-[#1A1A1A]">
                              {user.businessName || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#1A1A1A]">
                              {user.name}
                            </div>
                            <div className="text-sm text-[#6B7280]">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1A1A1A]">
                            {user.phone || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-sm font-semibold text-[#1A1A1A] bg-[#F3F4F6]">
                              {user.discount}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#1A1A1A]">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() =>
                                setDiscountModal({
                                  show: true,
                                  user,
                                  discount: user.discount,
                                })
                              }
                              className="text-[#1A1A1A] hover:text-[#6B7280] font-semibold uppercase tracking-wider"
                            >
                              Edit Diskon
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {approveModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 uppercase tracking-wider">
              Approve B2B Request
            </h3>
            <p className="text-[#6B7280] mb-6">
              Approve pengajuan B2B dari{" "}
              <strong className="text-[#1A1A1A]">
                {approveModal.request?.user?.name}
              </strong>
              ?
              <br />
              User akan diupgrade ke akun B2B dengan diskon yang Anda tentukan.
            </p>

            {/* Discount Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wider">
                Diskon B2B (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={approveModal.discount}
                  onChange={(e) =>
                    setApproveModal({
                      ...approveModal,
                      discount: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-lg font-semibold text-[#1A1A1A]"
                  placeholder="Masukkan diskon (0-100)"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-semibold text-lg">
                  %
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-2">
                Diskon akan berlaku untuk semua produk yang dibeli user ini
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setApproveModal({ show: false, request: null, discount: 10 })
                }
                className="px-6 py-2.5 border-2 border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] font-semibold uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 font-semibold uppercase tracking-wider transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 uppercase tracking-wider">
              Reject B2B Request
            </h3>
            <p className="text-[#6B7280] mb-6">
              Tolak pengajuan B2B dari{" "}
              <strong className="text-[#1A1A1A]">
                {rejectModal.request?.user?.name}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRejectModal({ show: false, request: null })}
                className="px-6 py-2.5 border-2 border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] font-semibold uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 font-semibold uppercase tracking-wider transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Discount Modal */}
      {discountModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 uppercase tracking-wider">
              Edit Diskon B2B
            </h3>
            <p className="text-[#6B7280] mb-6">
              Update diskon untuk{" "}
              <strong className="text-[#1A1A1A]">
                {discountModal.user?.name}
              </strong>
            </p>

            {/* Discount Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wider">
                Diskon B2B (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discountModal.discount}
                  onChange={(e) =>
                    setDiscountModal({
                      ...discountModal,
                      discount: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-[#E5E7EB] focus:border-[#1A1A1A] focus:outline-none text-lg font-semibold text-[#1A1A1A]"
                  placeholder="Masukkan diskon (0-100)"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-semibold text-lg">
                  %
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-2">
                Diskon akan berlaku untuk semua produk yang dibeli user ini
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setDiscountModal({ show: false, user: null, discount: 0 })
                }
                className="px-6 py-2.5 border-2 border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] font-semibold uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateDiscount}
                className="px-6 py-2.5 bg-[#1A1A1A] text-white hover:bg-black font-semibold uppercase tracking-wider transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
