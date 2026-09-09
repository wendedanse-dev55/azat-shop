"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import AddToCartButton from "./AddToCartButton";
import PriceBlock from "./PriceBlock";
import { CURRENCY } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  stock: number;
}

export default function ProductBuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const inStock = product.stock > 0;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
      <PriceBlock price={product.price} oldPrice={product.oldPrice} size="lg" />

      <div className="mt-4">
        {inStock ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
            ● В наличии: {product.stock} шт.
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sale-soft px-3 py-1 text-sm font-medium text-sale">
            ● Нет в наличии
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 text-sm text-body">
        <svg className="mt-0.5 shrink-0 text-brand" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4h13v11H1zM14 8h4l3 3v4h-7" />
          <circle cx="6" cy="18" r="1.6" />
          <circle cx="18" cy="18" r="1.6" />
        </svg>
        <span>
          Доставка <span className="font-semibold text-ink">завтра</span> —
          бесплатно от 10 000 {CURRENCY}
        </span>
      </div>

      {inStock ? (
        <div className="mt-5 space-y-2">
          <AddToCartButton product={product} />
          <button
            type="button"
            onClick={() => {
              add(product);
              router.push("/cart");
            }}
            className="h-10 w-full rounded-xl border border-brand text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
          >
            Купить сейчас
          </button>
        </div>
      ) : (
        <div className="mt-5 flex h-10 w-full items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-muted">
          Нет в наличии
        </div>
      )}

      <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-muted">
        <li>✓ Возврат в течение 14 дней</li>
        <li>✓ Гарантия качества</li>
        <li>✓ Безопасная оплата</li>
      </ul>
    </div>
  );
}
