"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { LogoMark } from "../Logo";
import { formatPrice, discountPercent } from "@/lib/format";
import { pickShowcase, themeFor, THEME_META, type IntroProduct, type IntroTheme } from "./theme";
import { Chars, FrostFlakes, ThemeIcon } from "./parts";
import type { IntroScene } from "./scene";

const SESSION_KEY = "salqyn_intro_seen";
const SLIDE = 5.5; // seconds per product

export default function IntroShowcase({
  products,
  onClose,
}: {
  products: IntroProduct[];
  onClose: () => void;
}) {
  const items = useMemo(() => pickShowcase(products, 6), [products]);
  const themes = useMemo(() => items.map(themeFor), [items]);
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<"brand" | "show">("brand");

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<IntroScene | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const enterTl = useRef<gsap.core.Timeline | null>(null);
  const progress = useRef<gsap.core.Tween | null>(null);
  const busy = useRef(false);
  const closing = useRef(false);
  const reduced = useRef(false);
  const indexRef = useRef(0);
  const stageRef = useRef<"brand" | "show">("brand");
  const onCloseRef = useRef(onClose);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    document.documentElement.removeAttribute("data-intro");
    progress.current?.kill();
    enterTl.current?.kill();
    const ctx = ctxRef.current;
    if (!ctx) return onCloseRef.current();
    ctx.add(() => {
      gsap
        .timeline({ onComplete: () => onCloseRef.current() })
        .to(".intro-content", { scale: 1.06, opacity: 0, filter: "blur(8px)", duration: 0.45, ease: "power2.in" }, 0)
        .to(rootRef.current, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 0.1);
    });
  }, []);

  // Animate the current product out, then switch to product `i`.
  const leave = useCallback(
    (i: number) => {
      if (busy.current || closing.current || stageRef.current !== "show") return;
      if (i === indexRef.current) return;
      busy.current = true;
      progress.current?.kill();
      enterTl.current?.kill();
      const done = () => {
        busy.current = false;
        setIndex(i);
      };
      const ctx = ctxRef.current;
      if (!ctx) return done();
      ctx.add(() => {
        const tl = gsap.timeline({ onComplete: done });
        if (reduced.current) {
          tl.to([".intro-card", ".intro-copy"], { opacity: 0, duration: 0.2 });
          return;
        }
        tl.to(".intro-card", { opacity: 0, scale: 0.78, rotationY: -35, z: -220, filter: "blur(10px)", duration: 0.5, ease: "power2.in", overwrite: "auto" }, 0)
          .to(".intro-name .ch", { opacity: 0, y: -26, duration: 0.32, stagger: 0.008, ease: "power2.in", overwrite: "auto" }, 0)
          .to(".intro-word .ch", { opacity: 0, y: -50, filter: "blur(10px)", duration: 0.42, stagger: 0.03, ease: "power2.in", overwrite: "auto" }, 0)
          .to([".intro-chip", ".intro-price-row", ".intro-cta"], { opacity: 0, y: -12, duration: 0.3, ease: "power2.in", overwrite: "auto" }, 0);
      });
    },
    [],
  );

  // Mount: scroll lock, lazy WebGL scene, brand intro timeline, keyboard.
  useEffect(() => {
    const root = rootRef.current!;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";
    const ctx = gsap.context(() => {}, root);
    ctxRef.current = ctx;

    let cancelled = false;
    if (!reduced.current) {
      import("./scene")
        .then(({ createIntroScene }) => {
          if (cancelled || !canvasRef.current) return;
          const scene = createIntroScene(canvasRef.current);
          if (!scene) return;
          sceneRef.current = scene;
          if (stageRef.current === "show") scene.setTheme(themes[indexRef.current]);
          else scene.setTheme("stars", true);
          gsap.to(canvasRef.current, { opacity: 1, duration: 1.4, ease: "power2.out" });
        })
        .catch(() => {});
    }

    ctx.add(() => {
      if (reduced.current) {
        setStage("show");
        return;
      }
      gsap.set(".intro-top", { opacity: 0 });
      gsap
        .timeline({ onComplete: () => setStage("show") })
        .fromTo(".brand-flash", { scale: 0, opacity: 0 }, { scale: 3.2, opacity: 0.85, duration: 0.55, ease: "power2.out" }, 0.25)
        .to(".brand-flash", { opacity: 0, duration: 0.8, ease: "power2.out" }, 0.8)
        .fromTo(".brand-logo", { scale: 0, rotation: -140, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.1, ease: "elastic.out(1, 0.55)" }, 0.2)
        .fromTo(".brand-name .ch", { opacity: 0, y: 44, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, stagger: 0.045, ease: "power3.out" }, 0.65)
        .fromTo(".brand-tag", { opacity: 0, letterSpacing: "1.1em" }, { opacity: 0.75, letterSpacing: "0.35em", duration: 1.1, ease: "power3.out" }, 0.95)
        .to(".brand-wrap", { scale: 1.9, opacity: 0, filter: "blur(16px)", duration: 0.75, ease: "power2.in" }, 2.45)
        .to(".intro-top", { opacity: 1, duration: 0.6 }, 2.7);
    });

    const onKey = (e: KeyboardEvent) => {
      const n = items.length;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") leave((indexRef.current + 1) % n);
      else if (e.key === "ArrowLeft") leave((indexRef.current - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      sceneRef.current?.dispose();
      sceneRef.current = null;
      ctx.revert();
      ctxRef.current = null;
      document.body.style.overflow = "";
      document.documentElement.removeAttribute("data-intro");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Showcase stage: continuous float, cursor tilt, scene parallax.
  useEffect(() => {
    stageRef.current = stage;
    if (stage !== "show" || reduced.current || !ctxRef.current) return;
    let xTo: ((v: number) => unknown) | null = null;
    let yTo: ((v: number) => unknown) | null = null;
    ctxRef.current.add(() => {
      gsap.to(floatRef.current, { y: -16, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".intro-word", { scale: 1.06, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      xTo = gsap.quickTo(tiltRef.current, "rotationY", { duration: 0.8, ease: "power3.out" });
      yTo = gsap.quickTo(tiltRef.current, "rotationX", { duration: 0.8, ease: "power3.out" });
    });
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      xTo?.(nx * 24);
      yTo?.(-ny * 18);
      sceneRef.current?.setPointer(nx, ny);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [stage]);

  // Enter animation for the current product + progress timer.
  useLayoutEffect(() => {
    stageRef.current = stage;
    indexRef.current = index;
    const ctx = ctxRef.current;
    if (stage !== "show" || !ctx || items.length === 0) return;
    const theme = themes[index];
    const meta = THEME_META[theme];
    const p = items[index];
    sceneRef.current?.setTheme(theme);
    sceneRef.current?.pulse();
    if (priceRef.current) priceRef.current.textContent = formatPrice(reduced.current ? p.price : 0);

    ctx.add(() => {
      gsap.to(rootRef.current, { "--accent": meta.accent, "--halo": meta.halo, duration: 1.2, ease: "power2.inOut" });
      gsap.to(".intro-bg", {
        opacity: (_i: number, el: HTMLElement) => (el.dataset.theme === theme ? 1 : 0),
        duration: 1.4,
        ease: "power2.inOut",
      });
      gsap.to(".intro-fx-frost", { opacity: theme === "frost" ? 1 : 0, duration: 1.2, ease: "power2.inOut" });

      const tl = gsap.timeline();
      enterTl.current = tl;
      if (reduced.current) {
        tl.fromTo([".intro-card", ".intro-copy"], { opacity: 0 }, { opacity: 1, duration: 0.3 });
      } else {
        const pv = { v: 0 };
        tl.fromTo(".intro-card", { opacity: 0, scale: 0.5, rotationY: 45, z: -320, filter: "blur(16px)" }, { opacity: 1, scale: 1, rotationY: 0, z: 0, filter: "blur(0px)", duration: 1.15, ease: "expo.out" }, 0)
          .fromTo(".intro-halo", { scale: 0.3, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 1.3, ease: "power2.out" }, 0.05)
          .fromTo(".intro-word .ch", { opacity: 0, y: 70, filter: "blur(14px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.0, stagger: 0.06, ease: "power3.out" }, 0.1)
          .fromTo(".intro-chip", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.35)
          .fromTo(".intro-name .ch", { opacity: 0, y: 40, rotationX: -90 }, { opacity: 1, y: 0, rotationX: 0, duration: 0.75, stagger: 0.016, ease: "back.out(1.8)" }, 0.4)
          .fromTo(".intro-price-row", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.6)
          .to(pv, {
            v: p.price,
            duration: 1.2,
            ease: "power3.out",
            onUpdate: () => {
              if (priceRef.current) priceRef.current.textContent = formatPrice(Math.round(pv.v));
            },
          }, 0.6)
          .fromTo(".intro-cta", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0.72);
      }

      const fills = gsap.utils.toArray<HTMLElement>(".seg-fill");
      fills.forEach((f, i) => gsap.set(f, { scaleX: i < index ? 1 : 0 }));
      if (items.length > 1 && fills[index]) {
        progress.current = gsap.fromTo(
          fills[index],
          { scaleX: 0 },
          { scaleX: 1, duration: SLIDE, ease: "none", onComplete: () => leave((index + 1) % items.length) },
        );
      }
    });
  }, [stage, index, items, themes, leave]);

  if (items.length === 0) return null;

  const p = items[index];
  const theme = themes[index];
  const meta = THEME_META[theme];
  const disc = discountPercent(p.price, p.oldPrice);
  const word = meta.word || p.name.split(" ")[0].toUpperCase();
  const first = THEME_META[themes[0]];

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] select-none overflow-hidden text-white"
      style={{ background: "#030b16", "--accent": first.accent, "--halo": first.halo } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Заставка Salqyn Store"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) {
          const n = items.length;
          leave(dx < 0 ? (indexRef.current + 1) % n : (indexRef.current - 1 + n) % n);
        }
      }}
    >
      {/* Theme backgrounds */}
      {(["stars", "frost", "network"] as IntroTheme[]).map((t) => (
        <div
          key={t}
          data-theme={t}
          className="intro-bg absolute inset-0"
          style={{ background: THEME_META[t].bg, opacity: t === "stars" ? 1 : 0 }}
        />
      ))}

      {/* WebGL scene */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity: 0 }} />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.6) 100%)" }}
      />

      {/* Top bar: story progress + logo */}
      <div className="intro-top absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/60 via-black/25 to-transparent px-4 pb-10 pt-2 sm:px-8">
        {items.length > 1 && (
          <div className="mx-auto flex max-w-md gap-1.5">
            {items.map((it, i) => (
              <button
                key={it.slug}
                type="button"
                onClick={() => leave(i)}
                aria-label={`Товар ${i + 1}`}
                className="flex-1 py-2"
              >
                <span className="block h-1 overflow-hidden rounded-full bg-white/25">
                  <span
                    className="seg-fill block h-full w-full origin-left rounded-full"
                    style={{ background: "var(--accent)", transform: "scaleX(0)" }}
                  />
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-1 flex items-center gap-2 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
          <LogoMark size={28} />
          <span className="text-sm font-extrabold tracking-tight">
            Salqyn<span className="ml-1 text-sky-300">Store</span>
          </span>
        </div>
      </div>

      {/* Close — always available */}
      <button
        type="button"
        onClick={close}
        aria-label="Закрыть заставку"
        className="absolute right-4 top-9 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-black/60 sm:right-8"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="intro-content relative z-20 flex h-full flex-col">
        {stage === "brand" ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="brand-wrap relative flex flex-col items-center text-center">
              <span
                className="brand-flash pointer-events-none absolute left-1/2 top-1/2 -ml-32 -mt-32 h-64 w-64 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(186,230,253,0.95), rgba(56,189,248,0.4) 35%, transparent 70%)", opacity: 0 }}
              />
              <div className="brand-logo" style={{ opacity: 0 }}>
                <LogoMark size={104} />
              </div>
              <div className="brand-name mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
                <Chars text="Salqyn" />{" "}
                <span className="text-sky-300">
                  <Chars text="Store" />
                </span>
              </div>
              <div className="brand-tag mt-4 text-xs uppercase text-white/70 sm:text-sm" style={{ opacity: 0 }}>
                прохлада, которая впечатляет
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-5 pb-6 pt-20 text-center">
            <div
              key={`w-${index}`}
              className="intro-word pointer-events-none absolute inset-x-0 top-[13%] select-none text-center font-extrabold uppercase leading-none tracking-tight text-white/[0.06]"
              style={{ fontSize: "min(17vw, 230px)" }}
              aria-hidden="true"
            >
              <Chars text={word} />
            </div>

            <div className="relative" style={{ perspective: "1100px" }}>
              <span
                className="pointer-events-none absolute left-1/2 top-1/2 -ml-52 -mt-52 h-[26rem] w-[26rem] rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, var(--halo), transparent 65%)", opacity: 0.55 }}
              />
              <span
                className="intro-halo pointer-events-none absolute left-1/2 top-1/2 -ml-40 -mt-40 h-80 w-80 rounded-full"
                style={{ background: "radial-gradient(circle, var(--halo), transparent 70%)", opacity: 0 }}
              />
              <div
                ref={cardRef}
                className="intro-card relative"
                style={{ transformStyle: "preserve-3d" }}
                onPointerEnter={() => progress.current?.pause()}
                onPointerLeave={() => progress.current?.resume()}
              >
                <div ref={tiltRef} style={{ transformStyle: "preserve-3d" }}>
                  <div ref={floatRef}>
                    <Link href={`/product/${p.slug}`} onClick={close} className="relative block" draggable={false}>
                      {disc && (
                        <span className="absolute -right-3 -top-3 z-10 rounded-full bg-sale px-3 py-1 text-sm font-bold text-white shadow-lg">
                          −{disc}%
                        </span>
                      )}
                      <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.75)] ring-1 ring-white/25">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl!} alt={p.name} className="h-52 w-52 object-cover sm:h-72 sm:w-72" draggable={false} />
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/25" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="intro-copy relative mt-8 flex flex-col items-center">
              <span
                className="intro-chip inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/20 backdrop-blur"
                style={{ color: "var(--accent)" }}
              >
                <ThemeIcon theme={theme} />
                {p.category?.name ?? "Хит продаж"}
              </span>
              <h2
                key={`n-${index}`}
                className="intro-name mt-3 max-w-2xl text-2xl font-extrabold leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)] sm:text-4xl"
                style={{ perspective: "600px" }}
              >
                <Chars text={p.name} />
              </h2>
              <div className="intro-price-row mt-3 flex items-center gap-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
                <span ref={priceRef} className="text-2xl font-extrabold sm:text-3xl" style={{ color: "var(--accent)" }} />
                {p.oldPrice && (
                  <span className="text-sm text-white/50 line-through sm:text-base">{formatPrice(p.oldPrice)}</span>
                )}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/product/${p.slug}`}
                  onClick={close}
                  className="intro-cta inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-ink shadow-xl transition-transform hover:scale-[1.03]"
                  style={{ background: "var(--accent)" }}
                >
                  Смотреть товар
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="intro-cta inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20"
                >
                  Войти в магазин →
                </button>
              </div>
            </div>

            {items.length > 1 && (
              <div className="mt-8 flex items-center gap-2.5">
                {items.map((it, i) => (
                  <button
                    key={it.slug}
                    type="button"
                    onClick={() => leave(i)}
                    aria-label={it.name}
                    className={`h-11 w-11 overflow-hidden rounded-xl transition-all duration-300 ${
                      i === index ? "scale-110" : "opacity-50 hover:opacity-100"
                    }`}
                    style={i === index ? { boxShadow: "0 0 0 2px var(--accent), 0 0 22px var(--halo)" } : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.imageUrl!} alt="" className="h-full w-full object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <FrostFlakes />
    </div>
  );
}
