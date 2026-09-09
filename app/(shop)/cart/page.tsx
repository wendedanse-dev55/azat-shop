"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, setQty, remove, clear, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line bg-white p-10 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="mt-4 text-xl font-bold text-ink">Корзина пуста</h1>
        <p className="mt-2 text-sm text-muted">
          Добавьте товары из каталога, чтобы оформить заказ.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-ink">Корзина</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-line bg-white p-3"
            >
              <Link
                href={`/product/${item.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/product/${item.slug}`}
                  className="line-clamp-2 font-medium text-ink hover:text-brand"
                >
                  {item.name}
                </Link>
                <div className="mt-1 text-sm text-muted">
                  {formatPrice(item.price)} / шт.
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 rounded-xl border border-line p-0.5">
                    <button
                      onClick={() => setQty(item.id, item.qty - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-ink hover:bg-gray-100"
                      aria-label="Уменьшить"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-ink hover:bg-gray-100"
                      aria-label="Увеличить"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">
                      {formatPrice(item.price * item.qty)}
                    </span>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-muted transition-colors hover:text-sale"
                      aria-label="Удалить"
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clear}
            className="text-sm text-muted transition-colors hover:text-sale"
          >
            Очистить корзину
          </button>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink">Ваш заказ</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Товары ({count})</dt>
              <dd className="text-ink">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Доставка</dt>
              <dd className="text-brand">Бесплатно</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-semibold text-ink">Итого</span>
            <span className="text-2xl font-extrabold text-ink">
              {formatPrice(total)}
            </span>
          </div>
          <Link
            href="/checkout"
            className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Перейти к оформлению
          </Link>
        </aside>
      </div>
    </div>
  );
}
