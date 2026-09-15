"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CategoryIcon, { CATEGORY_COLORS } from "./CategoryIcon";
import { pluralProducts } from "@/lib/format";

interface Cat {
  id: string;
  name: string;
  slug: string;
  count: number;
}

// Sticky vertical category list (marketplace-style sidebar). Highlights the
// current category on /category/[slug] pages.
export default function CategorySidebar({
  categories,
  className = "",
}: {
  categories: Cat[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-white ${className}`}>
      <div className="border-b border-line px-4 py-3 text-sm font-bold text-ink">
        Категории
      </div>
      <nav className="space-y-0.5 p-2">
        {categories.map((c, i) => {
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          const active = pathname === `/category/${c.slug}`;
          return (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${
                active ? "bg-brand-soft" : "hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color.bg} ${color.fg} transition-transform group-hover:scale-105`}
              >
                <CategoryIcon name={c.name} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm font-medium ${
                    active ? "text-brand" : "text-ink group-hover:text-brand"
                  }`}
                >
                  {c.name}
                </span>
                <span className="block text-xs text-muted">
                  {pluralProducts(c.count)}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
