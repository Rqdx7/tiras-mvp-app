import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatPrice, orderStatusLabel } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [ordersByStatus, lowStock, totalProducts, recentOrders, logs, notifications] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.productVariant.count({ where: { deletedAt: null, stockQuantity: { lte: 2 } } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { items: true } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.notification.findMany({ where: { audience: "ADMIN" }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  const statusMap = Object.fromEntries(ordersByStatus.map((row) => [row.status, row._count]));

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Dashboard admin</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Comenzi noi</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{statusMap.NEW ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>În lucru</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{(statusMap.CONTACTED ?? 0) + (statusMap.CONFIRMED ?? 0)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Stoc redus</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{lowStock}</CardContent></Card>
        <Card><CardHeader><CardTitle>Produse</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{totalProducts}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Comenzi recente</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <thead><tr><Th>Număr</Th><Th>Client</Th><Th>Status</Th><Th>Total</Th></tr></thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <Td><Link className="text-[#8f5221]" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></Td>
                  <Td>{order.firstName} {order.lastName}<div className="text-xs text-[#74685c]">{order.phone}</div></Td>
                  <Td><Badge>{orderStatusLabel(order.status)}</Badge></Td>
                  <Td>{formatPrice(order.estimatedTotalCents)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Notificări</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {notifications.map((item) => <div key={item.id} className="rounded-md bg-[#f7f1e8] p-3">{item.title}<p className="text-[#74685c]">{item.message}</p></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Audit recent</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {logs.map((log) => {
              const meta = log.metadata ? (() => { try { return JSON.parse(log.metadata); } catch { return null; } })() : null;
              const isFailed = log.action.endsWith("_failed");
              return (
                <div key={log.id} className={`rounded-md p-3 ${isFailed ? "bg-red-50 border border-red-100" : "bg-[#f7f1e8]"}`}>
                  <span className={isFailed ? "font-medium text-red-700" : ""}>{log.action}</span>
                  <p className="text-[#74685c]">{log.entityType}{log.entityId ? ` · ${log.entityId}` : ""}</p>
                  {meta?.error ? <p className="mt-1 rounded bg-red-100 px-2 py-1 text-xs text-red-800">{meta.error}</p> : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
