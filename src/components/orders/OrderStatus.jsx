"use client";

const statusSteps = [
  { key: "PENDING", label: "Menunggu Pembayaran", icon: "1" },
  { key: "PAID", label: "Dibayar", icon: "2" },
  { key: "PROCESSING", label: "Diproses", icon: "3" },
  { key: "SHIPPED", label: "Dikirim", icon: "4" },
  { key: "DELIVERED", label: "Selesai", icon: "✓" },
];

const statusOrder = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderStatus({ currentStatus, paymentStatus }) {
  // Jika dibatalkan, tampilkan status khusus
  if (currentStatus === "CANCELLED") {
    return (
      <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-red-900 mb-2 uppercase tracking-wider">
          Pesanan Dibatalkan
        </h3>
        <p className="text-sm text-red-700 font-medium">
          {paymentStatus === "FAILED"
            ? "Pembayaran gagal atau ditolak"
            : "Pesanan telah dibatalkan"}
        </p>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="bg-white">
      {/* Progress Bar */}
      <div className="relative py-8">
        {/* Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2">
          <div
            className="h-full bg-gray-900 transition-all duration-500"
            style={{
              width:
                currentIndex >= 0
                  ? `${(currentIndex / (statusSteps.length - 1)) * 100}%`
                  : "0%",
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = statusOrder[index] === currentStatus;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center"
                style={{ flex: 1 }}
              >
                {/* Circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold
                    transition-all duration-300 z-10 border-2
                    ${
                      isActive
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-400 border-gray-300"
                    }
                    ${isCurrent ? "ring-4 ring-gray-300 scale-110" : ""}
                  `}
                >
                  {step.icon}
                </div>

                {/* Label */}
                <p
                  className={`
                    mt-3 text-xs text-center font-semibold max-w-[100px] uppercase tracking-wider
                    ${isActive ? "text-gray-900" : "text-gray-400"}
                  `}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Info */}
      <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="font-bold text-gray-900 text-lg mb-2 uppercase tracking-wider">
          {statusSteps[currentIndex]?.label || "Status Tidak Diketahui"}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {currentStatus === "PENDING" &&
            "Silakan selesaikan pembayaran untuk melanjutkan pesanan"}
          {currentStatus === "PAID" &&
            "Pembayaran berhasil! Pesanan Anda sedang diproses"}
          {currentStatus === "PROCESSING" &&
            "Pesanan sedang disiapkan oleh penjual"}
          {currentStatus === "SHIPPED" &&
            "Pesanan dalam perjalanan menuju Anda"}
          {currentStatus === "DELIVERED" &&
            "Pesanan telah sampai. Terima kasih!"}
        </p>
      </div>
    </div>
  );
}
