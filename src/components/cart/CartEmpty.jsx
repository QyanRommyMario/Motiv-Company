"use client";

/**
 * CartEmpty Component
 * Display when cart is empty
 */

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CartEmpty() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Keranjang Belanja Kosong
      </h2>
      <p className="text-gray-600 mb-6">
        Yuk, mulai belanja dan tambahkan produk favorit Anda!
      </p>
      <Link href="/products">
        <Button variant="primary">Mulai Belanja</Button>
      </Link>
    </div>
  );
}
