"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { IntroProduct } from "./intro/theme";

// The heavy showcase (GSAP + Three.js) is code-split and only downloaded when
// the intro is actually going to be shown.
const IntroShowcase = dynamic(() => import("./intro/IntroShowcase"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[100]" style={{ background: "#030b16" }} />,
});

const SESSION_KEY = "salqyn_intro_seen";

// Lightweight gate: shows the cinematic intro once per browser session.
export default function IntroOverlay({ products }: { products: IntroProduct[] }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    if (!seen && products.some((p) => p.imageUrl)) setShow(true);
    else document.documentElement.removeAttribute("data-intro");
  }, [products]);

  if (!show) return null;
  return (
    <IntroShowcase
      products={products}
      onClose={() => {
        setShow(false);
        document.documentElement.removeAttribute("data-intro");
      }}
    />
  );
}
