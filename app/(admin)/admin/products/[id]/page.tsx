import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getActiveCategories } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true, images: true } }),
    getActiveCategories(),
  ]);
  if (!product) notFound();
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Editează produs</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
