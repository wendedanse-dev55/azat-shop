import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { PRODUCT_CARD_SELECT } from "@/lib/product-query";
import { pluralProducts } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, discounted, popular] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { oldPrice: { not: null }, stock: { gt: 0 } },
      orderBy: { reviewsCount: "desc" },
      take: 6,
      select: PRODUCT_CARD_SELECT,
    }),
    prisma.product.findMany({
      orderBy: { reviewsCount: "desc" },
      take: 12,
      select: PRODUCT_CARD_SELECT,
    }),
  ]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-12 text-white sm:px-12 sm:py-16">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          Скидки до 30%
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Тысячи товаров с быстрой доставкой
        </h1>
        <p className="mt-3 max-w-lg text-white/85">
          Электроника, одежда, товары для дома и спорта — всё в одном месте.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand transition-transform hover:scale-[1.02]"
        >
          Перейти в каталог →
        </Link>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">Категории</h2>
            <Link href="/catalog" className="text-sm font-medium text-brand hover:underline">
              Все категории →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-brand"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand">
                  {c.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink group-hover:text-brand">
                    {c.name}
                  </span>
                  <span className="block text-xs text-muted">
                    {pluralProducts(c._count.products)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Discounts */}
      {discounted.length > 0 && (
        <ProductSection
          title="Скидки дня"
          href="/search?sort=popular"
          products={discounted}
        />
      )}

      {/* Popular */}
      {popular.length > 0 ? (
        <ProductSection title="Популярные товары" href="/search" products={popular} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-muted">
          Товаров пока нет. Добавьте их в{" "}
          <Link href="/admin" className="text-brand underline">
            админ-панели
          </Link>
          .
        </div>
      )}
    </div>
  );
}

function ProductSection({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: React.ComponentProps<typeof ProductCard>["product"][];
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <Link href={href} className="text-sm font-medium text-brand hover:underline">
          Все →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
