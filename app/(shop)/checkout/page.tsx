"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { createOrder } from "@/lib/actions";
import { formatPrice } from "@/lib/format";

// Format any input into a Kyrgyzstan phone mask: +996 XXX XX XX XX
function formatKgPhone(value: string): string {
  let d = value.replace(/\D/g, "");
  if (d.startsWith("996")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 9); // 9 subscriber digits
  let out = "+996";
  if (d.length > 0) out += " " + d.slice(0, 3);
  if (d.length > 3) out += " " + d.slice(3, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
}

export default function CheckoutPage() {
  const { items, total, count, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+996 ");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [donePhone, setDonePhone] = useState("");

  // Success screen
  if (doneId) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-3xl text-brand">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink">Заказ оформлен!</h1>
        <p className="mt-2 text-muted">
          Номер заказа{" "}
          <span className="font-semibold text-ink">
            #{doneId.slice(-6).toUpperCase()}
          </span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Мы перезвоним по номеру {donePhone} для подтверждения.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Вернуться в магазин
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line bg-white p-10 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="mt-4 text-xl font-bold text-ink">Корзина пуста</h1>
        <p className="mt-2 text-sm text-muted">
          Добавьте товары, чтобы оформить заказ.
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createOrder({
        name,
        phone,
        comment,
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
      });
      if (res.ok) {
        setDonePhone(phone);
        setDoneId(res.id);
        clear();
      } else {
        setError(res.error);
      }
    } catch {
      setError("Не удалось оформить заказ. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand";
  const label = "mb-1 block text-sm font-medium text-ink";

  return (
    <div className="space-y-5">
      <nav className="text-sm text-muted">
        <Link href="/cart" className="hover:text-brand">
          Корзина
        </Link>{" "}
        / <span className="text-ink">Оформление</span>
      </nav>

      <h1 className="text-2xl font-bold text-ink">Оформление заказа</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Contact form */}
        <form
          id="checkout-form"
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-line bg-white p-5"
        >
          <h2 className="text-lg font-bold text-ink">Контактные данные</h2>

          <div>
            <label className={label} htmlFor="name">
              Имя *
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={field}
              placeholder="Как к вам обращаться"
            />
          </div>

          <div>
            <label className={label} htmlFor="phone">
              Телефон *
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(formatKgPhone(e.target.value))}
              required
              className={field}
              placeholder="+996 XXX XX XX XX"
            />
          </div>

          <div>
            <label className={label} htmlFor="comment">
              Комментарий к заказу
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className={field}
              placeholder="Адрес, удобное время доставки и т.п."
            />
          </div>

          {error && (
            <p className="rounded-lg bg-sale-soft px-3 py-2 text-sm text-sale">
              {error}
            </p>
          )}
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink">Ваш заказ</h2>

          <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm text-ink">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.qty} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {formatPrice(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-semibold text-ink">Итого ({count})</span>
            <span className="text-2xl font-extrabold text-ink">
              {formatPrice(total)}
            </span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="mt-5 h-12 w-full rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? "Оформляем…" : "Подтвердить заказ"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Нажимая кнопку, вы соглашаетесь с условиями демо-магазина
          </p>
        </aside>
      </div>
    </div>
  );
}
