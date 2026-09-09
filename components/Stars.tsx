import { formatCount } from "@/lib/format";

interface Props {
  rating: number;
  reviewsCount?: number;
  showCount?: boolean;
  size?: "sm" | "md";
}

export default function Stars({
  rating,
  reviewsCount,
  showCount = true,
  size = "sm",
}: Props) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const text = size === "md" ? "text-sm" : "text-xs";

  return (
    <span className={`inline-flex items-center gap-1 ${text}`}>
      <span className="relative inline-block leading-none">
        <span className="tracking-tight text-gray-300">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden whitespace-nowrap tracking-tight text-star"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          ★★★★★
        </span>
      </span>
      {rating > 0 && <span className="font-semibold text-ink">{rating.toFixed(1)}</span>}
      {showCount && typeof reviewsCount === "number" && reviewsCount > 0 && (
        <span className="text-muted">· {formatCount(reviewsCount)}</span>
      )}
    </span>
  );
}
