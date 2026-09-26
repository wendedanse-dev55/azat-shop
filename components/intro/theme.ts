// Product → visual theme mapping for the intro showcase.

export type IntroTheme = "frost" | "network" | "stars";

export interface IntroProduct {
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  category?: { name: string } | null;
}

const FROST =
  /(кондиц|сплит|климат|холодильн|морозил|вентилят|air.?condit|fridge|freez|cool)/;
const NETWORK =
  /(роутер|маршрутизат|модем|wi.?fi|router|mesh|сетев|интернет|network|точк[аи] доступа)/;

export function themeFor(p: IntroProduct): IntroTheme {
  const s = `${p.category?.name ?? ""} ${p.name}`.toLowerCase();
  if (FROST.test(s)) return "frost";
  if (NETWORK.test(s)) return "network";
  return "stars";
}

// Pick up to `max` products with photos, interleaving themes so consecutive
// slides switch scenes (frost → network → frost …) for maximum effect.
export function pickShowcase(products: IntroProduct[], max = 6): IntroProduct[] {
  const buckets = new Map<IntroTheme, IntroProduct[]>();
  for (const p of products) {
    if (!p.imageUrl) continue;
    const t = themeFor(p);
    if (!buckets.has(t)) buckets.set(t, []);
    buckets.get(t)!.push(p);
  }
  const order = (["frost", "network", "stars"] as IntroTheme[]).filter((t) =>
    buckets.has(t),
  );
  const out: IntroProduct[] = [];
  for (let r = 0; out.length < max; r++) {
    let added = false;
    for (const t of order) {
      const b = buckets.get(t)!;
      if (r < b.length && out.length < max) {
        out.push(b[r]);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

export const THEME_META: Record<
  IntroTheme,
  { word: string; accent: string; halo: string; bg: string }
> = {
  frost: {
    word: "ХОЛОД",
    accent: "#7dd3fc",
    halo: "rgba(125,211,252,0.55)",
    bg: "radial-gradient(ellipse at 50% 38%, #1d4f73 0%, #0b2539 46%, #030b15 100%)",
  },
  network: {
    word: "СКОРОСТЬ",
    accent: "#a5b4fc",
    halo: "rgba(99,102,241,0.6)",
    bg: "radial-gradient(ellipse at 50% 40%, #27235f 0%, #0c1238 46%, #03040f 100%)",
  },
  stars: {
    word: "",
    accent: "#7dd3fc",
    halo: "rgba(56,189,248,0.5)",
    bg: "radial-gradient(ellipse at 50% 40%, #0f2a47 0%, #06121f 50%, #02060c 100%)",
  },
};
