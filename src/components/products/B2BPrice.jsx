"use client";

import { useSession } from "next-auth/react";

export default function B2BPrice({ price, variant = null }) {
  const { data: session } = useSession();

  // Check if user is B2B
  if (
    !session?.user ||
    session?.user?.role !== "B2B" ||
    !session?.user?.discount
  ) {
    return null;
  }

  const discount = session.user.discount;
  const originalPrice = variant?.price || price;
  const discountAmount = (originalPrice * discount) / 100;
  const b2bPrice = originalPrice - discountAmount;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-gray-100 text-gray-900 text-xs font-semibold rounded">
          B2B -{discount}%
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">
          Rp {b2bPrice.toLocaleString("id-ID")}
        </span>
        <span className="text-sm text-gray-500 line-through">
          Rp {originalPrice.toLocaleString("id-ID")}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        Hemat Rp {discountAmount.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
