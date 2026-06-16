import { CategoryManager } from "@/components/admin/category-manager";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Categorii</h1>
      <CategoryManager />
      <div className="overflow-x-auto rounded-lg border border-[#e2d7c8] bg-white">
        <Table>
          <thead><tr><Th>Nume</Th><Th>Slug</Th><Th>Status</Th></tr></thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <Td>{category.name}</Td>
                <Td>{category.slug}</Td>
                <Td><Badge>{category.active && !category.deletedAt ? "Activă" : "Inactivă"}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
