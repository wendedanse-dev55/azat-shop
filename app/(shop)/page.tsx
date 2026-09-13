import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import { PRODUCT_CARD_SELECT } from "@/lib/product-query";
import { pluralProducts } from "@/lib/format";
import { productImages } from "@/lib/images";

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
      {/* Hero slideshow */}
      <HeroCarousel slides={buildHeroSlides(discounted, popular)} />

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

type CardProduct = React.ComponentProps<typeof ProductCard>["product"];

// Compose the hero slideshow from a couple of evergreen promos plus real
// featured products (so the banner stays alive as the catalog changes).
function buildHeroSlides(
  discounted: CardProduct[],
  popular: CardProduct[],
): HeroSlide[] {
  const pickImage = (p?: CardProduct) => (p ? productImages(p)[0] ?? null : null);
  const topDeal = discounted.find((p) => p.imageUrl);
  const topPopular = popular.find((p) => p.imageUrl && p.id !== topDeal?.id);

  const slides: HeroSlide[] = [
    {
      id: "promo-catalog",
      eyebrow: "Скидки до 30%",
      title: "Тысячи товаров с быстрой доставкой",
      subtitle:
        "Электроника, одежда, товары для дома и спорта — всё в одном месте.",
      ctaLabel: "Перейти в каталог",
      ctaHref: "/catalog",
      theme: "bg-gradient-to-br from-brand to-brand-dark",
      image: pickImage(topDeal),
    },
  ];

  if (topDeal) {
    slides.push({
      id: `deal-${topDeal.id}`,
      eyebrow: "Скидка дня",
      title: topDeal.name,
      subtitle: "Успейте купить по специальной цене — количество ограничено.",
      ctaLabel: "Смотреть товар",
      ctaHref: `/product/${topDeal.slug}`,
      theme: "bg-gradient-to-br from-[#00401f] via-brand-dark to-brand",
      image: pickImage(topDeal),
    });
  }

  if (topPopular) {
    slides.push({
      id: `hit-${topPopular.id}`,
      eyebrow: "Хит продаж",
      title: topPopular.name,
      subtitle: "Один из самых популярных товаров у наших покупателей.",
      ctaLabel: "Подробнее",
      ctaHref: `/product/${topPopular.slug}`,
      theme: "bg-gradient-to-tr from-brand-dark via-brand to-[#4cc23a]",
      image: pickImage(topPopular),
    });
  }

  slides.push({
    id: "promo-delivery",
    eyebrow: "Доставим завтра",
    title: "Бесплатная доставка от 10 000 ₸",
    subtitle: "Оформите заказ сегодня — привезём уже на следующий день.",
    ctaLabel: "Собрать корзину",
    ctaHref: "/catalog",
    theme: "bg-gradient-to-br from-[#0b3d2e] via-brand-dark to-[#1fa10c]",
    image: null,
  });

  return slides;
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
