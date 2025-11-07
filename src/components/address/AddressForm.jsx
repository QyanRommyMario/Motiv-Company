"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/**
 * AddressForm Component
 * Form for creating/editing shipping address
 */

export default function AddressForm({ address = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    label: address?.label || "",
    name: address?.name || "",
    phone: address?.phone || "",
    address: address?.address || "",
    city: address?.city || "",
    province: address?.province || "",
    country: address?.country || "Indonesia",
    postalCode: address?.postalCode || "",
    isDefault: address?.isDefault || false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // List negara Asia Tenggara
  const countries = [
    "Indonesia",
    "Malaysia",
    "Singapore",
    "Thailand",
    "Vietnam",
    "Philippines",
    "Brunei",
    "Myanmar",
    "Laos",
    "Cambodia",
    "Timor-Leste",
  ];

  // Validasi berdasarkan negara
  const validateByCountry = () => {
    const validationRules = {
      Indonesia: {
        phone: /^(\+62|62|0)[0-9]{9,12}$/,
        postal: /^[0-9]{5}$/,
        phoneError: "Format: 08xxxxxxxxxx atau +628xxxxxxxxxx",
        postalError: "Kode pos harus 5 digit",
      },
      Malaysia: {
        phone: /^(\+60|60|0)[0-9]{9,10}$/,
        postal: /^[0-9]{5}$/,
        phoneError: "Format: 01xxxxxxxx atau +601xxxxxxxx",
        postalError: "Postcode must be 5 digits",
      },
      Singapore: {
        phone: /^(\+65|65)[0-9]{8}$/,
        postal: /^[0-9]{6}$/,
        phoneError: "Format: 9xxxxxxx atau +659xxxxxxx",
        postalError: "Postal code must be 6 digits",
      },
      Thailand: {
        phone: /^(\+66|66|0)[0-9]{9}$/,
        postal: /^[0-9]{5}$/,
        phoneError: "Format: 08xxxxxxxx atau +668xxxxxxxx",
        postalError: "Postal code must be 5 digits",
      },
      Vietnam: {
        phone: /^(\+84|84|0)[0-9]{9,10}$/,
        postal: /^[0-9]{6}$/,
        phoneError: "Format: 09xxxxxxxx atau +849xxxxxxxx",
        postalError: "Postal code must be 6 digits",
      },
      Philippines: {
        phone: /^(\+63|63|0)[0-9]{10}$/,
        postal: /^[0-9]{4}$/,
        phoneError: "Format: 09xxxxxxxxx atau +639xxxxxxxxx",
        postalError: "Postal code must be 4 digits",
      },
      Brunei: {
        phone: /^(\+673|673)[0-9]{7}$/,
        postal: /^[A-Z]{2}[0-9]{4}$/,
        phoneError: "Format: +6737xxxxxx",
        postalError: "Format: XX1234",
      },
      Myanmar: {
        phone: /^(\+95|95|0)[0-9]{9,10}$/,
        postal: /^[0-9]{5}$/,
        phoneError: "Format: 09xxxxxxxx atau +959xxxxxxxx",
        postalError: "Postal code must be 5 digits",
      },
      Laos: {
        phone: /^(\+856|856|0)[0-9]{9,10}$/,
        postal: /^[0-9]{5}$/,
        phoneError: "Format: 020xxxxxxxx atau +85620xxxxxxxx",
        postalError: "Postal code must be 5 digits",
      },
      Cambodia: {
        phone: /^(\+855|855|0)[0-9]{8,9}$/,
        postal: /^[0-9]{5,6}$/,
        phoneError: "Format: 012xxxxxx atau +85512xxxxxx",
        postalError: "Postal code must be 5-6 digits",
      },
      "Timor-Leste": {
        phone: /^(\+670|670)[0-9]{7,8}$/,
        postal: /^[0-9]{4}$/,
        phoneError: "Format: +6707xxxxxxx",
        postalError: "Postal code must be 4 digits",
      },
    };

    return validationRules[formData.country] || validationRules.Indonesia;
  };

  const validate = () => {
    const newErrors = {};
    const rules = validateByCountry();

    if (!formData.label.trim()) {
      newErrors.label = "Label alamat wajib diisi";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Nama penerima wajib diisi";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!rules.phone.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = rules.phoneError;
    }

    if (!formData.address.trim()) {
      newErrors.address = "Alamat lengkap wajib diisi";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Kota/kabupaten wajib diisi";
    }

    if (!formData.province.trim()) {
      newErrors.province =
        formData.country === "Singapore"
          ? "District wajib diisi"
          : "Provinsi wajib diisi";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Kode pos wajib diisi";
    } else if (!rules.postal.test(formData.postalCode)) {
      newErrors.postalCode = rules.postalError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Negara */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Negara <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.country}
          onChange={(e) => handleChange("country", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Pilih negara tujuan pengiriman
        </p>
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Label Alamat <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.label}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Contoh: Rumah, Kantor, Kos"
          error={errors.label}
        />
        <p className="text-xs text-gray-500 mt-1">
          Untuk memudahkan Anda mengidentifikasi alamat
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nama Penerima <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Nama lengkap penerima"
          error={errors.name}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nomor Telepon <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="08123456789"
          error={errors.phone}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alamat Lengkap <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.address && (
          <p className="text-sm text-red-600 mt-1">{errors.address}</p>
        )}
      </div>

      {/* City & Province */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kota/Kabupaten <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Contoh: Jakarta Selatan"
            error={errors.city}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.country === "Singapore" ? "District" : "Provinsi/State"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.province}
            onChange={(e) => handleChange("province", e.target.value)}
            placeholder="Contoh: DKI Jakarta"
            error={errors.province}
          />
        </div>
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kode Pos <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.postalCode}
          onChange={(e) => handleChange("postalCode", e.target.value)}
          placeholder="12345"
          maxLength={5}
          error={errors.postalCode}
        />
      </div>

      {/* Default Checkbox */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => handleChange("isDefault", e.target.checked)}
          className="w-4 h-4 text-gray-900 rounded focus:ring-gray-900"
        />
        <label
          htmlFor="isDefault"
          className="text-sm text-gray-700 cursor-pointer"
        >
          Jadikan sebagai alamat utama
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" loading={loading} fullWidth>
          {address ? "Simpan Perubahan" : "Tambah Alamat"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
