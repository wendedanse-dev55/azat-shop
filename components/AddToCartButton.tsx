"use client";

import { useCart } from "./CartProvider";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    slug: string;
  };
  className?: string;
}

export default function AddToCartButton({ product, className = "" }: Props) {
  const { items, add, setQty } = useCart();
  const inCart = items.find((i) => i.id === product.id);

  if (!inCart) {
    return (
      <button
        type="button"
        onClick={() => add(product)}
        className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover ${className}`}
      >
        В корзину
      </button>
    );
  }

  return (
    <div
      className={`flex h-10 w-full items-center justify-between rounded-xl bg-brand px-1 text-white ${className}`}
    >
      <button
        type="button"
        onClick={() => setQty(product.id, inCart.qty - 1)}
        className="flex h-8 w-10 items-center justify-center rounded-lg text-xl leading-none transition-colors hover:bg-white/20"
        aria-label="Уменьшить количество"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-bold tabular-nums">
        {inCart.qty}
      </span>
      <button
        type="button"
        onClick={() => setQty(product.id, inCart.qty + 1)}
        className="flex h-8 w-10 items-center justify-center rounded-lg text-xl leading-none transition-colors hover:bg-white/20"
        aria-label="Увеличить количество"
      >
        +
      </button>
    </div>
  );
}
