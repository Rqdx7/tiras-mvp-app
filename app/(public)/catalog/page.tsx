import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/public/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getActiveCategories, getCatalogProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Catalog produse",
  description: "Catalog Tiras cu încălțăminte și accesorii din piele. Fără plată online, confirmare telefonică.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ products, total, page, pages }, categories] = await Promise.all([
    getCatalogProducts(params),
    getActiveCategories(),
  ]);
  const discountActive = ["true", "1", "yes", "on"].includes(String(params.discount ?? ""));

  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string" && key !== "page" && value) query.set(key, value);
    });
    query.set("page", String(nextPage));
    return `/catalog?${query.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Catalog produse</h1>
        <p className="mt-2 text-sm text-[#74685c]">Caută, filtrează și trimite o cerere. Comanda se confirmă telefonic.</p>
      </div>

      <form className="mb-6 grid gap-3 rounded-lg border border-[#e2d7c8] bg-white p-4 md:grid-cols-4 lg:grid-cols-6">
        <Input name="q" placeholder="Caută produse" defaultValue={String(params.q ?? "")} className="md:col-span-2" />
        <Select name="category" defaultValue={String(params.category ?? "")}>
          <option value="">Toate categoriile</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
        <Input name="size" placeholder="Mărime" defaultValue={String(params.size ?? "")} />
        <Input name="color" placeholder="Culoare" defaultValue={String(params.color ?? "")} />
        <Input name="material" placeholder="Material" defaultValue={String(params.material ?? "")} />
        <Select name="gender" defaultValue={String(params.gender ?? "")}>
          <option value="">Toți</option>
          <option value="bărbați">Bărbați</option>
          <option value="femei">Femei</option>
          <option value="unisex">Unisex</option>
        </Select>
        <Input name="min" placeholder="Preț min." defaultValue={String(params.min ?? "")} />
        <Input name="max" placeholder="Preț max." defaultValue={String(params.max ?? "")} />
        <label className="flex h-10 items-center gap-2 rounded-md border border-[#d7c9b8] bg-[#fff8ef] px-3 text-sm font-medium text-[#6e411e]">
          <input
            type="checkbox"
            name="discount"
            value="true"
            defaultChecked={discountActive}
            className="h-4 w-4 accent-[#a7642c]"
          />
          Doar reduceri
        </label>
        <Select name="sort" defaultValue={String(params.sort ?? "discount-desc")}>
          <option value="discount-desc">Cea mai mare reducere</option>
          <option value="recommended">Recomandate</option>
          <option value="newest">Cele mai noi</option>
          <option value="price-asc">Preț crescător</option>
          <option value="price-desc">Preț descrescător</option>
        </Select>
        <Button type="submit" variant="accent">
          Filtrează
        </Button>
      </form>

      <div className="mb-4 text-sm text-[#74685c]">{total} produse găsite</div>
      {products.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#e2d7c8] bg-white p-8 text-center text-[#74685c]">
          Nu am găsit produse pentru filtrele alese.
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={pageHref(Math.max(page - 1, 1))} aria-disabled={page <= 1}>
            Înapoi
          </Link>
        </Button>
        <span className="text-sm text-[#74685c]">
          Pagina {page} din {pages}
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href={pageHref(Math.min(page + 1, pages))} aria-disabled={page >= pages}>
            Înainte
          </Link>
        </Button>
      </div>
    </div>
  );
}
