"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductStage from "./intro/ProductStage";
import type { IntroTheme } from "./intro/theme";

export default function ProductGallery({
  images,
  name,
  theme = "stars",
}: {
  images: string[];
  name: string;
  theme?: IntroTheme;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const touchStartX = useRef<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  // Keep the active thumbnail in view.
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [index]);

  if (count === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-white p-3">
        <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-50 text-muted">
          Нет фото
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white p-3">
      {/* Main image on a themed stage */}
      <ProductStage theme={theme} className="aspect-square rounded-xl">
      <div
        className="group relative flex h-full w-full items-center justify-center p-[11%]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/25">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-fly-img
            src={images[index]}
            alt={`${name} — фото ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-ink shadow-sm backdrop-blur transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-ink shadow-sm backdrop-blur transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>
      </ProductStage>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Фото ${i + 1}`}
              aria-current={i === index}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === index ? "border-brand" : "border-transparent hover:border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
