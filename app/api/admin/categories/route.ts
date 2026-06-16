import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await requireManager();
  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Numele categoriei este obligatoriu." }, { status: 400 });
  const category = await prisma.category.create({
    data: {
      name: String(body.name),
      slug: String(body.slug || slugify(String(body.name))),
      description: String(body.description ?? ""),
      sortOrder: Number(body.sortOrder ?? 0),
      active: body.active !== false,
    },
  });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "category_create", entityType: "Category", entityId: category.id },
  });
  revalidatePath("/catalog");
  revalidatePath("/admin/categories");
  return NextResponse.json({ ok: true });
}
