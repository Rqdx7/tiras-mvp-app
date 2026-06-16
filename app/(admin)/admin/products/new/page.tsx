import { ProductForm } from "@/components/admin/product-form";
import { getActiveCategories } from "@/lib/data";

export default async function NewProductPage() {
  const categories = await getActiveCategories();
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Produs nou</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
