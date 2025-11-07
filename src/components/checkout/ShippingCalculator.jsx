"use client";

import { useState } from "react";

/**
 * ShippingCalculator Component
 * Calculates shipping cost based on courier and service selection
 * TODO: Integrate with RajaOngkir API or shipping provider
 */

// Mock courier data - replace with real API
const COURIERS = [
  {
    code: "jne",
    name: "JNE",
    services: [
      { code: "REG", name: "Reguler", estimasi: "2-3 hari", cost: 15000 },
      { code: "YES", name: "YES (1 hari)", estimasi: "1 hari", cost: 25000 },
      {
        code: "OKE",
        name: "OKE (2-4 hari)",
        estimasi: "2-4 hari",
        cost: 12000,
      },
    ],
  },
  {
    code: "tiki",
    name: "TIKI",
    services: [
      { code: "REG", name: "Reguler", estimasi: "3-4 hari", cost: 14000 },
      {
        code: "ONS",
        name: "Over Night Service",
        estimasi: "1 hari",
        cost: 28000,
      },
      { code: "ECO", name: "Economy", estimasi: "4-5 hari", cost: 10000 },
    ],
  },
  {
    code: "pos",
    name: "POS Indonesia",
    services: [
      {
        code: "PAKETPOS",
        name: "Paket Pos",
        estimasi: "3-5 hari",
        cost: 11000,
      },
      { code: "EXPRESS", name: "Express", estimasi: "1-2 hari", cost: 20000 },
    ],
  },
  {
    code: "sicepat",
    name: "SiCepat",
    services: [
      { code: "REG", name: "Reguler", estimasi: "2-3 hari", cost: 13000 },
      { code: "BEST", name: "Best", estimasi: "1-2 hari", cost: 18000 },
      {
        code: "GOKIL",
        name: "Gokil (Same Day)",
        estimasi: "Same Day",
        cost: 35000,
      },
    ],
  },
];

export default function ShippingCalculator({
  destination,
  weight = 1000,
  onSelectShipping,
}) {
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectService = (courier, service) => {
    setSelectedCourier(courier);
    setSelectedService(service);
    onSelectShipping({
      courier: courier.name,
      courierCode: courier.code,
      service: service.name,
      serviceCode: service.code,
      cost: service.cost,
      estimasi: service.estimasi,
    });
  };

  if (!destination) {
    return (
      <div className="border border-gray-300 rounded-lg p-6 text-center">
        <p className="text-gray-500">
          Pilih alamat pengiriman terlebih dahulu untuk menghitung ongkir
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Tujuan Pengiriman:</p>
            <p>
              {destination.city}, {destination.province}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Berat: {weight}g (~{Math.ceil(weight / 1000)}kg)
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-2">Menghitung ongkir...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Pilih Kurir & Layanan</h3>

          {COURIERS.map((courier) => (
            <div
              key={courier.code}
              className="border border-gray-300 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">
                    {courier.code.toUpperCase()}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {courier.name}
                </span>
              </div>

              <div className="space-y-2 ml-15">
                {courier.services.map((service) => {
                  const isSelected =
                    selectedCourier?.code === courier.code &&
                    selectedService?.code === service.code;

                  return (
                    <div
                      key={service.code}
                      className={`border rounded-lg p-3 cursor-pointer transition ${
                        isSelected
                          ? "border-gray-900 bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      onClick={() => handleSelectService(courier, service)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() =>
                              handleSelectService(courier, service)
                            }
                            className="w-4 h-4 text-gray-900"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {service.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              Estimasi: {service.estimasi}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            Rp {service.cost.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        <p>
          💡 <span className="font-medium">Tips:</span> Biaya pengiriman
          dihitung berdasarkan berat dan jarak. Pilih layanan yang sesuai dengan
          kebutuhan Anda.
        </p>
      </div>
    </div>
  );
}
