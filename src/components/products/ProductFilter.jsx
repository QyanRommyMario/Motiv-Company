"use client";

/**
 * Product Filter Component - Modern Design
 * Filter products by category and search
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ProductFilter({ onFilterChange }) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mengambil kategori dari database/API agar tidak hardcode
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/products/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange({ category, search: searchTerm });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ category: selectedCategory, search: searchTerm });
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    onFilterChange({ category: "", search: "" });
  };

  return (
    <div className="bg-white border border-[#E5E7EB] p-4 sm:p-6 md:p-8 mb-8 md:mb-12">
      <h3 className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-4 sm:mb-6">
        {tCommon("filter")} {t("title")}
      </h3>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            placeholder={tCommon("search")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E7EB] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm"
          />
          <button
            type="submit"
            className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-2.5 sm:py-3 uppercase tracking-widest text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {tCommon("search")}
          </button>
        </div>
      </form>

      {/* Categories */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs uppercase tracking-widest text-[#6B7280] mb-3">
          {t("categories")}
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange("")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs uppercase tracking-wider font-medium transition-all border ${
              selectedCategory === ""
                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
            }`}
          >
            {t("allCategories")}
          </button>

          {/* Rendering Kategori secara Dinamis */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs uppercase tracking-wider font-medium transition-all border ${
                selectedCategory === category
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategory || searchTerm) && (
        <button
          onClick={handleClearFilters}
          className="w-full text-xs uppercase tracking-widest text-[#6B7280] hover:text-[#1A1A1A] transition-colors py-3 border border-[#E5E7EB] hover:border-[#1A1A1A]"
        >
          {tCommon("reset")}
        </button>
      )}
    </div>
  );
}
