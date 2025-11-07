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
    return badges[status] || "bg-gray-100 text-gray-800";
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
          <h1 className="text-2xl font-bold text-gray-900">B2B Management</h1>
          <p className="text-gray-600 mt-1">
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
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "requests"
                    ? "border-coffee-600 text-coffee-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pengajuan B2B
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "users"
                    ? "border-coffee-600 text-coffee-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cari
                  </label>
                  <input
                    type="text"
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="Nama bisnis, nama, email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
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
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada pengajuan B2B</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bisnis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pengguna
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.businessName}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {request.address}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {request.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {request.phone}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari B2B User
                </label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Nama, email, nama bisnis..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada B2B user</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nama Bisnis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pengguna
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Diskon
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bergabung
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.businessName || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user.phone || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-sm font-semibold text-coffee-700 bg-coffee-100 rounded">
                              {user.discount}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
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
                              className="text-gray-900 hover:text-gray-700 font-semibold uppercase tracking-wider"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Approve B2B Request
            </h3>
            <p className="text-gray-700 mb-6">
              Approve pengajuan B2B dari{" "}
              <strong className="text-gray-900">
                {approveModal.request?.user?.name}
              </strong>
              ?
              <br />
              User akan diupgrade ke akun B2B dengan diskon yang Anda tentukan.
            </p>

            {/* Discount Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:outline-none text-lg font-semibold"
                  placeholder="Masukkan diskon (0-100)"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                  %
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Diskon akan berlaku untuk semua produk yang dibeli user ini
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setApproveModal({ show: false, request: null, discount: 10 })
                }
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold uppercase tracking-wider transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Reject B2B Request
            </h3>
            <p className="text-gray-700 mb-6">
              Tolak pengajuan B2B dari{" "}
              <strong className="text-gray-900">
                {rejectModal.request?.user?.name}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRejectModal({ show: false, request: null })}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold uppercase tracking-wider transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Discount Modal */}
      {discountModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Edit Diskon B2B
            </h3>
            <p className="text-gray-700 mb-6">
              Update diskon untuk{" "}
              <strong className="text-gray-900">
                {discountModal.user?.name}
              </strong>
            </p>

            {/* Discount Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:outline-none text-lg font-semibold"
                  placeholder="Masukkan diskon (0-100)"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                  %
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Diskon akan berlaku untuk semua produk yang dibeli user ini
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setDiscountModal({ show: false, user: null, discount: 0 })
                }
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateDiscount}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold uppercase tracking-wider transition-colors"
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
