import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { variantIds?: string[] } | null;
  const variantIds = Array.isArray(body?.variantIds) ? body.variantIds : [];
  if (!variantIds.length) return NextResponse.json({ items: [] });

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, deletedAt: null, product: { status: "active", deletedAt: null } },
    include: {
      product: {
        include: { images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }], take: 1 } },
      },
    },
  });

  return NextResponse.json({
    items: variants.map((variant) => {
      const price =
        variant.discountOverrideCents ??
        variant.priceOverrideCents ??
        variant.product.discountPriceCents ??
        variant.product.basePriceCents;
      return {
        variantId: variant.id,
        productId: variant.productId,
        slug: variant.product.slug,
        name: variant.product.name,
        imageUrl: variant.product.images[0]?.url ?? "/placeholder-product.svg",
        size: variant.size,
        color: variant.color,
        sku: variant.sku ?? variant.product.sku,
        stockQuantity: variant.stockQuantity,
        priceCents: price,
      };
    }),
  });
}
