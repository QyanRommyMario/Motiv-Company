"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ProductCard({ product }) {
  const t = useTranslations("products");

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {/* Image & Price logic tetap sama */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">{product.name}</h3>
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold uppercase tracking-widest border-b border-[#1A1A1A]">
              {t("viewDetail")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
