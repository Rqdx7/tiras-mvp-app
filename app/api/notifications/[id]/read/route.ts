import { NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return NextResponse.json({ error: "Notificarea nu există." }, { status: 404 });
  const current = await getCurrentUser();
  const isAdminAudience = notification.audience === "ADMIN" && ["SELLER", "ADMIN", "ROOT_ADMIN"].includes(user.role);
  if (!isAdminAudience && notification.userId !== current?.id) {
    return NextResponse.json({ error: "Acces refuzat." }, { status: 403 });
  }
  await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  return NextResponse.json({ ok: true });
}
