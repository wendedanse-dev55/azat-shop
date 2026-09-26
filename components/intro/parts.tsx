"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import type { IntroTheme } from "./theme";

// Splits text into per-character spans (grouped by word so lines only wrap
// between words) for GSAP stagger animations. Targets: `.ch`.
export function Chars({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, ci) => (
            <span key={ci} className="ch inline-block" style={{ transformOrigin: "50% 100%" }}>
              {ch}
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </>
  );
}

export function ThemeIcon({ theme, className = "h-4 w-4" }: { theme: IntroTheme; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  if (theme === "frost") {
    return (
      <svg {...common}>
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <line x1="3.77" y1="7.25" x2="20.23" y2="16.75" />
        <line x1="20.23" y1="7.25" x2="3.77" y2="16.75" />
        <path d="M9.5 4.5 12 6.5l2.5-2" />
        <path d="M9.5 19.5 12 17.5l2.5 2" />
      </svg>
    );
  }
  if (theme === "network") {
    return (
      <svg {...common}>
        <path d="M4.5 10.5a10.5 10.5 0 0 1 15 0" />
        <path d="M7.5 13.5a6.3 6.3 0 0 1 9 0" />
        <path d="M10.3 16.5a2.4 2.4 0 0 1 3.4 0" />
        <circle cx="12" cy="19.3" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3l2.2 5.6L20 9.5l-4.4 3.8L17 19l-5-3.1L7 19l1.4-5.7L4 9.5l5.8-.9z" />
    </svg>
  );
}

// Big blurred snowflakes drifting in FRONT of the content (depth layer).
// Visibility is driven by the parent via the `.intro-fx-frost` opacity.
export function FrostFlakes() {
  const ref = useRef<HTMLDivElement>(null);
  const flakes = useMemo(
    () =>
      Array.from({ length: 11 }, () => ({
        left: Math.random() * 100,
        size: 16 + Math.random() * 38,
        blur: Math.random() < 0.55 ? 1.5 + Math.random() * 3 : 0,
        opacity: 0.3 + Math.random() * 0.45,
      })),
    [],
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".fx-flake").forEach((el) => {
        const dur = 7 + Math.random() * 8;
        gsap.fromTo(
          el,
          { y: -120, x: 0, rotation: 0 },
          {
            y: window.innerHeight + 120,
            x: (Math.random() * 2 - 1) * 90,
            rotation: (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 180),
            duration: dur,
            delay: -Math.random() * dur,
            ease: "none",
            repeat: -1,
          },
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="intro-fx-frost pointer-events-none absolute inset-0 z-[25] overflow-hidden"
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      {flakes.map((f, i) => (
        <span
          key={i}
          className="fx-flake absolute top-0 text-sky-100"
          style={{ left: `${f.left}%`, width: f.size, height: f.size, opacity: f.opacity, filter: f.blur ? `blur(${f.blur}px)` : undefined }}
        >
          <ThemeIcon theme="frost" className="h-full w-full" />
        </span>
      ))}
    </div>
  );
}
