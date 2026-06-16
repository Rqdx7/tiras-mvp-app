"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";

type CartItem = { variantId: string; quantity: number };
type ProductItem = {
  variantId: string;
  slug: string;
  name: string;
  imageUrl: string;
  size: string | null;
  color: string | null;
  stockQuantity: number;
  priceCents: number;
};

export function CartPage({ user }: { user: { firstName?: string; lastName?: string; phone?: string; email?: string } | null }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("tiras_cart");
    return raw ? JSON.parse(raw) : [];
  });
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!cart.length) {
      Promise.resolve().then(() => setProducts([]));
      return;
    }
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantIds: cart.map((item) => item.variantId) }),
    })
      .then((response) => response.json())
      .then((data) => {
        const items: ProductItem[] = data.items ?? [];
        setProducts(items);
        // Remove stale cart entries whose variant no longer exists in DB
        const validIds = new Set(items.map((item) => item.variantId));
        const cleaned = cart.filter((item) => validIds.has(item.variantId));
        if (cleaned.length !== cart.length) {
          setCart(cleaned);
          localStorage.setItem("tiras_cart", JSON.stringify(cleaned));
          window.dispatchEvent(new Event("tiras-cart"));
        }
      })
      .catch(() => {/* keep existing cart state on network error */});
  }, [cart]);

  const rows = cart
    .map((item) => ({ ...item, product: products.find((product) => product.variantId === item.variantId) }))
    .filter((item) => item.product);
  const total = useMemo(
    () => rows.reduce((sum, item) => sum + item.quantity * (item.product?.priceCents ?? 0), 0),
    [rows],
  );

  function updateQuantity(variantId: string, quantity: number) {
    const next = cart.map((item) => (item.variantId === variantId ? { ...item, quantity: Math.max(quantity, 1) } : item));
    setCart(next);
    localStorage.setItem("tiras_cart", JSON.stringify(next));
    window.dispatchEvent(new Event("tiras-cart"));
  }

  function removeItem(variantId: string) {
    const next = cart.filter((item) => item.variantId !== variantId);
    setCart(next);
    localStorage.setItem("tiras_cart", JSON.stringify(next));
    window.dispatchEvent(new Event("tiras-cart"));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        phone: form.get("phone"),
        email: form.get("email"),
        locality: form.get("locality"),
        deliveryMethod: form.get("deliveryMethod"),
        comment: form.get("comment"),
        honeypot: form.get("website"),
        items: rows.map(({ variantId, quantity }) => ({ variantId, quantity })),
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      toast.error(data.error ?? "Cererea nu a putut fi trimisă.");
      return;
    }
    localStorage.removeItem("tiras_cart");
    window.dispatchEvent(new Event("tiras-cart"));
    setCart([]);
    setSuccess(`Cererea ${data.orderNumber} a fost trimisă. Operatorul te va contacta telefonic.`);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-[#e2d7c8] bg-white p-8 text-center">
          <h1 className="text-3xl font-semibold">Cererea ta a fost trimisă</h1>
          <p className="mt-3 text-[#74685c]">{success}</p>
          <Button asChild className="mt-5" variant="accent">
            <Link href="/catalog">Înapoi la catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_420px]">
      <section>
        <h1 className="text-3xl font-semibold">Cererea ta</h1>
        <p className="mt-2 text-sm text-[#74685c]">Comandă cu confirmare telefonică. Fără plată online.</p>
        <div className="mt-5 space-y-3">
          {rows.length ? (
            rows.map(({ product, quantity, variantId }) => (
              <div key={variantId} className="grid grid-cols-[88px_1fr] gap-4 rounded-lg border border-[#e2d7c8] bg-white p-3">
                <div className="relative aspect-square overflow-hidden rounded-md bg-[#efe7dc]">
                  <Image src={product!.imageUrl} alt={product!.name} fill className="object-cover" />
                </div>
                <div className="space-y-2">
                  <Link href={`/catalog/${product!.slug}`} className="font-medium hover:text-[#a7642c]">
                    {product!.name}
                  </Link>
                  <p className="text-sm text-[#74685c]">
                    {[product!.size ? `Mărime ${product!.size}` : null, product!.color].filter(Boolean).join(" / ")}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      className="w-24"
                      type="number"
                      min={1}
                      max={product!.stockQuantity}
                      value={quantity}
                      onChange={(event) => updateQuantity(variantId, Number(event.target.value))}
                    />
                    <span className="font-medium">{formatPrice(product!.priceCents * quantity)}</span>
                    <button className="text-sm text-red-700 hover:underline" onClick={() => removeItem(variantId)}>
                      Elimină
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-[#e2d7c8] bg-white p-8 text-center text-[#74685c]">Coșul este gol.</div>
          )}
        </div>
      </section>

      <form onSubmit={submit} className="h-fit space-y-3 rounded-lg border border-[#e2d7c8] bg-white p-5">
        <h2 className="text-xl font-semibold">Date pentru contact</h2>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
        <Input name="firstName" placeholder="Prenume" required defaultValue={user?.firstName ?? ""} />
        <Input name="lastName" placeholder="Nume" required defaultValue={user?.lastName ?? ""} />
        <Input name="phone" placeholder="Telefon, obligatoriu" required defaultValue={user?.phone ?? ""} />
        <Input name="email" type="email" placeholder="Email, opțional" defaultValue={user?.email ?? ""} />
        <Input name="locality" placeholder="Oraș/localitate, opțional" />
        <Select name="deliveryMethod" defaultValue="PICKUP">
          <option value="PICKUP">Ridicare din magazin</option>
          <option value="AGREEMENT">Livrare prin înțelegere</option>
        </Select>
        <Textarea name="comment" placeholder="Comentariu, opțional" />
        <div className="flex items-center justify-between border-t border-[#e2d7c8] pt-3">
          <span className="text-sm text-[#74685c]">Total estimativ</span>
          <span className="text-xl font-semibold">{formatPrice(total)}</span>
        </div>
        <Button type="submit" variant="accent" className="w-full" disabled={!rows.length || loading}>
          {loading ? "Se trimite..." : "Trimite cererea"}
        </Button>
      </form>
    </div>
  );
}
