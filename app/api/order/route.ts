import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { DELIVERY_METHODS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { orderSchema } from "@/validations/schemas";

function timeline(status: string, note: string) {
  return JSON.stringify([{ status, note, at: new Date().toISOString() }]);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success || parsed.data.honeypot) {
    return NextResponse.json({ error: "Verifică datele comenzii." }, { status: 400 });
  }

  const currentUser = await getCurrentUser();
  const requested = parsed.data.items;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: requested.map((item) => item.variantId) }, deletedAt: null },
        include: { product: true },
      });

      const byId = new Map(variants.map((variant) => [variant.id, variant]));
      for (const item of requested) {
        const variant = byId.get(item.variantId);
        if (!variant || variant.product.status !== "active" || variant.product.deletedAt) {
          throw new Error("Produsul nu mai este disponibil.");
        }
        if (variant.stockQuantity < item.quantity) {
          throw new Error(`Stoc insuficient pentru ${variant.product.name}.`);
        }
      }

      for (const item of requested) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      const count = await tx.order.count();
      const orderNumber = `TIRAS-${String(count + 1).padStart(6, "0")}`;
      const items = requested.map((item) => {
        const variant = byId.get(item.variantId)!;
        const unitPriceCents =
          variant.discountOverrideCents ??
          variant.priceOverrideCents ??
          variant.product.discountPriceCents ??
          variant.product.basePriceCents;
        return {
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          variantLabel: [variant.size ? `Mărime ${variant.size}` : null, variant.color].filter(Boolean).join(" / "),
          sku: variant.sku ?? variant.product.sku,
          unitPriceCents,
          quantity: item.quantity,
          lineTotalCents: unitPriceCents * item.quantity,
        };
      });
      const total = items.reduce((sum, item) => sum + item.lineTotalCents, 0);

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: currentUser?.id ?? null,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          email: parsed.data.email || null,
          locality: parsed.data.locality || null,
          deliveryMethod: DELIVERY_METHODS[parsed.data.deliveryMethod],
          comment: parsed.data.comment || null,
          estimatedTotalCents: total,
          statusTimeline: timeline("NEW", "Cerere trimisă de client. Stocul a fost rezervat."),
          items: { create: items },
        },
        include: { items: true },
      });

      await tx.notification.create({
        data: {
          audience: "ADMIN",
          title: "Comandă nouă",
          message: `${created.orderNumber} - ${created.firstName} ${created.lastName}, ${created.phone}`,
          entityType: "Order",
          entityId: created.id,
        },
      });

      if (currentUser?.id) {
        await tx.notification.create({
          data: {
            userId: currentUser.id,
            audience: "CUSTOMER",
            title: "Cererea a fost primită",
            message: `${created.orderNumber} a fost transmisă. Operatorul te va contacta telefonic.`,
            entityType: "Order",
            entityId: created.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: currentUser?.id ?? null,
          action: "order_create",
          entityType: "Order",
          entityId: created.id,
          metadata: JSON.stringify({ orderNumber: created.orderNumber, total }),
        },
      });

      return created;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  } catch (error) {
    await audit(currentUser, "order_create_failed", "Order", null, { error: String(error) });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comanda nu a putut fi creată." },
      { status: 400 },
    );
  }
}
