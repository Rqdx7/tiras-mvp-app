import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Produse</h1>
        <Button asChild variant="accent"><Link href="/admin/products/new">Produs nou</Link></Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#e2d7c8] bg-white">
        <Table>
          <thead><tr><Th>Nume</Th><Th>Categorie</Th><Th>Preț</Th><Th>Stoc</Th><Th>Status</Th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={product.deletedAt ? "opacity-55" : ""}>
                <Td><Link className="font-medium text-[#8f5221]" href={`/admin/products/${product.id}`}>{product.name}</Link><div className="text-xs text-[#74685c]">{product.sku}</div></Td>
                <Td>{product.category?.name ?? "-"}</Td>
                <Td>{formatPrice(product.discountPriceCents ?? product.basePriceCents)}</Td>
                <Td>{product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0)}</Td>
                <Td><Badge>{product.deletedAt ? "Șters" : product.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
