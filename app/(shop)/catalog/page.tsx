import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pluralProducts } from "@/lib/format";
import CategoryIcon, { CATEGORY_COLORS } from "@/components/CategoryIcon";

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
          {categories.map((c, i) => {
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            return (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-lg hover:shadow-black/5"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color.bg} ${color.fg} transition-transform duration-200 group-hover:scale-110`}
                >
                  <CategoryIcon name={c.name} className="h-7 w-7" />
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
            );
          })}
        </div>
      )}
    </div>
  );
}
