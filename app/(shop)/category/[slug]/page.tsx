import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import CategoryIcon from "@/components/CategoryIcon";
import FiltersSidebar from "@/components/FiltersSidebar";
import SortBar from "@/components/SortBar";
import {
  buildOrderBy,
  buildPriceFilter,
  mergeQuery,
  PRODUCT_CARD_SELECT,
} from "@/lib/product-query";

export const dynamic = "force-dynamic";

interface SearchParams {
  sort?: string;
  min?: string;
  max?: string;
  instock?: string;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const where: Prisma.ProductWhereInput = { categoryId: category.id };
  const priceFilter = buildPriceFilter(sp.min, sp.max);
  if (priceFilter) where.price = priceFilter;
  if (sp.instock === "1") where.stock = { gt: 0 };

  const products = await prisma.product.findMany({
    where,
    orderBy: buildOrderBy(sp.sort),
    select: PRODUCT_CARD_SELECT,
  });

  const basePath = `/category/${slug}`;
  const current: Record<string, string | undefined> = {
    sort: sp.sort,
    min: sp.min,
    max: sp.max,
    instock: sp.instock,
  };

  return (
    <div className="space-y-5">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">Главная</Link> /{" "}
        <Link href="/catalog" className="hover:text-brand">Каталог</Link> /{" "}
        <span className="text-ink">{category.name}</span>
      </nav>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <CategoryIcon name={category.name} className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-ink">{category.name}</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <FiltersSidebar
            action={basePath}
            hidden={sp.sort ? { sort: sp.sort } : {}}
            min={sp.min}
            max={sp.max}
            instock={sp.instock === "1"}
            resetHref={`${basePath}${mergeQuery({ sort: sp.sort })}`}
          />
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <SortBar
            basePath={basePath}
            current={current}
            sort={sp.sort ?? "popular"}
            total={products.length}
          />

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-muted">
              Товары не найдены. Попробуйте изменить фильтры.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
