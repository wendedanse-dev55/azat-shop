import type { Prisma } from "@prisma/client";

export type SortKey = "popular" | "price_asc" | "price_desc" | "rating" | "new";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Популярные" },
  { key: "price_asc", label: "Сначала дешёвые" },
  { key: "price_desc", label: "Сначала дорогие" },
  { key: "rating", label: "По рейтингу" },
  { key: "new", label: "Новинки" },
];

export function buildOrderBy(
  sort?: string,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "rating":
      return { rating: "desc" };
    case "new":
      return { createdAt: "desc" };
    case "popular":
    default:
      return { reviewsCount: "desc" };
  }
}

export function buildPriceFilter(
  min?: string,
  max?: string,
): Prisma.FloatFilter | undefined {
  const filter: Prisma.FloatFilter = {};
  const mn = min ? parseFloat(min) : NaN;
  const mx = max ? parseFloat(max) : NaN;
  if (Number.isFinite(mn)) filter.gte = mn;
  if (Number.isFinite(mx)) filter.lte = mx;
  return Object.keys(filter).length ? filter : undefined;
}

// Build a query string ("?a=1&b=2") from a params object plus overrides,
// dropping empty values. Used to keep filters/sort/search in sync in links.
export function mergeQuery(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined> = {},
): string {
  const sp = new URLSearchParams();
  const merged = { ...current, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v != null && v !== "") sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// Prisma `select` shared by all product-card queries.
export const PRODUCT_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  oldPrice: true,
  imageUrl: true,
  stock: true,
  rating: true,
  reviewsCount: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;
