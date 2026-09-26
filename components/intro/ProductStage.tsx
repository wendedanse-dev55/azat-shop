"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { THEME_META, type IntroTheme } from "./theme";
import type { IntroScene } from "./scene";

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

// Dark themed "stage" behind the product photo, driven by the same WebGL scene
// as the intro (frost / network / stars). The scene is downloaded lazily once
// the page is idle, paused while off-screen, and skipped for reduced motion or
// data-saver users — the CSS gradient alone is shown in those cases.
export default function ProductStage({
  theme,
  className = "",
  children,
}: {
  theme: IntroTheme;
  className?: string;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [motionOk, setMotionOk] = useState(false);
  const meta = THEME_META[theme];

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    setMotionOk(true);

    let scene: IntroScene | null = null;
    let io: IntersectionObserver | null = null;
    let cancelled = false;

    const load = () => {
      import("./scene")
        .then(({ createIntroScene }) => {
          if (cancelled) return;
          scene = createIntroScene(canvas, { density: 0.6, frostReach: 0.85 });
          if (!scene) return;
          scene.setTheme(theme);
          setReady(true);
          io = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? scene?.resume() : scene?.pause()),
            { threshold: 0.05 },
          );
          io.observe(root);
        })
        .catch(() => {});
    };

    const w = window as IdleWindow;
    let cancelIdle: () => void;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(load, { timeout: 2000 });
      cancelIdle = () => w.cancelIdleCallback?.(id);
    } else {
      const id = window.setTimeout(load, 900);
      cancelIdle = () => window.clearTimeout(id);
    }

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      scene?.setPointer((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => scene?.setPointer(0, 0);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      cancelled = true;
      cancelIdle();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      io?.disconnect();
      scene?.dispose();
    };
  }, [theme]);

  return (
    <div ref={rootRef} className={`relative isolate overflow-hidden ${className}`} style={{ background: meta.bg }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full transition-opacity duration-[1200ms]"
        style={{ opacity: ready ? 1 : 0 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.45) 100%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${meta.halo}, transparent 65%)`, opacity: 0.6 }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
      {theme === "frost" && motionOk && <StageFlakes />}
    </div>
  );
}

// A few big soft snowflakes drifting in front of the photo (CSS-only).
function StageFlakes() {
  const ref = useRef<HTMLDivElement>(null);
  const [fall, setFall] = useState(560);
  const flakes = useMemo(
    () =>
      Array.from({ length: 7 }, () => ({
        left: Math.random() * 100,
        size: 12 + Math.random() * 22,
        blur: Math.random() < 0.5 ? 1 + Math.random() * 2 : 0,
        opacity: 0.35 + Math.random() * 0.4,
        dur: 8 + Math.random() * 8,
        delay: -Math.random() * 16,
        dx: (Math.random() * 2 - 1) * 50,
        rot: (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 200),
      })),
    [],
  );

  useEffect(() => {
    const h = ref.current?.clientHeight;
    if (h) setFall(h + 80);
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="absolute top-0 text-sky-100"
          style={
            {
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              opacity: f.opacity,
              filter: f.blur ? `blur(${f.blur}px)` : undefined,
              animation: `stageFlake ${f.dur}s linear ${f.delay}s infinite`,
              "--dx": `${f.dx}px`,
              "--fall": `${fall}px`,
              "--rot": `${f.rot}deg`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-full w-full">
            <line x1="12" y1="2.5" x2="12" y2="21.5" />
            <line x1="3.77" y1="7.25" x2="20.23" y2="16.75" />
            <line x1="20.23" y1="7.25" x2="3.77" y2="16.75" />
            <path d="M9.5 4.5 12 6.5l2.5-2" />
            <path d="M9.5 19.5 12 17.5l2.5 2" />
          </svg>
        </span>
      ))}
    </div>
  );
}
