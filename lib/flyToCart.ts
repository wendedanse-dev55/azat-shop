// "Fly to cart" micro-interaction using the Web Animations API (no deps).
//
// Markup contract:
//   [data-cart-target="header" | "bottom"] — the cart icon(s) to fly into
//   [data-fly-root]                        — a product card wrapper
//   img[data-fly-img]                      — the product photo to clone

function isVisible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return (
    r.width > 0 &&
    r.height > 0 &&
    r.bottom > 0 &&
    r.right > 0 &&
    r.top < window.innerHeight &&
    r.left < window.innerWidth
  );
}

// Prefer the mobile bottom-nav cart when it's on screen, else the header one.
function cartTarget(): HTMLElement | null {
  for (const key of ["bottom", "header"]) {
    const el = document.querySelector<HTMLElement>(`[data-cart-target="${key}"]`);
    if (el && isVisible(el)) return el;
  }
  return null;
}

export function bumpCart(target: HTMLElement | null = cartTarget()): void {
  if (!target || typeof target.animate !== "function") return;
  target.animate(
    [
      { transform: "scale(1) rotate(0deg)" },
      { transform: "scale(1.35) rotate(-10deg)" },
      { transform: "scale(0.9) rotate(5deg)" },
      { transform: "scale(1) rotate(0deg)" },
    ],
    { duration: 520, easing: "ease-out" },
  );
}

export function flyToCart(from: Element | null): void {
  const target = cartTarget();
  const img =
    from?.closest("[data-fly-root]")?.querySelector<HTMLImageElement>("img[data-fly-img]") ??
    document.querySelector<HTMLImageElement>("img[data-fly-img]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!img || !target || reduce || typeof img.animate !== "function") {
    bumpCart(target);
    return;
  }

  const s = img.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const size = Math.max(56, Math.min(s.width, s.height, 150));
  const x0 = s.left + s.width / 2 - size / 2;
  const y0 = s.top + s.height / 2 - size / 2;
  const dx = t.left + t.width / 2 - (x0 + size / 2);
  const dy = t.top + t.height / 2 - (y0 + size / 2);

  const clone = document.createElement("img");
  clone.src = img.currentSrc || img.src;
  clone.alt = "";
  Object.assign(clone.style, {
    position: "fixed",
    left: `${x0}px`,
    top: `${y0}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    borderRadius: "18px",
    border: "2px solid #fff",
    boxShadow: "0 14px 34px rgba(2,132,199,0.35)",
    zIndex: "9999",
    pointerEvents: "none",
    willChange: "transform, opacity",
  });
  document.body.appendChild(clone);

  // Toss along a quadratic Bézier arc that rises above the path, then drops in.
  const cx = dx * 0.5;
  const cy = Math.min(dy, 0) - 150;
  const frames: Keyframe[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    const x = 2 * (1 - k) * k * cx + k * k * dx;
    const y = 2 * (1 - k) * k * cy + k * k * dy;
    frames.push({
      transform: `translate(${x}px, ${y}px) scale(${1 - k * 0.86}) rotate(${k * 20}deg)`,
      opacity: k > 0.82 ? Math.max(0, (1 - k) * 5.5) : 1,
      offset: k,
    });
  }
  const anim = clone.animate(frames, {
    duration: 820,
    easing: "cubic-bezier(0.5, 0, 0.3, 1)",
  });
  anim.onfinish = () => {
    clone.remove();
    bumpCart(target);
  };
  anim.oncancel = () => clone.remove();
  // Safety net: finish events are held while the tab is hidden.
  window.setTimeout(() => clone.remove(), 1400);
}
