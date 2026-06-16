import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/validations/schemas";

export async function POST(request: Request) {
  const user = await requireManager();
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datele produsului nu sunt valide." }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku || null,
      categoryId: parsed.data.categoryId || null,
      shortDescription: parsed.data.shortDescription || null,
      longDescription: parsed.data.longDescription || null,
      material: parsed.data.material || null,
      manufacturer: parsed.data.manufacturer || null,
      gender: parsed.data.gender || null,
      basePriceCents: parsed.data.basePriceCents,
      discountPriceCents: parsed.data.discountPriceCents || null,
      isRecommended: parsed.data.isRecommended,
      isFeatured: parsed.data.isFeatured,
      status: parsed.data.status,
      variants: { create: parsed.data.variants },
      images: {
        create: parsed.data.imageUrls.map((url, index) => ({
          url,
          alt: parsed.data.name,
          sortOrder: index,
          isMain: index === 0,
        })),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "product_create",
      entityType: "Product",
      entityId: product.id,
      metadata: JSON.stringify({ name: product.name }),
    },
  });
  revalidatePath("/catalog");
  revalidatePath("/admin/products");
  return NextResponse.json({ ok: true, id: product.id });
}
