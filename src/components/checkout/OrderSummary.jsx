"use client";

/**
 * OrderSummary Component
 * Displays cart items, shipping cost, voucher discount, and total
 */

export default function OrderSummary({
  items = [],
  shippingCost = 0,
  discount = 0,
  voucher = null,
}) {
  console.log("📊 OrderSummary received items:", items);

  const subtotal = items.reduce((sum, item) => {
    const price = item.price || item.variant?.price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const total = subtotal + shippingCost - discount;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-6 max-h-[calc(100vh-20rem)] flex flex-col">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 shrink-0">
        Ringkasan Pesanan
      </h2>

      {/* Cart Items */}
      <div
        className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 overflow-y-auto shrink-0"
        style={{ maxHeight: "16rem" }}
      >
        {items.map((item) => {
          const product = item.product;
          const variant = item.variant;
          const price = item.price || variant?.price || product?.price || 0;

          return (
            <div key={item.id} className="flex gap-2 sm:gap-3 text-xs sm:text-sm">
              {product?.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">
                  {product?.name}
                </p>
                {variant && (
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    {variant.variantName} - {variant.variantValue}
                  </p>
                )}
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {item.quantity}x Rp {price.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="text-right font-medium text-gray-900 text-xs sm:text-sm flex-shrink-0">
                Rp {(price * item.quantity).toLocaleString("id-ID")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm shrink-0">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({items.length} item)</span>
          <span>Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-700">
          <span>Biaya Pengiriman</span>
          <span>
            {shippingCost > 0
              ? `Rp ${shippingCost.toLocaleString("id-ID")}`
              : "-"}
          </span>
        </div>

        {/* Discount/Voucher */}
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Diskon {voucher ? `(${voucher.code})` : ""}</span>
            <span>- Rp {discount.toLocaleString("id-ID")}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-300 mt-3 sm:mt-4 pt-3 sm:pt-4 shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Payment Info */}
      {shippingCost > 0 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 shrink-0">
          ✓ Ongkir sudah termasuk dalam total pembayaran
        </div>
      )}
    </div>
  );
}
