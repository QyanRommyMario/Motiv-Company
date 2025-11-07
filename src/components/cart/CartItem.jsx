"use client";

/**
 * CartItem Component
 * Individual cart item with quantity controls
 */

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Safe price extraction with fallbacks
  const price = item.b2bPrice || item.price || item.variant?.price || 0;
  const subtotal = price * quantity;
  const maxStock = item.variant?.stock || 0;

  console.log("🛒 CartItem data:", {
    itemId: item.id,
    price,
    b2bPrice: item.b2bPrice,
    itemPrice: item.price,
    variantPrice: item.variant?.price,
  });

  const handleIncrement = async () => {
    if (quantity >= maxStock) {
      alert(`Stok maksimal: ${maxStock}`);
      return;
    }

    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setIsUpdating(true);
    await onUpdateQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  const handleDecrement = async () => {
    if (quantity <= 1) return;

    const newQuantity = quantity - 1;
    setQuantity(newQuantity);
    setIsUpdating(true);
    await onUpdateQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (!confirm("Hapus item dari keranjang?")) return;

    setIsRemoving(true);
    await onRemove(item.id);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border ${
        isRemoving ? "opacity-50" : ""
      }`}
    >
      {/* Product Image */}
      <div className="shrink-0 w-full sm:w-24 h-48 sm:h-24 relative rounded-lg overflow-hidden bg-gray-100">
        {item.product?.images?.[0] ? (
          <img
            src={item.product.images[0]}
            alt={item.product?.name || "Product"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product?.id}`}
          className="font-semibold text-gray-900 hover:text-gray-700 line-clamp-2 sm:line-clamp-1"
        >
          {item.product?.name}
        </Link>

        {/* Variant Info */}
        {item.variant && (
          <div className="text-sm text-gray-600 mt-1">
            <span>
              {item.variant.size}{" "}
              {item.variant.grindType && `• ${item.variant.grindType}`}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2">
          <p className="text-lg font-bold text-gray-900">
            Rp {price.toLocaleString("id-ID")}
          </p>
          {item.b2bPrice && (
            <p className="text-xs text-gray-500 line-through">
              Rp {item.price.toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Stock Info */}
        <div className="text-xs text-gray-500 mt-1">
          Stok: {maxStock} tersedia
        </div>
      </div>

      {/* Quantity Controls & Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-4 sm:gap-0">
        {/* Subtotal */}
        <div className="text-left sm:text-right">
          <p className="text-sm text-gray-600">Subtotal</p>
          <p className="text-lg font-bold text-gray-900">
            Rp {subtotal.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={quantity <= 1 || isUpdating}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center font-bold text-gray-900">
            {quantity}
          </span>
          <button
            onClick={handleIncrement}
            disabled={quantity >= maxStock || isUpdating}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-sm text-red-600 hover:text-red-700 sm:mt-2"
        >
          {isRemoving ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </div>
  );
}
