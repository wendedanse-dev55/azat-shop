import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
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
  q?: string;
  sort?: string;
  min?: string;
  max?: string;
  instock?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const where: Prisma.ProductWhereInput = {};
  const priceFilter = buildPriceFilter(sp.min, sp.max);
  if (priceFilter) where.price = priceFilter;
  if (sp.instock === "1") where.stock = { gt: 0 };

  let products = await prisma.product.findMany({
    where,
    orderBy: buildOrderBy(sp.sort),
    select: PRODUCT_CARD_SELECT,
  });

  // SQLite `contains` is case-sensitive for Cyrillic, so filter in JS for a
  // correct case-insensitive match. Fine for a demo-sized catalog.
  if (q) {
    const ql = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(ql) ||
        p.category?.name.toLowerCase().includes(ql),
    );
  }

  const basePath = "/search";
  const current: Record<string, string | undefined> = {
    q: q || undefined,
    sort: sp.sort,
    min: sp.min,
    max: sp.max,
    instock: sp.instock,
  };
  const hidden: Record<string, string> = {};
  if (q) hidden.q = q;
  if (sp.sort) hidden.sort = sp.sort;

  return (
    <div className="space-y-5">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">Главная</Link> /{" "}
        <span className="text-ink">Поиск</span>
      </nav>

      <h1 className="text-2xl font-bold text-ink">
        {q ? (
          <>
            Результаты по запросу{" "}
            <span className="text-brand">«{q}»</span>
          </>
        ) : (
          "Все товары"
        )}
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <FiltersSidebar
            action={basePath}
            hidden={hidden}
            min={sp.min}
            max={sp.max}
            instock={sp.instock === "1"}
            resetHref={`${basePath}${mergeQuery({ q: q || undefined, sort: sp.sort })}`}
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
              {q
                ? `По запросу «${q}» ничего не найдено.`
                : "Товары не найдены. Попробуйте изменить фильтры."}
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
