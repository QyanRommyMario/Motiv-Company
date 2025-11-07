"use client";

export default function OrderTimeline({ order }) {
  // Generate timeline dari order history atau timestamps
  const timeline = [];

  if (order.createdAt) {
    timeline.push({
      status: "Pesanan Dibuat",
      timestamp: order.createdAt,
      description: `Order #${order.orderNumber} telah dibuat`,
      color: "bg-gray-900",
    });
  }

  if (order.transaction?.transactionTime) {
    timeline.push({
      status:
        order.paymentStatus === "PAID"
          ? "Pembayaran Berhasil"
          : "Menunggu Pembayaran",
      timestamp: order.transaction.transactionTime,
      description:
        order.paymentStatus === "PAID"
          ? `Pembayaran via ${
              order.transaction.paymentType || "Unknown"
            } berhasil`
          : `Menunggu pembayaran via ${
              order.transaction.paymentType || "Unknown"
            }`,
      color: order.paymentStatus === "PAID" ? "bg-green-600" : "bg-yellow-500",
    });
  }

  if (
    order.status === "PROCESSING" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED"
  ) {
    timeline.push({
      status: "Pesanan Diproses",
      timestamp: order.updatedAt,
      description: "Pesanan sedang disiapkan oleh penjual",
      color: "bg-gray-900",
    });
  }

  if (order.status === "SHIPPED" || order.status === "DELIVERED") {
    timeline.push({
      status: "Pesanan Dikirim",
      timestamp: order.shippedAt || order.updatedAt,
      description: `Dikirim via ${order.shippingCourier || "kurir"} - ${
        order.shippingService || ""
      }`,
      color: "bg-gray-900",
      trackingNumber: order.trackingNumber,
    });
  }

  if (order.status === "DELIVERED") {
    timeline.push({
      status: "Pesanan Diterima",
      timestamp: order.deliveredAt || order.updatedAt,
      description: "Pesanan telah sampai di tujuan",
      color: "bg-green-600",
    });
  }

  if (order.status === "CANCELLED") {
    timeline.push({
      status: "Pesanan Dibatalkan",
      timestamp: order.cancelledAt || order.updatedAt,
      description: order.cancellationReason || "Pesanan dibatalkan",
      color: "bg-red-600",
    });
  }

  // Sort by timestamp (newest first)
  timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white">
      <div className="space-y-6">
        {timeline.map((item, index) => (
          <div key={index} className="relative">
            {/* Vertical Line */}
            {index < timeline.length - 1 && (
              <div className="absolute left-2.5 top-10 w-0.5 h-full bg-gray-300" />
            )}

            {/* Timeline Item */}
            <div className="flex gap-4">
              {/* Dot */}
              <div
                className={`
                w-5 h-5 rounded-full flex items-center justify-center
                shrink-0 z-10 mt-1 ${item.color}
              `}
              />

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">
                      {item.status}
                    </p>
                    <p className="text-sm text-gray-700">{item.description}</p>
                    {item.trackingNumber && (
                      <div className="mt-3 inline-flex items-center px-3 py-2 bg-gray-900 rounded text-xs">
                        <span className="text-white font-semibold">Resi: </span>
                        <span className="font-mono font-bold text-white ml-2">
                          {item.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 whitespace-nowrap font-medium">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {timeline.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">
              Belum ada riwayat pesanan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
