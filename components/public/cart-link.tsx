"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export function CartLink({ compact = false }: { compact?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function sync() {
      const raw = localStorage.getItem("tiras_cart");
      const items = raw ? (JSON.parse(raw) as { quantity: number }[]) : [];
      setCount(items.reduce((sum, item) => sum + item.quantity, 0));
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("tiras-cart", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("tiras-cart", sync);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d7c9b8] bg-white/70 px-3 text-sm text-[#2d2925] transition hover:border-[#a7642c] hover:bg-[#fffaf3]"
      aria-label="Coș"
      title="Coș"
    >
      <ShoppingBag className="h-4 w-4" />
      {compact ? null : <span className="hidden lg:inline">Coș</span>}
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 rounded-full bg-[#a7642c] px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
