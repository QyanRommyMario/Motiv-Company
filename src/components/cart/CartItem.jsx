"use client";

/**
 * CartItem Component
 * Individual cart item with quantity controls
 */

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Safe price extraction with fallbacks
  const price = item.b2bPrice || item.price || item.variant?.price || 0;
  const subtotal = price * quantity;
  const maxStock = item.variant?.stock || 99;

  const handleIncrement = async () => {
    if (quantity >= maxStock) return;

    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (quantity <= 1) return;

    const newQuantity = quantity - 1;
    setQuantity(newQuantity);
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm(t("clearCart") + "?")) return;
    setIsRemoving(true);
    await onRemove(item.id);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 p-4 sm:p-5 bg-white border border-[#E5E7EB] transition-opacity ${
        isRemoving ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.product?.id}`}
        className="shrink-0 w-full sm:w-28 h-32 sm:h-28 relative overflow-hidden bg-gray-50 block"
      >
        {item.product?.images?.[0] ? (
          <img
            src={item.product.images[0]}
            alt={item.product?.name || "Product"}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-3xl">☕</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Link
          href={`/products/${item.product?.id}`}
          className="font-semibold text-[#1A1A1A] hover:opacity-70 line-clamp-2 transition-opacity"
        >
          {item.product?.name}
        </Link>

        {/* Variant Info */}
        {item.variant && (
          <p className="text-sm text-gray-500 mt-1">
            {item.variant.size}
            {item.variant.grindType && ` • ${item.variant.grindType}`}
          </p>
        )}

        {/* Price - Mobile */}
        <div className="mt-2 sm:hidden">
          <p className="text-base font-bold text-[#1A1A1A]">
            Rp {price.toLocaleString("id-ID")}
          </p>
          {item.b2bPrice && item.price && (
            <p className="text-xs text-gray-400 line-through">
              Rp {item.price.toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Quantity & Actions - Mobile */}
        <div className="flex items-center justify-between mt-4 sm:hidden">
          <div className="flex items-center border border-[#E5E7EB]">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1 || isUpdating}
              className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={quantity >= maxStock || isUpdating}
              className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            {tCommon("delete")}
          </button>
        </div>

        {/* Subtotal - Mobile */}
        <div className="mt-3 pt-3 border-t border-gray-100 sm:hidden">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t("subtotal")}</span>
            <span className="font-bold text-[#1A1A1A]">
              Rp {subtotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop: Price, Quantity, Subtotal */}
      <div className="hidden sm:flex items-center gap-6">
        {/* Price */}
        <div className="w-28 text-right">
          <p className="font-medium text-[#1A1A1A]">
            Rp {price.toLocaleString("id-ID")}
          </p>
          {item.b2bPrice && item.price && (
            <p className="text-xs text-gray-400 line-through">
              Rp {item.price.toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center border border-[#E5E7EB]">
          <button
            onClick={handleDecrement}
            disabled={quantity <= 1 || isUpdating}
            className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
          <span className="w-10 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={handleIncrement}
            disabled={quantity >= maxStock || isUpdating}
            className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Subtotal */}
        <div className="w-32 text-right">
          <p className="font-bold text-[#1A1A1A]">
            Rp {subtotal.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title={tCommon("delete")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
