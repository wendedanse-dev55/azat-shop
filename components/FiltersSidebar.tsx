import Link from "next/link";
import { CURRENCY } from "@/lib/format";

interface Props {
  action: string;
  hidden?: Record<string, string>;
  min?: string;
  max?: string;
  instock?: boolean;
  resetHref: string;
}

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default function FiltersSidebar({
  action,
  hidden = {},
  min,
  max,
  instock,
  resetHref,
}: Props) {
  return (
    <form
      method="get"
      action={action}
      className="rounded-2xl border border-line bg-white p-4"
    >
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      <p className="mb-3 text-sm font-bold text-ink">Фильтры</p>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Цена, {CURRENCY}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min"
              min="0"
              defaultValue={min ?? ""}
              placeholder="от"
              className={field}
            />
            <span className="text-muted">—</span>
            <input
              type="number"
              name="max"
              min="0"
              defaultValue={max ?? ""}
              placeholder="до"
              className={field}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="instock"
            value="1"
            defaultChecked={instock}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Только в наличии
        </label>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            className="h-10 rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Применить
          </button>
          <Link
            href={resetHref}
            className="flex h-10 items-center justify-center rounded-xl border border-line text-sm font-medium text-muted transition-colors hover:border-brand hover:text-brand"
          >
            Сбросить
          </Link>
        </div>
      </div>
    </form>
  );
}
