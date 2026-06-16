import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusSchema } from "@/validations/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Status invalid." }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    if (parsed.data.status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    const currentTimeline = order.statusTimeline ? JSON.parse(order.statusTimeline) : [];
    currentTimeline.push({
      status: parsed.data.status,
      note: parsed.data.internalNotes || `Status schimbat de ${user.name}`,
      at: new Date().toISOString(),
    });

    await tx.order.update({
      where: { id },
      data: {
        status: parsed.data.status,
        internalNotes: parsed.data.internalNotes || order.internalNotes,
        statusTimeline: JSON.stringify(currentTimeline),
      },
    });

    if (order.userId) {
      await tx.notification.create({
        data: {
          userId: order.userId,
          audience: "CUSTOMER",
          title: "Status comandă actualizat",
          message: `${order.orderNumber}: ${parsed.data.status}`,
          entityType: "Order",
          entityId: order.id,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "order_status_change",
        entityType: "Order",
        entityId: order.id,
        metadata: JSON.stringify({ from: order.status, to: parsed.data.status }),
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return NextResponse.json({ ok: true });
}
