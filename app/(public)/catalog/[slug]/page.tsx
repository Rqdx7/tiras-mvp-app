import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/public/add-to-cart";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Produs" };
  return {
    title: product.name,
    description: product.shortDescription ?? "Produs Tiras cu confirmare telefonică.",
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: "active", deletedAt: null },
    include: {
      category: true,
      images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }] },
      variants: { where: { deletedAt: null }, orderBy: [{ size: "asc" }, { color: "asc" }] },
    },
  });
  if (!product) notFound();

  const mainImage = product.images[0]?.url ?? "/placeholder-product.svg";
  const colors = [...new Set(product.variants.map((variant) => variant.color).filter(Boolean))];
  const sizes = [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1.05fr_.95fr]">
      <div className="space-y-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#e2d7c8] bg-[#efe7dc]">
          <Image src={mainImage} alt={product.name} fill priority className="object-cover" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {product.images.slice(1, 5).map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-md border border-[#e2d7c8] bg-white">
              <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {product.category ? <Badge>{product.category.name}</Badge> : null}
            {product.discountPriceCents ? <Badge>Reducere</Badge> : null}
            {product.isRecommended ? <Badge>Recomandat</Badge> : null}
          </div>
          <h1 className="text-3xl font-semibold md:text-4xl">{product.name}</h1>
          <p className="mt-3 text-[#74685c]">{product.shortDescription}</p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-[#8f5221]">
            {formatPrice(product.discountPriceCents ?? product.basePriceCents)}
          </span>
          {product.discountPriceCents ? (
            <span className="text-sm text-[#8d8174] line-through">{formatPrice(product.basePriceCents)}</span>
          ) : null}
        </div>
        <Separator />
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#74685c]">Material</dt>
            <dd className="font-medium">{product.material ?? "Piele"}</dd>
          </div>
          <div>
            <dt className="text-[#74685c]">Culori</dt>
            <dd className="font-medium">{colors.join(", ") || "Disponibil în magazin"}</dd>
          </div>
          <div>
            <dt className="text-[#74685c]">Mărimi</dt>
            <dd className="font-medium">{sizes.join(", ") || "Universal"}</dd>
          </div>
          <div>
            <dt className="text-[#74685c]">Stoc disponibil</dt>
            <dd className="font-medium">{product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0)} buc.</dd>
          </div>
        </dl>
        <AddToCart variants={product.variants} />
        {product.longDescription ? <p className="leading-7 text-[#5f554b]">{product.longDescription}</p> : null}
      </div>
    </div>
  );
}
