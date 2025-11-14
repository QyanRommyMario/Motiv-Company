"use client";

/**
 * CartEmpty Component
 * Display when cart is empty
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function CartEmpty() {
  const t = useTranslations("cart");

  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("empty")}</h2>
      <p className="text-gray-600 mb-6">{t("emptyMessage")}</p>
      <Link href="/products">
        <Button variant="primary">{t("continueShopping")}</Button>
      </Link>
    </div>
  );
}
