"use client";

import { useState, useEffect } from "react";

// 1. Tambahkan opsi "custom" ke daftar kurir
const COURIERS = [
  { code: "jne", name: "JNE" },
  { code: "pos", name: "POS Indonesia" },
  { code: "tiki", name: "TIKI" },
  { code: "sicepat", name: "SiCepat" },
  { code: "jnt", name: "J&T" },
  { code: "custom", name: "Custom / Kurir Toko" }, // <-- Opsi Baru
];

export default function ShippingCalculator({
  destination,
  weight = 1000,
  onSelectShipping,
}) {
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedServiceCode, setSelectedServiceCode] = useState(null);

  useEffect(() => {
    setServices([]);
    setSelectedCourier(null);
    setSelectedServiceCode(null);
    setError("");
  }, [destination]);

  const checkOngkir = async (courier) => {
    setSelectedCourier(courier);
    setLoading(true);
    setServices([]);
    setError("");
    setSelectedServiceCode(null);

    // 2. LOGIKA BARU: Jika pilih Custom, jangan panggil API
    if (courier.code === "custom") {
      // Langsung set layanan manual (statis)
      setServices([
        {
          service: "CUSTOM",
          description: "Pengiriman Diatur Sendiri / Hubungi Admin",
          cost: [
            {
              value: 0, // Set Rp 0 atau harga default
              etd: "Konfirmasi Admin", // Estimasi waktu
            },
          ],
        },
      ]);
      setLoading(false);
      return; // Berhenti di sini, jangan lanjut fetch API
    }

    // --- Kode Lama (Panggil API) ---
    console.log("📍 Cek Ongkir ke Address Object:", destination);
    const destId = destination?.cityId;

    if (!destId) {
      setError("Alamat tidak valid (ID Kota hilang).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/shipping/cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destId,
          weight: weight,
          courier: courier.code,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setServices(data.data.costs);
      } else {
        setError(data.message || "Gagal cek ongkir");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service) => {
    setSelectedServiceCode(service.service);
    const cost = service.cost[0];

    // Kirim data ke parent component (Checkout Page)
    onSelectShipping({
      courier: selectedCourier.name, // "Custom / Kurir Toko"
      courierCode: selectedCourier.code, // "custom"
      service: service.service, // "CUSTOM"
      cost: cost.value, // 0
      estimasi: cost.etd ? `${cost.etd}` : "-",
    });
  };

  if (!destination) {
    return (
      <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] text-center text-[#6B7280] text-sm">
        Pilih alamat pengiriman terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Route Pengiriman */}
      <div className="bg-blue-50 p-4 border border-blue-100 text-sm">
        <div className="flex items-start gap-3">
          {/* ... (kode ikon svg sama seperti sebelumnya) ... */}
          <div>
            <p className="text-blue-900 font-bold mb-1">Tujuan Pengiriman:</p>
            <p className="text-blue-800">
              {destination.city}{" "}
              {destination.postalCode ? `(${destination.postalCode})` : ""},{" "}
              {destination.province}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Berat Paket: {weight} gram
            </p>
          </div>
        </div>
      </div>

      {/* Pilihan Tombol Kurir */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-[#1A1A1A]">
          Pilih Kurir
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {COURIERS.map((c) => (
            <button
              key={c.code}
              onClick={() => checkOngkir(c)}
              disabled={loading}
              className={`py-2 px-1 border text-sm font-medium transition flex flex-col items-center justify-center ${
                selectedCourier?.code === c.code
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md"
                  : "bg-white text-[#6B7280] hover:bg-[#F9FAFB] border-[#E5E7EB]"
              }`}
            >
              <span className="uppercase tracking-wider text-xs text-center">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1A1A1A]"></div>
          <p className="text-xs text-[#9CA3AF] mt-2">Menghitung ongkir...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Daftar Layanan (Service List) */}
      {!loading && services.length > 0 && (
        <div className="space-y-2 mt-2 animate-fade-in">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            Layanan Tersedia:
          </p>
          {services.map((svc, idx) => {
            const cost = svc.cost[0];
            const isSelected = selectedServiceCode === svc.service;
            return (
              <div
                key={`${svc.service}-${idx}`}
                onClick={() => handleSelectService(svc)}
                className={`flex justify-between items-center p-4 border cursor-pointer transition hover:shadow-sm ${
                  isSelected
                    ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                    : "border-[#E5E7EB] bg-white hover:border-[#6B7280]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A1A1A]">
                      {svc.service}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">
                      ({svc.description})
                    </span>
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1 flex items-center gap-1">
                    Estimasi: {cost.etd || "-"}
                  </div>
                </div>
                <div className="font-bold text-[#1A1A1A] text-lg">
                  {cost.value === 0
                    ? "Gratis / Sesuai Kesepakatan"
                    : `Rp ${cost.value.toLocaleString("id-ID")}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
