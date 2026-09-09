import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import { createProduct } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/admin/products" className="hover:underline">
          Товары
        </Link>{" "}
        / <span className="text-gray-900">Новый</span>
      </nav>
      <h1 className="text-2xl font-bold">Новый товар</h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Создать товар"
      />
    </div>
  );
}
