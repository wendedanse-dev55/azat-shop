import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import CategoryIcon, { CATEGORY_COLORS } from "@/components/CategoryIcon";
import { PRODUCT_CARD_SELECT } from "@/lib/product-query";
import { pluralProducts } from "@/lib/format";
import { productImages } from "@/lib/images";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banners, categories, discounted, popular] = await Promise.all([
    prisma.banner.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
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
      {/* Hero slideshow — admin banners if any, otherwise auto promo slides */}
      <HeroCarousel
        slides={
          banners.length
            ? bannersToSlides(banners)
            : buildHeroSlides(discounted, popular)
        }
      />

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
            {categories.map((c, i) => {
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-lg hover:shadow-black/5"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color.bg} ${color.fg} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <CategoryIcon name={c.name} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink group-hover:text-brand">
                      {c.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {pluralProducts(c._count.products)}
                    </span>
                  </span>
                  <span
                    className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full ${color.bg} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-70`}
                    aria-hidden="true"
                  />
                  <span className="ml-auto shrink-0 translate-x-1 text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-brand group-hover:opacity-100">
                    →
                  </span>
                </Link>
              );
            })}
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

const HERO_THEMES = [
  "bg-gradient-to-br from-brand to-brand-dark",
  "bg-gradient-to-br from-[#082f49] via-brand-dark to-brand",
  "bg-gradient-to-tr from-brand-dark via-brand to-[#38bdf8]",
  "bg-gradient-to-br from-[#082f49] via-brand-dark to-[#0ea5e9]",
];

// Admin-managed banners → hero slides. The gradient is auto-assigned so
// editors only manage content (tag / title / description / photo / button).
function bannersToSlides(
  banners: {
    id: string;
    title: string;
    description: string | null;
    tag: string | null;
    imageUrl: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
  }[],
): HeroSlide[] {
  return banners.map((b, i) => ({
    id: b.id,
    eyebrow: b.tag ?? undefined,
    title: b.title,
    subtitle: b.description ?? undefined,
    ctaLabel: b.ctaLabel ?? undefined,
    ctaHref: b.ctaHref ?? undefined,
    theme: HERO_THEMES[i % HERO_THEMES.length],
    image: b.imageUrl,
  }));
}

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
      theme: "bg-gradient-to-br from-[#082f49] via-brand-dark to-brand",
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
      theme: "bg-gradient-to-tr from-brand-dark via-brand to-[#38bdf8]",
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
    theme: "bg-gradient-to-br from-[#082f49] via-brand-dark to-[#0ea5e9]",
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
