import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import CategoryIcon, { CATEGORY_COLORS } from "@/components/CategoryIcon";
import CategorySidebar from "@/components/CategorySidebar";
import ServicesSection from "@/components/ServicesSection";
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

  const sidebarCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c._count.products,
  }));

  return (
    <div className="space-y-6">
      {/* Hero slideshow — admin banners if any, otherwise auto promo slides */}
      <HeroCarousel
        slides={
          banners.length
            ? bannersToSlides(banners)
            : buildHeroSlides(discounted, popular)
        }
      />

      {/* Mobile category rail (sidebar is desktop-only) */}
      {categories.length > 0 && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
          {categories.map((c, i) => {
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            return (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-ink transition-colors hover:border-brand"
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${color.bg} ${color.fg}`}>
                  <CategoryIcon name={c.name} className="h-4 w-4" />
                </span>
                {c.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Category sidebar + main content */}
      <div className="lg:flex lg:gap-6">
        {categories.length > 0 && (
          <aside className="hidden shrink-0 lg:block lg:w-60">
            <div className="sticky top-24">
              <CategorySidebar categories={sidebarCategories} />
            </div>
          </aside>
        )}

        <div className="min-w-0 flex-1 space-y-10">
          {/* Services */}
          <ServicesSection />

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
      </div>
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
