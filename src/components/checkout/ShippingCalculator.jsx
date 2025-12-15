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
      <div className="p-4 bg-gray-50 border rounded text-center text-gray-500 text-sm">
        Pilih alamat pengiriman terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Route Pengiriman */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
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
        <label className="block text-sm font-semibold mb-2 text-gray-800">
          Pilih Kurir
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {COURIERS.map((c) => (
            <button
              key={c.code}
              onClick={() => checkOngkir(c)}
              disabled={loading}
              className={`py-2 px-1 border rounded-lg text-sm font-medium transition flex flex-col items-center justify-center ${
                selectedCourier?.code === c.code
                  ? "bg-gray-900 text-white border-gray-900 shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
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
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <p className="text-xs text-gray-500 mt-2">Menghitung ongkir...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Daftar Layanan (Service List) */}
      {!loading && services.length > 0 && (
        <div className="space-y-2 mt-2 animate-fade-in">
          <p className="text-sm font-semibold text-gray-800">
            Layanan Tersedia:
          </p>
          {services.map((svc, idx) => {
            const cost = svc.cost[0];
            const isSelected = selectedServiceCode === svc.service;
            return (
              <div
                key={`${svc.service}-${idx}`}
                onClick={() => handleSelectService(svc)}
                className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer transition hover:shadow-sm ${
                  isSelected
                    ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {svc.service}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({svc.description})
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    Estimasi: {cost.etd || "-"}
                  </div>
                </div>
                <div className="font-bold text-gray-900 text-lg">
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
