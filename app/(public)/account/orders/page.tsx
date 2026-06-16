import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, orderStatusLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = user.id
    ? await prisma.order.findMany({
        where: { userId: user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Comenzile mele</h1>
          <p className="mt-2 text-sm text-[#74685c]">Istoricul cererilor trimise către Tiras.</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <Button variant="outline" size="sm">Ieșire</Button>
        </form>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border border-[#e2d7c8] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">{order.orderNumber}</div>
                <div className="text-sm text-[#74685c]">{order.createdAt.toLocaleDateString("ro-MD")}</div>
              </div>
              <Badge>{orderStatusLabel(order.status)}</Badge>
              <div className="font-semibold">{formatPrice(order.estimatedTotalCents)}</div>
            </div>
            <p className="mt-2 text-sm text-[#74685c]">{order.items.length} produse. Confirmare telefonică.</p>
          </div>
        ))}
        {!orders.length ? (
          <div className="rounded-lg border border-[#e2d7c8] bg-white p-8 text-center">
            <p className="text-[#74685c]">Nu ai comenzi înregistrate.</p>
            <Button asChild className="mt-4" variant="accent">
              <Link href="/catalog">Mergi la catalog</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
