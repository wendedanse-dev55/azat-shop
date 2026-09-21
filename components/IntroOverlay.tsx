"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "./Logo";
import { formatPrice, discountPercent } from "@/lib/format";

interface IntroProduct {
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
}

const SESSION_KEY = "salqyn_intro_seen";

export default function IntroOverlay({ products }: { products: IntroProduct[] }) {
  const items = products.filter((p) => p.imageUrl).slice(0, 6);

  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false); // drives fade in/out
  const [index, setIndex] = useState(0);

  // Show once per browser session.
  useEffect(() => {
    if (items.length === 0) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    if (!seen) {
      setShow(true);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [items.length]);

  // Auto-advance featured products.
  useEffect(() => {
    if (!show || items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 2600);
    return () => clearInterval(t);
  }, [show, items.length]);

  // Close on Escape.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function close() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setVisible(false);
    setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 450);
  }

  if (!show || items.length === 0) return null;

  const p = items[index];
  const disc = discountPercent(p.price, p.oldPrice);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden text-white"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s ease",
        background:
          "radial-gradient(circle at 50% 38%, rgba(56,189,248,0.28), transparent 60%), linear-gradient(160deg,#04101f 0%,#0a2540 55%,#04101a 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Заставка Salqyn Store"
    >
      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[36%] h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(14,165,233,0.55), transparent 70%)",
          filter: "blur(40px)",
          animation: "introGlow 5s ease-in-out infinite",
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="flex items-center gap-2.5">
          <LogoMark size={34} />
          <span className="text-lg font-extrabold tracking-tight">
            Salqyn<span className="ml-1 text-sky-300">Store</span>
          </span>
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть заставку"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Center showcase */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
        {/* Big faint name behind */}
        <div
          key={`bg-${index}`}
          className="pointer-events-none absolute inset-x-0 top-[8%] select-none px-4 text-center text-[13vw] font-extrabold uppercase leading-none tracking-tight text-white/[0.05]"
          style={{ animation: "introUp 0.7s ease" }}
        >
          {p.name.split(" ")[0]}
        </div>

        <Link
          key={`img-${index}`}
          href={`/product/${p.slug}`}
          onClick={close}
          className="relative block"
          style={{ animation: "introPop 0.6s ease" }}
        >
          <div style={{ animation: "introFloat 4s ease-in-out infinite" }}>
            {disc && (
              <span className="absolute -right-2 -top-2 z-10 rounded-full bg-sale px-2.5 py-1 text-sm font-bold text-white shadow-lg">
                −{disc}%
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.imageUrl!}
              alt={p.name}
              className="h-48 w-48 rounded-3xl object-cover shadow-2xl ring-1 ring-white/20 sm:h-60 sm:w-60"
            />
          </div>
        </Link>

        <div key={`txt-${index}`} style={{ animation: "introUp 0.6s ease 0.05s both" }}>
          <h2 className="mt-6 max-w-xl text-2xl font-extrabold sm:text-3xl">
            {p.name}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-xl font-bold text-sky-300">
              {formatPrice(p.price)}
            </span>
            {p.oldPrice && (
              <span className="text-sm text-white/50 line-through">
                {formatPrice(p.oldPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {items.length > 1 && (
          <div className="mt-8 flex items-center gap-2.5">
            {items.map((it, i) => (
              <button
                key={it.slug}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={it.name}
                className={`h-12 w-12 overflow-hidden rounded-xl ring-2 transition-all ${
                  i === index
                    ? "scale-110 ring-sky-400"
                    : "opacity-60 ring-transparent hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.imageUrl!} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enter button */}
      <div className="relative z-10 flex justify-center px-5 pb-8 pt-2 sm:pb-12">
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
        >
          Войти в магазин →
        </button>
      </div>
    </div>
  );
}
