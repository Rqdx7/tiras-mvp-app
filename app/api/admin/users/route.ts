import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const actor = await requireManager();
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.role) {
    return NextResponse.json({ error: "Email, parolă și rol sunt obligatorii." }, { status: 400 });
  }
  if (!["CUSTOMER", "SELLER", "ADMIN"].includes(body.role)) {
    return NextResponse.json({ error: "Rol invalid." }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      email: String(body.email).toLowerCase(),
      passwordHash: await bcrypt.hash(String(body.password), 10),
      firstName: String(body.firstName ?? ""),
      lastName: String(body.lastName ?? ""),
      phone: String(body.phone ?? ""),
      role: body.role,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      action: "user_create",
      entityType: "User",
      entityId: user.id,
      metadata: JSON.stringify({ email: user.email, role: user.role }),
    },
  });
  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true, id: user.id });
}

export async function PATCH(request: Request) {
  const actor = await requireManager();
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Utilizator lipsă." }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (body.password) data.passwordHash = await bcrypt.hash(String(body.password), 10);
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.role && ["CUSTOMER", "SELLER", "ADMIN"].includes(body.role)) data.role = body.role;
  if (body.firstName !== undefined) data.firstName = String(body.firstName);
  if (body.lastName !== undefined) data.lastName = String(body.lastName);
  if (body.phone !== undefined) data.phone = String(body.phone);

  const user = await prisma.user.update({ where: { id: String(body.id) }, data });
  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      action: "user_update",
      entityType: "User",
      entityId: user.id,
      metadata: JSON.stringify({ email: user.email }),
    },
  });
  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true });
}
