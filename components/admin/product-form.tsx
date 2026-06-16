"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

type Category = { id: string; name: string };
type Product = {
  id?: string;
  name?: string;
  slug?: string;
  sku?: string | null;
  categoryId?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  material?: string | null;
  gender?: string | null;
  basePriceCents?: number;
  discountPriceCents?: number | null;
  isRecommended?: boolean;
  isFeatured?: boolean;
  status?: string;
  variants?: { size?: string | null; color?: string | null; sku?: string | null; stockQuantity: number }[];
  images?: { url: string }[];
};

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const [images, setImages] = useState<string[]>(product?.images?.map((image) => image.url) ?? []);
  const [variants, setVariants] = useState(product?.variants?.length ? product.variants : [{ size: "", color: "", sku: "", stockQuantity: 1 }]);
  const [loading, setLoading] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const data = new FormData();
    Array.from(files).forEach((file) => data.append("images", file));
    const response = await fetch("/api/upload", { method: "POST", body: data });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Upload nereușit.");
      return;
    }
    setImages((current) => [...current, ...payload.uploaded.map((item: { url: string }) => item.url)]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const body = {
      name,
      slug: String(form.get("slug") || slugify(name)),
      sku: String(form.get("sku") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
      shortDescription: String(form.get("shortDescription") ?? ""),
      longDescription: String(form.get("longDescription") ?? ""),
      material: String(form.get("material") ?? ""),
      gender: String(form.get("gender") ?? ""),
      basePriceCents: Math.round(Number(form.get("basePrice")) * 100),
      discountPriceCents: form.get("discountPrice") ? Math.round(Number(form.get("discountPrice")) * 100) : undefined,
      isRecommended: form.get("isRecommended") === "on",
      isFeatured: form.get("isFeatured") === "on",
      status: String(form.get("status")),
      variants: variants.map((variant) => ({
        size: variant.size || "",
        color: variant.color || "",
        sku: variant.sku || "",
        stockQuantity: Number(variant.stockQuantity),
      })),
      imageUrls: images,
    };
    const response = await fetch(product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!response.ok) {
      toast.error("Produsul nu a putut fi salvat.");
      return;
    }
    toast.success("Produs salvat.");
    location.href = "/admin/products";
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="space-y-3 rounded-lg border border-[#e2d7c8] bg-white p-5">
        <Input name="name" placeholder="Nume produs" required defaultValue={product?.name ?? ""} />
        <Input name="slug" placeholder="Slug" defaultValue={product?.slug ?? ""} />
        <Input name="sku" placeholder="SKU/cod" defaultValue={product?.sku ?? ""} />
        <Select name="categoryId" defaultValue={product?.categoryId ?? ""}>
          <option value="">Fără categorie</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </Select>
        <Textarea name="shortDescription" placeholder="Descriere scurtă" defaultValue={product?.shortDescription ?? ""} />
        <Textarea name="longDescription" placeholder="Descriere lungă" defaultValue={product?.longDescription ?? ""} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="material" placeholder="Material" defaultValue={product?.material ?? ""} />
          <Select name="gender" defaultValue={product?.gender ?? ""}>
            <option value="">Target opțional</option>
            <option value="bărbați">Bărbați</option>
            <option value="femei">Femei</option>
            <option value="unisex">Unisex</option>
          </Select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="basePrice" type="number" step="0.01" placeholder="Preț" required defaultValue={(product?.basePriceCents ?? 0) / 100 || ""} />
          <Input name="discountPrice" type="number" step="0.01" placeholder="Preț redus" defaultValue={product?.discountPriceCents ? product.discountPriceCents / 100 : ""} />
        </div>
        <Select name="status" defaultValue={product?.status ?? "active"}>
          <option value="draft">Ciornă</option>
          <option value="active">Activ</option>
          <option value="inactive">Inactiv</option>
        </Select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isRecommended" defaultChecked={product?.isRecommended} /> Recomandat</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} /> Featured</label>
      </section>
      <aside className="space-y-5">
        <section className="space-y-3 rounded-lg border border-[#e2d7c8] bg-white p-5">
          <h2 className="font-semibold">Imagini</h2>
          <Input type="file" multiple accept="image/*" onChange={(event) => upload(event.target.files)} />
          <div className="space-y-2 text-sm">{images.map((image) => <div key={image} className="rounded-md bg-[#f7f1e8] p-2">{image}</div>)}</div>
        </section>
        <section className="space-y-3 rounded-lg border border-[#e2d7c8] bg-white p-5">
          <h2 className="font-semibold">Variante / stoc</h2>
          {variants.map((variant, index) => (
            <div key={index} className="grid gap-2 rounded-md bg-[#f7f1e8] p-3">
              <Input placeholder="Mărime" value={variant.size ?? ""} onChange={(event) => setVariants((all) => all.map((item, i) => i === index ? { ...item, size: event.target.value } : item))} />
              <Input placeholder="Culoare" value={variant.color ?? ""} onChange={(event) => setVariants((all) => all.map((item, i) => i === index ? { ...item, color: event.target.value } : item))} />
              <Input placeholder="SKU variantă" value={variant.sku ?? ""} onChange={(event) => setVariants((all) => all.map((item, i) => i === index ? { ...item, sku: event.target.value } : item))} />
              <Input type="number" placeholder="Stoc" value={variant.stockQuantity} onChange={(event) => setVariants((all) => all.map((item, i) => i === index ? { ...item, stockQuantity: Number(event.target.value) } : item))} />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setVariants((all) => [...all, { size: "", color: "", sku: "", stockQuantity: 1 }])}>Adaugă variantă</Button>
        </section>
        <Button variant="accent" className="w-full" disabled={loading}>{loading ? "Se salvează..." : "Salvează produs"}</Button>
      </aside>
    </form>
  );
}
