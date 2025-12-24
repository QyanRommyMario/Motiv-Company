"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function OrderFilter({ filters, onFilterChange }) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: "", label: t("filter.allStatus") },
    { value: "PENDING", label: t("status.PENDING") },
    { value: "PAID", label: t("status.PAID") },
    { value: "PROCESSING", label: t("status.PROCESSING") },
    { value: "SHIPPED", label: t("status.SHIPPED") },
    { value: "DELIVERED", label: t("status.DELIVERED") },
    { value: "CANCELLED", label: t("status.CANCELLED") },
  ];

  const timeOptions = [
    { value: "", label: t("filter.allTime") },
    { value: "7", label: t("filter.last7Days") },
    { value: "30", label: t("filter.last30Days") },
    { value: "90", label: t("filter.last3Months") },
    { value: "365", label: t("filter.last1Year") },
  ];

  const handleStatusChange = (value) => {
    onFilterChange({ ...filters, status: value });
  };

  const handleTimeChange = (value) => {
    onFilterChange({ ...filters, days: value });
  };

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const hasActiveFilters = filters.status || filters.days || filters.search;

  const clearFilters = () => {
    onFilterChange({ status: "", days: "", search: "" });
  };

  return (
    <div className="bg-white rounded border border-gray-900 p-4 shadow-sm">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t("filter.searchPlaceholder")}
            value={filters.search || ""}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-900 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 font-medium text-gray-900 focus:outline-none text-sm sm:text-base"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            px-5 py-2.5 rounded font-bold flex items-center justify-center gap-2 transition-all shadow-sm text-sm sm:text-base whitespace-nowrap
            ${
              showFilters || hasActiveFilters
                ? "bg-gray-900 text-white"
                : "border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
            }
          `}
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="hidden sm:inline">{tCommon("filter")}</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-white text-gray-900 rounded-full text-xs font-bold">
              •
            </span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                {t("filter.orderStatus")}
              </label>
              <div className="relative">
                <select
                  value={filters.status || ""}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border border-gray-900 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 font-medium text-gray-900 bg-white cursor-pointer focus:outline-none pr-10"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                {t("filter.timePeriod")}
              </label>
              <div className="relative">
                <select
                  value={filters.days || ""}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border border-gray-900 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 font-medium text-gray-900 bg-white cursor-pointer focus:outline-none pr-10"
                >
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-900 hover:text-gray-700 font-bold underline"
              >
                {t("filter.clearAll")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
