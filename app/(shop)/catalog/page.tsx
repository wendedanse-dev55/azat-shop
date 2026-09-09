import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pluralProducts } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          Главная
        </Link>{" "}
        / <span className="text-ink">Каталог</span>
      </nav>

      <h1 className="text-2xl font-bold text-ink">Каталог</h1>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-muted">
          Категорий пока нет.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-2xl font-bold text-brand">
                {c.name.charAt(0)}
              </span>
              <span>
                <span className="block text-lg font-semibold text-ink group-hover:text-brand">
                  {c.name}
                </span>
                <span className="block text-sm text-muted">
                  {pluralProducts(c._count.products)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
