"use client";

import { useRef, useState } from "react";

// Mini image slider for a product card (Ozon/WB style): hovering over a
// horizontal zone previews that photo, dots show the position, swipe works on
// touch. The whole card stays a link — these controls only change the preview.
export default function ProductCardMedia({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted">
        Нет фото
      </div>
    );
  }

  const clamp = (n: number) => ((n % count) + count) % count;

  return (
    <div
      className="relative h-full w-full"
      onMouseLeave={() => setIndex(0)}
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (startX.current == null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 30) setIndex((i) => clamp(i + (dx < 0 ? 1 : -1)));
        startX.current = null;
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-fly-img
        src={images[index]}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {count > 1 && (
        <>
          {/* Hover zones — one per image (desktop) */}
          <div className="absolute inset-0 flex" aria-hidden="true">
            {images.map((_, i) => (
              <div
                key={i}
                className="h-full flex-1"
                onMouseEnter={() => setIndex(i)}
              />
            ))}
          </div>

          {/* Dots */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full shadow-sm transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
