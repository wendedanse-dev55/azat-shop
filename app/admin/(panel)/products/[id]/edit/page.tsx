import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import { updateProduct } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/admin/products" className="hover:underline">
          Товары
        </Link>{" "}
        / <span className="text-gray-900">{product.name}</span>
      </nav>
      <h1 className="text-2xl font-bold">Редактировать товар</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        product={product}
        submitLabel="Сохранить изменения"
      />
    </div>
  );
}
