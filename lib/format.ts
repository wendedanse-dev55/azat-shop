// Currency label used across the storefront and admin.
// Change this single constant to switch currency (e.g. "₸", "₽", "$", "€").
export const CURRENCY = "сом";

const priceFmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const countFmt = new Intl.NumberFormat("ru-RU");

export function formatPrice(value: number): string {
  return `${priceFmt.format(Math.round(value ?? 0))} ${CURRENCY}`;
}

export function formatCount(value: number): string {
  return countFmt.format(value ?? 0);
}

// Discount percent, or null when there is no valid discount.
export function discountPercent(
  price: number,
  oldPrice?: number | null,
): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round((1 - price / oldPrice) * 100);
}

// "N товаров" with correct Russian plural form.
export function pluralProducts(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = "товаров";
  if (mod10 === 1 && mod100 !== 11) word = "товар";
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    word = "товара";
  return `${countFmt.format(n)} ${word}`;
}
