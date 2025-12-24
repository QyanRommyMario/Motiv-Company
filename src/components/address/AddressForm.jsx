"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AddressForm({ address = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    label: address?.label || "",
    name: address?.name || "",
    phone: address?.phone || "",
    address: address?.address || "",
    city: address?.city || "",
    cityId: address?.cityId || "",
    province: address?.province || "",
    provinceId: address?.provinceId || "",
    postalCode: address?.postalCode || "",
    country: "Indonesia",
    isDefault: address?.isDefault || false,
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Fetch Provinsi
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/shipping/locations?type=province");
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setProvinces(json.data);
        } else {
          console.error("Gagal load provinsi:", json.message);
        }
      } catch (err) {
        console.error("Network Error:", err);
      }
    };
    fetchProvinces();
  }, []);

  // 2. Fetch Kota
  useEffect(() => {
    if (formData.provinceId) {
      setLoadingLoc(true);
      const fetchCities = async () => {
        try {
          const res = await fetch(
            `/api/shipping/locations?type=city&id=${formData.provinceId}`
          );
          const json = await res.json();

          if (json.success && Array.isArray(json.data)) {
            setCities(json.data);
          } else {
            setCities([]);
          }
        } catch (err) {
          console.error(err);
          setCities([]);
        } finally {
          setLoadingLoc(false);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [formData.provinceId]);

  // Handler
  const handleProvinceChange = (e) => {
    const selectedId = e.target.value;
    const selectedItem = provinces.find(
      (p) => String(p.province_id) === String(selectedId)
    );

    setFormData((prev) => ({
      ...prev,
      provinceId: selectedId,
      province: selectedItem ? selectedItem.province : "",
      cityId: "",
      city: "",
      postalCode: "",
    }));
  };

  const handleCityChange = (e) => {
    const selectedId = e.target.value;
    const selectedItem = cities.find(
      (c) => String(c.city_id) === String(selectedId)
    );

    setFormData((prev) => ({
      ...prev,
      cityId: selectedId,
      city: selectedItem
        ? `${selectedItem.type || ""} ${selectedItem.city_name}`.trim()
        : "",
      // FIX: Ensure postalCode is never undefined
      postalCode: selectedItem ? selectedItem.postal_code || "" : "",
    }));
  };

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cityId) {
      setErrorMsg("Wajib memilih Provinsi dan Kota dari dropdown!");
      return;
    }
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-[#1A1A1A]">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 text-sm font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 1. Negara */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Negara
        </label>
        <select
          disabled
          className="w-full px-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] text-[#9CA3AF]"
        >
          <option>Indonesia</option>
        </select>
      </div>

      {/* 2. Label */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Label Alamat
        </label>
        <Input
          value={formData.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Contoh: Rumah, Kantor"
          required
        />
      </div>

      {/* 3. Nama & Telepon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#6B7280] mb-2">
            Nama Penerima
          </label>
          <Input
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6B7280] mb-2">
            Telepon
          </label>
          <Input
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
        </div>
      </div>

      {/* 4. Alamat Lengkap (NAIK KE ATAS) */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Alamat Lengkap
        </label>
        <textarea
          className="w-full px-4 py-3 border border-[#E5E7EB] focus:ring-2 focus:ring-black resize-none"
          rows={3}
          value={formData.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          required
          placeholder="Nama Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan"
        />
      </div>

      {/* 5. Dropdown Lokasi (DI BAWAH ALAMAT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F9FAFB] border border-[#E5E7EB]">
        <div>
          <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
            Provinsi *
          </label>
          <select
            className="w-full px-4 py-2 border border-[#E5E7EB] bg-white focus:ring-2 focus:ring-black"
            value={formData.provinceId || ""}
            onChange={handleProvinceChange}
            required
          >
            <option value="">-- Pilih Provinsi --</option>
            {provinces.map((p) => (
              <option key={p.province_id} value={p.province_id}>
                {p.province}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
            Kota/Kabupaten *
          </label>
          <select
            className="w-full px-4 py-2 border border-[#E5E7EB] bg-white disabled:bg-[#F9FAFB]"
            value={formData.cityId || ""}
            onChange={handleCityChange}
            disabled={!formData.provinceId || loadingLoc}
            required
          >
            <option value="">
              {loadingLoc ? "Loading..." : "-- Pilih Kota --"}
            </option>
            {cities.map((c) => (
              <option key={c.city_id} value={c.city_id}>
                {c.type} {c.city_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6. Kode Pos (Paling Bawah) */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Kode Pos
        </label>
        <Input
          value={formData.postalCode || ""}
          onChange={(e) => handleChange("postalCode", e.target.value)}
          required
          placeholder="Otomatis terisi jika kota dipilih"
        />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => handleChange("isDefault", e.target.checked)}
          className="w-4 h-4"
        />
        <label className="text-sm text-[#6B7280]">Jadikan Alamat Utama</label>
      </div>

      <div className="flex gap-3 pt-6 border-t border-[#E5E7EB] mt-4">
        <Button type="submit" loading={loading} fullWidth>
          Simpan
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 border border-[#E5E7EB] hover:bg-[#F9FAFB] font-medium"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
