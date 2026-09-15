"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CategoryIcon, { CATEGORY_COLORS } from "./CategoryIcon";
import { SITE_WHATSAPP } from "@/lib/site";

interface Cat {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const GridIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </svg>
);

// Marketplace-style category sidebar: gradient header, "all products" entry,
// count pills, an accent bar on the active category, and a help card.
export default function CategorySidebar({
  categories,
  className = "",
}: {
  categories: Cat[];
  className?: string;
}) {
  const pathname = usePathname();
  const wa = `https://wa.me/${SITE_WHATSAPP}?text=${encodeURIComponent(
    "Здравствуйте! Помогите с выбором.",
  )}`;

  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-white shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-brand to-brand-dark px-4 py-3.5 text-white">
        <GridIcon className="h-5 w-5" />
        <span className="text-sm font-bold">Категории</span>
      </div>

      <nav className="p-2">
        {/* All products */}
        <Link
          href="/search"
          className="group mb-1 flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-gray-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <GridIcon className="h-5 w-5" />
          </span>
          <span className="flex-1 text-sm font-semibold text-ink group-hover:text-brand">
            Все товары
          </span>
          <span className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand">
            ›
          </span>
        </Link>

        <div className="my-1 h-px bg-line" />

        {categories.map((c, i) => {
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          const active = pathname === `/category/${c.slug}`;
          return (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${
                active ? "bg-brand-soft" : "hover:bg-gray-50"
              }`}
            >
              {active && (
                <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-brand" />
              )}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color.bg} ${color.fg} transition-transform group-hover:scale-105`}
              >
                <CategoryIcon name={c.name} className="h-5 w-5" />
              </span>
              <span
                className={`flex-1 truncate text-sm font-medium ${
                  active ? "text-brand" : "text-ink group-hover:text-brand"
                }`}
              >
                {c.name}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  active
                    ? "bg-white text-brand"
                    : "bg-gray-100 text-muted group-hover:bg-brand-soft group-hover:text-brand"
                }`}
              >
                {c.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Help card */}
      <div className="border-t border-line p-3">
        <div className="rounded-xl bg-brand-soft p-3.5">
          <div className="text-sm font-semibold text-ink">Нужна помощь с выбором?</div>
          <p className="mt-0.5 text-xs text-muted">Подскажем и рассчитаем смету.</p>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Написать в WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
