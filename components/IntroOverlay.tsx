"use client";

import { useEffect, useRef, useState } from "react";
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
const SLIDE_MS = 3600;
const INTRO_MS = 1500;

export default function IntroOverlay({ products }: { products: IntroProduct[] }) {
  const items = products.filter((p) => p.imageUrl).slice(0, 6);

  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"intro" | "show">("intro");
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Show once per session.
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
      const t = setTimeout(() => setPhase("show"), INTRO_MS);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [items.length]);

  // Auto-advance featured products (only during the showcase phase).
  useEffect(() => {
    if (!show || phase !== "show" || items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [show, phase, items.length]);

  // Escape to close.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Starfield particles.
  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    type P = { x: number; y: number; r: number; s: number; tw: number };
    let parts: P[] = [];
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.max(40, Math.floor((w * h) / 14000)));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        s: Math.random() * 0.35 + 0.08,
        tw: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.s;
        p.tw += 0.03;
        if (p.y < -2) {
          p.y = h + 2;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(186,230,253,${0.3 + Math.sin(p.tw) * 0.28})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [show]);

  function onMove(e: React.MouseEvent) {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--mx", String(e.clientX / window.innerWidth - 0.5));
    el.style.setProperty("--my", String(e.clientY / window.innerHeight - 0.5));
  }

  function close() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setVisible(false);
    setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 500);
  }

  if (!show || items.length === 0) return null;

  const p = items[index];
  const disc = discountPercent(p.price, p.oldPrice);

  return (
    <div
      ref={rootRef}
      onMouseMove={onMove}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden text-white"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        background:
          "radial-gradient(circle at 50% 40%, rgba(30,90,150,0.35), transparent 60%), linear-gradient(160deg,#030b16 0%,#0a2540 55%,#03080f 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Заставка Salqyn Store"
    >
      {/* Starfield */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Rotating aurora */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[80vmin] w-[80vmin]"
        aria-hidden="true"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(14,165,233,0.0), rgba(56,189,248,0.35), rgba(2,132,199,0.0), rgba(99,102,241,0.28), rgba(14,165,233,0.0))",
          filter: "blur(60px)",
          transform: "translate(-50%, -50%)",
          animation: "introSpin 22s linear infinite",
          opacity: 0.75,
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{ background: "radial-gradient(circle at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
      />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="flex items-center gap-2.5" style={{ opacity: phase === "show" ? 1 : 0, transition: "opacity .6s ease" }}>
          <LogoMark size={30} />
          <span className="text-base font-extrabold tracking-tight">
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

      {/* Stage */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
        {phase === "intro" ? (
          <div className="relative flex flex-col items-center" style={{ animation: "introBrandIn 0.8s ease" }}>
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 rounded-full"
              aria-hidden="true"
              style={{
                background: "radial-gradient(circle, rgba(125,211,252,0.6), transparent 65%)",
                animation: "introFlare 1.5s ease",
              }}
            />
            <div style={{ animation: "introFloat 4s ease-in-out infinite" }}>
              <LogoMark size={96} />
            </div>
            <div className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Salqyn<span className="ml-1.5 text-sky-300">Store</span>
            </div>
            <div className="mt-3 text-sm uppercase tracking-[0.35em] text-white/60">
              прохлада, которая впечатляет
            </div>
          </div>
        ) : (
          <div
            className="relative flex w-full flex-col items-center"
            style={{ transform: "translate(calc(var(--mx,0) * 18px), calc(var(--my,0) * 16px))" }}
          >
            {/* Big faint name */}
            <div
              key={`bg-${index}`}
              className="pointer-events-none absolute inset-x-0 top-[-2%] select-none px-4 text-center text-[14vw] font-extrabold uppercase leading-none tracking-tight text-white/[0.055]"
              style={{ animation: "introNameIn 0.8s ease" }}
            >
              {p.name.split(" ")[0]}
            </div>

            {/* Burst ring */}
            <span
              key={`ring-${index}`}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[112px] h-56 w-56 rounded-full sm:top-[130px] sm:h-72 sm:w-72"
              style={{
                border: "2px solid rgba(125,211,252,0.6)",
                boxShadow: "0 0 60px rgba(56,189,248,0.5)",
                animation: "introRing 0.9s ease-out",
              }}
            />

            {/* Product card */}
            <div key={`card-${index}`} style={{ animation: "introPopIn 0.7s cubic-bezier(.2,.8,.2,1) both" }}>
              <Link
                href={`/product/${p.slug}`}
                onClick={close}
                className="relative block"
                style={{ animation: "introFloat 4.5s ease-in-out infinite" }}
              >
                {disc && (
                  <span className="absolute -right-2 -top-2 z-10 rounded-full bg-sale px-2.5 py-1 text-sm font-bold text-white shadow-lg">
                    −{disc}%
                  </span>
                )}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/25">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl!} alt={p.name} className="h-48 w-48 object-cover sm:h-64 sm:w-64" />
                  <span
                    key={`shine-${index}`}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                      animation: "introShine 1s ease 0.2s",
                    }}
                  />
                </div>
              </Link>
            </div>

            {/* Name + price */}
            <div key={`txt-${index}`} style={{ animation: "introNameIn 0.7s ease 0.05s both" }}>
              <h2 className="mt-7 max-w-xl text-2xl font-extrabold sm:text-3xl">{p.name}</h2>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="text-xl font-bold text-sky-300 sm:text-2xl">{formatPrice(p.price)}</span>
                {p.oldPrice && <span className="text-sm text-white/45 line-through">{formatPrice(p.oldPrice)}</span>}
              </div>
            </div>

            {/* Progress bar */}
            {items.length > 1 && (
              <div className="mt-6 h-0.5 w-40 overflow-hidden rounded-full bg-white/15">
                <div
                  key={`pr-${index}`}
                  className="h-full origin-left rounded-full bg-sky-300"
                  style={{ animation: `introProgress ${SLIDE_MS}ms linear` }}
                />
              </div>
            )}

            {/* Thumbnails */}
            {items.length > 1 && (
              <div className="mt-5 flex items-center gap-2.5">
                {items.map((it, i) => (
                  <button
                    key={it.slug}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={it.name}
                    className={`h-11 w-11 overflow-hidden rounded-xl ring-2 transition-all ${
                      i === index ? "scale-110 ring-sky-400" : "opacity-55 ring-transparent hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.imageUrl!} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enter button */}
      <div
        className="relative z-20 flex justify-center px-5 pb-8 pt-2 sm:pb-12"
        style={{ opacity: phase === "show" ? 1 : 0, transition: "opacity .6s ease" }}
      >
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-ink shadow-xl transition-transform hover:scale-[1.03]"
        >
          Войти в магазин →
        </button>
      </div>
    </div>
  );
}
