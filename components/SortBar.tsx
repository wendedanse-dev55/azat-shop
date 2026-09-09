import Link from "next/link";
import { SORT_OPTIONS, mergeQuery } from "@/lib/product-query";

interface Props {
  basePath: string;
  current: Record<string, string | undefined>;
  sort: string;
  total: number;
}

export default function SortBar({ basePath, current, sort, total }: Props) {
  const active = sort || "popular";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="mr-auto flex flex-wrap items-center gap-1">
        {SORT_OPTIONS.map((opt) => {
          const isActive = active === opt.key;
          return (
            <Link
              key={opt.key}
              href={`${basePath}${mergeQuery(current, { sort: opt.key })}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-gray-100 hover:text-ink"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
      <span className="text-sm text-muted">{total} товаров</span>
    </div>
  );
}
