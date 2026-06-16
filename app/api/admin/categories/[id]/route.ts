import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireManager();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  await prisma.category.update({
    where: { id },
    data: {
      name: String(body.name),
      slug: String(body.slug || slugify(String(body.name))),
      description: String(body.description ?? ""),
      sortOrder: Number(body.sortOrder ?? 0),
      active: body.active !== false,
    },
  });
  await prisma.auditLog.create({ data: { userId: user.id, action: "category_update", entityType: "Category", entityId: id } });
  revalidatePath("/catalog");
  revalidatePath("/admin/categories");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireManager();
  const { id } = await params;
  await prisma.category.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  await prisma.auditLog.create({ data: { userId: user.id, action: "category_delete", entityType: "Category", entityId: id } });
  revalidatePath("/catalog");
  revalidatePath("/admin/categories");
  return NextResponse.json({ ok: true });
}
