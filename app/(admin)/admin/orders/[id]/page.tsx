import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { prisma } from "@/lib/prisma";
import { formatPrice, orderStatusLabel } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const timeline = order.statusTimeline ? JSON.parse(order.statusTimeline) as { status: string; note: string; at: string }[] : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-[#74685c]">{orderStatusLabel(order.status)} · {order.createdAt.toLocaleString("ro-MD")}</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Produse comandate</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <thead><tr><Th>Produs</Th><Th>Variantă</Th><Th>Cantitate</Th><Th>Total</Th></tr></thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <Td>{item.productName}<div className="text-xs text-[#74685c]">{item.sku}</div></Td>
                    <Td>{item.variantLabel}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>{formatPrice(item.lineTotalCents)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Timeline status</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {timeline.map((entry, index) => (
              <div key={`${entry.at}-${index}`} className="rounded-md bg-[#f7f1e8] p-3">
                <strong>{orderStatusLabel(entry.status)}</strong>
                <p className="text-[#74685c]">{entry.note} · {new Date(entry.at).toLocaleString("ro-MD")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <aside className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Client</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{order.firstName} {order.lastName}</p>
            <p>{order.phone}</p>
            {order.email ? <p>{order.email}</p> : null}
            {order.locality ? <p>{order.locality}</p> : null}
            <p>{order.deliveryMethod}</p>
            {order.comment ? <p className="rounded-md bg-[#f7f1e8] p-3">{order.comment}</p> : null}
            <p className="text-lg font-semibold">{formatPrice(order.estimatedTotalCents)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contactează clientul</CardTitle></CardHeader>
          <CardContent>
            <OrderStatusForm orderId={order.id} status={order.status} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
