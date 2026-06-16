"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function QuickAddToCart({ variantId, disabled }: { variantId?: string; disabled?: boolean }) {
  function addToCart() {
    if (!variantId) return;
    const raw = localStorage.getItem("tiras_cart");
    const cart = raw ? (JSON.parse(raw) as { variantId: string; quantity: number }[]) : [];
    const existing = cart.find((item) => item.variantId === variantId);
    if (existing) existing.quantity += 1;
    else cart.push({ variantId, quantity: 1 });
    localStorage.setItem("tiras_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("tiras-cart"));
    toast.success("Produs adăugat în coș.");
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="accent"
      disabled={disabled || !variantId}
      onClick={addToCart}
      title="Adaugă în coș"
      aria-label="Adaugă în coș"
    >
      <ShoppingBag className="h-4 w-4" />
    </Button>
  );
}
