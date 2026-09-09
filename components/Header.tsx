"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import SearchBar from "./SearchBar";

interface Cat {
  id: string;
  name: string;
  slug: string;
}

export default function Header({ categories }: { categories: Cat[] }) {
  const { count } = useCart();
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCatalogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-3 py-3">
          <Link
            href="/"
            className="flex shrink-0 items-center text-xl font-extrabold tracking-tight text-ink"
          >
            <span className="text-brand">Azat</span>Shop
          </Link>

          <button
            type="button"
            onClick={() => setCatalogOpen((v) => !v)}
            aria-expanded={catalogOpen}
            className="hidden h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {catalogOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
            Каталог
          </button>

          <SearchBar className="hidden flex-1 md:flex" />

          <Link
            href="/admin"
            className="ml-auto hidden text-sm font-medium text-muted transition-colors hover:text-brand md:ml-0 lg:inline"
          >
            Админка
          </Link>

          <Link
            href="/cart"
            className="relative ml-auto flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink transition-colors hover:bg-brand-soft md:ml-0"
          >
            <span className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2.5 3h2l2.2 12.2a1.5 1.5 0 0 0 1.5 1.3h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Корзина</span>
          </Link>
        </div>

        {/* Mobile search row */}
        <div className="pb-3 md:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Catalog dropdown */}
      {catalogOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setCatalogOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-white shadow-xl">
            <div className="mx-auto max-w-7xl px-4 py-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Все категории
              </p>
              {categories.length === 0 ? (
                <p className="text-sm text-muted">Категории появятся после добавления товаров.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setCatalogOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-brand hover:bg-brand-soft"
                    >
                      <span className="text-brand">▸</span>
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
