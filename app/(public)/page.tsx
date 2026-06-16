import Link from "next/link";
import Image from "next/image";
import { Phone, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/public/product-card";
import { getActiveCategories, getSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [settings, categories, products] = await Promise.all([
    getSettings(),
    getActiveCategories(),
    prisma.product.findMany({
      where: { status: "active", deletedAt: null, isRecommended: true },
      include: {
        images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }] },
        variants: { where: { deletedAt: null } },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <section className="border-b border-[#e1d5c5] bg-[#efe7dc]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-[1.05fr_.95fr] md:py-16">
          <div className="space-y-6">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-[#8f5221]">Tiras Leova</div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#2d2925] md:text-6xl">
              Încălțăminte și accesorii din piele, alese pentru purtare de zi cu zi.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#5f554b] md:text-lg">{settings.homepageIntro}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/catalog">
                  <ShoppingBag className="h-4 w-4" />
                  Catalog produse
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={`tel:${settings.phone.replaceAll(" ", "")}`}>
                  <Phone className="h-4 w-4" />
                  Comandă telefonic
                </a>
              </Button>
            </div>
            <p className="text-sm text-[#74685c]">Comanda se confirmă telefonic. Fără plată online.</p>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-[#d8c2aa] bg-[#efe7dc] md:min-h-[460px]">
            <Image src="/logo.png" alt="Tiras — încălțăminte și accesorii din piele" fill priority className="object-contain p-6" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Categorii</h2>
          <Link href="/catalog" className="text-sm text-[#8f5221] hover:underline">
            Vezi tot catalogul
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.slice(0, 10).map((category) => (
            <Link
              key={category.id}
              href={`/catalog?category=${category.slug}`}
              className="rounded-lg border border-[#e2d7c8] bg-white px-4 py-3 text-sm font-medium hover:border-[#a7642c]"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Produse recomandate</h2>
          <Link href="/catalog?sort=recommended" className="text-sm text-[#8f5221] hover:underline">
            Mai multe
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-[#3a332d] text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Promoții în magazin</h2>
            <p className="mt-2 text-sm text-[#d8c8b5]">
              Ofertele speciale vor fi prezentate separat. Catalogul rămâne lista completă de produse disponibile.
            </p>
          </div>
          <Button asChild variant="accent">
            <Link href="/catalog">Deschide catalogul</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-2xl font-semibold">Cum funcționează comanda</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {["Alegi produsele", "Trimiți cererea", "Operatorul te contactează telefonic"].map((step, index) => (
            <Card key={step}>
              <CardHeader>
                <CardTitle>{index + 1}. {step}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#74685c]">
                Stocul este verificat local, iar confirmarea finală se face prin apel telefonic.
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
