// Helpers for working with product images.
//
// A product stores its gallery in `images` (an ordered list), while `imageUrl`
// keeps the first image as the "primary" one — used by cards, the cart and
// orders so those code paths don't need to know about the gallery.

// Parse a free-form string of image links into a clean, de-duplicated list.
// Links may be separated by commas, semicolons or newlines — this is what lets
// users paste several URLs into one Excel cell or one form field.
export function parseImageList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of String(raw).split(/[\n,;]+/)) {
    const url = part.trim();
    if (url && !seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

// Normalize a product into a non-empty gallery list. Falls back to the legacy
// single `imageUrl` when `images` is empty (older rows, cards, cart items).
export function productImages(p: {
  images?: string[] | null;
  imageUrl?: string | null;
}): string[] {
  const list = (p.images ?? []).filter(Boolean);
  if (list.length) return list;
  return p.imageUrl ? [p.imageUrl] : [];
}
