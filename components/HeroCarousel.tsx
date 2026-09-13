"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface HeroSlide {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Tailwind classes for the slide background (a gradient). */
  theme: string;
  /** Optional product/lifestyle image shown on the right. */
  image?: string | null;
}

const AUTO_MS = 6000;

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  // Auto-advance, paused on hover/focus or when the tab is hidden.
  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_MS);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <section
      className="relative select-none"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        touchStartX.current = null;
      }}
    >
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="w-full shrink-0"
              aria-hidden={i !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} из ${count}`}
            >
              <div
                className={`relative flex min-h-[300px] items-center overflow-hidden px-6 py-12 text-white sm:min-h-[360px] sm:px-12 ${s.theme}`}
              >
                {/* Decorative glow */}
                <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-black/10 blur-2xl" />

                <div className="relative z-10 flex w-full items-center gap-6">
                  <div className="max-w-2xl flex-1">
                    {s.eyebrow && (
                      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                        {s.eyebrow}
                      </span>
                    )}
                    <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
                      {s.title}
                    </h2>
                    {s.subtitle && (
                      <p className="mt-3 max-w-lg text-white/85">{s.subtitle}</p>
                    )}
                    {s.ctaLabel && (
                      <Link
                        href={s.ctaHref || "/catalog"}
                        tabIndex={i === index ? 0 : -1}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
                      >
                        {s.ctaLabel} →
                      </Link>
                    )}
                  </div>

                  {s.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.image}
                      alt=""
                      className="hidden h-52 w-52 shrink-0 rotate-3 rounded-2xl object-cover shadow-2xl ring-4 ring-white/30 md:block lg:h-60 lg:w-60"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          {/* Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Предыдущий слайд"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/25 p-2 text-white backdrop-blur transition-colors hover:bg-white/40 sm:flex"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Следующий слайд"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/25 p-2 text-white backdrop-blur transition-colors hover:bg-white/40 sm:flex"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Слайд ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
