import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/validations/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireManager();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datele produsului nu sunt valide." }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
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
      },
    });
    await tx.productVariant.deleteMany({ where: { productId: id } });
    await tx.productVariant.createMany({
      data: parsed.data.variants.map((variant) => ({ ...variant, productId: id })),
    });
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productImage.createMany({
      data: parsed.data.imageUrls.map((url, index) => ({
        productId: id,
        url,
        alt: parsed.data.name,
        sortOrder: index,
        isMain: index === 0,
      })),
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "product_update",
        entityType: "Product",
        entityId: id,
        metadata: JSON.stringify({ name: parsed.data.name }),
      },
    });
  });

  revalidatePath("/catalog");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireManager();
  const { id } = await params;
  const deletedAt = new Date();
  await prisma.product.update({ where: { id }, data: { deletedAt, status: "inactive" } });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "product_delete", entityType: "Product", entityId: id },
  });
  revalidatePath("/catalog");
  revalidatePath("/admin/products");
  return NextResponse.json({ ok: true });
}
