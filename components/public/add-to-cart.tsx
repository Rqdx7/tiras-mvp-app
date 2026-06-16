"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  stockQuantity: number;
};

export function AddToCart({ variants }: { variants: Variant[] }) {
  const available = variants.filter((variant) => variant.stockQuantity > 0);
  const [variantId, setVariantId] = useState(available[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const selected = useMemo(() => available.find((variant) => variant.id === variantId), [available, variantId]);

  function add() {
    if (!selected) return;
    const raw = localStorage.getItem("tiras_cart");
    const cart = raw ? (JSON.parse(raw) as { variantId: string; quantity: number }[]) : [];
    const existing = cart.find((item) => item.variantId === selected.id);
    if (existing) existing.quantity = Math.min(existing.quantity + quantity, selected.stockQuantity);
    else cart.push({ variantId: selected.id, quantity: Math.min(quantity, selected.stockQuantity) });
    localStorage.setItem("tiras_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("tiras-cart"));
    toast.success("Produs adăugat în coș.");
  }

  if (!available.length) {
    return <div className="rounded-md border border-[#e2d7c8] bg-white p-4 text-sm text-[#74685c]">Produsul nu este disponibil în stoc.</div>;
  }

  return (
    <div className="space-y-3 rounded-lg border border-[#e2d7c8] bg-white p-4">
      <label className="block text-sm font-medium">Mărime / Culoare</label>
      <Select value={variantId} onChange={(event) => setVariantId(event.target.value)}>
        {available.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {[variant.size ? `Mărime ${variant.size}` : null, variant.color, `${variant.stockQuantity} în stoc`]
              .filter(Boolean)
              .join(" / ")}
          </option>
        ))}
      </Select>
      <label className="block text-sm font-medium">Cantitate</label>
      <Input
        type="number"
        min={1}
        max={selected?.stockQuantity ?? 1}
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value))}
      />
      <Button onClick={add} variant="accent" className="w-full">
        Adaugă în coș
      </Button>
      <p className="text-xs text-[#74685c]">Comanda se confirmă telefonic. Fără plată online.</p>
    </div>
  );
}
