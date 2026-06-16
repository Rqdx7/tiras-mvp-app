import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatPrice, orderStatusLabel } from "@/lib/utils";
import { Package } from "lucide-react";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = String(params.status ?? "");
  const q = String(params.q ?? "").trim();
  const orders = await prisma.order.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { phone: { contains: q } },
              { firstName: { contains: q } },
              { lastName: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Comenzi</h1>
      <form className="grid gap-3 rounded-lg border border-[#e2d7c8] bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <Input name="q" placeholder="Telefon, nume, număr comandă" defaultValue={q} />
        <Select name="status" defaultValue={status}>
          <option value="">Toate statusurile</option>
          <option value="NEW">Comenzi noi</option>
          <option value="CONTACTED">Contactat</option>
          <option value="CONFIRMED">Confirmată</option>
          <option value="COMPLETED">Finalizată</option>
          <option value="CANCELLED">Anulată</option>
        </Select>
        <Button variant="accent">Filtrează</Button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-[#e2d7c8] bg-white">
        <Table>
          <thead><tr><Th>Comandă</Th><Th>Client</Th><Th>Status</Th><Th>Total</Th><Th>Data</Th><Th></Th></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#faf7f3]">
                <Td><Link className="font-medium text-[#8f5221] hover:underline" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></Td>
                <Td>{order.firstName} {order.lastName}<div className="text-xs text-[#74685c]">{order.phone}</div></Td>
                <Td><Badge>{orderStatusLabel(order.status)}</Badge></Td>
                <Td>{formatPrice(order.estimatedTotalCents)}</Td>
                <Td>{order.createdAt.toLocaleDateString("ro-MD")}</Td>
                <Td>
                  <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-1 text-sm text-[#8f5221] hover:underline">
                    <Package className="h-4 w-4" />
                    Detalii
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
