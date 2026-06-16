import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const orders = await prisma.order.findMany({
  include: { items: true },
  orderBy: { createdAt: "desc" },
  take: 5,
});
console.log("Comenzi:", JSON.stringify(orders.map(o => ({
  orderNumber: o.orderNumber,
  status: o.status,
  firstName: o.firstName,
  total: o.estimatedTotalCents,
  itemsCount: o.items.length,
})), null, 2));

await prisma.$disconnect();
